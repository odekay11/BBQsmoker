import type { ReactNode } from 'react'

type AppPanelProps = {
  children: ReactNode
  className?: string
}

/**
 * Shared surface for the UI prototype: depth, border, subtle blur.
 */
export default function AppPanel({ children, className = '' }: AppPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-zinc-900/65 shadow-2xl shadow-black/55 ring-1 ring-inset ring-white/[0.04] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  )
}
