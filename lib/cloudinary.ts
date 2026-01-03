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
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim()

  // Log để debug (chỉ log trong development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Cloudinary Config]', {
      cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : 'MISSING',
      uploadPreset: uploadPreset ? `${uploadPreset.substring(0, 4)}...` : 'MISSING',
      hasCloudName: !!cloudName,
      hasUploadPreset: !!uploadPreset,
    })
  }

  if (!cloudName || !uploadPreset) {
    const missingVars = []
    if (!cloudName) missingVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
    if (!uploadPreset) missingVars.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
    
    throw new Error(
      `Cloudinary chưa được cấu hình. Thiếu biến: ${missingVars.join(', ')}\n` +
      `Vui lòng thêm vào Vercel Dashboard → Settings → Environment Variables\n` +
      `Sau đó redeploy để áp dụng thay đổi.`
    )
  }

  // Kiểm tra file type - hỗ trợ HEIC/HEIF từ iPhone
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
  ]
  
  // Kiểm tra extension nếu type không rõ (một số browser không nhận diện HEIC)
  const fileName = file.name.toLowerCase()
  const hasValidExtension = fileName.endsWith('.jpg') || 
                             fileName.endsWith('.jpeg') || 
                             fileName.endsWith('.png') || 
                             fileName.endsWith('.gif') || 
                             fileName.endsWith('.webp') ||
                             fileName.endsWith('.heic') ||
                             fileName.endsWith('.heif')
  
  if (!allowedTypes.includes(file.type) && !hasValidExtension) {
    throw new Error(
      `Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, GIF, WebP, hoặc HEIC. ` +
      `File hiện tại: ${file.type || 'unknown'}`
    )
  }

  // Kiểm tra kích thước file (giới hạn 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    throw new Error(
      `Ảnh quá lớn (${sizeInMB}MB). Vui lòng chọn ảnh nhỏ hơn 10MB. ` +
      `Bạn có thể nén ảnh trước khi upload.`
    )
  }

  // Tạo FormData với optimization parameters
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)
  
  // LƯU Ý: Với unsigned upload preset, KHÔNG được dùng 'eager' parameter
  // Thay vào đó, chúng ta sẽ thêm transformation vào URL sau khi upload
  // Eager transformation chỉ dùng được với signed upload preset

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
      let errorMessage = 'Lỗi khi upload ảnh lên Cloudinary'
      
      try {
        const error = await response.json()
        errorMessage = error.error?.message || errorMessage
        
        // Log chi tiết lỗi để debug
        console.error('[Cloudinary Upload Error]', {
          status: response.status,
          statusText: response.statusText,
          error: error,
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
          },
        })
      } catch (parseError) {
        // Nếu không parse được JSON, lấy text
        const textError = await response.text()
        console.error('[Cloudinary Upload Error - Text]', {
          status: response.status,
          statusText: response.statusText,
          text: textError,
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
          },
        })
        errorMessage = textError || errorMessage
      }
      
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
      
      // Thông báo lỗi chi tiết hơn
      throw new Error(
        `${errorMessage}\n` +
        `File: ${file.name}\n` +
        `Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB\n` +
        `Type: ${file.type || 'unknown'}`
      )
    }

    const data: CloudinaryUploadResponse = await response.json()
    
    // Với unsigned upload preset, không có eager transformation
    // Thêm transformation vào URL để tự động optimize khi load
    // f_auto: tự động chọn format tốt nhất (WebP nếu browser hỗ trợ)
    // q_auto:good: tự động điều chỉnh quality (~80%)
    // w_auto: tự động resize theo viewport (tùy chọn)
    if (data.secure_url) {
      // Thêm transformation vào URL để optimize
      return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto:good/')
    }
    
    // Fallback (không nên xảy ra)
    throw new Error('Không nhận được URL từ Cloudinary')
  } catch (error: any) {
    console.error('[Cloudinary Upload Error - Catch]', {
      error: error,
      message: error.message,
      stack: error.stack,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    })
    
    // Cải thiện thông báo lỗi
    if (error.message) {
      throw error // Giữ nguyên error message đã được format
    }
    
    // Nếu là network error
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      throw new Error(
        'Không thể kết nối đến Cloudinary. Vui lòng:\n' +
        '1. Kiểm tra kết nối internet\n' +
        '2. Thử lại sau vài giây\n' +
        '3. Nếu vẫn lỗi, vui lòng liên hệ hỗ trợ'
      )
    }
    
    throw new Error(error.message || 'Lỗi khi upload ảnh. Vui lòng thử lại.')
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

