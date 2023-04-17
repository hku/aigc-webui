

import type { NextApiRequest, NextApiResponse } from 'next';

// export const config = {
//   runtime: 'edge',
// };


type JsonResponseParams = {
    result: string[];
};

const handler =  async (  req: NextApiRequest, res: NextApiResponse<JsonResponseParams>) => {

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    let {tokenNames} = req.body;


    
    tokenNames = (tokenNames as string[]) || []

    const tokenValues = tokenNames.map((n: string) =>process.env[n])


    try {
        res.status(200).json({result: tokenValues})
    } catch (error) {
        console.error(error);
        res.status(200).json({result: tokenValues})
    }
};

export default handler;
