import Replicate from "replicate";
import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'replicate-stable-anime',
    description: `
This is a model agent for image generation powered by stable-diffusion api on replicate.
The favorable language for this model is English.    
`,
  env: ["REPLICATE_API_TOKEN"],
  settingInfo: `
  <p style="font-weight: bold">
  fill in your API key, which you can get from: 
  <a href="https://replicate.com" target="_blank" style="color:blue; text-decoration: underline">https://replicate.com</a>
  </p>
  `,
}

export default async function generate(messages: Message[], prompt='', tokens: string[]) {

    const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "a vision of paradise. unreal engine"
    
  const client =new ReplicateClient(
    tokens[0],
    "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
    // "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
  )

  try{

    const output = await client.generate({
      prompt: txt,
      negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name'
    }) as string[];

    const uri = output[0]
    return `![result](${uri})`

  } catch(e) {
    if(e instanceof ReplicateNoTokenError) {
      return `<span style="color:red">${e.message}</span>`
    }
    return '<span style="color:red">unknown error when call for the replicate api</span>'
  }
}


