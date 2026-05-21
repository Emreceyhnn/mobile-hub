import { useState, useCallback } from 'react'
import { analyzeFood, analyzeFoodImage } from '../services/gemini'

export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const analyze = useCallback(async (foodName) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeFood(foodName)
      setResult(data)
      return data
    } catch (e) {
      setError(e.message || 'Analiz başarısız')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeImage = useCallback(async (base64, mimeType) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeFoodImage(base64, mimeType)
      setResult(data)
      return data
    } catch (e) {
      setError(e.message || 'Fotoğraf analizi başarısız')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return { loading, error, result, analyze, analyzeImage, reset }
}
