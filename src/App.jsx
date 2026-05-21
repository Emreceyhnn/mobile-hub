import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NutritionProvider } from './context/NutritionContext'
import { ToastProvider } from './components/ui/Toast'
import AuthGuard from './components/auth/AuthGuard'
import TopBar from './components/layout/TopBar'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Profile from './pages/Profile'
import './styles/index.css'

function AppContent() {
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
