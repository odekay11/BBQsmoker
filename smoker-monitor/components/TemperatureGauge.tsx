import AppPanel from '@/components/AppPanel'

interface TemperatureGaugeProps {
  label: string
  temp: number | null
  targetTemp?: number
  variant?: 'chamber' | 'meat'
}

function getTempColor(temp: number | null, targetTemp?: number): string {
  if (temp === null || targetTemp === undefined) return 'text-zinc-100'
  const diff = Math.abs(temp - targetTemp)
  if (diff <= 10) return 'text-orange-400'
  if (diff <= 20) return 'text-amber-400'
  return 'text-red-400'
}

const glowByVariant = {
  chamber:
    'bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,146,60,0.14),transparent_58%)]',
  meat: 'bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.12),transparent_58%)]',
} as const

export default function TemperatureGauge({
  label,
  temp,
  targetTemp,
  variant = 'chamber',
}: TemperatureGaugeProps) {
  const colorClass = getTempColor(temp, targetTemp)

  return (
    <AppPanel className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-6">
      <div
        className={`pointer-events-none absolute inset-0 ${glowByVariant[variant]}`}
        aria-hidden
      />
      <div className={`relative flex items-start ${colorClass}`}>
        <span className="text-6xl font-bold tabular-nums leading-none tracking-tight">
          {temp !== null ? Math.round(temp) : '---'}
        </span>
        <span className="ml-0.5 mt-1 text-lg font-medium text-zinc-500">°F</span>
      </div>
      <span className="relative mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
    </AppPanel>
  )
}
