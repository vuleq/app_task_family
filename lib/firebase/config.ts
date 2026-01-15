import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Helper function to clean environment variable (remove quotes if present)
const cleanEnv = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  let cleaned = value.trim()
  // Remove quotes if present (for compatibility with quoted format)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1)
  }
  return cleaned.length > 0 ? cleaned : undefined
}

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
}

// Check if Firebase config is valid
const isFirebaseConfigValid = () => {
  const isValid = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  )
  
  // Debug: Log missing config values
  if (!isValid && typeof window !== 'undefined') {
    console.error('❌ Firebase config missing values:')
    if (!firebaseConfig.apiKey) console.error('  - NEXT_PUBLIC_FIREBASE_API_KEY')
    if (!firebaseConfig.authDomain) console.error('  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
    if (!firebaseConfig.projectId) console.error('  - NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    if (!firebaseConfig.storageBucket) console.error('  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')
    if (!firebaseConfig.messagingSenderId) console.error('  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
    if (!firebaseConfig.appId) console.error('  - NEXT_PUBLIC_FIREBASE_APP_ID')
  }
  
  return isValid
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

// Khởi tạo Firebase ngay khi module được load (chỉ ở client-side)
if (typeof window !== 'undefined') {
  // Sử dụng IIFE để đảm bảo khởi tạo ngay lập tức
  (() => {
    if (!isFirebaseConfigValid()) {
      console.error('⚠️ Firebase configuration is missing!')
      console.error('Please create a .env.local file with your Firebase credentials.')
      console.error('See SETUP_LOCAL.md for instructions.')
    } else {
      try {
        if (!getApps().length) {
          app = initializeApp(firebaseConfig)
        } else {
          app = getApps()[0]
        }
        
        auth = getAuth(app)
        db = getFirestore(app)
        storage = getStorage(app)
        
        // Log để debug (chỉ log một lần)
        if (!(window as any).__FIREBASE_INITIALIZED__) {
          console.log('✅ Firebase initialized successfully')
          ;(window as any).__FIREBASE_INITIALIZED__ = true
        }
      } catch (error) {
        console.error('❌ Error initializing Firebase:', error)
      }
    }
  })()
} else {
  // Server-side: chỉ khởi tạo nếu cần (không khởi tạo ở đây để tránh lỗi SSR)
  // Firebase sẽ được khởi tạo khi cần thiết ở client-side
}

// Helper function to ensure db is initialized
const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

export { app, auth, db, storage, checkDb }

