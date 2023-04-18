const baidu_trans_url = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

import md5 from "md5"

export const metadata = {
    name: 'baidu翻译',
    description: `
This modifier use Baidu翻译 API translates the prompt into English automatically.
To use this modifier, you need to customize your BAIDU_TRANSLATE_APPID and BAIDU_TRANSLATE_SECKRET
`,
    icon: 'IconLanguage'
}

//TODO: implement of a `before_input` method
export const after_input = async (prompt: string) => {
    console.log(`translating: ${prompt}`)
    
    const appid = (process.env.BAIDU_TRANSLATE_APPID || '').trim()
    const secret = (process.env.BAIDU_TRANSLATE_SECRET || '').trim()
    
    if(appid === '' || appid === 'YOUR_APPID' || secret === '' || secret === 'YOUR_SECRET') {
        return '<span style="color:red">使用百度翻译，您需要申请相关APPID和SECRET，申请链接，详见 <a target="_blank" href="https://github.com/hku/aigc-webui/blob/main/README.md">README.md</a></span>'
    }

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

    let res: {[key:string]: any} 
    try {
        res =  await fetch(`${baidu_trans_url}?${queryParams}`)
    } catch (e) {
        return '<span style="color: red">failed to call the baidu翻译 API, check your network</span>'
    }

    const result = await res.json()

    if(result.error_code) {
        return `<span style="color: red">failed to call the baidu翻译 API, error_code:${result.error_code}</span>`
    }

    try {
        const result_text = result.trans_result[0].dst
        console.log(`translated: ${result_text}`)
        return result_text
    } catch(e) {
        console.log(e)
        return prompt
    }

}


