# Chrome Web Store 发布文案

## 扩展名称

图Prompter

## 简短描述

右键网页图片，用 AI 生成英文绘图 Prompt 和中文注释。

## 详细描述

图Prompter 是一个面向设计师、AI 绘图用户和内容创作者的 Chrome 扩展。你可以在 Pinterest、设计灵感网站、电商页面或普通网页图片上右键，选择 AI 模型分析图片，并生成可直接用于 Midjourney、Stable Diffusion、DALL-E、Adobe Firefly 等工具的英文 Prompt。

扩展会同时生成中文注释，帮助你理解图片的主体、构图、色彩、光影、风格和适用场景。

核心功能：

- 右键图片快速生成 AI 绘图提示词
- 输出英文 Prompt 和中文注释
- 一键复制英文 Prompt、中文注释或完整结果
- 支持 Pinterest 等图片网站的懒加载图片和高清图片识别
- 支持多种模型入口：GPT-4o、Claude、Gemini、Minimax、豆包、智谱、通义、Jeniya
- 支持自定义 OpenAI 兼容视觉 API
- API Key 保存在本地浏览器扩展存储中

使用方法：

1. 点击扩展图标，配置模型 API Key。
2. 在网页图片上点击右键。
3. 选择“图Prompter”下的模型。
4. 等待 AI 分析图片。
5. 复制英文 Prompt 或中文注释。

隐私说明：

图Prompter 不运营自有服务器。只有当你主动右键分析图片时，扩展才会把图片发送到你选择的 AI 服务商或自定义 API Endpoint。API Key 保存在 Chrome 扩展存储中，不会发送到开发者服务器。

## 分类建议

生产力工具 / 设计工具

## 关键词建议

AI prompt, image prompt, Midjourney, Stable Diffusion, Pinterest, image analysis, AI drawing, prompt generator, design inspiration, 图片提示词, AI绘图

## 权限理由

### storage

用于保存用户配置的 API Key、默认模型和自定义 API Endpoint。

### contextMenus

用于在图片右键菜单中显示“图Prompter”分析入口。

### activeTab

用于访问用户当前主动操作的标签页，获取右键图片上下文。

### tabs

用于向当前标签页发送分析进度和结果弹窗消息。

### scripting

用于在网页没有可用内容脚本时注入脚本，以显示进度和结果弹窗。

### host permissions / all urls

用于在不同网站上识别用户右键的图片，并请求图片内容以发送给用户选择的 AI 服务商分析。扩展不会自动分析网页内容，只有用户主动右键触发时才处理图片。

## 截图建议

- 扩展设置页，展示模型 API Key 配置。
- 在 Pinterest 或图片网页右键打开菜单。
- 生成中的进度弹窗。
- 生成结果弹窗，展示 English Prompt、中文注释和复制按钮。

## 隐私问卷建议

如果 Chrome Web Store 要求填写数据使用类型，可按实际情况选择：

- Web browsing activity：仅用于识别用户主动右键的图片上下文。
- User activity：仅限用户主动点击右键菜单触发的操作。
- Authentication information：API Key 保存在本地扩展存储中，用于请求第三方 AI 服务商。
- Website content：用户主动选择的图片会发送给用户选择的 AI 服务商。

不要勾选“出售数据”或“用于广告追踪”，因为当前扩展不做这些行为。
