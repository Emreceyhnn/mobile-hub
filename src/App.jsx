import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NutritionProvider } from './context/NutritionContext'
import { ToastProvider } from './components/ui/Toast'
import AuthGuard from './components/auth/AuthGuard'
import TopBar from './components/layout/TopBar'
import BottomNav from './components/layout/BottomNav'
import HubDashboard from './apps/hub/HubDashboard'
import Dashboard from './apps/nutrition/pages/Dashboard'
import History from './apps/nutrition/pages/History'
import Profile from './apps/nutrition/pages/Profile'
import { FinanceProvider } from './context/FinanceContext'
import FinanceDashboard from './apps/finance/pages/Dashboard'
import Transactions from './apps/finance/pages/Transactions'
import Bills from './apps/finance/pages/Bills'
import Savings from './apps/finance/pages/Savings'
import Debts from './apps/finance/pages/Debts'
import { NotificationService } from './services/notificationService'
import muiTheme from './styles/theme'
import './styles/index.css'

function AppContent() {
  const { profile } = useAuth()
  const location = useLocation()
  const showBottomNav = location.pathname.startsWith('/nutrition') || location.pathname.startsWith('/finance')

  useEffect(() => {
    if (!profile?.reminders?.enabled) return

    // Run the check immediately on mount or settings change
    NotificationService.checkAndNotify(profile.reminders)

    // Check every 60 seconds
    const interval = setInterval(() => {
      NotificationService.checkAndNotify(profile.reminders)
    }, 60000)

    return () => clearInterval(interval)
  }, [profile?.reminders])

  return (
    <AuthGuard>
      <div className="app-shell">
        <TopBar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HubDashboard />} />
            <Route path="/nutrition" element={<Dashboard />} />
            <Route path="/nutrition/history" element={<History />} />
            <Route path="/nutrition/profile" element={<Profile />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/finance/transactions" element={<Transactions />} />
            <Route path="/finance/bills" element={<Bills />} />
            <Route path="/finance/savings" element={<Savings />} />
            <Route path="/finance/debts" element={<Debts />} />
          </Routes>
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <Router>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthProvider>
          <ToastProvider>
            <NutritionProvider>
              <FinanceProvider>
                <AppContent />
              </FinanceProvider>
            </NutritionProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}
