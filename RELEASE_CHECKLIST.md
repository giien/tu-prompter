# Chrome Web Store 发布检查清单

## 代码检查

- [ ] `manifest.json` 中版本号已更新。
- [ ] 没有硬编码个人 API Key。
- [ ] 没有提交临时文件、测试截图或本地缓存。
- [ ] 没有提交 `dist/` 中的本地打包产物。
- [ ] 扩展能在 Chrome 扩展管理页正常加载。
- [ ] popup 能正常保存 API Key。
- [ ] 右键菜单能正常出现。
- [ ] 图片分析进度弹窗能正常显示。
- [ ] English Prompt、中文注释和复制按钮能正常工作。

## 命令检查

```bash
node --check background/service-worker.js
node --check content/content.js
node --check popup/popup.js
```

## 打包内容

zip 包建议只包含：

- `manifest.json`
- `background/`
- `content/`
- `popup/`
- `icons/`
- `README.md`（可选）
- `PRIVACY_POLICY.md`（可选，本地文件不能替代线上隐私政策 URL）

不要包含：

- `.git/`
- `.DS_Store`
- `dist/`
- `node_modules/`
- 测试图片
- 私人密钥
- 浏览器截图原图

## 商店资料

- [ ] 扩展名称
- [ ] 简短描述
- [ ] 详细描述
- [ ] 图标：16、32、48、128
- [ ] 至少 1 张商店截图
- [ ] 分类
- [ ] 语言
- [ ] 隐私政策 URL
- [ ] 权限用途说明
- [ ] 单一用途说明

## 隐私政策发布

Chrome Web Store 需要一个公开可访问的隐私政策 URL。可以选择：

- GitHub 仓库中的 `PRIVACY_POLICY.md`
- GitHub Pages
- Notion 公开页面
- 个人网站页面

隐私政策必须说明：

- 图片会发送给用户选择的第三方 AI 服务商。
- API Key 存在 Chrome 扩展存储中。
- 扩展不使用开发者自有服务器保存图片或 API Key。
- 用户可删除配置或卸载扩展。

## 审核风险点

- `<all_urls>` 权限较宽，需要在权限说明中明确只用于用户主动右键图片分析。
- `tabs` 和 `scripting` 权限需要说明用于展示结果弹窗和与当前页面通信。
- 第三方 API Key 需要说明由用户自行填写，扩展不提供模型服务。
- 图片发送到第三方服务商需要在隐私政策中明确披露。

## 发布后测试

- [ ] 从 Chrome Web Store 安装正式版。
- [ ] 测试普通图片网页。
- [ ] 测试 Pinterest 图片。
- [ ] 测试至少一个模型 API。
- [ ] 测试 API Key 删除后错误提示是否清晰。
- [ ] 测试复制按钮。
