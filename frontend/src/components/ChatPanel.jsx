import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Bot, Loader2, MessageCircleQuestion, Send, TriangleAlert, User } from "lucide-react"

import { api, getErrorMessage } from "@/lib/api"
import { getAiSettings, hasAiSettings } from "@/lib/aiSettings"
import { cn } from "@/lib/utils"

import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Bound the history sent to the backend so payloads stay small — the
// provider adapters don't need the full conversation to be useful, and
// this keeps requests cheap even in a very long-running session.
const MAX_HISTORY = 20

const PROVIDER_LABELS = {
  anthropic: "Claude",
  openai: "OpenAI",
  deepseek: "Deepseek",
  glm: "GLM",
  ollama: "Ollama",
}

const PROJECT_STARTER_PROMPTS = [
  "What is this project's status?",
  "How much has been spent so far?",
  "Is this project over budget?",
  "What were the most recent updates?",
]

const GLOBAL_STARTER_PROMPTS = [
  "What is the total public budget across all areas?",
  "Which projects are currently over budget?",
  "How many projects are in progress right now?",
  "Which area has the most active projects?",
]

function MessageBubble({ role, content }) {
  const isUser = role === "user"
  return (
    <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}>
      <div
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        {content}
      </div>
    </div>
  )
}

/**
 * Contextual chat widget for a single project. Reads the user's own AI
 * provider settings from localStorage (see aiSettings.js) fresh on every
 * send, so a mid-session settings change takes effect immediately.
 */
export default function ChatPanel({ projectId, title = "Ask about this project" }) {
  const starterPrompts = projectId ? PROJECT_STARTER_PROMPTS : GLOBAL_STARTER_PROMPTS
  const subject = projectId ? "this project" : "public spending"
  const [configured, setConfigured] = useState(() => hasAiSettings())
  const [activeSettings, setActiveSettings] = useState(() => getAiSettings())
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  // Settings can change on the Settings page (same tab, different route) or
  // in another tab; re-check whenever this tab regains focus so the panel
  // reflects the latest state without requiring a full reload.
  useEffect(() => {
    function recheck() {
      setConfigured(hasAiSettings())
      setActiveSettings(getAiSettings())
    }
    window.addEventListener("focus", recheck)
    document.addEventListener("visibilitychange", recheck)
    return () => {
      window.removeEventListener("focus", recheck)
      document.removeEventListener("visibilitychange", recheck)
    }
  }, [])

  async function sendMessage(rawText) {
    const content = rawText.trim()
    if (!content || sending) return

    const nextMessages = [...messages, { role: "user", content }].slice(-MAX_HISTORY)
    setMessages(nextMessages)
    setInput("")
    setError(null)
    setSending(true)

    try {
      // Read fresh each send, not from state, so a settings change made
      // mid-session (e.g. in another tab) is honored on the next message.
      const current = getAiSettings()
      const response = await api.post("/chat", {
        provider: current.provider,
        apiKey: current.apiKey,
        model: current.model,
        ...(projectId ? { projectId: String(projectId) } : {}),
        messages: nextMessages,
      })
      const reply = response.data?.reply
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      // Keep the conversation intact on failure — just surface the error
      // and let the user retry (their message is still visible above).
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
      document.getElementById("chat-input")?.focus()
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!configured) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center sm:p-8">
        <MessageCircleQuestion className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-heading text-base font-medium text-foreground">Ask an AI about {subject}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure an AI provider in Settings to chat about {subject}.
        </p>
        <Link to="/settings" className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-4")}>
          Go to Settings
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[30rem] flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {PROVIDER_LABELS[activeSettings.provider] || activeSettings.provider} · {activeSettings.model}
          </p>
        </div>
        <Link to="/settings" className="shrink-0 text-xs font-medium text-accent hover:underline">
          Change
        </Link>
      </div>

      {/* Message list */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <div className="space-y-2.5">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-1.5">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} role={message.role} content={message.content} />
        ))}

        {sending && (
          <div className="flex items-center gap-2 pl-8 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Thinking…
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
        <div className="flex-1">
          <Label htmlFor="chat-input" className="sr-only">
            Message about {subject}
          </Label>
          <Textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question about ${subject}…`}
            rows={1}
            className="max-h-32 min-h-9 resize-none py-1.5"
          />
        </div>
        <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Send message">
          {sending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
        </Button>
      </form>
    </div>
  )
}
