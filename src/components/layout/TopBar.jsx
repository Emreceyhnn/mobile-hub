import { useAuth } from '../../context/AuthContext'
import { useNutrition } from '../../context/NutritionContext'

const today = new Date()
const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export default function TopBar() {
  const { user, profile } = useAuth()
  const { selectedDate } = useNutrition()

  const dateObj = selectedDate
    ? (() => { const [y,m,d] = selectedDate.split('-'); return new Date(y, m-1, d) })()
    : today

  const isToday = selectedDate === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const displayName = profile?.name || user?.displayName || 'Kullanıcı'
  const firstName = displayName.split(' ')[0]

  const dateLabel = isToday
    ? 'Bugün'
    : `${dateObj.getDate()} ${MONTH_NAMES[dateObj.getMonth()]}`

  return (
    <header className="topbar" role="banner">
      <div>
        <span className="topbar-logo">NutriTrack</span>
        <div className="topbar-date">{dateLabel} · Merhaba, {firstName} 👋</div>
      </div>
      <div style={{
        width: 38, height: 38,
        borderRadius: '50%',
        background: 'var(--gradient-hero)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, color: '#001a12',
        flexShrink: 0,
      }}>
        {(displayName[0] || '?').toUpperCase()}
      </div>
    </header>
  )
}
