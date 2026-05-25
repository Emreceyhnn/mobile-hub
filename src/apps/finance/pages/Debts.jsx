import { useState } from 'react'
import { useFinance } from '../../../context/FinanceContext'
import { useToast } from '../../../components/ui/Toast'
import Modal from '../../../components/ui/Modal'
import { Box, Typography, Button, TextField, Card, CardContent, IconButton, Stack, Chip, ToggleButtonGroup, ToggleButton, Divider, Grid, alpha } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import UndoIcon from '@mui/icons-material/Undo'

export default function Debts() {
  const { debts, addDebt, toggleDebtPaid, deleteDebt } = useFinance()
  const showToast = useToast()

  const [isOpen, setIsOpen] = useState(false)

  // Form states
  const [person, setPerson] = useState('')
  const [type, setType] = useState('borrowed') // 'borrowed' | 'lent'
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  const handleTypeChange = (e, newType) => {
    if (newType !== null) {
      setType(newType)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount <= 0) {
      showToast('Lütfen geçerli bir tutar girin.', 'error')
      return
    }

    try {
      await addDebt({
        person: person.trim(),
        type,
        amount: numericAmount,
        dueDate,
        description: description.trim() || (type === 'borrowed' ? 'Borç alındı' : 'Borç verildi')
      })
      showToast('Borç kaydı başarıyla eklendi! 🤝', 'success')
      setIsOpen(false)
      setPerson('')
      setAmount('')
      setDescription('')
    } catch {
      showToast('Kayıt eklenirken hata oluştu.', 'error')
    }
  }

  // Format helper
  const formatMoney = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
  }

  // Filter paid vs unpaid
  const activeDebts = debts.filter(d => !d.paid)
  const settledDebts = debts.filter(d => d.paid)

  // Summaries
  const totalBorrowed = activeDebts.filter(d => d.type === 'borrowed').reduce((sum, d) => sum + d.amount, 0)
  const totalLent = activeDebts.filter(d => d.type === 'lent').reduce((sum, d) => sum + d.amount, 0)
  const netPosition = totalLent - totalBorrowed

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="900">Borç Hesapları</Typography>
          <Typography variant="body2" color="text.secondary">Kişisel alacak ve verecekleriniz</Typography>
        </Box>
        <IconButton color="primary" onClick={() => setIsOpen(true)} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
          <AddIcon />
        </IconButton>
      </Box>

      <Card sx={{ 
        mb: 4, borderRadius: 6, p: 3, 
        bgcolor: 'background.glass',
        backdropFilter: 'blur(20px)',
        border: 1,
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
        background: (theme) => `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 100%)`,
        boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.common.black, 0.3)}`
      }}>
        <Typography variant="overline" color="text.secondary" fontWeight="700" letterSpacing={1} mb={2} display="block">Durum Özeti</Typography>
        
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'background.glassActive', border: '1px solid', borderColor: 'glassBorder', p: 2, borderRadius: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Toplam Borcum</Typography>
              <Typography variant="h6" fontWeight="900" color="error.main">{formatMoney(totalBorrowed)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ bgcolor: 'background.glassActive', border: '1px solid', borderColor: 'glassBorder', p: 2, borderRadius: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Toplam Alacağım</Typography>
              <Typography variant="h6" fontWeight="900" color="success.main">{formatMoney(totalLent)}</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">Net Pozisyon:</Typography>
          <Typography variant="h6" fontWeight="900" color={netPosition >= 0 ? 'success.main' : 'error.main'}>
            {netPosition >= 0 ? '+' : ''}{formatMoney(netPosition)}
          </Typography>
        </Box>
      </Card>

      {/* Active Debts List */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Aktif Hesaplar ({activeDebts.length})</Typography>

        {activeDebts.length === 0 ? (
          <Card sx={{ borderRadius: 6, p: 4, textAlign: 'center', bgcolor: 'background.glass', border: '1px dashed', borderColor: 'glassBorder' }}>
            <Typography variant="body2" color="text.secondary">Aktif borç veya alacak hesabı bulunmuyor. 🤝</Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {activeDebts.map(d => {
              const isBorrowed = d.type === 'borrowed'

              return (
                <Card key={d.id} sx={{ 
                  borderRadius: 6, 
                  bgcolor: 'background.glass',
                  border: 1,
                  borderColor: 'glassBorder',
                  borderLeft: `4px solid`, 
                  borderLeftColor: isBorrowed ? 'error.main' : 'success.main',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.common.black, 0.3)}`,
                    borderColor: (theme) => alpha(theme.palette.common.white, 0.2)
                  }
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle1" fontWeight="bold">{d.person}</Typography>
                          <Chip 
                            size="small" 
                            label={isBorrowed ? 'Borcum' : 'Alacağım'} 
                            color={isBorrowed ? 'error' : 'success'} 
                            variant="outlined" 
                            sx={{ fontSize: '0.65rem', height: 20 }} 
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">{d.description}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">Vade: {d.dueDate}</Typography>
                      </Box>

                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold" color={isBorrowed ? 'error.main' : 'success.main'}>
                          {formatMoney(d.amount)}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small" 
                            onClick={async () => {
                              await toggleDebtPaid(d.id)
                              showToast('Hesap kapatıldı olarak işaretlendi. ✓', 'success')
                            }}
                            sx={{ minWidth: 'auto', px: 1, py: 0.5, fontSize: '0.7rem' }}
                          >
                            Kapat ✓
                          </Button>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => {
                              deleteDebt(d.id)
                              showToast('Hesap silindi.', 'info')
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>

      {/* Settled Debts List */}
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>Kapatılan Hesaplar ({settledDebts.length})</Typography>

        {settledDebts.length === 0 ? (
          <Card sx={{ borderRadius: 6, p: 4, textAlign: 'center', bgcolor: 'background.glass', border: '1px dashed', borderColor: 'glassBorder' }}>
            <Typography variant="body2" color="text.secondary">Henüz kapatılmış hesap bulunmuyor.</Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {settledDebts.map(d => (
              <Card key={d.id} sx={{ 
                borderRadius: 6, 
                bgcolor: 'background.glass',
                border: 1, borderColor: 'glassBorder',
                transition: 'all 0.3s',
                filter: 'grayscale(0.5)',
                opacity: 0.7,
                '&:hover': { opacity: 0.9, filter: 'grayscale(0)', transform: 'translateX(4px)' }
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ textDecoration: 'line-through' }}>{d.person}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({d.type === 'borrowed' ? 'Borç' : 'Alacak'} Kapatıldı)
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">{d.description}</Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Box textAlign="right" mr={1}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">{formatMoney(d.amount)}</Typography>
                        <Button 
                          size="small" 
                          startIcon={<UndoIcon fontSize="small" />} 
                          onClick={async () => {
                            await toggleDebtPaid(d.id)
                            showToast('Hesap aktif hale getirildi.', 'info')
                          }}
                          sx={{ textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '0.7rem' }}
                        >
                          Geri Aç
                        </Button>
                      </Box>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => {
                          deleteDebt(d.id)
                          showToast('Hesap silindi.', 'info')
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Add Debt Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Borç/Alacak Hesabı Ekle">
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={1}>
            <ToggleButtonGroup
              color="primary"
              value={type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              size="small"
            >
              <ToggleButton value="borrowed">Borç Alındı (Borcum)</ToggleButton>
              <ToggleButton value="lent">Borç Verildi (Alacağım)</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label="Kişi Adı"
              type="text"
              variant="outlined"
              placeholder="Örn: Ahmet Yılmaz, Banka"
              value={person}
              onChange={e => setPerson(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Tutar (TL)"
              type="number"
              variant="outlined"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Vade / Ödeme Tarihi"
              type="date"
              variant="outlined"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Açıklama / Detay"
              type="text"
              variant="outlined"
              placeholder="Örn: Kira yardımı, Akşam yemeği payı"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
            />

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ borderRadius: 8 }}>
              Kaydı Kaydet ✨
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  )
}

