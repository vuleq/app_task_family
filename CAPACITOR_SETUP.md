# Hướng dẫn Setup Capacitor cho Mobile App

## ✅ Đã hoàn thành

1. ✅ Cài đặt Capacitor và các plugins
2. ✅ Tạo file cấu hình `capacitor.config.ts`
3. ✅ Cấu hình Next.js để hỗ trợ static export
4. ✅ Thêm scripts vào `package.json`
5. ✅ Cập nhật `.gitignore`

## 📋 Bước tiếp theo

### 1. Khởi tạo Capacitor (chỉ cần làm 1 lần)

```bash
# Khởi tạo Capacitor với thông tin app
npx cap init "Family Tasks" "com.familytasks.app"
```

**Lưu ý:** Nếu đã có file `capacitor.config.ts`, bạn có thể bỏ qua bước này hoặc chạy để cập nhật.

### 2. Build Next.js app cho mobile

```bash
# Build với static export
npm run build:mobile
```

Lệnh này sẽ:
- Build Next.js app với static export
- Output vào thư mục `out/` (đã được cấu hình trong `capacitor.config.ts`)

### 3. Thêm iOS platform

```bash
# Thêm iOS platform
npm run cap:add:ios
```

**Yêu cầu:**
- macOS với Xcode đã cài đặt
- CocoaPods (sẽ tự động cài khi chạy lệnh)

### 4. Thêm Android platform

```bash
# Thêm Android platform
npm run cap:add:android
```

**Yêu cầu:**
- Android Studio đã cài đặt
- Java Development Kit (JDK)
- Android SDK

### 5. Sync code với Capacitor

Sau khi build và thêm platforms, sync code:

```bash
# Sync code (copy web files vào native projects)
npm run cap:sync
```

Hoặc dùng lệnh tổng hợp:

```bash
# Build và sync trong 1 lệnh
npm run cap:build
```

### 6. Mở project trong IDE native

**iOS:**
```bash
npm run cap:open:ios
```
Sẽ mở Xcode, sau đó:
- Chọn device/simulator
- Nhấn Run (▶️) để build và chạy

**Android:**
```bash
npm run cap:open:android
```
Sẽ mở Android Studio, sau đó:
- Chọn device/emulator
- Nhấn Run (▶️) để build và chạy

## 🔄 Workflow phát triển

### Khi thay đổi code web:

1. **Build lại:**
   ```bash
   npm run build:mobile
   ```

2. **Sync với native:**
   ```bash
   npm run cap:sync
   ```

3. **Hoặc dùng lệnh tổng hợp:**
   ```bash
   npm run cap:build
   ```

### Khi thay đổi native code (iOS/Android):

- Chỉ cần sync lại:
  ```bash
  npm run cap:sync
  ```

## 📱 Cấu hình App

### Thay đổi App ID và App Name

Sửa file `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.familytasks.app',  // Thay đổi App ID
  appName: 'Family Tasks',       // Thay đổi App Name
  // ...
}
```

Sau đó chạy:
```bash
npm run cap:sync
```

### Thay đổi Icon và Splash Screen

**iOS:**
- Mở Xcode: `npm run cap:open:ios`
- Chọn project → Assets.xcassets
- Thay đổi AppIcon và LaunchImage

**Android:**
- Mở Android Studio: `npm run cap:open:android`
- Thay đổi icon trong `android/app/src/main/res/`
- Hoặc dùng [Capacitor Assets](https://capacitorjs.com/docs/guides/splash-screens-and-icons)

## 🚀 Build cho Production

### iOS (App Store)

1. Mở Xcode: `npm run cap:open:ios`
2. Chọn "Any iOS Device" hoặc device cụ thể
3. Product → Archive
4. Distribute App → App Store Connect
5. Upload và submit lên App Store

**Yêu cầu:**
- Apple Developer Account ($99/năm)
- Xcode đã cài đặt
- Certificates và Provisioning Profiles đã setup

### Android (Play Store)

1. Mở Android Studio: `npm run cap:open:android`
2. Build → Generate Signed Bundle / APK
3. Chọn Android App Bundle (.aab)
4. Tạo keystore (nếu chưa có)
5. Upload file .aab lên Google Play Console

**Yêu cầu:**
- Google Play Developer Account ($25 một lần)
- Android Studio đã cài đặt
- Keystore để sign app

## ⚠️ Lưu ý quan trọng

### 1. Firebase Configuration

Firebase Web SDK sẽ hoạt động tốt với Capacitor. Không cần thay đổi gì trong code Firebase.

**Kiểm tra:**
- File `.env.local` có đầy đủ Firebase config
- Firebase project đã enable các services cần thiết

### 2. Routing

App hiện tại chỉ có 1 page chính, nên không có vấn đề với routing. Nếu sau này thêm nhiều pages, có thể cần:
- Sử dụng React Router thay vì Next.js routing
- Hoặc giữ Next.js routing nhưng đảm bảo tất cả routes đều được export static

### 3. API Routes

Next.js API routes (`app/api/*`) **KHÔNG hoạt động** với static export. Nếu app có API routes:
- Chuyển sang Firebase Cloud Functions
- Hoặc tạo backend riêng
- Hoặc dùng Firebase REST API trực tiếp

### 4. Environment Variables

Đảm bảo các biến môi trường được set đúng:
- `NEXT_PUBLIC_*` variables sẽ được embed vào build
- Các variables khác không hoạt động với static export

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@capacitor/core'"

```bash
npm install @capacitor/core @capacitor/cli
```

### Lỗi: "webDir does not exist"

Đảm bảo đã build app trước:
```bash
npm run build:mobile
```

### Lỗi khi sync iOS

```bash
cd ios/App
pod install
cd ../..
npm run cap:sync
```

### Lỗi khi build Android

- Kiểm tra Android SDK đã cài đặt đầy đủ
- Kiểm tra Java version (cần JDK 11+)
- Clean và rebuild trong Android Studio

## 📚 Tài liệu tham khảo

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Capacitor iOS Setup](https://capacitorjs.com/docs/ios)
- [Capacitor Android Setup](https://capacitorjs.com/docs/android)

## 🎯 Checklist trước khi publish

- [ ] Test app trên iOS device/simulator
- [ ] Test app trên Android device/emulator
- [ ] Kiểm tra Firebase hoạt động đúng
- [ ] Test authentication (login/logout)
- [ ] Test tất cả tính năng chính
- [ ] Cấu hình App Icon và Splash Screen
- [ ] Setup App Store Connect / Play Console
- [ ] Tạo screenshots và mô tả app
- [ ] Submit và chờ review

---

**Chúc bạn thành công! 🚀**
