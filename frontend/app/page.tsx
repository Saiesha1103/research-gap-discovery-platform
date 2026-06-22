"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { KnowledgeUniverse } from "@/components/universe/knowledge-universe";
import { HeroOverlay } from "@/components/hero-overlay";
import { DiscoveryModal, type Researcher } from "@/components/discovery-modal";
import ResearchWorkspace from "@/components/research-workspace";
import type { Phase } from "@/components/universe/knowledge-graph";
import LiquidEtherBackground from "@/components/liq-ether-background";

type Stage = "hero" | "modal" | "transition" | "workspace";

export default function Page() {
  const [stage, setStage] = useState<Stage>("hero");
  const [researcher, setResearcher] = useState<Researcher | null>(null);

  const phase: Phase =
    stage === "transition"
      ? "collapsing"
      : stage === "workspace"
      ? "workspace"
      : "hero";

  const handleSubmit = (r: Researcher) => {
    setResearcher(r);
    setStage("transition");

    window.setTimeout(() => {
      setStage("workspace");
    }, 1500);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Hero Background */}
      {stage === "hero" ? (
        <LiquidEtherBackground />
      ) : (
        <KnowledgeUniverse phase={phase} />
      )}

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 45%, color-mix(in oklab, black 75%, transparent) 100%)",
        }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {stage === "hero" && (
          <HeroOverlay
            key="hero"
            onStart={() => setStage("modal")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "modal" && (
          <DiscoveryModal
            key="modal"
            onClose={() => setStage("hero")}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "workspace" && researcher && (
          <ResearchWorkspace
            key="workspace"
          />
        )}
      </AnimatePresence>
    </main>
  );
}