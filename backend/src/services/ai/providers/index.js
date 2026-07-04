const anthropic = require('./anthropic');
const openaiCompat = require('./openaiCompat');
const ollama = require('./ollama');

/**
 * Registry of supported AI providers. Bring-your-own-key: the backend
 * never stores a key for any of these — one is supplied per request by
 * the client and used only for the lifetime of that single call.
 *
 * `baseUrl` is only present for providers that speak the OpenAI-compatible
 * chat-completions wire format; adapters read it from here rather than
 * having it duplicated in the client.
 */
const REGISTRY = {
  anthropic: {
    key: 'anthropic',
    label: 'Claude (Anthropic)',
    requiresApiKey: true,
    defaultModel: 'claude-3-5-sonnet-20241022',
  },
  openai: {
    key: 'openai',
    label: 'OpenAI',
    requiresApiKey: true,
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
  deepseek: {
    key: 'deepseek',
    label: 'Deepseek',
    requiresApiKey: true,
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
  },
  glm: {
    key: 'glm',
    label: 'GLM (Zhipu)',
    requiresApiKey: true,
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
  },
  ollama: {
    key: 'ollama',
    label: 'Ollama (local)',
    requiresApiKey: false,
    defaultModel: 'llama3',
  },
};

const OPENAI_COMPAT_PROVIDERS = new Set(['openai', 'deepseek', 'glm']);

const VALID_PROVIDER_KEYS = Object.keys(REGISTRY);

/**
 * Public, client-facing view of the registry — drives the frontend
 * Settings dropdown. Intentionally omits `baseUrl` since the client has
 * no use for it and it's an internal implementation detail.
 */
function listProviders() {
  return VALID_PROVIDER_KEYS.map((key) => {
    const { label, requiresApiKey, defaultModel } = REGISTRY[key];
    return { key, label, requiresApiKey, defaultModel };
  });
}

function getProviderConfig(providerKey) {
  return REGISTRY[providerKey] || null;
}

/**
 * Route a chat request to the right provider adapter.
 *
 * @param {string} providerKey
 * @param {Object} params
 * @param {string} [params.apiKey]
 * @param {string} [params.model]
 * @param {string} [params.system]
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages
 * @returns {Promise<string>} normalized reply text
 */
async function dispatch(providerKey, { apiKey, model, system, messages }) {
  const config = getProviderConfig(providerKey);
  if (!config) {
    const error = new Error(`Unsupported provider '${providerKey}'`);
    error.status = 400;
    throw error;
  }

  const resolvedModel = model || config.defaultModel;

  if (providerKey === 'anthropic') {
    return anthropic.sendMessage({ apiKey, model: resolvedModel, system, messages });
  }

  if (OPENAI_COMPAT_PROVIDERS.has(providerKey)) {
    return openaiCompat.sendMessage({
      apiKey,
      model: resolvedModel,
      system,
      messages,
      baseUrl: config.baseUrl,
    });
  }

  if (providerKey === 'ollama') {
    return ollama.sendMessage({ model: resolvedModel, system, messages });
  }

  /* istanbul ignore next -- unreachable unless REGISTRY gains an entry
     without a matching adapter branch above */
  const error = new Error(`Provider '${providerKey}' has no adapter configured`);
  error.status = 500;
  throw error;
}

module.exports = {
  REGISTRY,
  VALID_PROVIDER_KEYS,
  listProviders,
  getProviderConfig,
  dispatch,
};
