import { ChatBody, Message } from '@/types/chat';

import promptModifier from '../../addins';

import type { NextApiRequest, NextApiResponse } from 'next';
import { AddinModifierID } from '@/types/addin';

// export const config = {
//   runtime: 'edge',
// };

type JsonRequestParams = {
    prompt: string;
    addinId: AddinModifierID | null;
};

type JsonResponseParams = {
    result: string;
};

const handler =  async (  req: NextApiRequest, res: NextApiResponse<JsonResponseParams>) => {

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { prompt, addinId }: JsonRequestParams = req.body;


    let _content = prompt.trim()
    try {
      //# a simple prompt trick to make chatgpt respond with json data if possible.
      const hasFlag = /(!!!|！！！)$/.test(_content)

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

      res.status(200).json({result: _content})

    } catch (error) {
        console.error(error);
        res.status(200).json({result: _content})
    }
};

export default handler;
