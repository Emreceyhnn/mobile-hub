// Calorie & macro calculations
export function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age))
  }
  return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age))
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.2))
}

export function sumMacros(meals) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  Object.values(meals).forEach(list => {
    list.forEach(item => {
      totals.calories += item.calories || 0
      totals.protein += item.protein || 0
      totals.carbs += item.carbs || 0
      totals.fat += item.fat || 0
      totals.fiber += item.fiber || 0
    })
  })
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    fiber: Math.round(totals.fiber * 10) / 10,
  }
}

export function getCaloriePercent(consumed, goal) {
  if (!goal) return 0
  return Math.min(100, Math.round((consumed / goal) * 100))
}

export function format(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-')
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const MEAL_LABELS = {
  breakfast: { label: 'Kahvaltı', emoji: '🌅', color: '#F59E0B' },
  lunch: { label: 'Öğle Yemeği', emoji: '☀️', color: '#10B981' },
  dinner: { label: 'Akşam Yemeği', emoji: '🌙', color: '#8B5CF6' },
  snack: { label: 'Atıştırmalık', emoji: '🍎', color: '#EF4444' },
}

export const ACTIVITY_LABELS = {
  sedentary: 'Hareketsiz (Masa başı)',
  light: 'Az Hareketli (1-3 gün/hafta)',
  moderate: 'Orta Hareketli (3-5 gün/hafta)',
  active: 'Aktif (6-7 gün/hafta)',
  veryActive: 'Çok Aktif (Sporcu)',
}
