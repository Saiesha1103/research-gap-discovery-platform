"use client"

import { motion } from "framer-motion"
import {
  ChevronsLeft,
  FileText,
  FolderClosed,
  HelpCircle,
  LayoutGrid,
  Library,
  Plus,
  Settings,
  Users,
} from "lucide-react"
import type { Session } from "./types"

const SESSIONS: Session[] = [
  { id: "s1", title: "CRISPR Gene Editing Trends", ago: "11 minutes ago" },
  { id: "s2", title: "Quantum Computing Architectures", ago: "3 minutes ago" },
  { id: "s3", title: "LLM Interpretability", ago: "3 minutes ago" },
]

const PREVIOUS = ["Harmonic Analyses", "Computing AI Analyses", "Cancer Analysis Cluster"]
const RAIL = [LayoutGrid, Users, FolderClosed, Library, Settings]

export function WorkspaceSidebar({
  researcher,
  onNewSession,
}: {
  researcher: { name: string; email: string }
  onNewSession: () => void
}) {
  const initial = researcher.name.trim().charAt(0).toUpperCase() || "R"

  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-border bg-[color-mix(in_oklab,var(--background)_82%,oklch(0.16_0.03_265))] lg:flex">
      <div className="flex h-full">
        {/* Icon rail */}
        <nav className="flex w-14 flex-col items-center gap-1 border-r border-border py-5">
          <span className="mb-4 flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Library className="size-5" />
          </span>
          {RAIL.map((Icon, i) => (
            <button
              key={i}
              className={
                "flex size-9 items-center justify-center rounded-xl transition-colors " +
                (i === 0
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
              }
            >
              <Icon className="size-[18px]" />
            </button>
          ))}
          <div className="mt-auto flex flex-col items-center gap-1">
            <button className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground">
              <HelpCircle className="size-[18px]" />
            </button>
            <span className="mt-1 flex size-8 items-center justify-center overflow-hidden rounded-full bg-accent/25 text-xs font-medium text-foreground">
              {initial}
            </span>
          </div>
        </nav>

        {/* Main sidebar column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-5">
            <span className="text-sm font-semibold tracking-[0.2em] text-foreground">GAPFINDER</span>
            <ChevronsLeft className="size-4 text-muted-foreground" />
          </div>

          <div className="px-4">
            <button
              onClick={onNewSession}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
            >
              New Research Session
            </button>
          </div>

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto px-4 pb-6">
            <Group title="Research Sessions" action>
              {SESSIONS.map((s, i) => (
                <button
                  key={s.id}
                  className={
                    "block w-full rounded-lg px-3 py-2.5 text-left transition-colors " +
                    (i === 0 ? "bg-secondary/70" : "hover:bg-secondary/40")
                  }
                >
                  <p className="truncate text-sm text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.ago}</p>
                </button>
              ))}
            </Group>

            <Group title="Previous Analyses">
              {PREVIOUS.map((p) => (
                <button
                  key={p}
                  className="block w-full truncate rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </Group>

            <Group title="Saved Reports" action>
              <SavedItem icon={FileText} label="Save Reports" />
              <SavedItem icon={FolderClosed} label="Saved Reports" />
            </Group>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Group({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-2 flex items-center justify-between px-3">
        <h4 className="text-[0.6rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {title}
        </h4>
        {action ? <Plus className="size-3.5 text-muted-foreground" /> : null}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </motion.div>
  )
}

function SavedItem({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground">
      <Icon className="size-4" />
      {label}
    </button>
  )
}
