import { useState, useRef } from 'react'
import { useGemini } from '../../hooks/useGemini'
import { useToast } from '../ui/Toast'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function AddFoodModal({ mealType, onClose, onAdd }) {
  const { loading, error, result, analyze, analyzeImage, reset } = useGemini()
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tab Selector */}
      <div className="segment">
        <button
          className={`segment-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ai'); reset(); }}
        >
          🤖 Yapay Zeka
        </button>
        <button
          className={`segment-btn ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => { setActiveTab('image'); reset(); }}
        >
          📸 Fotoğraf
        </button>
        <button
          className={`segment-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => { setActiveTab('manual'); reset(); }}
        >
          ✍️ Manuel Giriş
        </button>
      </div>

      {loading && <LoadingSpinner text="Yemeğin analiz ediliyor..." />}

      {!loading && (
        <>
          {activeTab === 'ai' && !result && (
            <form onSubmit={handleAiSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Ne yedin ya da ne içtin?</label>
                <textarea
                  className="input"
                  style={{ minHeight: 100, resize: 'none' }}
                  placeholder="Örn: 1 tabak kuru fasulye, 1 kase yoğurt ve 1 kase pirinç pilavı yedim"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  id="ai-food-input"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" id="ai-analyze-btn">
                Besin Değerlerini Hesapla ⚡
              </button>
            </form>
          )}

          {activeTab === 'image' && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxHeight: 180, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <span style={{ fontSize: 40 }}>📸</span>
                    <div>
                      <p className="text-sm fw-600">Yemeğin fotoğrafını yükle</p>
                      <p className="text-xs text-muted mt-4">Kameradan çek veya galeriden seç</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>

              {imagePreview && (
                <div className="flex gap-12">
                  <button
                    className="btn btn-secondary flex-1"
                    onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                  >
                    Temizle
                  </button>
                  <button className="btn btn-primary flex-1" onClick={handleImageAnalyze}>
                    Gemini ile Analiz Et ⚡
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Result Review or Manual Form */}
          {(result || activeTab === 'manual') && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {result && (
                <div className="gemini-badge" style={{ alignSelf: 'flex-start' }}>
                  🤖 Gemini API Analiz Sonucu
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Yiyecek Adı</label>
                <input
                  type="text"
                  className="input"
                  value={manualForm.name}
                  onChange={e => setFormKey('name', e.target.value)}
                  id="food-name-input"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Porsiyon</label>
                  <input
                    type="text"
                    className="input"
                    value={manualForm.servingSize}
                    onChange={e => setFormKey('servingSize', e.target.value)}
                    id="food-serving-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Kalori (kcal)</label>
                  <input
                    type="number"
                    className="input"
                    value={manualForm.calories}
                    onChange={e => setFormKey('calories', e.target.value)}
                    id="food-calories-input"
                    required
                  />
                </div>
              </div>

              <div className="grid-4">
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: 11 }}>Protein (g)</label>
                  <input
                    type="number"
                    className="input"
                    style={{ padding: 8 }}
                    value={manualForm.protein}
                    onChange={e => setFormKey('protein', e.target.value)}
                    id="food-protein-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: 11 }}>Karbo (g)</label>
                  <input
                    type="number"
                    className="input"
                    style={{ padding: 8 }}
                    value={manualForm.carbs}
                    onChange={e => setFormKey('carbs', e.target.value)}
                    id="food-carbs-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: 11 }}>Yağ (g)</label>
                  <input
                    type="number"
                    className="input"
                    style={{ padding: 8 }}
                    value={manualForm.fat}
                    onChange={e => setFormKey('fat', e.target.value)}
                    id="food-fat-input"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: 11 }}>Lif (g)</label>
                  <input
                    type="number"
                    className="input"
                    style={{ padding: 8 }}
                    value={manualForm.fiber}
                    onChange={e => setFormKey('fiber', e.target.value)}
                    id="food-fiber-input"
                  />
                </div>
              </div>

              <div className="flex gap-12 mt-12">
                {result && (
                  <button className="btn btn-secondary flex-1" onClick={reset}>
                    Yeniden Dene
                  </button>
                )}
                <button className="btn btn-primary flex-1" onClick={handleSave} id="save-food-btn">
                  Besin Ekle 🎉
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  function setFormKey(key, value) {
    setManualForm(p => ({ ...p, [key]: value }))
  }
}
