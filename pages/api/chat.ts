import { ChatBody, Message } from '@/types/chat';
import modelAgent  from '../../addons'

export const config = {
  runtime: 'edge',
};

// const handler =  async (  req: NextApiRequest, res: NextApiResponse) => {
const handler = async (req: Request): Promise<Response> => {
  try {
    
    const chatbody = (await req.json()) as ChatBody;

    const { messages, prompt, model } = chatbody;

    const lastMessage = messages.slice(-1)[0]
    const lastContent = lastMessage.content.trim()
    if(/(!!!|！！！)$/.test(lastContent) && lastMessage.role === 'user') {
      messages.slice(-1)[0].content = lastContent.replace(/(!|！)+$/, ', please respond using json format')
      console.log(`last message content: ${messages.slice(-1)[0].content}`)
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
