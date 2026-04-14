'use client'

import { useState, useEffect, useCallback } from 'react'
import AppPanel from '@/components/AppPanel'

interface TargetControlProps {
  targetTemp: number
  onSetTarget: (temp: number) => void
}

const MIN_TEMP = 150
const MAX_TEMP = 350

export default function TargetControl({ targetTemp, onSetTarget }: TargetControlProps) {
  const clamp = useCallback(
    (val: number) => Math.min(MAX_TEMP, Math.max(MIN_TEMP, val)),
    [],
  )

  const [draft, setDraft] = useState(() => String(targetTemp))

  useEffect(() => {
    setDraft(String(targetTemp))
  }, [targetTemp])

  const commitDraft = useCallback(() => {
    const parsed = parseInt(draft, 10)
    if (draft === '' || Number.isNaN(parsed)) {
      setDraft(String(targetTemp))
      return targetTemp
    }
    const next = clamp(parsed)
    setDraft(String(next))
    return next
  }, [draft, targetTemp, clamp])

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '' || /^\d+$/.test(raw)) {
      setDraft(raw)
    }
  }

  const handleBlur = () => {
    if (draft === '') {
      setDraft(String(targetTemp))
      return
    }
    const parsed = parseInt(draft, 10)
    if (!Number.isNaN(parsed)) {
      setDraft(String(clamp(parsed)))
    }
  }

  const handleDecrement = () => {
    const parsed = parseInt(draft, 10)
    const base = Number.isNaN(parsed) ? targetTemp : parsed
    setDraft(String(clamp(base - 5)))
  }

  const handleIncrement = () => {
    const parsed = parseInt(draft, 10)
    const base = Number.isNaN(parsed) ? targetTemp : parsed
    setDraft(String(clamp(base + 5)))
  }

  const handleSet = () => {
    const next = commitDraft()
    onSetTarget(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSet()
    }
  }

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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={draft}
          onChange={handleDraftChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label="Target temperature in degrees Fahrenheit"
          placeholder={`${MIN_TEMP}–${MAX_TEMP}`}
          className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-600/80 bg-zinc-950/50 px-2 text-center text-xl font-semibold tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30 sm:max-w-[5.5rem] sm:flex-none sm:px-3"
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
