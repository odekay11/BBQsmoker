interface SSRStatusProps {
  ssrStatus: boolean
}

export default function SSRStatus({ ssrStatus }: SSRStatusProps) {
  if (ssrStatus) {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200 shadow-[0_0_24px_-4px_rgba(251,191,36,0.45)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
          Heating
        </span>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-600/80 bg-zinc-800/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        Idle
      </span>
    </div>
  )
}
