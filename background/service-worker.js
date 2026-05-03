const PROMPT_INSTRUCTION = 'You are an expert at analyzing images and generating detailed, professional prompts for AI image generation tools like Midjourney, Stable Diffusion, DALL-E, and Adobe Firefly. Analyze this image and return exactly two sections. Section 1 must start with "English Prompt:" and contain a single polished English prompt ready to copy directly into Midjourney or Stable Diffusion. Include subject, composition, lighting, style, mood, colors, camera angle, materials, background, and technical specs. Section 2 must start with "中文注释:" and explain in Chinese the key visual elements, style, color palette, composition, and suggested usage. Do not use markdown tables. Keep both sections concise but detailed.';
const JENIYA_PROMPT_INSTRUCTION = 'Analyze this image. Output exactly two concise sections: "English Prompt:" with one copy-ready AI image prompt in English, then "中文注释:" with a short Chinese explanation of subject, style, colors, composition, and usage. No markdown.';
const DEFAULT_IMAGE_MIME = 'image/jpeg';
const DEFAULT_MODEL_KEY = 'gpt4o';
const QUICK_MENU_ID = 'analyze-with-default-model';
const SELECT_REGION_MENU_ID = 'select-region-with-default-model';
const CUSTOM_MODEL_KEY = 'custom';
const DEFAULT_MINIMAX_ENDPOINT = 'https://api.minimaxi.com/anthropic/v1/messages';
const DEFAULT_MINIMAX_MODEL = 'MiniMax-M2.7';
const DEFAULT_JENIYA_ENDPOINT = 'https://jeniya.cn/v1beta/models/gemini-2.5-pro:generateContent';
const JPEG_MIME = 'image/jpeg';
const HISTORY_LIMIT = 20;
const TEST_IMAGE_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/axQz7sAAAAASUVORK5CYII=';

const PROMPT_TEMPLATE_HINTS = {
  general: 'Focus on a balanced, reusable prompt for general AI image generation.',
  ecommerce: 'Optimize for premium e-commerce product photography, clean layout, brand presentation, materials, packaging, lighting, and commercial usability.',
  poster: 'Optimize for poster, campaign, key visual, and social media creative direction. Emphasize layout, typography space, visual hierarchy, mood, and marketing impact.',
  interior: 'Optimize for interior design and architectural visualization. Emphasize room type, materials, lighting, furniture, spatial layout, and atmosphere.',
  character: 'Optimize for character design. Emphasize character identity, outfit, pose, expression, silhouette, accessories, environment, and concept art style.',
  ui: 'Optimize for UI and app/web design inspiration. Emphasize layout, components, hierarchy, spacing, color system, interaction feel, and product style.'
};

const MODELS = {
  gpt4o: {
    name: 'GPT-4o',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    body: (imagePayload) => ({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { type: 'image_url', image_url: { url: imagePayload.dataUrl, detail: 'high' } }
        ]
      }],
      max_tokens: 800
    }),
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.choices?.[0]?.message?.content || ''
  },
  claude: {
    name: 'Claude 3.5',
    endpoint: 'https://api.anthropic.com/v1/messages',
    body: (imagePayload) => ({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: imagePayload.mimeType, data: imagePayload.base64 } },
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION }
        ]
      }]
    }),
    headers: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.content?.[0]?.text || ''
  },
  gemini: {
    name: 'Gemini 2.0',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    body: (imagePayload) => ({
      contents: [{
        parts: [
          { text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { inlineData: { mimeType: imagePayload.mimeType, data: imagePayload.base64 } }
        ]
      }],
      generationConfig: { maxOutputTokens: 800 }
    }),
    headers: () => ({ 'Content-Type': 'application/json' }),
    queryKey: (key) => `?key=${key}`,
    parse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  },
  hailuo: {
    name: '海螺 (Minimax)',
    endpoint: (_apiKey, customModel = {}) => customModel.endpoint || DEFAULT_MINIMAX_ENDPOINT,
    body: (imagePayload, customModel = {}) => ({
      model: customModel.model || DEFAULT_MINIMAX_MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { type: 'image', source: { type: 'base64', media_type: imagePayload.mimeType, data: imagePayload.base64 } }
        ]
      }]
    }),
    headers: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.content?.[0]?.text || ''
  },
  doubao: {
    name: '豆包 (Doubao)',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    body: (imagePayload) => ({
      model: 'doubao-视觉-越域版-20250603',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { type: 'image_url', image_url: { url: imagePayload.dataUrl } }
        ]
      }],
      max_tokens: 800
    }),
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.choices?.[0]?.message?.content || ''
  },
  zhipu: {
    name: '智谱 GLM-4V',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/images/analysis',
    body: (imagePayload) => ({
      model: 'glm-4v-plus',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { type: 'image_url', image_url: { url: imagePayload.dataUrl } }
        ]
      }]
    }),
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.choices?.[0]?.message?.content || ''
  },
  qwen: {
    name: '通义千问 VL',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    body: (imagePayload) => ({
      model: 'qwen-vl-plus',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { type: 'image_url', image_url: { url: imagePayload.dataUrl } }
        ]
      }],
      max_tokens: 800
    }),
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.choices?.[0]?.message?.content || ''
  },
  jeniya: {
    name: 'Jeniya Gemini',
    endpoint: DEFAULT_JENIYA_ENDPOINT,
    body: (imagePayload) => ({
      contents: [{
        role: 'user',
        parts: [
          { inline_data: { mime_type: imagePayload.mimeType, data: imagePayload.base64 } },
          { text: imagePayload.promptInstruction || JENIYA_PROMPT_INSTRUCTION }
        ]
      }],
      generationConfig: {
        responseModalities: ['TEXT']
      }
    }),
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    queryKey: (key) => `?key=${encodeURIComponent(key)}`,
    parse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  },
  custom: {
    name: '自定义 API',
    endpoint: (_apiKey, customModel = {}) => customModel.endpoint || '',
    body: (imagePayload, customModel = {}) => ({
      model: customModel.model || '',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: imagePayload.promptInstruction || PROMPT_INSTRUCTION },
          { type: 'image_url', image_url: { url: imagePayload.dataUrl } }
        ]
      }],
      max_tokens: 800
    }),
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }),
    parse: (data) => data.choices?.[0]?.message?.content || ''
  }
};

const MODEL_MENU_ITEMS = [
  { id: 'gpt4o', title: '用 GPT-4o 生成提示词' },
  { id: 'claude', title: '用 Claude 生成提示词' },
  { id: 'gemini', title: '用 Gemini 生成提示词' },
  { id: 'hailuo', title: '用海螺生成提示词' },
  { id: 'doubao', title: '用豆包生成提示词' },
  { id: 'zhipu', title: '用智谱生成提示词' },
  { id: 'qwen', title: '用通义生成提示词' },
  { id: 'jeniya', title: '用 Jeniya Gemini 生成提示词' },
  { id: 'custom', title: '用自定义 API 生成提示词' }
];

async function ensureContextMenus() {
  await removeAllContextMenus();

  chrome.contextMenus.create({
    id: 'image-prompter-root',
    title: 'TuPrompt',
    contexts: ['page', 'image', 'link']
  });

  chrome.contextMenus.create({
    id: QUICK_MENU_ID,
    parentId: 'image-prompter-root',
    title: '用默认模型快速生成提示词',
    contexts: ['image', 'link']
  });

  chrome.contextMenus.create({
    id: SELECT_REGION_MENU_ID,
    parentId: 'image-prompter-root',
    title: '框选区域生成提示词',
    contexts: ['page', 'image', 'link']
  });

  chrome.contextMenus.create({
    id: 'image-prompter-separator',
    parentId: 'image-prompter-root',
    type: 'separator',
    contexts: ['page', 'image', 'link']
  });

  MODEL_MENU_ITEMS.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: 'image-prompter-root',
      title: item.title,
      contexts: ['image', 'link']
    });
  });
}

function removeAllContextMenus() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      resolve();
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureContextMenus().catch((error) => {
    console.error('[TuPrompt] 初始化右键菜单失败:', error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  ensureContextMenus().catch((error) => {
    console.error('[TuPrompt] 恢复右键菜单失败:', error);
  });
});

async function getContextTarget(tabId) {
  if (!tabId) return null;

  try {
    return await sendTabMessage(tabId, { type: 'getContextTarget' });
  } catch (error) {
    console.error('[TuPrompt] 获取右键目标失败:', error);
    return null;
  }
}

async function resolveImageUrl(info, tabId) {
  if (info.srcUrl) {
    return info.srcUrl;
  }

  const target = await getContextTarget(tabId);
  if (target?.imageUrl) {
    return target.imageUrl;
  }

  if (target?.linkUrl && isLikelyImageUrl(target.linkUrl)) {
    return target.linkUrl;
  }

  if (info.linkUrl && isLikelyImageUrl(info.linkUrl)) {
    return info.linkUrl;
  }

  return '';
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuItemId = String(info.menuItemId);
  if (menuItemId !== QUICK_MENU_ID && menuItemId !== SELECT_REGION_MENU_ID && !MODELS[menuItemId]) return;
  if (!tab?.id) return;

  if (menuItemId === SELECT_REGION_MENU_ID) {
    handleSelectRegionClick(tab.id, menuItemId).catch((error) => {
      console.error('[TuPrompt] 启动框选失败:', error);
    });
    return;
  }

  handleMenuClick(info, tab.id, menuItemId).catch((error) => {
    console.error('[TuPrompt] 右键分析失败:', error);
  });
});

async function handleSelectRegionClick(tabId, menuItemId) {
  const modelKey = await resolveModelKey(menuItemId);
  const model = MODELS[modelKey];
  await sendTabUiMessage(tabId, {
    type: 'startRegionSelect',
    model: model.name,
    modelKey
  });
}

async function handleMenuClick(info, tabId, menuItemId) {
  const modelKey = await resolveModelKey(menuItemId);
  const model = MODELS[modelKey];

  await sendTabUiMessage(tabId, {
    type: 'showLoading',
    imageUrl: info.srcUrl || '',
    model: model.name,
    message: '正在识别右键图片，请稍候...'
  }).catch((error) => {
    console.error('[TuPrompt] 无法显示初始进度:', error);
  });

  const imageUrl = await resolveImageUrl(info, tabId);

  if (!imageUrl) {
    sendTabUiMessage(tabId, {
      type: 'showResult',
      imageUrl: '',
      model: model.name,
      error: '当前右键目标不是可解析的图片。请尽量右键图片本体，或点开大图后再试。'
    }).catch(() => {});
    return;
  }

  sendTabUiMessage(tabId, {
    type: 'showLoading',
    imageUrl,
    model: model.name,
    message: '正在抓取图片并生成提示词，请稍候...'
  }).catch(() => {});

  const result = await requestModelPrompt(imageUrl, modelKey);
  if (result.prompt) {
    await savePromptHistory({
      imageUrl,
      model: model.name,
      modelKey,
      prompt: result.prompt,
      templateKey: result.templateKey
    }).catch((error) => {
      console.error('[TuPrompt] 保存历史记录失败:', error);
    });
  }
  sendTabUiMessage(tabId, {
    type: 'showResult',
    imageUrl,
    ...result,
    model: model.name
  }).catch((error) => {
    console.error('[TuPrompt] 无法发送结果到页面:', error);
  });
}

async function resolveModelKey(menuItemId) {
  if (menuItemId !== QUICK_MENU_ID && menuItemId !== SELECT_REGION_MENU_ID) {
    return menuItemId;
  }

  const config = await chrome.storage.sync.get(['selectedModel']);
  return MODELS[config.selectedModel] ? config.selectedModel : DEFAULT_MODEL_KEY;
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(response);
    });
  });
}

async function sendTabUiMessage(tabId, message) {
  try {
    return await sendTabMessage(tabId, message);
  } catch (error) {
    await injectContentScript(tabId);
    return sendTabMessage(tabId, message);
  }
}

async function injectContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/content.js']
  });
}

function buildErrorMessage(name, status, errorText) {
  return `${name} 失败 (${status})\n${(errorText || '').slice(0, 200)}`;
}

function extractTextFromModelResponse(data) {
  const directCandidates = [
    data?.output_text,
    data?.result,
    data?.reply,
    data?.text,
    data?.message?.content,
    data?.choices?.[0]?.message?.content,
    data?.choices?.[0]?.text,
    data?.choices?.[0]?.delta?.content,
    data?.content?.[0]?.text,
    data?.candidates?.[0]?.content?.parts?.[0]?.text,
    data?.data?.choices?.[0]?.message?.content,
    data?.data?.message?.content,
    data?.data?.text
  ];

  for (const candidate of directCandidates) {
    const text = normalizeResponseText(candidate);
    if (text) return text;
  }

  return findFirstTextValue(data);
}

function normalizeResponseText(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeResponseText(item?.text || item?.content || item))
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  return '';
}

function findFirstTextValue(value, depth = 0) {
  if (!value || depth > 4) {
    return '';
  }

  if (typeof value === 'string') {
    const text = value.trim();
    return text.length > 20 ? text : '';
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = findFirstTextValue(item, depth + 1);
      if (text) return text;
    }
    return '';
  }

  if (typeof value === 'object') {
    for (const key of ['content', 'text', 'answer', 'result', 'reply', 'message', 'output']) {
      const text = findFirstTextValue(value[key], depth + 1);
      if (text) return text;
    }
  }

  return '';
}

function getResponsePreview(data) {
  try {
    return JSON.stringify(data).slice(0, 500);
  } catch (_error) {
    return '';
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function captureVisibleTab(windowId) {
  return chrome.tabs.captureVisibleTab(windowId, {
    format: 'png'
  });
}

async function cropScreenshotDataUrl(dataUrl, rect, viewport) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const scaleX = bitmap.width / Math.max(1, viewport.width);
  const scaleY = bitmap.height / Math.max(1, viewport.height);
  const sourceX = Math.max(0, Math.round(rect.x * scaleX));
  const sourceY = Math.max(0, Math.round(rect.y * scaleY));
  const sourceWidth = Math.max(1, Math.min(bitmap.width - sourceX, Math.round(rect.width * scaleX)));
  const sourceHeight = Math.max(1, Math.min(bitmap.height - sourceY, Math.round(rect.height * scaleY)));

  const canvas = new OffscreenCanvas(sourceWidth, sourceHeight);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
  bitmap.close?.();

  const croppedBlob = await canvas.convertToBlob({
    type: JPEG_MIME,
    quality: 0.92
  });
  const payload = await blobToPayload(croppedBlob, JPEG_MIME);
  return payload.dataUrl;
}

function buildPromptInstruction(templateKey = 'general', options = {}) {
  const baseInstruction = options.compact ? JENIYA_PROMPT_INSTRUCTION : PROMPT_INSTRUCTION;
  const templateHint = PROMPT_TEMPLATE_HINTS[templateKey] || PROMPT_TEMPLATE_HINTS.general;
  return `${baseInstruction}\n\nTemplate focus: ${templateHint}`;
}

function parsePromptSections(rawPrompt) {
  const normalized = String(rawPrompt || '').trim();
  const englishMatch = normalized.match(/English Prompt\s*[:：]\s*([\s\S]*?)(?=\n\s*(?:中文注释|Chinese Notes|中文说明)\s*[:：]|$)/i);
  const chineseMatch = normalized.match(/(?:中文注释|Chinese Notes|中文说明)\s*[:：]\s*([\s\S]*)/i);

  return {
    englishPrompt: (englishMatch?.[1] || normalized).trim(),
    chineseNotes: (chineseMatch?.[1] || '').trim()
  };
}

async function savePromptHistory(entry) {
  if (!entry.prompt) return;

  const config = await chrome.storage.local.get(['promptHistory']);
  const history = Array.isArray(config.promptHistory) ? config.promptHistory : [];
  const parsed = parsePromptSections(entry.prompt);
  const nextEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    imageUrl: entry.imageUrl,
    model: entry.model,
    modelKey: entry.modelKey,
    templateKey: entry.templateKey,
    prompt: entry.prompt,
    englishPrompt: parsed.englishPrompt,
    chineseNotes: parsed.chineseNotes
  };

  await chrome.storage.local.set({
    promptHistory: [nextEntry, ...history].slice(0, HISTORY_LIMIT)
  });
}

function isLikelyImageUrl(url) {
  return (
    /^data:image\//i.test(url) ||
    /^blob:/i.test(url) ||
    /\.(avif|bmp|gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(url) ||
    /\/(originals|736x|564x|474x|236x)\//i.test(url) ||
    /pinimg\.com/i.test(url)
  );
}

function dataUrlToPayload(dataUrl) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.*)$/);
  if (!match) {
    throw new Error('暂不支持非 base64 格式的 data URL 图片');
  }

  return {
    mimeType: match[1] || DEFAULT_IMAGE_MIME,
    base64: match[2],
    dataUrl
  };
}

async function blobToPayload(blob, preferredMimeType = '') {
  const mimeType = preferredMimeType || blob.type || DEFAULT_IMAGE_MIME;
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const base64 = btoa(binary);
  return {
    mimeType,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`
  };
}

async function convertImageBlobToJpeg(blob) {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') {
    return blob;
  }

  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return canvas.convertToBlob({ type: JPEG_MIME, quality: 0.92 });
}

async function imageUrlToPayload(imageUrl, options = {}) {
  if (/^data:image\//i.test(imageUrl)) {
    return dataUrlToPayload(imageUrl);
  }

  if (/^blob:/i.test(imageUrl)) {
    throw new Error('当前图片是页面内 blob 地址，扩展后台无法直接读取。请点开原图或在图片直链上右键再试。');
  }

  const response = await fetch(imageUrl, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`图片抓取失败 (${response.status}) ${body.slice(0, 120)}`.trim());
  }

  const blob = await response.blob();
  let imageBlob = blob;
  let mimeType = blob.type || DEFAULT_IMAGE_MIME;
  if (mimeType && !mimeType.startsWith('image/')) {
    throw new Error(`图片地址返回的不是图片内容 (${mimeType})，请点开大图后重试。`);
  }

  if (options.convertToJpeg && mimeType !== JPEG_MIME) {
    try {
      imageBlob = await convertImageBlobToJpeg(blob);
      mimeType = JPEG_MIME;
    } catch (error) {
      console.warn('[TuPrompt] 图片转 JPEG 失败，继续使用原图:', error);
    }
  }

  return blobToPayload(imageBlob, mimeType);
}

async function requestModelPrompt(imageUrl, modelKey, options = {}) {
  const config = await chrome.storage.sync.get(['apiKeys', 'customModel', 'minimaxModel', 'promptTemplate']);
  const model = MODELS[modelKey];
  const apiKey = config.apiKeys?.[modelKey];
  const customModel = config.customModel || {};
  const providerModel = modelKey === 'hailuo' ? (config.minimaxModel || {}) : customModel;
  const templateKey = options.promptTemplate || config.promptTemplate || 'general';

  if (!model) return { error: `未知模型: ${modelKey}` };
  if (!apiKey) return { error: `请先配置 ${model.name} 的 API Key（点击插件图标设置）` };
  if (modelKey === CUSTOM_MODEL_KEY) {
    if (!customModel.endpoint) return { error: '请先配置自定义 API Endpoint（点击插件图标设置）' };
    if (!customModel.model) return { error: '请先配置自定义 API 模型名（点击插件图标设置）' };
  }

  try {
    const imagePayload = await imageUrlToPayload(imageUrl, {
      convertToJpeg: modelKey === 'hailuo'
    });
    imagePayload.promptInstruction = buildPromptInstruction(templateKey, {
      compact: modelKey === 'jeniya'
    });
    const endpoint = typeof model.endpoint === 'function'
      ? model.endpoint(apiKey, providerModel)
      : model.endpoint;
    const url = endpoint + (model.queryKey ? model.queryKey(apiKey) : '');
    const resp = await fetch(url, {
      method: 'POST',
      headers: model.headers(apiKey),
      body: JSON.stringify(model.body(imagePayload, providerModel))
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return { error: buildErrorMessage(model.name, resp.status, errText) };
    }

    const data = await resp.json();
    const prompt = model.parse(data) || extractTextFromModelResponse(data);
    if (!prompt) {
      const preview = getResponsePreview(data);
      const finishReason = data?.candidates?.[0]?.finishReason;
      const thoughtsTokens = data?.usageMetadata?.thoughtsTokenCount;
      if (finishReason === 'MAX_TOKENS' && thoughtsTokens) {
        return {
          error: `${model.name} 图片已传入，但输出额度被模型思考消耗完了。已按 Apifox 请求结构精简提示词，请重新加载扩展后再试。\n\n原始返回预览：${preview}`
        };
      }
      return {
        error: `${model.name} 未返回有效结果${preview ? `\n\n原始返回预览：${preview}` : ''}`
      };
    }

    return { prompt: prompt.trim(), model: model.name, modelKey, templateKey };
  } catch (err) {
    return { error: `网络错误: ${err.message}` };
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'analyzeImage') {
    handleAnalyze(msg.imageUrl, msg.modelKey).then(sendResponse);
    return true;
  }

  if (msg.type === 'testModel') {
    handleTestModel(msg.modelKey).then(sendResponse);
    return true;
  }

  if (msg.type === 'analyzeSelection') {
    handleAnalyzeSelection(msg, _sender).then(sendResponse);
    return true;
  }
});

async function handleAnalyze(imageUrl, requestedModelKey) {
  const config = await chrome.storage.sync.get(['apiKeys', 'selectedModel', 'promptTemplate']);
  const modelKey = MODELS[requestedModelKey] ? requestedModelKey : (MODELS[config.selectedModel] ? config.selectedModel : DEFAULT_MODEL_KEY);
  const result = await requestModelPrompt(imageUrl, modelKey, {
    promptTemplate: config.promptTemplate || 'general'
  });

  if (result.prompt) {
    await savePromptHistory({
      imageUrl,
      model: MODELS[modelKey].name,
      modelKey,
      prompt: result.prompt,
      templateKey: result.templateKey
    }).catch((error) => {
      console.error('[TuPrompt] 保存历史记录失败:', error);
    });
  }

  return {
    ...result,
    model: MODELS[modelKey].name,
    modelKey
  };
}

async function handleAnalyzeSelection(msg, sender) {
  const tab = sender.tab;
  if (!tab?.id || !tab.windowId) {
    return { error: '无法获取当前标签页，框选分析失败。' };
  }

  const config = await chrome.storage.sync.get(['selectedModel', 'promptTemplate']);
  const modelKey = MODELS[msg.modelKey] ? msg.modelKey : (MODELS[config.selectedModel] ? config.selectedModel : DEFAULT_MODEL_KEY);
  const model = MODELS[modelKey];

  try {
    // Wait for the selection overlay to be removed and painted out before capturing.
    await wait(180);
    const screenshot = await captureVisibleTab(tab.windowId);
    const imageUrl = await cropScreenshotDataUrl(screenshot, msg.rect, msg.viewport);

    await sendTabUiMessage(tab.id, {
      type: 'showLoading',
      imageUrl,
      model: model.name,
      modelKey,
      message: '正在生成框选区域提示词，请稍候...'
    }).catch(() => {});

    const result = await requestModelPrompt(imageUrl, modelKey, {
      promptTemplate: config.promptTemplate || 'general'
    });

    if (result.prompt) {
      await savePromptHistory({
        imageUrl,
        model: model.name,
        modelKey,
        prompt: result.prompt,
        templateKey: result.templateKey
      }).catch((error) => {
        console.error('[TuPrompt] 保存框选历史失败:', error);
      });
    }

    await sendTabUiMessage(tab.id, {
      type: 'showResult',
      imageUrl,
      ...result,
      model: model.name,
      modelKey
    }).catch(() => {});

    return { ok: true };
  } catch (error) {
    await sendTabUiMessage(tab.id, {
      type: 'showResult',
      imageUrl: '',
      model: model.name,
      modelKey,
      error: `框选区域分析失败: ${error.message}`
    }).catch(() => {});

    return { error: error.message };
  }
}

async function handleTestModel(requestedModelKey) {
  const config = await chrome.storage.sync.get(['selectedModel', 'promptTemplate']);
  const modelKey = MODELS[requestedModelKey] ? requestedModelKey : (MODELS[config.selectedModel] ? config.selectedModel : DEFAULT_MODEL_KEY);
  const result = await requestModelPrompt(TEST_IMAGE_DATA_URL, modelKey, {
    promptTemplate: config.promptTemplate || 'general'
  });

  if (result.error) {
    return {
      ok: false,
      model: MODELS[modelKey].name,
      error: result.error
    };
  }

  return {
    ok: true,
    model: MODELS[modelKey].name,
    message: `${MODELS[modelKey].name} 连接成功`
  };
}
