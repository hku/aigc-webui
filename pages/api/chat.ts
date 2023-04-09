import { ChatBody, Message } from '@/types/chat';
import modelAgent  from '../../addons'

export const config = {
  runtime: 'edge',
};

// const handler =  async (  req: NextApiRequest, res: NextApiResponse) => {
const handler = async (req: Request): Promise<Response> => {
  try {
    
    const chatbody = (await req.json()) as ChatBody;

    const { messages, prompt } = chatbody;

    console.log(`handler: ${messages}`)

    const res = await modelAgent.generate(messages, prompt)

    return new Response(res);

    // return new Response('![test](/media/test.png)');

  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
