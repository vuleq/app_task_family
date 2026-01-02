import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from './config'

const checkAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your .env.local file.')
  }
  return auth
}

export const loginWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(checkAuth(), email, password)
}

export const signupWithEmail = async (email: string, password: string, isRoot: boolean = false) => {
  const userCredential = await createUserWithEmailAndPassword(checkAuth(), email, password)
  // Store isRoot flag in localStorage temporarily (will be used when creating profile)
  if (isRoot && userCredential.user && typeof window !== 'undefined') {
    localStorage.setItem(`signup_isRoot_${userCredential.user.uid}`, 'true')
  }
  return userCredential
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  return await signInWithPopup(checkAuth(), provider)
}

export const logout = async () => {
  return await signOut(checkAuth())
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Wrapper for onAuthStateChanged that handles undefined auth
export const onAuthStateChangedSafe = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('Firebase Auth is not initialized')
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export { auth }

