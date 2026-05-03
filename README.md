# 图Prompter

Source-available Chrome extension for generating AI image prompts from web images.

Non-commercial use only. See `LICENSE` for details.

图Prompter 是一个 Chrome 扩展，用于在网页图片上右键分析画面内容，并生成适合 Midjourney、Stable Diffusion、DALL-E、Adobe Firefly 等 AI 绘图工具使用的提示词。

## 功能

- 在网页图片上右键生成 AI 绘图提示词
- 支持英文 Prompt 和中文注释分区显示
- 支持一键复制英文 Prompt、中文注释或完整结果
- 支持多个视觉模型和 API 网关
- 支持自定义 OpenAI 兼容视觉 API
- 适配 Pinterest 等图片平台的懒加载图片、高清 srcset 图片和背景图

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

发布前请确认不包含 `.git`、临时文件、测试截图、私有 API Key 等内容。可将以下文件和目录打包为 zip：

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

## Support / 支持项目

If this project helps you, you can support ongoing maintenance and future improvements.

Sponsorship or donation does not grant commercial rights or a commercial license.

### WeChat Pay / 微信赞赏

![WeChat Pay QR Code](docs/wechat-donate.png)

### Alipay / 支付宝赞赏

![Alipay QR Code](docs/alipay-donate.jpg)

See `SUPPORT.md` for more details.

如果这个项目对你有帮助，欢迎支持项目维护和后续更新。

赞助或捐赠不代表获得商用授权或商业许可。

更完整的赞助说明请查看 `SUPPORT.md`。

## Community / 社区交流群

If you are building AI products for cross-border or global markets, you are welcome to join the community.

欢迎跨境卖家、AI 产品开发者，以及对 AI 出海产品感兴趣的朋友加入交流群。

### Enterprise WeCom Group / 企业微信交流群

![Enterprise WeCom Group QR Code](docs/community-wecom.jpg)

### Direct Contact / 直接联系

If you want to add Giien Global on WeChat for project-related communication, please include a short note about your purpose when sending the request.

如果你希望添加 Giien Global 的个人微信进行项目相关沟通，请在添加好友时备注来意。

![Personal WeChat Contact QR Code](docs/personal-wechat-contact.png)

Community details: `COMMUNITY.md`

社区详情：`COMMUNITY.md`

## 隐私

请查看 `PRIVACY_POLICY.md`。上架 Chrome Web Store 时，需要将隐私政策发布到一个公开可访问的 URL，并填写到开发者后台。
