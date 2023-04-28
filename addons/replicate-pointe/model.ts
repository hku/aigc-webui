import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";


export const metadata = {
    name: 'replicate-pointe',
    description: `
    this is a simple model agent for pointe deployed on replicate. Sample Input: "A red motorcycle"
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

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "a red motorcycle"

  const client =new ReplicateClient(
    tokens[0],
    "cjwbw/point-e:1a4da7adf0bc84cd786c1df41c02db3097d899f5c159f5fd5814a11117bdf02b",
  )

  try{
    const output = await client.generate({
      prompt: txt,
      output_format: 'animation',
    }) as {[key: string]: string};

    const result = `![](${output.animation})`
    
    return result

  } catch(e) {
    if(e instanceof ReplicateNoTokenError) {
      return `<span style="color:red">${e.message}</span>`
    }
    return '<span style="color:red">unknown error when call for the replicate api</span>'
  }

}


