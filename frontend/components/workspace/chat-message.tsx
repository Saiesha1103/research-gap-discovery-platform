"use client"

import { motion } from "framer-motion"
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  ListChecks,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import type { ChatMessage, InsightCard } from "./types"

const ease = [0.22, 1, 0.36, 1] as const

const KIND_ICON = {
  state: Boxes,
  trend: TrendingUp,
  "gap-list": ListChecks,
} as const

export function ChatMessageView({
  message,
  initial,
}: {
  message: ChatMessage
  initial: { name: string }
}) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="flex gap-3"
    >
      <span
        className={
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium " +
          (isUser ? "bg-accent/25 text-foreground" : "bg-node-gap/20 text-node-gap")
        }
      >
        {isUser ? initial.name.charAt(0).toUpperCase() || "U" : <Sparkles className="size-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {isUser ? "You" : "Research Oracle"}
        </p>
        <p className="text-pretty text-[0.95rem] leading-relaxed text-foreground/90">{message.text}</p>

        {message.role === "oracle" && (message.insights || message.contradiction || message.gap) && (
          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {message.insights && (
              <div className="flex flex-col gap-3">
                {message.insights.map((c) => (
                  <InsightRow key={c.label} card={c} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {message.contradiction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, ease }}
                  className="rounded-xl border border-destructive/40 bg-destructive/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-destructive">CONTRADICTION ALERT</p>
                    <AlertTriangle className="size-4 text-destructive" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{message.contradiction.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {message.contradiction.body}
                  </p>
                </motion.div>
              )}

              {message.gap && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, ease }}
                  className="rounded-xl border border-node-gap/50 bg-node-gap/10 p-4"
                  style={{ boxShadow: "0 0 32px color-mix(in oklab, var(--node-gap) 22%, transparent)" }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-node-gap">RESEARCH GAP DISCOVERY</p>
                    <Sparkles className="size-4 text-node-gap" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{message.gap.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{message.gap.body}</p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function InsightRow({ card }: { card: InsightCard }) {
  const Icon = KIND_ICON[card.kind]
  return (
    <button className="group flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-3.5 text-left transition-colors hover:border-ring">
      <span className="mt-0.5 flex size-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{card.label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{card.body}</span>
      </span>
      <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}
