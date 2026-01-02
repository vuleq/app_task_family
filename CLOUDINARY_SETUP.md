# ☁️ Hướng dẫn Setup Cloudinary - Chi tiết từng bước

Hướng dẫn này sẽ giúp bạn setup Cloudinary để upload ảnh thay vì Firebase Storage.

## 🎯 Tại sao dùng Cloudinary?

- ✅ **Free tier rộng rãi**: 25GB storage, 25GB bandwidth/tháng
- ✅ **Tự động optimize**: Resize, compress ảnh tự động
- ✅ **CDN toàn cầu**: Ảnh load nhanh ở mọi nơi
- ✅ **Không cần billing**: Không cần thẻ tín dụng
- ✅ **Dễ tích hợp**: Setup đơn giản, API dễ dùng

---

## 📋 Bước 1: Tạo tài khoản Cloudinary

1. Truy cập: **https://cloudinary.com/**
2. Click **"Sign Up for Free"** hoặc **"Start Free"**
3. Điền thông tin:
   - Email
   - Password
   - Tên
4. Xác nhận email (nếu cần)
5. Đăng nhập vào Dashboard

---

## 📋 Bước 2: Lấy thông tin cần thiết

Sau khi đăng nhập, bạn sẽ thấy **Dashboard** với thông tin project.

### 2.1. Lấy Cloud Name

1. Ở góc trên bên phải, bạn sẽ thấy **"Cloud name"**
   - Ví dụ: `dabc123xyz`
   - Copy giá trị này

### 2.2. Lấy API Key và API Secret

1. Click vào **"Settings"** (icon bánh răng) ở menu trên
2. Vào tab **"Security"**
3. Tìm phần **"API Keys"**
4. Bạn sẽ thấy:
   - **API Key**: Ví dụ: `123456789012345`
   - **API Secret**: Click **"Reveal"** để hiển thị (ví dụ: `abcdefghijklmnopqrstuvwxyz123456`)

### 2.3. Tạo Upload Preset (Quan trọng!)

1. Vẫn trong **Settings**, click tab **"Upload"**
2. Scroll xuống phần **"Upload presets"**
3. Click **"Add upload preset"**
4. Điền thông tin:
   - **Preset name**: `family-tasks-upload` (hoặc tên bạn muốn)
   - **Signing mode**: Chọn **"Unsigned"** (để upload từ client)
   - **Folder**: `family-tasks` (tùy chọn, để tổ chức ảnh)
5. Click **"Save"**
6. Copy **Preset name** vừa tạo

---

## 📋 Bước 3: Thêm thông tin vào .env.local

Mở file `.env.local` trong thư mục project và thêm các dòng sau:

```env
# ============================================
# Cloudinary Configuration
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key-here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset-name-here

# API Secret (chỉ cần nếu muốn xóa ảnh từ server-side)
# CLOUDINARY_API_SECRET=your-api-secret-here
```

### Ví dụ thực tế:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dabc123xyz
NEXT_PUBLIC_CLOUDINARY_API_KEY=123456789012345
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=family-tasks-upload
```

**Lưu ý quan trọng:**
- Thay `your-cloud-name-here` bằng Cloud Name của bạn
- Thay `your-api-key-here` bằng API Key của bạn
- Thay `your-upload-preset-name-here` bằng tên Upload Preset bạn vừa tạo
- **KHÔNG** commit file `.env.local` lên Git (đã có trong .gitignore)

---

## 📋 Bước 4: Kiểm tra setup

1. **Restart dev server**:
   ```bash
   # Nhấn Ctrl+C để dừng server
   npm run dev
   ```

2. **Test upload ảnh**:
   - Mở app: http://localhost:3000
   - Đăng nhập
   - Vào trang Profile
   - Click "Chọn ảnh đại diện" hoặc "Chọn ảnh"
   - Chọn một file ảnh
   - Nếu upload thành công → Setup đúng! ✅

---

## 🐛 Troubleshooting

### Lỗi: "Cloudinary chưa được cấu hình"

**Nguyên nhân**: Thiếu biến môi trường trong `.env.local`

**Giải pháp**:
1. Kiểm tra file `.env.local` có đầy đủ 3 biến:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
2. Đảm bảo không có khoảng trắng thừa
3. Restart dev server

### Lỗi: "Invalid upload preset"

**Nguyên nhân**: Upload Preset chưa được tạo hoặc tên sai

**Giải pháp**:
1. Vào Cloudinary Dashboard → Settings → Upload
2. Kiểm tra Upload Preset đã được tạo chưa
3. Đảm bảo Preset có **"Signing mode"** là **"Unsigned"**
4. Copy đúng tên Preset vào `.env.local`

### Lỗi: "Upload failed" hoặc "401 Unauthorized"

**Nguyên nhân**: API Key hoặc Cloud Name sai

**Giải pháp**:
1. Kiểm tra lại Cloud Name và API Key trong Cloudinary Dashboard
2. Đảm bảo đã copy đúng (không có khoảng trắng thừa)
3. Thử tạo API Key mới nếu cần

### Ảnh upload thành công nhưng không hiển thị

**Nguyên nhân**: URL ảnh chưa được lưu vào Firestore

**Giải pháp**:
1. Kiểm tra Console (F12) xem có lỗi không
2. Kiểm tra Firestore xem URL đã được lưu chưa
3. Đảm bảo function `updateProfile` hoạt động đúng

---

## 📊 So sánh với Firebase Storage

| Tính năng | Cloudinary | Firebase Storage |
|-----------|------------|------------------|
| **Free tier** | 25GB storage, 25GB bandwidth | 5GB storage (cần billing) |
| **Billing** | Không cần | Cần thẻ tín dụng |
| **Auto resize** | ✅ Có | ❌ Không |
| **CDN** | ✅ Toàn cầu | ✅ Toàn cầu |
| **Setup** | ⭐⭐ Dễ | ⭐⭐⭐ Khó hơn |

---

## 🎉 Hoàn thành!

Sau khi setup xong, bạn có thể:
- ✅ Upload ảnh đại diện
- ✅ Upload ảnh profile
- ✅ Ảnh tự động được optimize và resize
- ✅ Ảnh load nhanh nhờ CDN

---

## 📚 Tài liệu tham khảo

- Cloudinary Dashboard: https://cloudinary.com/console
- Cloudinary Documentation: https://cloudinary.com/documentation
- Upload Presets: https://cloudinary.com/documentation/upload_presets

---

## 💡 Tips

1. **Tối ưu ảnh trước khi upload**: Nén ảnh trước khi upload để tiết kiệm bandwidth
2. **Sử dụng folder**: Tổ chức ảnh theo folder (avatars, images, etc.)
3. **Giới hạn kích thước**: Code đã giới hạn 10MB/file, có thể điều chỉnh trong `lib/cloudinary.ts`
4. **Monitor usage**: Vào Cloudinary Dashboard để theo dõi usage (free tier rất rộng rãi)

