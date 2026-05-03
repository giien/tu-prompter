# 图Prompter / TuPrompter

Source-available Chrome extension for generating AI image prompts from web images.

Non-commercial use only. See `LICENSE` for details.

**English** | **简体中文**

---

# 简体中文

## 项目介绍

图Prompter 是一个 Chrome 扩展，用于在网页图片上右键分析画面内容，并生成适合 Midjourney、Stable Diffusion、DALL-E、Adobe Firefly 等 AI 绘图工具使用的提示词。

它的目标很直接：

- 让你在浏览灵感图、商品图、海报图、Pinterest 图片时，直接生成可用的 AI 提示词
- 尽量减少来回切换工具和手工描述图片的时间
- 把“看图 -> 拆解 -> 写 Prompt”这件事变得更快、更顺手

## 核心功能

- 在网页图片上右键生成 AI 绘图提示词
- 支持英文 Prompt 和中文注释分区显示
- 支持一键复制英文 Prompt、中文注释或完整结果
- 支持多个视觉模型和 API 网关
- 支持自定义 OpenAI 兼容视觉 API
- 适配 Pinterest 等图片平台的懒加载图片、高清 `srcset` 图片和背景图

## 支持的模型入口

- GPT-4o
- Claude
- Gemini
- 海螺 Minimax
- 豆包 Doubao
- 智谱 GLM-4V
- 通义千问 VL
- Jeniya Gemini
- 自定义 API

## 使用方法

1. 在 Chrome 扩展管理页开启开发者模式。
2. 选择“加载已解压的扩展程序”，加载本项目目录。
3. 点击扩展图标，配置想使用的模型 API Key。
4. 打开任意网页，在图片上右键。
5. 选择“图Prompter”下的模型菜单，等待分析结果。
6. 在结果弹窗中复制英文 Prompt 或中文注释。

## 数据流说明

图Prompter 不使用自有服务器。扩展会在用户主动右键分析图片时，从当前网页获取图片地址或图片数据，并发送到用户选择的第三方 AI 服务商 API。API Key 保存在 Chrome 扩展存储中，用于向对应服务商发起请求。

## 本地开发

这是一个原生 Chrome Manifest V3 扩展，没有构建步骤。修改代码后，在 Chrome 扩展管理页点击“重新加载”即可测试。

可用以下命令检查脚本语法：

```bash
node --check background/service-worker.js
node --check content/content.js
node --check popup/popup.js
```

## 发布打包

发布前请确认不包含 `.git`、临时文件、测试截图、私有 API Key 等内容。建议打包时只包含：

- `manifest.json`
- `background/`
- `content/`
- `popup/`
- `icons/`

## 许可与使用范围

本仓库采用自定义的非商用源码许可。

- 允许查看、学习、Fork 和修改代码
- 允许个人用途、学习用途、评估用途和其他非商用用途
- 不允许未授权商用
- 不允许将本项目或其修改版用于收费产品、收费服务、白标分发或其他商业用途

详细条款请查看 `LICENSE` 和 `COMMERCIAL_USE.md`。

## 支持项目

如果这个项目对你有帮助，欢迎支持项目维护和后续更新。

赞助或捐赠不代表获得商用授权或商业许可。

### 微信赞赏

<img src="docs/wechat-donate.png" alt="WeChat Pay QR Code" width="180" />

### 支付宝赞赏

<img src="docs/alipay-donate.jpg" alt="Alipay QR Code" width="180" />

更完整的赞助说明请查看 `SUPPORT.md`。

## 社区交流群

欢迎跨境卖家、AI 产品开发者，以及对 AI 出海产品感兴趣的朋友加入交流群。

### 企业微信交流群

<img src="docs/community-wecom.jpg" alt="Enterprise WeCom Group QR Code" width="180" />

### 直接联系

如果你希望添加 Giien Global 的个人微信进行项目相关沟通，请在添加好友时备注来意。

<img src="docs/personal-wechat-contact.png" alt="Personal WeChat Contact QR Code" width="180" />

社区详情请查看 `COMMUNITY.md`。

## 隐私

请查看 `PRIVACY_POLICY.md`。上架 Chrome Web Store 时，需要将隐私政策发布到一个公开可访问的 URL，并填写到开发者后台。

---

# English

## Overview

TuPrompter is a Chrome extension for analyzing images on the web and generating prompts that can be used with tools such as Midjourney, Stable Diffusion, DALL-E, and Adobe Firefly.

Its purpose is simple:

- help you generate usable prompts directly from inspiration images, product images, posters, and Pinterest content;
- reduce the time spent switching tools and manually describing visuals;
- make the workflow from “see image -> break it down -> write prompt” faster and smoother.

## Core Features

- right-click on web images to generate AI image prompts
- separate display for English prompts and Chinese annotations
- one-click copy for the English prompt, Chinese notes, or the full result
- support for multiple vision model providers and API gateways
- support for custom OpenAI-compatible vision APIs
- support for lazy-loaded images, high-resolution `srcset` images, and background images on sites such as Pinterest

## Supported Model Entrypoints

- GPT-4o
- Claude
- Gemini
- Hailuo Minimax
- Doubao
- Zhipu GLM-4V
- Qwen VL
- Jeniya Gemini
- Custom API

## Usage

1. Enable Developer Mode in Chrome Extensions.
2. Choose “Load unpacked” and load this project folder.
3. Click the extension icon and configure the API key for the model you want to use.
4. Open any webpage and right-click an image.
5. Choose a model under the “图Prompter” menu.
6. Copy the generated English prompt or Chinese annotation from the result popup.

## Data Flow

TuPrompter does not use its own backend server. When the user explicitly triggers image analysis, the extension reads the selected image URL or image data from the current page and sends it to the selected third-party AI provider API. API keys are stored in Chrome extension storage and used only for requests to the chosen provider.

## Local Development

This is a native Chrome Manifest V3 extension with no build step. After changing code, reload the extension in Chrome Extensions to test it.

You can validate script syntax with:

```bash
node --check background/service-worker.js
node --check content/content.js
node --check popup/popup.js
```

## Packaging

Before packaging, make sure the repository does not include `.git`, temporary files, screenshots, or private API keys. The zip package should normally include:

- `manifest.json`
- `background/`
- `content/`
- `popup/`
- `icons/`

## License and Usage Scope

This repository uses a custom non-commercial source-available license.

- viewing, learning, forking, and modifying the code is allowed
- personal, educational, evaluation, and other non-commercial uses are allowed
- unauthorized commercial use is not allowed
- using this project or modified versions in paid products, paid services, white-label distributions, or other commercial contexts is not allowed

See `LICENSE` and `COMMERCIAL_USE.md` for details.

## Support

If this project helps you, you can support ongoing maintenance and future improvements.

Sponsorship or donation does not grant commercial rights or a commercial license.

### WeChat Pay

<img src="docs/wechat-donate.png" alt="WeChat Pay QR Code" width="180" />

### Alipay

<img src="docs/alipay-donate.jpg" alt="Alipay QR Code" width="180" />

See `SUPPORT.md` for more details.

## Community

If you are building AI products for cross-border or global markets, you are welcome to join the community.

### Enterprise WeCom Group

<img src="docs/community-wecom.jpg" alt="Enterprise WeCom Group QR Code" width="180" />

### Direct Contact

If you want to add Giien Global on WeChat for project-related communication, please include a short note about your purpose when sending the request.

<img src="docs/personal-wechat-contact.png" alt="Personal WeChat Contact QR Code" width="180" />

See `COMMUNITY.md` for more details.

## Privacy

See `PRIVACY_POLICY.md`. For Chrome Web Store publishing, the privacy policy must also be published at a publicly accessible URL and submitted in the developer console.
