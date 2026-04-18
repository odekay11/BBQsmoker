interface SSRStatusProps {
  ssrStatus: boolean
}

export default function SSRStatus({ ssrStatus }: SSRStatusProps) {
  if (ssrStatus) {
    return (
      <div
        className="relative overflow-hidden rounded-xl px-5 py-3"
        style={{
          background: 'linear-gradient(135deg, #1a0f06 0%, #1c1108 100%)',
          border: '1px solid rgba(249,115,22,0.3)',
          boxShadow: '0 0 32px -8px rgba(249,115,22,0.35), inset 0 1px 0 rgba(249,115,22,0.08)',
        }}
      >
        {/* Animated sweep */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'heat-bar 2.4s ease-in-out infinite',
          }}
          aria-hidden
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Pulsing ember dot */}
            <span className="relative flex h-3 w-3">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"
                style={{ animation: 'ember-ping 1.4s cubic-bezier(0,0,0.2,1) infinite' }}
              />
              <span
                className="relative inline-flex h-3 w-3 rounded-full bg-orange-400"
                style={{
                  boxShadow: '0 0 10px 2px rgba(249,115,22,0.9)',
                  animation: 'ember-pulse 1.4s ease-in-out infinite',
                }}
              />
            </span>

            <span
              style={{
                fontFamily: 'var(--font-barlow), sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: '#fdba74',
                textTransform: 'uppercase',
              }}
            >
              Heating
            </span>
          </div>

          {/* Heat bars */}
          <div className="flex items-end gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-full bg-orange-500/50"
                style={{
                  width: '4px',
                  height: `${8 + i * 3}px`,
                  animation: `ember-pulse 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 160}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center gap-2.5 rounded-xl px-5 py-3"
      style={{
        background: '#111010',
        border: '1px solid rgba(41,37,36,0.9)',
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: '#44403c' }}
      />
      <span
        style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: '#57534e',
          textTransform: 'uppercase',
        }}
      >
        Idle
      </span>
    </div>
  )
}
