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
    chamberTemp, meatTemp, targetTemp, ssrStatus, connected, history,
    isRunning, elapsedSeconds, cookTimerMinutes,
    setTargetTemp, startSmoker, stopSmoker, setCookTimer,
  } = useSmokerData()

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Trashcan Smoker!</h1>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Temperature gauges */}
        <div className="flex gap-3">
          <TemperatureGauge label="Chamber" temp={chamberTemp} targetTemp={targetTemp} />
          <TemperatureGauge label="Meat" temp={meatTemp} />
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

        {/* Target control */}
        <TargetControl targetTemp={targetTemp} onSetTarget={setTargetTemp} />

        {/* Chart */}
        <TemperatureChart history={history} targetTemp={targetTemp} />
      </div>
    </main>
  )
}
