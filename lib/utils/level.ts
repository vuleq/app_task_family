/**
 * Utility functions for level calculation and asset management
 */

// Công thức tính level từ XP
// Level 1: 0-99 XP
// Level 2: 100-299 XP
// Level 3: 300-599 XP
// Level 4: 600-999 XP
// Level 5: 1000-1499 XP
// ... và tiếp tục tăng dần

export const calculateLevel = (xp: number): number => {
  if (xp < 0) return 1
  
  // Công thức đơn giản: mỗi level cần thêm 100 XP
  // Level 1: 0-99 XP
  // Level 2: 100-199 XP
  // Level 3: 200-299 XP
  // Level 4: 300-399 XP
  // Level 5: 400-499 XP
  // ...
  // Level N: (N-1)*100 đến N*100-1 XP
  
  if (xp < 100) return 1
  
  // Level = floor(xp / 100) + 1
  return Math.floor(xp / 100) + 1
}

export const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0
  
  // Level N cần (N-1) * 100 XP
  return (level - 1) * 100
}

export const getXPForNextLevel = (currentLevel: number): number => {
  // XP cần để lên level tiếp theo
  return currentLevel * 100
}

export const getXPProgress = (currentXP: number): { current: number; next: number; percentage: number } => {
  const currentLevel = calculateLevel(currentXP)
  const xpForCurrentLevel = getXPForLevel(currentLevel)
  const xpForNextLevel = getXPForLevel(currentLevel + 1)
  
  const current = currentXP - xpForCurrentLevel
  const next = xpForNextLevel - xpForCurrentLevel
  const percentage = next > 0 ? (current / next) * 100 : 100
  
  return { current, next, percentage }
}

// Danh sách các level có asset
const AVAILABLE_LEVELS = [1, 5, 10, 15, 25, 40, 55, 70, 100]

/**
 * Lấy level asset gần nhất (không vượt quá level hiện tại)
 * Ví dụ: level 7 sẽ dùng asset của level 5
 */
export const getAssetLevel = (currentLevel: number): number => {
  // Tìm level asset lớn nhất không vượt quá currentLevel
  let assetLevel = 1
  
  for (const level of AVAILABLE_LEVELS) {
    if (level <= currentLevel) {
      assetLevel = level
    } else {
      break
    }
  }
  
  return assetLevel
}

/**
 * Lấy đường dẫn asset dựa trên level và type
 */
export const getAssetPath = (level: number, type: 'outfit' | 'bg' | 'pet' | 'character' | 'base'): string | null => {
  const assetLevel = getAssetLevel(level)
  
  // Level 1 không có pet
  if (type === 'pet' && assetLevel < 5) {
    return null
  }
  
  // Kiểm tra file có tồn tại không (dựa trên naming convention)
  // Format: level{X}_outfit.png, level{X}_bg.png, level{X}_pet.png, level{X}_character.png, level{X}_base.png
  // File nằm trong public/pic-avatar/
  
  // Thử tìm file character hoặc base trước
  if (type === 'character' || type === 'base') {
    // Thử tìm level{X}_character.png hoặc level{X}_base.png
    const characterPath = `/pic-avatar/level${assetLevel}_character.png`
    const basePath = `/pic-avatar/level${assetLevel}_base.png`
    // Nếu không có, có thể dùng avatar mặc định
    return characterPath // Hoặc basePath, tùy file nào tồn tại
  }
  
  return `/pic-avatar/level${assetLevel}_${type}.png`
}

/**
 * Lấy tất cả asset paths cho một level
 * @param level - Level hiện tại
 * @param characterAvatar - Số avatar (1-7), nếu không có sẽ dùng avatar1
 */
export const getCharacterAssets = (level: number, characterAvatar?: number): {
  outfit: string | null
  background: string | null
  pet: string | null
  character: string | null
  base: string | null
  face: string | null // Thêm face layer (mặt từ avatar1-7)
} => {
  // Lấy avatar number (1-7), mặc định là 1
  const avatarNum = characterAvatar && characterAvatar >= 1 && characterAvatar <= 7 
    ? characterAvatar 
    : 1
  
  return {
    outfit: getAssetPath(level, 'outfit'),
    background: getAssetPath(level, 'bg'),
    pet: getAssetPath(level, 'pet'),
    base: '/pic-avatar/avatarbase.png', // Body base chung cho tất cả
    face: `/pic-avatar/avatar${avatarNum}.png`, // Mặt từ avatar1-7
    character: `/pic-avatar/avatar${avatarNum}.png`, // Fallback: dùng avatar đầy đủ nếu không có base
  }
}
