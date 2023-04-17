import { ChatBody, Message } from '@/types/chat';

import promptModifier from '../../addins';

import modelAgent  from '../../addons';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    
    const chatbody = (await req.json()) as ChatBody;

    let { messages, prompt, model, addinId} = chatbody;



    const lastMessage = messages.slice(-1)[0]
    const lastContent = lastMessage.content.trim()

    if (lastContent && lastMessage.role === 'user') {

      //# a simple prompt trick to make chatgpt respond with json data if possible.
      const hasFlag = /(!!!|！！！)$/.test(lastContent)

      if(hasFlag) {
        messages.slice(-1)[0].content = lastContent.replace(/(!|！)+$/, ', please respond using json format')
      }

    }


    const res = await modelAgent.generate(messages, prompt, model)

    return new Response(res);

    // return new Response('![test](/media/test.png)');

  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
