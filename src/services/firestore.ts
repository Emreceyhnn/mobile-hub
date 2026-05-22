import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { DayLog, FoodEntry, UserProfile } from '../types'

// ── Profile ──────────────────────────────────────────────
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function saveProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

// ── Daily Logs (Food & Water) ─────────────────────────────────────────────
export function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export async function getDayLog(uid: string, dateKey: string): Promise<DayLog> {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return {
      meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
      water: 0
    }
  }
  const data = snap.data()
  return {
    meals: data.meals || { breakfast: [], lunch: [], dinner: [], snack: [] },
    water: data.water || 0
  }
}

export async function addFoodEntry(
  uid: string,
  dateKey: string,
  meal: keyof DayLog['meals'],
  entry: Omit<FoodEntry, 'id' | 'time'>
): Promise<FoodEntry> {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  const snap = await getDoc(ref)
  const data = snap.exists() ? snap.data() : {}
  const meals = data.meals || {}
  const mealList = meals[meal] || []
  
  const newEntry: FoodEntry = {
    ...entry,
    id: Date.now().toString(),
    time: new Date().toISOString()
  }
  mealList.push(newEntry)
  
  await setDoc(ref, {
    meals: { ...meals, [meal]: mealList },
    updatedAt: serverTimestamp()
  }, { merge: true })
  
  return newEntry
}

export async function deleteFoodEntry(
  uid: string,
  dateKey: string,
  meal: keyof DayLog['meals'],
  entryId: string
): Promise<void> {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data()
  const meals = data.meals || {}
  const mealList = (meals[meal] || []).filter((e: FoodEntry) => e.id !== entryId)
  
  await setDoc(ref, {
    meals: { ...meals, [meal]: mealList },
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function updateWaterIntake(uid: string, dateKey: string, amount: number): Promise<void> {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  await setDoc(ref, {
    water: amount,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function getWeeklyLogs(uid: string): Promise<Record<string, DayLog>> {
  const logs: Record<string, DayLog> = {}
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getDateKey(d)
    const data = await getDayLog(uid, key)
    logs[key] = data
  }
  return logs
}
