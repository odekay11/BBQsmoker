'use client'

import { useState, useEffect, useCallback } from 'react'
import AppPanel from '@/components/AppPanel'

interface TargetControlProps {
  targetTemp: number
  onSetTarget: (temp: number) => void
  label?: string
  min?: number
  max?: number
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#57534e',
}

const stepBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  flexShrink: 0,
  borderRadius: '10px',
  fontSize: '22px',
  fontWeight: 700,
  background: '#1a1614',
  border: '1px solid rgba(58,46,34,0.8)',
  color: '#a8a29e',
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
  fontFamily: 'var(--font-barlow), sans-serif',
}

export default function TargetControl({
  targetTemp,
  onSetTarget,
  label,
  min = 150,
  max = 350,
}: TargetControlProps) {
  const clamp = useCallback(
    (val: number) => Math.min(max, Math.max(min, val)),
    [min, max],
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
    if (raw === '' || /^\d+$/.test(raw)) setDraft(raw)
  }

  const handleBlur = () => {
    if (draft === '') { setDraft(String(targetTemp)); return }
    const parsed = parseInt(draft, 10)
    if (!Number.isNaN(parsed)) setDraft(String(clamp(parsed)))
  }

  const handleDecrement = () => {
    const base = Number.isNaN(parseInt(draft, 10)) ? targetTemp : parseInt(draft, 10)
    setDraft(String(clamp(base - 5)))
  }

  const handleIncrement = () => {
    const base = Number.isNaN(parseInt(draft, 10)) ? targetTemp : parseInt(draft, 10)
    setDraft(String(clamp(base + 5)))
  }

  const handleSet = () => {
    const next = commitDraft()
    onSetTarget(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSet() }
  }

  return (
    <AppPanel className="px-4 py-3.5">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex flex-col gap-0.5">
          {label && (
            <span style={{ ...labelStyle, color: '#d97706', letterSpacing: '0.18em' }}>
              {label}
            </span>
          )}
          <span style={labelStyle}>Target temperature</span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '20px',
            fontWeight: 700,
            color: '#f5f5f4',
            letterSpacing: '-0.5px',
          }}
        >
          {targetTemp}°
          <span style={{ fontSize: '11px', color: '#78716c', marginLeft: '2px' }}>F</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          aria-label="Decrease by 5"
          style={stepBtnStyle}
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
          placeholder={`${min}–${max}`}
          className="h-11 min-w-0 flex-1 rounded-lg px-2 text-center focus:outline-none sm:max-w-[5rem] sm:flex-none sm:px-3"
          style={{
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '20px',
            fontWeight: 700,
            background: '#0c0a09',
            border: '1px solid rgba(58,46,34,0.8)',
            color: '#f5f5f4',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
          }}
        />

        <button
          type="button"
          onClick={handleIncrement}
          aria-label="Increase by 5"
          style={stepBtnStyle}
        >
          +
        </button>

        <button
          type="button"
          onClick={handleSet}
          className="h-11 min-w-0 flex-1 rounded-lg font-bold transition-all active:scale-[0.98] focus-visible:outline-none"
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
      </div>
    </AppPanel>
  )
}
