import { useEffect, useState } from "react"
import { CheckCircle2, Eye, EyeOff, TriangleAlert } from "lucide-react"

import { getData, getErrorMessage } from "@/lib/api"
import { useFetch } from "@/hooks/useFetch"
import { clearAiSettings, getAiSettings, setAiSettings } from "@/lib/aiSettings"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorNotice, LoadingSpinner } from "@/components/StateViews"

/**
 * Bring-your-own-key AI provider form. Persists to localStorage via
 * `aiSettings.js` — the backend never stores this, it's only forwarded
 * per-request to `/api/chat` (see chat.controller.js).
 */
export default function ProviderSettings() {
  const { data: providers, loading, error, refetch } = useFetch(() => getData("/providers"), [])

  const [provider, setProvider] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [status, setStatus] = useState(null) // { type: "success" | "error", message }

  // Prefill the form from any previously saved settings, once, on mount.
  useEffect(() => {
    const saved = getAiSettings()
    setProvider(saved.provider)
    setApiKey(saved.apiKey)
    setModel(saved.model)
  }, [])

  const selectedProviderMeta = providers?.find((p) => p.key === provider)
  const requiresApiKey = selectedProviderMeta ? selectedProviderMeta.requiresApiKey : true

  function handleProviderChange(nextKey) {
    setStatus(null)
    setProvider(nextKey)
    const meta = providers?.find((p) => p.key === nextKey)
    // Only auto-fill the model if the user hasn't already typed one, so we
    // never clobber a deliberately customized model on provider switch.
    setModel((current) => current || meta?.defaultModel || "")
    if (meta && !meta.requiresApiKey) setApiKey("")
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!provider) {
      setStatus({ type: "error", message: "Choose a provider first." })
      return
    }
    if (requiresApiKey && !apiKey.trim()) {
      setStatus({ type: "error", message: "This provider requires an API key." })
      return
    }
    if (!model.trim()) {
      setStatus({ type: "error", message: "Enter a model name." })
      return
    }

    setAiSettings({
      provider,
      apiKey: requiresApiKey ? apiKey.trim() : "",
      model: model.trim(),
    })
    setStatus({ type: "success", message: "Settings saved. You can now chat about any project." })
  }

  function handleClear() {
    clearAiSettings()
    setProvider("")
    setApiKey("")
    setModel("")
    setShowApiKey(false)
    setStatus({ type: "success", message: "Saved settings cleared from this browser." })
  }

  if (loading) {
    return <LoadingSpinner label="Loading providers…" />
  }

  if (error) {
    return (
      <ErrorNotice title="Couldn't load AI providers" message={getErrorMessage(error)} onRetry={refetch} />
    )
  }

  return (
    <div className="max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ai-provider">Provider</Label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger id="ai-provider" className="w-full">
              <SelectValue placeholder="Choose a provider" />
            </SelectTrigger>
            <SelectContent>
              {(providers || []).map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ai-api-key">
            API key
            {!requiresApiKey && (
              <span className="ml-1 font-normal text-muted-foreground">(not required for this provider)</span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="ai-api-key"
              type={showApiKey ? "text" : "password"}
              autoComplete="off"
              spellCheck="false"
              placeholder={requiresApiKey ? "sk-…" : "No API key needed for a local Ollama server"}
              value={apiKey}
              disabled={!requiresApiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              disabled={!requiresApiKey}
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
              aria-pressed={showApiKey}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              {showApiKey ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ai-model">Model</Label>
          <Input
            id="ai-model"
            type="text"
            placeholder="e.g. claude-3-5-sonnet-20241022"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Prefilled with the provider&apos;s default model — edit if you&apos;d like to use a different one.
          </p>
        </div>

        {status && (
          <Alert variant={status.type === "error" ? "destructive" : "default"}>
            {status.type === "error" ? (
              <TriangleAlert aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="text-accent" />
            )}
            <AlertTitle>{status.type === "error" ? "Couldn't save" : "Saved"}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit">Save settings</Button>
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear saved settings
          </Button>
        </div>
      </form>

      <p className="mt-4 max-w-prose text-xs leading-relaxed text-muted-foreground">
        Your API key is stored only in your browser and sent directly to our server per-request
        to call your chosen AI provider — it is never saved on our servers.
      </p>
    </div>
  )
}
