interface SSRStatusProps {
  ssrStatus: boolean
}

export default function SSRStatus({ ssrStatus }: SSRStatusProps) {
  if (ssrStatus) {
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          Heating
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex items-center gap-2 bg-gray-700/50 text-gray-400 border border-gray-600 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider">
        <span className="w-2 h-2 bg-gray-500 rounded-full" />
        Idle
      </span>
    </div>
  )
}
