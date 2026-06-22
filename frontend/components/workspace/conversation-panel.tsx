"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Paperclip, SendHorizontal, Smile } from "lucide-react"
import { UploadZone } from "./upload-zone"
import { ChatMessageView } from "./chat-message"
import type { ChatMessage } from "./types"

export function ConversationPanel({
  messages,
  papers,
  thinking,
  researcher,
  onSend,
  onAddPapers,
  onRemovePaper,
}: {
  messages: ChatMessage[]
  papers: string[]
  thinking: boolean
  researcher: { name: string; email: string }
  onSend: (text: string) => void
  onAddPapers: (names: string[]) => void
  onRemovePaper: (name: string) => void
}) {
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, thinking])

  const submit = () => {
    const t = draft.trim()
    if (!t) return
    onSend(t)
    setDraft("")
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-base font-medium text-foreground">Conversational Workspace</h2>
        <span className="text-xs text-muted-foreground">{researcher.name}</span>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <UploadZone papers={papers} onAdd={onAddPapers} onRemove={onRemovePaper} />

        {messages.map((m) => (
          <ChatMessageView key={m.id} message={m} initial={{ name: researcher.name }} />
        ))}

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 pl-11 text-sm text-muted-foreground"
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1.5 rounded-full bg-node-gap"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.18 }}
                />
              ))}
            </span>
            Research Oracle is synthesizing…
          </motion.div>
        )}
      </div>

      {/* Composer */}
      <div className="px-6 pb-5">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2 transition-colors focus-within:border-ring">
          <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Attach">
            <Paperclip className="size-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Ask the agent to find gaps, contradictions, or trends…"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Emoji">
            <Smile className="size-5" />
          </button>
          <button
            onClick={submit}
            disabled={!draft.trim()}
            aria-label="Send"
            className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Premium AI-native Research Gap Discovery Platform
        </p>
      </div>
    </section>
  )
}
