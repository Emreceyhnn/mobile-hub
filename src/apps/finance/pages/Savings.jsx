import { useState } from 'react'
import { useFinance } from '../../../context/FinanceContext'
import { useToast } from '../../../components/ui/Toast'
import Modal from '../../../components/ui/Modal'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, IconButton, Stack, Chip, LinearProgress, alpha } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'

const SAVINGS_CATEGORIES = ['Acil Durum', 'Ev', 'Araba', 'Teknoloji', 'Seyahat', 'Eğitim', 'Diğer']

export default function Savings() {
  const { savings, addSavingsGoal, updateSavingsAmount, deleteSavingsGoal } = useFinance()
  const showToast = useToast()

  const [isOpenAdd, setIsOpenAdd] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null) // for add/withdraw funds modal
  const [fundsMode, setFundsMode] = useState('deposit') // 'deposit' | 'withdraw'
  const [fundsAmount, setFundsAmount] = useState('')

  // Add Goal Form states
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [category, setCategory] = useState(SAVINGS_CATEGORIES[0])

  const handleAddGoal = async (e) => {
    e.preventDefault()
    const target = parseFloat(targetAmount)
    if (!target || target <= 0) {
      showToast('Lütfen geçerli bir hedef tutar girin.', 'error')
      return
    }

    try {
      await addSavingsGoal({
        title: title.trim(),
        targetAmount: target,
        category
      })
      showToast('Birikim hedefi oluşturuldu! 🐖', 'success')
      setIsOpenAdd(false)
      setTitle('')
      setTargetAmount('')
    } catch {
      showToast('Birikim hedefi eklenirken hata oluştu.', 'error')
    }
  }

  const handleFundsSubmit = async (e) => {
    e.preventDefault()
    const amount = parseFloat(fundsAmount)
    if (!amount || amount <= 0) {
      showToast('Lütfen geçerli bir tutar girin.', 'error')
      return
    }

    const value = fundsMode === 'deposit' ? amount : -amount

    try {
      await updateSavingsAmount(selectedGoal.id, value)
      showToast(
        fundsMode === 'deposit'
          ? 'Birikime başarıyla para eklendi! 💰'
          : 'Birikimden başarıyla para çekildi. 💸',
        'success'
      )
      setSelectedGoal(null)
      setFundsAmount('')
    } catch {
      showToast('İşlem gerçekleştirilirken hata oluştu.', 'error')
    }
  }

  // Format helper
  const formatMoney = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
  }

  const totalSaved = savings.reduce((sum, s) => sum + s.currentAmount, 0)
  const totalTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="900">Birikimler</Typography>
          <Typography variant="body2" color="text.secondary">Hedeflerinize ne kadar kaldığını takip edin</Typography>
        </Box>
        <IconButton color="primary" onClick={() => setIsOpenAdd(true)} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Overall Progress Banner */}
      <Card sx={{ 
        mb: 4, borderRadius: 6, p: 3, 
        bgcolor: 'background.glass',
        backdropFilter: 'blur(20px)',
        border: 1,
        borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
        background: (theme) => `linear-gradient(160deg, ${alpha(theme.palette.success.main, 0.15)} 0%, transparent 100%)`,
        boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.common.black, 0.3)}`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight="700" letterSpacing={1}>Toplam Biriktirilen</Typography>
            <Typography variant="h4" fontWeight="900" color="success.main" mt={1}>
              {formatMoney(totalSaved)}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Toplam Hedef</Typography>
            <Typography variant="subtitle1" fontWeight="bold">{formatMoney(totalTarget)}</Typography>
          </Box>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={Math.min(overallProgress, 100)} 
          sx={{ height: 10, borderRadius: 8, bgcolor: 'background.glassActive', '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 8 } }} 
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">Toplam İlerleme</Typography>
          <Typography variant="caption" fontWeight="bold" color="success.main">%{Math.round(overallProgress)}</Typography>
        </Box>
      </Card>

      {/* Goals list */}
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>Birikim Hedeflerim ({savings.length})</Typography>

        {savings.length === 0 ? (
          <Card sx={{ borderRadius: 6, p: 4, textAlign: 'center', bgcolor: 'background.glass', border: '1px dashed', borderColor: 'glassBorder' }}>
            <Typography variant="body2" color="text.secondary">Henüz birikim hedefi oluşturmadınız. 🐖</Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {savings.map(s => {
              const progress = s.targetAmount > 0 ? (s.currentAmount / s.targetAmount) * 100 : 0
              const isCompleted = progress >= 100

              return (
                <Card key={s.id} sx={{ 
                  borderRadius: 6, 
                  bgcolor: 'background.glass',
                  border: 1,
                  borderColor: isCompleted ? 'success.main' : 'glassBorder',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => isCompleted ? `0 12px 32px ${alpha(theme.palette.success.main, 0.2)}` : `0 12px 32px ${alpha(theme.palette.common.black, 0.3)}`,
                    borderColor: (theme) => isCompleted ? theme.palette.success.main : alpha(theme.palette.common.white, 0.2)
                  }
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Chip label={s.category} size="small" color="secondary" sx={{ mb: 1, fontSize: '0.65rem', height: 20 }} />
                        <Typography variant="subtitle1" fontWeight="bold">{s.title}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            setSelectedGoal(s)
                            setFundsMode('withdraw')
                          }}
                          sx={{ bgcolor: 'error.light', color: 'error.dark' }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="success" 
                          onClick={() => {
                            setSelectedGoal(s)
                            setFundsMode('deposit')
                          }}
                          sx={{ bgcolor: 'success.light', color: 'success.dark' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="default" 
                          onClick={() => {
                            deleteSavingsGoal(s.id)
                            showToast('Hedef silindi.', 'info')
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        <Typography component="span" fontWeight="bold" color="text.primary">{formatMoney(s.currentAmount)}</Typography>
                        {` / ${formatMoney(s.targetAmount)}`}
                      </Typography>
                      <Typography variant="caption" fontWeight="bold" color={isCompleted ? 'success.main' : 'secondary.main'}>
                        %{Math.round(progress)}
                      </Typography>
                    </Box>

                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(progress, 100)} 
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'background.glassActive', '& .MuiLinearProgress-bar': { bgcolor: isCompleted ? 'success.main' : 'secondary.main', borderRadius: 4 } }} 
                    />
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>

      {/* Add Goal Modal */}
      <Modal isOpen={isOpenAdd} onClose={() => setIsOpenAdd(false)} title="Yeni Birikim Hedefi">
        <form onSubmit={handleAddGoal}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Hedef Başlığı"
              type="text"
              variant="outlined"
              placeholder="Örn: Tatil Bütçesi, Depozito"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Hedef Tutarı (TL)"
              type="number"
              variant="outlined"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={category}
                label="Kategori"
                onChange={e => setCategory(e.target.value)}
              >
                {SAVINGS_CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ borderRadius: 8 }}>
              Hedefi Başlat 🚀
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Deposit/Withdraw Funds Modal */}
      <Modal
        isOpen={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
        title={selectedGoal ? `${selectedGoal.title} - ${fundsMode === 'deposit' ? 'Para Ekle' : 'Para Çek'}` : ''}
      >
        <form onSubmit={handleFundsSubmit}>
          <Stack spacing={3} mt={1}>
            <Box display="flex" justifyContent="center">
              <Typography variant="h3">{fundsMode === 'deposit' ? '💰' : '💸'}</Typography>
            </Box>

            <TextField
              label="Tutar (TL)"
              type="number"
              variant="outlined"
              value={fundsAmount}
              onChange={e => setFundsAmount(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ borderRadius: 8 }}>
              İşlemi Tamamla ✓
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  )
}

