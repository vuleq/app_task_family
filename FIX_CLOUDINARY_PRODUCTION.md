# 🚨 Sửa Lỗi Cloudinary Upload trên Production (Vercel)

## ⚠️ QUAN TRỌNG:

**File `.env.local` CHỈ hoạt động ở LOCAL DEVELOPMENT!**

Khi deploy lên **Vercel (Production)**, bạn **PHẢI** thêm environment variables vào **Vercel Dashboard** và **REDEPLOY**, không phải restart dev server!

---

## ✅ Giải Pháp Cho Production:

### **Bước 1: Kiểm tra Cloudinary Upload Preset**

1. **Đăng nhập Cloudinary:**
   - Truy cập: https://cloudinary.com/
   - Đăng nhập vào tài khoản

2. **Vào Settings → Upload:**
   - Click **"Settings"** (biểu tượng bánh răng)
   - Chọn tab **"Upload"**

3. **Kiểm tra Upload Preset:**
   - Scroll xuống phần **"Upload presets"**
   - Tìm preset có tên bạn đang dùng (ví dụ: `family-tasks-upload`)
   - **Nếu chưa có**, tạo mới:
     - Click **"Add upload preset"**
     - **Preset name**: `family-tasks-upload` (hoặc tên bạn muốn)
     - **Signing mode**: Chọn **"Unsigned"** ⚠️ QUAN TRỌNG!
     - **Folder**: `family-tasks` (tùy chọn)
     - Click **"Save"**

4. **Copy thông tin:**
   - **Cloud Name**: Tìm ở Settings → Account Details (ví dụ: `dvuy40chj`)
   - **Upload Preset Name**: Tên preset bạn vừa tạo (ví dụ: `family-tasks-upload`)

---

### **Bước 2: Thêm Environment Variables vào Vercel**

1. **Vào Vercel Dashboard:**
   - Truy cập: https://vercel.com/dashboard
   - Chọn project của bạn (`app_task_family` hoặc tên project của bạn)

2. **Vào Settings → Environment Variables:**
   - Click tab **"Settings"** ở trên
   - Click **"Environment Variables"** ở menu bên trái

3. **Kiểm tra xem đã có chưa:**
   - Tìm 2 biến sau:
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - **Nếu chưa có**, tiếp tục bước 4
   - **Nếu đã có**, kiểm tra giá trị có đúng không

4. **Thêm biến `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`:**
   - Click nút **"Add New"**
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **Value**: Cloud Name của bạn (ví dụ: `dvuy40chj`)
   - **Environment**: Chọn cả 3:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Click **"Save"**

5. **Thêm biến `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`:**
   - Click nút **"Add New"** lần nữa
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - **Value**: Tên preset bạn vừa tạo (ví dụ: `family-tasks-upload`)
   - **Environment**: Chọn cả 3:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Click **"Save"**

---

### **Bước 3: REDEPLOY (Quan trọng!)**

⚠️ **SAU KHI THÊM/SỬA ENVIRONMENT VARIABLES, BẠN PHẢI REDEPLOY!**

1. **Vào tab "Deployments":**
   - Click tab **"Deployments"** ở trên

2. **Redeploy:**
   - Tìm deployment mới nhất (hoặc bất kỳ deployment nào)
   - Click **"..."** (3 chấm) ở bên phải
   - Chọn **"Redeploy"**
   - Xác nhận **"Redeploy"**

3. **Đợi deploy xong:**
   - Vercel sẽ tự động rebuild với environment variables mới
   - Thường mất 1-3 phút

---

### **Bước 4: Kiểm Tra**

1. **Kiểm tra trên Vercel:**
   - Vào tab **"Deployments"**
   - Xem deployment mới nhất có status **"Ready"** (màu xanh) chưa

2. **Test trên Production:**
   - Mở website production (ví dụ: `family4fun.vercel.app`)
   - Đăng nhập
   - Vào Profile
   - Thử upload ảnh avatar hoặc ảnh đại diện
   - Nếu upload thành công → Đã sửa xong! ✅

3. **Nếu vẫn lỗi:**
   - Mở Console trên browser (F12)
   - Xem logs khi upload để biết lỗi cụ thể
   - Kiểm tra lại:
     - Cloud Name có đúng không?
     - Upload Preset name có đúng không? (case-sensitive)
     - Upload Preset có **Unsigned** không?

---

## 📋 Checklist:

- [ ] Đã tạo Upload Preset trên Cloudinary (Signing mode: Unsigned)
- [ ] Đã copy Cloud Name từ Cloudinary Dashboard
- [ ] Đã copy Upload Preset name
- [ ] Đã thêm `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` vào Vercel Dashboard
- [ ] Đã thêm `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` vào Vercel Dashboard
- [ ] Đã chọn cả 3 môi trường (Production, Preview, Development) cho mỗi biến
- [ ] Đã **REDEPLOY** trên Vercel
- [ ] Đã đợi deploy xong (status: Ready)
- [ ] Đã test upload ảnh trên production

---

## 🔍 Troubleshooting:

### **Lỗi vẫn còn sau khi redeploy:**

1. **Kiểm tra lại Vercel Environment Variables:**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Đảm bảo có cả 2 biến
   - Đảm bảo giá trị đúng (không có khoảng trắng thừa)
   - Đảm bảo đã chọn cả 3 môi trường

2. **Kiểm tra Cloudinary Upload Preset:**
   - Vào Cloudinary Dashboard → Settings → Upload
   - Tìm preset bạn đang dùng
   - Đảm bảo **Signing mode** là **"Unsigned"**
   - Copy tên preset chính xác (case-sensitive)

3. **Clear Browser Cache:**
   - Trên desktop: Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)
   - Trên mobile: Xóa cache browser hoặc dùng Private/Incognito mode

4. **Kiểm tra Console Logs:**
   - Mở Console (F12 hoặc Safari Develop menu)
   - Thử upload ảnh
   - Xem logs để biết lỗi cụ thể:
     - `[Avatar Upload] Starting upload:` - File info
     - `[Cloudinary Upload Error]` - Chi tiết lỗi

---

## 💡 Lưu Ý:

- **`.env.local`** chỉ dùng cho **LOCAL DEVELOPMENT**
- **Vercel Dashboard** dùng cho **PRODUCTION**
- Sau khi thêm/sửa environment variables trên Vercel, **PHẢI REDEPLOY**
- Environment variables trên Vercel **PHẢI** có prefix `NEXT_PUBLIC_` để accessible từ client
- Upload Preset **PHẢI** là **Unsigned** để upload từ client-side

---

## 🆘 Nếu Vẫn Không Được:

Vui lòng gửi:
1. Screenshot của Vercel Dashboard → Settings → Environment Variables
2. Screenshot của Cloudinary Dashboard → Settings → Upload (phần Upload presets)
3. Console logs khi upload (nếu có)
4. Thông báo lỗi hiển thị trên màn hình

