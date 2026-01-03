# 🔍 Debug Lỗi Cloudinary Upload trên Production

## ⚠️ Lỗi: Đã thêm environment variable nhưng vẫn không upload được ảnh

## ✅ Checklist Kiểm Tra:

### **1. Kiểm Tra Environment Variables trên Vercel:**

Vào Vercel Dashboard → Settings → Environment Variables, đảm bảo có **CẢ 2 biến** sau:

#### **Biến 1:**
- **Name**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **Value**: Cloud Name của bạn (ví dụ: `dvuy40chj`)
- **KHÔNG có khoảng trắng** trước/sau dấu `=`
- **KHÔNG có dấu ngoặc kép** (`"` hoặc `'`)

#### **Biến 2:**
- **Name**: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- **Value**: Tên preset (ví dụ: `family-tasks-upload`)
- **KHÔNG có khoảng trắng** trước/sau dấu `=`
- **KHÔNG có dấu ngoặc kép** (`"` hoặc `'`)

⚠️ **LƯU Ý:** Trên Vercel, khi thêm environment variable:
- **Name**: Chỉ nhập tên biến (ví dụ: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`)
- **Value**: Chỉ nhập giá trị (ví dụ: `family-tasks-upload`)
- **KHÔNG** nhập dấu `=` trong Name hoặc Value!

---

### **2. Kiểm Tra Upload Preset trên Cloudinary:**

1. **Đăng nhập Cloudinary:**
   - Truy cập: https://cloudinary.com/
   - Đăng nhập

2. **Vào Settings → Upload:**
   - Click **"Settings"** → **"Upload"**

3. **Tìm Upload Preset:**
   - Scroll xuống phần **"Upload presets"**
   - Tìm preset có tên `family-tasks-upload` (hoặc tên bạn đã dùng)

4. **Kiểm tra cấu hình:**
   - Click vào preset để xem chi tiết
   - **Signing mode**: Phải là **"Unsigned"** ⚠️ QUAN TRỌNG!
   - **Folder**: Có thể để trống hoặc `family-tasks`

5. **Nếu chưa có preset:**
   - Click **"Add upload preset"**
   - **Preset name**: `family-tasks-upload` (chính xác như trong Vercel)
   - **Signing mode**: Chọn **"Unsigned"**
   - Click **"Save"**

---

### **3. Kiểm Tra Cloud Name:**

1. **Vào Cloudinary Dashboard:**
   - Click **"Settings"** → **"Account Details"**

2. **Tìm Cloud Name:**
   - Tìm dòng **"Cloud name"**
   - Copy giá trị (ví dụ: `dvuy40chj`)

3. **So sánh với Vercel:**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Kiểm tra `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` có đúng không

---

### **4. Kiểm Tra Console Logs (Quan trọng!):**

Khi upload ảnh, mở Console để xem lỗi cụ thể:

#### **Trên Desktop:**
1. Mở website production
2. Nhấn **F12** (hoặc Right-click → Inspect)
3. Chọn tab **"Console"**
4. Thử upload ảnh
5. Xem logs:
   - `[Avatar Upload] Starting upload:` - File info
   - `[Cloudinary Upload Error]` - Chi tiết lỗi

#### **Trên iPhone/iPad:**
1. Kết nối iPhone/iPad với Mac
2. Trên Mac: Mở Safari → Develop → [Tên thiết bị] → [Tên website]
3. Console sẽ hiển thị trên Mac
4. Thử upload ảnh trên iPhone/iPad
5. Xem logs trên Mac

#### **Các lỗi thường gặp:**

**Lỗi 1: "Upload preset không tìm thấy"**
```
[Cloudinary Upload Error] { status: 400, error: { message: "Invalid upload preset" } }
```
→ **Giải pháp:** Kiểm tra tên preset có đúng không (case-sensitive)

**Lỗi 2: "Cloudinary chưa được cấu hình"**
```
Cloudinary chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME...
```
→ **Giải pháp:** Kiểm tra cả 2 biến đã được thêm vào Vercel chưa

**Lỗi 3: "Network error" hoặc "fetch failed"**
```
[Cloudinary Upload Error] TypeError: Failed to fetch
```
→ **Giải pháp:** Kiểm tra kết nối internet hoặc CORS

---

### **5. Kiểm Tra Format Giá Trị:**

⚠️ **QUAN TRỌNG:** Trên Vercel, giá trị environment variable **KHÔNG được có:**
- Khoảng trắng thừa ở đầu/cuối
- Dấu ngoặc kép (`"` hoặc `'`)
- Dấu `=` trong Value

**✅ ĐÚNG:**
```
Name: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Value: family-tasks-upload
```

**❌ SAI:**
```
Name: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Value: "family-tasks-upload"          ← Có dấu ngoặc kép
```

```
Name: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Value:  family-tasks-upload           ← Có khoảng trắng ở đầu
```

```
Name: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = family-tasks-upload  ← Có dấu =
```

---

### **6. Redeploy Sau Khi Sửa:**

Sau khi sửa environment variables trên Vercel:

1. **Vào tab "Deployments"**
2. **Click "..." (3 chấm) → "Redeploy"**
3. **Đợi deploy xong** (1-3 phút)
4. **Test lại upload ảnh**

---

## 🔧 Các Bước Sửa Lỗi:

### **Bước 1: Xóa và Thêm Lại Environment Variables**

1. **Vào Vercel Dashboard → Settings → Environment Variables**
2. **Xóa 2 biến cũ** (nếu có):
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3. **Thêm lại từ đầu:**
   - Click **"Add New"**
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **Value**: Cloud Name của bạn (ví dụ: `dvuy40chj`)
   - **Environment**: Chọn cả 3 (Production, Preview, Development)
   - Click **"Save"**
   
   - Click **"Add New"** lần nữa
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - **Value**: `family-tasks-upload` (không có dấu ngoặc kép, không có khoảng trắng)
   - **Environment**: Chọn cả 3
   - Click **"Save"**

### **Bước 2: Kiểm Tra Upload Preset trên Cloudinary**

1. **Vào Cloudinary Dashboard → Settings → Upload**
2. **Tìm preset `family-tasks-upload`**
3. **Nếu chưa có**, tạo mới:
   - Click **"Add upload preset"**
   - **Preset name**: `family-tasks-upload` (chính xác)
   - **Signing mode**: **"Unsigned"** ⚠️
   - Click **"Save"**

### **Bước 3: Redeploy**

1. **Vào Vercel Dashboard → Deployments**
2. **Click "..." → "Redeploy"**
3. **Đợi deploy xong**

### **Bước 4: Test và Kiểm Tra Logs**

1. **Mở website production**
2. **Mở Console** (F12)
3. **Thử upload ảnh**
4. **Xem logs** để biết lỗi cụ thể

---

## 📋 Checklist Cuối Cùng:

- [ ] Đã thêm `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` vào Vercel (không có space, không có dấu ngoặc kép)
- [ ] Đã thêm `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` vào Vercel (không có space, không có dấu ngoặc kép)
- [ ] Giá trị của `UPLOAD_PRESET` khớp với tên preset trên Cloudinary (case-sensitive)
- [ ] Upload Preset trên Cloudinary có **Signing mode: Unsigned**
- [ ] Đã chọn cả 3 môi trường (Production, Preview, Development) cho mỗi biến
- [ ] Đã **REDEPLOY** sau khi thêm/sửa environment variables
- [ ] Đã đợi deploy xong (status: Ready)
- [ ] Đã test upload ảnh và xem Console logs

---

## 🆘 Nếu Vẫn Không Được:

Vui lòng gửi:
1. **Screenshot của Vercel Dashboard → Settings → Environment Variables** (che giấu giá trị nhạy cảm)
2. **Screenshot của Cloudinary Dashboard → Settings → Upload** (phần Upload presets)
3. **Console logs khi upload** (copy toàn bộ logs từ Console)
4. **Thông báo lỗi hiển thị trên màn hình** (screenshot hoặc text)

