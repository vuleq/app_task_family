# 🔧 Troubleshooting - Giải quyết các vấn đề thường gặp

## ⚠️ Warnings trong Terminal

### 1. Metadata Warnings (Đã sửa ✅)

**Lỗi:**
```
⚠ Unsupported metadata themeColor is configured in metadata export
⚠ Unsupported metadata viewport is configured in metadata export
```

**Nguyên nhân:** Next.js 14 yêu cầu `themeColor` và `viewport` phải được export riêng.

**Đã sửa:** File `app/layout.tsx` đã được cập nhật để tách `viewport` và `themeColor` ra export riêng.

**Nếu vẫn còn warning:** Restart dev server:
```bash
# Dừng server (Ctrl+C) và chạy lại
npm run dev
```

### 2. PWA Support Disabled (Bình thường ✅)

**Thông báo:**
```
> [PWA] PWA support is disabled
```

**Giải thích:** Đây là **BÌNH THƯỜNG** trong development mode. PWA chỉ hoạt động trong production build.

**Không cần lo lắng:** Khi build production (`npm run build`), PWA sẽ tự động được bật.

**Nếu muốn test PWA trong dev:**
Sửa `next.config.js`:
```js
disable: false, // Thay vì process.env.NODE_ENV === 'development'
```

### 3. Icon 404 Error

**Lỗi:**
```
GET /icons/icon-192x192.png 404
```

**Nguyên nhân:** File icon chưa được tạo.

**Giải pháp:**

**Option 1: Tạo icons (Khuyến nghị)**
1. Sử dụng tool online: https://www.pwabuilder.com/imageGenerator
2. Tạo icon với kích thước 512x512
3. Download và đặt vào `public/icons/` với các tên:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

**Option 2: Tạo placeholder đơn giản**
Tạo một file PNG đơn giản (có thể dùng Paint hoặc tool online) và copy thành các file với tên tương ứng.

**Option 3: Tạm thời bỏ qua**
App vẫn chạy được, chỉ là PWA sẽ không hoạt động đầy đủ. Bạn có thể tạo icons sau.

## 🐛 Các lỗi khác

### Lỗi: "Cannot find module '@/...'"

**Nguyên nhân:** TypeScript paths chưa được nhận diện.

**Giải pháp:**
```bash
# Restart dev server
npm run dev

# Hoặc xóa cache và cài lại
rm -rf .next node_modules
npm install
npm run dev
```

### Lỗi: "Firebase: Error (auth/network-request-failed)"

**Nguyên nhân:** 
- Chưa setup Firebase
- Thông tin trong `.env.local` sai
- Firebase project chưa bật services

**Giải pháp:**
1. Kiểm tra file `.env.local` có tồn tại
2. Kiểm tra thông tin Firebase trong `.env.local` đúng chưa
3. Đảm bảo Firebase project đã bật:
   - Authentication (Email/Password + Google)
   - Firestore Database
   - Storage

### Lỗi: "Port 3000 already in use"

**Giải pháp:**
```bash
# Sử dụng port khác
npm run dev -- -p 3001
```

Hoặc tìm và kill process đang dùng port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Lỗi: "Module not found: Can't resolve 'firebase/app'"

**Giải pháp:**
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Build failed

**Giải pháp:**
```bash
# Xóa cache và build lại
rm -rf .next
npm run build
```

## ✅ Checklist khi gặp lỗi

1. ✅ Đã cài đặt dependencies: `npm install`
2. ✅ Đã tạo file `.env.local` với thông tin Firebase
3. ✅ Firebase project đã bật đúng services
4. ✅ Đã restart dev server sau khi sửa code
5. ✅ Node.js version >= 18
6. ✅ Không có process khác đang dùng port 3000

## 📞 Vẫn không giải quyết được?

1. Xóa toàn bộ và cài lại:
```bash
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

2. Kiểm tra version:
```bash
node --version  # Nên >= 18
npm --version   # Nên >= 9
```

3. Xem log chi tiết:
```bash
npm run dev -- --debug
```

