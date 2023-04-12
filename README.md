# AIGC-webui

[en](./README.md) | [中文](./README_cn.md) 

AIGC-webui is a universal interface for AIGC (AI Generated Content). For example, you can use it to make chatGPT working more creatively, or to generate images / musics.

Screenshot:

![screenshot](./docs/images/screenshoot.jpg)

### Features
 
- A variety of AIGC models to choose from, such as ChatGPT, LLaMA, Stable Diffusion，Riffusion
- Multimodal generation ability, such as images, musics, code blocks, and so on.
- Comes with an addon, named `gpt3-5-enhanced`, that enrich ChatGPT with the ability to generate images and musics.
- Comes with an addin, named `translate`, that can translates user input automatically, and another plugin `beautify` than can optimize user's prompt for image generation.
- An extendable infrastructure, easy to make your own extension. （[Guidelines](docs/Contributing.md)）
- predefined prompt shortcuts ...
- etc.

## Installation and Running

### For Windows User
1. Install [nodejs](https://nodejs.org) 
2. Install [git](https://git-scm.com/download/win).
3. Download this project: open the terminal (Windows + R, type "cmd" and press Enter), and execute `git clone https://github.com/hku/aigc-webui.git`
4. Install dependencies: Navigate into the project folder(`cd aigc-webui`), and execute `npm install`
5. Customize the environment:  make a copy of the example environment variables file `.env.local.example`, name it `.env.local`, Fill in the keys or tokens in the `.env.local` file. The meanings of the keys and the application links for them  are listed in the table below.

| environment variables         |  Free application links                | Usage                                            |
| --------------------- | ------------------------------ | ------------------------------------------------------- |
| OPENAI_API_KEY        |   [openai](https://platform.openai.com/account/api-keys)     |For calling OpenAI's official API, required for the model `GPT-3.5` and `GPT-3.5-enhanced` shipped with this repository. |
| REPLICATE_API_TOKEN    | [replicate](https://replicate.com)       | For calling replicate APIs，required for  `gpt3-5-enhanced`,`replicate-*` models |
| BAIDU_TRANSLATE_APPID, BAIDU_TRANSLATE_SECRET  | [Baidu Translate](http://api.fanyi.baidu.com/product/11)  | For calling Baidu translation API，required for the prompt modifiers `translate` and `beautify` shipped with this repository           |


6. deploy the web service, by execute `npm run dev`

Open the address in your browser: [http://localhost:3000](http://localhost:3000), enjoy!

### For Mac/Linux User
1. Install [nodejs](https://nodejs.org) 
2. Install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
3. Download this project: open the terminal, and execute：`git clone https://github.com/hku/aigc-webui.git`
4. Install dependencies: Navigate into the project folder(`cd aigc-webui`), and execute `npm install`
5. Customize the environment:  make a copy of the example environment variables file `.env.local.example`, name it `.env.local`, Fill in the keys or tokens in the `.env.local` file. The meanings of the keys and the application links for them  are listed in the table below.

| environment variables         |  Free application links                | Usage                                            |
| --------------------- | ------------------------------ | ------------------------------------------------------- |
| OPENAI_API_KEY        |   [openai](https://platform.openai.com/account/api-keys)     |For calling OpenAI's official API, required for the model `GPT-3.5` and `GPT-3.5-enhanced` shipped with this repository. |
| REPLICATE_API_TOKEN    | [replicate](https://replicate.com)       | For calling replicate APIs，required for  `gpt3-5-enhanced`,`replicate-*` models |
| BAIDU_TRANSLATE_APPID, BAIDU_TRANSLATE_SECRET  | [Baidu Translate](http://api.fanyi.baidu.com/product/11)  | For calling Baidu translation API，required for the prompt modifiers `translate` and `beautify` shipped with this repository           |


6. deploy the web service, by execute `npm run dev`

Open the address in your browser: [http://localhost:3000](http://localhost:3000), enjoy!


## Develop Your Extensions

aigc-webui has a simple and easy-to-use extension infrastructure. You can develop your own agents, prompt modifiers, or other features ，Check [guidelines](docs/Contributing.md)


## Credits
- openai - https://github.com/openai/openai-cookbook
- Chatbot UI - https://github.com/mckaywrigley/chatbot-ui
- Nextjs - https://github.com/vercel/next.js
- Replicate - https://github.com/replicate/replicate-javascript
- Stable Diffusion - https://github.com/CompVis/stable-diffusion
- LlaMA - https://github.com/facebookresearch/llama
- (You)

### Contact

If you have any questions, feel free to reach out to me on [Facebook](https://www.facebook.com/kun.huang.750).