import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";


export const metadata = {
    name: 'replicate-stableLM',
    description: `
    this is a simple model agent for stableLM deployed on replicate.
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

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "What's your mood today?"

  const client =new ReplicateClient(
    tokens[0],
    "stability-ai/stablelm-tuned-alpha-7b:c49dae362cbaecd2ceabb5bd34fdb68413c4ff775111fea065d259d577757beb",
  )

  try{
    const output = await client.generate({
      prompt: txt,
      max_tokens: 200,
      temperature: 0.75,
      top_p: 1,
      repetition_penalty: 1.2,
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


