export type AgentState = "idle" | "active" | "processing" | "queued" | "done"

export type Agent = {
  id: string
  name: string
  detail: string
  state: AgentState
  tone: "paper" | "contradiction" | "gap" | "neutral"
}

export type InsightCard = {
  label: string
  body: string
  kind: "state" | "trend" | "gap-list"
}

export type ChatMessage = {
  id: string
  role: "user" | "oracle"
  text: string
  insights?: InsightCard[]
  contradiction?: { title: string; body: string }
  gap?: { title: string; body: string }
}

export type Session = { id: string; title: string; ago: string }
