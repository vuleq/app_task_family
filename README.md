# Family Tasks - Ứng dụng quản lý nhiệm vụ gia đình

Ứng dụng web/PWA chạy trên iPad để quản lý nhiệm vụ hàng ngày cho các thành viên trong gia đình với hệ thống XP và Coin.

## 🎯 Tính năng

- ✅ Đăng nhập/Đăng ký với Email hoặc Google
- ✅ Quản lý hồ sơ (tên, ảnh đại diện, ảnh)
- ✅ Hệ thống XP và Coin
- ✅ PWA - Có thể cài đặt trên iPad
- 🔄 Nhiệm vụ (Task) - Sắp ra mắt
- 🔄 Chụp ảnh bằng chứng - Sắp ra mắt
- 🔄 Phê duyệt nhiệm vụ - Sắp ra mắt
- 🔄 Cửa hàng đổi thưởng - Sắp ra mắt

## 🚀 Quick Start

**Muốn bắt đầu nhanh?** Xem [QUICK_START.md](./QUICK_START.md)

**Chi tiết hơn:**
- [SETUP_LOCAL.md](./SETUP_LOCAL.md) - Hướng dẫn chạy local development
- [SETUP_GIT.md](./SETUP_GIT.md) - Hướng dẫn push lên Git repository riêng

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Firebase

1. Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
2. Bật các dịch vụ:
   - Authentication (Email/Password và Google)
   - Firestore Database
   - Storage
3. Copy file `.env.example` thành `.env.local` và điền thông tin Firebase của bạn:

```bash
cp .env.example .env.local
```

4. Cập nhật `.firebaserc` với project ID của bạn:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 3. Deploy Firestore Rules và Storage Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 4. Tạo PWA Icons

Tạo các icon với kích thước sau và đặt vào `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

Bạn có thể sử dụng các công cụ:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📦 Deploy

### Deploy lên Firebase Hosting

```bash
# Build production
npm run build

# Deploy
firebase deploy --only hosting
```

### Deploy lên Vercel

1. Kết nối repository với Vercel
2. Thêm các biến môi trường trong Vercel dashboard
3. Deploy tự động sẽ chạy khi push code

## 📁 Cấu trúc thư mục

```
app_task_family/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── LoginPage.tsx     # Login/Signup page
│   ├── ProfilePage.tsx   # Profile management
│   └── LoadingSpinner.tsx
├── lib/                   # Utilities
│   └── firebase/         # Firebase configuration
│       ├── config.ts     # Firebase init
│       ├── auth.ts       # Authentication
│       └── profile.ts    # Profile management
├── public/               # Static files
│   ├── icons/           # PWA icons
│   └── manifest.json     # PWA manifest
├── firebase.json         # Firebase config
├── firestore.rules      # Firestore security rules
├── storage.rules         # Storage security rules
└── package.json
```

## 🔐 Security Rules

Firestore và Storage rules đã được cấu hình cơ bản. Bạn nên review và điều chỉnh theo nhu cầu:

- Users chỉ có thể đọc/ghi dữ liệu của chính họ
- Tasks có thể được đọc bởi tất cả user đã đăng nhập
- Images được lưu theo cấu trúc: `users/{userId}/profile/` và `tasks/{taskId}/evidence/`

## 📝 Sprint 0 - Hoàn thành ✅

- [x] Next.js với TypeScript
- [x] Tailwind CSS
- [x] PWA configuration (manifest + icons structure)
- [x] Firebase setup (Auth + Firestore + Storage)
- [x] Profile system với default creation và image upload
- [x] Deployment config (Firebase Hosting + Vercel ready)

## 🎯 Các Sprint tiếp theo

Các sprint tiếp theo sẽ được cập nhật sau:
- Sprint 1: Task Management
- Sprint 2: Photo Evidence & Approval Flow
- Sprint 3: XP/Coin System & Rewards Shop
- Sprint 4: Auto-delete Evidence after 30 days

## 📱 PWA trên iPad

Để cài đặt app trên iPad:
1. Mở app trong Safari
2. Tap vào nút Share
3. Chọn "Add to Home Screen"
4. App sẽ xuất hiện như một ứng dụng native

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **PWA**: next-pwa

## 📄 License

Private project

