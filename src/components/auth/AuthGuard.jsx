import { useAuth } from '../../context/AuthContext'
import LoginScreen from '../auth/LoginScreen'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingSpinner size="lg" text="Veriler yükleniyor..." />
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <>{children}</>
}
