# AIGC-webui

[en](../README.md) | [中文](./README_cn.md) | [हिंदी](./README_in.md) | [español](./README_es.md) | [العربية](./README_ar.md) | [português](./README_po.md) | [日本語](./README_jp.md)

这是一个用于AI创作的通用浏览器操作界面。 例如：你可以通过它定制chatGPT的使用方式，也可以用来创作绘画和音乐...还可以让它辅助你阅读pdf文章或者处理Excel表格

应用截图：

![screenshot](./images/screenshoot.jpg)

![screenshot2](./images/screenshoot2.jpg)

### 软件功能
 
- 可切换的AI创作模型，例如 ChatGPT，LLaMA，Stable Diffusion，Riffusion stableLM... 或者你自己制作的AI模型
- 多模态的输出，如image，audio，codeblock等
- 多模态的输入，支持文本、文件、语音多种输入方式
- "chatPDF"功能, 你可以导入pdf，doc, docx，txt等文件, 然后在“分析模式”下，和这些文件“对话”.
- "chatExcel" 功能，你可以导入 excel 文件，然后通过prompt处理这些表格
- 自带强化ChatGPT的插件，使ChatGPT可以绘画、作曲
- 可切换的提示词预处理器，例如自动翻译，自动优化提示词（用户生成图画）
- 可扩展、易开发的模型代理 （[开发指南](docs/Contributing.md)）
- 可扩展、易开发的提示词预处理器（[开发指南](docs/Contributing.md)）
- 支持对话历史的修改、删除、重点分析等管理操作
- 支持系统提示词的修改、删除、等管理操作
- （其他）

### 自带模型

- 自带强化ChatGPT的插件，使ChatGPT可以绘画、作曲
- 文本生成图像
- 文本生成视频
- 文本生成音乐
- 文本生成3d点云

## TODO

- 支持图片的上传和处理
- 支持音视频的上传和处理
- （其他）

## 快速安装

[安装使用的视频教程](https://www.bilibili.com/video/BV1nh411j7Au)

### Windows 系统

你可以通过双击项目中的 `webui.bat` **自动安装**和运行程序，你也可以自己手动安装：

1. 安装 [nodejs](https://nodejs.org) 
2. 安装 [git](https://git-scm.com/download/win).
3. 下载软件包：打开window命令行（windows + R 输入cmd后回车），执行命令 `git clone https://github.com/hku/aigc-webui.git`
4. 安装软件：进入刚下载的文件夹（`cd aigc-webui`），执行命令 `npm install`
5. 配置环境变量：拷贝软件包中的`.env.local.example`文件，将这个新文件命名为`.env.local`并放在当前文件夹，根据你需要使用的模型或服务，在`.env.local`填入相应的密钥, 密钥含义及免费申请链接见下表，建议全部申请。

| 环境变量               |  免费申请连接                  | 用途                                             |
| --------------------- | ------------------------------ | ------------------------------------------------------- |
| OPENAI_API_KEY        |   [openai](https://platform.openai.com/account/api-keys)     |用于调用openAI的官方接口 , gpt3-5及gpt3-5-enhanced模型需要使用该环境变量 |
| REPLICATE_API_TOKEN    | [replicate](https://replicate.com)       | 用于调用replicate上的各类模型接口，模型gpt3-5-enhanced,replicate-* 模型需要使用该环境变量 |
| BAIDU_TRANSLATE_APPID, BAIDU_TRANSLATE_SECRET  | [百度翻译API](http://api.fanyi.baidu.com/product/11)  | 用于调用百度翻译，translate 和  beautify 提示词优化器需要用到它们          |


6. 运行webui服务，打开浏览器界面
```
npm run dev
```
根据提示，在浏览器打开地址 [http://localhost:3000/zh](http://localhost:3000/zh)，即可使用

### Mac 系统

你可以通过在命令行执行 `sh webui_for_mac.sh` **自动安装**和运行程序，你也可以选择自己手动安装：

1. 安装 [nodejs](https://nodejs.org) 
2. 安装 [git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git).
3. 下载软件包，打开命令行，执行：`git clone https://github.com/hku/aigc-webui.git`
4. 安装软件，进入刚下载的文件夹（`cd aigc-webui`），执行： `npm install`
5. 配置环境变量，拷贝软件包中的`.env.local.example`文件，将这个新文件命名为`.env.local`并放在当前文件夹，根据你需要使用的模型或服务，在`.env.local`填入相应的密钥, 密钥含义及免费申请链接见下表，建议全部申请。

| 环境变量               |  免费申请连接                  | 用途                                             |
| --------------------- | ------------------------------ | ------------------------------------------------------- |
| OPENAI_API_KEY        |   <a href="https://platform.openai.com/account/api-keys" target="_blank">openai</a>     |用于调用openAI的官方接口 , gpt3-5及gpt3-5-enhanced模型需要使用该环境变量 |
| REPLICATE_API_TOKEN    |  <a href="https://replicate.com" target="_blank">replicate</a>       | 用于调用replicate上的各类模型接口，模型gpt3-5-enhanced,replicate-* 模型需要使用该环境变量 |
| BAIDU_TRANSLATE_APPID, BAIDU_TRANSLATE_SECRET  | <a href="http://api.fanyi.baidu.com/product/11" target="_blank">baidu翻译</a>  | 用于调用百度翻译，translate 和  beautify 提示词优化器需要用到它们          |

6. 运行webui服务，打开浏览器界面
```
npm run dev
```
根据提示，在浏览器打开地址 [http://localhost:3000/zh](http://localhost:3000/zh)，即可使用

## 插件开发

aigc-webui 有一个简单易用的插件系统，你可以根据自己的需求开发自己的模型代理，提示词预处理器等功能，详见 [开发指南](docs/Contributing.md)


## 致谢
- openai - https://github.com/openai/openai-cookbook
- Chatbot UI - https://github.com/mckaywrigley/chatbot-ui
- Nextjs - https://github.com/vercel/next.js
- Replicate - https://github.com/replicate/replicate-javascript
- Stable Diffusion - https://github.com/CompVis/stable-diffusion
- LlaMA - https://github.com/facebookresearch/llama
- (You)

## 联系作者

如果你对此项目有任何问题，欢迎联系我 (wx: digitalphysics)