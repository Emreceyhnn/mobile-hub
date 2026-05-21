import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, query, where,
  orderBy, getDocs, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { format } from '../utils/nutrition'

// ── Profile ──────────────────────────────────────────────
export async function getProfile(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function saveProfile(uid, data) {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

// ── Food Log ─────────────────────────────────────────────
export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export async function getFoodLog(uid, dateKey) {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return { breakfast: [], lunch: [], dinner: [], snack: [] }
  }
  return snap.data().meals || { breakfast: [], lunch: [], dinner: [], snack: [] }
}

export async function addFoodEntry(uid, dateKey, meal, entry) {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  const snap = await getDoc(ref)
  const current = snap.exists() ? snap.data().meals || {} : {}
  const mealList = current[meal] || []
  const newEntry = { ...entry, id: Date.now().toString(), time: new Date().toISOString() }
  mealList.push(newEntry)
  await setDoc(ref, {
    meals: { ...current, [meal]: mealList },
    updatedAt: serverTimestamp()
  }, { merge: true })
  return newEntry
}

export async function deleteFoodEntry(uid, dateKey, meal, entryId) {
  const ref = doc(db, 'foodLogs', uid, 'logs', dateKey)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const current = snap.data().meals || {}
  const mealList = (current[meal] || []).filter(e => e.id !== entryId)
  await setDoc(ref, {
    meals: { ...current, [meal]: mealList },
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function getWeeklyLogs(uid) {
  const logs = {}
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getDateKey(d)
    const data = await getFoodLog(uid, key)
    logs[key] = data
  }
  return logs
}
