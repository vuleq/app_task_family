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
  weight?: number // Trọng số xác suất (dùng thay rarity-based weights nếu có)
  image?: string
  description?: string
}

export interface Chest {
  id: string
  name: string
  cost: number // Coins để mua
  itemPool: ChestItem[] // Danh sách item có thể nhận được
  chestType?: string // Loại rương: wood, silver, gold, mystery, legendary, candy, cosmic, nature, tech, frozen
  closedImageUrl?: string // URL ảnh rương đóng
  openingMediaUrl?: string // URL animation/video khi mở rương (có thể là .gif hoặc .mp4)
  maxPerWeek?: number // Giới hạn mua tối đa trong 1 tuần (undefined = không giới hạn)
  familyId: string // ID của gia đình
  createdAt: any
}

export interface UserChest {
  id: string
  userId: string
  chestId: string
  chestName: string
  familyId: string // ID của gia đình
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

// URLs hình ảnh rương (dùng chung với ChestSystem.tsx)
export const CHEST_IMAGE_URLS: Record<string, string> = {
  wood:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585192/wooden_chest-removebg-preview_ojd1od.png',
  silver:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Silver_chest-removebg-preview_rx2zzi.png',
  gold:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Golden_chest-removebg-preview_h6osf1.png',
  mystery:   'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Mystery_chest-removebg-preview_ybp3e3.png',
  legendary: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Legendary_chest-removebg-preview_ntolx5.png',
  candy:     'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585190/Candy_chest-removebg-preview_xwxmnz.png',
  cosmic:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Cosmic_chest-removebg-preview_qyrtb0.png',
  nature:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Nature_chest-removebg-preview_rblkbb.png',
  tech:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/tech_chest-removebg-preview_ovx4he.png',
  frozen:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Frozen_chest-removebg-preview_rgej5m.png',
}

// URLs hình thưởng thực tế
const REWARD_URLS = {
  xp50coins:       'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663450/50_xp_va_coins-removebg-preview_cen9zw.png',
  xp100coins:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774669832/100_xp_va_coins-removebg-preview_rlee6w.png',
  xp200coins:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663451/200_xp_va_coin-removebg-preview_lsq1lr.png',
  xp500coins:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663450/500_xp_va_coin-removebg-preview_fixt6q.png',
  fifa39k:         'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663451/goi_the_cau_thu_39k-removebg-preview_d4jryi.png',
  fifaPremium175k: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1774756309/goi_the_cau_thu_premium_175-removebg-preview_fevwos.png',
  cgvTicket:       'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663451/CGV_tickets-removebg-preview_tcmtyq.png',
  fifa365box:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663452/Hop_the_hinh_FIFA_365_2026-removebg-preview_ar5yyc.png',
  punkverse:       'https://res.cloudinary.com/dvuy40chj/image/upload/v1774663451/punkverse_ticket-removebg-preview_axjjcf.png',
}

// Lookup table: item ID → correct reward image URL
// Used as fallback when the stored ChestItem.image is missing (old Firestore data)
export const REWARD_IMAGE_BY_ID: Record<string, string> = {
  xp50_coins:        REWARD_URLS.xp50coins,
  xp100_coins:       REWARD_URLS.xp100coins,
  xp200_coins:       REWARD_URLS.xp200coins,
  xp500_coins:       REWARD_URLS.xp500coins,
  fifa39k:           REWARD_URLS.fifa39k,
  fifa_premium_175k: REWARD_URLS.fifaPremium175k,
  cgv_ticket:        REWARD_URLS.cgvTicket,
  fifa365_box_209k:  REWARD_URLS.fifa365box,
  punkverse_ticket:  REWARD_URLS.punkverse,
}

/**
 * 10 rương = 5 cặp tương đương (cùng item pool + xác suất, khác skin):
 *   Đồng = Cosmic  (50 coins)
 *   Bạc  = Candy   (100 coins)
 *   Vàng = Nature  (150 coins)
 *   Kim Cương = Tech (200 coins)
 *   Huyền Thoại = Frozen (300 coins, 1 lần/tuần)
 */

// Item pools dùng chung cho từng tier
// Tất cả phần thưởng có xác suất đều nhau (weight bằng nhau)
const TIER_POOLS = {
  // 50 coins: XP50 | XP100 | Pack39k (mỗi loại ~33%)
  tier1: [
    { id: 'xp50_coins',  type: 'xp',      name: 'XP 50 + Coins',        value: 50,  rarity: 'common', weight: 1, image: REWARD_URLS.xp50coins,  description: 'Nhận 50 XP + Coins' },
    { id: 'xp100_coins', type: 'xp',      name: 'XP 100 + Coins',       value: 100, rarity: 'common', weight: 1, image: REWARD_URLS.xp100coins, description: 'Nhận 100 XP + Coins' },
    { id: 'fifa39k',     type: 'special', name: 'Gói Thẻ Cầu Thủ 39k',  value: 1,   rarity: 'rare',   weight: 1, image: REWARD_URLS.fifa39k,    description: 'Gói thẻ cầu thủ FIFA 365 2026' },
  ] as ChestItem[],

  // 150 coins: XP100 | XP200 | Pack39k (mỗi loại ~33%)
  tier2: [
    { id: 'xp100_coins', type: 'xp',      name: 'XP 100 + Coins',       value: 100, rarity: 'common', weight: 1, image: REWARD_URLS.xp100coins, description: 'Nhận 100 XP + Coins' },
    { id: 'xp200_coins', type: 'xp',      name: 'XP 200 + Coins',       value: 200, rarity: 'rare',   weight: 1, image: REWARD_URLS.xp200coins, description: 'Nhận 200 XP + Coins' },
    { id: 'fifa39k',     type: 'special', name: 'Gói Thẻ Cầu Thủ 39k',  value: 1,   rarity: 'rare',   weight: 1, image: REWARD_URLS.fifa39k,    description: 'Gói thẻ cầu thủ FIFA 365 2026' },
  ] as ChestItem[],

  // 200 coins: XP100 | XP200 | Pack39k | Vé phim (mỗi loại 25%)
  tier3: [
    { id: 'xp100_coins', type: 'xp',      name: 'XP 100 + Coins',       value: 100, rarity: 'common', weight: 1, image: REWARD_URLS.xp100coins, description: 'Nhận 100 XP + Coins' },
    { id: 'xp200_coins', type: 'xp',      name: 'XP 200 + Coins',       value: 200, rarity: 'rare',   weight: 1, image: REWARD_URLS.xp200coins, description: 'Nhận 200 XP + Coins' },
    { id: 'fifa39k',     type: 'special', name: 'Gói Thẻ Cầu Thủ 39k',  value: 1,   rarity: 'rare',   weight: 1, image: REWARD_URLS.fifa39k,    description: 'Gói thẻ cầu thủ FIFA 365 2026' },
    { id: 'cgv_ticket',  type: 'special', name: 'Vé Xem Phim CGV',      value: 1,   rarity: 'epic',   weight: 1, image: REWARD_URLS.cgvTicket,  description: 'Vé xem phim rạp CGV' },
  ] as ChestItem[],

  // 300 coins: Pack39k | Premium175k | Vé phim (mỗi loại ~33%) — giới hạn 2 lần/tuần
  tier4: [
    { id: 'fifa39k',           type: 'special', name: 'Gói Thẻ Cầu Thủ 39k',  value: 1, rarity: 'rare',      weight: 1, image: REWARD_URLS.fifa39k,         description: 'Gói thẻ cầu thủ FIFA 365 2026' },
    { id: 'fifa_premium_175k', type: 'special', name: 'Gói Thẻ Premium 175k',  value: 1, rarity: 'epic',      weight: 1, image: REWARD_URLS.fifaPremium175k, description: 'Hộp thẻ hình Adrenalyn Premium 175k' },
    { id: 'cgv_ticket',        type: 'special', name: 'Vé Xem Phim CGV',       value: 1, rarity: 'rare',      weight: 1, image: REWARD_URLS.cgvTicket,       description: 'Vé xem phim rạp CGV' },
  ] as ChestItem[],

  // 500 coins: XP500 | Pack39k | Premium175k | Hộp209k | Vé phim | Vé Punkverse (mỗi loại ~17%)
  // Punkverse có cooldown 1 tuần (xử lý trong openChest)
  tier5: [
    { id: 'xp500_coins',       type: 'xp',      name: 'XP 500 + Coins',        value: 500, rarity: 'epic',      weight: 1, image: REWARD_URLS.xp500coins,      description: 'Nhận 500 XP + Coins' },
    { id: 'fifa39k',           type: 'special', name: 'Gói Thẻ Cầu Thủ 39k',  value: 1,   rarity: 'rare',      weight: 1, image: REWARD_URLS.fifa39k,         description: 'Gói thẻ cầu thủ FIFA 365 2026' },
    { id: 'fifa_premium_175k', type: 'special', name: 'Gói Thẻ Premium 175k',  value: 1,   rarity: 'epic',      weight: 1, image: REWARD_URLS.fifaPremium175k, description: 'Hộp thẻ hình Adrenalyn Premium 175k' },
    { id: 'fifa365_box_209k',  type: 'special', name: 'Hộp Thẻ FIFA 365 209k', value: 1,   rarity: 'legendary', weight: 1, image: REWARD_URLS.fifa365box,      description: 'Hộp thẻ hình Panini FIFA 365 2026' },
    { id: 'cgv_ticket',        type: 'special', name: 'Vé Xem Phim CGV',       value: 1,   rarity: 'rare',      weight: 1, image: REWARD_URLS.cgvTicket,       description: 'Vé xem phim rạp CGV' },
    { id: 'punkverse_ticket',  type: 'special', name: 'Vé Punkverse',           value: 1,   rarity: 'legendary', weight: 1, image: REWARD_URLS.punkverse,       description: 'Vé tham dự sự kiện Punkverse' },
  ] as ChestItem[],
}

export const CHEST_TIER_CONFIGS = [
  // ── Tier 1: 50 coins ──────────────────────────────────────
  { name: 'Rương Đồng',   cost: 50,  chestType: 'wood',      itemPool: TIER_POOLS.tier1 },
  { name: 'Rương Cosmic', cost: 50,  chestType: 'cosmic',    itemPool: TIER_POOLS.tier1 },

  // ── Tier 2: 150 coins ─────────────────────────────────────
  { name: 'Rương Vàng',  cost: 150, chestType: 'gold',      itemPool: TIER_POOLS.tier2 },
  { name: 'Rương Rừng',  cost: 150, chestType: 'nature',    itemPool: TIER_POOLS.tier2 },

  // ── Tier 3: 200 coins ─────────────────────────────────────
  { name: 'Rương Bí Ẩn', cost: 200, chestType: 'mystery',   itemPool: TIER_POOLS.tier3 },
  { name: 'Rương Tech',  cost: 200, chestType: 'tech',      itemPool: TIER_POOLS.tier3 },

  // ── Tier 4: 300 coins, giới hạn 2 lần/tuần ───────────────
  { name: 'Rương Huyền Thoại', cost: 300, chestType: 'legendary', maxPerWeek: 2, itemPool: TIER_POOLS.tier4 },
  { name: 'Rương Băng',        cost: 300, chestType: 'frozen',    maxPerWeek: 2, itemPool: TIER_POOLS.tier4 },

  // ── Tier 5: 500 coins ─────────────────────────────────────
  // Punkverse cooldown 1 tuần → tối đa 1 vé/tuần dù mở bao nhiêu rương
  { name: 'Rương Bạc',   cost: 500, chestType: 'silver',    itemPool: TIER_POOLS.tier5 },
  { name: 'Rương Kẹo',   cost: 500, chestType: 'candy',     itemPool: TIER_POOLS.tier5 },
]

// Danh sách item mặc định cho các loại rương
export const DEFAULT_CHEST_ITEMS: Record<string, ChestItem[]> = {
  common: [
    { 
      id: 'xp_50', 
      type: 'xp', 
      name: 'XP Nhỏ', 
      value: 50, 
      rarity: 'common', 
      description: 'Nhận 50 XP',
      image: getRewardImageUrl('common', 'xp')
    },
    { 
      id: 'xp_100', 
      type: 'xp', 
      name: 'XP Vừa', 
      value: 100, 
      rarity: 'common', 
      description: 'Nhận 100 XP',
      image: getRewardImageUrl('common', 'xp')
    },
    { 
      id: 'coins_10', 
      type: 'coins', 
      name: 'Coins Nhỏ', 
      value: 10, 
      rarity: 'common', 
      description: 'Nhận 10 Coins',
      image: getRewardImageUrl('common', 'coins')
    },
    { 
      id: 'coins_20', 
      type: 'coins', 
      name: 'Coins Vừa', 
      value: 20, 
      rarity: 'common', 
      description: 'Nhận 20 Coins',
      image: getRewardImageUrl('common', 'coins')
    },
  ],
  rare: [
    { 
      id: 'xp_200', 
      type: 'xp', 
      name: 'XP Lớn', 
      value: 200, 
      rarity: 'rare', 
      description: 'Nhận 200 XP',
      image: getRewardImageUrl('rare', 'xp')
    },
    { 
      id: 'xp_300', 
      type: 'xp', 
      name: 'XP Rất Lớn', 
      value: 300, 
      rarity: 'rare', 
      description: 'Nhận 300 XP',
      image: getRewardImageUrl('rare', 'xp')
    },
    { 
      id: 'coins_50', 
      type: 'coins', 
      name: 'Coins Lớn', 
      value: 50, 
      rarity: 'rare', 
      description: 'Nhận 50 Coins',
      image: getRewardImageUrl('rare', 'coins')
    },
    { 
      id: 'coins_100', 
      type: 'coins', 
      name: 'Coins Rất Lớn', 
      value: 100, 
      rarity: 'rare', 
      description: 'Nhận 100 Coins',
      image: getRewardImageUrl('rare', 'coins')
    },
  ],
  epic: [
    { 
      id: 'xp_500', 
      type: 'xp', 
      name: 'XP Khổng Lồ', 
      value: 500, 
      rarity: 'epic', 
      description: 'Nhận 500 XP',
      image: getRewardImageUrl('epic', 'xp')
    },
    { 
      id: 'coins_200', 
      type: 'coins', 
      name: 'Coins Khổng Lồ', 
      value: 200, 
      rarity: 'epic', 
      description: 'Nhận 200 Coins',
      image: getRewardImageUrl('epic', 'coins')
    },
    { 
      id: 'special_boost', 
      type: 'special', 
      name: 'Tăng Tốc', 
      value: 1, 
      rarity: 'epic', 
      description: 'XP x2 trong 1 ngày',
      image: getRewardImageUrl('epic', 'special')
    },
  ],
  legendary: [
    { 
      id: 'xp_1000', 
      type: 'xp', 
      name: 'XP Thần Thánh', 
      value: 1000, 
      rarity: 'legendary', 
      description: 'Nhận 1000 XP',
      image: getRewardImageUrl('legendary', 'xp')
    },
    { 
      id: 'coins_500', 
      type: 'coins', 
      name: 'Coins Thần Thánh', 
      value: 500, 
      rarity: 'legendary', 
      description: 'Nhận 500 Coins',
      image: getRewardImageUrl('legendary', 'coins')
    },
    { 
      id: 'special_levelup', 
      type: 'special', 
      name: 'Lên Level Ngay', 
      value: 1, 
      rarity: 'legendary', 
      description: 'Tự động lên 1 level',
      image: getRewardImageUrl('legendary', 'special')
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
export const getAllChests = async (familyId: string): Promise<Chest[]> => {
  const chestsRef = collection(checkDb(), 'chests')
  const q = query(chestsRef, where('familyId', '==', familyId))
  const snapshot = await getDocs(q)
  
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

  // Kiểm tra giới hạn mua trong tuần (maxPerWeek)
  if (chest.maxPerWeek) {
    const weeklyRef = collection(checkDb(), 'userChests')
    const oneWeekAgo = Timestamp.fromMillis(Timestamp.now().toMillis() - 7 * 24 * 60 * 60 * 1000)
    const weeklyQ = query(weeklyRef, where('userId', '==', userId), where('chestId', '==', chestId))
    const weeklySnap = await getDocs(weeklyQ)
    const weeklyCount = weeklySnap.docs.filter(d => {
      const t = d.data().createdAt as Timestamp
      return t && t.toMillis() >= oneWeekAgo.toMillis()
    }).length
    if (weeklyCount >= chest.maxPerWeek) {
      throw new Error(`Rương này chỉ được mua ${chest.maxPerWeek} lần/tuần. Hãy quay lại vào tuần sau!`)
    }
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
    familyId: chest.familyId, // Lưu familyId vào userChest
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
  
  const itemPool = chest.itemPool
  if (itemPool.length === 0) throw new Error('Rương không có item nào')

  // Lấy profile sớm để kiểm tra Punkverse cooldown
  const userProfile = await getProfile(userId)
  if (!userProfile) throw new Error('Không tìm thấy thông tin người dùng')

  // Punkverse giới hạn 2 lần/tuần: đếm số vé đã nhận từ đầu tuần (Thứ 2)
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // 0=Mon … 6=Sun
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekStartTs = Timestamp.fromMillis(weekStart.getTime())

  const punkverseThisWeekSnap = await getDocs(
    query(
      collection(checkDb(), 'userChests'),
      where('userId', '==', userId),
      where('opened', '==', true)
    )
  )
  const punkverseThisWeekCount = punkverseThisWeekSnap.docs.filter(d => {
    const data = d.data()
    return (
      data.receivedItem?.id === 'punkverse_ticket' &&
      data.openedAt &&
      (data.openedAt as Timestamp).toMillis() >= weekStartTs.toMillis()
    )
  }).length

  const punkverseOnCooldown = punkverseThisWeekCount >= 2
  const effectivePool = punkverseOnCooldown
    ? itemPool.filter(item => item.id !== 'punkverse_ticket')
    : itemPool
  if (effectivePool.length === 0) throw new Error('Rương không có item nào')

  let receivedItem: ChestItem

  if (effectivePool.some(item => item.weight !== undefined)) {
    // Weight-based random (tất cả rương mới đều dùng path này)
    const totalWeight = effectivePool.reduce((sum, item) => sum + (item.weight ?? 1), 0)
    let rand = Math.random() * totalWeight
    receivedItem = { ...effectivePool[effectivePool.length - 1] }
    for (const item of effectivePool) {
      rand -= (item.weight ?? 1)
      if (rand <= 0) { receivedItem = { ...item }; break }
    }
  } else {
    // Fallback rarity-based (rương cũ không có weight)
    const hasLegendary = effectivePool.some(i => i.rarity === 'legendary')
    const hasEpic      = effectivePool.some(i => i.rarity === 'epic')
    const hasRare      = effectivePool.some(i => i.rarity === 'rare')
    const hasCommon    = effectivePool.some(i => i.rarity === 'common')
    const isLegendaryChest = hasEpic && hasLegendary && !hasCommon && !hasRare
    const rw: Record<string, number> = isLegendaryChest
      ? { common: 0, rare: 0, epic: 20, legendary: 80 }
      : { common: 50, rare: 30, epic: 15, legendary: 5 }
    const weighted: ChestItem[] = []
    effectivePool.forEach(item => { for (let i = 0; i < (rw[item.rarity] || 10); i++) weighted.push(item) })
    receivedItem = { ...weighted[Math.floor(Math.random() * weighted.length)] }
  }

  if (!receivedItem.image) {
    // Prefer exact ID lookup so special items (e.g. Premium 175k) get the right image
    receivedItem.image = REWARD_IMAGE_BY_ID[receivedItem.id]
      || getRewardImageUrl(chest.chestType || 'wood', receivedItem.type)
  }

  // Lưu kết quả vào userChest
  await updateDoc(userChestRef, { opened: true, receivedItem, openedAt: Timestamp.now() })

  // Áp dụng phần thưởng cho user
  if (receivedItem.type === 'xp') {
    await updateProfile(userId, { xp: userProfile.xp + receivedItem.value })
  } else if (receivedItem.type === 'coins') {
    await updateProfile(userId, { coins: userProfile.coins + receivedItem.value })
  } else if (receivedItem.type === 'special' && receivedItem.id === 'special_levelup') {
    await updateProfile(userId, { xp: userProfile.xp + 1000 })
  }

  return receivedItem
}

/**
 * Lấy tất cả rương của user (tự động xóa rương đã mở quá 7 ngày)
 */
export const getUserChests = async (userId: string, familyId: string): Promise<UserChest[]> => {
  const userChestsRef = collection(checkDb(), 'userChests')
  const q = query(
    userChestsRef, 
    where('userId', '==', userId),
    where('familyId', '==', familyId)
  )
  const snapshot = await getDocs(q)
  
  const now = Timestamp.now()
  const sevenDaysAgo = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000)
  
  const userChests: UserChest[] = []
  const chestsToDelete: string[] = []
  
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data()
    const userChest: UserChest = {
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
  itemPool: ChestItem[],
  familyId: string,
  chestType?: string,
  closedImageUrl?: string
): Promise<string> => {
  const chestsRef = collection(checkDb(), 'chests')
  const docRef = await addDoc(chestsRef, {
    name,
    cost,
    itemPool,
    familyId,
    ...(chestType && { chestType }),
    ...(closedImageUrl && { closedImageUrl }),
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
  itemPool: ChestItem[],
  chestType?: string,
  closedImageUrl?: string
): Promise<void> => {
  const chestRef = doc(checkDb(), 'chests', chestId)
  await updateDoc(chestRef, {
    name,
    cost,
    itemPool,
    ...(chestType && { chestType }),
    ...(closedImageUrl !== undefined && { closedImageUrl }),
  })
}

/**
 * Xóa rương (chỉ root mới có quyền)
 */
export const deleteChest = async (chestId: string): Promise<void> => {
  const chestRef = doc(checkDb(), 'chests', chestId)
  await deleteDoc(chestRef)
}

/**
 * Tạo/cập nhật 5 tầng rương mặc định cho gia đình dựa trên CHEST_TIER_CONFIGS.
 * Nếu đã tồn tại rương cùng tên → cập nhật; nếu chưa → tạo mới.
 * Chỉ root mới nên gọi hàm này.
 */
export const setupFamilyChests = async (familyId: string): Promise<void> => {
  const chestsRef = collection(checkDb(), 'chests')
  const existingSnap = await getDocs(query(chestsRef, where('familyId', '==', familyId)))
  const existingByName: Record<string, string> = {}
  existingSnap.docs.forEach(d => {
    existingByName[d.data().name] = d.id
  })

  const validNames = new Set(CHEST_TIER_CONFIGS.map(c => c.name))

  // Xóa các rương cũ không còn trong config hiện tại
  const deleteOps = existingSnap.docs
    .filter(d => !validNames.has(d.data().name))
    .map(d => deleteDoc(doc(checkDb(), 'chests', d.id)))

  // Tạo hoặc cập nhật rương theo config mới
  const upsertOps = CHEST_TIER_CONFIGS.map(config => {
    const maxPerWeek = 'maxPerWeek' in config ? (config as any).maxPerWeek as number | undefined : undefined
    const closedImageUrl = CHEST_IMAGE_URLS[config.chestType] || ''
    const existingId = existingByName[config.name]
    if (existingId) {
      const chestRef = doc(checkDb(), 'chests', existingId)
      return updateDoc(chestRef, {
        cost: config.cost, chestType: config.chestType,
        itemPool: config.itemPool, closedImageUrl,
        ...(maxPerWeek ? { maxPerWeek } : { maxPerWeek: null }),
      })
    }
    return addDoc(chestsRef, {
      name: config.name, cost: config.cost, chestType: config.chestType,
      itemPool: config.itemPool, closedImageUrl, familyId,
      createdAt: Timestamp.now(),
      ...(maxPerWeek ? { maxPerWeek } : {}),
    })
  })

  await Promise.all([...deleteOps, ...upsertOps])
}
