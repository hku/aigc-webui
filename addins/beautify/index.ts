import Replicate from "replicate";

const baidu_trans_url = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

import md5 from "md5"

export const metadata = {
    name: 'beautifier',
    description: 'translate and modify prompt more suitable for generating beautiful images',
    icon: 'IconPalette'
}

export const after_input = async (prompt: string) => {
    console.log(`translating: ${prompt}`)
    
    const appid = process.env.BAIDU_TRANSLATE_APPID
    const secret = process.env.BAIDU_TRANSLATE_SECRET

    const salt = Math.random();
    const sign = md5(appid + prompt + salt + secret);
    const params = {
		q: prompt,
		from: 'auto',
		to: 'en',
		salt,
		appid,
		sign,
	} as {[key: string]: any};

    const queryParams = new URLSearchParams(params).toString()

    const res =  await fetch(`${baidu_trans_url}?${queryParams}`)
    
    const result = await res.json()

    console.log(`res: ${JSON.stringify(result)}`)
    const result_text = result.trans_result[0].dst

    console.log(`translated: ${result_text}`)


    const output = await replicate.run(
        "kyrick/prompt-parrot:7349c6ce7eb83fc9bc2e98e505a55ee28d7a8f4aa5fb6f711fad18724b4f2389",
        {
          input: {
            prompt: result_text + ' '
          }
        }
      );
    
    return (output as unknown as string).split(/\-+/)[0]

}

