import Replicate from "replicate";
import { Message } from '@/types/chat';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'replicate-llama-7b',
    description: `
    this is a simple model agent for llama-7b deployed on replicate. Sample Input: "Simply put, Quantum Mechanics states that"
`
}

export default async function generate(messages: Message[], prompt='') {

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "Simply put, the theory of relativity states that"

  const output = await replicate.run(
    "replicate/llama-7b:455d66312a66299fba685548fe24f66880f093007b927abd19f4356295f8577c",
    {
      input: {
        prompt: txt,
        max_length: 500,
        temperature: 0.75,
        top_p: 1,
        repetition_penalty: 1,
      }
    }
  ) as string[];


  const result = output.join('')
  
  return result

}


