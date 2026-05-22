import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { calculateBMR, calculateTDEE, ACTIVITY_LABELS } from '../utils/nutrition'

export default function Profile() {
  const { profile, updateUserProfile, logout } = useAuth()
  const showToast = useToast()

  const [form, setForm] = useState({
    name: profile?.name || '',
    age: profile?.age || 25,
    weight: profile?.weight || 70,
    height: profile?.height || 170,
    gender: profile?.gender || 'male',
    activityLevel: profile?.activityLevel || 'sedentary',
    dailyGoal: profile?.dailyGoal || 2000,
    dailyWaterGoal: profile?.dailyWaterGoal || 2500,
  })

  const handleCalculate = () => {
    const bmr = calculateBMR(form.weight, form.height, form.age, form.gender)
    const tdee = calculateTDEE(bmr, form.activityLevel)
    
    // Recommend water goal: weight * 35 ml
    const recommendedWater = Math.round(form.weight * 35)
    // Add 500ml extra if active/veryActive
    const activityBonus = (form.activityLevel === 'active' || form.activityLevel === 'veryActive') ? 500 : 0
    const finalWaterGoal = recommendedWater + activityBonus

    setForm(p => ({ ...p, dailyGoal: tdee, dailyWaterGoal: finalWaterGoal }))
    showToast(`BMR, TDEE ve Su Hedefi hesaplandı! Kalori: ${tdee} kcal, Su: ${finalWaterGoal} ml 🎯`, 'info')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await updateUserProfile(form)
      showToast('Profil güncellendi! 🎉', 'success')
    } catch {
      showToast('Güncelleme sırasında hata oluştu', 'error')
    }
  }

  return (
    <div className="page-content slide-up">
      <h2 className="text-xl fw-800 mb-16" style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Profil & Hedefler
      </h2>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <h3 className="section-title">Kişisel Bilgiler</h3>
          
          <div className="input-group mb-12">
            <label className="input-label">Ad Soyad</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              id="profile-name"
              required
            />
          </div>

          <div className="grid-2 mb-12">
            <div className="input-group">
              <label className="input-label">Boy (cm)</label>
              <input
                type="number"
                className="input"
                value={form.height}
                onChange={e => setForm(p => ({ ...p, height: parseInt(e.target.value) || 0 }))}
                id="profile-height"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Kilo (kg)</label>
              <input
                type="number"
                className="input"
                value={form.weight}
                onChange={e => setForm(p => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
                id="profile-weight"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Yaş</label>
              <input
                type="number"
                className="input"
                value={form.age}
                onChange={e => setForm(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
                id="profile-age"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Cinsiyet</label>
              <select
                className="input"
                value={form.gender}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                id="profile-gender"
              >
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Aktivite Düzeyi</h3>
          <div className="input-group mb-16">
            <select
              className="input"
              value={form.activityLevel}
              onChange={e => setForm(p => ({ ...p, activityLevel: e.target.value }))}
              id="profile-activity"
            >
              {Object.entries(ACTIVITY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            className="btn btn-secondary btn-full mb-12"
            onClick={handleCalculate}
            id="calculate-bmr-btn"
          >
            BMR & TDEE ile Kalori Hesapla 🎯
          </button>
        </div>

        <div className="card">
          <h3 className="section-title">Günlük Hedefler</h3>
          <div className="input-group mb-12">
            <label className="input-label">Günlük Kalori Hedefi (kcal)</label>
            <input
              type="number"
              className="input"
              value={form.dailyGoal}
              onChange={e => setForm(p => ({ ...p, dailyGoal: parseInt(e.target.value) || 0 }))}
              id="profile-daily-goal"
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Günlük Su Hedefi (ml)</label>
            <input
              type="number"
              className="input"
              value={form.dailyWaterGoal}
              onChange={e => setForm(p => ({ ...p, dailyWaterGoal: parseInt(e.target.value) || 0 }))}
              id="profile-daily-water-goal"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full" id="save-profile-btn">
          Değişiklikleri Kaydet ✨
        </button>

        <button
          type="button"
          className="btn btn-danger btn-full"
          onClick={() => {
            logout()
            showToast('Çıkış yapıldı.', 'info')
          }}
          id="logout-btn"
          style={{ marginTop: 8 }}
        >
          Çıkış Yap 🚪
        </button>
      </form>
    </div>
  )
}
