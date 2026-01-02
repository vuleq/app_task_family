/**
 * Script để khởi tạo default chests trong database
 * Chạy script này một lần để tạo các rương mặc định
 * 
 * Usage: 
 * - Tạo file này trong thư mục scripts/
 * - Hoặc gọi function createDefaultChests() từ console hoặc một component admin
 */

import { createDefaultChests } from '@/lib/firebase/chest'

// Chạy function này một lần để khởi tạo chests
export const initChests = async () => {
  try {
    await createDefaultChests()
    console.log('✅ Default chests initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing chests:', error)
  }
}

// Nếu chạy trực tiếp (ví dụ: node scripts/init-chests.ts)
if (require.main === module) {
  initChests()
}
