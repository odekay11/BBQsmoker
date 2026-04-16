'use client'

import { useMqtt } from '@/hooks/useMqtt'
import { useMockMqtt } from '@/hooks/useMockMqtt'
import TemperatureGauge from '@/components/TemperatureGauge'
import TemperatureChart from '@/components/TemperatureChart'
import TargetControl from '@/components/TargetControl'
import SSRStatus from '@/components/SSRStatus'
import SmokerControls from '@/components/SmokerControls'

const useSmokerData = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ? useMockMqtt : useMqtt

export default function Home() {
  const {
    chamberTemp, meatTemp, targetTemp, targetMeatTemp, ssrStatus, connected, history,
    isRunning, elapsedSeconds, cookTimerMinutes,
    setTargetTemp, setTargetMeatTemp, startSmoker, stopSmoker, setCookTimer,
  } = useSmokerData()

  return (
    <main className="relative min-h-screen overflow-x-hidden text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,146,60,0.12),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(56,189,248,0.06),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(251,146,60,0.05),transparent_50%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-lg flex-col gap-5 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Trashcan Smoker
          </h1>
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              connected
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-red-500'}`}
            />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Temperature gauges */}
        <div className="flex gap-3">
          <TemperatureGauge
            variant="chamber"
            label="Chamber"
            temp={chamberTemp}
            targetTemp={targetTemp}
          />
          <TemperatureGauge variant="meat" label="Meat" temp={meatTemp} targetTemp={targetMeatTemp} />
        </div>

        {/* SSR status */}
        <SSRStatus ssrStatus={ssrStatus} />

        {/* Start/Stop, stopwatch, cook timer */}
        <SmokerControls
          isRunning={isRunning}
          elapsedSeconds={elapsedSeconds}
          cookTimerMinutes={cookTimerMinutes}
          onStart={startSmoker}
          onStop={stopSmoker}
          onSetCookTimer={setCookTimer}
        />

        {/* Target controls */}
        <div className="flex flex-col gap-3">
          <TargetControl label="Chamber" targetTemp={targetTemp} onSetTarget={setTargetTemp} />
          <TargetControl
            label="Meat"
            targetTemp={targetMeatTemp}
            onSetTarget={setTargetMeatTemp}
            min={100}
            max={210}
          />
        </div>

        {/* Chart */}
        <TemperatureChart history={history} targetTemp={targetTemp} />
      </div>
    </main>
  )
}
