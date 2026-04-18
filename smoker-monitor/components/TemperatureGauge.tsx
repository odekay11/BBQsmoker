import AppPanel from '@/components/AppPanel'

interface TemperatureGaugeProps {
  label: string
  temp: number | null
  targetTemp?: number
  variant?: 'chamber' | 'meat'
}

// Arc geometry: 270° sweep, center (80,80), r=56
const CX = 80
const CY = 80
const R = 56
const SW = 7
const CIRC = 2 * Math.PI * R          // ≈ 351.9
const ARC = (270 / 360) * CIRC        // ≈ 263.9 — the visible arc length
const GAP = CIRC - ARC                // ≈ 88.0  — the hidden gap at bottom

const MIN_TEMP = 50
const MAX_TEMP = 350

function toFrac(val: number): number {
  return Math.max(0, Math.min(1, (val - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)))
}

// Map fraction [0,1] to (x,y) on the arc.
// The arc starts at 135° (lower-left), sweeps CW 270° to 45° (lower-right).
function arcCoord(f: number): [number, number] {
  const rad = ((135 + f * 270) * Math.PI) / 180
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)]
}

const VARIANT_COLOR: Record<string, { stroke: string; filterId: string }> = {
  chamber: { stroke: '#f97316', filterId: 'glow-chamber' },
  meat:    { stroke: '#38bdf8', filterId: 'glow-meat'    },
}

export default function TemperatureGauge({
  label,
  temp,
  targetTemp,
  variant = 'chamber',
}: TemperatureGaugeProps) {
  const { stroke, filterId } = VARIANT_COLOR[variant]

  const frac   = temp !== null ? toFrac(temp) : 0
  const filled = frac * ARC

  const targetFrac = targetTemp !== undefined ? toFrac(targetTemp) : null
  const tickAngle  = targetFrac !== null
    ? ((135 + targetFrac * 270) * Math.PI) / 180
    : null

  // Glow intensity based on how close we are to target
  const proximity = temp !== null && targetTemp !== undefined
    ? Math.abs(temp - targetTemp)
    : 999
  const glowSD = proximity <= 5 ? 9 : proximity <= 15 ? 5 : proximity <= 30 ? 2 : 0

  const display = temp !== null ? Math.round(temp) : '---'

  return (
    <AppPanel className="relative flex flex-1 flex-col items-center overflow-hidden p-1">
      <svg
        viewBox="0 0 160 168"
        className="w-full"
        aria-label={`${label} temperature: ${display}°F`}
      >
        <defs>
          <filter id={filterId} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation={Math.max(glowSD, 0.5)} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Track ring (dim) ── */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="#292524"
          strokeWidth={SW}
          strokeDasharray={`${ARC} ${GAP}`}
          strokeLinecap="round"
          transform="rotate(135, 80, 80)"
        />

        {/* ── Filled arc (live temp) ── */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={stroke}
          strokeWidth={SW}
          strokeDasharray={`${Math.max(0.5, filled)} ${CIRC + 2}`}
          strokeLinecap="round"
          transform="rotate(135, 80, 80)"
          filter={`url(#${filterId})`}
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* ── Target tick ── */}
        {tickAngle !== null && (
          <>
            {/* outer dot */}
            <circle
              cx={CX + (R + 10) * Math.cos(tickAngle)}
              cy={CY + (R + 10) * Math.sin(tickAngle)}
              r={2.5}
              fill="rgba(255,255,255,0.55)"
            />
            {/* tick line */}
            <line
              x1={CX + (R - 10) * Math.cos(tickAngle)}
              y1={CY + (R - 10) * Math.sin(tickAngle)}
              x2={CX + (R + 6)  * Math.cos(tickAngle)}
              y2={CY + (R + 6)  * Math.sin(tickAngle)}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </>
        )}

        {/* ── Main temperature number ── */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={38}
          fontWeight={700}
          fontFamily="var(--font-space-mono), monospace"
          fill={temp !== null ? '#f5f5f4' : '#44403c'}
          letterSpacing="-2"
        >
          {display}
        </text>

        {/* ── °F unit ── */}
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontWeight={600}
          fontFamily="var(--font-barlow), sans-serif"
          fill="#57534e"
          letterSpacing="3"
        >
          °FAHRENHEIT
        </text>

        {/* ── Section label ── */}
        <text
          x={CX}
          y={148}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontWeight={700}
          fontFamily="var(--font-barlow), sans-serif"
          fill="#57534e"
          letterSpacing="4"
        >
          {label.toUpperCase()}
        </text>

        {/* ── Target temp ── */}
        {targetTemp !== undefined && (
          <text
            x={CX}
            y={162}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontFamily="var(--font-space-mono), monospace"
            fill="#44403c"
          >
            ↑ {targetTemp}°
          </text>
        )}
      </svg>
    </AppPanel>
  )
}
