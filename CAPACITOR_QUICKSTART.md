# 🚀 Capacitor Quick Start Guide

## ✅ Đã setup xong!

Capacitor đã được cấu hình sẵn. Bây giờ bạn chỉ cần làm theo các bước sau:

## 📋 Các bước tiếp theo

### 1. Build app cho mobile

```bash
npm run build:mobile
```

### 2. Thêm iOS platform (nếu có macOS)

```bash
npm run cap:add:ios
```

### 3. Thêm Android platform

```bash
npm run cap:add:android
```

### 4. Sync code

```bash
npm run cap:sync
```

Hoặc dùng lệnh tổng hợp (build + sync):

```bash
npm run cap:build
```

### 5. Mở và chạy app

**iOS (cần macOS + Xcode):**
```bash
npm run cap:open:ios
```

**Android (cần Android Studio):**
```bash
npm run cap:open:android
```

## 🔄 Khi thay đổi code

Sau mỗi lần sửa code web, chạy:

```bash
npm run cap:build
```

Sau đó refresh app trong simulator/device.

## 📖 Xem hướng dẫn chi tiết

Xem file `CAPACITOR_SETUP.md` để biết thêm chi tiết về:
- Cấu hình app
- Build cho production
- Troubleshooting
- Publish lên App Store/Play Store

---

**Lưu ý:** 
- iOS cần macOS và Xcode
- Android cần Android Studio
- Firebase sẽ hoạt động bình thường, không cần thay đổi gì
