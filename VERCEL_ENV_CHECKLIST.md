# ✅ Checklist Environment Variables trên Vercel

## ⚠️ QUAN TRỌNG: Sau khi merge và deploy

Sau khi merge `main` vào `production` và deploy lên Vercel, bạn **PHẢI** thêm environment variables vào Vercel Dashboard để hình nền và nhạc nền hoạt động.

---

## 📋 Environment Variables cần thêm:

### **1. Nhạc Nền (Background Music):**

**Nếu dùng Single URL:**
```
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/dvuy40chj/video/upload/v1767414925/background2_swr3yc.mp3
```

**Nếu dùng Playlist (URL_1, URL_2):**
```
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767414925/background2_swr3yc.mp3
```

### **2. Hình Nền (Background Images):**
```
NEXT_PUBLIC_BACKGROUND_IMAGE_1=https://res.cloudinary.com/dvuy40chj/image/upload/v1767410466/background_phnu3b.png
NEXT_PUBLIC_BACKGROUND_IMAGE_2=https://res.cloudinary.com/dvuy40chj/image/upload/v1767410470/background2_mivvcx.png
```

---

## 🚀 Các bước thêm vào Vercel:

1. **Vào Vercel Dashboard:**
   - Truy cập: https://vercel.com/dashboard
   - Chọn project của bạn (`app_task_family`)

2. **Vào Settings → Environment Variables:**
   - Click tab **"Settings"**
   - Click **"Environment Variables"** ở menu bên trái

3. **Thêm từng biến:**
   - Click nút **"Add New"**
   - **Name**: Tên biến (ví dụ: `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1`)
   - **Value**: URL từ Cloudinary
   - **Environment**: Chọn cả 3:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Click **"Save"**
   - Lặp lại cho tất cả các biến

4. **Redeploy:**
   - Vào tab **"Deployments"**
   - Tìm deployment mới nhất
   - Click **"..."** (3 chấm) → **"Redeploy"**
   - Xác nhận **"Redeploy"**

---

## ✅ Checklist:

- [ ] Đã merge `main` vào `production`
- [ ] Đã push `production` lên remote
- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1` vào Vercel
- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2` vào Vercel (nếu dùng playlist)
- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_IMAGE_1` vào Vercel
- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_IMAGE_2` vào Vercel
- [ ] Đã chọn cả 3 môi trường (Production, Preview, Development) cho mỗi biến
- [ ] Đã redeploy trên Vercel
- [ ] Đã test trên production URL

---

## 🐛 Nếu vẫn không hoạt động:

1. **Kiểm tra Vercel Build Logs:**
   - Vào Vercel Dashboard → Deployments
   - Click vào deployment mới nhất
   - Xem **"Build Logs"** để kiểm tra lỗi

2. **Kiểm tra Environment Variables:**
   - Vào Settings → Environment Variables
   - Đảm bảo tên biến đúng (case-sensitive)
   - Đảm bảo URL đầy đủ (bắt đầu bằng `https://`)

3. **Kiểm tra Console Log:**
   - Mở production URL
   - Mở Console (F12)
   - Tìm log `[BackgroundMusic] Debug` để xem environment variables có được load không

---

**Sau khi thêm environment variables và redeploy, hình nền và nhạc nền sẽ hoạt động trên production! 🎵**

