'use client'

import { useState } from 'react'
import { getTaskTemplates, saveTaskTemplate } from '@/lib/firebase/tasks'
import { UserProfile } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

interface CreateDefaultTemplatesProps {
  currentUserId: string
  profile: UserProfile
  onTemplatesCreated?: () => void
}

// Danh sách template việc học
const hocTemplates = [
  { title: 'Làm xong bài tập về nhà', description: 'Có thể chụp ảnh', category: 'hoc' as const, xpReward: 20, coinReward: 4 },
  { title: 'Đọc sách 15 phút', description: '', category: 'hoc' as const, xpReward: 10, coinReward: 2 },
  { title: 'Đọc sách 30 phút', description: '', category: 'hoc' as const, xpReward: 20, coinReward: 4 },
  { title: 'Viết 1 đoạn văn ngắn (5–7 câu)', description: '', category: 'hoc' as const, xpReward: 25, coinReward: 5 },
  { title: 'Luyện toán 15 phút', description: '', category: 'hoc' as const, xpReward: 10, coinReward: 2 },
  { title: 'Luyện toán 30 phút', description: '', category: 'hoc' as const, xpReward: 20, coinReward: 4 },
  { title: 'Học từ vựng mới (5 từ)', description: '', category: 'hoc' as const, xpReward: 10, coinReward: 2 },
  { title: 'Học từ vựng mới (10 từ)', description: '', category: 'hoc' as const, xpReward: 20, coinReward: 4 },
  { title: 'Xem video học tập & tóm tắt', description: '', category: 'hoc' as const, xpReward: 25, coinReward: 5 },
  { title: 'Ôn bài trước khi đi ngủ', description: '', category: 'hoc' as const, xpReward: 10, coinReward: 2 },
  { title: 'Viết chính tả / luyện chữ', description: '', category: 'hoc' as const, xpReward: 20, coinReward: 4 },
  { title: 'Hoàn thành bài tập online', description: '', category: 'hoc' as const, xpReward: 20, coinReward: 4 },
  { title: 'Tự học 1 chủ đề mới', description: '', category: 'hoc' as const, xpReward: 35, coinReward: 7 },
  { title: 'Chuẩn bị bài cho ngày mai', description: '', category: 'hoc' as const, xpReward: 10, coinReward: 2 },
  { title: 'Học tập trung 45 phút (không xao nhãng)', description: '', category: 'hoc' as const, xpReward: 40, coinReward: 8 },
]

// Danh sách template việc khác
const khacTemplates = [
  // Việc nhà
  { title: 'Dọn giường sau khi ngủ dậy', description: '', category: 'khac' as const, xpReward: 5, coinReward: 1 },
  { title: 'Gấp quần áo', description: '', category: 'khac' as const, xpReward: 15, coinReward: 3 },
  { title: 'Dọn bàn học', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Phụ giúp quét nhà', description: '', category: 'khac' as const, xpReward: 20, coinReward: 4 },
  { title: 'Rửa chén (phụ giúp)', description: '', category: 'khac' as const, xpReward: 20, coinReward: 4 },
  { title: 'Đổ rác', description: '', category: 'khac' as const, xpReward: 5, coinReward: 1 },
  // Vận động
  { title: 'Tập thể dục 10 phút', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Tập thể dục 20 phút', description: '', category: 'khac' as const, xpReward: 20, coinReward: 4 },
  { title: 'Chạy nhảy / vận động ngoài trời', description: '', category: 'khac' as const, xpReward: 20, coinReward: 4 },
  { title: 'Chơi thể thao cùng gia đình', description: '', category: 'khac' as const, xpReward: 30, coinReward: 6 },
  { title: 'Uống đủ nước trong ngày', description: '', category: 'khac' as const, xpReward: 5, coinReward: 1 },
  // Kỹ năng sống
  { title: 'Tự chuẩn bị cặp sách', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Tự mặc quần áo', description: '', category: 'khac' as const, xpReward: 5, coinReward: 1 },
  { title: 'Giúp bố/mẹ làm việc nhỏ', description: '', category: 'khac' as const, xpReward: 15, coinReward: 3 },
  { title: 'Giữ phòng gọn gàng cả ngày', description: '', category: 'khac' as const, xpReward: 30, coinReward: 6 },
  { title: 'Làm việc theo kế hoạch trong ngày', description: '', category: 'khac' as const, xpReward: 35, coinReward: 7 },
  // Sáng tạo - Tinh thần
  { title: 'Vẽ tranh / tô màu', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Làm đồ thủ công', description: '', category: 'khac' as const, xpReward: 20, coinReward: 4 },
  { title: 'Viết nhật ký 5 phút', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Kể chuyện cho bố/mẹ nghe', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Học chơi nhạc cụ 15 phút', description: '', category: 'khac' as const, xpReward: 20, coinReward: 4 },
  { title: 'Học chơi nhạc cụ 30 phút', description: '', category: 'khac' as const, xpReward: 35, coinReward: 7 },
  // Thói quen tốt
  { title: 'Đi ngủ đúng giờ', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Dậy đúng giờ', description: '', category: 'khac' as const, xpReward: 10, coinReward: 2 },
  { title: 'Không dùng thiết bị điện tử quá giờ', description: '', category: 'khac' as const, xpReward: 40, coinReward: 8 },
]

export default function CreateDefaultTemplates({ currentUserId, profile, onTemplatesCreated }: CreateDefaultTemplatesProps) {
  const { t, language } = useI18n()
  const [creating, setCreating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const handleCreateTemplates = async () => {
    if (!profile.isRoot) {
      setToast({ show: true, message: language === 'vi' 
        ? '⚠️ Chỉ tài khoản root mới có thể tạo template mặc định!'
        : '⚠️ Only root accounts can create default templates!', type: 'error' })
      return
    }

    // Tạo template trực tiếp không cần confirm
    setCreating(true)
    setProgress({ current: 0, total: hocTemplates.length + khacTemplates.length })

    try {
      // Kiểm tra template hiện có
      const existingTemplates = await getTaskTemplates(currentUserId)
      const existingTitles = new Set(existingTemplates.map(t => t.title))

      let created = 0
      let skipped = 0

      // Tạo template việc học
      for (const template of hocTemplates) {
        if (!existingTitles.has(template.title)) {
          await saveTaskTemplate(
            template.title,
            template.description,
            'daily',
            template.xpReward,
            template.coinReward,
            currentUserId,
            template.category
          )
          created++
        } else {
          skipped++
        }
        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      // Tạo template việc khác
      for (const template of khacTemplates) {
        if (!existingTitles.has(template.title)) {
          await saveTaskTemplate(
            template.title,
            template.description,
            'daily',
            template.xpReward,
            template.coinReward,
            currentUserId,
            template.category
          )
          created++
        } else {
          skipped++
        }
        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      const successMsg = language === 'vi'
        ? `✅ Hoàn thành! Đã tạo: ${created} template, Bỏ qua: ${skipped} template`
        : `✅ Completed! Created: ${created} templates, Skipped: ${skipped} templates`
      setToast({ show: true, message: successMsg, type: 'success' })

      if (onTemplatesCreated) {
        onTemplatesCreated()
      }
    } catch (error) {
      console.error('Error creating templates:', error)
      const errorMsg = language === 'vi'
        ? '❌ Lỗi khi tạo template: '
        : '❌ Error creating templates: '
      setToast({ show: true, message: errorMsg + (error as Error).message, type: 'error' })
    } finally {
      setCreating(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  if (!profile.isRoot) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-gray-800 mb-1">🚀 {t('tasks.createDefaultTemplates')}</h4>
          <p className="text-sm text-gray-600">
            {t('tasks.createDefaultTemplatesDesc')
              .replace('{count}', (hocTemplates.length + khacTemplates.length).toString())
              .replace('{study}', hocTemplates.length.toString())
              .replace('{other}', khacTemplates.length.toString())}
          </p>
        </div>
        <button
          onClick={handleCreateTemplates}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {creating ? (
            <span>
              {t('tasks.creating')} ({progress.current}/{progress.total})
            </span>
          ) : (
            t('tasks.createTemplates')
          )}
        </button>
      </div>
      {creating && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
