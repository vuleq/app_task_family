/**
 * Cloudinary Image Upload Utility
 * 
 * Hướng dẫn setup:
 * 1. Tạo tài khoản tại: https://cloudinary.com/
 * 2. Vào Dashboard → Settings → Upload
 * 3. Tạo Upload Preset (nếu chưa có)
 * 4. Lấy thông tin: Cloud name, API Key, API Secret
 * 5. Thêm vào .env.local
 */

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
}

/**
 * Upload ảnh lên Cloudinary
 * @param file - File ảnh cần upload
 * @param folder - Thư mục lưu trữ (mặc định: 'family-tasks')
 * @returns URL của ảnh đã upload
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = 'family-tasks'
): Promise<string> => {
  // Kiểm tra biến môi trường
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào .env.local'
    )
  }

  // Kiểm tra kích thước file (giới hạn 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB')
  }

  // Tạo FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  try {
    // Upload lên Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      const errorMessage = error.error?.message || 'Lỗi khi upload ảnh lên Cloudinary'
      
      // Cải thiện thông báo lỗi cho "Upload preset not found"
      if (errorMessage.includes('preset') || errorMessage.includes('Preset')) {
        throw new Error(
          'Upload preset không tìm thấy. Vui lòng:\n' +
          '1. Vào Cloudinary Dashboard → Settings → Upload\n' +
          '2. Tạo Upload Preset mới (Signing mode: Unsigned)\n' +
          '3. Copy tên preset vào .env.local: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET\n' +
          '4. Restart dev server\n' +
          'Xem hướng dẫn chi tiết: CLOUDINARY_SETUP.md'
        )
      }
      
      throw new Error(errorMessage)
    }

    const data: CloudinaryUploadResponse = await response.json()
    return data.secure_url
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    throw new Error(error.message || 'Lỗi khi upload ảnh')
  }
}

/**
 * Xóa ảnh khỏi Cloudinary (tùy chọn)
 * @param publicId - Public ID của ảnh trong Cloudinary
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary credentials chưa đầy đủ, không thể xóa ảnh')
    return
  }

  // Note: Xóa ảnh cần server-side API, không thể làm từ client
  // Cần tạo API route trong Next.js để xử lý việc này
  console.warn('Delete image feature cần được implement qua API route')
}

