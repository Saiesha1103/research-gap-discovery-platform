"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, X } from "lucide-react"

export type Researcher = { name: string; email: string }

export function DiscoveryModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (r: Researcher) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const valid = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-title"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{ boxShadow: "0 0 80px color-mix(in oklab, var(--accent) 22%, transparent)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <span className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-muted-foreground">
          Initialize Session
        </span>
        <h2
          id="discovery-title"
          className="mt-3 text-balance text-2xl font-light leading-tight tracking-wide text-foreground"
        >
          Enter the knowledge universe
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tell the agent who you are. It will begin mapping the gaps in your field.
        </p>

        <form
          className="mt-7 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (valid) onSubmit({ name: name.trim(), email: email.trim() })
          }}
        >
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Ada Lovelace"
              autoFocus
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@institute.edu"
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </Field>

          <button
            type="submit"
            disabled={!valid}
            className="group mt-3 flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ boxShadow: "0 0 36px color-mix(in oklab, var(--accent) 30%, transparent)" }}
          >
            Begin Discovery
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3 transition-colors focus-within:border-ring">
      <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
