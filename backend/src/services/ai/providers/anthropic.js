const { buildProviderError } = require('./errorUtils');

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS = 1024;

/**
 * Call Anthropic's Messages API and return the normalized reply text.
 *
 * @param {Object} params
 * @param {string} params.apiKey - caller-supplied key, used only for this
 *   request and never persisted or logged.
 * @param {string} params.model
 * @param {string} [params.system]
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages
 * @returns {Promise<string>} the assistant's reply text
 */
async function sendMessage({ apiKey, model, system, messages }) {
  let response;
  try {
    response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system,
        messages,
      }),
    });
  } catch {
    const error = new Error('Failed to reach the Anthropic API');
    error.status = 502;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage = data && data.error && data.error.message;
    throw buildProviderError(response.status, providerMessage, 'Anthropic API request failed');
  }

  const reply = Array.isArray(data.content)
    ? data.content
        .filter((block) => block && block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim()
    : '';

  if (!reply) {
    const error = new Error('Anthropic API returned an empty response');
    error.status = 502;
    throw error;
  }

  return reply;
}

module.exports = { sendMessage };
