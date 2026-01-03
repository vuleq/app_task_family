# 🔍 Kiểm tra URL Nhạc Nền

## 📋 Các bước kiểm tra:

### **Bước 1: Kiểm tra Console Log**

1. Mở browser (http://localhost:3000)
2. Mở **Developer Tools** (F12)
3. Vào tab **Console**
4. Tìm các log bắt đầu bằng `[BackgroundMusic]`:
   - `[BackgroundMusic] Using single URL` - Đang dùng single URL
   - `[BackgroundMusic] Using URL_X playlist: X tracks` - Đang dùng playlist
   - `[BackgroundMusic] No music URL found, using fallback` - Không tìm thấy URL, dùng fallback

### **Bước 2: Kiểm tra Network Request**

1. Vào tab **Network** trong Developer Tools
2. Filter: **Media**
3. Reload trang (F5)
4. Xem request đến file nhạc:
   - URL nào đang được request?
   - Status code là gì? (200 = OK, 404 = không tìm thấy)

### **Bước 3: Kiểm tra .env.local**

Mở file `.env.local` và kiểm tra:

```env
# Cách 1: Single URL
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/your-cloud/video/upload/your-music.mp3

# Cách 2: Nhiều bài
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/.../music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/.../music2.mp3

# Cách 3: Playlist
NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST=https://res.cloudinary.com/.../music1.mp3,https://res.cloudinary.com/.../music2.mp3
```

**Lưu ý:**
- ✅ URL phải là **Secure URL** từ Cloudinary
- ✅ Không có khoảng trắng thừa
- ✅ URL phải đầy đủ (bắt đầu bằng `https://`)

### **Bước 4: Lấy URL từ Cloudinary**

1. Vào **Cloudinary Dashboard**: https://cloudinary.com/console
2. Vào **Media Library**
3. Tìm file nhạc của bạn
4. Click vào file
5. Copy **Secure URL** (không phải Public ID)

**Ví dụ URL đúng:**
```
https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/family-tasks/music/background_music.mp3
```

**Ví dụ URL sai:**
```
family-tasks/music/background_music.mp3  ❌ (thiếu domain)
res.cloudinary.com/...  ❌ (thiếu https://)
```

### **Bước 5: Restart Dev Server**

Sau khi sửa `.env.local`:
1. Dừng dev server (Ctrl+C trong terminal)
2. Khởi động lại: `npm run dev`
3. Reload browser (F5)

---

## 🐛 Troubleshooting:

### **Vấn đề: Console log "No music URL found"**

**Nguyên nhân:**
- Chưa thêm URL vào `.env.local`
- Tên biến sai
- URL có khoảng trắng thừa

**Giải pháp:**
- Kiểm tra tên biến có đúng không (case-sensitive)
- Kiểm tra URL có đầy đủ không
- Restart dev server

### **Vấn đề: Network 404 (Not Found)**

**Nguyên nhân:**
- URL không đúng
- File chưa được upload lên Cloudinary
- File bị xóa

**Giải pháp:**
- Kiểm tra lại URL trong Cloudinary
- Đảm bảo file đã được upload
- Copy lại Secure URL mới

### **Vấn đề: Nhạc không phát**

**Nguyên nhân:**
- Browser chặn autoplay
- Volume = 0 hoặc muted
- File format không hỗ trợ

**Giải pháp:**
- Click nút Play để bắt đầu
- Kiểm tra volume slider
- Đảm bảo file là MP3, OGG, hoặc WAV

---

## ✅ Checklist:

- [ ] Đã kiểm tra console log
- [ ] Đã kiểm tra network request
- [ ] Đã thêm URL vào `.env.local`
- [ ] URL là Secure URL từ Cloudinary
- [ ] Đã restart dev server
- [ ] Đã reload browser

---

**Nếu vẫn không hoạt động, hãy gửi:**
1. Console log `[BackgroundMusic]`
2. Network request URL
3. URL bạn đã thêm vào `.env.local`

