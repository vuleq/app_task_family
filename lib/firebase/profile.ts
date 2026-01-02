import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './config'
import { User } from 'firebase/auth'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  image?: string
  characterAvatar?: number // Số avatar được chọn (1-7), mặc định random dựa trên user ID
  xp: number
  coins: number
  role: 'parent' | 'child'
  isRoot?: boolean // Chỉ account root mới có thể tạo nhiệm vụ
  createdAt: any
  updatedAt: any
}

const DEFAULT_AVATAR = '/icons/icon-192x192.png'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

const checkStorage = () => {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please check your .env.local file.')
  }
  return storage
}

export const createDefaultProfile = async (user: User, isRoot: boolean = false): Promise<UserProfile> => {
  const profileRef = doc(checkDb(), 'users', user.uid)
  const profileSnap = await getDoc(profileRef)

  if (profileSnap.exists()) {
    return profileSnap.data() as UserProfile
  }

  // Chọn avatar ngẫu nhiên dựa trên user ID (để mỗi user có avatar cố định)
  const avatarNumber = (user.uid.charCodeAt(0) % 7) + 1 // 1-7
  
  const defaultProfile: Omit<UserProfile, 'id'> = {
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.photoURL || DEFAULT_AVATAR,
    image: user.photoURL || DEFAULT_AVATAR,
    characterAvatar: avatarNumber, // Avatar cho nhân vật (1-7)
    xp: 0,
    coins: 0,
    role: 'child', // Default role, can be updated later
    isRoot: isRoot, // Có thể set khi tạo profile
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(profileRef, defaultProfile)

  return {
    id: user.uid,
    ...defaultProfile,
  }
}

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const profileRef = doc(checkDb(), 'users', userId)
  const profileSnap = await getDoc(profileRef)

  if (!profileSnap.exists()) {
    return null
  }

  return {
    id: profileSnap.id,
    ...profileSnap.data(),
  } as UserProfile
}

// Lấy danh sách tất cả users (để assign task)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(checkDb(), 'users')
  const snapshot = await getDocs(usersRef)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as UserProfile[]
}

export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const profileRef = doc(checkDb(), 'users', userId)
  await updateDoc(profileRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export const uploadProfileImage = async (
  userId: string,
  file: File,
  type: 'avatar' | 'image' = 'avatar'
): Promise<string> => {
  // Kiểm tra Storage đã được bật chưa
  if (!storage) {
    throw new Error(
      'Firebase Storage chưa được bật. Vui lòng bật Storage trong Firebase Console hoặc sử dụng giải pháp thay thế (xem IMAGE_UPLOAD_ALTERNATIVES.md)'
    )
  }

  const storageRef = ref(checkStorage(), `users/${userId}/profile/${type}-${Date.now()}`)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  
  // Update profile with new image URL
  await updateProfile(userId, { [type]: downloadURL })
  
  return downloadURL
}

export const deleteProfileImage = async (
  userId: string,
  imageUrl: string
): Promise<void> => {
  try {
    const imageRef = ref(checkStorage(), imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

