"use client"

import { Suspense, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { KnowledgeGraph, type Phase } from "./knowledge-graph"

export function KnowledgeUniverse({ phase }: { phase: Phase }) {
  const pointer = useRef({ x: 0, y: 0 })
  const rawPointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      rawPointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      rawPointer.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("pointermove", onMove)

    // Smooth (eased) pointer so parallax feels weighty and cinematic
    let raf = 0
    const tick = () => {
      pointer.current.x += (rawPointer.current.x - pointer.current.x) * 0.06
      pointer.current.y += (rawPointer.current.y - pointer.current.y) * 0.06
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 32], fov: 62, near: 0.1, far: 400 }}
        dpr={[1, 2]}
        onCreated={({ gl }) => gl.setClearColor("#000000", 1)}
      >
        <fog attach="fog" args={["#000000", 38, 150]} />
        <Suspense fallback={null}>
          <KnowledgeGraph phase={phase} pointer={pointer} />
        </Suspense>
      </Canvas>

      {/* Cinematic vignette + soft volumetric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 35%, color-mix(in oklab, var(--background) 70%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 55%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
