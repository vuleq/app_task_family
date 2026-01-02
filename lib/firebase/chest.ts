import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore'
import { db } from './config'
import { updateProfile, getProfile } from './profile'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

export interface ChestItem {
  id: string
  type: 'xp' | 'coins' | 'outfit' | 'pet' | 'background' | 'special'
  name: string
  value: number // XP amount, coin amount, hoặc item ID
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  image?: string
  description?: string
}

export interface Chest {
  id: string
  name: string
  cost: number // Coins để mua
  itemPool: ChestItem[] // Danh sách item có thể nhận được
  createdAt: any
}

export interface UserChest {
  id: string
  userId: string
  chestId: string
  chestName: string
  opened: boolean
  receivedItem?: ChestItem
  openedAt?: any
  createdAt: any
}

// Danh sách item mặc định cho các loại rương
export const DEFAULT_CHEST_ITEMS: Record<string, ChestItem[]> = {
  common: [
    { id: 'xp_50', type: 'xp', name: 'XP Nhỏ', value: 50, rarity: 'common', description: 'Nhận 50 XP' },
    { id: 'xp_100', type: 'xp', name: 'XP Vừa', value: 100, rarity: 'common', description: 'Nhận 100 XP' },
    { id: 'coins_10', type: 'coins', name: 'Coins Nhỏ', value: 10, rarity: 'common', description: 'Nhận 10 Coins' },
    { id: 'coins_20', type: 'coins', name: 'Coins Vừa', value: 20, rarity: 'common', description: 'Nhận 20 Coins' },
  ],
  rare: [
    { id: 'xp_200', type: 'xp', name: 'XP Lớn', value: 200, rarity: 'rare', description: 'Nhận 200 XP' },
    { id: 'xp_300', type: 'xp', name: 'XP Rất Lớn', value: 300, rarity: 'rare', description: 'Nhận 300 XP' },
    { id: 'coins_50', type: 'coins', name: 'Coins Lớn', value: 50, rarity: 'rare', description: 'Nhận 50 Coins' },
    { id: 'coins_100', type: 'coins', name: 'Coins Rất Lớn', value: 100, rarity: 'rare', description: 'Nhận 100 Coins' },
  ],
  epic: [
    { id: 'xp_500', type: 'xp', name: 'XP Khổng Lồ', value: 500, rarity: 'epic', description: 'Nhận 500 XP' },
    { id: 'coins_200', type: 'coins', name: 'Coins Khổng Lồ', value: 200, rarity: 'epic', description: 'Nhận 200 Coins' },
    { id: 'special_boost', type: 'special', name: 'Tăng Tốc', value: 1, rarity: 'epic', description: 'XP x2 trong 1 ngày' },
  ],
  legendary: [
    { id: 'xp_1000', type: 'xp', name: 'XP Thần Thánh', value: 1000, rarity: 'legendary', description: 'Nhận 1000 XP' },
    { id: 'coins_500', type: 'coins', name: 'Coins Thần Thánh', value: 500, rarity: 'legendary', description: 'Nhận 500 Coins' },
    { id: 'special_levelup', type: 'special', name: 'Lên Level Ngay', value: 1, rarity: 'legendary', description: 'Tự động lên 1 level' },
  ],
}

/**
 * Tạo rương mặc định trong database (chỉ cần chạy 1 lần)
 */
export const createDefaultChests = async (): Promise<void> => {
  const chestsRef = collection(checkDb(), 'chests')
  
  // Kiểm tra xem đã có rương chưa
  const existingChests = await getDocs(chestsRef)
  if (existingChests.size > 0) {
    console.log('Chests already exist, skipping creation')
    return
  }
  
  // Tạo các loại rương
  const chestTypes = [
    {
      name: 'Rương Đồng',
      cost: 50,
      itemPool: [...DEFAULT_CHEST_ITEMS.common, ...DEFAULT_CHEST_ITEMS.rare],
    },
    {
      name: 'Rương Bạc',
      cost: 100,
      itemPool: [...DEFAULT_CHEST_ITEMS.rare, ...DEFAULT_CHEST_ITEMS.epic],
    },
    {
      name: 'Rương Vàng',
      cost: 200,
      itemPool: [...DEFAULT_CHEST_ITEMS.epic, ...DEFAULT_CHEST_ITEMS.legendary],
    },
  ]
  
  for (const chest of chestTypes) {
    await addDoc(chestsRef, {
      name: chest.name,
      cost: chest.cost,
      itemPool: chest.itemPool,
      createdAt: Timestamp.now(),
    })
  }
  
  console.log('Default chests created successfully')
}

/**
 * Lấy tất cả rương có sẵn
 */
export const getAllChests = async (): Promise<Chest[]> => {
  const chestsRef = collection(checkDb(), 'chests')
  const snapshot = await getDocs(chestsRef)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Chest[]
}

/**
 * Mua rương
 */
export const purchaseChest = async (userId: string, chestId: string): Promise<string> => {
  // Lấy thông tin rương
  const chestRef = doc(checkDb(), 'chests', chestId)
  const chestSnap = await getDoc(chestRef)
  
  if (!chestSnap.exists()) {
    throw new Error('Rương không tồn tại')
  }
  
  const chest = chestSnap.data() as Chest
  
  // Kiểm tra coins
  const userProfile = await getProfile(userId)
  if (!userProfile) {
    throw new Error('Không tìm thấy thông tin người dùng')
  }
  
  if (userProfile.coins < chest.cost) {
    throw new Error(`Không đủ Coins. Cần ${chest.cost} Coins, bạn có ${userProfile.coins} Coins`)
  }
  
  // Trừ coins
  await updateProfile(userId, {
    coins: userProfile.coins - chest.cost,
  })
  
  // Tạo user chest
  const userChestsRef = collection(checkDb(), 'userChests')
  const userChestRef = await addDoc(userChestsRef, {
    userId,
    chestId,
    chestName: chest.name,
    opened: false,
    createdAt: Timestamp.now(),
  })
  
  return userChestRef.id
}

/**
 * Mở rương và nhận item random
 */
export const openChest = async (userChestId: string, userId: string): Promise<ChestItem> => {
  // Lấy thông tin user chest
  const userChestRef = doc(checkDb(), 'userChests', userChestId)
  const userChestSnap = await getDoc(userChestRef)
  
  if (!userChestSnap.exists()) {
    throw new Error('Rương không tồn tại')
  }
  
  const userChest = userChestSnap.data() as UserChest
  
  if (userChest.opened) {
    throw new Error('Rương đã được mở rồi')
  }
  
  if (userChest.userId !== userId) {
    throw new Error('Bạn không có quyền mở rương này')
  }
  
  // Lấy thông tin rương
  const chestRef = doc(checkDb(), 'chests', userChest.chestId)
  const chestSnap = await getDoc(chestRef)
  
  if (!chestSnap.exists()) {
    throw new Error('Rương không tồn tại')
  }
  
  const chest = chestSnap.data() as Chest
  
  // Random item từ itemPool
  const itemPool = chest.itemPool
  if (itemPool.length === 0) {
    throw new Error('Rương không có item nào')
  }
  
  // Weighted random dựa trên rarity
  const weights: Record<string, number> = {
    common: 50,
    rare: 30,
    epic: 15,
    legendary: 5,
  }
  
  const weightedItems: ChestItem[] = []
  itemPool.forEach(item => {
    const weight = weights[item.rarity] || 10
    for (let i = 0; i < weight; i++) {
      weightedItems.push(item)
    }
  })
  
  const randomIndex = Math.floor(Math.random() * weightedItems.length)
  const receivedItem = weightedItems[randomIndex]
  
  // Cập nhật user chest
  await updateDoc(userChestRef, {
    opened: true,
    receivedItem,
    openedAt: Timestamp.now(),
  })
  
  // Áp dụng item cho user
  const userProfile = await getProfile(userId)
  if (!userProfile) {
    throw new Error('Không tìm thấy thông tin người dùng')
  }
  
  if (receivedItem.type === 'xp') {
    await updateProfile(userId, {
      xp: userProfile.xp + receivedItem.value,
    })
  } else if (receivedItem.type === 'coins') {
    await updateProfile(userId, {
      coins: userProfile.coins + receivedItem.value,
    })
  } else if (receivedItem.type === 'special') {
    // Xử lý special items (có thể mở rộng sau)
    if (receivedItem.id === 'special_levelup') {
      // Tính level hiện tại và XP cần để lên level tiếp theo
      // (Cần import calculateLevel và getXPForLevel từ utils/level)
      // Tạm thời chỉ thêm XP lớn
      await updateProfile(userId, {
        xp: userProfile.xp + 1000,
      })
    }
  }
  
  return receivedItem
}

/**
 * Lấy tất cả rương của user
 */
export const getUserChests = async (userId: string): Promise<UserChest[]> => {
  const userChestsRef = collection(checkDb(), 'userChests')
  const q = query(userChestsRef, where('userId', '==', userId))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as UserChest[]
}

/**
 * Tạo rương mới (chỉ root mới có quyền)
 */
export const createChest = async (
  name: string,
  cost: number,
  itemPool: ChestItem[]
): Promise<string> => {
  const chestsRef = collection(checkDb(), 'chests')
  const docRef = await addDoc(chestsRef, {
    name,
    cost,
    itemPool,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

/**
 * Cập nhật rương (chỉ root mới có quyền)
 */
export const updateChest = async (
  chestId: string,
  name: string,
  cost: number,
  itemPool: ChestItem[]
): Promise<void> => {
  const chestRef = doc(checkDb(), 'chests', chestId)
  await updateDoc(chestRef, {
    name,
    cost,
    itemPool,
  })
}
