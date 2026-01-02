# 🔧 Troubleshooting: Rương chỉ hiển thị emoji 📦

## ❌ Vấn đề
Rương (wood chest, silver chest, etc.) chỉ hiển thị emoji 📦 thay vì hình ảnh đã upload lên Cloudinary.

## 🔍 Các nguyên nhân có thể

### 1. Tên file không đúng format
Code đang tìm file với format: `{type}_chest_closed.png`
- ✅ Đúng: `wood_chest_closed.png`
- ❌ Sai: `wood chest new.png`, `Wood_Chest_Closed.png`, `closed.png`

### 2. File chưa được upload
File chưa được upload lên Cloudinary hoặc upload sai folder.

### 3. URL không đúng
Cloud name hoặc folder path không đúng.

## ✅ Cách kiểm tra

### Bước 1: Kiểm tra Console Logs

1. Mở Browser Console (F12)
2. Tìm logs bắt đầu bằng `[ChestSystem]`
3. Xem URL được tạo:
   ```
   [ChestSystem] Generated Cloudinary URL for wood chest: https://res.cloudinary.com/...
   ```

### Bước 2: Test URL trực tiếp

1. Copy URL từ Console logs
2. Paste vào browser address bar
3. Xem có load được ảnh không:
   - ✅ Load được → File tồn tại, có thể là vấn đề khác
   - ❌ 404 Not Found → File không tồn tại hoặc tên sai

### Bước 3: Kiểm tra trên Cloudinary Dashboard

1. Mở: https://cloudinary.com/console/media_library
2. Navigate đến: `family-tasks/chests/{type}/`
3. Kiểm tra:
   - [ ] File có tồn tại không?
   - [ ] Tên file là gì?
   - [ ] Folder path có đúng không?

## 🛠️ Cách sửa

### Cách 1: Đổi tên file trên Cloudinary (Khuyến nghị)

1. Mở Cloudinary Media Library
2. Click vào file cần đổi tên
3. Click "Rename" hoặc "Edit"
4. Đổi tên thành: `{type}_chest_closed.png`
   - Ví dụ: `wood_chest_closed.png`

### Cách 2: Upload lại với tên đúng

1. Xóa file cũ trên Cloudinary (nếu cần)
2. Upload lại file với tên đúng: `{type}_chest_closed.png`
3. Đảm bảo upload vào đúng folder: `family-tasks/chests/{type}/`

### Cách 3: Cập nhật code để hỗ trợ tên file khác

Nếu không thể đổi tên, có thể cập nhật code để hỗ trợ format tên file khác.

## 📋 Checklist

- [ ] Đã kiểm tra Console logs
- [ ] Đã test URL trực tiếp trong browser
- [ ] Đã kiểm tra trên Cloudinary Dashboard
- [ ] Đã xác nhận tên file trên Cloudinary
- [ ] Đã đổi tên file (nếu cần)
- [ ] Đã refresh web và kiểm tra lại

## 💡 Tips

1. **Dùng Console để debug**: Tất cả logs đều bắt đầu với `[ChestSystem]`
2. **Test URL trực tiếp**: Copy URL từ logs và paste vào browser
3. **Kiểm tra Network tab**: Xem request có thành công không (Status 200)
4. **Kiểm tra Cloudinary Dashboard**: Đảm bảo file đã được upload đúng

## 🔗 Links

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Local Web**: http://localhost:3000

