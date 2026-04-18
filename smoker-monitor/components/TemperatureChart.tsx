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
  const xAxisInterval = Math.max(0, Math.floor(history.length / 6) - 1)

  return (
    <AppPanel className="p-4">
      <h2
        style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#57534e',
          marginBottom: '16px',
        }}
      >
        Temperature History
      </h2>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history} margin={{ top: 4, right: 4, left: -4, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="2 8"
            stroke="rgba(41,37,36,0.8)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{
              fill: '#57534e',
              fontSize: 10,
              fontFamily: 'var(--font-space-mono), monospace',
            }}
            tickLine={false}
            interval={xAxisInterval}
            stroke="rgba(41,37,36,0.9)"
          />
          <YAxis
            domain={[50, 350]}
            tick={{
              fill: '#57534e',
              fontSize: 10,
              fontFamily: 'var(--font-space-mono), monospace',
            }}
            tickLine={false}
            stroke="rgba(41,37,36,0.9)"
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1614',
              border: '1px solid rgba(58,46,34,0.9)',
              borderRadius: '10px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
              fontFamily: 'var(--font-space-mono), monospace',
            }}
            labelStyle={{ color: '#78716c', fontSize: 10, marginBottom: '4px' }}
            itemStyle={{ color: '#f5f5f4', fontSize: 12 }}
          />
          <Legend
            wrapperStyle={{
              color: '#78716c',
              fontSize: 11,
              paddingTop: 12,
              fontFamily: 'var(--font-barlow), sans-serif',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          />
          <ReferenceLine
            y={targetTemp}
            stroke="rgba(251,191,36,0.3)"
            strokeDasharray="3 8"
            label={{
              value: 'Target',
              fill: '#78716c',
              fontSize: 10,
              fontFamily: 'var(--font-barlow), sans-serif',
            }}
          />
          <Line
            type="monotone"
            dataKey="chamber"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            name="Chamber"
            style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.5))' }}
          />
          <Line
            type="monotone"
            dataKey="meat"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            name="Meat"
            style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.4))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </AppPanel>
  )
}
