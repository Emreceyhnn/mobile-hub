import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',        icon: '🏠', label: 'Ana Sayfa', id: 'nav-home' },
  { path: '/history', icon: '📅', label: 'Geçmiş',   id: 'nav-history' },
  { path: '/profile', icon: '👤', label: 'Profil',   id: 'nav-profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Ana navigasyon">
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            id={item.id}
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <div className="nav-dot" />
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
