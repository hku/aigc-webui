import { AnyNode } from 'postcss';
import addonsManifest from '../addons-manifest.json';
import { Message } from '@/types/chat';
import { AddonModel } from '@/types/addon';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { markAsUntransferable } from 'worker_threads';

interface Addons {
  [key: string]: any
}

class ModelAgent {
    private _object: Addons;
    private _keys: (keyof Addons)[]
    private _activeKey: keyof Addons;

    constructor(object: Addons) {
        this._object = object;
        const _keys = this._keys = Object.keys(object)
        this._activeKey =_keys[0]
    }
    
    _reset(object: Addons) {
        this._object = object;
        const _keys = this._keys = Object.keys(object)
        this._activeKey =_keys[0]
    }

    set active(key: keyof Addons) {
        if (this._keys.indexOf(key) > -1) {
            this._activeKey = key;
            const obj = this._object[this._activeKey]
            console.log(`the active model is ${obj.metadata.name}`)
        } else {
            console.error(`the model ${key as string} is not available`)
        }
    }
    
    get active() {
        return  this._activeKey
    }

    get metadata() {
        const metadata = this._keys.map(k => Object.assign({}, this._object[k].metadata, {key: k}))
        return metadata
    }
    
    async loadAddons(addonsManifest: string[], cb=()=>{}){
        const addons: Addons = {}
        for (const name of addonsManifest as string[]) {
            const scriptModule = await import(`../addons/${name}/model.ts`);
            addons[name] = scriptModule;
          }
          this._reset(addons)
          cb()
    }

    async generate(messages: Message[], prompt: string, model: AddonModel, tokenValues: (string|null)[]) {
        const {id, env, supportAnalysisMode} = model
        
        const analysisMode = messages.some(m => m.metadata?.marked)
        const isBrowser = (typeof window === 'object')
        
        let tokens = tokenValues
        // tokens = tokens.map((t, idx)=> {
        //     if(t !== null && t !== '' && t !== 'YOUR_KEY') {return t}
        //     if(env instanceof Array && (!isBrowser)) {
        //         const tokenName = env[idx]
        //         const tokenValue = process.env?.[tokenName] || null
        //         return tokenValue
        //     }
        //     return null
        // })

        if(env instanceof Array) {
            
            for(let i=0; i<env.length; i++) {
                const t = tokens[i]
                if(t === null || t === '' || t === 'YOUR_KEY') {
                    // if(isBrowser) {
                    return `<span style="color:red">The required KEY is not set, please input the ${env[i]} value in <a href="/setting/${id}" target="_blank">the setting page</a></span>`
                    // } else {
                    //     return `<span style="color:red">To use this model, you need to fill in the ${env[i]} into the '.env.local' file. For details, please refer to the <a target="_blank" href="https://github.com/hku/aigc-webui/blob/main/README.md">README.md</a> file</span>`
                    // }
                }
            }
        }


        if(analysisMode) {

            if(!supportAnalysisMode) {
                return `<span style="color:red">${model.name} do not support analysis mode, please choose another model at the model selector, for example, chatGPT(turbo).</span>`
            }


            const CHUNK_SIZE = 100
            const SIMILAR_TOP = 10

            const splitter = new TokenTextSplitter({
                encodingName: "gpt2",
                chunkSize: CHUNK_SIZE,
                chunkOverlap: 0,
            });
            const openAIApiKey = isBrowser?(localStorage && localStorage.getItem("OPENAI_API_KEY")):(process && process?.env?.["OPENAI_API_KEY"])
            const embedding = new OpenAIEmbeddings({
                openAIApiKey: openAIApiKey || ""
            })

            const lastMessage = messages.slice(-1)[0]
            const lastContent = lastMessage.content.trim()
            const markedMessages = messages.filter(m => (m.metadata?.marked)).map(m => ({...m}))
            const markdedDocs = []

            for(const m of markedMessages) {
                const docs = await splitter.createDocuments([m.content]);
                const vectorStore = await MemoryVectorStore.fromDocuments(docs, embedding);
                const relevantDocs = await vectorStore.similaritySearch(lastContent, SIMILAR_TOP);
                const relevantContent = relevantDocs.map(r => r.pageContent).join(" ")
                m.content = relevantContent
                console.log(relevantContent)
            }
            
            messages = [...markedMessages, lastMessage]
        }

        this.active = id;
        const obj = this._object[this.active]
        try {
            return await obj.default(messages, prompt, tokens)
        } catch(e) {
            return `error: ${e as string}`
        }
    }
  }

const modelAgent =  new ModelAgent({})
modelAgent.loadAddons(addonsManifest)

export default modelAgent