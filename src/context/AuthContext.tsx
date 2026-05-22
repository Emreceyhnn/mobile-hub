import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import { saveProfile, getProfile } from '../services/firestore'
import { UserProfile } from '../types'

interface AuthContextType {
  user: User | { uid: string; displayName: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  loginAsDemo: () => void;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | { uid: string; displayName: string; email: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
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
          setProfile({
            name: u.displayName || 'Kullanıcı',
            email: u.email || '',
            dailyGoal: 2000,
            dailyWaterGoal: 2500,
            age: 25,
            weight: 70,
            height: 170,
            gender: 'male',
            activityLevel: 'moderate',
            reminders: {
              enabled: false,
              intervalHours: 3,
              startHour: 8,
              endHour: 22,
              remindWater: true,
              remindFood: true,
            }
          })
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithEmail = (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password)

  const registerWithEmail = async (email: string, password: string, name: string): Promise<UserCredential> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const defaultProfile: UserProfile = {
      name,
      email,
      dailyGoal: 2000,
      dailyWaterGoal: 2500,
      age: 25,
      weight: 70,
      height: 170,
      gender: 'male',
      activityLevel: 'moderate',
      reminders: {
        enabled: false,
        intervalHours: 3,
        startHour: 8,
        endHour: 22,
        remindWater: true,
        remindFood: true,
      }
    }
    try {
      await saveProfile(cred.user.uid, defaultProfile)
    } catch (err) {
      console.error("Firestore saveProfile failed:", err)
    }
    setProfile(defaultProfile)
    return cred
  }

  const loginWithGoogle = async (): Promise<UserCredential> => {
    const cred = await signInWithPopup(auth, googleProvider)
    let existing: UserProfile | null = null
    try {
      existing = await getProfile(cred.user.uid)
    } catch (err) {
      console.error("Firestore getProfile failed on Google Login:", err)
    }
    if (!existing) {
      const defaultProfile: UserProfile = {
        name: cred.user.displayName || 'Kullanıcı',
        email: cred.user.email || '',
        dailyGoal: 2000,
        dailyWaterGoal: 2500,
        age: 25,
        weight: 70,
        height: 170,
        gender: 'male',
        activityLevel: 'moderate',
        reminders: {
          enabled: false,
          intervalHours: 3,
          startHour: 8,
          endHour: 22,
          remindWater: true,
          remindFood: true,
        }
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
    const demoProfile: UserProfile = {
      name: 'Demo Kullanıcı',
      email: 'demo@nutritrack.com',
      dailyGoal: 2000,
      dailyWaterGoal: 2500,
      age: 25,
      weight: 70,
      height: 170,
      gender: 'male',
      activityLevel: 'moderate',
      reminders: {
        enabled: false,
        intervalHours: 3,
        startHour: 8,
        endHour: 22,
        remindWater: true,
        remindFood: true,
      }
    }
    setUser(demoUser)
    setProfile(demoProfile)
    setLoading(false)
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    if (user.uid !== 'demo_user_123') {
      try {
        await saveProfile(user.uid, data)
      } catch (err) {
        console.error("Firestore saveProfile failed:", err)
      }
    }
    setProfile(prev => prev ? ({ ...prev, ...data }) : null)
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

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
