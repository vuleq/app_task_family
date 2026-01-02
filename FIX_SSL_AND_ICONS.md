# 🔧 Sửa lỗi SSL Certificate và Icon 404

## ✅ Đã sửa

### 1. **Lỗi SSL Certificate khi tải Google Fonts**

**Vấn đề:** 
- Next.js cố tải font Inter từ Google Fonts
- Bị chặn bởi SSL certificate (có thể do proxy/firewall)

**Đã sửa:**
- ✅ Thay đổi từ Google Fonts sang **System Fonts**
- ✅ Sử dụng font mặc định của hệ thống (Arial, Segoe UI, etc.)
- ✅ Không cần tải font từ internet nữa

**File đã sửa:**
- `app/layout.tsx`: Bỏ `Inter` từ `next/font/google`
- `tailwind.config.ts`: Thêm system fonts vào config

### 2. **Lỗi 404 cho Icon Files**

**Vấn đề:**
- Thiếu các file icon trong `public/icons/`
- PWA cần các icon với nhiều kích thước

**Đã sửa:**
- ✅ Tạo placeholder files cho các icon
- ⚠️ **Bạn cần thay thế bằng icon thật**

## 📝 Các bước tiếp theo

### Tạo Icon thật cho PWA

1. **Tạo icon 512x512:**
   - Dùng tool online: https://www.pwabuilder.com/imageGenerator
   - Hoặc dùng Photoshop/GIMP
   - Icon nên có nền trong suốt hoặc màu nền đẹp

2. **Resize thành các kích thước:**
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - Có thể dùng tool online: https://www.iloveimg.com/resize-image
   - Hoặc ImageMagick: `magick input.png -resize 192x192 output.png`

3. **Đặt vào thư mục:**
   ```
   public/icons/
   ├── icon-72x72.png
   ├── icon-96x96.png
   ├── icon-128x128.png
   ├── icon-144x144.png
   ├── icon-152x152.png
   ├── icon-192x192.png
   ├── icon-384x384.png
   └── icon-512x512.png
   ```

## 🧪 Test lại

1. **Restart dev server:**
   ```bash
   # Dừng server (Ctrl+C)
   npm run dev
   ```

2. **Kiểm tra:**
   - ✅ Không còn lỗi SSL certificate
   - ✅ Không còn lỗi 404 cho icons (hoặc chỉ còn warning nhẹ)
   - ✅ App chạy bình thường

## 🔍 Nếu vẫn còn lỗi

### Nếu vẫn muốn dùng Google Fonts:

1. **Cấu hình SSL cho Node.js:**
   ```bash
   # Tạo file .env.local
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```
   ⚠️ **Cảnh báo:** Chỉ dùng trong development, không dùng trong production!

2. **Hoặc dùng local fonts:**
   - Download font Inter từ Google Fonts
   - Đặt vào `public/fonts/`
   - Import trong `globals.css`

### Nếu vẫn thiếu icons:

- App vẫn chạy được, chỉ là PWA sẽ không hoạt động đầy đủ
- Có thể tạo icons sau khi cần

## ✅ Tóm tắt

- ✅ **Đã sửa lỗi SSL:** Thay Google Fonts bằng System Fonts
- ✅ **Đã tạo placeholder icons:** Cần thay thế bằng icon thật
- ✅ **App sẽ chạy không còn lỗi SSL**

Restart dev server và test lại!
