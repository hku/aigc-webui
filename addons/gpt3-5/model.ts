import { Message } from '@/types/chat';
import { DEFAULT_SYSTEM_PROMPT, MAX_TOKEN_COUNT } from '@/utils/app/const';
import { OpenAIStream } from '@/utils/server/openai';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';


export const metadata = {
    name: 'gpt-3.5-turbo',
    description: 'this is the model agent of openai gpt3.5-turbo',
    env: ["OPENAI_API_KEY"],
    supportBrowser: true,
    supportAnalysisMode: true,
    freeSystemPrompt: true,
}

export default async function generate(messages: Message[], prompt='', tokens: string[]) {
    const model = {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5',
        maxLength: 12000,
        tokenLimit: MAX_TOKEN_COUNT
    } 
    
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

    if (tokenCount > model.tokenLimit) {
      return `Too many characters (tokens) for openai: ${tokenCount} > ${model.tokenLimit}, please enable analysis mode...`
    } 

    encoding.free();
    const stream: ReadableStream | string = await OpenAIStream(model, promptToSend, tokens[0], messagesToSend);
    return stream 
}
