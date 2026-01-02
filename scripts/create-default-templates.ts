/**
 * Script để tạo các template nhiệm vụ mặc định
 * Chạy script này một lần để tạo tất cả template
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'

// Cấu hình Firebase - cần import từ .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface TemplateData {
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  category: 'hoc' | 'khac'
  xpReward: number
  coinReward: number
  createdBy: string // User ID của root
}

// Danh sách template việc học
const hocTemplates: Omit<TemplateData, 'createdBy' | 'type'>[] = [
  { title: 'Làm xong bài tập về nhà', description: 'Có thể chụp ảnh', category: 'hoc', xpReward: 20, coinReward: 4 },
  { title: 'Đọc sách 15 phút', description: '', category: 'hoc', xpReward: 10, coinReward: 2 },
  { title: 'Đọc sách 30 phút', description: '', category: 'hoc', xpReward: 20, coinReward: 4 },
  { title: 'Viết 1 đoạn văn ngắn (5–7 câu)', description: '', category: 'hoc', xpReward: 25, coinReward: 5 },
  { title: 'Luyện toán 15 phút', description: '', category: 'hoc', xpReward: 10, coinReward: 2 },
  { title: 'Luyện toán 30 phút', description: '', category: 'hoc', xpReward: 20, coinReward: 4 },
  { title: 'Học từ vựng mới (5 từ)', description: '', category: 'hoc', xpReward: 10, coinReward: 2 },
  { title: 'Học từ vựng mới (10 từ)', description: '', category: 'hoc', xpReward: 20, coinReward: 4 },
  { title: 'Xem video học tập & tóm tắt', description: '', category: 'hoc', xpReward: 25, coinReward: 5 },
  { title: 'Ôn bài trước khi đi ngủ', description: '', category: 'hoc', xpReward: 10, coinReward: 2 },
  { title: 'Viết chính tả / luyện chữ', description: '', category: 'hoc', xpReward: 20, coinReward: 4 },
  { title: 'Hoàn thành bài tập online', description: '', category: 'hoc', xpReward: 20, coinReward: 4 },
  { title: 'Tự học 1 chủ đề mới', description: '', category: 'hoc', xpReward: 35, coinReward: 7 },
  { title: 'Chuẩn bị bài cho ngày mai', description: '', category: 'hoc', xpReward: 10, coinReward: 2 },
  { title: 'Học tập trung 45 phút (không xao nhãng)', description: '', category: 'hoc', xpReward: 40, coinReward: 8 },
]

// Danh sách template việc khác
const khacTemplates: Omit<TemplateData, 'createdBy' | 'type'>[] = [
  // Việc nhà
  { title: 'Dọn giường sau khi ngủ dậy', description: '', category: 'khac', xpReward: 5, coinReward: 1 },
  { title: 'Gấp quần áo', description: '', category: 'khac', xpReward: 15, coinReward: 3 },
  { title: 'Dọn bàn học', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Phụ giúp quét nhà', description: '', category: 'khac', xpReward: 20, coinReward: 4 },
  { title: 'Rửa chén (phụ giúp)', description: '', category: 'khac', xpReward: 20, coinReward: 4 },
  { title: 'Đổ rác', description: '', category: 'khac', xpReward: 5, coinReward: 1 },
  // Vận động
  { title: 'Tập thể dục 10 phút', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Tập thể dục 20 phút', description: '', category: 'khac', xpReward: 20, coinReward: 4 },
  { title: 'Chạy nhảy / vận động ngoài trời', description: '', category: 'khac', xpReward: 20, coinReward: 4 },
  { title: 'Chơi thể thao cùng gia đình', description: '', category: 'khac', xpReward: 30, coinReward: 6 },
  { title: 'Uống đủ nước trong ngày', description: '', category: 'khac', xpReward: 5, coinReward: 1 },
  // Kỹ năng sống
  { title: 'Tự chuẩn bị cặp sách', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Tự mặc quần áo', description: '', category: 'khac', xpReward: 5, coinReward: 1 },
  { title: 'Giúp bố/mẹ làm việc nhỏ', description: '', category: 'khac', xpReward: 15, coinReward: 3 },
  { title: 'Giữ phòng gọn gàng cả ngày', description: '', category: 'khac', xpReward: 30, coinReward: 6 },
  { title: 'Làm việc theo kế hoạch trong ngày', description: '', category: 'khac', xpReward: 35, coinReward: 7 },
  // Sáng tạo - Tinh thần
  { title: 'Vẽ tranh / tô màu', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Làm đồ thủ công', description: '', category: 'khac', xpReward: 20, coinReward: 4 },
  { title: 'Viết nhật ký 5 phút', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Kể chuyện cho bố/mẹ nghe', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Học chơi nhạc cụ 15 phút', description: '', category: 'khac', xpReward: 20, coinReward: 4 },
  { title: 'Học chơi nhạc cụ 30 phút', description: '', category: 'khac', xpReward: 35, coinReward: 7 },
  // Thói quen tốt
  { title: 'Đi ngủ đúng giờ', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Dậy đúng giờ', description: '', category: 'khac', xpReward: 10, coinReward: 2 },
  { title: 'Không dùng thiết bị điện tử quá giờ', description: '', category: 'khac', xpReward: 40, coinReward: 8 },
]

async function createTemplates(userId: string) {
  const templatesRef = collection(db, 'taskTemplates')
  
  // Kiểm tra xem đã có template chưa
  const q = query(templatesRef, where('createdBy', '==', userId))
  const existingTemplates = await getDocs(q)
  
  if (existingTemplates.size > 0) {
    console.log(`⚠️ Đã có ${existingTemplates.size} template. Bỏ qua việc tạo mới.`)
    console.log('Nếu muốn tạo lại, hãy xóa các template cũ trước.')
    return
  }

  console.log('🚀 Bắt đầu tạo template...')
  
  let count = 0
  
  // Tạo template việc học
  for (const template of hocTemplates) {
    await addDoc(templatesRef, {
      ...template,
      type: 'daily',
      createdBy: userId,
      createdAt: Timestamp.now(),
    })
    count++
    console.log(`✅ Đã tạo: ${template.title}`)
  }
  
  // Tạo template việc khác
  for (const template of khacTemplates) {
    await addDoc(templatesRef, {
      ...template,
      type: 'daily',
      createdBy: userId,
      createdAt: Timestamp.now(),
    })
    count++
    console.log(`✅ Đã tạo: ${template.title}`)
  }
  
  console.log(`\n🎉 Hoàn thành! Đã tạo ${count} template.`)
  console.log(`- ${hocTemplates.length} template việc học`)
  console.log(`- ${khacTemplates.length} template việc khác`)
}

// Export để có thể import và sử dụng
export { createTemplates, hocTemplates, khacTemplates }

// Nếu chạy trực tiếp (node script)
if (require.main === module) {
  const userId = process.argv[2]
  if (!userId) {
    console.error('❌ Vui lòng cung cấp User ID của root account')
    console.log('Cách sử dụng: ts-node scripts/create-default-templates.ts <USER_ID>')
    process.exit(1)
  }
  
  createTemplates(userId)
    .then(() => {
      console.log('✅ Script hoàn thành!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Lỗi:', error)
      process.exit(1)
    })
}
