import { Box, Typography, Stack, LinearProgress } from '@mui/material'

const MACROS = [
  { key: 'protein', label: 'Protein',     unit: 'g',   color: '#3B82F6', emoji: '💪', muiColor: 'info' },
  { key: 'carbs',   label: 'Karbonhidrat', unit: 'g',  color: '#F59E0B', emoji: '🌾', muiColor: 'warning' },
  { key: 'fat',     label: 'Yağ',         unit: 'g',   color: '#8B5CF6', emoji: '🥑', muiColor: 'secondary' },
  { key: 'fiber',   label: 'Lif',         unit: 'g',   color: '#10B981', emoji: '🥦', muiColor: 'success' },
]

const GOALS = { protein: 120, carbs: 250, fat: 65, fiber: 30 }

export default function MacroBar({ totals }) {
  return (
    <Stack spacing={2.5}>
      {MACROS.map(m => {
        const val = totals[m.key] || 0
        const goal = GOALS[m.key]
        const pct = Math.min(100, Math.round((val / goal) * 100))
        return (
          <Box key={m.key}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2" fontWeight="500" display="flex" alignItems="center" gap={1}>
                <span>{m.emoji}</span>
                <Typography component="span" variant="body2" color="text.secondary">{m.label}</Typography>
              </Typography>
              <Typography variant="body2" fontWeight="700" color="text.primary">
                {val}
                <Typography component="span" variant="body2" color="text.secondary" fontWeight="400">
                  {m.unit} / {goal}{m.unit}
                </Typography>
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={pct} 
              color={m.muiColor}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'background.default', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} 
            />
          </Box>
        )
      })}
    </Stack>
  )
}
