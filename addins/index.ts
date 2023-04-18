import { AddinModifierID } from '@/types/addin';
import addinsManifest from '../addins-manifest.json';

export type Addin = {
    [key in 'load_content' | 'after_input' | 'metadata']: any;
}; 

export interface Addins {
    [key: string]: Addin
}

class PromptModifier {
    private _object: Addins;
    private _keys: (keyof Addins)[]

    constructor(object: Addins) {
        this._object = object;
        const _keys = this._keys = Object.keys(object)
    }
    
    _reset(object: Addins) {
        this._object = object;
        const _keys = this._keys = Object.keys(object)
    }

    get metadata() {
        const metadata = this._keys.map(k => Object.assign({}, this._object[k].metadata, {id: k}))
        return metadata
    }
    
    async load(addinsManifest: string[], cb=()=>{}){
        const addins: Addins = {}
        for (const name of addinsManifest as string[]) {
            const scriptModule = await import(`../addins/${name}/index.ts`);
            
            addins[name] = scriptModule;
          }

          this._reset(addins)
          cb()
    }

    async modify(prompt: string, key: AddinModifierID) {
            const obj = this._object[key]
            if(obj && obj.after_input) {
                try {
                    return await obj.after_input(prompt)
                } catch(e) {
                    console.log(e)
                    return prompt
                } 
            }
            return prompt
    }
    async load_content(file: File, key: AddinModifierID) {

        const obj = this._object[key]
        if(obj && obj.load_content) {
            try {
                return await obj.load_content(file)
            } catch(e) {
                console.log(e)
                throw new Error("load content failed")
            } 
        } else {
            throw new Error("this widget is not a file loader")
        }
           
    }

}

const promptModifier =  new PromptModifier({})
promptModifier.load(addinsManifest)

export default promptModifier