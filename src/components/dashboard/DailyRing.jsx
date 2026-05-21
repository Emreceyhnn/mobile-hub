import { useEffect, useRef } from 'react'
import { getCaloriePercent } from '../../utils/nutrition'

const SIZE = 200
const STROKE = 16
const R = (SIZE / 2) - (STROKE / 2)
const CIRC = 2 * Math.PI * R

export default function DailyRing({ consumed, goal }) {
  const fillRef = useRef()
  const percent = getCaloriePercent(consumed, goal)
  const remaining = Math.max(0, goal - consumed)
  const over = consumed > goal

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return
    const offset = CIRC - (percent / 100) * CIRC
    fill.style.strokeDashoffset = offset
  }, [percent])

  const color = over ? '#EF4444' : percent > 80 ? '#F59E0B' : '#00D9A3'
  const gradId = 'ringGrad'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="progress-ring">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={over ? '#EF4444' : '#00D9A3'} />
              <stop offset="100%" stopColor={over ? '#F59E0B' : '#8B5CF6'} />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            className="progress-ring-bg"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            stroke="var(--bg-card-hover)"
          />

          {/* Fill */}
          <circle
            ref={fillRef}
            className="progress-ring-fill"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            stroke={`url(#${gradId})`}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
          />
        </svg>

        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          <span style={{
            fontSize: 36, fontWeight: 900,
            background: over ? 'linear-gradient(135deg,#EF4444,#F59E0B)' : 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}>
            {consumed.toLocaleString('tr-TR')}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            kcal tüketildi
          </span>
          <div style={{
            marginTop: 4,
            padding: '2px 10px',
            borderRadius: 999,
            background: over ? 'rgba(239,68,68,0.15)' : 'var(--accent-green-dim)',
            color: over ? 'var(--accent-red)' : 'var(--accent-green)',
            fontSize: 12,
            fontWeight: 600,
          }}>
            {over ? `+${(consumed - goal).toLocaleString('tr-TR')} fazla` : `${remaining.toLocaleString('tr-TR')} kaldı`}
          </div>
        </div>
      </div>

      {/* Goal label */}
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        Günlük hedef: <strong style={{ color: 'var(--text-primary)' }}>{goal.toLocaleString('tr-TR')} kcal</strong>
      </p>
    </div>
  )
}
