const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function analyzeFood(foodName) {
  const prompt = `
Sen bir beslenme uzmanısın. Kullanıcı "${foodName}" yedi/içti.
Bu besinin TÜRKİYE'deki standart porsiyon miktarına göre besin değerlerini hesapla.
SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{
  "name": "Yemeğin düzgün Türkçe adı",
  "calories": 250,
  "protein": 12.5,
  "carbs": 30.0,
  "fat": 8.0,
  "fiber": 3.0,
  "servingSize": "1 porsiyon (200g)",
  "confidence": "high"
}

Eğer yemek tanınamazsa confidence alanını "low" yap ve tahmini değerler ver.
Tüm sayısal değerler float olmalı.
`

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    })
  })

  if (!response.ok) {
    const err = await response.json()
    console.error("Gemini API Error (Text):", err)
    throw new Error(err.error?.message || 'Gemini API hatası')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  try {
    return JSON.parse(text)
  } catch (e) {
    console.error("JSON Parse Error:", text)
    throw new Error("Yapay zeka geçersiz bir yanıt döndürdü.", { cause: e })
  }
}

export async function analyzeFoodImage(base64Image, mimeType = 'image/jpeg') {
  const prompt = `
Bu fotoğraftaki yiyecek/içeceği analiz et.
Türkiye'deki standart porsiyon miktarına göre besin değerlerini hesapla.
SADECE aşağıdaki JSON formatında yanıt ver:

{
  "name": "Yemeğin Türkçe adı",
  "calories": 250,
  "protein": 12.5,
  "carbs": 30.0,
  "fat": 8.0,
  "fiber": 3.0,
  "servingSize": "1 porsiyon (tahmini)",
  "confidence": "medium"
}
`

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Image } }
        ]
      }],
      generationConfig: { 
        temperature: 0.1, 
        responseMimeType: "application/json"
      }
    })
  })

  if (!response.ok) {
    const err = await response.json()
    console.error("Gemini API Error (Image):", err)
    throw new Error(err.error?.message || 'Gemini fotoğraf analiz hatası')
  }
  
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error("JSON Parse Error:", text)
    throw new Error("Yapay zeka geçersiz bir yanıt döndürdü.", { cause: e })
  }
}
