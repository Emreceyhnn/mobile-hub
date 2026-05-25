import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { getWeeklyLogs } from '../../../services/firestore'
import { sumMacros, formatDate } from '../../../utils/nutrition'
import FoodCard from '../../../components/food/FoodCard'
import { Box, Typography, Card, CardContent, CircularProgress, Stack, Divider } from '@mui/material'
import WaterDropIcon from '@mui/icons-material/WaterDrop'

export default function History() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState([])
  const [selectedDayLog, setSelectedDayLog] = useState(null)

  useEffect(() => {
    async function loadHistory() {
      if (!user) return
      try {
        const logs = await getWeeklyLogs(user.uid)
        const formatted = Object.entries(logs).map(([dateKey, dayLog]) => {
          const totals = sumMacros(dayLog.meals)
          return { dateKey, meals: dayLog.meals, water: dayLog.water, totals }
        }).sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        
        setWeeklyData(formatted)
        if (formatted.length > 0) {
          setSelectedDayLog(formatted[0])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [user])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">Geçmiş veriler yükleniyor...</Typography>
      </Box>
    )
  }

  const allMealsSelected = selectedDayLog 
    ? Object.entries(selectedDayLog.meals).flatMap(([type, list]) => list.map(item => ({ ...item, type })))
    : []

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2 }}>
      <Typography variant="h5" fontWeight="900" mb={3} sx={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Besin Geçmişi
      </Typography>

      {/* Week Overview List */}
      <Box my={4}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Son 7 Gün</Typography>
        <Stack spacing={1.5} mb={2}>
          {weeklyData.map((day) => {
            const isSelected = selectedDayLog?.dateKey === day.dateKey
            const hasCalories = day.totals.calories > 0
            const hasWater = day.water > 0
            
            return (
              <Card
                key={day.dateKey}
                sx={{
                  borderRadius: '20px',
                  borderColor: isSelected ? 'secondary.main' : 'rgba(255,255,255,0.05)',
                  bgcolor: isSelected ? 'rgba(0, 217, 163, 0.15)' : 'rgba(22, 26, 39, 0.6)',
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: isSelected ? 'rgba(0, 217, 163, 0.2)' : 'rgba(22, 26, 39, 0.8)' }
                }}
                onClick={() => setSelectedDayLog(day)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="800" color={isSelected ? 'text.primary' : 'text.primary'}>
                        {formatDate(day.dateKey)}
                      </Typography>
                      <Typography variant="caption" color={isSelected ? 'text.secondary' : 'text.secondary'} display="block" mt={0.5}>
                        {hasCalories 
                          ? `${day.totals.protein}g P · ${day.totals.carbs}g K · ${day.totals.fat}g Y${hasWater ? ` · 💧 ${day.water} ml` : ''}`
                          : hasWater 
                            ? `💧 ${day.water} ml su tüketildi`
                            : 'Veri girilmedi'}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="900" color={hasCalories ? (isSelected ? 'secondary.main' : 'text.primary') : 'text.disabled'}>
                      {day.totals.calories} kcal
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      </Box>

      {/* Detail Panel */}
      {selectedDayLog && (
        <Card sx={{ borderRadius: '12px', mb: 2,mt:1.5, bgcolor: 'rgba(22, 26, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="800" mb={3} sx={{ background: 'linear-gradient(135deg, #00D9A3, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
              {formatDate(selectedDayLog.dateKey)} Detayları
            </Typography>
            
            {selectedDayLog.water > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: 'info.light',
                border: '1px solid',
                borderColor: 'info.main',
                borderRadius: 2,
                px: 2,
                py: 1.5,
                mb: 2,
                opacity: 0.9 
              }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'info.dark' }}>
                  <WaterDropIcon fontSize="small" /> Günlük Su Tüketimi
                </Typography>
                <Typography variant="subtitle2" fontWeight="900" color="info.dark">
                  {selectedDayLog.water} ml
                </Typography>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />
            
            {allMealsSelected.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3} sx={{mt:2}}>
                Bu günde eklenmiş herhangi bir besin kaydı bulunamadı.
              </Typography>
            ) : (
              <Stack spacing={1} sx={{mt:2}}>
                {allMealsSelected.map((item, idx) => (
                  <FoodCard key={idx} food={item} />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
