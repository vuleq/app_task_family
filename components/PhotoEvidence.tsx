'use client'

import { useState, useRef } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import Toast from './Toast'

interface PhotoEvidenceProps {
  taskId: string
  currentEvidence?: string
  onEvidenceUploaded?: () => void
}

export default function PhotoEvidence({ taskId, currentEvidence, onEvidenceUploaded }: PhotoEvidenceProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload ảnh lên Cloudinary
      const imageUrl = await uploadImageToCloudinary(file, 'task-evidence')
      
      // Lưu URL vào task
      await updateDoc(doc(db, 'tasks', taskId), {
        evidence: imageUrl
      })

      setToast({ show: true, message: 'Đã upload ảnh bằng chứng thành công!', type: 'success' })
      if (onEvidenceUploaded) onEvidenceUploaded()
    } catch (error: any) {
      console.error('Error uploading evidence:', error)
      setToast({ show: true, message: error.message || 'Lỗi khi upload ảnh bằng chứng', type: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-3">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <h4 className="font-medium text-gray-700">📸 Ảnh bằng chứng</h4>
      
      {currentEvidence ? (
        <div className="space-y-2">
          <img
            src={currentEvidence}
            alt="Evidence"
            className="w-full max-w-md rounded-lg border border-gray-200"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Thay đổi ảnh
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
          >
            {uploading ? 'Đang upload...' : 'Chụp/Upload ảnh bằng chứng'}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}

