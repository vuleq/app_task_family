# 📸 Giải pháp thay thế cho Upload Hình ảnh

Tài liệu này liệt kê các giải pháp thay thế cho Firebase Storage khi upload hình ảnh.

## 🎯 Tại sao cần giải pháp thay thế?

Firebase Storage yêu cầu bật billing account (Blaze plan) để sử dụng. Nếu bạn chưa muốn bật billing, có thể sử dụng các giải pháp sau:

---

## 1. 🆓 Cloudinary (Khuyến nghị - Free tier rộng rãi)

### Ưu điểm:
- ✅ Free tier: 25GB storage, 25GB bandwidth/tháng
- ✅ Tự động resize, optimize ảnh
- ✅ CDN toàn cầu
- ✅ Dễ tích hợp
- ✅ Không cần billing account

### Cách setup:

#### Bước 1: Tạo tài khoản
1. Truy cập: https://cloudinary.com/
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard → lấy thông tin:
   - Cloud name
   - API Key
   - API Secret

#### Bước 2: Cài đặt package
```bash
npm install cloudinary
```

#### Bước 3: Tạo file `.env.local`
Thêm vào file `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Bước 4: Tạo utility file
Tạo file `lib/cloudinary.ts`:
```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImageToCloudinary = async (file: File, folder: string = 'family-tasks'): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'your-upload-preset') // Tạo trong Cloudinary Dashboard
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()
  return data.secure_url
}
```

#### Bước 5: Sử dụng trong ProfilePage
```typescript
import { uploadImageToCloudinary } from '@/lib/cloudinary'

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setUploading(true)
  try {
    const url = await uploadImageToCloudinary(file, 'avatars')
    setAvatar(url)
    await updateProfile(profile.id, { avatar: url })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Lỗi khi tải ảnh đại diện')
  } finally {
    setUploading(false)
  }
}
```

---

## 2. 🖼️ ImgBB (Đơn giản nhất - Free)

### Ưu điểm:
- ✅ Hoàn toàn miễn phí
- ✅ Không cần đăng ký (hoặc đăng ký để có API key)
- ✅ Upload trực tiếp từ client
- ✅ Không giới hạn storage

### Cách setup:

#### Bước 1: Lấy API key
1. Truy cập: https://api.imgbb.com/
2. Đăng ký tài khoản (miễn phí)
3. Lấy API key

#### Bước 2: Thêm vào `.env.local`
```env
NEXT_PUBLIC_IMGBB_API_KEY=your-api-key
```

#### Bước 3: Tạo utility function
Tạo file `lib/imgbb.ts`:
```typescript
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()
  if (data.success) {
    return data.data.url
  }
  throw new Error('Upload failed')
}
```

#### Bước 4: Sử dụng
```typescript
import { uploadImageToImgBB } from '@/lib/imgbb'

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setUploading(true)
  try {
    const url = await uploadImageToImgBB(file)
    setAvatar(url)
    await updateProfile(profile.id, { avatar: url })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Lỗi khi tải ảnh đại diện')
  } finally {
    setUploading(false)
  }
}
```

---

## 3. 📦 Base64 (Lưu trực tiếp trong Firestore)

### Ưu điểm:
- ✅ Không cần service bên ngoài
- ✅ Hoàn toàn miễn phí
- ✅ Không cần setup

### Nhược điểm:
- ❌ Firestore có giới hạn 1MB/document
- ❌ Ảnh lớn sẽ tốn nhiều storage
- ❌ Không tối ưu cho ảnh lớn

### Cách sử dụng:
```typescript
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Kiểm tra kích thước (giới hạn 500KB)
  if (file.size > 500 * 1024) {
    alert('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 500KB')
    return
  }

  setUploading(true)
  try {
    // Convert sang Base64
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      await updateProfile(profile.id, { avatar: base64String })
      setAvatar(base64String)
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Lỗi khi tải ảnh đại diện')
  } finally {
    setUploading(false)
  }
}
```

---

## 4. 🗄️ Supabase Storage (Free tier tốt)

### Ưu điểm:
- ✅ Free tier: 1GB storage, 2GB bandwidth/tháng
- ✅ Tích hợp tốt với Next.js
- ✅ Có authentication built-in

### Cách setup:
1. Tạo tài khoản tại: https://supabase.com/
2. Tạo project mới
3. Vào Storage → tạo bucket
4. Cài đặt: `npm install @supabase/supabase-js`
5. Setup tương tự Firebase Storage

---

## 5. ☁️ AWS S3 (Nếu đã có AWS account)

### Ưu điểm:
- ✅ Free tier: 5GB storage, 20,000 GET requests/tháng
- ✅ Rất mạnh mẽ và linh hoạt

### Nhược điểm:
- ❌ Setup phức tạp hơn
- ❌ Cần AWS account

---

## 📊 So sánh nhanh

| Giải pháp | Free Tier | Độ khó setup | Khuyến nghị |
|-----------|-----------|--------------|-------------|
| **Cloudinary** | 25GB | ⭐⭐ Dễ | ✅✅✅ Tốt nhất |
| **ImgBB** | Unlimited | ⭐ Rất dễ | ✅✅ Tốt |
| **Base64** | Phụ thuộc Firestore | ⭐ Rất dễ | ✅ Chỉ cho ảnh nhỏ |
| **Supabase** | 1GB | ⭐⭐ Dễ | ✅✅ Tốt |
| **AWS S3** | 5GB | ⭐⭐⭐ Khó | ✅ Nếu đã có AWS |

---

## 🎯 Khuyến nghị

### Cho app nhỏ, test nhanh:
→ **ImgBB** (đơn giản nhất, không cần setup nhiều)

### Cho app production:
→ **Cloudinary** (free tier rộng, tính năng tốt, dễ scale)

### Cho app đơn giản, ít ảnh:
→ **Base64** (lưu trực tiếp trong Firestore)

---

## 🔄 Cách bật lại Firebase Storage

Khi bạn sẵn sàng bật Firebase Storage:

1. Vào Firebase Console → Storage
2. Click "Upgrade project"
3. Chọn Blaze plan (vẫn free trong free tier)
4. Thêm payment method
5. Quay lại Storage → "Get started"
6. Uncomment code trong `ProfilePage.tsx` và `lib/firebase/profile.ts`

---

## 📝 Lưu ý

- **Không commit API keys** lên Git
- Thêm `.env.local` vào `.gitignore`
- Test kỹ trước khi deploy production
- Cân nhắc giới hạn kích thước file upload

---

## 🔗 Tài liệu tham khảo

- Cloudinary: https://cloudinary.com/documentation
- ImgBB API: https://api.imgbb.com/
- Supabase Storage: https://supabase.com/docs/guides/storage
- AWS S3: https://aws.amazon.com/s3/

