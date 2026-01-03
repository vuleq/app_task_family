# 🔧 Hướng Dẫn Sửa Lỗi "Upload preset không tìm thấy"

## ❌ Lỗi:
```
Upload preset không tìm thấy. Vui lòng:
1. Vào Cloudinary Dashboard → Settings → Upload
2. Tạo Upload Preset mới (Signing mode: Unsigned)
3. Copy tên preset vào .env.local: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
4. Restart dev server
```

## ✅ Giải Pháp:

### **Bước 1: Tạo Upload Preset trên Cloudinary**

1. **Đăng nhập Cloudinary:**
   - Truy cập: https://cloudinary.com/
   - Đăng nhập vào tài khoản của bạn

2. **Vào Settings → Upload:**
   - Click vào **"Settings"** (biểu tượng bánh răng) ở menu trên
   - Chọn tab **"Upload"** ở menu bên trái

3. **Tạo Upload Preset mới:**
   - Scroll xuống phần **"Upload presets"**
   - Click nút **"Add upload preset"**
   - Điền thông tin:
     - **Preset name**: `family-tasks-upload` (hoặc tên bạn muốn)
     - **Signing mode**: Chọn **"Unsigned"** ⚠️ QUAN TRỌNG!
     - **Folder**: `family-tasks` (tùy chọn, để tổ chức file)
   - Click **"Save"**

4. **Copy tên preset:**
   - Copy tên preset bạn vừa tạo (ví dụ: `family-tasks-upload`)

---

### **Bước 2: Thêm vào Environment Variables**

#### **A. Cho Local Development (.env.local):**

1. Mở file `.env.local` trong project
2. Thêm hoặc cập nhật các dòng sau:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=family-tasks-upload
```

**Lưu ý:**
- Thay `your_cloud_name` bằng Cloud Name của bạn (tìm ở Cloudinary Dashboard → Settings → Account Details)
- Thay `family-tasks-upload` bằng tên preset bạn vừa tạo

3. **Restart dev server:**
   ```bash
   # Dừng server (Ctrl+C)
   npm run dev
   ```

#### **B. Cho Production (Vercel):**

⚠️ **QUAN TRỌNG:** Nếu bạn đang deploy trên Vercel, bạn **PHẢI** thêm environment variables vào Vercel Dashboard!

1. **Vào Vercel Dashboard:**
   - Truy cập: https://vercel.com/dashboard
   - Chọn project của bạn (`app_task_family`)

2. **Vào Settings → Environment Variables:**
   - Click tab **"Settings"**
   - Click **"Environment Variables"** ở menu bên trái

3. **Thêm các biến:**
   - Click nút **"Add New"**
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **Value**: Cloud Name của bạn (ví dụ: `dvuy40chj`)
   - **Environment**: Chọn cả 3:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Click **"Save"**

   - Click **"Add New"** lần nữa
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - **Value**: Tên preset bạn vừa tạo (ví dụ: `family-tasks-upload`)
   - **Environment**: Chọn cả 3:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Click **"Save"**

4. **Redeploy:**
   - Vào tab **"Deployments"**
   - Tìm deployment mới nhất
   - Click **"..."** (3 chấm) → **"Redeploy"**
   - Xác nhận **"Redeploy"**

---

### **Bước 3: Kiểm Tra**

1. **Kiểm tra trên Local:**
   - Mở `.env.local`
   - Đảm bảo có 2 biến:
     ```
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
     ```
   - Restart dev server
   - Thử upload ảnh lại

2. **Kiểm tra trên Production (Vercel):**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Đảm bảo có 2 biến với giá trị đúng
   - Redeploy nếu cần

3. **Kiểm tra Console:**
   - Mở Console (F12 hoặc Safari Develop menu)
   - Thử upload ảnh
   - Xem logs để kiểm tra:
     - `[Avatar Upload] Starting upload:` - File info
     - `[Avatar Upload] Upload successful:` - URL của ảnh
     - Nếu có lỗi, sẽ hiển thị chi tiết

---

## 🔍 Troubleshooting

### **Lỗi vẫn còn sau khi setup:**

1. **Kiểm tra Cloud Name:**
   - Vào Cloudinary Dashboard → Settings → Account Details
   - Copy **Cloud name** (ví dụ: `dvuy40chj`)
   - Đảm bảo đúng trong `.env.local` và Vercel

2. **Kiểm tra Upload Preset:**
   - Vào Cloudinary Dashboard → Settings → Upload
   - Tìm preset bạn vừa tạo
   - Đảm bảo **Signing mode** là **"Unsigned"**
   - Copy tên preset chính xác (case-sensitive)

3. **Kiểm tra trên Vercel:**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Đảm bảo có cả 2 biến
   - Đảm bảo giá trị đúng (không có khoảng trắng thừa)
   - **Redeploy** sau khi thêm/sửa environment variables

4. **Clear Cache:**
   - Trên browser: Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)
   - Trên mobile: Xóa cache browser hoặc dùng Private/Incognito mode

5. **Kiểm tra Console Logs:**
   - Mở Console trên mobile (Safari → Develop → [Your Device])
   - Xem logs khi upload để biết lỗi cụ thể

---

## 📝 Checklist:

- [ ] Đã tạo Upload Preset trên Cloudinary (Signing mode: Unsigned)
- [ ] Đã copy Cloud Name từ Cloudinary Dashboard
- [ ] Đã thêm `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` vào `.env.local`
- [ ] Đã thêm `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` vào `.env.local`
- [ ] Đã restart dev server (nếu local)
- [ ] Đã thêm cả 2 biến vào Vercel Dashboard (nếu production)
- [ ] Đã redeploy trên Vercel (nếu production)
- [ ] Đã test upload ảnh lại

---

## 💡 Tips:

- **Cloud Name** thường là một chuỗi ngắn (ví dụ: `dvuy40chj`)
- **Upload Preset** phải là **Unsigned** để có thể upload từ client-side
- Environment variables trên Vercel **PHẢI** có prefix `NEXT_PUBLIC_` để accessible từ client
- Sau khi thêm environment variables trên Vercel, **PHẢI** redeploy để áp dụng

---

**Nếu vẫn còn lỗi, vui lòng gửi:**
- Screenshot của Cloudinary Dashboard → Settings → Upload (phần Upload presets)
- Screenshot của Vercel Dashboard → Settings → Environment Variables
- Console logs khi upload (nếu có)

