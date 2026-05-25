import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { Box, Typography, Button, Stack, Container, alpha } from '@mui/material'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import AppLaunchCard from '../../components/ui/molecules/AppLaunchCard'

export default function HubDashboard() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()

  const displayName = profile?.name || user?.displayName || 'Kullanıcı'
  const firstName = displayName.split(' ')[0]

  const handleAppClick = (appPath, isAvailable = true) => {
    if (isAvailable) {
      navigate(appPath)
    } else {
      showToast('Bu uygulama çok yakında hizmetinizde olacak! 🚀', 'info')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      {/* Welcome Header */}
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: (theme) => theme.spacing(8), 
            mb: 2,
            animation: 'slideUpFade 0.6s ease-out'
          }}
        >
          📱
        </Typography>
        <Typography 
          variant="h3" 
          fontWeight="900" 
          color="primary.light" 
          gutterBottom
          sx={{ animation: 'fadeIn 0.8s ease-out' }}
        >
          Mobile Hub
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ animation: 'fadeIn 1s ease-out' }}
        >
          Merhaba, <Typography component="span" fontWeight="bold" color="text.primary">{firstName}</Typography> 👋. Gitmek istediğiniz uygulamayı seçin.
        </Typography>
      </Box>

      {/* Grid of Apps */}
      <Stack spacing={3} mb={6} sx={{ animation: 'slideUpFade 0.8s ease-out' }}>
        <AppLaunchCard
          title="NutriTrack"
          description="Yapay zeka destekli besin ve kalori takibi. Günlük su ve makro hedeflerinizi yönetin."
          icon={RestaurantIcon}
          baseColor="secondary"
          gradient="appNutrition"
          onClick={() => handleAppClick('/nutrition')}
        />

        <AppLaunchCard
          title="FinTrack"
          description="Gelir-gider bütçesi, fatura takibi, birikim hedefleri ve borç defteri."
          icon={AccountBalanceWalletIcon}
          baseColor="primary"
          gradient="appFinance"
          onClick={() => handleAppClick('/finance')}
        />

        <AppLaunchCard
          title="FitPulse"
          description="Kişiselleştirilmiş antrenman programları ve egzersiz kütüphanesi."
          icon={FitnessCenterIcon}
          baseColor="primary"
          isAvailable={false}
          statusLabel="Yakında"
          onClick={() => handleAppClick('/fitness', false)}
        />
      </Stack>

      {/* Log out section */}
      <Box display="flex" justifyContent="center" sx={{ animation: 'fadeIn 1.2s ease-out' }}>
        <Button
          variant="contained"
          onClick={() => {
            logout()
            showToast('Çıkış yapıldı.', 'info')
          }}
          startIcon={<ExitToAppIcon />}
          sx={{ 
            px: 4, 
            py: 1.5,
            background: (theme) => alpha(theme.palette.error.main, 0.1),
            color: 'error.main',
            boxShadow: 'none',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
            '&:hover': {
              background: (theme) => alpha(theme.palette.error.main, 0.2),
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
            }
          }}
        >
          Hesaptan Çıkış Yap
        </Button>
      </Box>
    </Container>
  )
}
