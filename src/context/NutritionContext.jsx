import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getFoodLog, addFoodEntry, deleteFoodEntry, getTodayKey, getDateKey } from '../services/firestore'
import { sumMacros } from '../utils/nutrition'

const NutritionContext = createContext(null)

const initialState = {
  meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  selectedDate: getTodayKey(),
  loading: false,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_MEALS': {
      const meals = action.payload
      return { ...state, meals, totals: sumMacros(meals), loading: false }
    }
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload }
    default:
      return state
  }
}

export function NutritionProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadLog = useCallback(async (dateKey) => {
    if (!user) return
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const meals = await getFoodLog(user.uid, dateKey)
      dispatch({ type: 'SET_MEALS', payload: meals })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message })
    }
  }, [user])

  useEffect(() => {
    loadLog(state.selectedDate)
  }, [user, state.selectedDate, loadLog])

  const addFood = async (meal, entry) => {
    if (!user) return
    dispatch({ type: 'SET_LOADING', payload: true })
    const newEntry = { ...entry, id: Date.now().toString(), time: new Date().toISOString() }
    try {
      await addFoodEntry(user.uid, state.selectedDate, meal, entry)
    } catch (err) {
      console.error("Firestore addFoodEntry failed, saved locally:", err)
    }
    const updatedMeals = {
      ...state.meals,
      [meal]: [...(state.meals[meal] || []), newEntry]
    }
    dispatch({ type: 'SET_MEALS', payload: updatedMeals })
    return newEntry
  }

  const removeFood = async (meal, entryId) => {
    if (!user) return
    try {
      await deleteFoodEntry(user.uid, state.selectedDate, meal, entryId)
    } catch (err) {
      console.error("Firestore deleteFoodEntry failed, removed locally:", err)
    }
    const updatedMeals = {
      ...state.meals,
      [meal]: state.meals[meal].filter(e => e.id !== entryId)
    }
    dispatch({ type: 'SET_MEALS', payload: updatedMeals })
  }

  const changeDate = (dateKey) => {
    dispatch({ type: 'SET_DATE', payload: dateKey })
  }

  const refresh = () => loadLog(state.selectedDate)

  return (
    <NutritionContext.Provider value={{
      ...state,
      addFood,
      removeFood,
      changeDate,
      refresh,
    }}>
      {children}
    </NutritionContext.Provider>
  )
}

export function useNutrition() {
  const ctx = useContext(NutritionContext)
  if (!ctx) throw new Error('useNutrition must be inside NutritionProvider')
  return ctx
}
