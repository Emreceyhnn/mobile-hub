import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import { 
  Box, Typography, TextField, Button, Paper, Stack, Divider, CircularProgress, ButtonGroup, InputAdornment 
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

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
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <Box sx={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: '60vw', height: '60vw', maxWidth: 320, maxHeight: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,217,163,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '10%', right: '-10%',
        width: '50vw', height: '50vw', maxWidth: 280, maxHeight: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <Box sx={{ pt: 9, pb: 5, px: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 64, mb: 2, filter: 'drop-shadow(0 0 20px rgba(0,217,163,0.4))' }}>
          🥗
        </Typography>
        <Typography variant="h4" fontWeight="900" sx={{
          background: 'var(--gradient-hero)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          NutriTrack
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Yapay zeka destekli besin takip uygulaması
        </Typography>
      </Box>

      {/* Card */}
      <Paper sx={{
        flex: 1,
        borderRadius: '32px 32px 0 0',
        px: 3,
        pt: 4,
        pb: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        bgcolor: 'rgba(22, 26, 39, 0.7)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 -12px 48px rgba(0,0,0,0.2)'
      }}>
        {/* Segment */}
        <ButtonGroup fullWidth variant="outlined" sx={{ '& .MuiButton-root': { borderRadius: 3, py: 1 } }}>
          <Button 
            variant={mode === 'login' ? 'contained' : 'outlined'}
            onClick={() => setMode('login')}
          >
            Giriş Yap
          </Button>
          <Button 
            variant={mode === 'register' ? 'contained' : 'outlined'}
            onClick={() => setMode('register')}
          >
            Kayıt Ol
          </Button>
        </ButtonGroup>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {mode === 'register' && (
              <TextField
                label="Ad Soyad"
                variant="outlined"
                fullWidth
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                }}
              />
            )}

            <TextField
              label="E-posta"
              type="email"
              variant="outlined"
              fullWidth
              value={form.email}
              onChange={e => update('email', e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
              }}
            />

            <TextField
              label="Şifre"
              type="password"
              variant="outlined"
              fullWidth
              value={form.password}
              onChange={e => update('password', e.target.value)}
              required
              inputProps={{ minLength: 6 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 3, py: 1.5, mt: 1, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur')}
            </Button>
          </Stack>
        </form>

        <Box display="flex" alignItems="center" gap={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.disabled">ya da</Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <Stack spacing={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            size="large"
            onClick={handleGoogle}
            disabled={loading}
            sx={{ borderRadius: 3, py: 1.5 }}
            startIcon={
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
            }
          >
            Google ile Devam Et
          </Button>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => {
              loginAsDemo()
              showToast('Demo Modu Aktif! 🎉 Tüm özellikleri test edebilirsiniz.', 'success')
            }}
            startIcon={<RocketLaunchIcon />}
            sx={{
              borderRadius: 3,
              py: 1.5,
              borderStyle: 'dashed',
              borderWidth: 1.5,
              borderColor: 'success.main',
              color: 'success.main',
              bgcolor: 'success.50',
              fontWeight: 'bold',
              '&:hover': {
                borderStyle: 'dashed',
                borderWidth: 1.5,
                bgcolor: 'success.100'
              }
            }}
          >
            Demo Modu ile Hemen Giriş Yap
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
          Devam ederek <Typography component="span" variant="caption" color="primary.main" sx={{ cursor: 'pointer' }}>Gizlilik Politikası</Typography>'nı kabul etmiş olursunuz
        </Typography>
      </Paper>
    </Box>
  )
}
