import { useLocation, useNavigate } from 'react-router-dom'
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'

import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ReceiptIcon from '@mui/icons-material/Receipt'
import SavingsIcon from '@mui/icons-material/Savings'
import HandshakeIcon from '@mui/icons-material/Handshake'

const NUTRITION_ITEMS = [
  { path: '/nutrition',         icon: <HomeIcon />,    label: 'Ana Sayfa', id: 'nav-home' },
  { path: '/nutrition/history', icon: <HistoryIcon />, label: 'Geçmiş',   id: 'nav-history' },
  { path: '/nutrition/profile', icon: <PersonIcon />,  label: 'Profil',   id: 'nav-profile' },
]

const FINANCE_ITEMS = [
  { path: '/finance',              icon: <DashboardIcon />,   label: 'Pano',      id: 'nav-fin-home' },
  { path: '/finance/transactions', icon: <ReceiptLongIcon />, label: 'İşlemler',  id: 'nav-fin-tx' },
  { path: '/finance/bills',        icon: <ReceiptIcon />,     label: 'Faturalar', id: 'nav-fin-bills' },
  { path: '/finance/savings',      icon: <SavingsIcon />,     label: 'Birikim',   id: 'nav-fin-savings' },
  { path: '/finance/debts',        icon: <HandshakeIcon />,   label: 'Borçlar',   id: 'nav-fin-debts' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isFinance = location.pathname.startsWith('/finance')
  const items = isFinance ? FINANCE_ITEMS : NUTRITION_ITEMS

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        pb: 'env(safe-area-inset-bottom)', 
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'background.appBar',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid',
        borderColor: 'glassBorder'
      }} 
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(event, newValue) => {
          navigate(newValue)
        }}
        sx={{ 
          bgcolor: 'transparent', 
          height: (theme) => theme.spacing(8.5),
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: (theme) => theme.spacing(0.75, 0),
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 600,
            mt: 0.5,
            letterSpacing: '0.02em',
            '&.Mui-selected': {
              fontSize: '0.7rem',
            }
          }
        }}
      >
        {items.map(item => (
          <BottomNavigationAction
            key={item.path}
            value={item.path}
            label={item.label}
            icon={item.icon}
            id={item.id}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
