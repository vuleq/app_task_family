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
 * Lấy tất cả asset paths cho một level với naming convention mới
 * @param level - Level hiện tại
 * @param characterBase - Avatar cơ bản ban đầu: 'nam1', 'nam2', 'nu1', 'nu2'
 * @param gender - Giới tính: 'nam' hoặc 'nu' (tự động từ characterBase nếu không có)
 * @param profession - Nghề nghiệp: 'bs', 'ch', 'cs', etc.
 */
export const getCharacterAssets = (
  level: number, 
  characterBase?: 'nam1' | 'nam2' | 'nu1' | 'nu2',
  gender?: 'nam' | 'nu',
  profession?: string
): {
  outfit: string | null
  background: string | null
  pet: string | null
  character: string | null
  base: string | null
  face: string | null
} => {
  // Tự động suy ra gender từ characterBase nếu chưa có
  let finalGender = gender
  if (!finalGender && characterBase) {
    if (characterBase.startsWith('nam')) {
      finalGender = 'nam'
    } else if (characterBase.startsWith('nu')) {
      finalGender = 'nu'
    }
  }
  
  // Level 1-4: Luôn dùng file cơ bản (chưa được chọn nghề)
  // Level >= 5: Nếu đã chọn profession thì dùng file theo nghề, nếu chưa thì dùng file cơ bản
  if (level >= 5 && finalGender && profession) {
    // Level 5+: Đã chọn nghề → dùng file theo nghề
    const assetLevel = getAssetLevel(level)
    const characterPath = `/pic-avatar/${finalGender}_${profession}_level${assetLevel}.png`
    
    return {
      outfit: null,
      background: null,
      pet: null,
      base: null,
      face: null,
      character: characterPath, // File chính: nam_bs_level5.png, nu_ch_level10.png, etc.
    }
  }
  
  // Level 1-4 hoặc Level >= 5 nhưng chưa chọn nghề: dùng file avatar cơ bản
  // Format: nam1.png, nam2.png, nu1.png, nu2.png
  if (characterBase) {
    return {
      outfit: null,
      background: null,
      pet: null,
      base: null,
      face: null,
      character: `/pic-avatar/${characterBase}.png`, // File cơ bản: nam1.png, nu1.png, etc.
    }
  }
  
  // Fallback: dùng naming convention cũ (backward compatible)
  return {
    outfit: getAssetPath(level, 'outfit'),
    background: getAssetPath(level, 'bg'),
    pet: getAssetPath(level, 'pet'),
    base: '/pic-avatar/avatarbase.png',
    face: '/pic-avatar/avatar1.png',
    character: '/pic-avatar/avatar1.png',
  }
}
