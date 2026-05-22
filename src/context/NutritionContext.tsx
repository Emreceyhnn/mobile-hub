import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getDayLog, addFoodEntry, deleteFoodEntry, updateWaterIntake, getTodayKey } from '../services/firestore'
import { sumMacros } from '../utils/nutrition'
import { DayLog, FoodEntry, Meals } from '../types'

interface NutritionState {
  meals: Meals;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  water: number;
  selectedDate: string;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_DAY_LOG'; payload: DayLog }
  | { type: 'SET_WATER'; payload: number }
  | { type: 'SET_MEALS'; payload: Meals }
  | { type: 'SET_DATE'; payload: string };

interface NutritionContextType extends NutritionState {
  addFood: (meal: keyof Meals, entry: Omit<FoodEntry, 'id' | 'time'>) => Promise<FoodEntry | undefined>;
  removeFood: (meal: keyof Meals, entryId: string) => Promise<void>;
  updateWater: (amount: number) => Promise<void>;
  changeDate: (dateKey: string) => void;
  refresh: () => void;
}

const NutritionContext = createContext<NutritionContextType | null>(null)

const initialState: NutritionState = {
  meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  water: 0,
  selectedDate: getTodayKey(),
  loading: false,
  error: null,
}

function reducer(state: NutritionState, action: Action): NutritionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_DAY_LOG': {
      const { meals, water } = action.payload
      return {
        ...state,
        meals,
        water,
        totals: sumMacros(meals),
        loading: false
      }
    }
    case 'SET_MEALS': {
      const meals = action.payload
      return { ...state, meals, totals: sumMacros(meals), loading: false }
    }
    case 'SET_WATER':
      return { ...state, water: action.payload }
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload }
    default:
      return state
  }
}

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadLog = useCallback(async (dateKey: string) => {
    if (!user) return
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const dayLog = await getDayLog(user.uid, dateKey)
      dispatch({ type: 'SET_DAY_LOG', payload: dayLog })
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Veriler yuklenirken bilinmeyen bir hata olustu.'
      dispatch({ type: 'SET_ERROR', payload: errMsg })
    }
  }, [user])

  useEffect(() => {
    loadLog(state.selectedDate)
  }, [user, state.selectedDate, loadLog])

  const addFood = async (meal: keyof Meals, entry: Omit<FoodEntry, 'id' | 'time'>) => {
    if (!user) return
    dispatch({ type: 'SET_LOADING', payload: true })
    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now().toString(),
      time: new Date().toISOString()
    }
    try {
      await addFoodEntry(user.uid, state.selectedDate, meal, entry)
    } catch (err: unknown) {
      console.error("Firestore addFoodEntry failed, saved locally:", err)
    }
    const updatedMeals = {
      ...state.meals,
      [meal]: [...(state.meals[meal] || []), newEntry]
    }
    dispatch({ type: 'SET_MEALS', payload: updatedMeals })
    return newEntry
  }

  const removeFood = async (meal: keyof Meals, entryId: string) => {
    if (!user) return
    try {
      await deleteFoodEntry(user.uid, state.selectedDate, meal, entryId)
    } catch (err: unknown) {
      console.error("Firestore deleteFoodEntry failed, removed locally:", err)
    }
    const updatedMeals = {
      ...state.meals,
      [meal]: state.meals[meal].filter(e => e.id !== entryId)
    }
    dispatch({ type: 'SET_MEALS', payload: updatedMeals })
  }

  const updateWater = async (amount: number) => {
    if (!user) return
    const targetAmount = Math.max(0, amount)
    dispatch({ type: 'SET_WATER', payload: targetAmount })
    
    if (user.uid !== 'demo_user_123') {
      try {
        await updateWaterIntake(user.uid, state.selectedDate, targetAmount)
      } catch (err: unknown) {
        console.error("Firestore updateWaterIntake failed:", err)
      }
    }
  }

  const changeDate = (dateKey: string) => {
    dispatch({ type: 'SET_DATE', payload: dateKey })
  }

  const refresh = () => {
    loadLog(state.selectedDate)
  }

  return (
    <NutritionContext.Provider value={{
      ...state,
      addFood,
      removeFood,
      updateWater,
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
