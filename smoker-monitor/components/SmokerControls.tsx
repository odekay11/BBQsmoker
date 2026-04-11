'use client'

import { useState } from 'react'
import AppPanel from '@/components/AppPanel'

interface SmokerControlsProps {
  isRunning: boolean
  elapsedSeconds: number
  cookTimerMinutes: number | null
  onStart: () => void
  onStop: () => void
  onSetCookTimer: (minutes: number | null) => void
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export default function SmokerControls({
  isRunning,
  elapsedSeconds,
  cookTimerMinutes,
  onStart,
  onStop,
  onSetCookTimer,
}: SmokerControlsProps) {
  const [timerHours, setTimerHours] = useState(0)
  const [timerMinutes, setTimerMinutes] = useState(0)

  const handleSetTimer = () => {
    const total = timerHours * 60 + timerMinutes
    if (total > 0) onSetCookTimer(total)
  }

  const handleClearTimer = () => {
    onSetCookTimer(null)
    setTimerHours(0)
    setTimerMinutes(0)
  }

  const remaining =
    cookTimerMinutes !== null
      ? Math.max(0, cookTimerMinutes * 60 - elapsedSeconds)
      : null

  const timedOut = remaining === 0

  return (
    <AppPanel className="flex flex-col gap-5 p-4">
      {/* Start / Stop */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={isRunning ? onStop : onStart}
          className={`h-14 w-full rounded-xl text-lg font-bold transition focus-visible:outline-none focus-visible:ring-2 active:scale-[0.99] ${
            isRunning
              ? 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-950/40 focus-visible:ring-red-400/50'
              : 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/35 focus-visible:ring-emerald-400/50'
          }`}
        >
          {isRunning ? '■  Stop' : '▶  Start'}
        </button>

        {/* Stopwatch */}
        <div className="text-center">
          <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Running time
          </p>
          <p
            className={`font-mono text-3xl font-bold tabular-nums tracking-tight ${
              isRunning ? 'text-emerald-400' : 'text-zinc-600'
            }`}
          >
            {formatTime(elapsedSeconds)}
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent" />

      {/* Cook Timer */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Cook timer
        </p>

        {/* Countdown display */}
        {cookTimerMinutes !== null && (
          <div className="mb-3 text-center">
            <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {timedOut ? 'Time Up!' : 'Remaining'}
            </p>
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${
                timedOut ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              {formatTime(remaining!)}
            </p>
          </div>
        )}

        {/* Timer inputs */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col items-center">
            <span className="mb-1 text-[0.65rem] text-zinc-500">Hrs</span>
            <input
              type="number"
              min={0}
              max={24}
              value={timerHours}
              onChange={e => setTimerHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-10 w-14 rounded-xl border border-zinc-600/80 bg-zinc-950/50 text-center text-lg font-semibold tabular-nums text-zinc-100 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/25 sm:w-16"
            />
          </div>
          <span className="pb-2 text-xl font-bold text-zinc-500">:</span>
          <div className="flex flex-col items-center">
            <span className="mb-1 text-[0.65rem] text-zinc-500">Min</span>
            <input
              type="number"
              min={0}
              max={59}
              value={timerMinutes}
              onChange={e =>
                setTimerMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
              }
              className="h-10 w-14 rounded-xl border border-zinc-600/80 bg-zinc-950/50 text-center text-lg font-semibold tabular-nums text-zinc-100 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/25 sm:w-16"
            />
          </div>
          <button
            type="button"
            onClick={handleSetTimer}
            className="h-10 min-w-[4.5rem] flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-sm font-semibold text-amber-950 shadow-md shadow-amber-950/25 transition hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
          >
            Set
          </button>
          {cookTimerMinutes !== null && (
            <button
              type="button"
              onClick={handleClearTimer}
              className="h-10 rounded-xl border border-zinc-600/80 bg-zinc-800/60 px-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </AppPanel>
  )
}
