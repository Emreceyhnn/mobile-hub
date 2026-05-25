import { useState, useRef } from 'react'
import { useGemini } from '../../hooks/useGemini'
import { useToast } from '../ui/Toast'
import { 
  Box, Typography, Button, TextField, ButtonGroup, CircularProgress, Grid, Paper, Stack 
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import EditIcon from '@mui/icons-material/Edit'
import UploadFileIcon from '@mui/icons-material/UploadFile'

export default function AddFoodModal({ onClose, onAdd }) {
  const { loading, result, analyze, analyzeImage, reset } = useGemini()
  const showToast = useToast()
  
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'image' | 'manual'
  const [query, setQuery] = useState('')
  const [manualForm, setManualForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    servingSize: '1 porsiyon'
  })
  
  const fileInputRef = useRef()
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleAiSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    const res = await analyze(query)
    if (res) {
      showToast('Yemek başarıyla analiz edildi! ✨', 'success')
      setManualForm({
        name: res.name || query,
        calories: res.calories || 0,
        protein: res.protein || 0,
        carbs: res.carbs || 0,
        fat: res.fat || 0,
        fiber: res.fiber || 0,
        servingSize: res.servingSize || '1 porsiyon'
      })
    } else {
      showToast('Analiz başarısız oldu, lütfen manuel girin.', 'error')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageAnalyze = async () => {
    if (!imagePreview) return
    
    const base64Data = imagePreview.split(',')[1]
    const mimeType = selectedImage.type
    
    const res = await analyzeImage(base64Data, mimeType)
    if (res) {
      showToast('Fotoğraf başarıyla analiz edildi! 📸✨', 'success')
      setManualForm({
        name: res.name || 'Fotoğraftan analiz edilen yemek',
        calories: res.calories || 0,
        protein: res.protein || 0,
        carbs: res.carbs || 0,
        fat: res.fat || 0,
        fiber: res.fiber || 0,
        servingSize: res.servingSize || '1 porsiyon'
      })
    } else {
      showToast('Fotoğraf analizi başarısız oldu.', 'error')
    }
  }

  const handleSave = () => {
    if (!manualForm.name.trim()) {
      showToast('Yemek adı girmelisiniz!', 'error')
      return
    }
    
    onAdd({
      name: manualForm.name,
      calories: parseFloat(manualForm.calories) || 0,
      protein: parseFloat(manualForm.protein) || 0,
      carbs: parseFloat(manualForm.carbs) || 0,
      fat: parseFloat(manualForm.fat) || 0,
      fiber: parseFloat(manualForm.fiber) || 0,
      servingSize: manualForm.servingSize
    })
    
    showToast('Besin günlüğüne eklendi!', 'success')
    onClose()
  }

  function setFormKey(key, value) {
    setManualForm(p => ({ ...p, [key]: value }))
  }

  return (
    <Stack spacing={3}>
      {/* Tab Selector */}
      <ButtonGroup fullWidth variant="outlined" sx={{ '& .MuiButton-root': { borderRadius: 2 } }}>
        <Button 
          variant={activeTab === 'ai' ? 'contained' : 'outlined'}
          onClick={() => { setActiveTab('ai'); reset(); }}
          startIcon={<SmartToyIcon />}
        >
          Yapay Zeka
        </Button>
        <Button 
          variant={activeTab === 'image' ? 'contained' : 'outlined'}
          onClick={() => { setActiveTab('image'); reset(); }}
          startIcon={<PhotoCameraIcon />}
        >
          Fotoğraf
        </Button>
        <Button 
          variant={activeTab === 'manual' ? 'contained' : 'outlined'}
          onClick={() => { setActiveTab('manual'); reset(); }}
          startIcon={<EditIcon />}
        >
          Manuel
        </Button>
      </ButtonGroup>

      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Yemeğin analiz ediliyor...</Typography>
        </Box>
      )}

      {!loading && (
        <>
          {activeTab === 'ai' && !result && (
            <form onSubmit={handleAiSearch}>
              <Stack spacing={2}>
                <TextField
                  label="Ne yedin ya da ne içtin?"
                  multiline
                  rows={4}
                  placeholder="Örn: 1 tabak kuru fasulye, 1 kase yoğurt ve 1 kase pirinç pilavı yedim"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  fullWidth
                  variant="outlined"
                  required
                />
                <Button type="submit" variant="contained" color="primary" size="large" sx={{ borderRadius: 2 }}>
                  Besin Değerlerini Hesapla ⚡
                </Button>
              </Stack>
            </form>
          )}

          {activeTab === 'image' && !result && (
            <Stack spacing={2}>
              <Paper
                variant="outlined"
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'background.default',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <Box 
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{ maxHeight: 180, borderRadius: 2, objectFit: 'cover', width: '100%' }}
                  />
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Yemeğin fotoğrafını yükle</Typography>
                    <Typography variant="caption" color="text.secondary">Kameradan çek veya galeriden seç</Typography>
                  </Box>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </Paper>

              {imagePreview && (
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    fullWidth 
                    onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                    sx={{ borderRadius: 2 }}
                  >
                    Temizle
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={handleImageAnalyze}
                    sx={{ borderRadius: 2 }}
                  >
                    Gemini ile Analiz Et ⚡
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          {/* AI Result Review or Manual Form */}
          {(result || activeTab === 'manual') && (
            <Stack spacing={2} sx={{ animation: 'fadeIn 0.3s ease-in' }}>
              {result && (
                <Box 
                  bgcolor="primary.light" 
                  color="primary.dark" 
                  px={2} 
                  py={1} 
                  borderRadius={2} 
                  display="inline-block" 
                  alignSelf="flex-start"
                  fontSize="0.875rem"
                  fontWeight="bold"
                >
                  🤖 Gemini API Analiz Sonucu
                </Box>
              )}

              <TextField
                label="Yiyecek Adı"
                variant="outlined"
                fullWidth
                value={manualForm.name}
                onChange={e => setFormKey('name', e.target.value)}
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Porsiyon"
                    variant="outlined"
                    fullWidth
                    value={manualForm.servingSize}
                    onChange={e => setFormKey('servingSize', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Kalori (kcal)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={manualForm.calories}
                    onChange={e => setFormKey('calories', e.target.value)}
                    required
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1.5}>
                <Grid item xs={3}>
                  <TextField
                    label="Protein(g)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={manualForm.protein}
                    onChange={e => setFormKey('protein', e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Karbo(g)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={manualForm.carbs}
                    onChange={e => setFormKey('carbs', e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Yağ(g)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={manualForm.fat}
                    onChange={e => setFormKey('fat', e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Lif(g)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={manualForm.fiber}
                    onChange={e => setFormKey('fiber', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} mt={2}>
                {result && (
                  <Button variant="outlined" color="inherit" fullWidth onClick={reset} sx={{ borderRadius: 2 }}>
                    Yeniden Dene
                  </Button>
                )}
                <Button variant="contained" color="primary" fullWidth onClick={handleSave} sx={{ borderRadius: 2 }}>
                  Besin Ekle 🎉
                </Button>
              </Stack>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
