interface Zone {
  from: number
  to: number
  color: string
}

export interface DialPalette {
  bezel: string
  bezelLight: string
  bezelDark: string
  face: string
  faceLight: string
  faceDark: string
  tickMajor: string
  tickMinor: string
  numeral: string
  label: string
  needle: string
  needleDark: string
  targetMarker: string
  targetMarkerStroke: string
  digitalBg: string
  digitalBorder: string
  digitalShadow: string
  digitalText: string
  glow: boolean
}

export const MCINTOSH_DIAL: DialPalette = {
  bezel: '#c8c8cc',
  bezelLight: '#f4f4f6',
  bezelDark: '#6a6a70',
  face: '#050608',
  faceLight: '#14161c',
  faceDark: '#000',
  tickMajor: '#4ab4ff',
  tickMinor: '#2a6a9a',
  numeral: '#6ac8ff',
  label: '#6ac8ff',
  needle: '#ffffff',
  needleDark: '#a8a8ac',
  targetMarker: '#2afa6a',
  targetMarkerStroke: '#0a5a2a',
  digitalBg: '#020305',
  digitalBorder: '#1a2a3a',
  digitalShadow: 'rgba(0,0,0,0.8)',
  digitalText: '#6ac8ff',
  glow: true,
}

interface AnalogDialProps {
  value?: number | null
  target?: number
  min?: number
  max?: number
  label?: string
  unit?: string
  size?: number
  zones?: Zone[] | null
  palette?: DialPalette | null
}

export default function AnalogDial({
  value = 225,
  target = 225,
  min = 50,
  max = 550,
  label = 'CHAMBER',
  unit = '°F',
  size = 260,
  zones = null,
  palette = null,
}: AnalogDialProps) {
  const P = palette || MCINTOSH_DIAL
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6

  const START = -135
  const END = 135
  const SWEEP = END - START

  const clamp = (v: number) => Math.max(min, Math.min(max, v))
  const valToAngle = (v: number) => START + ((clamp(v) - min) / (max - min)) * SWEEP
  const deg2rad = (d: number) => (d - 90) * (Math.PI / 180)
  const polar = (radius: number, deg: number): [number, number] => [
    cx + radius * Math.cos(deg2rad(deg)),
    cy + radius * Math.sin(deg2rad(deg)),
  ]

  const majorCount = 5
  const minorPerMajor = 10
  const ticks = []
  for (let i = 0; i <= majorCount * minorPerMajor; i++) {
    const t = i / (majorCount * minorPerMajor)
    const deg = START + t * SWEEP
    const isMajor = i % minorPerMajor === 0
    const isMid = i % 5 === 0 && !isMajor
    const r1 = r - (isMajor ? 20 : isMid ? 14 : 10)
    const r2 = r - 6
    const [x1, y1] = polar(r1, deg)
    const [x2, y2] = polar(r2, deg)
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isMajor ? P.tickMajor : P.tickMinor}
        strokeWidth={isMajor ? 2 : isMid ? 1 : 0.6}
        strokeLinecap="butt"
        style={isMajor && P.glow ? { filter: `drop-shadow(0 0 2px ${P.tickMajor})` } : undefined}
      />
    )
  }

  const numerals = []
  for (let i = 0; i <= majorCount; i++) {
    const t = i / majorCount
    const deg = START + t * SWEEP
    const v = Math.round(min + t * (max - min))
    const [tx, ty] = polar(r - 32, deg)
    numerals.push(
      <text
        key={i}
        x={tx} y={ty}
        textAnchor="middle"
        dominantBaseline="central"
        fill={P.numeral}
        style={{
          fontFamily: "'Barlow Condensed','Helvetica Neue',Helvetica,Arial,sans-serif",
          fontSize: size * 0.082,
          fontWeight: 500,
          letterSpacing: 0.5,
          ...(P.glow ? { filter: `drop-shadow(0 0 3px ${P.numeral}aa)` } : {}),
        }}
      >
        {v}
      </text>
    )
  }

  const zoneArcs = (zones || []).map((z, i) => {
    const a1 = valToAngle(z.from)
    const a2 = valToAngle(z.to)
    const [sx, sy] = polar(r - 8, a1)
    const [ex, ey] = polar(r - 8, a2)
    const large = a2 - a1 > 180 ? 1 : 0
    return (
      <path
        key={i}
        d={`M ${sx} ${sy} A ${r - 8} ${r - 8} 0 ${large} 1 ${ex} ${ey}`}
        stroke={z.color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="butt"
        opacity="0.85"
      />
    )
  })

  const needleAngle = valToAngle(value ?? min)
  const [nx, ny] = polar(r - 42, needleAngle)
  const [bx, by] = polar(-16, needleAngle)

  const targetAngle = valToAngle(target ?? min)
  const [tmX, tmY] = polar(r - 4, targetAngle)

  const display = value !== null && value !== undefined ? Math.round(value) : '---'

  return (
    <div style={{
      position: 'relative',
      width: size,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
    }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`bezel-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={P.bezelLight} />
            <stop offset="30%" stopColor={P.bezel} />
            <stop offset="55%" stopColor={P.bezelDark} />
            <stop offset="80%" stopColor={P.bezel} />
            <stop offset="100%" stopColor={P.bezelLight} />
          </linearGradient>
          <radialGradient id={`face-${label}`} cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor={P.faceLight} />
            <stop offset="70%" stopColor={P.face} />
            <stop offset="100%" stopColor={P.faceDark} />
          </radialGradient>
          <linearGradient id={`needle-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={P.needleDark} />
            <stop offset="30%" stopColor={P.needle} />
            <stop offset="100%" stopColor={P.needle} />
          </linearGradient>
          <radialGradient id={`gloss-${label}`} cx="50%" cy="10%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Outer bezel */}
        <circle cx={cx} cy={cy} r={r + 5} fill={`url(#bezel-${label})`} />
        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={P.bezelDark} strokeWidth="0.5" />
        {/* Glass face */}
        <circle cx={cx} cy={cy} r={r - 3} fill={`url(#face-${label})`} />
        {/* Inner shadow */}
        <circle cx={cx} cy={cy} r={r - 3} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2" />

        {zoneArcs}
        <g>{ticks}</g>
        <g>{numerals}</g>

        {/* Unit label */}
        <text
          x={cx} y={cy - size * 0.24}
          textAnchor="middle"
          fill={P.label}
          opacity="0.7"
          style={{
            fontFamily: "'Barlow Condensed','Helvetica Neue',Helvetica,sans-serif",
            fontSize: size * 0.048,
            letterSpacing: 4,
            fontWeight: 400,
          }}
        >
          {unit}
        </text>

        {/* Bottom label */}
        <text
          x={cx} y={cy + size * 0.34}
          textAnchor="middle"
          fill={P.label}
          style={{
            fontFamily: "'Barlow Condensed','Helvetica Neue',Helvetica,sans-serif",
            fontSize: size * 0.052,
            letterSpacing: 5,
            fontWeight: 500,
            ...(P.glow ? { filter: `drop-shadow(0 0 3px ${P.label}aa)` } : {}),
          }}
        >
          {label}
        </text>

        {/* Target marker */}
        <g transform={`translate(${tmX} ${tmY}) rotate(${targetAngle})`}>
          <polygon
            points="0,0 -3.5,7 3.5,7"
            fill={P.targetMarker}
            stroke={P.targetMarkerStroke}
            strokeWidth="0.5"
          />
        </g>

        {/* Glass gloss overlay */}
        <circle cx={cx} cy={cy} r={r - 3} fill={`url(#gloss-${label})`} pointerEvents="none" />

        {/* Needle */}
        <line
          x1={bx} y1={by} x2={nx} y2={ny}
          stroke={`url(#needle-${label})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={P.glow ? { filter: `drop-shadow(0 0 4px ${P.needle})` } : undefined}
        />
        <circle cx={bx} cy={by} r="3" fill={P.needleDark} />

        {/* Center cap */}
        <circle cx={cx} cy={cy} r="9" fill={`url(#bezel-${label})`} stroke={P.bezelDark} strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r="3" fill={P.bezelDark} />
      </svg>

      {/* Digital readout */}
      <div style={{
        marginTop: -size * 0.06,
        minWidth: size * 0.5,
        padding: '4px 14px',
        background: P.digitalBg,
        border: `1px solid ${P.digitalBorder}`,
        borderRadius: 1,
        boxShadow: `inset 0 1px 4px ${P.digitalShadow}, 0 2px 4px rgba(0,0,0,0.4)`,
        fontFamily: "'Barlow Condensed','Helvetica Neue',sans-serif",
        fontSize: size * 0.1,
        color: P.digitalText,
        textAlign: 'center',
        letterSpacing: 3,
        fontWeight: 500,
        textShadow: `0 0 8px ${P.digitalText}cc, 0 0 2px ${P.digitalText}`,
      }}>
        {display}°
      </div>
    </div>
  )
}
