import { formatTime } from '../../utils/nutrition'
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function FoodCard({ food, onRemove }) {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        borderRadius: '16px',
        borderColor: 'rgba(255,255,255,0.05)',
        bgcolor: 'rgba(22, 26, 39, 0.4)',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'rgba(22, 26, 39, 0.8)'
        }
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box 
          sx={{ 
            width: 44, 
            height: 44, 
            borderRadius: '12px', 
            bgcolor: 'primary.light', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0
          }}
        >
          🍔
        </Box>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" noWrap>
            {food.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {food.servingSize} · {formatTime(food.time)}
            {food.protein !== undefined && (
              <Box component="span" sx={{ ml: 1 }}>
                P: {food.protein}g · K: {food.carbs}g · Y: {food.fat}g
              </Box>
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight="800" color="primary.main">
            {food.calories} kcal
          </Typography>
          {onRemove && (
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onRemove(food.id)}
              aria-label="Sil"
              sx={{ bgcolor: 'error.light', borderRadius: 2 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
