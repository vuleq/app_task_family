# 📱 PWA (Progressive Web App) - Giải thích

## PWA là gì?

**PWA (Progressive Web App)** là ứng dụng web có thể hoạt động như một ứng dụng native trên điện thoại/tablet. Nó kết hợp sức mạnh của web và trải nghiệm của app.

## 🎯 PWA dùng để làm gì?

### 1. **Cài đặt trên thiết bị** 📲
- Người dùng có thể "cài đặt" app vào màn hình chính (home screen)
- Không cần vào App Store/Play Store
- Hoạt động như app native

### 2. **Hoạt động offline** 📴
- Cache các file tĩnh (HTML, CSS, JS, images)
- Có thể xem một số nội dung khi không có internet
- Service Worker tự động cache và phục vụ nội dung

### 3. **Trải nghiệm như app** 🚀
- Khởi động nhanh
- Không có thanh địa chỉ trình duyệt (standalone mode)
- Có icon trên màn hình chính
- Push notifications (có thể thêm sau)

### 4. **Tự động cập nhật** 🔄
- Khi có phiên bản mới, app tự động cập nhật
- Người dùng luôn dùng phiên bản mới nhất

## ⚠️ Tại sao "PWA support is disabled"?

Trong file `next.config.js` của bạn:

```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 👈 Dòng này
})
```

**Giải thích:**
- `disable: process.env.NODE_ENV === 'development'` có nghĩa là:
  - **Development mode** (`npm run dev`): PWA **BỊ TẮT** ✅ (Bình thường)
  - **Production mode** (`npm run build` + `npm start`): PWA **ĐƯỢC BẬT** ✅

**Tại sao tắt trong dev?**
1. **Service Worker cache** có thể gây khó khăn khi develop (code cũ được cache)
2. **Hot reload** hoạt động tốt hơn khi không có Service Worker
3. **Debug dễ hơn** khi không có cache layer
4. **Performance**: Dev mode không cần PWA features

## ✅ Khi nào PWA hoạt động?

PWA chỉ hoạt động khi:
1. **Build production**: `npm run build`
2. **Chạy production**: `npm start`
3. **Deploy lên server** (Vercel, Firebase Hosting, etc.)

## 🧪 Cách test PWA

### Option 1: Build production local
```bash
# Build
npm run build

# Chạy production server
npm start

# Mở http://localhost:3000
# Kiểm tra trong DevTools > Application > Service Workers
```

### Option 2: Bật PWA trong dev mode (không khuyến nghị)
Sửa `next.config.js`:
```js
disable: false, // Thay vì process.env.NODE_ENV === 'development'
```

**Lưu ý:** Sau khi sửa, cần restart dev server.

## 📱 Cách cài đặt PWA trên thiết bị

### Trên iPhone/iPad (Safari):
1. Mở app trong Safari
2. Tap nút **Share** (hình vuông với mũi tên)
3. Chọn **"Add to Home Screen"**
4. Đặt tên và tap **"Add"**
5. Icon sẽ xuất hiện trên màn hình chính

### Trên Android (Chrome):
1. Mở app trong Chrome
2. Tap menu (3 chấm) > **"Add to Home screen"** hoặc **"Install app"**
3. Tap **"Install"**
4. Icon sẽ xuất hiện trên màn hình chính

### Trên Desktop (Chrome/Edge):
1. Mở app trong trình duyệt
2. Xem icon **"Install"** ở thanh địa chỉ (hoặc menu)
3. Click **"Install"**
4. App sẽ mở như một cửa sổ riêng

## 🎨 Các file PWA trong project

1. **`public/manifest.json`**: Thông tin app (tên, icon, màu sắc)
2. **`public/icons/`**: Các icon với nhiều kích thước
3. **`next.config.js`**: Cấu hình PWA với `next-pwa`
4. **Service Worker**: Tự động được tạo khi build

## 🔍 Kiểm tra PWA có hoạt động không

1. **Mở DevTools** (F12)
2. Vào tab **Application** (Chrome) hoặc **Storage** (Firefox)
3. Xem **Service Workers**: Phải có service worker đang chạy
4. Xem **Manifest**: Phải hiển thị thông tin từ `manifest.json`
5. Xem **Cache Storage**: Phải có các cache được tạo

## 📝 Tóm tắt

- ✅ **"PWA support is disabled"** trong dev mode là **BÌNH THƯỜNG**
- ✅ PWA sẽ tự động **BẬT** khi build production
- ✅ Không cần làm gì thêm, chỉ cần build và deploy
- ✅ Người dùng có thể cài đặt app như native app

## 🚀 Next Steps

1. **Tạo icons** (nếu chưa có): Đặt vào `public/icons/`
2. **Build production**: `npm run build`
3. **Test PWA**: `npm start` và kiểm tra trong DevTools
4. **Deploy**: Deploy lên Vercel/Firebase Hosting
5. **Test trên thiết bị thật**: Cài đặt và test offline
