"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const LEGEND = [
  { label: "Papers", color: "var(--node-paper)" },
  { label: "Contradictions", color: "var(--node-contradiction)" },
  { label: "Gaps", color: "var(--node-gap)" },
]

/* Premium magnetic CTA — glassmorphism, soft blue glow, magnetic hover */
function MagneticCTA({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const mx = e.clientX - (r.left + r.width / 2)
    const my = e.clientY - (r.top + r.height / 2)
    x.set(mx * 0.35)
    y.set(my * 0.45)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onClick={onStart}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-full px-11 py-4 text-sm font-medium uppercase tracking-[0.25em] text-foreground"
    >
      {/* Glass body */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: "color-mix(in oklab, var(--foreground) 8%, transparent)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          border: "1px solid color-mix(in oklab, var(--foreground) 22%, transparent)",
        }}
        aria-hidden="true"
      />
      {/* Soft blue glow that intensifies on hover */}
      <span
        className="absolute -inset-2 rounded-full opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 55%, transparent), transparent)" }}
        aria-hidden="true"
      />
      {/* Sheen sweep */}
      <span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden="true"
      />
      <span className="relative z-10">Start Discovery</span>
    </motion.button>
  )
}

export function HeroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Eyebrow */}
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="mb-5 text-[0.62rem] font-medium uppercase tracking-[0.45em] text-muted-foreground"
      >
        AI-Powered Research Gap Discovery
      </motion.span>

      {/* Headline — reduced ~25% so the universe stays the primary visual */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="text-balance text-center font-sans text-lg font-light leading-tight tracking-[0.18em] text-foreground/90 text-glow sm:text-xl md:text-[1.7rem]"
      >
        WHERE RESEARCH ENDS,
        <br />
        DISCOVERY BEGINS.
      </motion.h1>

      {/* Single premium CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="pointer-events-auto mt-10"
      >
        <MagneticCTA onStart={onStart} />
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-6"
      >
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: l.color, boxShadow: `0 0 10px ${l.color}` }}
              aria-hidden="true"
            />
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              {l.label}
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
