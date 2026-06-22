"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, UploadCloud, X } from "lucide-react"

export function UploadZone({
  papers,
  onAdd,
  onRemove,
}: {
  papers: string[]
  onAdd: (names: string[]) => void
  onRemove: (name: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const names = Array.from(list).map((f) => f.name)
    if (names.length) onAdd(names)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-8 transition-colors " +
          (dragging
            ? "border-accent bg-accent/10"
            : "border-border bg-secondary/20 hover:border-ring hover:bg-secondary/30")
        }
      >
        <motion.span
          animate={{ y: dragging ? -4 : 0 }}
          className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent"
        >
          <UploadCloud className="size-5" />
        </motion.span>
        <span className="text-sm font-medium text-foreground">Drop Research Papers</span>
        <span className="text-xs text-muted-foreground">PDF, arXiv links, or DOI — click to browse</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </button>

      <AnimatePresence>
        {papers.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-wrap gap-2 overflow-hidden"
          >
            {papers.map((p) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 py-1.5 pl-3 pr-2 text-xs text-foreground"
              >
                <FileText className="size-3.5 text-node-paper" />
                <span className="max-w-[180px] truncate">{p}</span>
                <button
                  onClick={() => onRemove(p)}
                  aria-label={`Remove ${p}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
