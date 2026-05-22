import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NutritionProvider } from './context/NutritionContext'
import { ToastProvider } from './components/ui/Toast'
import AuthGuard from './components/auth/AuthGuard'
import TopBar from './components/layout/TopBar'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Profile from './pages/Profile'
import { NotificationService } from './services/notificationService'
import './styles/index.css'

function AppContent() {
  const { profile } = useAuth()

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
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <NutritionProvider>
            <AppContent />
          </NutritionProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}
