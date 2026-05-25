import { useState } from 'react'
import { useNutrition } from '../../context/NutritionContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import { Box, Card, CardContent, Typography, Button, TextField, IconButton, Stack, CircularProgress } from '@mui/material'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import AddIcon from '@mui/icons-material/Add'
import UndoIcon from '@mui/icons-material/Undo'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

export default function WaterCard() {
  const { profile } = useAuth()
  const { water, updateWater } = useNutrition()
  const showToast = useToast()
  
  const [customVal, setCustomVal] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const goal = profile?.dailyWaterGoal || 2500
  const percent = Math.min(100, Math.round((water / goal) * 100))

  const handleAddWater = async (amount: number) => {
    const nextAmount = water + amount
    await updateWater(nextAmount)
    showToast(`💧 ${amount} ml su eklendi!`, 'success')
  }

  const handleUndo = async () => {
    if (water <= 0) return
    const nextAmount = Math.max(0, water - 250)
    await updateWater(nextAmount)
    showToast('↩ Son ekleme geri alındı (-250 ml)', 'info')
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(customVal)
    if (isNaN(amount) || amount <= 0) {
      showToast('Lütfen geçerli bir su miktarı girin.', 'error')
      return
    }
    const nextAmount = water + amount
    await updateWater(nextAmount)
    showToast(`💧 ${amount} ml su eklendi!`, 'success')
    setCustomVal('')
    setShowCustomInput(false)
  }

  return (
    <Card sx={{ borderRadius: '12px', bgcolor: 'rgba(22, 26, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight="800" display="flex" alignItems="center" gap={1}>
              <WaterDropIcon color="info" /> Su Takibi
            </Typography>
            <Typography variant="caption" color="text.secondary">Günlük su dengenizi koruyun</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h6" fontWeight="900" color="info.main" sx={{ lineHeight: 1.2 }}>
              {water.toLocaleString('tr-TR')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              / {goal.toLocaleString('tr-TR')} ml
            </Typography>
            <Typography variant="caption" fontWeight="bold" color={percent >= 100 ? 'success.main' : 'info.main'} sx={{ display: 'inline-block', bgcolor: (theme) => `${theme.palette.info.main}22`, px: 1, py: 0.25, borderRadius: 1 }}>
              %{percent} Tamamlandı
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={100} size={100} thickness={4} sx={{ color: 'action.hover' }} />
            <CircularProgress variant="determinate" value={percent} size={100} thickness={4} color="info" sx={{ position: 'absolute', left: 0 }} />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h5" component="div" color="info.main" fontWeight="bold">
                {percent}%
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          {!showCustomInput ? (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  color="info" 
                  fullWidth 
                  onClick={() => handleAddWater(250)}
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  250 ml
                </Button>
                <Button 
                  variant="outlined" 
                  color="info" 
                  fullWidth 
                  onClick={() => handleAddWater(500)}
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  500 ml
                </Button>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="text" 
                  color="info" 
                  fullWidth 
                  onClick={() => setShowCustomInput(true)}
                >
                  Özel ➕
                </Button>
                <Button 
                  variant="text" 
                  color="inherit" 
                  fullWidth 
                  onClick={handleUndo}
                  disabled={water <= 0}
                  startIcon={<UndoIcon />}
                >
                  Geri Al
                </Button>
              </Stack>
            </Stack>
          ) : (
            <form onSubmit={handleCustomSubmit}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    placeholder="Miktar (ml)"
                    value={customVal}
                    onChange={e => setCustomVal(e.target.value)}
                    autoFocus
                    required
                    fullWidth
                  />
                  <IconButton type="submit" color="primary" sx={{ bgcolor: 'primary.light', borderRadius: 2 }}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {
                      setCustomVal('')
                      setShowCustomInput(false)
                    }}
                    color="error"
                    sx={{ bgcolor: 'error.light', borderRadius: 2 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  ml cinsinden değer girin
                </Typography>
              </Stack>
            </form>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
