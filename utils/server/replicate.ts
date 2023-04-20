import Replicate from "replicate";
import { Message } from '@/types/chat';

type ModelId = `${string}/${string}:${string}`


export class ReplicateNoTokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ReplicateNoTokenError'
    }
  }


// #换掉百度翻译，制作申请token的视频，规划推广渠道，措辞
export class ReplicateClient {
    private token: string
    private model_id: string
    constructor(token: string, model_id: ModelId) {
        
        this.token = token
        this.model_id = model_id
    }
    async generate(input: object) {
        const token = this.token.trim()
        const model_id = this.model_id as ModelId
        
        if(token === '' || token === 'YOUR_KEY') {
            throw new ReplicateNoTokenError(`To use this model, you need to apply for a replicate API_TOKEN, and fill in the API_TOKEN into the '.env.local' file. For details, please refer to the <a target="_blank" href="https://github.com/hku/aigc-webui/blob/main/README.md">README.md</a> file`)
        }
        
        const replicate = new Replicate({
            auth: token,
        });

        const output = await replicate.run(model_id, {input})
        return output
    }
}    


