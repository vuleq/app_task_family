# 🔧 Hướng dẫn cấu hình Firebase Admin SDK trên Vercel

## Vấn đề

Nếu bạn không thể xóa user trên production, có thể do **Firebase Admin SDK chưa được cấu hình** trên Vercel.

## Giải pháp: Cấu hình Firebase Admin SDK

### Bước 1: Lấy Service Account Key từ Firebase

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** (⚙️) → **Service accounts**
4. Click **Generate new private key**
5. Tải file JSON về máy

### Bước 2: Thêm vào Vercel Environment Variables

Có **2 cách** để cấu hình:

#### Cách 1: Sử dụng JSON String (Khuyến nghị - Đơn giản nhất)

1. Mở file JSON vừa tải về bằng text editor
2. Copy **toàn bộ nội dung** (từ `{` đến `}`)
3. Vào **Vercel Dashboard** → Chọn project → **Settings** → **Environment Variables**
4. Thêm biến mới:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Dán toàn bộ nội dung JSON (bao gồm cả dấu `{` và `}`)
   - **Environment**: Chọn `Production` (và `Preview` nếu muốn)
5. Click **Save**

**Lưu ý**: 
- Phải copy toàn bộ JSON, không thiếu ký tự nào
- Không cần thêm dấu nháy `"` ở đầu và cuối
- Vercel sẽ tự động escape các ký tự đặc biệt

#### Cách 2: Sử dụng các biến riêng lẻ

1. Mở file JSON vừa tải về
2. Tìm các giá trị sau:
   - `project_id` → Dùng cho `FIREBASE_PROJECT_ID`
   - `private_key` → Dùng cho `FIREBASE_PRIVATE_KEY`
   - `client_email` → Dùng cho `FIREBASE_CLIENT_EMAIL`

3. Vào **Vercel Dashboard** → **Settings** → **Environment Variables**
4. Thêm 3 biến:

   **Biến 1:**
   - **Key**: `FIREBASE_PROJECT_ID`
   - **Value**: Giá trị của `project_id` trong JSON
   - **Environment**: `Production`

   **Biến 2:**
   - **Key**: `FIREBASE_PRIVATE_KEY`
   - **Value**: Giá trị của `private_key` trong JSON (bao gồm cả `-----BEGIN PRIVATE KEY-----` và `-----END PRIVATE KEY-----`)
   - **Environment**: `Production`
   - **Lưu ý**: Phải giữ nguyên format với `\n` trong private key

   **Biến 3:**
   - **Key**: `FIREBASE_CLIENT_EMAIL`
   - **Value**: Giá trị của `client_email` trong JSON
   - **Environment**: `Production`

5. Click **Save** cho từng biến

### Bước 3: Redeploy trên Vercel

Sau khi thêm environment variables:

1. Vào **Vercel Dashboard** → **Deployments**
2. Click vào deployment mới nhất
3. Click **Redeploy** (hoặc push code mới lên GitHub để trigger auto-deploy)

### Bước 4: Kiểm tra

1. Vào production site
2. Đăng nhập bằng tài khoản root
3. Thử xóa một user test
4. Nếu thành công = đã cấu hình đúng ✅
5. Nếu vẫn lỗi, kiểm tra:
   - Xem logs trong Vercel Dashboard → **Functions** → `/api/delete-user`
   - Kiểm tra lại environment variables đã đúng chưa

---

## Ví dụ cấu hình

### Cách 1: FIREBASE_SERVICE_ACCOUNT

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Cách 2: Các biến riêng lẻ

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

---

## Lưu ý bảo mật

- ⚠️ **KHÔNG** commit file service account key vào Git
- ⚠️ **KHÔNG** chia sẻ private key với ai
- ✅ Chỉ thêm vào Vercel Environment Variables
- ✅ File service account key chỉ dùng để generate, sau đó có thể xóa

---

## Troubleshooting

### Lỗi: "Firebase Admin SDK chưa được cấu hình"

**Nguyên nhân**: Environment variables chưa được thêm hoặc sai format

**Giải pháp**:
1. Kiểm tra lại environment variables trong Vercel
2. Đảm bảo đã chọn đúng environment (Production)
3. Redeploy lại project
4. Kiểm tra logs trong Vercel Functions

### Lỗi: "Invalid credentials"

**Nguyên nhân**: Private key bị sai format hoặc thiếu ký tự

**Giải pháp**:
1. Kiểm tra private key có đầy đủ `-----BEGIN PRIVATE KEY-----` và `-----END PRIVATE KEY-----`
2. Đảm bảo có `\n` trong private key (Vercel sẽ tự động xử lý)
3. Thử copy lại từ file JSON gốc

### Lỗi: "Permission denied"

**Nguyên nhân**: Service account không có quyền xóa user

**Giải pháp**:
1. Đảm bảo service account có quyền "Firebase Admin SDK Administrator Service Agent"
2. Kiểm tra trong Firebase Console → IAM & Admin → Service Accounts

---

## Alternative: Xóa user thủ công

Nếu không muốn cấu hình Firebase Admin SDK, bạn có thể:

1. Xóa user trong Firebase Console (Authentication → Users)
2. Xóa dữ liệu trong Firestore bằng UI (Profile Page → Xóa User)

Xem hướng dẫn chi tiết trong file `HUONG_DAN_XOA_USER_FIREBASE.md`

---

**Chúc bạn thành công! 🎉**
