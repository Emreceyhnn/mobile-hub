import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'

export default function LoginScreen() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemo } = useAuth()
  const showToast = useToast()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await loginWithEmail(form.email, form.password)
        showToast('Hoş geldin! 👋', 'success')
      } else {
        if (!form.name.trim()) return showToast('İsim gerekli', 'error')
        await registerWithEmail(form.email, form.password, form.name)
        showToast('Hesap oluşturuldu! 🎉', 'success')
      }
    } catch (err) {
      console.error("Auth Error:", err)
      if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('CONFIGURATION_NOT_FOUND'))) {
        showToast('Firebase Auth henüz kurulmadığı için Demo Modu otomatik aktif edildi! 🚀', 'info', 5000)
        loginAsDemo()
      } else {
        const msgs = {
          'auth/invalid-credential': 'E-posta veya şifre hatalı',
          'auth/email-already-in-use': 'Bu e-posta zaten kullanımda',
          'auth/weak-password': 'Şifre en az 6 karakter olmalı',
          'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekle.',
        }
        showToast(msgs[err.code] || err.message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      showToast('Google ile giriş başarılı! 🎉', 'success')
    } catch (e) {
      console.error("Google Login Error:", e)
      let msg = 'Google girişi başarısız'
      if (e.code === 'auth/popup-blocked') {
        msg = 'Giriş penceresi tarayıcı tarafından engellendi. Pop-up engelleyiciyi kapatın.'
      } else if (e.code === 'auth/operation-not-allowed') {
        msg = 'Firebase Konsolu\'nda Google ile Giriş henüz aktif edilmemiş.'
      } else if (e.code === 'auth/popup-closed-by-user') {
        msg = 'Giriş penceresi kapatıldı.'
      } else {
        msg = `${msg}: ${e.message || e}`
      }
      showToast(msg, 'error', 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: '60vw', height: '60vw', maxWidth: 320, maxHeight: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,217,163,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-10%',
        width: '50vw', height: '50vw', maxWidth: 280, maxHeight: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <div style={{ padding: '72px 32px 40px', textAlign: 'center' }}>
        <div style={{
          fontSize: 64,
          marginBottom: 16,
          filter: 'drop-shadow(0 0 20px rgba(0,217,163,0.4))'
        }}>🥗</div>
        <h1 style={{
          fontSize: 32, fontWeight: 900,
          background: 'var(--gradient-hero)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
        }}>NutriTrack</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Yapay zeka destekli besin takip uygulaması
        </p>
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: 'var(--bg-secondary)',
        borderRadius: '28px 28px 0 0',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        padding: '28px 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Segment */}
        <div className="segment">
          <button
            className={`segment-btn${mode === 'login' ? ' active' : ''}`}
            onClick={() => setMode('login')}
            id="login-tab-btn"
          >Giriş Yap</button>
          <button
            className={`segment-btn${mode === 'register' ? ' active' : ''}`}
            onClick={() => setMode('register')}
            id="register-tab-btn"
          >Kayıt Ol</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Ad Soyad</label>
              <div className="input-icon-wrap">
                <span className="input-icon">👤</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Adın Soyadın"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  id="register-name-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">E-posta</label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input
                className="input"
                type="email"
                placeholder="ornek@mail.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                id="email-input"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Şifre</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                id="password-input"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            id="auth-submit-btn"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading
              ? <span className="spinner" style={{ width: 20, height: 20 }} />
              : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'
            }
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>ya da</span>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        <button
          className="btn btn-secondary btn-full"
          onClick={handleGoogle}
          id="google-login-btn"
          disabled={loading}
          style={{ gap: 10 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Google ile Devam Et
        </button>

        <button
          className="btn btn-full"
          onClick={() => {
            loginAsDemo()
            showToast('Demo Modu Aktif! 🎉 Tüm özellikleri test edebilirsiniz.', 'success')
          }}
          id="demo-login-btn"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 163, 0.1), rgba(139, 92, 246, 0.1))',
            color: 'var(--accent-green)',
            border: '1.5px dashed var(--accent-green)',
            fontWeight: 700
          }}
        >
          🚀 Demo Modu ile Hemen Giriş Yap
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Devam ederek{' '}
          <span style={{ color: 'var(--accent-green)' }}>Gizlilik Politikası</span>'nı kabul etmiş olursunuz
        </p>
      </div>
    </div>
  )
}
