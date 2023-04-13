import Replicate from "replicate";
import { Message } from '@/types/chat';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'replicate-stable-diffusion',
    description: `
This is a model agent for image generation powered by stable-diffusion api on replicate.
The favorable language for this model is English.    
`
}

export default async function generate(messages: Message[], prompt='') {

    const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "a vision of paradise. unreal engine"

    const output = await replicate.run(
      "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
      // "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: txt,
          negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name'
        }
      }
    ) as string[];
    
    const uri = output[0]

    return `![result](${uri})`
}


