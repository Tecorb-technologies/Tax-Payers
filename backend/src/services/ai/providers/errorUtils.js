/**
 * Shared helpers for normalizing errors coming back from third-party AI
 * provider APIs. Keeping this in one place ensures every adapter maps
 * provider status codes the same way and never echoes anything from the
 * raw provider response that could carry sensitive data (the caller's own
 * API key is never part of the provider's response body, but we still only
 * ever surface the provider's own `message` field — never headers, never
 * the full response body).
 */

/**
 * Map a third-party provider's HTTP status to a clean status we're willing
 * to return to our own API clients.
 */
function mapProviderStatus(providerStatus) {
  if (providerStatus === 401 || providerStatus === 403) return 401;
  if (providerStatus === 429) return 429;
  return 502;
}

/**
 * Build an Error carrying a `.status` for the centralized errorHandler,
 * using only the provider's own error message (never raw body/headers).
 */
function buildProviderError(providerStatus, providerMessage, fallbackMessage) {
  const error = new Error(providerMessage || fallbackMessage);
  error.status = mapProviderStatus(providerStatus);
  return error;
}

/**
 * Detect a "connection refused" style network failure (e.g. a local
 * service like Ollama that isn't running), walking the `cause` chain that
 * Node's fetch implementation attaches to its TypeError.
 */
function isConnectionRefused(err) {
  let current = err;
  let depth = 0;
  while (current && depth < 5) {
    if (current.code === 'ECONNREFUSED') return true;
    current = current.cause;
    depth += 1;
  }
  return false;
}

module.exports = { mapProviderStatus, buildProviderError, isConnectionRefused };
