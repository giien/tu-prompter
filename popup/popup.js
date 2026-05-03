const MODELS = ['gpt4o', 'claude', 'gemini', 'hailuo', 'doubao', 'zhipu', 'qwen', 'jeniya', 'custom'];
let savedKeys = {};
let customModel = {};
let minimaxModel = {};
let activeModel = null;
let selectedModel = 'gpt4o';
let saveTimer = null;
let promptTemplate = 'general';
const COPY_RESET_DELAY = 1200;

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();

  chrome.storage.sync.get(['apiKeys', 'selectedModel', 'customModel', 'minimaxModel', 'promptTemplate'], (config) => {
    savedKeys = config.apiKeys || {};
    customModel = config.customModel || {};
    minimaxModel = config.minimaxModel || {};
    promptTemplate = config.promptTemplate || 'general';

    MODELS.forEach((m) => {
      const dot = document.getElementById(`dot-${m}`);
      const input = document.getElementById(`key-${m}`);
      if (dot) {
        dot.className = 'dot ' + (isModelConfigured(m) ? 'ok' : 'empty');
      }
      if (input) {
        input.value = savedKeys[m] || '';
      }
    });

    const endpointInput = document.getElementById('endpoint-custom');
    const modelInput = document.getElementById('model-custom');
    if (endpointInput) endpointInput.value = customModel.endpoint || '';
    if (modelInput) modelInput.value = customModel.model || '';

    const minimaxEndpointInput = document.getElementById('endpoint-hailuo');
    const minimaxModelInput = document.getElementById('model-hailuo');
    if (minimaxEndpointInput) minimaxEndpointInput.value = minimaxModel.endpoint || '';
    if (minimaxModelInput) minimaxModelInput.value = minimaxModel.model || '';

    renderTemplateChips();

    selectedModel = config.selectedModel || 'gpt4o';
    if (selectedModel) {
      openModel(selectedModel);
    }
  });

  loadHistory();
});

function bindEvents() {
  document.querySelectorAll('.model-item').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      const model = item.dataset.model;
      if (!model) return;
      if (activeModel === model) {
        closePanels();
        return;
      }
      openModel(model);
    });
  });

  MODELS.forEach((model) => {
    const input = document.getElementById(`key-${model}`);
    if (!input) return;
    input.addEventListener('input', (event) => {
      onKeyInput(model, event.target.value);
    });
    input.addEventListener('click', (event) => event.stopPropagation());
  });

  document.getElementById('endpoint-hailuo')?.addEventListener('input', (event) => {
    minimaxModel.endpoint = event.target.value.trim();
    queueSave();
  });
  document.getElementById('endpoint-hailuo')?.addEventListener('click', (event) => event.stopPropagation());

  document.getElementById('model-hailuo')?.addEventListener('input', (event) => {
    minimaxModel.model = event.target.value.trim();
    queueSave();
  });
  document.getElementById('model-hailuo')?.addEventListener('click', (event) => event.stopPropagation());

  document.getElementById('endpoint-custom')?.addEventListener('input', (event) => {
    customModel.endpoint = event.target.value.trim();
    updateCustomDot();
    queueSave();
  });
  document.getElementById('endpoint-custom')?.addEventListener('click', (event) => event.stopPropagation());

  document.getElementById('model-custom')?.addEventListener('input', (event) => {
    customModel.model = event.target.value.trim();
    updateCustomDot();
    queueSave();
  });
  document.getElementById('model-custom')?.addEventListener('click', (event) => event.stopPropagation());

  document.querySelectorAll('.template-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      promptTemplate = chip.dataset.template || 'general';
      renderTemplateChips();
      queueSave();
    });
  });

  document.getElementById('prompt-template')?.addEventListener('click', (event) => {
    if (event.target.closest('.template-chip')) {
      event.stopPropagation();
    }
  });

  document.getElementById('prompt-template')?.addEventListener('change', (event) => {
    promptTemplate = event.target.value || 'general';
    queueSave();
  });

  document.getElementById('clear-history')?.addEventListener('click', async () => {
    await chrome.storage.local.set({ promptHistory: [] });
    renderHistory([]);
  });

  document.getElementById('test-model')?.addEventListener('click', testActiveModel);

  document.getElementById('debug-context-menu')?.addEventListener('click', testContextMenu);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.model-item') && !event.target.closest('.key-panel')) {
      closePanels();
    }
  });
}

function closePanels() {
  document.querySelectorAll('.model-item').forEach((item) => item.classList.remove('active'));
  document.querySelectorAll('.key-panel').forEach((panel) => {
    panel.classList.remove('open');
    panel.style.display = 'none';
  });
  activeModel = null;
}

function openModel(model) {
  closePanels();

  const item = document.querySelector(`.model-item[data-model="${model}"]`);
  const panel = document.getElementById(`panel-${model}`);
  if (!item || !panel) return;

  item.classList.add('active');
  panel.style.display = 'block';
  requestAnimationFrame(() => panel.classList.add('open'));
  activeModel = model;
  selectedModel = model;
  queueSave();
  setTimeout(() => document.getElementById(`key-${model}`)?.focus(), 150);
}

function onKeyInput(model, value) {
  const trimmed = value.trim();
  const dot = document.getElementById(`dot-${model}`);
  if (trimmed) {
    savedKeys[model] = trimmed;
  } else {
    delete savedKeys[model];
  }

  if (dot) dot.className = 'dot ' + (isModelConfigured(model) ? 'ok' : 'empty');

  queueSave();
}

function isModelConfigured(model) {
  if (model === 'custom') {
    return Boolean(savedKeys.custom && customModel.endpoint && customModel.model);
  }

  return Boolean(savedKeys[model]);
}

function updateCustomDot() {
  const dot = document.getElementById('dot-custom');
  if (dot) {
    dot.className = 'dot ' + (isModelConfigured('custom') ? 'ok' : 'empty');
  }
}

function renderTemplateChips() {
  document.querySelectorAll('.template-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.template === promptTemplate);
  });
}

function queueSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveConfig();
  }, 180);
}

function saveConfig() {
  return chrome.storage.sync.set({
    apiKeys: savedKeys,
    customModel,
    minimaxModel,
    promptTemplate,
    selectedModel
  });
}

async function loadHistory() {
  const config = await chrome.storage.local.get(['promptHistory']);
  renderHistory(Array.isArray(config.promptHistory) ? config.promptHistory : []);
}

function renderHistory(history) {
  const list = document.getElementById('history-list');
  if (!list) return;

  list.textContent = '';
  if (!history.length) {
    const empty = document.createElement('div');
    empty.className = 'history-empty';
    empty.textContent = '还没有历史记录。生成一次 Prompt 后会显示在这里。';
    list.appendChild(empty);
    return;
  }

  history.slice(0, 5).forEach((item) => {
    const wrap = document.createElement('div');
    wrap.className = 'history-item';

    const meta = document.createElement('div');
    meta.className = 'history-meta';
    const model = document.createElement('span');
    model.textContent = item.model || 'AI';
    const time = document.createElement('span');
    time.textContent = formatTime(item.createdAt);
    meta.append(model, time);

    const text = document.createElement('div');
    text.className = 'history-text';
    text.textContent = item.englishPrompt || item.prompt || '';

    const actions = document.createElement('div');
    actions.className = 'history-actions';
    const copyEnglish = createHistoryButton('复制英文', item.englishPrompt || item.prompt || '');
    const copyAll = createHistoryButton('复制全部', formatHistoryPrompt(item));
    actions.append(copyEnglish, copyAll);

    wrap.append(meta, text, actions);
    list.appendChild(wrap);
  });
}

function createHistoryButton(label, text) {
  const button = document.createElement('button');
  button.className = 'mini-btn';
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(text || '');
    button.textContent = '已复制';
    button.classList.add('success');
    window.setTimeout(() => {
      button.textContent = label;
      button.classList.remove('success');
    }, COPY_RESET_DELAY);
  });
  return button;
}

function formatHistoryPrompt(item) {
  return `English Prompt:\n${item.englishPrompt || item.prompt || ''}\n\n中文注释:\n${item.chineseNotes || ''}`;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function testContextMenu() {
  const result = await new Promise((resolve) => {
    chrome.storage.sync.get(['apiKeys', 'selectedModel'], resolve);
  });
  alert('配置已保存！\n\n现在去任意网页，右键点击图片，\n在菜单底部会看到 7 个"· 生成提示词"选项。\n\nAPI Keys: ' + JSON.stringify(Object.keys(result.apiKeys || {})));
}

async function testActiveModel() {
  const button = document.getElementById('test-model');
  const status = document.getElementById('test-status');
  if (!button || !status) return;

  window.clearTimeout(saveTimer);
  await saveConfig();

  const config = await chrome.storage.sync.get(['selectedModel']);
  const modelKey = activeModel || selectedModel || config.selectedModel || 'gpt4o';
  button.disabled = true;
  button.textContent = '测试中...';
  status.textContent = '正在发送一张 1x1 测试图片验证 API 配置。';

  chrome.runtime.sendMessage({ type: 'testModel', modelKey }, (response) => {
    button.disabled = false;
    button.textContent = '测试当前模型';

    const error = chrome.runtime.lastError;
    if (error) {
      status.textContent = `测试失败：${error.message}`;
      return;
    }

    if (response?.ok) {
      status.textContent = response.message || '连接成功';
      return;
    }

    status.textContent = `测试失败：${response?.error || '未知错误'}`;
  });
}
