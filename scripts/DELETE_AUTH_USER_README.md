# Hướng dẫn xóa User khỏi Firebase Authentication

## Cách 1: Xóa trực tiếp trong Firebase Console (Đơn giản nhất)

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** → **Users**
4. Tìm user cần xóa (có thể search bằng email)
5. Click vào user đó
6. Click nút **Delete user** (hoặc icon thùng rác)
7. Xác nhận xóa

✅ **Cách này đơn giản nhất và không cần cấu hình gì!**

---

## Cách 2: Sử dụng Script (Nếu muốn tự động hóa)

### Bước 1: Cấu hình Firebase Admin SDK

Có 3 cách để cấu hình:

#### Option A: Sử dụng Service Account Key File (Khuyến nghị)

1. Vào Firebase Console → Project Settings → Service accounts
2. Click **Generate new private key**
3. Tải file JSON về
4. Đổi tên file thành `serviceAccountKey.json`
5. Đặt file vào thư mục `scripts/`

#### Option B: Sử dụng Environment Variables

Thêm vào `.env.local`:

```env
# Cách 1: JSON string (copy toàn bộ nội dung file service account)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# HOẶC Cách 2: Các biến riêng lẻ
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### Option C: Sử dụng GOOGLE_APPLICATION_CREDENTIALS

```env
GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json
```

### Bước 2: Chạy Script

```bash
# Xóa bằng email
npx ts-node scripts/delete-auth-user.ts sol@mail.com

# Xóa bằng UID
npx ts-node scripts/delete-auth-user.ts abc123xyz
```

---

## Cách 3: Sử dụng UI trong App (Nếu đã cấu hình Firebase Admin SDK)

1. Đăng nhập bằng tài khoản root
2. Vào Profile Page
3. Click nút **🗑️ Xóa Auth User**
4. Nhập email cần xóa
5. Click **Xóa**

---

## Lưu ý

- ⚠️ Xóa user khỏi Firebase Authentication sẽ khiến user không thể đăng nhập nữa
- ✅ User có thể đăng ký lại với cùng email sau khi bị xóa
- 🔒 Chỉ root user mới có quyền xóa user (trong script và UI)
- 📝 Script sẽ hỏi xác nhận trước khi xóa
