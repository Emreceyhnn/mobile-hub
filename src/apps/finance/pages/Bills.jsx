import { useState } from 'react'
import { useFinance } from '../../../context/FinanceContext'
import { useToast } from '../../../components/ui/Toast'
import Modal from '../../../components/ui/Modal'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, IconButton, Avatar, Chip, Stack, alpha } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReceiptIcon from '@mui/icons-material/Receipt'
import UndoIcon from '@mui/icons-material/Undo'
import EventIcon from '@mui/icons-material/Event'
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant'

const BILL_CATEGORIES = ['Elektrik', 'Su', 'Doğalgaz', 'İnternet', 'Kira', 'Aidat', 'Telefon', 'Diğer']

export default function Bills() {
  const { bills, addBill, toggleBillPaid, deleteBill } = useFinance()
  const showToast = useToast()

  const [isOpen, setIsOpen] = useState(false)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState(BILL_CATEGORIES[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount <= 0) {
      showToast('Lütfen geçerli bir tutar girin.', 'error')
      return
    }

    try {
      await addBill({
        name: name.trim(),
        amount: numericAmount,
        dueDate,
        category,
        paid: false
      })
      showToast('Fatura başarıyla eklendi! 🧾', 'success')
      setIsOpen(false)
      setName('')
      setAmount('')
    } catch {
      showToast('Fatura eklenirken hata oluştu.', 'error')
    }
  }

  const formatMoney = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
  }

  const getDaysRemaining = (dueDateStr) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDateStr)
    due.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const unpaidBills = bills.filter(b => !b.paid)
  const paidBills = bills.filter(b => b.paid)

  return (
    <Box sx={{ pb: 10, pt: 2, px: 2, position: 'relative' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ 
            color: 'warning.main',
            mb: 0.5
          }}>
            Faturalar
          </Typography>
          <Typography variant="body2" color="text.secondary">Aylık sabit ödemeleriniz</Typography>
        </Box>
        <IconButton 
          onClick={() => setIsOpen(true)} 
          sx={{ 
            bgcolor: 'warning.main', 
            color: 'background.default',
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.warning.main, 0.4)}`,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'warning.light', transform: 'scale(1.05)' },
            '&:active': { transform: 'scale(0.95)' }
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Summary Box */}
      <Card sx={{ 
        mb: 4, p: 3, 
        bgcolor: 'background.glass',
        backdropFilter: 'blur(20px)',
        border: 1,
        borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
        borderRadius: 5,
        boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.common.black, 0.3)}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute', top: -30, right: -30, width: 100, height: 100,
          background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.2)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
          <Box>
            <Typography variant="overline" color="warning.light">TOPLAM ÖDENECEK</Typography>
            <Typography variant="h3" color="warning.main" mt={0.5}>
              {formatMoney(unpaidBills.reduce((sum, b) => sum + b.amount, 0))}
            </Typography>
          </Box>
          <Box textAlign="right" sx={{ 
            bgcolor: 'background.glassActive', 
            p: 1.5, px: 2, 
            borderRadius: 4,
            border: 1, borderColor: 'glassBorder'
          }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Bekleyen</Typography>
            <Chip label={unpaidBills.length} sx={{ bgcolor: 'warning.main', color: 'background.default', fontWeight: 800, height: 24 }} />
          </Box>
        </Box>
      </Card>

      {/* Unpaid section */}
      <Box mb={5}>
        <Typography variant="h6" mb={2.5}>Gelecek Ödemeler</Typography>
        
        {unpaidBills.length === 0 ? (
          <Card sx={{ p: 5, textAlign: 'center', borderStyle: 'dashed', borderColor: 'glassBorder', bgcolor: 'background.glass', borderRadius: 4, backdropFilter: 'blur(10px)' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.5, mb: 2 }} />
            <Typography variant="subtitle1" color="text.secondary">Ödenecek fatura bulunmuyor.</Typography>
            <Typography variant="body2" color="text.disabled">Harika gidiyorsun!</Typography>
          </Card>
        ) : (
          <Stack spacing={2.5}>
            {unpaidBills.sort((a, b) => getDaysRemaining(a.dueDate) - getDaysRemaining(b.dueDate)).map(b => {
              const days = getDaysRemaining(b.dueDate)
              const isLate = days < 0
              const isSoon = days >= 0 && days <= 3

              return (
                <Card key={b.id} sx={{ 
                  borderRadius: 4,
                  border: 1,
                  borderColor: (theme) => isLate ? alpha(theme.palette.error.main, 0.3) : 'glassBorder',
                  bgcolor: 'background.glass',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: (theme) => isLate ? `0 12px 32px ${alpha(theme.palette.error.main, 0.4)}` : `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                    borderColor: (theme) => isLate ? alpha(theme.palette.error.main, 0.6) : alpha(theme.palette.common.white, 0.2)
                  }
                }}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2.5}>
                        <Avatar sx={{ 
                          bgcolor: (theme) => isLate ? alpha(theme.palette.error.main, 0.15) : isSoon ? alpha(theme.palette.warning.main, 0.15) : alpha(theme.palette.info.main, 0.15), 
                          color: isLate ? 'error.main' : isSoon ? 'warning.main' : 'info.main',
                          borderRadius: 3,
                          width: 48, height: 48
                        }}>
                          {isLate ? <NotificationImportantIcon /> : <ReceiptIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" color="text.primary">{b.name}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                            {b.category}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <EventIcon sx={{ fontSize: 14, color: isLate ? 'error.main' : 'text.disabled' }} />
                            <Typography variant="caption" color={isLate ? 'error.main' : isSoon ? 'warning.main' : 'text.disabled'}>
                              {b.dueDate} 
                              {isLate ? ' (Gecikti!)' : isSoon ? ` (${days} gün kaldı)` : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box textAlign="right">
                          <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>{formatMoney(b.amount)}</Typography>
                          <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ 
                              borderRadius: 2, px: 2, py: 0.5,
                              bgcolor: isLate ? 'error.main' : 'background.glassActive',
                              color: isLate ? 'common.white' : 'text.primary',
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: isLate ? 'error.dark' : 'background.glassHover',
                                transform: 'scale(1.05)'
                              }
                            }}
                            onClick={async () => {
                              await toggleBillPaid(b.id)
                              showToast('Fatura ödendi olarak işaretlendi! 🎉', 'success')
                            }}
                          >
                            Öde
                          </Button>
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

      {/* Paid section */}
      <Box>
        <Typography variant="h6" mb={2.5}>Ödenen Faturalar</Typography>
        
        {paidBills.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderColor: 'glassBorder', bgcolor: 'background.glass', borderRadius: 4 }}>
            <Typography variant="body2" color="text.disabled">Henüz ödenmiş fatura bulunmuyor.</Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {paidBills.sort((a, b) => b.dueDate.localeCompare(a.dueDate)).map(b => (
              <Card key={b.id} sx={{ 
                opacity: 0.6,
                borderRadius: 4,
                bgcolor: 'background.glass',
                border: 1, borderColor: 'glassBorder',
                transition: 'all 0.3s',
                filter: 'grayscale(0.5)',
                '&:hover': { opacity: 0.9, filter: 'grayscale(0)', transform: 'translateX(4px)' }
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 40, height: 40 }}>
                        <CheckCircleIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>{b.name}</Typography>
                        <Typography variant="caption" color="text.disabled" display="block">
                          {b.category} · Ödenme: {b.dueDate}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Box textAlign="right" mr={1}>
                        <Typography variant="subtitle2" color="text.secondary">{formatMoney(b.amount)}</Typography>
                        <Button 
                          size="small" 
                          startIcon={<UndoIcon sx={{ fontSize: 14 }} />} 
                          onClick={async () => {
                            await toggleBillPaid(b.id)
                            showToast('Fatura ödenmemiş olarak işaretlendi.', 'info')
                          }}
                          sx={{ textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '0.75rem', color: 'text.disabled', '&:hover': { color: 'warning.main' } }}
                        >
                          Geri Al
                        </Button>
                      </Box>
                      <IconButton 
                        size="small" 
                        sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.1) } }} 
                        onClick={() => {
                          deleteBill(b.id)
                          showToast('Fatura silindi.', 'info')
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

      {/* Add Bill Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Yeni Fatura Ekle">
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Fatura Adı"
              type="text"
              variant="outlined"
              placeholder="Örn: Ev Kirası, Fiber İnternet"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <TextField
              label="Tutar (TL)"
              type="number"
              variant="outlined"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={category}
                label="Kategori"
                onChange={e => setCategory(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                {BILL_CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Son Ödeme Tarihi"
              type="date"
              variant="outlined"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large" 
              fullWidth 
              sx={{ 
                borderRadius: 4, 
                py: 1.5,
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
            >
              Faturayı Kaydet ✨
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  )
}
