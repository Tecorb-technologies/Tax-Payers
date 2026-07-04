const chatService = require('../services/ai/chat.service');
const providers = require('../services/ai/providers');

/**
 * GET /api/providers
 * Drives the frontend Settings dropdown. Never exposes internal fields
 * like `baseUrl`.
 */
function getProviders(req, res) {
  res.json({ data: providers.listProviders() });
}

/**
 * POST /api/chat
 * body: { provider, apiKey, model, projectId?, messages: [{role, content}] }
 *
 * `apiKey` is read from the request body and forwarded to the relevant
 * provider adapter for this call only — it is never logged (see index.js
 * morgan config, which logs method/path/status only) and never persisted.
 */
async function postChat(req, res, next) {
  try {
    const { provider, apiKey, model, projectId, messages } = req.body;

    const result = await chatService.sendChatMessage({
      provider,
      apiKey,
      model,
      projectId,
      messages,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProviders, postChat };
