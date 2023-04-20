import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";


export const metadata = {
    name: 'replicate-llama-7b',
    description: `
    this is a simple model agent for llama-7b deployed on replicate. Sample Input: "Simply put, Quantum Mechanics states that"
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

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "Simply put, the theory of relativity states that"

  const client =new ReplicateClient(
    tokens[0],
    "replicate/llama-7b:455d66312a66299fba685548fe24f66880f093007b927abd19f4356295f8577c"
  )

  try{
    const output = await client.generate({
      prompt: txt,
      max_length: 500,
      temperature: 0.75,
      top_p: 1,
      repetition_penalty: 1,
    }) as string[];

    const result = output.join('')
    
    return result

  } catch(e) {
    if(e instanceof ReplicateNoTokenError) {
      return `<span style="color:red">${e.message}</span>`
    }
    return '<span style="color:red">unknown error when call for the replicate api</span>'
  }

}


