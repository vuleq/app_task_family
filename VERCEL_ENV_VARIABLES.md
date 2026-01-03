# 🔧 Hướng dẫn Thêm Environment Variables trên Vercel

## ❌ Lỗi hiện tại:
```
Firebase Auth is not initialized. Please check your .env.local file.
```

## ✅ Giải pháp:

File `.env.local` chỉ hoạt động ở **local development**. Khi deploy lên Vercel, bạn **PHẢI** thêm các environment variables vào **Vercel Dashboard**.

---

## 📋 Các Environment Variables cần thêm:

Dựa trên file `.env.local` của bạn, cần thêm **9 biến** sau:

### 1. Firebase Configuration (6 biến - Bắt buộc)

| # | Variable Name | Mô tả |
|---|--------------|-------|
| 1 | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| 2 | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| 3 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| 4 | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| 5 | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| 6 | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |

### 2. Cloudinary Configuration (3 biến - Bắt buộc)

| # | Variable Name | Mô tả |
|---|--------------|-------|
| 7 | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| 8 | `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Cloudinary API Key |
| 9 | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset |

---

## 🚀 Cách thêm Environment Variables trên Vercel:

### Bước 1: Vào Vercel Dashboard
1. Truy cập: https://vercel.com/dashboard
2. Chọn project của bạn (`app_task_family`)

### Bước 2: Vào Settings → Environment Variables
1. Click vào tab **"Settings"**
2. Click vào **"Environment Variables"** ở menu bên trái

### Bước 3: Thêm từng biến
1. Click nút **"Add New"**
2. Nhập **Name** (tên biến)
3. Nhập **Value** (giá trị từ file `.env.local` của bạn)
4. **Quan trọng:** Chọn cả 3 môi trường:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development**
5. Click **"Save"**

### Bước 4: Lặp lại cho tất cả biến
Thêm tất cả 9 biến môi trường ở trên.

### Bước 5: Redeploy
Sau khi thêm xong:
1. Vào tab **"Deployments"**
2. Tìm deployment mới nhất
3. Click vào **"..."** (3 chấm)
4. Chọn **"Redeploy"**

Hoặc đơn giản hơn: **Push một commit mới** lên branch `production`, Vercel sẽ tự động deploy lại.

---

## 🔍 Cách lấy giá trị từ `.env.local`:

**Cách 1: Mở file trực tiếp**
1. Mở file `.env.local` trong thư mục `app_task_family`
2. Copy từng giá trị (phần sau dấu `=`) cho mỗi biến

**Cách 2: Dùng script tự động (Khuyến nghị)**
Chạy script PowerShell để xem danh sách:
```powershell
cd app_task_family
powershell -ExecutionPolicy Bypass -File scripts/export-env-to-vercel.ps1
```

**Danh sách các biến cần copy:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=<giá trị từ .env.local>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<giá trị từ .env.local>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<giá trị từ .env.local>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<giá trị từ .env.local>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<giá trị từ .env.local>
NEXT_PUBLIC_FIREBASE_APP_ID=<giá trị từ .env.local>

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<giá trị từ .env.local>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<giá trị từ .env.local>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<giá trị từ .env.local>
```

**⚠️ Lưu ý:** 
- Copy chính xác giá trị, không có khoảng trắng thừa
- Không copy dấu `=` và phần trước nó
- Nếu giá trị có dấu ngoặc kép, có thể bỏ hoặc giữ nguyên

---

## ✅ Checklist:

Sau khi thêm, đảm bảo:

- [ ] Đã thêm tất cả **9 environment variables** (6 Firebase + 3 Cloudinary)
- [ ] Mỗi biến đều được chọn cho cả 3 môi trường (Production, Preview, Development)
- [ ] Đã redeploy hoặc push commit mới
- [ ] Test lại app trên Vercel URL

---

## 🐛 Troubleshooting:

### Nếu vẫn bị lỗi sau khi thêm:

1. **Kiểm tra lại tên biến:**
   - Phải chính xác 100% (case-sensitive)
   - Không có khoảng trắng thừa

2. **Kiểm tra giá trị:**
   - Copy từ `.env.local` để đảm bảo không thiếu ký tự
   - Không có dấu ngoặc kép thừa

3. **Redeploy:**
   - Environment variables chỉ áp dụng cho deployments mới
   - Phải redeploy sau khi thêm

4. **Kiểm tra Firebase Authorized Domains:**
   - Vào Firebase Console → Authentication → Settings → Authorized domains
   - Thêm domain Vercel của bạn (ví dụ: `your-app.vercel.app`)

---

## 📝 Lưu ý:

- **KHÔNG** commit file `.env.local` lên Git (đã có trong `.gitignore`)
- Environment variables trên Vercel là **bảo mật** và chỉ hiển thị cho bạn
- Có thể dùng Vercel CLI để thêm env vars, nhưng Dashboard dễ hơn

---

**Sau khi hoàn thành, app sẽ hoạt động bình thường trên Vercel! 🎉**

