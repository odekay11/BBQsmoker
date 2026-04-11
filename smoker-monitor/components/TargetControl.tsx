'use client'

import { useState } from 'react'
import AppPanel from '@/components/AppPanel'

interface TargetControlProps {
  targetTemp: number
  onSetTarget: (temp: number) => void
}

const MIN_TEMP = 150
const MAX_TEMP = 350

export default function TargetControl({ targetTemp, onSetTarget }: TargetControlProps) {
  const [inputValue, setInputValue] = useState<number>(targetTemp)

  const clamp = (val: number) => Math.min(MAX_TEMP, Math.max(MIN_TEMP, val))

  const handleDecrement = () => setInputValue(prev => clamp(prev - 5))
  const handleIncrement = () => setInputValue(prev => clamp(prev + 5))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) setInputValue(clamp(val))
  }
  const handleSet = () => onSetTarget(inputValue)

  return (
    <AppPanel className="p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        Target temperature
      </p>
      <p className="mb-4 text-sm text-zinc-400">
        SET:{' '}
        <span className="font-semibold tabular-nums text-zinc-100">{targetTemp}°F</span>
      </p>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-800/80 text-2xl font-bold text-zinc-100 transition hover:bg-zinc-700/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          aria-label="Decrease by 5"
        >
          −
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          min={MIN_TEMP}
          max={MAX_TEMP}
          className="h-12 w-20 shrink-0 rounded-xl border border-zinc-600/80 bg-zinc-950/50 text-center text-xl font-semibold tabular-nums text-zinc-100 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30 sm:w-24"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-800/80 text-2xl font-bold text-zinc-100 transition hover:bg-zinc-700/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          aria-label="Increase by 5"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleSet}
          className="h-12 min-w-0 flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 font-semibold text-amber-950 shadow-lg shadow-amber-900/30 transition hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
        >
          Set
        </button>
      </div>
    </AppPanel>
  )
}
