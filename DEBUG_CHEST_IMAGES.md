# 🔍 Hướng dẫn Debug và Kiểm tra Hình ảnh Rương

## ✅ Code đã được cập nhật

Code đã được cập nhật để:
1. ✅ Hiển thị hình ảnh rương từ Cloudinary
2. ✅ Có logging để debug trong console
3. ✅ Có fallback nếu ảnh không load được

## 🚀 Cách kiểm tra

### Bước 1: Start web application

```powershell
cd "D:\linh tinh\web_for_FaSol\app_task_family"
npm run dev
```

### Bước 2: Mở Browser Console

1. Mở web: http://localhost:3000
2. Đăng nhập vào tài khoản
3. Mở **Developer Tools** (F12 hoặc Ctrl+Shift+I)
4. Chuyển sang tab **Console**

### Bước 3: Kiểm tra Logs

Trong Console, bạn sẽ thấy các logs như:

```
[ChestSystem] Generated Cloudinary URL for wood chest: https://res.cloudinary.com/...
[ChestSystem] Successfully loaded chest image: https://res.cloudinary.com/...
```

Hoặc nếu có lỗi:
```
[ChestSystem] Failed to load chest image: https://res.cloudinary.com/...
```

### Bước 4: Kiểm tra Network Tab

1. Trong Developer Tools, chuyển sang tab **Network**
2. Filter theo **Img** hoặc **All**
3. Tìm các request đến Cloudinary
4. Kiểm tra:
   - **Status**: Phải là `200 OK` (thành công) hoặc `404` (không tìm thấy)
   - **URL**: Xem URL có đúng format không

## 🔍 Các trường hợp cần kiểm tra

### 1. URL được tạo đúng không?

**Format đúng:**
```
https://res.cloudinary.com/{cloud-name}/image/upload/family-tasks/chests/{type}/{type}_chest_closed.png
```

**Ví dụ:**
```
https://res.cloudinary.com/dabc123xyz/image/upload/family-tasks/chests/wood/wood_chest_closed.png
```

### 2. File có tồn tại trên Cloudinary không?

Kiểm tra trên Cloudinary Dashboard:
- Link: https://cloudinary.com/console/media_library/folders/family-tasks

Đảm bảo:
- Folder: `family-tasks/chests/{type}/`
- File: `{type}_chest_closed.png`

### 3. Tên file có đúng không?

**Đúng:**
- `wood_chest_closed.png` ✅
- `silver_chest_closed.png` ✅
- `gold_chest_closed.png` ✅

**Sai:**
- `wood chest new.png` ❌
- `Wood_Chest_Closed.png` ❌ (case-sensitive)
- `wood-chest-closed.png` ❌

### 4. Cloud Name có đúng không?

Kiểm tra trong `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

Cloud name trong URL phải khớp với cloud name trên Cloudinary Dashboard.

## 🛠️ Troubleshooting

### Vấn đề 1: Ảnh không hiển thị, chỉ thấy emoji 📦

**Nguyên nhân:**
- File không tồn tại trên Cloudinary
- Tên file sai
- URL sai format

**Giải pháp:**
1. Kiểm tra Console logs để xem URL được tạo
2. Copy URL và paste vào browser để test
3. Kiểm tra trên Cloudinary Dashboard xem file có tồn tại không
4. Đảm bảo tên file đúng format: `{type}_chest_closed.png`

### Vấn đề 2: Ảnh hiển thị nhưng bị lỗi 404

**Nguyên nhân:**
- File chưa được upload
- Tên file sai
- Folder path sai

**Giải pháp:**
1. Upload file lên Cloudinary vào đúng folder
2. Đảm bảo tên file đúng format
3. Kiểm tra lại folder path trên Cloudinary

### Vấn đề 3: URL đúng nhưng ảnh không load

**Nguyên nhân:**
- CORS issue
- File bị private
- Upload preset chưa được cấu hình đúng

**Giải pháp:**
1. Kiểm tra Upload Preset trên Cloudinary có cho phép unsigned upload không
2. Kiểm tra file có bị private không
3. Thử copy URL và mở trực tiếp trong browser

## 📋 Checklist

- [ ] Web đã được start (`npm run dev`)
- [ ] Đã mở Browser Console (F12)
- [ ] Đã đăng nhập vào web
- [ ] Đã vào trang Chest System
- [ ] Kiểm tra Console logs
- [ ] Kiểm tra Network tab
- [ ] Kiểm tra ảnh có hiển thị không
- [ ] Nếu không hiển thị, kiểm tra URL trong logs
- [ ] Kiểm tra file có tồn tại trên Cloudinary không
- [ ] Kiểm tra tên file có đúng format không

## 💡 Tips

1. **Dùng Console để debug**: Tất cả logs đều bắt đầu với `[ChestSystem]`
2. **Test URL trực tiếp**: Copy URL từ logs và paste vào browser để test
3. **Kiểm tra Network tab**: Xem request có thành công không
4. **Kiểm tra Cloudinary Dashboard**: Đảm bảo file đã được upload đúng

## 🔗 Links hữu ích

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Local Web**: http://localhost:3000

