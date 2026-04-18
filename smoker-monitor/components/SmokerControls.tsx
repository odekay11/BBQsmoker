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

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#57534e',
}

const inputClass =
  'h-11 w-14 rounded-lg text-center text-lg font-bold tabular-nums focus:outline-none sm:w-16'

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
      {/* ── Start / Stop + Stopwatch ── */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={isRunning ? onStop : onStart}
          className="h-14 w-full rounded-xl text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 active:scale-[0.99]"
          style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            ...(isRunning
              ? {
                  background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fee2e2',
                  boxShadow: '0 4px 20px -4px rgba(185,28,28,0.6)',
                }
              : {
                  background: 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
                  color: '#dcfce7',
                  boxShadow: '0 4px 20px -4px rgba(21,128,61,0.6)',
                }),
          }}
        >
          {isRunning ? '■  Stop Session' : '▶  Start Session'}
        </button>

        {/* Stopwatch */}
        <div className="flex flex-col items-center gap-1">
          <span style={labelStyle}>Running time</span>
          <span
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '-1px',
              color: isRunning ? '#4ade80' : '#44403c',
              transition: 'color 0.4s ease',
            }}
          >
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(58,46,34,0.9), transparent)' }}
      />

      {/* ── Cook Timer ── */}
      <div className="flex flex-col gap-3">
        <span style={labelStyle}>Cook timer</span>

        {/* Countdown */}
        {cookTimerMinutes !== null && (
          <div className="flex flex-col items-center gap-1 py-1">
            <span style={{ ...labelStyle, color: timedOut ? '#f87171' : '#78716c' }}>
              {timedOut ? 'Time Up!' : 'Remaining'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '24px',
                fontWeight: 700,
                color: timedOut ? '#f87171' : '#fbbf24',
                letterSpacing: '-1px',
              }}
            >
              {formatTime(remaining!)}
            </span>
          </div>
        )}

        {/* Inputs */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col items-center gap-1">
            <span style={labelStyle}>Hrs</span>
            <input
              type="number"
              min={0}
              max={24}
              value={timerHours}
              onChange={e => setTimerHours(Math.max(0, parseInt(e.target.value) || 0))}
              className={inputClass}
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                background: '#0c0a09',
                border: '1px solid rgba(58,46,34,0.8)',
                color: '#f5f5f4',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
              }}
            />
          </div>

          <span
            className="pb-2 text-xl font-bold"
            style={{ color: '#44403c', fontFamily: 'var(--font-space-mono), monospace' }}
          >
            :
          </span>

          <div className="flex flex-col items-center gap-1">
            <span style={labelStyle}>Min</span>
            <input
              type="number"
              min={0}
              max={59}
              value={timerMinutes}
              onChange={e =>
                setTimerMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
              }
              className={inputClass}
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                background: '#0c0a09',
                border: '1px solid rgba(58,46,34,0.8)',
                color: '#f5f5f4',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleSetTimer}
            className="h-11 min-w-16 flex-1 rounded-lg font-bold transition-all active:scale-[0.98] focus-visible:outline-none"
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              letterSpacing: '0.14em',
              fontSize: '13px',
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
              color: '#1c1108',
              boxShadow: '0 3px 14px -4px rgba(180,83,9,0.55)',
            }}
          >
            Set
          </button>

          {cookTimerMinutes !== null && (
            <button
              type="button"
              onClick={handleClearTimer}
              className="h-11 rounded-lg px-3 font-bold transition-all focus-visible:outline-none active:scale-[0.98]"
              style={{
                fontFamily: 'var(--font-barlow), sans-serif',
                letterSpacing: '0.12em',
                fontSize: '12px',
                textTransform: 'uppercase',
                background: '#1a1614',
                border: '1px solid rgba(58,46,34,0.8)',
                color: '#78716c',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </AppPanel>
  )
}
