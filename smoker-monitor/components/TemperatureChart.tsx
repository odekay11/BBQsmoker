'use client'

import AppPanel from '@/components/AppPanel'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface HistoryEntry {
  time: string
  chamber: number
  meat: number
}

interface TemperatureChartProps {
  history: HistoryEntry[]
  targetTemp: number
}

export default function TemperatureChart({ history, targetTemp }: TemperatureChartProps) {
  // Show ~6 time labels regardless of cook length
  const xAxisInterval = Math.max(0, Math.floor(history.length / 6) - 1)

  return (
    <AppPanel className="p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        Temperature history
      </h2>
      <ResponsiveContainer width="100%" height={228}>
        <LineChart data={history} margin={{ top: 6, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(63, 63, 70, 0.45)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickLine={false}
            interval={xAxisInterval}
            stroke="rgba(63, 63, 70, 0.6)"
          />
          <YAxis
            domain={[50, 350]}
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickLine={false}
            stroke="rgba(63, 63, 70, 0.6)"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(24, 24, 27, 0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            }}
            labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
            itemStyle={{ color: '#fafafa', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12, paddingTop: 12 }} />
          <ReferenceLine
            y={targetTemp}
            stroke="rgba(250, 250, 250, 0.35)"
            strokeDasharray="4 6"
            label={{ value: 'Target', fill: '#71717a', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="chamber"
            stroke="#fb923c"
            strokeWidth={2.25}
            dot={false}
            name="Chamber"
          />
          <Line
            type="monotone"
            dataKey="meat"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            name="Meat"
          />
        </LineChart>
      </ResponsiveContainer>
    </AppPanel>
  )
}
