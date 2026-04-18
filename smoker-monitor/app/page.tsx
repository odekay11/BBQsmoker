'use client'

import { useMqtt } from '@/hooks/useMqtt'
import { useMockMqtt } from '@/hooks/useMockMqtt'
import TemperatureGauge from '@/components/TemperatureGauge'
import TemperatureChart from '@/components/TemperatureChart'
import TargetControl from '@/components/TargetControl'
import SSRStatus from '@/components/SSRStatus'
import SmokerControls from '@/components/SmokerControls'

const useSmokerData = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ? useMockMqtt : useMqtt

const pageLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
}

export default function Home() {
  const {
    chamberTemp, meatTemp, targetTemp, targetMeatTemp, ssrStatus, connected, history,
    isRunning, elapsedSeconds, cookTimerMinutes,
    setTargetTemp, setTargetMeatTemp, startSmoker, stopSmoker, setCookTimer,
  } = useSmokerData()

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'var(--coal)' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 110% 55% at 30% -10%, rgba(249,115,22,0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse 80% 40% at 100% 60%, rgba(56,189,248,0.05) 0%, transparent 50%)',
          ].join(', '),
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-barlow), sans-serif',
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#f5f5f4',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Trashcan Smoker
            </h1>
            <p style={{ ...pageLabelStyle, color: '#44403c', marginTop: '3px' }}>
              Pit Control Console
            </p>
          </div>

          {/* Connection status */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              border: connected
                ? '1px solid rgba(74,222,128,0.2)'
                : '1px solid rgba(239,68,68,0.25)',
              background: connected
                ? 'rgba(74,222,128,0.07)'
                : 'rgba(239,68,68,0.07)',
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: connected ? '#4ade80' : '#ef4444',
                boxShadow: connected
                  ? '0 0 8px rgba(74,222,128,0.8)'
                  : undefined,
                animation: connected ? 'ember-pulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <span
              style={{
                ...pageLabelStyle,
                color: connected ? '#86efac' : '#fca5a5',
                fontSize: '9px',
              }}
            >
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* ── Temperature gauges ── */}
        <div className="flex gap-3">
          <TemperatureGauge
            variant="chamber"
            label="Chamber"
            temp={chamberTemp}
            targetTemp={targetTemp}
          />
          <TemperatureGauge
            variant="meat"
            label="Meat"
            temp={meatTemp}
            targetTemp={targetMeatTemp}
          />
        </div>

        {/* ── SSR status ── */}
        <SSRStatus ssrStatus={ssrStatus} />

        {/* ── Start/Stop + Cook Timer ── */}
        <SmokerControls
          isRunning={isRunning}
          elapsedSeconds={elapsedSeconds}
          cookTimerMinutes={cookTimerMinutes}
          onStart={startSmoker}
          onStop={stopSmoker}
          onSetCookTimer={setCookTimer}
        />

        {/* ── Target controls ── */}
        <div className="flex flex-col gap-3">
          <TargetControl
            label="Chamber"
            targetTemp={targetTemp}
            onSetTarget={setTargetTemp}
          />
          <TargetControl
            label="Meat"
            targetTemp={targetMeatTemp}
            onSetTarget={setTargetMeatTemp}
            min={100}
            max={210}
          />
        </div>

        {/* ── History chart ── */}
        <TemperatureChart history={history} targetTemp={targetTemp} />
      </div>
    </main>
  )
}
