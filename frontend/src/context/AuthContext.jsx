import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider()

// Create or update user profile in Firestore on first login
async function ensureUserProfile(user) {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      email: user.email,
      photoURL: user.photoURL || null,
      citizenScore: 0,
      badges: [],
      createdAt: serverTimestamp(),
    })
  }
  return snap.data() || {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check for officer session first
    const officerSessionStr = localStorage.getItem('officer_session')
    if (officerSessionStr) {
      try {
        const officerData = JSON.parse(officerSessionStr)
        setUser({ uid: officerData.officer_id, is_custom_officer: true })
        setUserProfile(officerData)
        setLoading(false)
        return // Bypass firebase auth listener if officer is logged in
      } catch (e) {
        console.error("Invalid officer session", e)
        localStorage.removeItem('officer_session')
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const profile = await ensureUserProfile(firebaseUser)
        setUserProfile(profile)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Google Sign-in
  const signInWithGoogle = async () => {
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await ensureUserProfile(result.user)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Email + Password Sign-in
  const signInWithEmail = async (email, password) => {
    setError(null)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Email + Password Sign-up
  const signUpWithEmail = async (email, password, name) => {
    setError(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // Set display name
      await updateProfile(result.user, { displayName: name })
      await ensureUserProfile({ ...result.user, displayName: name })
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Sign-out
  const logout = async () => {
    localStorage.removeItem('officer_session')
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    setError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to consume auth context
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
