import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getWeeklyLogs } from '../services/firestore'
import { sumMacros, formatDate } from '../utils/nutrition'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import FoodCard from '../components/food/FoodCard'

export default function History() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState([])
  const [selectedDayLog, setSelectedDayLog] = useState(null)

  useEffect(() => {
    async function loadHistory() {
      if (!user) return
      try {
        const logs = await getWeeklyLogs(user.uid)
        const formatted = Object.entries(logs).map(([dateKey, meals]) => {
          const totals = sumMacros(meals)
          return { dateKey, meals, totals }
        }).sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        
        setWeeklyData(formatted)
        if (formatted.length > 0) {
          setSelectedDayLog(formatted[0])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [user])

  if (loading) {
    return (
      <div className="page-content flex justify-center items-center" style={{ minHeight: '60dvh' }}>
        <LoadingSpinner text="Geçmiş veriler yükleniyor..." />
      </div>
    )
  }

  const allMealsSelected = selectedDayLog 
    ? Object.entries(selectedDayLog.meals).flatMap(([type, list]) => list.map(item => ({ ...item, type })))
    : []

  return (
    <div className="page-content slide-up">
      <h2 className="text-xl fw-800 mb-16" style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Besin Geçmişi
      </h2>

      {/* Week Overview List */}
      <div className="flex flex-col gap-12 mb-24">
        <h3 className="section-title">Son 7 Gün</h3>
        {weeklyData.map((day) => {
          const isSelected = selectedDayLog?.dateKey === day.dateKey
          const hasLogged = day.totals.calories > 0
          
          return (
            <div
              key={day.dateKey}
              className="card"
              style={{
                border: isSelected ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                background: isSelected ? 'var(--accent-green-dim)' : 'var(--gradient-card)',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedDayLog(day)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm fw-700">{formatDate(day.dateKey)}</h4>
                  <span className="text-xs text-muted mt-4 block">
                    {hasLogged ? `${day.totals.protein}g P · ${day.totals.carbs}g K · ${day.totals.fat}g Y` : 'Veri girilmedi'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base fw-800" style={{ color: hasLogged ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {day.totals.calories} kcal
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Panel */}
      {selectedDayLog && (
        <div className="card fade-in">
          <h3 className="text-base fw-700 mb-12">
            {formatDate(selectedDayLog.dateKey)} Detayları
          </h3>
          <div className="divider" />
          {allMealsSelected.length === 0 ? (
            <p className="text-sm text-muted text-center" style={{ padding: '24px 0' }}>
              Bu günde eklenmiş herhangi bir besin kaydı bulunamadı.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {allMealsSelected.map((item, idx) => (
                <FoodCard key={idx} food={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
