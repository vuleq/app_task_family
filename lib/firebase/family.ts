import { collection, addDoc, doc, getDoc, setDoc, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { checkDb } from './config'
import { serverTimestamp } from 'firebase/firestore'
import { UserProfile } from './profile'

export interface Family {
  id: string
  name: string
  code: string // Mã code để join family (unique)
  rootCode: string // Mã code để trở thành root user của family này (unique)
  createdBy: string // User ID của người tạo (root user)
  createdAt: any
  memberCount?: number
}

/**
 * Tạo mã code ngẫu nhiên (6 ký tự)
 */
const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Tạo family mới
 * @param familyName - Tên gia đình
 * @param createdByUserId - User ID của người tạo
 * @param customFamilyCode - (Optional) Mã gia đình tùy chỉnh (6 ký tự)
 * @param customRootCode - (Optional) Mã root tùy chỉnh (6 ký tự)
 */
export const createFamily = async (
  familyName: string, 
  createdByUserId: string,
  customFamilyCode?: string,
  customRootCode?: string
): Promise<{ familyId: string; familyCode: string; rootCode: string }> => {
  try {
    const db = checkDb()
    if (!db) {
      throw new Error('Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.local và restart server')
    }
    const familiesRef = collection(db, 'families')
  
  // Validate và tạo family code
  let familyCode: string
  if (customFamilyCode && customFamilyCode.trim().length === 6) {
    // Kiểm tra custom code có unique không
    const existingFamily = await getFamilyByCode(customFamilyCode.trim().toUpperCase())
    if (existingFamily) {
      // Kiểm tra xem family này còn root user nào không
      const { getAllUsers } = await import('./profile')
      const familyMembers = await getAllUsers(existingFamily.id)
      const hasRoot = familyMembers.some(u => u.isRoot && !u.isSuperRoot)
      
      if (hasRoot) {
        throw new Error('Mã gia đình đã tồn tại và đã có root user. Vui lòng chọn mã khác hoặc dùng "Join existing family" với root code.')
      }
      // Nếu không còn root user, cho phép tạo lại family với code này
      // Xóa family cũ trước
      const db = checkDb()
      const familyRef = doc(db, 'families', existingFamily.id)
      await deleteDoc(familyRef)
    }
    familyCode = customFamilyCode.trim().toUpperCase()
  } else {
    // Tạo family code unique tự động
    familyCode = generateCode()
    let codeExists = true
    while (codeExists) {
      const existingFamily = await getFamilyByCode(familyCode)
      if (!existingFamily) {
        codeExists = false
      } else {
        familyCode = generateCode()
      }
    }
  }
  
  // Validate và tạo root code
  let rootCode: string
  if (customRootCode && customRootCode.trim().length === 6) {
    // Kiểm tra custom root code có unique không
    const existingFamily = await getFamilyByRootCode(customRootCode.trim().toUpperCase())
    if (existingFamily) {
      throw new Error('Mã Root đã tồn tại. Vui lòng chọn mã khác.')
    }
    rootCode = customRootCode.trim().toUpperCase()
  } else {
    // Tạo root code unique tự động
    rootCode = generateCode()
    let codeExists = true
    while (codeExists) {
      const existingFamily = await getFamilyByRootCode(rootCode)
      if (!existingFamily) {
        codeExists = false
      } else {
        rootCode = generateCode()
      }
    }
  }
  
    // Tạo family
    console.log('[createFamily] Creating family with codes:', {
      familyCode,
      rootCode,
      customFamilyCode,
      customRootCode,
    })
    const familyRef = await addDoc(familiesRef, {
      name: familyName,
      code: familyCode,
      rootCode: rootCode,
      createdBy: createdByUserId,
      createdAt: serverTimestamp(),
      memberCount: 1,
    })
    
    console.log('[createFamily] Family created successfully:', {
      familyId: familyRef.id,
      familyCode,
      rootCode,
    })
    
    return {
      familyId: familyRef.id,
      familyCode: familyCode,
      rootCode: rootCode,
    }
  } catch (error: any) {
    console.error('Error creating family:', error)
    if (error.message && error.message.includes('Firestore is not initialized')) {
      throw new Error('Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.local và restart server')
    }
    throw error
  }
}

/**
 * Lấy family theo code
 */
export const getFamilyByCode = async (code: string): Promise<Family | null> => {
  const db = checkDb()
  const familiesRef = collection(db, 'families')
  const q = query(familiesRef, where('code', '==', code.toUpperCase()))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return null
  }
  
  const familyDoc = snapshot.docs[0]
  return {
    id: familyDoc.id,
    ...familyDoc.data(),
  } as Family
}

/**
 * Lấy family theo root code (để trở thành root user)
 */
export const getFamilyByRootCode = async (rootCode: string): Promise<Family | null> => {
  const db = checkDb()
  const familiesRef = collection(db, 'families')
  const q = query(familiesRef, where('rootCode', '==', rootCode.toUpperCase()))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return null
  }
  
  const familyDoc = snapshot.docs[0]
  return {
    id: familyDoc.id,
    ...familyDoc.data(),
  } as Family
}

/**
 * Lấy family theo ID
 */
export const getFamilyById = async (familyId: string): Promise<Family | null> => {
  const db = checkDb()
  console.log('[getFamilyById] Fetching family with ID:', familyId)
  const familyRef = doc(db, 'families', familyId)
  const familySnap = await getDoc(familyRef)
  
  if (!familySnap.exists()) {
    console.warn('[getFamilyById] Family not found:', familyId)
    return null
  }
  
  const familyData = {
    id: familySnap.id,
    ...familySnap.data(),
  } as Family
  
  console.log('[getFamilyById] Family found:', {
    id: familyData.id,
    code: familyData.code,
    rootCode: familyData.rootCode,
  })
  
  return familyData
}

/**
 * Join family bằng code
 */
export const joinFamilyByCode = async (code: string, userId: string): Promise<{ success: boolean; familyId?: string; error?: string }> => {
  try {
    const db = checkDb()
    if (!db) {
      return { success: false, error: 'Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.local' }
    }

    const family = await getFamilyByCode(code)
    
    if (!family) {
      return { success: false, error: 'Mã gia đình không tồn tại' }
    }
    
    // Kiểm tra user đã có family chưa (nếu có thì không cho join)
    const { getProfile } = await import('./profile')
    const userProfile = await getProfile(userId)
    if (userProfile && userProfile.familyId) {
      return { success: false, error: 'Bạn đã thuộc về một gia đình rồi' }
    }
    
    // Update member count
    const familyRef = doc(db, 'families', family.id)
    const familyData = await getFamilyById(family.id)
    await updateDoc(familyRef, {
      memberCount: (familyData?.memberCount || 0) + 1,
    })
    
    return { success: true, familyId: family.id }
  } catch (error: any) {
    console.error('Error joining family:', error)
    if (error.message && error.message.includes('Firestore is not initialized')) {
      return { success: false, error: 'Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.local và restart server' }
    }
    return { success: false, error: error.message || 'Lỗi khi tham gia gia đình' }
  }
}

/**
 * Lấy tất cả members của một family
 */
export const getFamilyMembers = async (familyId: string): Promise<UserProfile[]> => {
  const db = checkDb()
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('familyId', '==', familyId))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as UserProfile[]
}
