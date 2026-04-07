interface TemperatureGaugeProps {
  label: string
  temp: number | null
  targetTemp?: number
}

function getTempColor(temp: number | null, targetTemp?: number): string {
  if (temp === null || targetTemp === undefined) return 'text-white'
  const diff = Math.abs(temp - targetTemp)
  if (diff <= 10) return 'text-green-400'
  if (diff <= 20) return 'text-amber-400'
  return 'text-red-400'
}

export default function TemperatureGauge({ label, temp, targetTemp }: TemperatureGaugeProps) {
  const colorClass = getTempColor(temp, targetTemp)

  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 rounded-2xl p-6 flex-1">
      <div className={`flex items-start ${colorClass}`}>
        <span className="text-6xl font-bold tabular-nums leading-none">
          {temp !== null ? Math.round(temp) : '---'}
        </span>
        <span className="text-2xl font-semibold mt-1 ml-1">°F</span>
      </div>
      <span className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-wider">{label}</span>
    </div>
  )
}
