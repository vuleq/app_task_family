# 🔥 Hướng dẫn Setup Firebase - Chi tiết từng bước

Hướng dẫn này sẽ giúp bạn lấy tất cả thông tin cần thiết từ Firebase Console để điền vào file `.env.local`.

## 📋 Bước 1: Tạo Firebase Project

1. Truy cập: https://console.firebase.google.com/
2. Đăng nhập bằng tài khoản Google của bạn
3. Click **"Add project"** hoặc **"Create a project"**
4. Điền tên project (ví dụ: `family-tasks-app`)
5. Chọn có bật Google Analytics hay không (tùy chọn)
6. Click **"Create project"** và đợi Firebase tạo project

## 📋 Bước 2: Tạo Web App trong Firebase

1. Sau khi project được tạo, bạn sẽ thấy dashboard
2. Click vào icon **Web** (`</>`) hoặc tìm **"Add app"** > **"Web"**
3. Điền tên app (ví dụ: `Family Tasks Web`)
4. **KHÔNG** tick vào "Also set up Firebase Hosting" (nếu không cần)
5. Click **"Register app"**
6. **QUAN TRỌNG**: Bạn sẽ thấy một đoạn code JavaScript chứa thông tin config. **ĐỪNG ĐÓNG** trang này!

## 📋 Bước 3: Lấy thông tin Firebase Config

Trong trang hiển thị code config, bạn sẽ thấy một object như sau:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Cách lấy từng giá trị:

#### 1. **NEXT_PUBLIC_FIREBASE_API_KEY**
- Tìm `apiKey` trong object trên
- Copy giá trị (ví dụ: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

#### 2. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
- Tìm `authDomain` trong object trên
- Copy giá trị (ví dụ: `your-project-id.firebaseapp.com`)

#### 3. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
- Tìm `projectId` trong object trên
- Copy giá trị (ví dụ: `your-project-id`)
- **Hoặc** lấy từ URL: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`

#### 4. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
- Tìm `storageBucket` trong object trên
- Copy giá trị (ví dụ: `your-project-id.appspot.com`)

#### 5. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
- Tìm `messagingSenderId` trong object trên
- Copy giá trị (ví dụ: `123456789012`)

#### 6. **NEXT_PUBLIC_FIREBASE_APP_ID**
- Tìm `appId` trong object trên
- Copy giá trị (ví dụ: `1:123456789012:web:abcdef1234567890`)

### Cách khác để lấy thông tin (nếu đã đóng trang config):

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project của bạn
3. Click vào icon **⚙️ Settings** (bánh răng) ở góc trên bên trái
4. Chọn **"Project settings"**
5. Scroll xuống phần **"Your apps"**
6. Click vào web app của bạn (hoặc tạo mới nếu chưa có)
7. Scroll xuống phần **"SDK setup and configuration"**
8. Chọn tab **"Config"** (không phải "npm")
9. Bạn sẽ thấy object `firebaseConfig` với tất cả thông tin cần thiết

## 📋 Bước 4: Bật các dịch vụ Firebase

### 4.1. Bật Authentication

1. Trong Firebase Console, click vào **"Authentication"** ở menu bên trái
2. Click tab **"Sign-in method"**
3. Bật **"Email/Password"**:
   - Click vào "Email/Password"
   - Bật toggle "Enable"
   - Click "Save"
4. Bật **"Google"** (nếu muốn đăng nhập bằng Google):
   - Click vào "Google"
   - Bật toggle "Enable"
   - Chọn email support (hoặc để mặc định)
   - Click "Save"

### 4.2. Bật Firestore Database

1. Click vào **"Firestore Database"** ở menu bên trái
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (cho development)
   - ⚠️ **Lưu ý**: Test mode cho phép đọc/ghi tự do trong 30 ngày. Sau đó cần setup security rules.
4. Chọn location (chọn gần bạn nhất, ví dụ: `asia-southeast1` cho Việt Nam)
5. Click **"Enable"**

### 4.3. Bật Storage

1. Click vào **"Storage"** ở menu bên trái

**Trường hợp A: Thấy nút "Get started"**
- Click **"Get started"**
- Chọn **"Start in test mode"** (cho development)
- Chọn location (nên chọn cùng location với Firestore)
- Click **"Done"**

**Trường hợp B: Thấy "Upgrade project" (thường gặp)**
- Firebase yêu cầu bật billing account để sử dụng Storage
- **Lưu ý quan trọng**: Bạn sẽ KHÔNG bị tính phí nếu dùng trong giới hạn free (5GB Storage, 1GB/day download)
- Các bước:
  1. Click **"Upgrade project"**
  2. Chọn **"Blaze plan"** (Pay as you go)
  3. Thêm payment method (thẻ tín dụng) - **Cần thiết nhưng không tính phí trong free tier**
  4. Sau khi bật billing, quay lại Storage
  5. Click **"Get started"**
  6. Chọn **"Start in test mode"**
  7. Chọn location
  8. Click **"Done"**

**Lưu ý về chi phí:**
- Spark plan (free): Không có Storage
- Blaze plan: Có free tier 5GB Storage, chỉ tính phí khi vượt quá
- Với app nhỏ, bạn sẽ KHÔNG bao giờ vượt quá free tier

## 📋 Bước 5: Điền thông tin vào .env.local

1. Mở file `.env.local` trong thư mục project
2. Thay thế các giá trị `your-xxx-here` bằng thông tin thật từ Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

3. Lưu file

## 📋 Bước 6: Restart Dev Server

Sau khi cập nhật `.env.local`:

1. Dừng dev server (nhấn `Ctrl+C` trong terminal)
2. Chạy lại: `npm run dev`
3. Mở browser: http://localhost:3000

## ✅ Kiểm tra

Nếu setup đúng, bạn sẽ thấy:
- Trang đăng nhập hiển thị bình thường
- Có thể đăng ký tài khoản mới
- Có thể đăng nhập bằng email/password hoặc Google

## 🐛 Troubleshooting

### Lỗi: "Firebase: Error (auth/api-key-not-valid)"
- Kiểm tra lại `NEXT_PUBLIC_FIREBASE_API_KEY` đã đúng chưa
- Đảm bảo không có khoảng trắng thừa

### Lỗi: "Firebase: Error (auth/network-request-failed)"
- Kiểm tra kết nối internet
- Kiểm tra tất cả các giá trị trong `.env.local` đã đúng chưa
- Đảm bảo đã bật Authentication trong Firebase Console

### Lỗi: "Firestore: Missing or insufficient permissions"
- Firestore đang ở chế độ test mode, cần đợi vài phút để rules được áp dụng
- Hoặc kiểm tra Firestore Rules trong Firebase Console

### Trang vẫn trắng hoặc hiển thị lỗi
- Kiểm tra console của browser (F12) để xem lỗi chi tiết
- Đảm bảo đã restart dev server sau khi sửa `.env.local`
- Kiểm tra file `.env.local` có đúng format không (không có dấu ngoặc kép thừa)

## 📸 Hình ảnh minh họa

### Nơi tìm Firebase Config:

1. **Firebase Console** → **Project Settings** → **Your apps** → **Web app** → **Config tab**

### Nơi bật các dịch vụ:

1. **Authentication**: Menu trái → **Authentication** → **Sign-in method**
2. **Firestore**: Menu trái → **Firestore Database** → **Create database**
3. **Storage**: Menu trái → **Storage** → **Get started**

## 🎉 Hoàn thành!

Sau khi hoàn thành các bước trên, app của bạn đã sẵn sàng để chạy với Firebase!

## 📚 Tài liệu tham khảo

- Firebase Console: https://console.firebase.google.com/
- Firebase Documentation: https://firebase.google.com/docs
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

