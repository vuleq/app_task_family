# 🎵 Hướng dẫn Test Nhạc Nền

## ✅ Checklist để nhạc nền hoạt động:

### **Bước 1: Kiểm tra .env.local**

Mở file `.env.local` và đảm bảo có một trong các biến sau:

**Cách 1: Single URL (nếu chỉ có 1 bài)**
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/family-tasks/music/your-music.mp3
```

**Cách 2: Nhiều bài (nếu có nhiều hơn 1 bài)**
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/family-tasks/music/music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/family-tasks/music/music2.mp3
```

**Lưu ý:**
- ✅ URL phải là **Secure URL** từ Cloudinary
- ✅ URL phải đầy đủ (bắt đầu bằng `https://`)
- ✅ Không có khoảng trắng thừa

### **Bước 2: Restart Dev Server**

Sau khi thêm/sửa `.env.local`:
1. **Dừng dev server** (Ctrl+C trong terminal)
2. **Khởi động lại:**
   ```bash
   npm run dev
   ```

### **Bước 3: Kiểm tra Console Log**

1. Mở browser (http://localhost:3000)
2. Mở **Developer Tools** (F12)
3. Vào tab **Console**
4. Tìm log `[BackgroundMusic]`:
   - ✅ `[BackgroundMusic] Using single URL` - Đã load URL từ .env.local
   - ✅ `[BackgroundMusic] Using URL_X playlist: X tracks` - Đã load playlist
   - ❌ `[BackgroundMusic] No music URL found, using fallback` - Chưa có URL, đang dùng fallback

### **Bước 4: Kiểm tra Network Request**

1. Vào tab **Network** trong Developer Tools
2. Filter: **Media**
3. Reload trang (F5)
4. Xem request đến file nhạc:
   - ✅ URL từ Cloudinary → Đúng
   - ❌ `SoundHelix-Song-1.mp3` → Chưa có URL trong .env.local

### **Bước 5: Test Phát Nhạc**

1. **Login vào web**
2. **Click nút Play** (▶) ở góc dưới bên phải
3. **Kiểm tra:**
   - ✅ Nhạc phát → Hoạt động đúng
   - ❌ Nhạc không phát → Kiểm tra:
     - Volume có > 0 không?
     - Có bị mute không?
     - Browser có chặn autoplay không? (cần click Play)

---

## 🐛 Troubleshooting:

### **Vấn đề: Console log "No music URL found"**

**Nguyên nhân:**
- Chưa thêm URL vào `.env.local`
- Tên biến sai
- Chưa restart dev server

**Giải pháp:**
1. Kiểm tra tên biến có đúng không (case-sensitive)
2. Kiểm tra URL có đầy đủ không
3. **Restart dev server** (quan trọng!)

### **Vấn đề: Network vẫn request SoundHelix-Song-1.mp3**

**Nguyên nhân:**
- Environment variable chưa được load
- Chưa restart dev server

**Giải pháp:**
1. Kiểm tra `.env.local` có đúng không
2. **Restart dev server** (bắt buộc!)
3. Reload browser (F5)

### **Vấn đề: Nhạc không phát sau khi click Play**

**Nguyên nhân:**
- Volume = 0 hoặc muted
- File format không hỗ trợ
- URL không đúng (404)

**Giải pháp:**
1. Kiểm tra volume slider (góc dưới bên phải)
2. Kiểm tra nút mute/unmute
3. Kiểm tra Network tab xem file có load được không (status 200 = OK, 404 = không tìm thấy)

---

## 📝 Ví dụ Setup:

### **Ví dụ 1: 1 bài nhạc**

`.env.local`:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/family-tasks/music/background_music.mp3
```

### **Ví dụ 2: 2 bài nhạc**

`.env.local`:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/family-tasks/music/music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/family-tasks/music/music2.mp3
```

---

## ✅ Checklist cuối cùng:

- [ ] Đã thêm URL vào `.env.local`
- [ ] URL là Secure URL từ Cloudinary
- [ ] Đã restart dev server
- [ ] Console log hiển thị URL đúng
- [ ] Network tab request đến URL từ Cloudinary
- [ ] Click Play và nhạc phát được

---

**Nếu vẫn không hoạt động, hãy gửi:**
1. Console log `[BackgroundMusic]`
2. Network request URL
3. Nội dung `.env.local` (chỉ phần nhạc nền, không cần Firebase keys)

