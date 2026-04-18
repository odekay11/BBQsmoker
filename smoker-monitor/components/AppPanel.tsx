import type { ReactNode } from 'react'

type AppPanelProps = {
  children: ReactNode
  className?: string
}

export default function AppPanel({ children, className = '' }: AppPanelProps) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--panel-border)',
        boxShadow: '0 6px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.025)',
      }}
    >
      {children}
    </div>
  )
}
