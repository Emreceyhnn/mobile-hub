import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import { saveProfile, getProfile } from '../services/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const p = await getProfile(u.uid)
          setProfile(p)
        } catch (err) {
          console.error("Firestore getProfile failed, fallback to local default:", err)
          // Fallback default profile so application still functions without Firestore
          setProfile({
            name: u.displayName || 'Kullanıcı',
            email: u.email,
            dailyGoal: 2000,
            dailyWaterGoal: 2500,
            age: 25,
            weight: 70,
            height: 170,
            gender: 'male',
            activityLevel: 'moderate'
          })
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const registerWithEmail = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const defaultProfile = {
      name,
      email,
      dailyGoal: 2000,
      dailyWaterGoal: 2500,
      age: 25,
      weight: 70,
      height: 170,
      gender: 'male',
      activityLevel: 'moderate',
    }
    try {
      await saveProfile(cred.user.uid, defaultProfile)
    } catch (err) {
      console.error("Firestore saveProfile failed:", err)
    }
    setProfile(defaultProfile)
    return cred
  }

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider)
    let existing = null
    try {
      existing = await getProfile(cred.user.uid)
    } catch (err) {
      console.error("Firestore getProfile failed on Google Login:", err)
    }
    if (!existing) {
      const defaultProfile = {
        name: cred.user.displayName || 'Kullanıcı',
        email: cred.user.email,
        dailyGoal: 2000,
        dailyWaterGoal: 2500,
        age: 25,
        weight: 70,
        height: 170,
        gender: 'male',
        activityLevel: 'moderate',
      }
      try {
        await saveProfile(cred.user.uid, defaultProfile)
      } catch (err) {
        console.error("Firestore saveProfile failed on Google Login:", err)
      }
      setProfile(defaultProfile)
    } else {
      setProfile(existing)
    }
    return cred
  }

  const logout = () => {
    if (user?.uid === 'demo_user_123') {
      setUser(null)
      setProfile(null)
      return
    }
    signOut(auth)
  }

  const loginAsDemo = () => {
    const demoUser = {
      uid: 'demo_user_123',
      displayName: 'Demo Kullanıcı',
      email: 'demo@nutritrack.com'
    }
    const demoProfile = {
      name: 'Demo Kullanıcı',
      email: 'demo@nutritrack.com',
      dailyGoal: 2000,
      dailyWaterGoal: 2500,
      age: 25,
      weight: 70,
      height: 170,
      gender: 'male',
      activityLevel: 'moderate',
    }
    setUser(demoUser)
    setProfile(demoProfile)
    setLoading(false)
  }

  const updateUserProfile = async (data) => {
    if (!user) return
    if (user.uid !== 'demo_user_123') {
      try {
        await saveProfile(user.uid, data)
      } catch (err) {
        console.error("Firestore saveProfile failed:", err)
      }
    }
    setProfile(prev => ({ ...prev, ...data }))
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemo,
      logout, updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
