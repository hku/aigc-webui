import Replicate from "replicate";
import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'replicate-riffusion',
    description: `
    this is the model agent for music generation powered by riffusion api on replicate.
The favorable language for this model is English.
`,
  env: ["REPLICATE_API_TOKEN"],
}

export default async function generate(messages: Message[], prompt='', tokens: string[]) {

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "funky synth solo"

  const client =new ReplicateClient(
    tokens[0],
    "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
  )
  
  try{
    const output = await client.generate({
      prompt_a: txt
    }) as {[key: string]: any};
  
    const {audio, spectrogram} = output
  
  return `
  <div>
    <audio controls="controls">
      <source type="audio/wav" src="${audio}"></source>
    </audio>
  </div>
  <div>
    <img src=${spectrogram} alt="spectrogram"/>
  </div>
  `  
  } catch(e) {
    if(e instanceof ReplicateNoTokenError) {
      return `<span style="color:red">e.message</span>`
    }
    return '<span style="color:red">unknown error when call for the replicate api</span>'
  }
}