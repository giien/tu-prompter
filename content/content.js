(function () {
  if (window.__imagePrompterContentLoaded) {
    return;
  }
  window.__imagePrompterContentLoaded = true;

  let currentPopup = null;
  let escHandler = null;
  let lastContextTarget = null;
  let lastPointer = { x: 0, y: 0 };
  const STYLE_ID = 'ip-style-tag';
  const REGION_OVERLAY_ID = 'ip-region-overlay';
  const COPY_RESET_DELAY = 2000;
  const RESULT_MODELS = [
    { id: 'gpt4o', name: 'GPT-4o' },
    { id: 'claude', name: 'Claude' },
    { id: 'gemini', name: 'Gemini' },
    { id: 'hailuo', name: '海螺' },
    { id: 'doubao', name: '豆包' },
    { id: 'zhipu', name: '智谱' },
    { id: 'qwen', name: '通义' },
    { id: 'jeniya', name: 'Jeniya Gemini' },
    { id: 'custom', name: '自定义 API' }
  ];

  document.addEventListener('pointermove', (event) => {
    lastPointer = { x: event.clientX, y: event.clientY };
  }, true);

  document.addEventListener('contextmenu', (event) => {
    lastPointer = { x: event.clientX, y: event.clientY };
    lastContextTarget = extractContextTarget(event);
  }, true);

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'showLoading') {
      showPopup(msg.imageUrl, '', msg.model, '', true, msg.message);
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'showResult') {
      showPopup(msg.imageUrl, msg.prompt, msg.model, msg.error, false, '', msg.modelKey);
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'getContextTarget') {
      sendResponse(lastContextTarget || getTargetFromPointer());
      return true;
    }

    if (msg.type === 'startRegionSelect') {
      startRegionSelect(msg.modelKey, msg.model);
      sendResponse({ ok: true });
      return;
    }
  });

  function extractContextTarget(event) {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const elements = path.filter((node) => node instanceof Element);
    const target = event.target instanceof Element ? event.target : null;
    const candidates = uniqueElements(target ? [target, ...elements] : elements);

    for (const element of candidates) {
      const imageInfo = getImageInfoFromElement(element);
      if (imageInfo) {
        return imageInfo;
      }
    }

    return {
      imageUrl: '',
      pageUrl: location.href
    };
  }

  function getTargetFromPointer() {
    const element = document.elementFromPoint(lastPointer.x, lastPointer.y);
    if (!(element instanceof Element)) {
      return {
        imageUrl: '',
        pageUrl: location.href
      };
    }

    return getImageInfoFromElement(element) || {
      imageUrl: '',
      pageUrl: location.href
    };
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements.filter(Boolean)));
  }

  function getImageInfoFromElement(element) {
    if (element.matches('img')) {
      return {
        imageUrl: getBestImageUrl(element),
        pageUrl: location.href
      };
    }

    const directImageUrl = getImageUrlFromAttributes(element);
    if (directImageUrl) {
      return {
        imageUrl: directImageUrl,
        pageUrl: location.href
      };
    }

    const imageElement = findNearestImage(element);
    if (imageElement) {
      return {
        imageUrl: getBestImageUrl(imageElement),
        pageUrl: location.href
      };
    }

    const bgImage = extractBackgroundImage(element);
    if (bgImage) {
      return {
        imageUrl: bgImage,
        pageUrl: location.href
      };
    }

    const linkElement = element.closest('a[href]');
    if (linkElement) {
      const linkedImage = linkElement.querySelector('img');
      if (linkedImage) {
        return {
          imageUrl: getBestImageUrl(linkedImage),
          linkUrl: linkElement.href,
          pageUrl: location.href
        };
      }

      if (isLikelyImageUrl(linkElement.href)) {
        return {
          imageUrl: linkElement.href,
          linkUrl: linkElement.href,
          pageUrl: location.href
        };
      }
    }

    return null;
  }

  function findNearestImage(element) {
    if (element.matches('img')) {
      return element;
    }

    const image = element.querySelector('img');
    if (image) {
      return image;
    }

    const container = element.closest('a, figure, picture, [data-test-id], [role="button"], [class*="Pin"], [class*="pin"]');
    return container?.querySelector('img') || null;
  }

  function getBestImageUrl(imageElement) {
    return (
      normalizeUrl(imageElement.currentSrc) ||
      getLargestSrcsetUrl(imageElement.getAttribute('srcset')) ||
      getLargestSrcsetUrl(imageElement.getAttribute('data-srcset')) ||
      getImageUrlFromAttributes(imageElement) ||
      normalizeUrl(imageElement.src) ||
      ''
    );
  }

  function getImageUrlFromAttributes(element) {
    const attributeNames = [
      'src',
      'data-src',
      'data-original',
      'data-lazy-src',
      'data-image',
      'data-image-url',
      'data-full-src',
      'data-full-url',
      'data-pin-media',
      'content'
    ];

    for (const name of attributeNames) {
      const value = normalizeUrl(element.getAttribute?.(name));
      if (value && isLikelyImageUrl(value)) {
        return value;
      }
    }

    return '';
  }

  function getLargestSrcsetUrl(srcset) {
    if (!srcset) {
      return '';
    }

    const candidates = srcset
      .split(',')
      .map((part) => {
        const [url, descriptor = '1x'] = part.trim().split(/\s+/);
        const numeric = Number.parseFloat(descriptor);
        const score = Number.isFinite(numeric) ? numeric : 1;
        return {
          url: normalizeUrl(url),
          score: descriptor.endsWith('w') ? score : score * 1000
        };
      })
      .filter((candidate) => candidate.url);

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0]?.url || '';
  }

  function extractBackgroundImage(element) {
    const style = window.getComputedStyle(element);
    const backgroundImage = style.backgroundImage;
    if (!backgroundImage || backgroundImage === 'none') {
      return '';
    }

    const matches = Array.from(backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g));
    return normalizeUrl(matches[0]?.[1]) || '';
  }

  function normalizeUrl(value) {
    if (!value || typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
      return trimmed;
    }

    try {
      return new URL(trimmed, location.href).href;
    } catch (_error) {
      return '';
    }
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

  function removePopup() {
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }
    if (escHandler) {
      document.removeEventListener('keydown', escHandler);
      escHandler = null;
    }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #ip-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        animation: ipOverlayIn 0.18s ease;
      }
      @keyframes ipOverlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .ip-win {
        width: 420px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 32px);
        overflow: auto;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.14);
        background:
          linear-gradient(180deg, rgba(54,54,56,0.9), rgba(30,30,32,0.86));
        box-shadow:
          0 18px 50px rgba(0,0,0,0.36),
          inset 0 1px 0 rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.92);
        animation: ipWindowIn 0.22s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes ipWindowIn {
        from { opacity: 0; transform: translateY(8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .ip-titlebar {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 0 12px 0 14px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        background: rgba(60,60,62,0.72);
      }
      .ip-title {
        flex: 1;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: -0.1px;
      }
      .ip-model-tag {
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.72);
        font-size: 11px;
      }
      .ip-close {
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        line-height: 1;
      }
      .ip-close:hover {
        background: rgba(255,255,255,0.18);
      }

      .ip-content {
        padding: 14px;
      }
      .ip-thumb-wrap {
        height: 96px;
        overflow: hidden;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        margin-bottom: 12px;
      }
      .ip-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .ip-loading-box,
      .ip-error-box,
      .ip-prompt-wrap {
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
      }
      .ip-prompt-wrap + .ip-prompt-wrap {
        margin-top: 10px;
      }
      .ip-loading-box,
      .ip-error-box {
        padding: 14px;
      }
      .ip-loading-box p,
      .ip-error-box p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
      }
      .ip-error-box p {
        color: #ff9f96;
        white-space: pre-wrap;
      }
      .ip-spinner {
        width: 34px;
        height: 34px;
        margin: 0 auto 14px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,0.16);
        border-top-color: #4aa3ff;
        animation: ipSpin 0.9s linear infinite;
      }
      @keyframes ipSpin {
        to { transform: rotate(360deg); }
      }
      .ip-loading-box {
        text-align: center;
      }
      .ip-label {
        display: block;
        padding: 12px 12px 0;
        font-size: 11px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: rgba(255,255,255,0.42);
      }
      .ip-textarea {
        width: 100%;
        height: 98px;
        margin-top: 8px;
        padding: 0 12px 12px;
        border: none;
        outline: none;
        resize: none;
        background: transparent;
        color: rgba(255,255,255,0.92);
        font-size: 12px;
        line-height: 1.55;
        font-family: 'SF Mono', Menlo, Monaco, monospace;
        box-sizing: border-box;
      }
      .ip-textarea.notes {
        height: 82px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      }
      .ip-toolbar {
        display: flex;
        gap: 8px;
        padding: 0 12px 12px;
      }
      .ip-btn {
        width: 100%;
        min-height: 30px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.9);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .ip-btn:hover {
        background: rgba(255,255,255,0.12);
      }
      .ip-btn.success {
        background: rgba(72, 187, 120, 0.24);
        color: #c7ffd8;
      }
      .ip-copy-all {
        margin-top: 10px;
      }
      .ip-regenerate {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        margin-top: 10px;
      }
      .ip-select {
        min-height: 30px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        background: rgba(255,255,255,0.07);
        color: rgba(255,255,255,0.88);
        font-size: 12px;
        padding: 0 10px;
        outline: none;
      }
      .ip-select option {
        color: #111;
      }
      .ip-regenerate .ip-btn {
        width: auto;
        padding: 0 12px;
      }
      .ip-export {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
      }
      #ip-region-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        cursor: crosshair;
        background: transparent;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      }
      .ip-region-tip {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(28,28,30,0.88);
        color: rgba(255,255,255,0.9);
        font-size: 12px;
        box-shadow: 0 10px 32px rgba(0,0,0,0.28);
        pointer-events: none;
      }
      .ip-region-box {
        position: fixed;
        border: 2px solid rgba(10,132,255,0.96);
        background: rgba(10,132,255,0.14);
        box-shadow:
          0 0 0 9999px rgba(0,0,0,0.06),
          0 8px 28px rgba(10,132,255,0.2);
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  function showPopup(imageUrl, prompt, modelName, errorMsg, isLoading = false, loadingMessage = '', modelKey = '') {
    removePopup();
    ensureStyle();

    const overlay = document.createElement('div');
    overlay.id = 'ip-overlay';

    const win = document.createElement('div');
    win.className = 'ip-win';

    const titlebar = document.createElement('div');
    titlebar.className = 'ip-titlebar';

    const title = document.createElement('span');
    title.className = 'ip-title';
    title.textContent = '图Prompter · AI 提示词生成';

    const modelTag = document.createElement('div');
    modelTag.className = 'ip-model-tag';
    modelTag.textContent = modelName || 'AI';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ip-close';
    closeBtn.type = 'button';
    closeBtn.textContent = '×';

    titlebar.append(title, modelTag, closeBtn);

    const content = document.createElement('div');
    content.className = 'ip-content';

    if (imageUrl) {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'ip-thumb-wrap';

      const thumb = document.createElement('img');
      thumb.className = 'ip-thumb';
      thumb.src = imageUrl;
      thumb.alt = 'preview';
      thumb.loading = 'eager';

      thumbWrap.appendChild(thumb);
      content.appendChild(thumbWrap);
    }

    if (isLoading) {
      const loadingBox = document.createElement('div');
      loadingBox.className = 'ip-loading-box';

      const spinner = document.createElement('div');
      spinner.className = 'ip-spinner';

      const message = document.createElement('p');
      message.textContent = loadingMessage || '正在抓取图片并生成提示词，请稍候...';

      loadingBox.append(spinner, message);
      content.appendChild(loadingBox);
    } else if (errorMsg) {
      const errorBox = document.createElement('div');
      errorBox.className = 'ip-error-box';

      const message = document.createElement('p');
      message.textContent = errorMsg;

      errorBox.appendChild(message);
      content.appendChild(errorBox);
    } else {
      const parsedPrompt = parsePromptSections(prompt || '');
      const promptSection = createCopySection({
        label: 'English Prompt',
        value: parsedPrompt.englishPrompt,
        copyText: '复制英文 Prompt'
      });
      const notesSection = createCopySection({
        label: '中文注释',
        value: parsedPrompt.chineseNotes,
        copyText: '复制中文注释',
        textareaClassName: 'notes'
      });
      const copyAllBtn = document.createElement('button');
      copyAllBtn.className = 'ip-btn ip-copy-all';
      copyAllBtn.type = 'button';
      copyAllBtn.textContent = '复制全部';

      const exportControls = createExportControls({
        imageUrl,
        modelName,
        modelKey,
        parsedPrompt
      });
      const regenerate = createRegenerateControls(imageUrl, modelKey, modelName);

      content.append(promptSection.wrap, notesSection.wrap, copyAllBtn, exportControls, regenerate);
      bindCopyButton(copyAllBtn, formatCombinedPrompt(parsedPrompt));
    }

    win.append(titlebar, content);
    overlay.appendChild(win);
    document.body.appendChild(overlay);
    currentPopup = overlay;

    closeBtn.addEventListener('click', removePopup);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        removePopup();
      }
    });

    escHandler = function onEscape(event) {
      if (event.key === 'Escape') {
        removePopup();
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function parsePromptSections(rawPrompt) {
    const normalized = rawPrompt.trim();
    const englishMatch = normalized.match(/English Prompt\s*[:：]\s*([\s\S]*?)(?=\n\s*(?:中文注释|Chinese Notes|中文说明)\s*[:：]|$)/i);
    const chineseMatch = normalized.match(/(?:中文注释|Chinese Notes|中文说明)\s*[:：]\s*([\s\S]*)/i);

    return {
      englishPrompt: cleanSectionText(englishMatch?.[1] || normalized),
      chineseNotes: cleanSectionText(chineseMatch?.[1] || '暂无中文注释。')
    };
  }

  function cleanSectionText(value) {
    return String(value || '')
      .replace(/^```[\w-]*\s*/g, '')
      .replace(/```$/g, '')
      .trim();
  }

  function formatCombinedPrompt(parsedPrompt) {
    return `English Prompt:\n${parsedPrompt.englishPrompt}\n\n中文注释:\n${parsedPrompt.chineseNotes}`;
  }

  function createCopySection({ label, value, copyText, textareaClassName = '' }) {
    const wrap = document.createElement('div');
    wrap.className = 'ip-prompt-wrap';

    const labelEl = document.createElement('label');
    labelEl.className = 'ip-label';
    labelEl.textContent = label;

    const textarea = document.createElement('textarea');
    textarea.className = `ip-textarea ${textareaClassName}`.trim();
    textarea.readOnly = true;
    textarea.value = value || '';
    textarea.addEventListener('focus', () => textarea.select());
    textarea.addEventListener('click', () => textarea.select());

    const toolbar = document.createElement('div');
    toolbar.className = 'ip-toolbar';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'ip-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = copyText;

    toolbar.appendChild(copyBtn);
    wrap.append(labelEl, textarea, toolbar);
    bindCopyButton(copyBtn, textarea.value);

    return { wrap, textarea, copyBtn };
  }

  function bindCopyButton(button, text) {
    const defaultText = button.textContent;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text || '');
        button.textContent = '已复制';
        button.classList.add('success');
        window.setTimeout(() => {
          button.textContent = defaultText;
          button.classList.remove('success');
        }, COPY_RESET_DELAY);
      } catch (error) {
        button.textContent = '复制失败';
        window.setTimeout(() => {
          button.textContent = defaultText;
        }, COPY_RESET_DELAY);
        console.error('[图Prompter] 复制失败:', error);
      }
    });
  }

  function createExportControls({ imageUrl, modelName, modelKey, parsedPrompt }) {
    const wrap = document.createElement('div');
    wrap.className = 'ip-export';

    const txtButton = document.createElement('button');
    txtButton.className = 'ip-btn';
    txtButton.type = 'button';
    txtButton.textContent = '导出 TXT';
    txtButton.addEventListener('click', () => {
      downloadTextFile('image-prompt.txt', formatCombinedPrompt(parsedPrompt), 'text/plain;charset=utf-8');
    });

    const jsonButton = document.createElement('button');
    jsonButton.className = 'ip-btn';
    jsonButton.type = 'button';
    jsonButton.textContent = '导出 JSON';
    jsonButton.addEventListener('click', () => {
      const payload = {
        model: modelName || '',
        modelKey: modelKey || '',
        imageUrl,
        englishPrompt: parsedPrompt.englishPrompt,
        chineseNotes: parsedPrompt.chineseNotes,
        exportedAt: new Date().toISOString()
      };
      downloadTextFile('image-prompt.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    });

    wrap.append(txtButton, jsonButton);
    return wrap;
  }

  function downloadTextFile(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function createRegenerateControls(imageUrl, currentModelKey, currentModelName) {
    const wrap = document.createElement('div');
    wrap.className = 'ip-regenerate';

    const select = document.createElement('select');
    select.className = 'ip-select';

    RESULT_MODELS.forEach((model) => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      if (model.id === currentModelKey || (!currentModelKey && model.name === currentModelName)) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    const button = document.createElement('button');
    button.className = 'ip-btn';
    button.type = 'button';
    button.textContent = '换模型生成';
    button.addEventListener('click', async () => {
      const modelKey = select.value;
      const modelName = RESULT_MODELS.find((model) => model.id === modelKey)?.name || 'AI';
      showPopup(imageUrl, '', modelName, '', true, '正在重新分析图片，请稍候...', modelKey);

      try {
        const result = await sendRuntimeMessage({
          type: 'analyzeImage',
          imageUrl,
          modelKey
        });
        showPopup(imageUrl, result.prompt, result.model || modelName, result.error, false, '', result.modelKey || modelKey);
      } catch (error) {
        showPopup(imageUrl, '', modelName, `重新生成失败: ${error.message}`, false, '', modelKey);
      }
    });

    wrap.append(select, button);
    return wrap;
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(response || {});
      });
    });
  }

  function waitForPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }

  function startRegionSelect(modelKey, modelName) {
    removePopup();
    ensureStyle();
    document.getElementById(REGION_OVERLAY_ID)?.remove();

    const overlay = document.createElement('div');
    overlay.id = REGION_OVERLAY_ID;

    const tip = document.createElement('div');
    tip.className = 'ip-region-tip';
    tip.textContent = `拖拽框选要分析的区域 · ${modelName || '默认模型'} · Esc 取消`;

    const box = document.createElement('div');
    box.className = 'ip-region-box';
    box.style.display = 'none';

    overlay.append(tip, box);
    document.body.appendChild(overlay);

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const cleanup = () => {
      overlay.remove();
      document.removeEventListener('keydown', onKeyDown, true);
    };

    const updateBox = (event) => {
      const left = Math.min(startX, event.clientX);
      const top = Math.min(startY, event.clientY);
      const width = Math.abs(event.clientX - startX);
      const height = Math.abs(event.clientY - startY);

      box.style.display = 'block';
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        cleanup();
      }
    };

    overlay.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      startX = event.clientX;
      startY = event.clientY;
      isDragging = true;
      updateBox(event);
    });

    overlay.addEventListener('mousemove', (event) => {
      if (!isDragging) return;
      event.preventDefault();
      updateBox(event);
    });

    overlay.addEventListener('mouseup', async (event) => {
      if (!isDragging) return;
      event.preventDefault();
      isDragging = false;

      const rect = {
        x: Math.max(0, Math.min(startX, event.clientX)),
        y: Math.max(0, Math.min(startY, event.clientY)),
        width: Math.abs(event.clientX - startX),
        height: Math.abs(event.clientY - startY)
      };

      cleanup();
      if (rect.width < 12 || rect.height < 12) {
        showPopup('', '', modelName, '框选区域太小，请重新选择更大的区域。');
        return;
      }

      try {
        await waitForPaint();
        await sendRuntimeMessage({
          type: 'analyzeSelection',
          rect,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1
          },
          modelKey
        });
      } catch (error) {
        showPopup('', '', modelName, `框选分析失败: ${error.message}`);
      }
    });

    document.addEventListener('keydown', onKeyDown, true);
  }
})();
