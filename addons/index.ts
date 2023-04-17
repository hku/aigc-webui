import { AnyNode } from 'postcss';
import addonsManifest from '../addons-manifest.json';
import { Message } from '@/types/chat';
import { AddonModel } from '@/types/addon';

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

    async generate(messages: Message[], prompt: string, model: AddonModel) {
        const {id, env} = model
        
        const isBrowser = (typeof window === 'object')
        
        let tokens: any[]|null = null

        if(env instanceof Array) {
            tokens = env.map(v => {
                const t = isBrowser?(localStorage && localStorage.getItem(v)):(process && process?.env?.[v])
                return t || null
            })
            
            for(let i=0; i<env.length; i++) {
                const t = tokens[i]
                if(t === null) {
                    if(isBrowser) {
                        return `<span style="color:red">The required token is not set, please input the value of ${env[i]} in <a href="/setting/${id}" target="_blank">the setting page</a></span>`
                    } else {
                        return `<span style="color:red">To use this model, you need to fill in the ${env[i]} into the '.env.local' file. For details, please refer to the <a target="_blank" href="https://github.com/hku/aigc-webui/blob/main/README.md">README.md</a> file</span>`
                    }
                }
            }
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