import { useAuth } from '../../context/AuthContext'
import { useNutrition } from '../../context/NutritionContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Avatar, Box, Button, alpha } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GradientText from '../ui/atoms/GradientText'

const today = new Date()
const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export default function TopBar() {
  const { user, profile } = useAuth()
  const { selectedDate } = useNutrition()
  const location = useLocation()
  const navigate = useNavigate()

  const isHub = location.pathname === '/'
  const isFinance = location.pathname.startsWith('/finance')

  const dateObj = selectedDate
    ? (() => { const [y,m,d] = selectedDate.split('-'); return new Date(y, m-1, d) })()
    : today

  const isToday = selectedDate === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const displayName = profile?.name || user?.displayName || 'Kullanıcı'
  const firstName = displayName.split(' ')[0]

  const formattedToday = `${today.getDate()} ${MONTH_NAMES[today.getMonth()]}`
  const dateLabel = isFinance
    ? formattedToday
    : (isToday ? 'Bugün' : `${dateObj.getDate()} ${MONTH_NAMES[dateObj.getMonth()]}`)

  const appName = isHub ? 'Mobile Hub' : (isFinance ? 'FinTrack' : 'NutriTrack')

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.appBar', 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid',
        borderColor: 'glassBorder',
        zIndex: (theme) => theme.zIndex.appBar
      }}
    >
      <Toolbar sx={{ minHeight: (theme) => `${theme.spacing(8)} !important`, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          {!isHub && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/')}
              sx={{ 
                minWidth: (theme) => theme.spacing(5), 
                width: (theme) => theme.spacing(5), 
                height: (theme) => theme.spacing(5), 
                p: 0,
                borderRadius: 3,
                color: 'text.primary', 
                borderColor: 'glassBorder',
                bgcolor: 'background.glassActive',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'glassBorderHover' },
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </Button>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <GradientText variant="h6" fontWeight="900" gradient="mixedText" sx={{ 
              lineHeight: 1.2, 
              mb: 0.2
            }}>
              {appName}
            </GradientText>
            <Typography variant="caption" color="text.secondary" fontWeight="500" display="block">
              {isHub ? `Merhaba, ${firstName} 👋` : `${dateLabel} · Merhaba, ${firstName}`}
            </Typography>
          </Box>
        </Box>
        
        <Avatar 
          src={profile?.photoURL}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            fontWeight: 'bold',
            width: (theme) => theme.spacing(5.25),
            height: (theme) => theme.spacing(5.25),
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            border: '2px solid',
            borderColor: 'primary.light',
            transition: (theme) => `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`,
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          {(!profile?.photoURL && displayName[0]) ? displayName[0].toUpperCase() : '?'}
        </Avatar>
      </Toolbar>
    </AppBar>
  )
}
