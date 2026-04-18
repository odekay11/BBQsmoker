'use client'

import { useState } from 'react'
import { useMqtt } from '@/hooks/useMqtt'
import { useMockMqtt } from '@/hooks/useMockMqtt'
import AnalogDial from '@/components/AnalogDial'

const useSmokerData = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ? useMockMqtt : useMqtt

// ─── McIntosh palette ────────────────────────────────────────────────────────
const P = {
  bg: '#040406',
  bgPattern: 'radial-gradient(ellipse at 50% 0%, #18181c 0%, #040406 70%)',
  panel: 'linear-gradient(180deg, #141418 0%, #08080a 100%)',
  panelBorder: '#2a2a32',
  ink: '#e8eef6',
  inkMuted: '#6a7a8a',
  accent: '#4ab4ff',
  accentDark: '#1a5a8a',
  chrome: '#c8c8cc',
  chromeDark: '#5a5a62',
  chromeLight: '#f4f4f6',
  green: '#2afa6a',
  greenDark: '#0a5a2a',
  amber: '#ffaa3a',
  red: '#ff4040',
  digitalBg: '#020305',
  digitalText: '#6ac8ff',
  paperBg: '#020305',
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

// ─── Faceplate ───────────────────────────────────────────────────────────────
function Faceplate({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'relative',
      background: P.panel,
      border: `1px solid ${P.panelBorder}`,
      borderRadius: 3,
      padding: '14px 16px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04)',
      ...style,
    }}>
      <Bolt style={{ top: '50%', left: -8, transform: 'translateY(-50%)' }} />
      <Bolt style={{ top: '50%', right: -8, transform: 'translateY(-50%)' }} />
      {children}
    </div>
  )
}

function Bolt({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      width: 14, height: 14, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${P.chromeLight}, ${P.chrome} 55%, ${P.chromeDark})`,
      border: `1px solid ${P.chromeDark}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.5)',
      zIndex: 2,
      ...style,
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '20%', right: '20%', height: 1.2,
        background: P.chromeDark, transform: 'translateY(-50%)',
      }} />
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ connected }: { connected: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 0' }}>
      <div>
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 26, lineHeight: 1, color: P.chromeLight,
          letterSpacing: 4, fontWeight: 500,
          textShadow: `0 0 12px ${P.accent}40`,
        }}>TRASHCAN</div>
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 11, letterSpacing: 6,
          color: P.accent, marginTop: 2, fontWeight: 400,
          textShadow: `0 0 8px ${P.accent}`,
        }}>SMOKER · MKII</div>
      </div>
      <ConnectedLamp on={connected} />
    </div>
  )
}

function ConnectedLamp({ on }: { on: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: on
          ? `radial-gradient(circle at 35% 30%, #fff 0%, ${P.green} 55%, ${P.greenDark} 100%)`
          : 'radial-gradient(circle at 35% 30%, #3a3a3a, #0a0a0a)',
        boxShadow: on
          ? `0 0 10px ${P.green}, inset 0 -1px 2px rgba(0,0,0,0.4)`
          : 'inset 0 -1px 2px rgba(0,0,0,0.6)',
        border: `1px solid ${P.chromeDark}`,
      }} />
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.inkMuted, fontWeight: 500 }}>
        {on ? 'LINK' : 'NO SIG'}
      </div>
    </div>
  )
}

// ─── Status strip ────────────────────────────────────────────────────────────
function StatusStrip({ ssrStatus, isRunning }: { ssrStatus: boolean; isRunning: boolean }) {
  const status = !isRunning ? 'IDLE' : ssrStatus ? 'HEATING' : 'HOLDING'
  const map = {
    IDLE:    { color: P.inkMuted, pulse: false, on: false },
    HEATING: { color: P.amber,    pulse: true,  on: true  },
    HOLDING: { color: P.green,    pulse: false, on: true  },
  }
  const s = map[status]
  return (
    <Faceplate style={{ marginTop: 12, padding: '10px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: P.inkMuted, fontWeight: 500 }}>ELEMENT</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusLamp on={s.on} color={s.color} pulse={s.pulse} />
          <div style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 20, letterSpacing: 4, fontWeight: 500,
            color: s.on ? s.color : P.inkMuted,
            textShadow: s.on ? `0 0 10px ${s.color}aa` : 'none',
          }}>{status}</div>
        </div>
      </div>
    </Faceplate>
  )
}

function StatusLamp({ on, color, pulse }: { on: boolean; color: string; pulse: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: on
        ? `radial-gradient(circle at 35% 30%, #fff 0%, ${color} 55%, ${color} 100%)`
        : 'radial-gradient(circle at 35% 30%, #3a3a3a, #0a0a0a)',
      boxShadow: on
        ? `0 0 12px ${color}, inset 0 -1px 2px rgba(0,0,0,0.3)`
        : 'inset 0 -1px 2px rgba(0,0,0,0.6)',
      border: `1px solid ${P.chromeDark}`,
      animation: pulse ? 'lampPulse 1.4s ease-in-out infinite' : 'none',
    }} />
  )
}

// ─── Control deck ────────────────────────────────────────────────────────────
interface ControlDeckProps {
  isRunning: boolean
  elapsedSeconds: number
  cookTimerMinutes: number | null
  remaining: number | null
  onStart: () => void
  onStop: () => void
  onSetCookTimer: (minutes: number | null) => void
}

function ControlDeck({
  isRunning, elapsedSeconds, cookTimerMinutes, remaining, onStart, onStop, onSetCookTimer,
}: ControlDeckProps) {
  const [hours, setHours] = useState(0)
  const [mins, setMins] = useState(0)
  const handleSet = () => { const total = hours * 60 + mins; if (total > 0) onSetCookTimer(total) }
  const handleClear = () => { onSetCookTimer(null); setHours(0); setMins(0) }
  const timedOut = remaining === 0

  return (
    <Faceplate style={{ marginTop: 12, padding: '18px 18px 16px' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
        <PowerSwitch on={isRunning} onToggle={isRunning ? onStop : onStart} />
        <HourCounter seconds={elapsedSeconds} running={isRunning} label="ELAPSED" />
      </div>

      <div style={{
        height: 1, margin: '16px 0 14px',
        background: 'linear-gradient(90deg, transparent, rgba(74,180,255,0.25), transparent)',
      }} />

      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: P.inkMuted, marginBottom: 10, fontWeight: 500 }}>
          COOK TIMER
        </div>

        {cookTimerMinutes !== null && (
          <div style={{
            marginBottom: 12, padding: '8px 12px',
            background: P.digitalBg,
            border: `1px solid ${P.panelBorder}`,
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.7)',
          }}>
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: P.amber, fontWeight: 500 }}>
              {timedOut ? 'TIME UP' : 'REMAINING'}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 22, letterSpacing: 3, fontWeight: 500,
              color: timedOut ? P.red : P.digitalText,
              textShadow: `0 0 8px ${timedOut ? P.red : P.digitalText}aa`,
            }}>
              {formatTime(remaining ?? 0)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <NumberDial label="HRS" value={hours} onChange={v => setHours(Math.max(0, Math.min(24, v)))} />
          <NumberDial label="MIN" value={mins} onChange={v => setMins(Math.max(0, Math.min(59, v)))} />
          <button onClick={handleSet} style={primaryButtonStyle}>SET</button>
          {cookTimerMinutes !== null && (
            <button onClick={handleClear} style={ghostButtonStyle}>CLR</button>
          )}
        </div>
      </div>
    </Faceplate>
  )
}

function PowerSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 92, padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
    }}>
      <div style={{
        background: P.digitalBg,
        border: `1px solid ${P.panelBorder}`,
        borderRadius: 3, padding: '8px 6px',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7)',
      }}>
        <div style={{
          fontSize: 9, letterSpacing: 2.5, textAlign: 'center',
          color: on ? '#4a4a4a' : P.red, fontWeight: 500, marginBottom: 4,
          textShadow: !on ? `0 0 6px ${P.red}` : 'none',
        }}>STOP</div>
        <div style={{
          width: '100%', height: 42,
          background: '#050508',
          border: `1px solid ${P.panelBorder}`, borderRadius: 2,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 3, right: 3,
            top: on ? '50%' : 3,
            bottom: on ? 3 : '50%',
            background: `linear-gradient(180deg, ${P.chromeLight}, ${P.chrome} 60%, ${P.chromeDark})`,
            border: `1px solid ${P.chromeDark}`,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.6)',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 16, height: 1.5, background: P.chromeDark, borderRadius: 1 }} />
          </div>
        </div>
        <div style={{
          fontSize: 9, letterSpacing: 2.5, textAlign: 'center',
          color: on ? P.green : '#4a4a4a', fontWeight: 500, marginTop: 4,
          textShadow: on ? `0 0 6px ${P.green}` : 'none',
        }}>RUN</div>
      </div>
    </button>
  )
}

function HourCounter({ seconds, running, label }: { seconds: number; running: boolean; label: string }) {
  const parts = formatTime(seconds).split(':')
  return (
    <div style={{
      flex: 1, background: P.digitalBg,
      border: `1px solid ${P.panelBorder}`, borderRadius: 3,
      padding: '8px 10px',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
    }}>
      <div style={{ fontSize: 9, letterSpacing: 2.5, color: P.amber, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {parts.map((part, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <span style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 24, color: P.digitalText, opacity: 0.3, lineHeight: 1,
              }}>:</span>
            )}
            <span style={{
              padding: '2px 6px',
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 24, fontWeight: 500, letterSpacing: 2,
              color: running ? P.digitalText : '#2a3a4a',
              textShadow: running ? `0 0 10px ${P.digitalText}cc, 0 0 2px ${P.digitalText}` : 'none',
              minWidth: 40, textAlign: 'center', lineHeight: 1,
            }}>{part}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function NumberDial({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 8, letterSpacing: 2, color: P.inkMuted, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => onChange(value + 1)} style={stepperBtnStyle}>▲</button>
        <div style={{
          width: 46, height: 34,
          background: P.digitalBg,
          border: `1px solid ${P.panelBorder}`, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 22, fontWeight: 500, letterSpacing: 2,
          color: P.digitalText,
          textShadow: `0 0 6px ${P.digitalText}aa`,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
        }}>
          {String(value).padStart(2, '0')}
        </div>
        <button onClick={() => onChange(value - 1)} style={stepperBtnStyle}>▼</button>
      </div>
    </div>
  )
}

const stepperBtnStyle: React.CSSProperties = {
  width: 46, height: 16,
  background: `linear-gradient(180deg, ${P.chromeLight}, ${P.chrome} 55%, ${P.chromeDark})`,
  border: `1px solid ${P.chromeDark}`,
  borderRadius: 2, cursor: 'pointer', fontSize: 8, color: '#1a1a1a',
  padding: 0,
  boxShadow: '0 1px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '0 16px', height: 42,
  background: `linear-gradient(180deg, ${P.accent} 0%, ${P.accentDark} 100%)`,
  border: `1px solid ${P.accentDark}`,
  borderRadius: 2,
  fontFamily: "'Barlow Condensed',sans-serif",
  fontSize: 13, letterSpacing: 3, fontWeight: 500,
  color: '#ffffff', cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25)',
}

const ghostButtonStyle: React.CSSProperties = {
  padding: '0 14px', height: 42,
  background: `linear-gradient(180deg, ${P.chromeLight}, ${P.chrome} 55%, ${P.chromeDark})`,
  border: `1px solid ${P.chromeDark}`,
  borderRadius: 2,
  fontFamily: "'Barlow Condensed',sans-serif",
  fontSize: 12, letterSpacing: 2, fontWeight: 500,
  color: '#1a1a1a', cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.5)',
}

// ─── Target knob ─────────────────────────────────────────────────────────────
function TargetKnob({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  const handle = (delta: number) => onChange(Math.max(min, Math.min(max, value + delta)))
  const pct = (value - min) / (max - min)
  return (
    <Faceplate style={{ marginTop: 12, padding: '14px 18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: P.inkMuted, fontWeight: 500 }}>{label}</div>
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 24, fontWeight: 500, letterSpacing: 2,
          color: P.digitalText,
          textShadow: `0 0 8px ${P.digitalText}aa`,
        }}>{value}°F</div>
      </div>
      <div style={{ position: 'relative', height: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => handle(-step)} style={roundBtnStyle}>−</button>
        <div style={{ position: 'relative', flex: 1, height: 32, display: 'flex', alignItems: 'center' }}>
          {/* Track */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 8, background: P.digitalBg,
            borderRadius: 1, border: `1px solid ${P.panelBorder}`,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
            transform: 'translateY(-50%)',
          }} />
          {/* Tick marks */}
          {[...Array(11)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i / 10) * 100}%`, top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1, height: i % 5 === 0 ? 12 : 7,
              background: P.inkMuted, opacity: 0.6,
            }} />
          ))}
          {/* Fill */}
          <div style={{
            position: 'absolute', left: 0, top: '50%',
            width: `${pct * 100}%`, height: 8,
            background: `linear-gradient(90deg, ${P.accentDark}, ${P.accent})`,
            borderRadius: 1, transform: 'translateY(-50%)',
            boxShadow: `0 0 8px ${P.accent}80`,
            pointerEvents: 'none',
          }} />
          {/* Thumb */}
          <div style={{
            position: 'absolute',
            left: `${pct * 100}%`, top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 26, height: 26,
            background: `radial-gradient(circle at 35% 30%, ${P.chromeLight}, ${P.chrome} 55%, ${P.chromeDark})`,
            border: `1px solid ${P.chromeDark}`, borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)',
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: 4, right: 4, height: 1.5,
              background: P.chromeDark, transform: 'translateY(-50%)', borderRadius: 1,
            }} />
          </div>
          {/* Hidden range input */}
          <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(parseInt(e.target.value))}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
        </div>
        <button onClick={() => handle(step)} style={roundBtnStyle}>+</button>
      </div>
    </Faceplate>
  )
}

const roundBtnStyle: React.CSSProperties = {
  width: 34, height: 34,
  background: `radial-gradient(circle at 35% 30%, ${P.chromeLight}, ${P.chrome} 55%, ${P.chromeDark})`,
  border: `1px solid ${P.chromeDark}`, borderRadius: '50%',
  cursor: 'pointer', fontSize: 18, fontWeight: 500, color: '#1a1a1a',
  boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)',
  padding: 0, lineHeight: 1,
}

// ─── Chart recorder ──────────────────────────────────────────────────────────
interface HistoryEntry { time: string; chamber: number; meat: number }

function ChartRecorder({ history, targetTemp }: { history: HistoryEntry[]; targetTemp: number }) {
  const w = 360; const h = 180
  const padL = 32, padR = 10, padT = 12, padB = 22
  const iw = w - padL - padR
  const ih = h - padT - padB
  const yMin = 50, yMax = 350
  const xToPx = (i: number) => padL + (i / Math.max(1, history.length - 1)) * iw
  const yToPx = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * ih
  const chamberPath = history.map((e, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(i)} ${yToPx(e.chamber)}`).join(' ')
  const meatPath    = history.map((e, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(i)} ${yToPx(e.meat)}`).join(' ')
  const gridCol     = 'rgba(74,180,255,0.15)'
  const gridColBold = 'rgba(74,180,255,0.3)'
  const chamberCol  = '#4ab4ff'
  const meatCol     = '#ffaa3a'

  return (
    <Faceplate style={{ marginTop: 12, padding: '14px 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: P.inkMuted, fontWeight: 500 }}>HISTORY</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <LegendDot color={chamberCol} label="CHAMBER" />
          <LegendDot color={meatCol} label="MEAT" />
        </div>
      </div>

      <div style={{
        background: P.paperBg,
        border: `1px solid ${P.panelBorder}`,
        borderRadius: 2,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.9)',
        overflow: 'hidden',
      }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
          {[...Array(13)].map((_, i) => (
            <line key={`v${i}`}
              x1={padL + (i / 12) * iw} y1={padT}
              x2={padL + (i / 12) * iw} y2={h - padB}
              stroke={i % 6 === 0 ? gridColBold : gridCol}
              strokeWidth={i % 6 === 0 ? 0.6 : 0.4}
            />
          ))}
          {[...Array(11)].map((_, i) => (
            <line key={`h${i}`}
              x1={padL} y1={padT + (i / 10) * ih}
              x2={w - padR} y2={padT + (i / 10) * ih}
              stroke={i % 5 === 0 ? gridColBold : gridCol}
              strokeWidth={i % 5 === 0 ? 0.6 : 0.4}
            />
          ))}
          {[100, 150, 200, 250, 300].map(v => (
            <text key={v}
              x={padL - 6} y={yToPx(v) + 3}
              textAnchor="end"
              fill={P.inkMuted}
              style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 500 }}
            >{v}</text>
          ))}
          <line
            x1={padL} y1={yToPx(targetTemp)}
            x2={w - padR} y2={yToPx(targetTemp)}
            stroke={P.green} strokeWidth="1" strokeDasharray="4 3" opacity="0.6"
          />
          <text
            x={w - padR - 3} y={yToPx(targetTemp) - 4}
            textAnchor="end" fill={P.green}
            style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 500 }}
          >TGT {targetTemp}°</text>

          {history.length > 0 && (
            <>
              <path d={meatPath} fill="none" stroke={meatCol} strokeWidth="1.8"
                strokeLinejoin="round" strokeLinecap="round" opacity="0.9"
                style={{ filter: `drop-shadow(0 0 3px ${meatCol}aa)` }}
              />
              <path d={chamberPath} fill="none" stroke={chamberCol} strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 3px ${chamberCol})` }}
              />
              <circle
                cx={xToPx(history.length - 1)}
                cy={yToPx(history[history.length - 1].chamber)}
                r="3" fill={chamberCol}
              />
              <circle
                cx={xToPx(history.length - 1)}
                cy={yToPx(history[history.length - 1].meat)}
                r="3" fill={meatCol}
              />
            </>
          )}
        </svg>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '8px 2px 0',
        fontSize: 9, letterSpacing: 1.5, color: P.inkMuted, fontWeight: 500,
      }}>
        <span>−2h 30m</span>
        <span>−1h 15m</span>
        <span>NOW</span>
      </div>
    </Faceplate>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.inkMuted, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function FooterPlate() {
  return (
    <div style={{
      marginTop: 18, textAlign: 'center',
      fontSize: 9, letterSpacing: 4, color: P.inkMuted,
      opacity: 0.8, fontWeight: 500,
    }}>
      MODEL MKII · SERIAL 0137 · MADE IN GARAGE
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Home() {
  const {
    chamberTemp, meatTemp, targetTemp, targetMeatTemp, ssrStatus, connected, history,
    isRunning, elapsedSeconds, cookTimerMinutes,
    setTargetTemp, setTargetMeatTemp, startSmoker, stopSmoker, setCookTimer,
  } = useSmokerData()

  const remaining = cookTimerMinutes !== null
    ? Math.max(0, cookTimerMinutes * 60 - elapsedSeconds)
    : null

  const chamberZones = [
    { from: 50,  to: 175, color: P.inkMuted },
    { from: 175, to: 275, color: P.green },
    { from: 275, to: 550, color: P.red },
  ]
  const meatZones = [
    { from: 50,  to: 135, color: P.inkMuted },
    { from: 135, to: 195, color: P.green },
    { from: 195, to: 250, color: P.red },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: P.bgPattern,
      backgroundColor: P.bg,
      padding: '18px 14px 32px',
      fontFamily: "'Barlow Condensed','Helvetica Neue',Helvetica,sans-serif",
      color: P.ink,
      maxWidth: 440,
      margin: '0 auto',
    }}>
      <Header connected={connected} />

      <Faceplate style={{ marginTop: 14, padding: '22px 16px 18px' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <AnalogDial
            value={chamberTemp} target={targetTemp}
            min={50} max={550} label="CHAMBER" unit="°F"
            size={180} zones={chamberZones}
          />
          <AnalogDial
            value={meatTemp} target={targetMeatTemp}
            min={50} max={250} label="MEAT" unit="°F"
            size={180} zones={meatZones}
          />
        </div>
      </Faceplate>

      <StatusStrip ssrStatus={ssrStatus} isRunning={isRunning} />

      <ControlDeck
        isRunning={isRunning}
        elapsedSeconds={elapsedSeconds}
        cookTimerMinutes={cookTimerMinutes}
        remaining={remaining}
        onStart={startSmoker}
        onStop={stopSmoker}
        onSetCookTimer={setCookTimer}
      />

      <TargetKnob
        label="CHAMBER TARGET" value={targetTemp}
        min={150} max={350} step={5} onChange={setTargetTemp}
      />
      <TargetKnob
        label="MEAT TARGET" value={targetMeatTemp}
        min={100} max={210} step={5} onChange={setTargetMeatTemp}
      />

      <ChartRecorder history={history} targetTemp={targetTemp} />

      <FooterPlate />
    </div>
  )
}
