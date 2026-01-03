# 🎵 Hướng dẫn Thêm Nhạc Nền vào Vercel Production

## ✅ Bạn đã làm xong:
- ✅ Upload file MP3 lên Cloudinary
- ✅ Thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` vào `.env.local`

## ⚠️ Cần làm thêm cho Production:

File `.env.local` **CHỈ hoạt động ở local development**. Để nhạc nền hoạt động trên Vercel (production), bạn **PHẢI** thêm environment variable vào Vercel Dashboard.

---

## 🚀 Các bước:

### Bước 1: Lấy URL từ Cloudinary

1. Vào **Cloudinary Dashboard**: https://cloudinary.com/console
2. Vào **Media Library**
3. Tìm file MP3 bạn vừa upload
4. Click vào file → Copy **"Secure URL"**
5. URL sẽ có dạng:
   ```
   https://res.cloudinary.com/your-cloud/video/upload/v1234567890/family-tasks/music/your-music.mp3
   ```

### Bước 2: Thêm vào Vercel Environment Variables

1. **Vào Vercel Dashboard:**
   - Truy cập: https://vercel.com/dashboard
   - Chọn project của bạn (`app_task_family`)

2. **Vào Settings → Environment Variables:**
   - Click tab **"Settings"**
   - Click **"Environment Variables"** ở menu bên trái

3. **Thêm biến mới:**
   - Click nút **"Add New"**
   - **Name**: `NEXT_PUBLIC_BACKGROUND_MUSIC_URL`
   - **Value**: Paste URL từ Cloudinary (bước 1)
   - **Environment**: Chọn cả 3:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Click **"Save"**

### Bước 3: Redeploy

Sau khi thêm environment variable, **BẮT BUỘC** phải redeploy:

**Cách 1: Redeploy từ Dashboard (Nhanh nhất)**
1. Vào tab **"Deployments"**
2. Tìm deployment mới nhất
3. Click **"..."** (3 chấm) → **"Redeploy"**
4. Xác nhận **"Redeploy"**

**Cách 2: Push commit mới (Tự động)**
```bash
git checkout production
git commit --allow-empty -m "chore: trigger redeploy for background music"
git push origin production
```

---

## ✅ Checklist:

- [ ] Đã copy Secure URL từ Cloudinary
- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` vào Vercel
- [ ] Đã chọn cả 3 môi trường (Production, Preview, Development)
- [ ] Đã redeploy
- [ ] Đã test nhạc nền trên production URL

---

## 🔍 Kiểm tra sau khi redeploy:

1. **Mở production URL** (ví dụ: `https://your-app.vercel.app`)
2. **Login vào app**
3. **Kiểm tra góc dưới bên phải** có control nhạc không
4. **Click Play** để test nhạc có phát không
5. **Kiểm tra browser console** (F12) nếu nhạc không phát

---

## 🐛 Troubleshooting:

### Nhạc không phát trên production:
1. **Kiểm tra environment variable:**
   - Vào Vercel → Settings → Environment Variables
   - Đảm bảo `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` đã có
   - Đảm bảo URL đúng (copy từ Cloudinary)

2. **Kiểm tra đã redeploy chưa:**
   - Environment variables chỉ áp dụng cho deployments mới
   - Phải redeploy sau khi thêm

3. **Kiểm tra URL:**
   - Mở URL trực tiếp trong browser để test
   - Nếu không mở được, URL có thể sai

4. **Kiểm tra browser console:**
   - Mở F12 → Console
   - Tìm lỗi liên quan đến audio/MP3

---

## 📝 Lưu ý:

- **`.env.local`** chỉ dùng cho **local development**
- **Vercel Environment Variables** dùng cho **production/preview**
- Phải thêm vào **cả 2 nơi** nếu muốn dùng ở cả local và production
- Luôn **redeploy** sau khi thêm/sửa environment variables

---

**Sau khi hoàn thành, nhạc nền sẽ hoạt động trên cả local và production! 🎵**

