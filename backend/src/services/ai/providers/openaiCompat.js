const { buildProviderError } = require('./errorUtils');

/**
 * Shared adapter for any provider that speaks the OpenAI chat-completions
 * wire format (OpenAI itself, Deepseek, GLM/Zhipu).
 *
 * @param {Object} params
 * @param {string} params.apiKey - caller-supplied key, used only for this
 *   request and never persisted or logged.
 * @param {string} params.model
 * @param {string} [params.system]
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages
 * @param {string} params.baseUrl - provider-specific API base URL
 * @returns {Promise<string>} the assistant's reply text
 */
async function sendMessage({ apiKey, model, system, messages, baseUrl }) {
  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
  } catch {
    const error = new Error('Failed to reach the AI provider API');
    error.status = 502;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage = data && data.error && (data.error.message || data.error);
    throw buildProviderError(
      response.status,
      typeof providerMessage === 'string' ? providerMessage : undefined,
      'AI provider request failed'
    );
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    const error = new Error('AI provider returned an empty response');
    error.status = 502;
    throw error;
  }

  return reply;
}

module.exports = { sendMessage };
