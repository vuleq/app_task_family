# 🎵 Hướng dẫn Upload File MP3 lên Cloudinary

## 🎯 Cách Upload File MP3 lên Cloudinary:

### **CÁCH 1: Upload qua Cloudinary Dashboard** (Dễ nhất) ⭐

#### Bước 1: Mở Cloudinary Dashboard
1. Truy cập: **https://cloudinary.com/console**
2. Đăng nhập với tài khoản của bạn

#### Bước 2: Upload File MP3

1. **Vào Media Library:**
   - Click **"Media Library"** ở menu bên trái
   - Hoặc truy cập: https://cloudinary.com/console/media_library

2. **Click nút "Upload":**
   - Ở góc trên bên phải, click nút **"Upload"**
   - Hoặc kéo thả file MP3 vào vùng upload

3. **Chọn file MP3:**
   - Click **"Browse"** hoặc kéo thả file MP3 vào
   - Chọn file nhạc của bạn (ví dụ: `background-music.mp3`)

4. **Chọn Folder (Quan trọng):**
   - Trong phần **"Advanced"** hoặc **"Folder"**
   - Nhập folder path: `family-tasks/music/`
   - Hoặc: `family-tasks/background-music/`
   - Folder sẽ tự động tạo nếu chưa có

5. **Resource Type:**
   - Cloudinary sẽ tự động detect file MP3
   - Nếu không, chọn **"Raw"** hoặc **"Video"** (Cloudinary xử lý audio như video)

6. **Click "Upload":**
   - Đợi upload xong (có thể mất vài phút nếu file lớn)

#### Bước 3: Lấy Secure URL

Sau khi upload xong:

1. **Click vào file MP3** vừa upload trong Media Library
2. **Copy "Secure URL"** (URL màu xanh)
3. URL sẽ có dạng:
   ```
   https://res.cloudinary.com/{cloud-name}/video/upload/v{version}/family-tasks/music/background-music.mp3
   ```
   hoặc
   ```
   https://res.cloudinary.com/{cloud-name}/raw/upload/v{version}/family-tasks/music/background-music.mp3
   ```

#### Bước 4: Thêm URL vào App

**Cách 1: Thêm vào `.env.local` (cho local development):**
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/your-cloud/video/upload/v1234567890/family-tasks/music/background-music.mp3
```

**Cách 2: Thêm vào Vercel Environment Variables (cho production):**
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm biến: `NEXT_PUBLIC_BACKGROUND_MUSIC_URL`
3. Value: URL từ Cloudinary
4. Chọn cả 3 môi trường: Production, Preview, Development
5. Redeploy

---

### **CÁCH 2: Upload bằng Cloudinary Extension trong Cursor** (Nếu đã cài)

1. Mở Cloudinary extension trong Cursor
2. Click **"Upload"**
3. Chọn file MP3
4. Nhập folder path: `family-tasks/music/`
5. Click **"Upload"**
6. Copy URL sau khi upload xong

---

## 📁 Cấu trúc Folder trên Cloudinary:

```
family-tasks/
  └── music/
      └── background-music.mp3
```

Hoặc:

```
family-tasks/
  └── background-music/
      └── background-music.mp3
```

---

## ⚙️ Lưu ý về File MP3:

### Kích thước:
- ✅ **Nên < 5MB** để load nhanh
- ⚠️ Cloudinary free tier: 25GB storage, 25GB bandwidth/tháng
- 💡 Nếu file lớn, nén trước khi upload

### Format:
- ✅ **MP3** - Khuyến nghị (nhỏ nhất, tương thích tốt)
- ✅ **OGG** - Cũng tốt, nhỏ hơn MP3
- ✅ **WAV** - Chất lượng cao nhưng file lớn

### Compression:
Nếu file MP3 quá lớn (> 5MB), có thể nén bằng:
- **Audacity** (miễn phí): https://www.audacityteam.org/
- **Online MP3 Compressor**: https://www.freeconvert.com/mp3-compressor

---

## ✅ Checklist:

- [ ] Đã đăng nhập Cloudinary Dashboard
- [ ] Đã upload file MP3 lên folder `family-tasks/music/`
- [ ] Đã copy Secure URL
- [ ] Đã thêm URL vào `.env.local` (cho local)
- [ ] Đã thêm URL vào Vercel Environment Variables (cho production)
- [ ] Đã test nhạc nền trên app

---

## 🐛 Troubleshooting:

### File không upload được:
- Kiểm tra kích thước file (< 50MB cho free tier)
- Kiểm tra format file (MP3, OGG, WAV)
- Thử upload lại

### URL không hoạt động:
- Đảm bảo copy đúng **Secure URL** (không phải Public URL)
- Kiểm tra URL có đầy đủ không (không bị cắt)
- Thử mở URL trực tiếp trong browser để test

### Nhạc không phát trong app:
- Kiểm tra browser console (F12) xem có lỗi không
- Kiểm tra URL trong `.env.local` có đúng không
- Đảm bảo đã restart dev server sau khi thêm env variable

---

## 🔗 Links hữu ích:

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Upload**: https://cloudinary.com/console/media_library/upload

---

**Sau khi upload xong, nhạc nền sẽ tự động phát khi login vào app! 🎵**

