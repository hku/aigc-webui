import { AnyNode } from 'postcss';
import addonsManifest from '../addons-manifest.json';
import { Message } from '@/types/chat';

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

    async generate(messages: Message[], prompt: string, key = 'gpt3-5') {
        this.active = key;
        const obj = this._object[this.active]
        try {
            return await obj.default(messages, prompt)
        } catch(e) {
            return `error: ${e as string}`
        }
    }
  }

const modelAgent =  new ModelAgent({})
modelAgent.loadAddons(addonsManifest)

export default modelAgent