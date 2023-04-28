import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";


export const metadata = {
    name: 'replicate-txt2video',
    description: `
    this is a simple model agent for damo-text-to-video deployed on replicate. Sample Input: "An astronaut riding a horse"
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
    "cjwbw/damo-text-to-video:1e205ea73084bd17a0a3b43396e49ba0d6bc2e754e9283b2df49fad2dcf95755",
  )

  try{
    const output = await client.generate({
      prompt: txt,
      num_frames: 24,
      fps: 12,
    }) as unknown as string;

    const result = `<video controls="controls">
    <source id="mp4" src="${output}" type="video/mp4">
</videos>`
    
    return result

  } catch(e) {
    if(e instanceof ReplicateNoTokenError) {
      return `<span style="color:red">${e.message}</span>`
    }
    return '<span style="color:red">unknown error when call for the replicate api</span>'
  }

}


