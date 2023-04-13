const baidu_trans_url = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

import md5 from "md5"

export const metadata = {
    name: 'translator',
    description: `
This modifier use Baidu Fanyi API translates the prompt into English automatically.
To use this modifier, you need to customize your BAIDU_TRANSLATE_APPID and BAIDU_TRANSLATE_SECKRET
`,
    icon: 'IconLanguage'
}

//TODO: implement of a `before_input` method
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

    try {
        const result_text = result.trans_result[0].dst
        console.log(`translated: ${result_text}`)
        return result_text
    } catch(e) {
        console.log(e)
        return prompt
    }

}


