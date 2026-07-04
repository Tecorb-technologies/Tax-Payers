// Bring-your-own-key AI provider settings, persisted client-side only.
// The backend never stores these; they are sent per-request to /api/chat.
// Shape: { provider: string, apiKey: string, model: string }

const STORAGE_KEY = "taxpayers.aiSettings"

const DEFAULT_SETTINGS = {
  provider: "",
  apiKey: "",
  model: "",
}

/**
 * Read the saved AI provider settings from localStorage.
 * @returns {{provider: string, apiKey: string, model: string}}
 */
export function getAiSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * Persist (merge + save) AI provider settings to localStorage.
 * @param {Partial<{provider: string, apiKey: string, model: string}>} settings
 * @returns {{provider: string, apiKey: string, model: string}} the saved settings
 */
export function setAiSettings(settings) {
  const next = { ...getAiSettings(), ...settings }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — fail silently.
    }
  }

  return next
}

/** Remove any saved AI provider settings. */
export function clearAiSettings() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Whether enough settings are present to attempt a chat request.
 * apiKey is intentionally not required here — providers like Ollama have
 * `requiresApiKey: false`, and ProviderSettings already enforces a key at
 * save time for providers that do need one.
 */
export function hasAiSettings(settings = getAiSettings()) {
  return Boolean(settings.provider && settings.model)
}
