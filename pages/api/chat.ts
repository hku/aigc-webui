import { ChatBody, Message } from '@/types/chat';

import promptModifier from '../../addins';

import modelAgent  from '../../addons'

export const config = {
  runtime: 'edge',
};

// const handler =  async (  req: NextApiRequest, res: NextApiResponse) => {
const handler = async (req: Request): Promise<Response> => {
  try {
    
    const chatbody = (await req.json()) as ChatBody;

    const { messages, prompt, model, addinId} = chatbody;

    const lastMessage = messages.slice(-1)[0]
    const lastContent = lastMessage.content.trim()

    if (lastContent && lastMessage.role === 'user') {

      //# a simple prompt trick to make chatgpt respond with json data if possible.
      const hasFlag = /(!!!|！！！)$/.test(lastContent)

      let _content = lastContent
      if(hasFlag) {
        _content = _content.replace(/(!|！)+$/, '')        
      }
      if(addinId) {
        _content = await promptModifier.modify(_content, addinId)
      } 

      if(hasFlag) {
        _content = `${_content}!!!`
      }

      console.log(`_conent: ${_content}`)

      if(hasFlag) {
        messages.slice(-1)[0].content = _content.replace(/(!|！)+$/, ', please respond using json format')
        console.log(`last message content: ${messages.slice(-1)[0].content}`)
      }

    }


    const res = await modelAgent.generate(messages, prompt, model.id)

    return new Response(res);

    // return new Response('![test](/media/test.png)');

  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
