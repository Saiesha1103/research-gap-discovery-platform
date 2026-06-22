import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KnowledgeUniverse } from "./universe/knowledge-universe";

// ==========================================
// TYPES & INTERFACES
// ==========================================

type AgentStatus = "idle" | "running" | "complete";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  color: string;
}

interface Message {
  id: string;
  sender: string;
  role: "user" | "agent";
  text: string;
  timestamp: string;
  agentId?: string;
  highlightColor?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  active: boolean;
}

// ==========================================
// CUSTOM SVG ICONS (No external dependencies)
// ==========================================

const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="w-4 h-4 text-neutral-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const CloudUploadIcon = () => (
  <svg
    className="w-12 h-12 text-blue-500/80 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

const ShieldAlertIcon = () => (
  <svg
    className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg
    className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM18 10.5l-.5-3.5-3.5-.5 3.5-.5.5-3.5.5 3.5 3.5.5-3.5.5-.5 3.5z"
    />
  </svg>
);

// ==========================================
// MOCK WORKSPACE DATA
// ==========================================

const INITIAL_SESSIONS: Session[] = [];
const RECENT_ANALYSES: any[] = [];
const SAVED_REPORTS: any[] = [];

const INITIAL_AGENTS: Agent[] = [
  {
    id: "collector",
    name: "Research Collector",
    role: "Citation Swarm",
    status: "idle",
    color: "text-blue-400 border-blue-500/20",
  },
  {
    id: "analysis",
    name: "Paper Analysis Agent",
    role: "Methodology Deconstructor",
    status: "idle",
    color: "text-indigo-400 border-indigo-500/20",
  },
  {
    id: "contradiction",
    name: "Contradiction Detection",
    role: "Inconsistency Parser",
    status: "idle",
    color: "text-rose-400 border-rose-500/20",
  },
  {
    id: "gap",
    name: "Research Gap Finder",
    role: "Novelty Mapping Unit",
    status: "idle",
    color: "text-amber-400 border-amber-500/20",
  },
  {
    id: "report",
    name: "Report Generation",
    role: "Synthesis Swarm",
    status: "idle",
    color: "text-emerald-400 border-emerald-500/20",
  },
];

const AGENT_WORKFLOW_STEPS = [
  {
    agentId: "collector",
    status: "running" as AgentStatus,
    message: {
      id: "m1",
      sender: "Research Collector",
      role: "agent" as const,
      text: "Research papers detected. Extracting metadata, citations, authors, publication information, and references from uploaded documents.",
      timestamp: "00:01",
      agentId: "collector",
    },
  },
  {
    agentId: "collector",
    status: "complete" as AgentStatus,
  },
  {
    agentId: "analysis",
    status: "running" as AgentStatus,
    message: {
      id: "m2",
      sender: "Paper Analysis Agent",
      role: "agent" as const,
      text: "Analyzing methodologies, datasets, experimental setups, assumptions, limitations, and key findings across uploaded research papers.",
      timestamp: "00:03",
      agentId: "analysis",
    },
  },
  {
    agentId: "analysis",
    status: "complete" as AgentStatus,
  },
  {
    agentId: "contradiction",
    status: "running" as AgentStatus,
    message: {
      id: "m3",
      sender: "Contradiction Detection Agent",
      role: "agent" as const,
      text: "Searching for conflicting conclusions, inconsistent experimental results, contradictory assumptions, and unresolved disagreements across papers.",
      timestamp: "00:06",
      agentId: "contradiction",
      highlightColor: "rose",
    },
  },
  {
    agentId: "contradiction",
    status: "complete" as AgentStatus,
  },
  {
    agentId: "gap",
    status: "running" as AgentStatus,
    message: {
      id: "m4",
      sender: "Research Gap Finder",
      role: "agent" as const,
      text: "Identifying underexplored research directions, unanswered questions, missing evaluations, and potential opportunities for future investigation.",
      timestamp: "00:09",
      agentId: "gap",
      highlightColor: "amber",
    },
  },
  {
    agentId: "gap",
    status: "complete" as AgentStatus,
  },
  {
    agentId: "report",
    status: "running" as AgentStatus,
    message: {
      id: "m5",
      sender: "Report Generation",
      role: "agent" as const,
      text: "Generating structured literature review, contradiction summary, research gap analysis, and final recommendation report.",
      timestamp: "00:12",
      agentId: "report",
    },
  },
  {
    agentId: "report",
    status: "complete" as AgentStatus,
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ResearchWorkspace() {
  const [sessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [topic, setTopic] = useState("");
  const [researchResult, setResearchResult] = useState<any>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Execute the simulation timeline
  const triggerPipelineRun = (analysisData: any) => {
    setIsUploading(true);

    // Simulate initial scanning/processing of uploaded assets
    setTimeout(() => {
      setIsUploading(false);
      setIsUploaded(true);

      let stepIdx = 0;

      const runNextStep = () => {
        if (stepIdx >= AGENT_WORKFLOW_STEPS.length) return;

        const step = AGENT_WORKFLOW_STEPS[stepIdx];

        // Update Agent status in state (influencing the sidebar states and knowledge graph displays)
        setAgents((prev) =>
          prev.map((a) =>
            a.id === step.agentId ? { ...a, status: step.status } : a,
          ),
        );

        // Append message payload to the conversation timeline
        if (step.message) {
          let messageText = step.message.text;

          if (analysisData?.results) {
            if (step.agentId === "analysis") {
              messageText = analysisData.results.synthesis || "";
            }

            if (step.agentId === "contradiction") {
              messageText = analysisData.results.contradictions || "";
            }

            if (step.agentId === "gap") {
              messageText = analysisData.results.gaps || "";
            }

            if (step.agentId === "report") {
              messageText = analysisData.results.report || "";
            }
          }
          setMessages((prev) => [
            ...prev,
            {
              ...step.message,
              text: messageText,
              id: `${step.message.id}-${Date.now()}-${Math.random()}`,
            } as Message,
          ]);
        }

        stepIdx++;
        const nextDelay = step.status === "running" ? 2200 : 1000;
        setTimeout(runNextStep, nextDelay);
      };

      setTimeout(runNextStep, 500);
    }, 1800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "Researcher",
      role: "user",
      text: inputText,
      timestamp: "Now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Simulate Agent response
    setTimeout(() => {
      const coordinatorResponse: Message = {
        id: `coord-${Date.now()}`,
        sender: "Research Swarm Coordinator",
        role: "agent",
        text: "Analyzing your parameter injection. Re-running the simulation suggests adjusting the continuous-wave threshold bounds to 75mK to mitigate the coherence decay trend identified in Paper A.",
        timestamp: "Now",
        highlightColor: "indigo",
      };
      setMessages((prev) => [...prev, coordinatorResponse]);
    }, 1200);
  };

  const handleResetWorkspace = () => {
    setIsUploaded(false);
    setIsUploading(false);
    setMessages([]);
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "idle" })));
  };

  // Helper flags for structural rendering of the Knowledge Graph based on agent state transitions
  const showCollectorNodes =
    agents.find((a) => a.id === "collector")?.status === "complete";
  const showContradictionNode =
    agents.find((a) => a.id === "contradiction")?.status === "complete";
  const showGapNode = agents.find((a) => a.id === "gap")?.status === "complete";
  const totalAgents = agents.length;

  const completedAgents = agents.filter((a) => a.status === "complete").length;

  const progress = (completedAgents / totalAgents) * 100;

  return (
    <div className="grid grid-cols-5 h-screen overflow-hidden bg-[#030303] text-neutral-200 font-sans antialiased relative">
      {/* Background ambient lighting glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.03),transparent_40%)] pointer-events-none" />

      {/* ==========================================
          LEFT SIDEBAR return(20%): Session Management
          ========================================== */}
      <div className="col-span-1 border-r border-neutral-900 bg-[#070707]/90 backdrop-blur-xl flex flex-col justify-between h-full relative z-10 select-none">
        {/* Swarm OS Logo Header */}
        <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            <h1 className="text-xs tracking-[0.2em] font-medium text-neutral-300 uppercase">
              SYNTHESIS OS
            </h1>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800 font-mono">
            v1.2
          </span>
        </div>

        {/* Navigation Core */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <button
            onClick={handleResetWorkspace}
            className="w-full flex items-center justify-center gap-2 text-xs py-2 px-3 rounded-md bg-neutral-950 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition duration-150 text-neutral-300 shadow-sm"
          >
            <PlusIcon />
            <span>New Research Session</span>
          </button>

          {/* Previous Sessions */}
          <div>
            <h2 className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-2 px-1">
              Previous Sessions
            </h2>
            <div className="space-y-1">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.id !== "1") {
                      setIsUploaded(true);
                      setMessages([]);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition text-xs ${
                    s.active && isUploaded
                      ? "bg-neutral-900/80 border border-neutral-800/60 text-white shadow-inner"
                      : "hover:bg-neutral-900/40 text-neutral-400 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${s.active && isUploaded ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" : "bg-neutral-700"}`}
                    />
                    <span className="truncate">{s.title}</span>
                  </div>
                  <span className="text-[9px] text-neutral-600 shrink-0 font-mono">
                    {s.date}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Analyses list */}
          <div>
            <h2 className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-2 px-1">
              Recent Analyses
            </h2>
            {RECENT_ANALYSES.length === 0 && (
              <div className="p-2 rounded bg-[#090909] border border-neutral-900/60">
                <div className="flex flex-col items-center py-3">
                  <span className="text-cyan-400 text-lg">◈</span>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    No analyses yet
                  </p>
                  <p className="text-[9px] text-neutral-600">
                    Upload literature to begin discovery.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {RECENT_ANALYSES.map((analysis, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[#090909] border border-neutral-900/60 hover:border-neutral-800/80 transition group cursor-default"
                >
                  <div className="text-[11px] text-neutral-300 font-medium truncate group-hover:text-neutral-200 transition">
                    {analysis.title}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-mono mt-0.5">
                    {analysis.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Reports list */}
          <div>
            <h2 className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-2 px-1">
              Saved Reports
            </h2>
            {SAVED_REPORTS.length === 0 && (
              <div className="flex flex-col items-center py-3 rounded bg-[#090909] border border-neutral-900/60">
                <span className="text-emerald-400 text-lg">◈</span>

                <p className="text-[11px] text-neutral-400 mt-1">
                  No reports generated yet
                </p>

                <p className="text-[9px] text-neutral-600">
                  Synthesis reports will appear here.
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              {SAVED_REPORTS.map((report, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded hover:bg-neutral-950 transition cursor-pointer border border-transparent hover:border-neutral-900/40"
                >
                  <div className="flex items-center gap-2 truncate">
                    <DocumentIcon />
                    <span className="text-[11px] text-neutral-400 truncate">
                      {report.title}
                    </span>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 bg-neutral-950 border border-neutral-900 text-neutral-500 font-mono uppercase">
                    {report.format}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-neutral-900 flex items-center justify-between text-xs bg-neutral-950/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-mono text-[10px] text-white">
              RE
            </div>
            <div>
              <div className="text-neutral-300 font-medium">
                Active Research Session
              </div>

              <div className="text-[10px] text-neutral-500">
                Multi-Agent Research Platform
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CENTER PANEL (60%): Focus Core Workspace
          ========================================== */}
      <div className="col-span-3 flex flex-col h-full bg-[#050505] relative overflow-hidden">
        {/* Subtle grid pattern background mapping */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293706_1px,transparent_1px),linear-gradient(to_bottom,#1f293706_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Screen Header */}
        <header className="h-20 border-b border-neutral-900 bg-[#070707]/60 backdrop-blur-md px-6 flex flex-col justify-center relative z-10 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">
                WORKSPACE /
              </span>

              <span className="text-xs font-semibold text-neutral-200">
                ACTIVE SESSION SWARM
              </span>

              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            {isUploaded && (
              <button
                onClick={handleResetWorkspace}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 bg-neutral-900/50 border border-neutral-800 px-2.5 py-1 rounded transition"
              >
                Reset Session
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-neutral-500">
            <span>Papers: {uploadedFiles.length}</span>
            <span>Contradictions: 1</span>
            <span>Research Gaps: 1</span>
            <span>Confidence: 94%</span>
          </div>
          <div className="mt-2 w-full">
            <div className="flex justify-between text-[9px] text-neutral-500 mb-1">
              <span>Pipeline Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {isUploaded && (
            <button
              onClick={handleResetWorkspace}
              className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 bg-neutral-900/50 border border-neutral-800 px-2.5 py-1 rounded transition"
            >
              Reset Session
            </button>
          )}
        </header>

        {/* Interactive Workspace Area */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10 flex flex-col">
          <AnimatePresence mode="wait">
            {!isUploaded && !isUploading ? (
              /* INITIAL Drag-and-Drop Area */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="max-w-xl w-full text-center space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-xl font-medium text-white tracking-tight">
                      Multi-Agent Research Intelligence
                    </h2>
                    <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                      Upload research literature and orchestrate autonomous
                      agents to discover contradictions, hidden assumptions, and
                      unexplored research opportunities.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-medium">
                      Research Topic Discovery
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Large Language Models"
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition"
                      />

                      <button
                        onClick={async () => {
                          try {
                            
                            setIsResearching(true);
                            const response = await fetch(
                              "http://127.0.0.1:8000/research",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  topic,
                                }),
                              },
                            );

                            if (!response.ok) {
                              throw new Error(
                                `Backend Error: ${response.status}`,
                              );
                            }

                            const data = await response.json();

                            setResearchResult(data);
                            triggerPipelineRun(data);
                            setIsResearching(false);
                          } catch (error) {
                            console.error(error);
                            setError(
                              "Research pipeline temporarily unavailable. Please try again in a minute.",
                            );
                            setIsResearching(false);
                          }
                        }}
                        className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm hover:bg-cyan-500/20 transition"
                      >
                        {isResearching ? "Analyzing..." : "Discover"}
                      </button>
                    </div>

                    <div className="text-[10px] text-neutral-500">
                      Search arXiv and launch the research swarm automatically.
                    </div>
                    {error && (
                      <div className="mt-4 border border-red-500/30 bg-red-500/10 rounded-lg p-3 text-red-400 text-xs">
                        {error}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    hidden
                    id="pdf-upload"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);

                      if (files.length === 0) return;

                      if (files[0].type !== "application/pdf") {
                        setError("Please upload a PDF file.");
                        return;
                      }

                      if (files[0].size > 20 * 1024 * 1024) {
                        setError("PDF must be under 20 MB.");
                        return;
                      }

                      setError("");

                      if (files.length > 0) {
                        setUploadedFiles(files);

                        const formData = new FormData();
                        formData.append("file", files[0]);
                        setIsUploading(true);

                        try {
                          const uploadResponse = await fetch(
                            "http://127.0.0.1:8000/upload-pdf",
                            {
                              method: "POST",
                              body: formData,
                            },
                          );

                          const uploadData = await uploadResponse.json();

                          const analysisResponse = await fetch(
                            "http://127.0.0.1:8000/analyze-pdf",
                            {
                              method: "POST",
                            },
                          );

                          const analysisData = await analysisResponse.json();
                          if (
                            analysisData.results?.synthesis?.includes("429")
                          ) {
                            alert(
                              "Gemini quota exceeded. Please try again later.",
                            );
                          }

                          setIsUploaded(true);
                          triggerPipelineRun(analysisData);
                          setIsUploading(false);

                          //triggerPipelineRun();
                        } catch (error) {
                          console.error(error);

                          setIsUploading(false);

                          setError("Failed to upload PDF. Please try again.");
                        }
                      }
                    }}
                  />
                  <div className="group border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 via-[#080808]/90 to-[#080808]/95 backdrop-blur-md rounded-xl p-12 transition-all duration-500 relative overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.10)] hover:shadow-[0_0_120px_rgba(34,211,238,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition duration-300" />
                    <div className="absolute top-0 left-0 w-full h-px bg-cyan-400/40 animate-pulse" />
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <div className="group-hover:scale-105 transition duration-300">
                        <div className="relative">
                          <div className="absolute inset-0 blur-xl bg-cyan-500/20 rounded-full" />
                          <CloudUploadIcon />
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-blue-400 transition mb-1">
                        Initialize Research Intelligence
                      </h3>
                      <p className="text-xs text-neutral-400 mb-0.5">
                        Drop PDFs here or click to browse
                      </p>
                      <p className="text-[10px] text-neutral-600 font-mono">
                        Contradictions • Gaps • Synthesis Reports
                      </p>
                      <label
                        htmlFor="pdf-upload"
                        className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition cursor-pointer"
                      >
                        Select PDF Files
                      </label>
                      <button
                        onClick={triggerPipelineRun}
                        className="mt-4 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
                      >
                        Simulate Upload & Analysis
                      </button>
                    </div>
                  </div>

                  {/* Trust factors footer */}
                  <div className="flex items-center justify-center gap-3 text-neutral-500 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      Encrypted Sandbox
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span>Isolated Swarm Nodes</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span>Grounded Verification Only</span>
                  </div>
                </div>
              </motion.div>
            ) : isUploading ? (
              /* INTERMEDIATE LOADING OVERLAY */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xs tracking-widest text-neutral-400 uppercase font-mono">
                    Deploying Swarm Intelligence...
                  </h3>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Parsing PDF metadata layers & initializing query routing
                    arrays
                  </p>
                </div>
              </motion.div>
            ) : (
              /* POST-UPLOAD CHAT WORKFLOW */
              <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                {/* Scrollable conversation timeline */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {uploadedFiles.length > 0 && (
                    <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
                      <h3 className="text-xs uppercase tracking-wider text-neutral-400 mb-3">
                        Uploaded Papers ({uploadedFiles.length})
                      </h3>

                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="text-sm text-neutral-300 flex items-center gap-2"
                          >
                            📄 {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isUser = msg.role === "user";

                    const isContradiction = msg.highlightColor === "rose";
                    const isGap = msg.highlightColor === "amber";
                    const isIndigo = msg.highlightColor === "indigo";

                    return (
                      <React.Fragment key={msg.id}>
                        {!isUser && (
                          <div className="ml-3 w-px h-6 bg-gradient-to-b from-cyan-500/40 to-transparent" />
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          {/* Message Metadata */}
                          <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-neutral-500 font-mono">
                            <span>{msg.sender}</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>

                          {/* Text bubble with contextual highlights */}
                          <div
                            className={`p-3.5 rounded-lg text-xs leading-relaxed border transition-all ${
                              isUser
                                ? "bg-neutral-900 border-neutral-800 text-neutral-200"
                                : isContradiction
                                  ? "bg-rose-500/5 border-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                                  : isGap
                                    ? "bg-amber-500/5 border-amber-500/20 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                                    : isIndigo
                                      ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                                      : "bg-neutral-900/40 backdrop-blur-md border-neutral-800/60 text-neutral-300"
                            }`}
                          >
                            <div className="flex gap-2">
                              {isContradiction && <ShieldAlertIcon />}
                              {isGap && <SparklesIcon />}
                              <div className="whitespace-pre-wrap text-neutral-300">
                                {msg.text}
                              </div>
                              {msg.sender === "Report Generation" && (
                                <button
                                  className="mt-3 px-3 py-1 rounded border border-emerald-500/20 text-emerald-400 text-[10px] hover:bg-emerald-500/10 transition"
                                  onClick={() => {
                                    const blob = new Blob([msg.text], {
                                      type: "text/plain",
                                    });

                                    const url = URL.createObjectURL(blob);

                                    const a = document.createElement("a");

                                    a.href = url;
                                    a.download = "research-report.txt";

                                    a.click();

                                    URL.revokeObjectURL(url);
                                  }}
                                >
                                  DOWNLOAD report
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                  {researchResult && (
                    <div className="mt-6 border border-cyan-500/20 bg-neutral-950/60 rounded-xl p-4">
                      <h3 className="text-cyan-400 font-semibold mb-4">
                        Research Intelligence Report
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white text-sm mb-2">Synthesis</h4>

                          <p className="text-xs text-neutral-300 whitespace-pre-wrap">
                            {researchResult.results?.synthesis}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-red-400 text-sm mb-2">
                            Contradictions
                          </h4>

                          <p className="text-xs text-neutral-300 whitespace-pre-wrap">
                            {researchResult.results?.contradictions}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-400 text-sm mb-2">
                            Research Gaps
                          </h4>

                          <p className="text-xs text-neutral-300 whitespace-pre-wrap">
                            {researchResult.results?.gaps}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Bottom Input Area */}
                <form onSubmit={handleSendMessage} className="pt-2">
                  <div className="relative rounded-lg bg-[#090909] border border-neutral-800 hover:border-neutral-700 transition focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-700 p-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask the swarm to deep-dive specific methodologies..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-transparent border-0 outline-none text-xs text-neutral-200 placeholder-neutral-600 focus:ring-0 px-2 py-1"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-1.5 rounded-md bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <SendIcon />
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-1.5 mt-1.5 text-[9px] text-neutral-600 font-mono select-none">
                    <span>Press Enter to query active swarm</span>
                    <span>5 Agents Operating</span>
                  </div>
                </form>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==========================================
          RIGHT SIDEBAR (20%): Swarm Monitor & Graph
          ========================================== */}
      <div className="col-span-1 border-l border-neutral-900 bg-[#070707]/90 backdrop-blur-xl flex flex-col justify-between h-full relative z-10 select-none">
        {/* Swarm Status Diagnostics */}
        <div className="flex-1 p-4 flex flex-col overflow-y-auto space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase">
                Live Agent Monitoring
              </h2>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isUploaded ? "bg-emerald-500 animate-pulse" : "bg-neutral-700"}`}
                />
                <span className="text-[9px] text-neutral-500 font-mono uppercase">
                  {isUploaded ? "swarm active" : "awaiting ingestion"}
                </span>
              </div>
            </div>

            {/* Live Monitoring Stack */}

            <div className="mb-3 p-2 rounded-lg border border-neutral-900 bg-[#090909]">
              <div className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">
                Swarm Status
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-cyan-400">
                  {agents.filter((a) => a.status === "running").length} Active
                </span>

                <span className="text-emerald-400">
                  {agents.filter((a) => a.status === "complete").length}{" "}
                  Complete
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {agents.map((agent) => {
                const isIdle = agent.status === "idle";
                const isRunning = agent.status === "running";
                const isComplete = agent.status === "complete";

                return (
                  <div
                    key={agent.id}
                    className={`p-2.5 rounded border bg-neutral-950/40 transition-all duration-300 ${
                      isRunning
                        ? `${agent.color} shadow-[0_0_35px_rgba(34,211,238,0.15)] bg-neutral-900/40 scale-[1.02]`
                        : "border-neutral-900"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className={`text-[11px] font-semibold ${agent.color.split(" ")[0]}`}
                        >
                          {agent.name}
                        </div>
                        <div className="text-[9px] text-neutral-500 font-mono">
                          {agent.role}
                        </div>
                      </div>

                      {/* State Chips */}
                      <div className="flex items-center gap-1.5">
                        {isIdle && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-600 text-[8px] font-mono uppercase border border-neutral-800">
                            idle
                          </span>
                        )}
                        {isRunning && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-mono uppercase border border-blue-500/20 animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
                            running
                          </span>
                        )}
                        {isComplete && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono uppercase border border-emerald-500/20">
                            complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Knowledge Graph Panel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase">
                Research Intelligence Map
              </h2>
              <span className="text-[9px] text-neutral-500 font-mono">
                Live Network
              </span>
            </div>
            <div className="relative border border-cyan-900/30 rounded-lg bg-[#090909] p-2.5 overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.08)]">
              {/* Dynamic SVG Graph scaling paths according to running actions */}
              <svg viewBox="0 0 200 160" className="w-full h-48">
                {/* Connections (Lines) */}
                <motion.line
                  x1="45"
                  y1="45"
                  x2="100"
                  y2="80"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showContradictionNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />
                <motion.line
                  x1="155"
                  y1="35"
                  x2="100"
                  y2="80"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showContradictionNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />
                <motion.line
                  x1="100"
                  y1="80"
                  x2="150"
                  y2="120"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showGapNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />
                <motion.line
                  x1="155"
                  y1="35"
                  x2="150"
                  y2="120"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showGapNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />
                <motion.line
                  x1="55"
                  y1="125"
                  x2="150"
                  y2="120"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showGapNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />
                <motion.line
                  x1="120"
                  y1="25"
                  x2="100"
                  y2="80"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showGapNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />

                <motion.line
                  x1="25"
                  y1="95"
                  x2="100"
                  y2="80"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showGapNode ? 1 : 0 }}
                  transition={{ duration: 1.2 }}
                />

                {/* Nodes rendering based on live state progress */}

                {/* Blue Nodes: Research Papers */}
                <g>
                  <motion.circle
                    cx="45"
                    cy="45"
                    r="4.5"
                    fill="#3b82f6"
                    initial={{ scale: 0 }}
                    animate={{ scale: showCollectorNodes ? 1 : 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  />
                  {showCollectorNodes && (
                    <circle
                      cx="45"
                      cy="45"
                      r="8"
                      stroke="#3b82f6"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.2"
                      className="animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                  )}
                </g>

                <g>
                  <motion.circle
                    cx="155"
                    cy="35"
                    r="5.5"
                    fill="#3b82f6"
                    initial={{ scale: 0 }}
                    animate={{ scale: showCollectorNodes ? 1 : 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  />
                </g>

                <g>
                  <motion.circle
                    cx="55"
                    cy="125"
                    r="5.5"
                    fill="#3b82f6"
                    initial={{ scale: 0 }}
                    animate={{ scale: showCollectorNodes ? 1 : 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  />
                </g>
                <g>
                  <motion.circle
                    cx="120"
                    cy="25"
                    r="5.5"
                    fill="#3b82f6"
                    initial={{ scale: 0 }}
                    animate={{ scale: showCollectorNodes ? 1 : 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  />
                </g>

                <g>
                  <motion.circle
                    cx="25"
                    cy="95"
                    r="5.5"
                    fill="#3b82f6"
                    initial={{ scale: 0 }}
                    animate={{ scale: showCollectorNodes ? 1 : 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  />
                </g>

                {/* Red Node: Contradiction */}
                <g>
                  <motion.circle
                    cx="100"
                    cy="80"
                    r="5.5"
                    fill="#ef4444"
                    initial={{ scale: 0 }}
                    animate={{ scale: showContradictionNode ? 1 : 0 }}
                    transition={{ type: "spring", damping: 10 }}
                  />
                  {showContradictionNode && (
                    <motion.circle
                      cx="100"
                      cy="80"
                      r="10"
                      stroke="#ef4444"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.3"
                      animate={{ scale: [1, 1.8, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </g>

                {/* Gold Node: Research Gap */}
                <g>
                  <motion.circle
                    cx="150"
                    cy="120"
                    r="6.5"
                    fill="#f59e0b"
                    initial={{ scale: 0 }}
                    animate={{ scale: showGapNode ? 1 : 0 }}
                    transition={{ type: "spring", damping: 8 }}
                  />
                  {showGapNode && (
                    <motion.circle
                      cx="150"
                      cy="120"
                      r="12"
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      fill="none"
                      opacity="0.3"
                      animate={{ scale: [1, 2, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    />
                  )}
                </g>
              </svg>

              {/* Legend map */}
              <div className="flex items-center justify-between border-t border-neutral-900 pt-2 mt-1.5 text-[8.5px] font-mono text-neutral-500">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Blue: Papers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Red: Contradictions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Gold: Gaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Pipeline Health Badge */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950/20 text-[10px] text-neutral-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-mono">Swarm Matrix Connected</span>
          </div>
          <span className="font-mono text-[9px] text-neutral-600">42ms</span>
        </div>
      </div>
    </div>
  );
}
