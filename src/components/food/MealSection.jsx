import FoodCard from './FoodCard'
import { MEAL_LABELS } from '../../utils/nutrition'
import { Box, Card, CardContent, Typography, IconButton, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function MealSection({ type, items, onAddFood, onRemoveFood }) {
  const meta = MEAL_LABELS[type]
  const totalCal = items.reduce((sum, item) => sum + (item.calories || 0), 0)

  return (
    <Card sx={{ mb: 2, borderRadius: '12px', bgcolor: 'rgba(22, 26, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="span" sx={{ lineHeight: 1 }}>{meta.emoji}</Typography>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                {meta.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {items.length} besin eklenmiş
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: meta.color }}>
              {totalCal} kcal
            </Typography>
            <IconButton
              size="small"
              onClick={() => onAddFood(type)}
              sx={{
                bgcolor: 'action.hover',
                color: 'text.primary',
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.selected' }
              }}
              aria-label={`${meta.label} Ekle`}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={1.5}>
            Henüz besin eklenmedi.
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {items.map(item => (
              <FoodCard
                key={item.id}
                food={item}
                onRemove={onRemoveFood ? (id) => onRemoveFood(type, id) : null}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
