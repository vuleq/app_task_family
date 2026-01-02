# 🚀 Hướng dẫn sử dụng Cloudinary Extension trong Cursor

## ✅ Extension đã được cài đặt!

Bây giờ bạn có thể quản lý và upload files lên Cloudinary trực tiếp từ Cursor mà không cần mở trình duyệt.

---

## 📋 Bước 1: Cấu hình Extension

### 1.1. Lấy thông tin từ Cloudinary Dashboard

1. Mở: https://cloudinary.com/console
2. Vào **Settings** → **Product environment settings**
3. Copy các thông tin sau:
   - **Cloud name** (ví dụ: `dabc123xyz`)
   - **API Key** (ví dụ: `123456789012345`)
   - **API Secret** (ví dụ: `abcdefghijklmnopqrstuvwxyz`)

### 1.2. Tạo file cấu hình

Tạo file `environments.json` tại một trong các vị trí sau:

**Windows:**
```
C:\Users\{YourUsername}\.cloudinary\environments.json
```

**macOS/Linux:**
```
~/.cloudinary/environments.json
```

### 1.3. Nội dung file `environments.json`

Thay thế các giá trị bằng thông tin thực tế của bạn:

```json
{
  "your-cloud-name": {
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "uploadPreset": "your-upload-preset-name"
  }
}
```

**Ví dụ:**
```json
{
  "dabc123xyz": {
    "apiKey": "123456789012345",
    "apiSecret": "abcdefghijklmnopqrstuvwxyz",
    "uploadPreset": "family-tasks-upload"
  }
}
```

**Lưu ý:**
- Thay `your-cloud-name` bằng **Cloud name** thực tế của bạn
- Thay `your-api-key` bằng **API Key** thực tế
- Thay `your-api-secret` bằng **API Secret** thực tế
- Thay `your-upload-preset-name` bằng tên **Upload Preset** (nếu có)

---

## 🎯 Bước 2: Sử dụng Extension

### 2.1. Mở Cloudinary Panel

1. Trong Cursor, nhấn `Ctrl+Shift+X` (hoặc `Cmd+Shift+X` trên Mac) để mở Extensions
2. Tìm "Cloudinary" extension
3. Click vào extension để mở Cloudinary panel

Hoặc:

1. Click vào icon **Cloudinary** ở sidebar (nếu có)
2. Hoặc dùng Command Palette: `Ctrl+Shift+P` → gõ "Cloudinary"

### 2.2. Upload Files

#### Cách 1: Upload từ File Explorer
1. Click chuột phải vào file ảnh trong Cursor
2. Chọn **"Upload to Cloudinary"** (nếu có option này)
3. Chọn folder đích (ví dụ: `family-tasks/chests/wood`)
4. File sẽ được upload và URL sẽ được copy tự động

#### Cách 2: Dùng Command Palette
1. Nhấn `Ctrl+Shift+P` (hoặc `Cmd+Shift+P`)
2. Gõ "Cloudinary: Upload"
3. Chọn file cần upload
4. Nhập folder path (ví dụ: `family-tasks/chests/wood`)

#### Cách 3: Dùng Cloudinary Panel
1. Mở Cloudinary panel trong sidebar
2. Click nút **"Upload"** hoặc **"+"**
3. Chọn file từ máy tính
4. Nhập folder path và các thông tin khác
5. Click **"Upload"**

### 2.3. Xem và quản lý files

1. Mở Cloudinary panel
2. Browse các folder và files đã upload
3. Click vào file để xem preview
4. Copy URL bằng cách click vào file → Copy URL

---

## 📁 Upload Chest Files với Extension

### Upload từng loại rương:

1. **Wood Chest:**
   - Chọn file: `wood_chest_closed.png` từ folder `hinh_compress`
   - Upload vào folder: `family-tasks/chests/wood`
   - Tên file sẽ tự động giữ nguyên: `wood_chest_closed.png`

2. **Silver Chest:**
   - File: `silver_chest_closed.png`
   - Folder: `family-tasks/chests/silver`

3. **Gold Chest:**
   - File: `gold_chest_closed.png`
   - Folder: `family-tasks/chests/gold`

4. **Mystery Chest:**
   - File: `mystery_chest_closed.png`
   - Folder: `family-tasks/chests/mystery`

5. **Legendary Chest:**
   - File: `legendary_chest_closed.png`
   - Folder: `family-tasks/chests/legendary`

---

## 🔍 Kiểm tra files đã upload

Sau khi upload, bạn có thể:

1. **Xem trong Cloudinary Panel:**
   - Mở Cloudinary extension
   - Navigate đến folder: `family-tasks/chests/{type}/`
   - Xem danh sách files đã upload

2. **Kiểm tra trên Cloudinary Dashboard:**
   - Mở: https://cloudinary.com/console/media_library
   - Tìm folder: `family-tasks/chests/`
   - Xem các subfolders và files

3. **Kiểm tra URL:**
   - Click vào file trong Cloudinary panel
   - Copy URL
   - URL sẽ có dạng: `https://res.cloudinary.com/{cloud-name}/image/upload/family-tasks/chests/{type}/{filename}.png`

---

## ✅ Checklist

- [ ] Đã tạo file `environments.json` với đúng thông tin
- [ ] Đã mở Cloudinary extension trong Cursor
- [ ] Đã upload `wood_chest_closed.png` → `family-tasks/chests/wood/`
- [ ] Đã upload `silver_chest_closed.png` → `family-tasks/chests/silver/`
- [ ] Đã upload `gold_chest_closed.png` → `family-tasks/chests/gold/`
- [ ] Đã upload `mystery_chest_closed.png` → `family-tasks/chests/mystery/`
- [ ] Đã upload `legendary_chest_closed.png` → `family-tasks/chests/legendary/`
- [ ] Đã kiểm tra tên file đúng format: `{type}_chest_closed.png`
- [ ] Đã copy URL của từng file để cập nhật vào database

---

## 💡 Tips

1. **Tạo folder trước:** Nếu folder chưa tồn tại, Cloudinary sẽ tự động tạo khi upload
2. **Đổi tên file:** Có thể đổi tên file trên Cloudinary sau khi upload (nếu cần)
3. **Batch upload:** Một số extension hỗ trợ upload nhiều files cùng lúc
4. **Preview:** Xem preview ảnh trực tiếp trong Cursor
5. **Copy URL:** Click vào file để copy URL nhanh chóng

---

## 🆘 Troubleshooting

### Extension không hiển thị?
- Kiểm tra extension đã được enable chưa
- Restart Cursor
- Kiểm tra extension có tương thích với Cursor không

### Không upload được?
- Kiểm tra file `environments.json` có đúng format không
- Kiểm tra API Key và API Secret có đúng không
- Kiểm tra Upload Preset có tồn tại không (nếu cần)

### Không thấy files sau khi upload?
- Refresh Cloudinary panel
- Kiểm tra folder path có đúng không
- Kiểm tra trên Cloudinary Dashboard

---

## 🔗 Links hữu ích

- **Cloudinary Extension**: Tìm trong VS Code Marketplace
- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Cloudinary Media Library**: https://cloudinary.com/console/media_library
- **Cloudinary Documentation**: https://cloudinary.com/documentation

---

**Lưu ý:** Extension này đang ở phiên bản Beta, một số tính năng có thể thay đổi. Nếu gặp vấn đề, có thể dùng Cloudinary Dashboard hoặc script PowerShell như hướng dẫn trước.

