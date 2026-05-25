import { useEffect, useRef } from 'react'
import { getCaloriePercent } from '../../utils/nutrition'
import { Box, Typography, Chip } from '@mui/material'

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

  const gradId = 'ringGrad'

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} >
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="progress-ring">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={over ? '#EF4444' : '#00D9A3'} />
              <stop offset="100%" stopColor={over ? '#F59E0B' : '#8B5CF6'} />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
          />

          {/* Fill */}
          <circle
            ref={fillRef}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            strokeWidth={STROKE}
            stroke={`url(#${gradId})`}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            fill="transparent"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>

        {/* Center label */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'max-content' }}>
            <Typography 
              variant="h3" 
              fontWeight="900" 
              lineHeight={1}
              sx={{
                background: over ? 'linear-gradient(135deg,#EF4444,#F59E0B)' : (theme) => theme.palette.gradients.secondaryText,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                m: 0,
                p: 0
              }}
            >
              {consumed.toLocaleString('tr-TR')}
            </Typography>
          </Box>
          
          <Box 
            sx={{
              position: 'absolute',
              top: 'calc(50% + 28px)', // Positioned exactly below the h3 text
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              width: 'max-content'
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              kcal tüketildi
            </Typography>
            <Chip 
              size="small" 
              label={over ? `+${(consumed - goal).toLocaleString('tr-TR')} fazla` : `${remaining.toLocaleString('tr-TR')} kaldı`}
              color={over ? 'error' : 'success'}
              sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Goal label */}
      <Typography variant="body2" color="text.secondary">
        Günlük hedef: <Typography component="span" variant="body2" color="text.primary" fontWeight="bold">{goal.toLocaleString('tr-TR')} kcal</Typography>
      </Typography>
    </Box>
  )
}
