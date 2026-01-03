# 🖼️ Hướng dẫn Upload Background Images lên Cloudinary

## 📤 Cách Upload Background Images:

### Bước 1: Upload lên Cloudinary

1. **Vào Cloudinary Dashboard:**
   - Truy cập: https://cloudinary.com/console
   - Đăng nhập

2. **Upload 2 file background:**
   - Click **"Media Library"** → **"Upload"**
   - Upload `background.png`
   - **Folder**: `family-tasks/backgrounds/` (tự động tạo nếu chưa có)
   - Click **"Upload"**
   
   - Lặp lại với `background2.png` vào cùng folder

3. **Lấy Secure URLs:**
   - Click vào từng file vừa upload
   - Copy **"Secure URL"** của mỗi file
   - URLs sẽ có dạng:
     ```
     https://res.cloudinary.com/your-cloud/image/upload/v1234567890/family-tasks/backgrounds/background.png
     https://res.cloudinary.com/your-cloud/image/upload/v1234567890/family-tasks/backgrounds/background2.png
     ```

### Bước 2: Thêm vào Environment Variables

**Thêm vào `.env.local` (cho local):**
```env
NEXT_PUBLIC_BACKGROUND_IMAGE_1=https://res.cloudinary.com/your-cloud/image/upload/v1234567890/family-tasks/backgrounds/background.png
NEXT_PUBLIC_BACKGROUND_IMAGE_2=https://res.cloudinary.com/your-cloud/image/upload/v1234567890/family-tasks/backgrounds/background2.png
```

**Thêm vào Vercel (cho production):**
1. Vào Vercel Dashboard → Settings → Environment Variables
2. Thêm 2 biến:
   - `NEXT_PUBLIC_BACKGROUND_IMAGE_1` = URL của background.png
   - `NEXT_PUBLIC_BACKGROUND_IMAGE_2` = URL của background2.png
3. Chọn cả 3 môi trường: Production, Preview, Development
4. Redeploy

---

## 📁 Cấu trúc Folder trên Cloudinary:

```
family-tasks/
  └── backgrounds/
      ├── background.png
      └── background2.png
```

---

## ✅ Checklist:

- [ ] Đã upload `background.png` lên Cloudinary
- [ ] Đã upload `background2.png` lên Cloudinary
- [ ] Đã copy Secure URLs
- [ ] Đã thêm vào `.env.local` (local)
- [ ] Đã thêm vào Vercel Environment Variables (production)
- [ ] Đã test background random trên web

---

**Sau khi upload, code sẽ tự động random chọn 1 trong 2 background! 🎨**

