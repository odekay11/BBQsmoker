'use client'

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
  return (
    <div className="bg-gray-800 rounded-2xl p-4">
      <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">Temperature History</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" fill="transparent" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            interval={9}
            stroke="#374151"
          />
          <YAxis
            domain={[50, 350]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            stroke="#374151"
            width={40}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: 12 }}
          />
          <ReferenceLine y={targetTemp} stroke="#ffffff" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'Target', fill: '#9ca3af', fontSize: 11 }} />
          <Line type="monotone" dataKey="chamber" stroke="#f97316" dot={false} strokeWidth={2} name="Chamber" />
          <Line type="monotone" dataKey="meat" stroke="#ef4444" dot={false} strokeWidth={2} name="Meat" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
