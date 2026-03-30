'use client'

import { useState, useRef } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { uploadImageToCloudinary, uploadVideoToCloudinary } from '@/lib/cloudinary'
import Toast from './Toast'
import { useI18n } from '@/lib/i18n/context'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

interface PhotoEvidenceProps {
  taskId: string
  currentEvidence?: string
  onEvidenceUploaded?: () => void
}

export default function PhotoEvidence({ taskId, currentEvidence, onEvidenceUploaded }: PhotoEvidenceProps) {
  const { t, language } = useI18n()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  // Compress video xuống 720p trước khi upload
  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)
      video.muted = true // Cần mute để có thể play programmatically
      video.playsInline = true
      
      // Variables để cleanup
      let animationFrameId: number | null = null
      let timeout: NodeJS.Timeout | null = null
      let mediaRecorder: MediaRecorder | null = null
      const chunks: Blob[] = []

      const cleanup = () => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        URL.revokeObjectURL(video.src)
      }

      video.onloadedmetadata = () => {
        // Tính toán kích thước để giữ tỷ lệ và giới hạn chiều cao 720px
        const maxHeight = 720
        const aspectRatio = video.videoWidth / video.videoHeight
        let targetWidth = video.videoWidth
        let targetHeight = video.videoHeight

        if (targetHeight <= maxHeight) {
          // Video đã nhỏ hơn hoặc bằng 720p, không cần compress
          cleanup()
          resolve(file)
          return
        }

        targetHeight = maxHeight
        targetWidth = Math.round(targetHeight * aspectRatio)
        // Đảm bảo width là số chẵn (yêu cầu của codec)
        if (targetWidth % 2 !== 0) targetWidth += 1

        // Tạo canvas để vẽ video với resolution mới
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cleanup()
          reject(new Error('Không thể tạo canvas context'))
          return
        }

        canvas.width = targetWidth
        canvas.height = targetHeight

        // Sử dụng canvas.captureStream() để tạo video stream với resolution mới
        const stream = canvas.captureStream(30) // 30 FPS
        
        // Tạo MediaRecorder
        const mimeTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ]
        
        let selectedMimeType = 'video/webm'
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType
            break
          }
        }

        mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 2500000, // 2.5 Mbps
        })

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data)
          }
        }

        mediaRecorder.onerror = () => {
          cleanup()
          reject(new Error('Lỗi khi record video'))
        }

        mediaRecorder.onstop = () => {
          cleanup()
          const blob = new Blob(chunks, { type: selectedMimeType })
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
            type: blob.type,
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        }

        // Vẽ video lên canvas và record
        const drawFrame = () => {
          if (video.ended || video.paused) {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop()
            }
            if (animationFrameId !== null) {
              cancelAnimationFrame(animationFrameId)
              animationFrameId = null
            }
            return
          }
          
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
          animationFrameId = requestAnimationFrame(drawFrame)
        }

        video.onloadeddata = () => {
          if (!mediaRecorder) return
          
          // Bắt đầu record
          mediaRecorder.start()
          
          // Bắt đầu vẽ và play video
          video.play().catch((err) => {
            console.error('Error playing video:', err)
            if (mediaRecorder) {
              mediaRecorder.stop()
            }
            cleanup()
            reject(new Error('Không thể play video'))
          })
          
          drawFrame()
        }

        // Timeout sau 60 giây
        timeout = setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
          video.pause()
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
          }
        }, 60000)

        video.onended = () => {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
          }
        }

        video.onerror = () => {
          cleanup()
          reject(new Error('Lỗi khi load video'))
        }

        video.load()
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('Lỗi khi load video metadata'))
      }
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      let fileToUpload = file
      let isVideo = false

      // Kiểm tra xem là video hay image
      if (file.type.startsWith('video/')) {
        isVideo = true
        setToast({ show: true, message: 'Đang nén video xuống 720p...', type: 'info' })
        
        // Compress video xuống 720p
        try {
          fileToUpload = await compressVideo(file)
        } catch (compressError: any) {
          console.warn('Lỗi khi compress video, upload video gốc:', compressError)
          // Nếu compress thất bại, upload video gốc
          fileToUpload = file
        }
      }

      // Upload lên Cloudinary
      let mediaUrl: string
      if (isVideo) {
        setToast({ show: true, message: 'Đang upload video...', type: 'info' })
        mediaUrl = await uploadVideoToCloudinary(fileToUpload, 'task-evidence')
      } else {
        mediaUrl = await uploadImageToCloudinary(fileToUpload, 'task-evidence')
      }
      
      // Lưu URL vào task
      await updateDoc(doc(checkDb(), 'tasks', taskId), {
        evidence: mediaUrl
      })

      setToast({ 
        show: true, 
        message: isVideo ? 'Đã upload video bằng chứng thành công!' : 'Đã upload ảnh bằng chứng thành công!', 
        type: 'success' 
      })
      if (onEvidenceUploaded) onEvidenceUploaded()
    } catch (error: any) {
      console.error('Error uploading evidence:', error)
      setToast({ show: true, message: error.message || 'Lỗi khi upload bằng chứng', type: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4 kid-card p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-soft">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl animate-bounce-slow">📸</span>
        <h4 className="font-black text-indigo-900 uppercase tracking-tight">{t('tasks.evidence') || 'Ảnh/Video bằng chứng'}</h4>
      </div>
      
      {currentEvidence ? (
        <div className="space-y-4 animate-bounce-in">
          <div className="relative group rounded-3xl overflow-hidden border-4 border-white shadow-kid aspect-video bg-indigo-100/50 flex items-center justify-center">
            {currentEvidence.includes('video') || currentEvidence.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={currentEvidence}
                controls
                className="w-full h-full object-cover"
              >
                Trình duyệt của bạn không hỗ trợ video tag.
              </video>
            ) : (
              <img
                src={currentEvidence}
                alt="Evidence"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
               <span className="text-white text-xs font-black bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">✨ {language === 'vi' ? 'BẰNG CHỨNG' : 'EVIDENCE'}</span>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-playful w-full py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl font-black text-sm shadow-soft hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            🔄 {t('common.change') || 'Thay đổi'}
          </button>
        </div>
      ) : (
        <div className="animate-pulse-slow">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-playful w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-kid hover:bg-indigo-700 active:scale-95 transition-all flex flex-col items-center gap-2"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{language === 'vi' ? 'ĐANG TẢI...' : 'UPLOADING...'}</span>
              </div>
            ) : (
              <>
                <span className="text-3xl">✨</span>
                <span>{t('tasks.uploadEvidence') || 'Chụp/Upload bằng chứng'}</span>
              </>
            )}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
      />
      <div className="text-[10px] text-center font-bold text-indigo-300 uppercase tracking-widest mt-2">
        {language === 'vi' ? 'Định dạng hỗ trợ: Ảnh hoặc Video' : 'Supported: Photo or Video'}
      </div>
    </div>
  )
}
