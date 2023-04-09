import { Message } from '@/types/chat';
import Replicate from "replicate";
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'chatGPT-diffusion',
    description: 'this is the model agent of chatGPT enhanced with stable diffusion'
}


export default async function generate(messages: Message[], prompt='') {
    const model = {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5',
        maxLength: 12000,
        tokenLimit: 3000
    } 

    prompt = `
You are ChatGPT, a large language model trained by OpenAI. Please follow these rules:
1. If you believe that the user wants a picture, respond to the user with: "请描述一下你想要的图画。" Then, in the next round of conversation, when the user inputs a descriptive text, respond strictly in the following standard format:
{"task": 'txt2img', "input": input} where input is an English description that is associated with the user's input and is more suitable for describing or generating a beautiful image. This description can be a fragment composed of keywords and does not necessarily have to be a complete sentence.
2. If you believe that directly replying to the user with a picture is most appropriate, respond strictly in the following standard format:
{"task": 'txt2img', "input": input} where input is an English description of the picture. This description can be a fragment composed of keywords and does not necessarily have to be a complete sentence.
3. In other cases, please follow the user's instructions carefully, and respond using markdown
`

    const key = process.env.OPENAI_API_KEY || ''

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );    

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();
    const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);
    const txt = await parseStream(stream)
    
    const reg = /(\{[\w\W]*txt2img[\w\W]*\})/
    const matches = reg.exec(txt)
    if(matches) {
      try {
        const res = JSON.parse(matches[0])
        const inputPrompt = res.input.trim()
        if(inputPrompt) {
          console.log(`sd prompt: ${inputPrompt}`)
          const output = await replicate.run(
            "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            {
              input: {
                prompt: inputPrompt
              }
            }
          ) as string[];
          
          const uri = output[0]
      
          return `![result](${uri})`

        } else {
          return txt
        }
      } catch (error) {
        return txt
      }
    } else {
      return txt
    }

}

async function parseStream(stream: ReadableStream): Promise<string> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
  } finally {
    reader.releaseLock();
  }

  return text;
}