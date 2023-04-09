import Replicate from "replicate";
import { Message } from '@/types/chat';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'sd-replicate',
    description: 'this is the model agent for replicate stable diffusion'
}

export default async function generate(messages: Message[], prompt='') {

    const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "a vision of paradise. unreal engine"

    const output = await replicate.run(
        "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        {
          input: {
            prompt: txt
          }
        }
    ) as string[];
    
    const uri = output[0]

    return `![result](${uri})`
}


