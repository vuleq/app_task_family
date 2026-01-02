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
  eager?: Array<{
    secure_url: string
    format: string
  }>
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

  // Tạo FormData với optimization parameters
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)
  
  // Tự động optimize ảnh: compress, convert WebP, quality tốt
  // Eager transformation: tạo version đã optimize ngay khi upload
  formData.append('eager', 'f_auto,q_auto:good')
  // f_auto: tự động chọn format tốt nhất (WebP nếu browser hỗ trợ)
  // q_auto:good: tự động điều chỉnh quality để cân bằng chất lượng và dung lượng (thường ~80%)

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
    
    // Nếu có eager transformation (version đã optimize), dùng nó
    // Nếu không, dùng secure_url và thêm transformation vào URL
    if (data.eager && data.eager.length > 0) {
      return data.eager[0].secure_url
    }
    
    // Fallback: thêm transformation vào URL để tự động optimize khi load
    // f_auto: tự động chọn format tốt nhất (WebP nếu browser hỗ trợ)
    // q_auto:good: tự động điều chỉnh quality (~80%)
    return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto:good/')
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    throw new Error(error.message || 'Lỗi khi upload ảnh')
  }
}

/**
 * Upload video lên Cloudinary
 * @param file - File video cần upload
 * @param folder - Thư mục lưu trữ (mặc định: 'family-tasks')
 * @returns URL của video đã upload
 */
export const uploadVideoToCloudinary = async (
  file: File,
  folder: string = 'family-tasks'
): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào .env.local'
    )
  }

  // Kiểm tra kích thước file (giới hạn 50MB cho video)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    throw new Error('Video quá lớn. Vui lòng chọn video nhỏ hơn 50MB')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)
  formData.append('resource_type', 'video') // Quan trọng: chỉ định đây là video
  
  // Optimize video: compress, quality tốt
  formData.append('eager', 'q_auto:good')
  // q_auto:good: tự động điều chỉnh quality video

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Lỗi khi upload video lên Cloudinary')
    }

    const data: CloudinaryUploadResponse = await response.json()
    
    // Nếu có eager transformation (version đã optimize), dùng nó
    if (data.eager && data.eager.length > 0) {
      return data.eager[0].secure_url
    }
    
    // Fallback: thêm transformation vào URL
    return data.secure_url.replace('/upload/', '/upload/q_auto:good/')
  } catch (error: any) {
    console.error('Cloudinary video upload error:', error)
    throw new Error(error.message || 'Lỗi khi upload video')
  }
}

/**
 * Upload ảnh/video cho chest (rương)
 * @param file - File ảnh hoặc video
 * @param chestId - ID của rương
 * @param type - Loại file: 'closed' (ảnh rương đóng), 'opening' (animation/video khi mở), 'item' (ảnh item)
 * @param itemId - ID của item (chỉ cần khi type = 'item')
 * @returns URL của file đã upload
 */
export const uploadChestMedia = async (
  file: File,
  chestId: string,
  type: 'closed' | 'opening' | 'item',
  itemId?: string
): Promise<string> => {
  // Xác định folder dựa trên type
  let folder = `family-tasks/chests/${chestId}`
  if (type === 'item' && itemId) {
    folder = `family-tasks/chests/${chestId}/items`
  }

  // Kiểm tra xem là video hay image
  const isVideo = file.type.startsWith('video/')
  
  if (isVideo) {
    return await uploadVideoToCloudinary(file, folder)
  } else {
    return await uploadImageToCloudinary(file, folder)
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

