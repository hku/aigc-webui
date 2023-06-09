import { Message } from '@/types/chat';
import Replicate from "replicate";
import { DEFAULT_SYSTEM_PROMPT, MAX_TOKEN_COUNT } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server/openai';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';
import { match } from 'assert';
import { ReplicateClient, ReplicateNoTokenError } from '@/utils/server/replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const metadata = {
    name: 'gpt-3.5-enhanced',
    description: `
This is a model agent of chatGPT enhanced by stable diffusion and riffusion, which can generate images and musics.
The favorable language for Image and Music generation is English.
`,
  env: ["OPENAI_API_KEY", "REPLICATE_API_TOKEN"],
  settingInfo: `
  <p style="font-weight: bold">
  Some KEY is missed, which you can get from: <br/>
  <a href="https://platform.openai.com/account/api-keys" target="_blank" style="color:blue; text-decoration: underline">OPENAI_API_KEY</a><br/>
  <a href="https://replicate.com" target="_blank" style="color:blue; text-decoration: underline">REPLICATE_API_TOKEN</a>
  </p>
  `,
}

export default async function generate(messages: Message[], prompt='', tokens: string[]) {
    const model = {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5',
        maxLength: 12000,
        tokenLimit: MAX_TOKEN_COUNT
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

      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];

      // if (tokenCount + tokens.length > model.tokenLimit) {
      //   message.marked = true
      //   break;
      // }

    }

    //TODO： token check 应该放到前台
    if (tokenCount > model.tokenLimit) {
      return `Too many characters (tokens) for openai: ${tokenCount} > ${model.tokenLimit}, enable analysis mode...`
    } 

    encoding.free();
    const stream = await OpenAIStream(model, promptToSend, tokens[0], messagesToSend);
    const txt = await parseStream(stream)
    

    const [cleanedText, task] = matchIntent(txt)

    if(task) {
      console.log(`matched task ${task}: ${cleanedText}`)

      try {
        const res = JSON.parse(cleanedText as string)
        let inputPrompt = res.input
        inputPrompt = (typeof inputPrompt) === 'object'?JSON.stringify(inputPrompt):(inputPrompt as string)
        inputPrompt = inputPrompt.trim()
        // const inputPrompt = (res.input as string).trim()

        if(inputPrompt) {
          switch (task) {
            case 'txt2img':

              const client =new ReplicateClient(
                tokens[1],
                "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
                // "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
              )
            
              try{
                const out_img = await client.generate({
                  prompt: inputPrompt,
                  negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name'
                }) as string[];
            
                const uri = out_img[0]      
                return `![result](${uri})`
            
              } catch(e) {
                if(e instanceof ReplicateNoTokenError) {
                  return `<span style="color:red">${e.message}</span>`
                }
                return '<span style="color:red">unknown error when call for the replicate api</span>'
              }
                      
            case 'txt2music':

            const client2 =new ReplicateClient(
              process.env.REPLICATE_API_TOKEN || '',
              "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
            )
            
            try{
              const out_mus = await client2.generate({
                prompt_a: inputPrompt
              }) as {[key: string]: any};
            
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
            } catch(e) {
              if(e instanceof ReplicateNoTokenError) {
                return `<span style="color:red">${e.message}</span>`
              }
              return '<span style="color:red">unknown error when call for the replicate api</span>'
            }
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

async function parseStream(stream: string | ReadableStream): Promise<string> {
  if(typeof stream === 'string') {
    return stream
  }

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
    "txt2music": /(\{[\w\W]*(txt2music|txt2song)[\w\W]*\})/,
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