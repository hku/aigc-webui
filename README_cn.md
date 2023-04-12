# AIGC-webui

[英文](./README.md)  [中文](./README_cn.md) 

这是一个用于AI创作的通用（extendable）浏览器操作界面。 例如：你可以通过它定制chatGPT的使用方式，也可以用来创作绘画和音乐...

![screenshot](screenshot.jpg)

## 功能特点
 
- 强化ChatGPT，使ChatGPT可以绘画、作曲
- 可切换的AI创作模型，例如ChatGPT，LLaMA，Stable Diffusion，Riffusion
- 可切换的提示词优化器，例如自动翻译，自动优化提示词（生成图画用）
- 可扩展的模型代理 （[开发教程](./Contribe.md)）
- 可扩展的提示词优化器（[开发教程](./Contribe.md)）
- 可定制的预置提示词
- 其他

## 快速安装

### Windows 系统
1. 安装 [nodejs](https://nodejs.org) 
2. 安装 [git](https://git-scm.com/download/win).
3. 下载软件包，打开window命令行（windows + R 输入cmd后回车），执行：`git clone https://github.com/hku/aigc-webui.git`
4. 安装软件，进入刚下载的文件夹（`cd aigc-webui`），执行： `npm install`
5. 配置环境变量，拷贝软件包中的`.env.local.example`文件，将这个新文件命名为`.env.local`并放在当前文件夹，根据你需要使用的模型服务，在`.env.local`填入相应的密钥, 密钥申请方式，详见教程：[doc/tutorial.md](doc/tutorial.md)

6. 运行webui服务，打开浏览器界面
```
npm run dev
```
根据提示，在浏览器打开地址 [http://localhost:3000/zh](http://localhost:3000/zh)，即可使用

### Mac/Linux 系统
1. 安装 [nodejs](https://nodejs.org) 
2. 安装 [git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git).
3. 下载软件包，打开命令行，执行：`git clone https://github.com/hku/aigc-webui.git`
4. 安装软件，进入刚下载的文件夹（`cd aigc-webui`），执行： `npm install`
5. 配置环境变量，拷贝软件包中的`.env.local.example`文件，将这个新文件命名为`.env.local`并放在当前文件夹，根据你需要使用的模型服务，在`.env.local`填入相应的密钥, 密钥申请方式，详见教程：[doc/tutorial.md](doc/tutorial.md)

6. 运行webui服务，打开浏览器界面
```
npm run dev
```
根据提示，在浏览器打开地址 [http://localhost:3000/zh](http://localhost:3000/zh)，即可使用

## 插件开发

aigc-webui 有一个简单易用的插件系统，你可以根据自己的需求开发自己模型代理，提示词预处理器等功能，详见 [插件开发](doc/tutorial.md)

## 贡献




