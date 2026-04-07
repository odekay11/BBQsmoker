'use client'

import { useState } from 'react'

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
    <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-4">
      {/* Start / Stop */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={isRunning ? onStop : onStart}
          className={`w-full h-14 font-bold text-lg rounded-xl transition-colors ${
            isRunning
              ? 'bg-red-500 hover:bg-red-400 active:bg-red-600 text-white'
              : 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white'
          }`}
        >
          {isRunning ? '■  Stop' : '▶  Start'}
        </button>

        {/* Stopwatch */}
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Running Time</p>
          <p
            className={`text-3xl font-mono font-bold tabular-nums ${
              isRunning ? 'text-green-400' : 'text-gray-600'
            }`}
          >
            {formatTime(elapsedSeconds)}
          </p>
        </div>
      </div>

      {/* Cook Timer */}
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">Cook Timer</p>

        {/* Countdown display */}
        {cookTimerMinutes !== null && (
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {timedOut ? 'Time Up!' : 'Remaining'}
            </p>
            <p
              className={`text-2xl font-mono font-bold tabular-nums ${
                timedOut ? 'text-red-400' : 'text-orange-400'
              }`}
            >
              {formatTime(remaining!)}
            </p>
          </div>
        )}

        {/* Timer inputs */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Hrs</span>
            <input
              type="number"
              min={0}
              max={24}
              value={timerHours}
              onChange={e => setTimerHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 h-10 bg-gray-700 text-white text-center text-lg font-semibold rounded-xl border border-gray-600 focus:outline-none focus:border-orange-400"
            />
          </div>
          <span className="text-gray-400 text-xl font-bold pb-2">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Min</span>
            <input
              type="number"
              min={0}
              max={59}
              value={timerMinutes}
              onChange={e =>
                setTimerMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
              }
              className="w-16 h-10 bg-gray-700 text-white text-center text-lg font-semibold rounded-xl border border-gray-600 focus:outline-none focus:border-orange-400"
            />
          </div>
          <button
            onClick={handleSetTimer}
            className="flex-1 h-10 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Set
          </button>
          {cookTimerMinutes !== null && (
            <button
              onClick={handleClearTimer}
              className="h-10 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-xl transition-colors text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
