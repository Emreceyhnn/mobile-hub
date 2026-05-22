import { useState } from 'react'
import { useNutrition } from '../../context/NutritionContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

export default function WaterCard() {
  const { profile } = useAuth()
  const { water, updateWater } = useNutrition()
  const showToast = useToast()
  
  const [customVal, setCustomVal] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const goal = profile?.dailyWaterGoal || 2500
  const percent = Math.min(100, Math.round((water / goal) * 100))

  const handleAddWater = async (amount: number) => {
    const nextAmount = water + amount
    await updateWater(nextAmount)
    showToast(`💧 ${amount} ml su eklendi!`, 'success')
  }

  const handleUndo = async () => {
    if (water <= 0) return
    const nextAmount = Math.max(0, water - 250)
    await updateWater(nextAmount)
    showToast('↩ Son ekleme geri alındı (-250 ml)', 'info')
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(customVal)
    if (isNaN(amount) || amount <= 0) {
      showToast('Lütfen geçerli bir su miktarı girin.', 'error')
      return
    }
    const nextAmount = water + amount
    await updateWater(nextAmount)
    showToast(`💧 ${amount} ml su eklendi!`, 'success')
    setCustomVal('')
    setShowCustomInput(false)
  }

  return (
    <div className="card" style={{ padding: '20px 16px' }} id="water-tracker-card">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-base fw-800" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💧</span> Su Takibi
          </h4>
          <p className="text-xs text-muted mt-4">Günlük su dengenizi koruyun</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="text-lg fw-900" style={{ color: 'var(--accent-blue)' }}>
            {water.toLocaleString('tr-TR')}
          </span>
          <span className="text-xs text-muted"> / {goal.toLocaleString('tr-TR')} ml</span>
          <span 
            className="text-xs fw-700 block" 
            style={{ 
              color: percent >= 100 ? 'var(--accent-green)' : 'var(--accent-blue)',
              marginTop: 2
            }}
          >
            %{percent} Tamamlandı
          </span>
        </div>
      </div>

      <div className="water-card-content">
        {/* Animated Glass Visual */}
        <div className="water-visual" aria-label="Su kabı göstergesi" role="img">
          <div className="water-fill" style={{ height: `${percent}%` }}>
            {percent > 0 && (
              <>
                <div className="water-wave" />
                <div className="water-wave-back" />
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="water-actions">
          {!showCustomInput ? (
            <>
              <div className="water-quick-grid">
                <button
                  type="button"
                  className="btn-water"
                  onClick={() => handleAddWater(250)}
                  id="add-water-250"
                  aria-label="250 ml su ekle"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  className="btn-water"
                  onClick={() => handleAddWater(500)}
                  id="add-water-500"
                  aria-label="500 ml su ekle"
                >
                  +500 ml
                </button>
              </div>
              <div className="water-quick-grid">
                <button
                  type="button"
                  className="btn-water"
                  onClick={() => setShowCustomInput(true)}
                  id="add-water-custom-trigger"
                  aria-label="Özel su miktarı ekle"
                >
                  Özel ➕
                </button>
                <button
                  type="button"
                  className="btn-water btn-water-undo"
                  onClick={handleUndo}
                  disabled={water <= 0}
                  id="undo-water"
                  aria-label="Son su eklemeyi geri al"
                >
                  Geri Al ↩
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  className="input"
                  placeholder="Miktar (ml)"
                  value={customVal}
                  onChange={e => setCustomVal(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: 13, height: 38 }}
                  id="custom-water-input"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0 12px', width: 38, height: 38, borderRadius: 'var(--radius-md)' }}
                  id="custom-water-submit-btn"
                  aria-label="Kaydet"
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setCustomVal('')
                    setShowCustomInput(false)
                  }}
                  style={{ padding: '0 12px', width: 38, height: 38, borderRadius: 'var(--radius-md)' }}
                  id="custom-water-cancel-btn"
                  aria-label="İptal et"
                >
                  ✕
                </button>
              </div>
              <span className="text-xs text-muted text-center">ml cinsinden değer girin</span>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
