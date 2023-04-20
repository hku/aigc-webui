import { Message } from '@/types/chat';
import { ReplicateClient, ReplicateNoTokenError } from "@/utils/server/replicate";


export const metadata = {
    name: 'huggingface-stableLM-7b',
    description: `
    this is a simple model agent for stablelm-alpha-7b deployed on huggingface. Sample Input: "My name is Julien and I like to"
`,
  env: ["HUGGING_ACCESS_TOKEN"],
  settingInfo: `
  <p style="font-weight: bold">
  fill in your API key, which you can get from: 
  <a href="https://huggingface.co/settings/tokens" target="_blank" style="color:blue; text-decoration: underline">https://huggingface.co/settings/tokens</a>
  </p>
  `,
}

export default async function generate(messages: Message[], prompt='', tokens: string[]) {

  const API_KEY = tokens[0];
  const MODEL_NAME = 'stabilityai/stablelm-base-alpha-7b'

  const txt = messages.filter(m => m.role === 'user' ).pop()?.content || "Simply put, the theory of relativity states that"
  const data = {
    'inputs': txt,
    return_full_text: false,
    max_time: 120,
    wait_for_model: true
  };

  try{
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          method: "POST",
          body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    
    console.log(JSON.stringify(result))

    if(result[0]) {
      return result[0].generated_text
    } else {
      return JSON.stringify(result)
    }

  } catch(e) {
    return `<span style="color:red">unknown error when call for the huggingface api</span>`
  }

}


