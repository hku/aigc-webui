import { Message } from '@/types/chat';
import Replicate from "replicate";
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import { match } from 'assert';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'gpt-3.5-enhanced',
    description: 'This is a model agent of chatGPT enhanced by stable diffusion and riffusion, which can generate images and musics.'
}

export default async function generate(messages: Message[], prompt='') {
    const model = {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5',
        maxLength: 12000,
        tokenLimit: 3000
    } 

    // `
    // You are ChatGPT, a large language model trained by OpenAI. Please follow these rules:
    // 1. If you believe that the user wants a picture, respond to the user with: "请描述一下你想要的图画。" Then, in the next round of conversation, when the user inputs a descriptive text, respond strictly in the following standard format:
    // {"task": "txt2img", "input": input} where input is an English description that is associated with the user's input and is more suitable for describing or generating a beautiful image. This description can be a fragment composed of keywords and does not necessarily have to be a complete sentence.
    // 2. If you believe that directly replying to the user with a picture is most appropriate, respond strictly in the following standard format:
    // {"task": 'txt2img', "input": input} where input is an English description of the picture. This description can be a fragment composed of keywords and does not necessarily have to be a complete sentence.
    // 3. In other cases, please follow the user's instructions carefully, and respond using markdown
    // `
    prompt = `
1. If you believe that the user wants a picture, respond with: "请描述一下你想要的图画。" Then, in the next round of conversation, when the user inputs a descriptive text, respond with the json format:
{"task": "txt2img", "input": input} where input is an English description that is associated with the user's input and suitable for generating a beautiful image.
2. If you believe that directly replying to the user with a picture is most appropriate, respond with the json format:
{"task": 'txt2img', "input": input} where input is an English description of the picture, please respond using json format!
3. If you believe that the user wants a music, respond with: "请描述一下你想要的音乐风格。" Then, in the next round of conversation, when the user inputs a descriptive text, respond strictly with the standard data structure:
{"task": "txt2music", "input": input} where input is an English description that is associated with the user's input and suitable for describing a nice music.
4. If you believe that directly replying to the user with a music is most appropriate, respond strictly with the standard data structure:
{"task": 'txt2music', "input": input} where input is an English description of the music, plsease respond using json format!
5. In other cases, please follow the user's instructions carefully, and respond using markdown
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
    

    const [cleanedText, task] = matchIntent(txt)

    if(task) {
      console.log(`matched task ${task}: ${cleanedText}`)

      try {
        const res = JSON.parse(cleanedText as string)
        
        const inputPrompt = res.input.trim()

        if(inputPrompt) {
          switch (task) {
            case 'txt2img':
              const out_img = await replicate.run(
                "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
                // "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
                {
                  input: {
                    prompt: inputPrompt,
                    negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name'
                  }
                }
              ) as string[];
              
              const uri = out_img[0]      
              return `![result](${uri})`
          
            case 'txt2music':
              const out_mus = await replicate.run(
                "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
                {
                  input: {
                    prompt_a: inputPrompt
                  }
                }
              ) as {[key: string]: any};
            
              const {audio, spectrogram} = out_mus
              
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
            default:
              return txt
          }
    
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


function matchIntent(txt: string) {
  
  const regs: {[key: string]: any} = {
    "txt2img": /(\{[\w\W]*txt2img[\w\W]*\})/,
    "txt2music": /(\{[\w\W]*txt2music[\w\W]*\})/,
  }
  
  for (const task in regs) {
    if (regs.hasOwnProperty(task)) {
      const reg = regs[task]
      const matches = reg.exec(txt)
      if(matches) {
        const res = matches[0].replace(/'/g, '"')
        return [res, task] 
      }
    }
  }
  
  return [txt, null] //not match
}