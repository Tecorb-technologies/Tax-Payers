const { isConnectionRefused } = require('./errorUtils');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

/**
 * Call a locally running Ollama instance. No API key is required or
 * accepted — Ollama is assumed to be reachable on the same machine as
 * the backend (or at OLLAMA_BASE_URL, if overridden).
 *
 * @param {Object} params
 * @param {string} params.model
 * @param {string} [params.system]
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages
 * @returns {Promise<string>} the assistant's reply text
 */
async function sendMessage({ model, system, messages }) {
  let response;
  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, ...messages],
        stream: false,
      }),
    });
  } catch (networkError) {
    if (isConnectionRefused(networkError)) {
      const error = new Error(
        'Ollama is not running locally. Start Ollama (`ollama serve`) and try again.'
      );
      error.status = 503;
      throw error;
    }
    const error = new Error('Failed to reach the local Ollama service');
    error.status = 502;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error || 'Ollama request failed');
    error.status = 502;
    throw error;
  }

  const reply = data?.message?.content?.trim();

  if (!reply) {
    const error = new Error('Ollama returned an empty response');
    error.status = 502;
    throw error;
  }

  return reply;
}

module.exports = { sendMessage };
