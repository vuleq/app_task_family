# 🚀 Hướng dẫn chạy Local Development

## Bước 1: Cài đặt Node.js

Đảm bảo bạn đã cài đặt Node.js (phiên bản 18 trở lên):

```bash
node --version
# Nên hiển thị: v18.x.x hoặc cao hơn

npm --version
# Nên hiển thị: 9.x.x hoặc cao hơn
```

Nếu chưa có, tải về tại: https://nodejs.org/

## Bước 2: Cài đặt Dependencies

Mở terminal/PowerShell trong thư mục `app_task_family` và chạy:

```bash
cd app_task_family
npm install
```

Lệnh này sẽ cài đặt tất cả các package cần thiết (Next.js, React, Firebase, Tailwind, v.v.)

## Bước 3: Setup Firebase (Tùy chọn cho test local)

### Option A: Sử dụng Firebase Emulator (Khuyến nghị cho development)

1. Cài đặt Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login vào Firebase:
```bash
firebase login
```

3. Khởi động emulators:
```bash
firebase emulators:start
```

4. Cập nhật `.env.local` để sử dụng emulator:
```env
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH_PORT=9099
NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT=8080
NEXT_PUBLIC_FIREBASE_EMULATOR_STORAGE_PORT=9199
```

### Option B: Sử dụng Firebase Project thật

1. Tạo Firebase project tại: https://console.firebase.google.com/
2. Bật các dịch vụ:
   - Authentication (Email/Password + Google)
   - Firestore Database
   - Storage
3. Copy file `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```

4. Điền thông tin Firebase vào `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Bước 4: Tạo PWA Icons (Tùy chọn)

Để app hoạt động đầy đủ như PWA, bạn cần tạo các icon files trong `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

Bạn có thể tạo placeholder icons đơn giản hoặc sử dụng tool online:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

**Lưu ý**: App vẫn chạy được mà không cần icons, nhưng PWA sẽ không hoạt động đầy đủ.

## Bước 5: Chạy Development Server

```bash
npm run dev
```

Sau khi chạy, bạn sẽ thấy:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

Mở trình duyệt và truy cập: **http://localhost:3000**

## Bước 6: Test trên iPad (Local Network)

### Cách 1: Sử dụng IP Address

1. Tìm IP address của máy tính:
   - Windows: `ipconfig` (tìm IPv4 Address)
   - Mac/Linux: `ifconfig` hoặc `ip addr`

2. Chạy Next.js với hostname:
```bash
npm run dev -- -H 0.0.0.0
```

3. Trên iPad, mở Safari và truy cập:
```
http://[IP-ADDRESS]:3000
```
Ví dụ: `http://192.168.1.100:3000`

### Cách 2: Sử dụng ngrok (Khuyến nghị)

1. Cài đặt ngrok: https://ngrok.com/download
2. Chạy ngrok:
```bash
ngrok http 3000
```
3. Copy URL từ ngrok (ví dụ: `https://abc123.ngrok.io`)
4. Mở URL này trên iPad

## Các lệnh hữu ích khác

```bash
# Build production
npm run build

# Chạy production build local
npm run build
npm start

# Check lỗi code
npm run lint

# Format code (nếu có prettier)
npm run format
```

## Troubleshooting

### Lỗi: "Cannot find module"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Port 3000 already in use"
```bash
# Sử dụng port khác
npm run dev -- -p 3001
```

### Lỗi Firebase: "Firebase: Error (auth/network-request-failed)"
- Kiểm tra kết nối internet
- Kiểm tra lại thông tin trong `.env.local`
- Đảm bảo Firebase project đã bật đúng services

### Lỗi: "Module not found: Can't resolve '@/...'"
- Đảm bảo `tsconfig.json` có cấu hình paths đúng
- Restart development server

## Next Steps

Sau khi chạy được local, bạn có thể:
1. Test các tính năng hiện tại (Login, Profile)
2. Bắt đầu phát triển các tính năng mới
3. Push code lên repo riêng (xem SETUP_GIT.md)

