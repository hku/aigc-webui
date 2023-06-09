import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { OPENAI_API_HOST } from '../app/const';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  key: string,
  messages: Message[],
) => {

  //openai api refuses additional attributes in messages 
  messages.forEach(m => {delete m.metadata})

  key = key.trim()
  if (key === '' || key === 'YOUR_KEY') {
    return `<span style="color:red">To use this model, you need to apply for an openai API_KEY, and fill in the API_KEY into the '.env.local' file. For details, please refer to the <a target="_blank" href="https://github.com/hku/aigc-webui/blob/main/README.md">README.md</a> file</span>`
  }

  let res: {[key: string]: any}
  try {
     res = await fetch(`${OPENAI_API_HOST}/v1/chat/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
        ...(process.env.OPENAI_ORGANIZATION && {
          'OpenAI-Organization': process.env.OPENAI_ORGANIZATION,
        }),
      },
      method: 'POST',
      body: JSON.stringify({
        model: model.id,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 1,
        stream: true,
      }),
    });
  } catch (e) {
    console.log(e)
    return '<span style="color: red">failed to call the openai API, check your network</span>'
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }



  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
  
          if (data === '[DONE]') {
            controller.close();
            return;
          }
  
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };
  
      const parser = createParser(onParse);
  
      // Consume the response body using async iterator
      const reader = res.body.getReader();
  
      try {
        while (true) {
          const { value, done } = await reader.read();
  
          if (done) {
            break;
          }
  
          parser.feed(decoder.decode(value));
        }
      } catch (error) {
        console.error('Error reading from response body:', error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  
  // const stream = new ReadableStream({
  //   async start(controller) {
  //     const onParse = (event: ParsedEvent | ReconnectInterval) => {
  //       if (event.type === 'event') {
  //         const data = event.data;

  //         if (data === '[DONE]') {
  //           controller.close();
  //           return;
  //         }

  //         try {
  //           const json = JSON.parse(data);
  //           const text = json.choices[0].delta.content;
  //           console.log(text)
  //           const queue = encoder.encode(text);
  //           controller.enqueue(queue);
  //         } catch (e) {
  //           controller.error(e);
  //         }
  //       }
  //     };

  //     const parser = createParser(onParse);


  //     for await (const chunk of res.body as any) {
  //     // for (const chunk of res.body as any) {
  //       parser.feed(decoder.decode(chunk));
  //     }
  //   },
  // });

  return stream;


};
