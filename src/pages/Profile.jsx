import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { calculateBMR, calculateTDEE, ACTIVITY_LABELS } from '../utils/nutrition'
import { NotificationService } from '../services/notificationService'

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
    reminders: profile?.reminders || {
      enabled: false,
      intervalHours: 3,
      startHour: 8,
      endHour: 22,
      remindWater: true,
      remindFood: true,
    }
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

  const handleReminderToggle = async () => {
    const isCurrentlyEnabled = form.reminders?.enabled;
    if (!isCurrentlyEnabled) {
      const permission = await NotificationService.requestPermission();
      if (permission === 'granted') {
        setForm(p => ({
          ...p,
          reminders: { ...p.reminders, enabled: true }
        }));
        showToast('Bildirimler aktif hale getirildi! 🔔', 'success');
      } else {
        setForm(p => ({
          ...p,
          reminders: { ...p.reminders, enabled: false }
        }));
        showToast('Tarayıcı bildirim izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.', 'error');
      }
    } else {
      setForm(p => ({
        ...p,
        reminders: { ...p.reminders, enabled: false }
      }));
      showToast('Bildirimler kapatıldı.', 'info');
    }
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

        <div className="card">
          <h3 className="section-title">Hatırlatıcı Ayarları 🔔</h3>
          
          <div className="flex items-center justify-between mb-12" style={{ padding: '4px 0' }}>
            <div>
              <div className="fw-600 text-base">Bildirim Hatırlatıcıları</div>
              <div className="text-xs text-muted mt-4">Su içme ve yemek yeme hatırlatıcılarını al</div>
            </div>
            <label className="switch-container" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.reminders?.enabled || false}
                onChange={handleReminderToggle}
                style={{ opacity: 0, width: 0, height: 0 }}
                id="reminder-enabled-toggle"
              />
              <span className={`slider ${form.reminders?.enabled ? 'active' : ''}`} style={{
                position: 'absolute', cursor: 'pointer', inset: 0,
                backgroundColor: form.reminders?.enabled ? 'var(--accent-green)' : 'var(--bg-input)',
                borderRadius: 24, transition: 'var(--transition)'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: 16, width: 16, left: form.reminders?.enabled ? 25 : 3, bottom: 4,
                  backgroundColor: '#fff', borderRadius: '50%', transition: 'var(--transition)'
                }} />
              </span>
            </label>
          </div>

          {form.reminders?.enabled && (
            <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Hatırlatma Sıklığı (Saat)</label>
                <select
                  className="input"
                  value={form.reminders?.intervalHours || 3}
                  onChange={e => setForm(p => ({
                    ...p,
                    reminders: { ...p.reminders, intervalHours: parseInt(e.target.value) || 3 }
                  }))}
                  id="reminder-interval"
                >
                  <option value="1">Her saat başı</option>
                  <option value="2">2 saatte bir</option>
                  <option value="3">3 saatte bir</option>
                  <option value="4">4 saatte bir</option>
                  <option value="6">6 saatte bir</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Başlangıç Saati</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    className="input"
                    value={form.reminders?.startHour ?? 8}
                    onChange={e => setForm(p => ({
                      ...p,
                      reminders: { ...p.reminders, startHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }
                    }))}
                    id="reminder-start-hour"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Bitiş Saati (Sessiz)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    className="input"
                    value={form.reminders?.endHour ?? 22}
                    onChange={e => setForm(p => ({
                      ...p,
                      reminders: { ...p.reminders, endHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }
                    }))}
                    id="reminder-end-hour"
                  />
                </div>
              </div>

              <div className="divider" />

              <div className="flex flex-col gap-12" style={{ padding: '4px 0' }}>
                <label className="flex items-center gap-8 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reminders?.remindWater ?? true}
                    onChange={e => setForm(p => ({
                      ...p,
                      reminders: { ...p.reminders, remindWater: e.target.checked }
                    }))}
                    id="reminder-remind-water"
                    style={{ accentColor: 'var(--accent-green)', width: 16, height: 16 }}
                  />
                  💧 Su İçme Hatırlatıcısı
                </label>

                <label className="flex items-center gap-8 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reminders?.remindFood ?? true}
                    onChange={e => setForm(p => ({
                      ...p,
                      reminders: { ...p.reminders, remindFood: e.target.checked }
                    }))}
                    id="reminder-remind-food"
                    style={{ accentColor: 'var(--accent-green)', width: 16, height: 16 }}
                  />
                  🍎 Yemek Yeme Hatırlatıcısı
                </label>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-full mt-4"
                onClick={() => {
                  NotificationService.sendTest();
                  showToast('Test bildirimi gönderildi! 🚀', 'success');
                }}
                id="test-notification-btn"
              >
                Test Bildirimi Gönder 🚀
              </button>
            </div>
          )}
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
