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
  deleteDoc,
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
  closedImageUrl?: string // URL ảnh rương đóng
  openingMediaUrl?: string // URL animation/video khi mở rương (có thể là .gif hoặc .mp4)
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

/**
 * Tạo URL hình ảnh phần thưởng dựa trên chest type và item type
 * Sử dụng tên file hiện có: {chestType}-{itemType}.png
 * 
 * Format tên file:
 * - Wood-coin.png, Wood-XP.png
 * - Silver-coin.png, Silver-XP.png
 * - Gold-coin.png, Gold-XP.png
 * - Mystery-coin.png, Mystery-XP.png
 * - Legendary-coin.png, Legendary-XP.png
 * 
 * @param chestType - Loại rương: 'wood', 'silver', 'gold', 'mystery', 'legendary'
 * @param itemType - Loại item: 'xp', 'coins', 'special'
 * @returns URL hình ảnh hoặc undefined
 */
export const getRewardImageUrl = (chestType: string, itemType: string): string | undefined => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvuy40chj'
  
  // Normalize chest type (lowercase, fix typo)
  let normalizedChestType = chestType.toLowerCase()
    .replace('lagendary', 'legendary') // Fix typo: lagendary -> legendary
  
  // Normalize item type
  const normalizedItemType = itemType.toLowerCase()
  
  // Capitalize first letter của chest type: Wood, Silver, Gold, Mystery, Legendary
  const capitalizedChestType = normalizedChestType.charAt(0).toUpperCase() + normalizedChestType.slice(1)
  
  // Tạo tên file: {chestType}-{itemType}.png
  let fileName = ''
  
  if (normalizedItemType === 'xp') {
    // XP items: {chestType}-XP.png (XP viết hoa)
    fileName = `${capitalizedChestType}-XP.png`
  } else if (normalizedItemType === 'coins' || normalizedItemType === 'coin') {
    // Coins items: {chestType}-coin.png (coin viết thường)
    fileName = `${capitalizedChestType}-coin.png`
  } else if (normalizedItemType === 'special') {
    // Special items - fallback to mystery hoặc legendary
    if (normalizedChestType === 'mystery' || normalizedChestType === 'gold' || normalizedChestType === 'silver') {
      fileName = 'Mystery-coin.png'
    } else if (normalizedChestType === 'legendary') {
      fileName = 'Legendary-coin.png'
    } else {
      fileName = 'Wood-coin.png'
    }
  } else {
    return undefined
  }
  
  // Tạo URL từ Cloudinary (sau khi upload)
  // Format: https://res.cloudinary.com/{cloud-name}/image/upload/family-tasks/chests/rewards/{filename}
  return `https://res.cloudinary.com/${cloudName}/image/upload/family-tasks/chests/rewards/${fileName}`
}

// Danh sách item mặc định cho các loại rương
export const DEFAULT_CHEST_ITEMS: Record<string, ChestItem[]> = {
  common: [
    { 
      id: 'xp_50', 
      type: 'xp', 
      name: 'XP Nhỏ', 
      value: 50, 
      rarity: 'common', 
      description: 'Nhận 50 XP'
    },
    { 
      id: 'xp_100', 
      type: 'xp', 
      name: 'XP Vừa', 
      value: 100, 
      rarity: 'common', 
      description: 'Nhận 100 XP'
    },
    { 
      id: 'coins_10', 
      type: 'coins', 
      name: 'Coins Nhỏ', 
      value: 10, 
      rarity: 'common', 
      description: 'Nhận 10 Coins'
    },
    { 
      id: 'coins_20', 
      type: 'coins', 
      name: 'Coins Vừa', 
      value: 20, 
      rarity: 'common', 
      description: 'Nhận 20 Coins'
    },
  ],
  rare: [
    { 
      id: 'xp_200', 
      type: 'xp', 
      name: 'XP Lớn', 
      value: 200, 
      rarity: 'rare', 
      description: 'Nhận 200 XP'
    },
    { 
      id: 'xp_300', 
      type: 'xp', 
      name: 'XP Rất Lớn', 
      value: 300, 
      rarity: 'rare', 
      description: 'Nhận 300 XP'
    },
    { 
      id: 'coins_50', 
      type: 'coins', 
      name: 'Coins Lớn', 
      value: 50, 
      rarity: 'rare', 
      description: 'Nhận 50 Coins'
    },
    { 
      id: 'coins_100', 
      type: 'coins', 
      name: 'Coins Rất Lớn', 
      value: 100, 
      rarity: 'rare', 
      description: 'Nhận 100 Coins'
    },
  ],
  epic: [
    { 
      id: 'xp_500', 
      type: 'xp', 
      name: 'XP Khổng Lồ', 
      value: 500, 
      rarity: 'epic', 
      description: 'Nhận 500 XP'
    },
    { 
      id: 'coins_200', 
      type: 'coins', 
      name: 'Coins Khổng Lồ', 
      value: 200, 
      rarity: 'epic', 
      description: 'Nhận 200 Coins'
    },
    { 
      id: 'special_boost', 
      type: 'special', 
      name: 'Tăng Tốc', 
      value: 1, 
      rarity: 'epic', 
      description: 'XP x2 trong 1 ngày'
    },
  ],
  legendary: [
    { 
      id: 'xp_1000', 
      type: 'xp', 
      name: 'XP Thần Thánh', 
      value: 1000, 
      rarity: 'legendary', 
      description: 'Nhận 1000 XP'
    },
    { 
      id: 'coins_500', 
      type: 'coins', 
      name: 'Coins Thần Thánh', 
      value: 500, 
      rarity: 'legendary', 
      description: 'Nhận 500 Coins'
    },
    { 
      id: 'special_levelup', 
      type: 'special', 
      name: 'Lên Level Ngay', 
      value: 1, 
      rarity: 'legendary', 
      description: 'Tự động lên 1 level'
    },
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
  
  // Xác định chest type từ itemPool để điều chỉnh weights phù hợp
  const hasLegendary = itemPool.some(item => item.rarity === 'legendary')
  const hasEpic = itemPool.some(item => item.rarity === 'epic')
  const hasRare = itemPool.some(item => item.rarity === 'rare')
  const hasCommon = itemPool.some(item => item.rarity === 'common')
  
  // Nếu là Legendary chest (chỉ có epic + legendary), ưu tiên legendary items
  const isLegendaryChest = hasEpic && hasLegendary && !hasCommon && !hasRare
  
  // Weighted random dựa trên rarity
  // Nếu là Legendary chest, tăng weight cho legendary items
  const weights: Record<string, number> = isLegendaryChest
    ? {
        common: 0,
        rare: 0,
        epic: 20,  // Giảm weight của epic
        legendary: 80, // Tăng weight của legendary lên rất cao
      }
    : {
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
  const receivedItem = { ...weightedItems[randomIndex] }
  
  // Xác định chest type từ itemPool để chọn đúng hình ảnh
  let chestType = 'wood' // default
  if (hasCommon && hasRare && hasEpic && hasLegendary) {
    chestType = 'mystery'
  } else if (hasEpic && hasLegendary && !hasCommon && !hasRare) {
    chestType = 'legendary'
  } else if (hasRare && hasEpic && !hasLegendary) {
    chestType = 'gold'
  } else if (hasCommon && hasRare && !hasEpic && !hasLegendary) {
    chestType = 'silver'
  } else if (hasCommon && !hasRare && !hasEpic && !hasLegendary) {
    chestType = 'wood'
  }
  
  // Thêm image URL vào receivedItem dựa trên chest type và item type
  if (!receivedItem.image) {
    receivedItem.image = getRewardImageUrl(chestType, receivedItem.type)
  }
  
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
 * Lấy tất cả rương của user (tự động xóa rương đã mở quá 7 ngày)
 */
export const getUserChests = async (userId: string): Promise<UserChest[]> => {
  const userChestsRef = collection(checkDb(), 'userChests')
  const q = query(userChestsRef, where('userId', '==', userId))
  const snapshot = await getDocs(q)
  
  const now = Timestamp.now()
  const sevenDaysAgo = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000)
  
  const userChests: UserChest[] = []
  const chestsToDelete: string[] = []
  
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data()
    const userChest = {
      ...data,
      id: docSnap.id,
    } as UserChest
    
    // Nếu rương đã mở và đã quá 7 ngày, đánh dấu để xóa
    if (userChest.opened && userChest.openedAt) {
      const openedAt = userChest.openedAt as Timestamp
      if (openedAt.toMillis() < sevenDaysAgo.toMillis()) {
        chestsToDelete.push(docSnap.id)
        return // Không thêm vào danh sách trả về
      }
    }
    
    userChests.push(userChest)
  })
  
  // Xóa các rương cũ (async, không đợi)
  if (chestsToDelete.length > 0) {
    Promise.all(
      chestsToDelete.map(chestId => {
        const chestRef = doc(checkDb(), 'userChests', chestId)
        return deleteDoc(chestRef).catch(err => {
          console.error(`Error deleting old chest ${chestId}:`, err)
        })
      })
    ).catch(err => {
      console.error('Error deleting old chests:', err)
    })
  }
  
  return userChests
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
