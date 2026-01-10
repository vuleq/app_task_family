import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteField,
  deleteDoc,
  query,
  where,
  writeBatch,
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
  characterBase?: 'nam1' | 'nam2' | 'nu1' | 'nu2' // Avatar cơ bản ban đầu: nam1, nam2, nu1, nu2
  characterAvatar?: number // Số avatar được chọn (1-7) - DEPRECATED, dùng characterBase thay thế
  gender?: 'nam' | 'nu' // Giới tính: nam hoặc nu (tự động từ characterBase)
  profession?: 'bs' | 'ch' | 'cs' | string // Nghề nghiệp: bs (bác sĩ), ch (cứu hỏa), cs (cảnh sát), etc.
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

/**
 * Reset XP về 0 và xóa profession để user có thể chọn lại nghề khi lên lại level 5
 */
export const resetXPAndProfession = async (userId: string): Promise<void> => {
  const profileRef = doc(checkDb(), 'users', userId)
  await updateDoc(profileRef, {
    xp: 0,
    profession: deleteField(), // Xóa profession khỏi database
    updatedAt: serverTimestamp(),
  })
}

/**
 * Root user reset XP và coin của user khác
 */
export const resetUserXPAndCoins = async (targetUserId: string, resetterUserId: string): Promise<void> => {
  // Kiểm tra quyền root
  const resetterProfile = await getProfile(resetterUserId)
  if (!resetterProfile || !resetterProfile.isRoot) {
    throw new Error('Chỉ root user mới có quyền reset XP và coin của user khác')
  }
  
  const profileRef = doc(checkDb(), 'users', targetUserId)
  await updateDoc(profileRef, {
    xp: 0,
    coins: 0,
    profession: deleteField(), // Xóa profession khi reset
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

/**
 * Root user xóa user khác và tất cả dữ liệu liên quan
 * Xóa: profile, tasks, task templates, avatar/image từ Storage
 */
export const deleteUser = async (targetUserId: string, deleterUserId: string): Promise<void> => {
  // Kiểm tra quyền root
  const deleterProfile = await getProfile(deleterUserId)
  if (!deleterProfile || !deleterProfile.isRoot) {
    throw new Error('Chỉ root user mới có quyền xóa user')
  }
  
  // Không cho phép xóa chính mình
  if (targetUserId === deleterUserId) {
    throw new Error('Không thể xóa chính mình')
  }
  
  // Kiểm tra user có tồn tại không
  const targetProfile = await getProfile(targetUserId)
  if (!targetProfile) {
    throw new Error('User không tồn tại')
  }
  
  // Không cho phép xóa root user khác
  if (targetProfile.isRoot) {
    throw new Error('Không thể xóa root user khác')
  }
  
  // Helper function để xóa nhiều documents bằng batch (tối đa 500 per batch)
  const deleteDocumentsInBatches = async (docs: any[]) => {
    if (docs.length === 0) return
    
    const BATCH_SIZE = 500 // Firestore limit
    const batches: Promise<void>[] = []
    
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(checkDb())
      const batchDocs = docs.slice(i, i + BATCH_SIZE)
      
      batchDocs.forEach(docSnap => {
        batch.delete(docSnap.ref)
      })
      
      batches.push(batch.commit())
    }
    
    await Promise.all(batches)
  }
  
  // Chạy song song tất cả các operations không phụ thuộc nhau
  const [
    assignedTasksSnapshot,
    createdTasksSnapshot,
    templatesSnapshot
  ] = await Promise.all([
    // 1. Lấy tất cả tasks được assign cho user
    getDocs(query(
      collection(checkDb(), 'tasks'),
      where('assignedTo', '==', targetUserId)
    )),
    // 2. Lấy tất cả tasks được tạo bởi user
    getDocs(query(
      collection(checkDb(), 'tasks'),
      where('createdBy', '==', targetUserId)
    )),
    // 3. Lấy tất cả task templates của user
    getDocs(query(
      collection(checkDb(), 'taskTemplates'),
      where('createdBy', '==', targetUserId)
    ))
  ])
  
  // Tổng hợp tất cả tasks cần xóa (loại bỏ duplicate nếu có)
  const allTaskDocs = [
    ...assignedTasksSnapshot.docs,
    ...createdTasksSnapshot.docs.filter(
      doc => !assignedTasksSnapshot.docs.some(d => d.id === doc.id)
    )
  ]
  
  // Xóa user khỏi Firebase Authentication (gọi API)
  try {
    const response = await fetch('/api/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserId,
        deleterUserId,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error deleting user from Auth:', errorData.error || 'Unknown error')
      // Tiếp tục xóa dữ liệu trong Firestore dù có lỗi với Auth
    }
  } catch (error) {
    console.error('Error calling delete-user API:', error)
    // Tiếp tục xóa dữ liệu trong Firestore dù có lỗi với API
  }
  
  // Xóa tất cả documents song song
  await Promise.all([
    // Xóa tasks
    deleteDocumentsInBatches(allTaskDocs),
    // Xóa templates
    deleteDocumentsInBatches(templatesSnapshot.docs),
    // Xóa avatar/image từ Storage (chạy song song, không block)
    (async () => {
      try {
        if (targetProfile.avatar && storage) {
          try {
            const avatarRef = ref(checkStorage(), targetProfile.avatar)
            await deleteObject(avatarRef)
          } catch (error) {
            console.error('Error deleting avatar:', error)
          }
        }
        if (targetProfile.image && storage) {
          try {
            const imageRef = ref(checkStorage(), targetProfile.image)
            await deleteObject(imageRef)
          } catch (error) {
            console.error('Error deleting image:', error)
          }
        }
      } catch (error) {
        console.error('Error deleting user images:', error)
      }
    })()
  ])
  
  // Cuối cùng xóa user profile
  const profileRef = doc(checkDb(), 'users', targetUserId)
  await deleteDoc(profileRef)
}

