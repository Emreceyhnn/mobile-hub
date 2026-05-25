import { useState } from 'react'
import { useNutrition } from '../../../context/NutritionContext'
import { useAuth } from '../../../context/AuthContext'
import DailyRing from '../../../components/dashboard/DailyRing'
import MacroBar from '../../../components/dashboard/MacroBar'
import MealSection from '../../../components/food/MealSection'
import Modal from '../../../components/ui/Modal'
import AddFoodModal from '../../../components/food/AddFoodModal'
import WaterCard from '../../../components/dashboard/WaterCard'
import { getDateKey } from '../../../services/firestore'
import { Box, CardContent, Typography, Stack, ButtonBase } from '@mui/material'
import GlassCard from '../../../components/ui/atoms/GlassCard'
import GradientText from '../../../components/ui/atoms/GradientText'

export default function Dashboard() {
  const { profile } = useAuth()
  const { meals, totals, selectedDate, addFood, removeFood, changeDate } = useNutrition()
  const [modalMeal, setModalMeal] = useState(null) // 'breakfast' | 'lunch' | 'dinner' | 'snack' | null

  const dailyGoal = profile?.dailyGoal || 2000

  // Quick date selector - last 5 days
  const today = new Date()
  const dateOptions = []
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dateOptions.push(d)
  }

  const handleAddFoodClick = (meal) => {
    setModalMeal(meal)
  }

  const handleAddFoodSave = async (foodData) => {
    if (modalMeal) {
      await addFood(modalMeal, foodData)
    }
  }

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2 }}>
      {/* Calendar Strip */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        {dateOptions.map((date) => {
          const key = getDateKey(date)
          const isActive = selectedDate === key
          const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' })
          const dayNum = date.getDate()
          return (
            <ButtonBase
              key={key}
              onClick={() => changeDate(key)}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 1,
                px: 0.5,
                mx: 0.5,
                borderRadius: 4,
                bgcolor: isActive ? 'secondary.main' : 'background.glass',
                color: isActive ? 'secondary.contrastText' : 'text.primary',
                boxShadow: isActive ? (theme) => `0 8px 24px ${theme.palette.secondary.main}4D` : 'none',
                border: '1px solid',
                borderColor: isActive ? 'secondary.main' : 'glassBorder',
                transition: (theme) => `all ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
                '&:hover': {
                  bgcolor: isActive ? 'secondary.light' : 'action.hover',
                },
                '&:active': { transform: 'scale(0.95)' },
                '&:focus-visible': {
                  outline: (theme) => `2px solid ${theme.palette.secondary.main}`,
                  outlineOffset: '2px',
                }
              }}
            >
              <Typography variant="caption" sx={{ opacity: isActive ? 0.9 : 0.6, fontWeight: '700', mb: 0.5, letterSpacing: 1, textTransform: 'uppercase' }}>
                {dayName}
              </Typography>
              <Typography variant="body1" fontWeight="900" sx={{ lineHeight: 1 }}>
                {dayNum}
              </Typography>
              {isActive && (
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor', mt: 0.5 }} />
              )}
            </ButtonBase>
          )
        })}
      </Stack>

      {/* Main Overview */}
      <GlassCard sx={{ my: 3 }}>
        <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'center', '&:last-child': { pb: 4 } }}>
          <DailyRing consumed={totals.calories} goal={dailyGoal} />
        </CardContent>
      </GlassCard>

      {/* Macro details */}
      <GlassCard sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <GradientText variant="h6" fontWeight="800" mb={3} gradient="secondaryText">
            Bugünkü Makrolar
          </GradientText>
          <MacroBar totals={totals} />
        </CardContent>
      </GlassCard>

      {/* Water tracker overview */}
      <Box mb={3}>
        <WaterCard />
      </Box>

      {/* Meals list */}
      <Box>
        <Typography variant="h6" fontWeight="800" mb={2} sx={{ letterSpacing: '-0.01em' }}>Öğünler</Typography>
        <Stack spacing={2.5}>
          <MealSection
            type="breakfast"
            items={meals.breakfast || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
          <MealSection
            type="lunch"
            items={meals.lunch || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
          <MealSection
            type="dinner"
            items={meals.dinner || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
          <MealSection
            type="snack"
            items={meals.snack || []}
            onAddFood={handleAddFoodClick}
            onRemoveFood={removeFood}
          />
        </Stack>
      </Box>

      {/* Food Entry Bottom Sheet Modal */}
      <Modal
        isOpen={modalMeal !== null}
        onClose={() => setModalMeal(null)}
        title={
          modalMeal === 'breakfast' ? '🌅 Kahvaltıya Ekle' :
          modalMeal === 'lunch' ? '☀️ Öğle Yemeğine Ekle' :
          modalMeal === 'dinner' ? '🌙 Akşam Yemeğine Ekle' : '🍎 Atıştırmalığa Ekle'
        }
      >
        <AddFoodModal
          mealType={modalMeal}
          onClose={() => setModalMeal(null)}
          onAdd={handleAddFoodSave}
        />
      </Modal>
    </Box>
  )
}
