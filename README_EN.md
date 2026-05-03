<div align="center">

<img src="docs/tuprompt-logo.png" alt="TuPrompt Logo" width="96" />

# TuPrompt

**A Chrome extension that turns web images into AI-ready prompts**

*Source-available Chrome extension for generating AI image prompts from web images.*

**English** | [简体中文](README.md)

<br />

<img src="https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Manifest V3" />
<img src="https://img.shields.io/badge/License-Non--Commercial-black?style=flat-square" alt="Non-Commercial License" />
<img src="https://img.shields.io/badge/Status-Active-22c55e?style=flat-square" alt="Status Active" />
<img src="https://img.shields.io/badge/Focus-Pinterest%20%7C%20Prompt%20Workflow-7c3aed?style=flat-square" alt="Focus" />

</div>

---

> [!TIP]
> **TuPrompt** is built to shorten the path from *see image -> break it down -> write prompt* into a single right-click action.

## ✨ Overview

TuPrompt is a Chrome extension for analyzing images on the web and generating prompts that can be used with tools such as Midjourney, Stable Diffusion, DALL-E, and Adobe Firefly.

Its purpose is simple:

- help you generate usable prompts directly from inspiration images, product images, posters, and Pinterest content;
- reduce the time spent switching tools and manually describing visuals;
- make the workflow from “see image -> break it down -> write prompt” faster and smoother.

## 🖼️ Product Screenshots

<table>
<tr>
<td align="center" width="50%">
<strong>Loading State</strong><br /><br />
<img src="docs/tuprompt-screenshot-loading.jpg" alt="TuPrompt loading state on Pinterest" width="280" />
</td>
<td align="center" width="50%">
<strong>Result Popup</strong><br /><br />
<img src="docs/tuprompt-screenshot-result.jpg" alt="TuPrompt result popup on Pinterest" width="280" />
</td>
</tr>
</table>

## 🧩 Core Features

<table>
<tr>
<td width="50%" valign="top">

### Prompt Workflow

- right-click on web images to generate AI image prompts
- separate display for English prompts and Chinese annotations
- one-click copy for the English prompt, Chinese notes, or the full result

</td>
<td width="50%" valign="top">

### Image Compatibility

- works with sites such as Pinterest
- supports lazy-loaded images, high-resolution `srcset` images, and background images
- supports multiple model providers and API gateways

</td>
</tr>
</table>

## 🤖 Supported Model Entrypoints

`GPT-4o` `Claude` `Gemini` `Hailuo Minimax` `Doubao` `Zhipu GLM-4V` `Qwen VL` `Jeniya Gemini` `Custom API`

## 🚀 Usage

1. Enable Developer Mode in Chrome Extensions.
2. Choose “Load unpacked” and load this project folder.
3. Click the extension icon and configure the API key for the model you want to use.
4. Open any webpage and right-click an image.
5. Choose a model under the “TuPrompt” menu.
6. Copy the generated English prompt or Chinese annotation from the result popup.

## 🔄 Data Flow

TuPrompt does not use its own backend server. When the user explicitly triggers image analysis, the extension reads the selected image URL or image data from the current page and sends it to the selected third-party AI provider API. API keys are stored in Chrome extension storage and used only for requests to the chosen provider.

## 🛠️ Local Development

This is a native Chrome Manifest V3 extension with no build step. After changing code, reload the extension in Chrome Extensions to test it.

You can validate script syntax with:

```bash
node --check background/service-worker.js
node --check content/content.js
node --check popup/popup.js
```

## 📦 Packaging

Before packaging, make sure the repository does not include `.git`, temporary files, screenshots, or private API keys. The zip package should normally include:

- `manifest.json`
- `background/`
- `content/`
- `popup/`
- `icons/`

## 📜 License and Usage Scope

This repository uses a custom non-commercial source-available license.

- viewing, learning, forking, and modifying the code is allowed
- personal, educational, evaluation, and other non-commercial uses are allowed
- unauthorized commercial use is not allowed
- using this project or modified versions in paid products, paid services, white-label distributions, or other commercial contexts is not allowed

See `LICENSE` and `COMMERCIAL_USE.md` for details.

## ❤️ Support

If this project helps you, you can support ongoing maintenance and future improvements.

> Sponsorship or donation **does not** grant commercial rights or a commercial license.

<table>
<tr>
<td align="center" width="50%">
<strong>WeChat Pay</strong><br /><br />
<img src="docs/wechat-donate.png" alt="WeChat Pay QR Code" width="160" />
</td>
<td align="center" width="50%">
<strong>Alipay</strong><br /><br />
<img src="docs/alipay-donate.jpg" alt="Alipay QR Code" width="160" />
</td>
</tr>
</table>

See `SUPPORT.md` for more details.

## 🌍 Community

If you are building AI products for cross-border or global markets, you are welcome to join the community.

<table>
<tr>
<td align="center" width="50%">
<strong>Enterprise WeCom Group</strong><br /><br />
<img src="docs/community-wecom.jpg" alt="Enterprise WeCom Group QR Code" width="160" />
</td>
<td align="center" width="50%">
<strong>Direct Contact</strong><br /><br />
<img src="docs/personal-wechat-contact.png" alt="Personal WeChat Contact QR Code" width="160" />
</td>
</tr>
</table>

If you want to add Giien Global on WeChat for project-related communication, please include a short note about your purpose when sending the request.

See `COMMUNITY.md` for more details.

## 🔐 Privacy

See `PRIVACY_POLICY.md`. For Chrome Web Store publishing, the privacy policy must also be published at a publicly accessible URL and submitted in the developer console.
