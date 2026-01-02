# 🔍 Kiểm tra nhanh Cloudinary

## ✅ Checklist kiểm tra:

### 1. Kiểm tra Extension đã cấu hình chưa

**Windows:**
```
C:\Users\{YourUsername}\.cloudinary\environments.json
```

File này cần có nội dung:
```json
{
  "your-cloud-name": {
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "uploadPreset": "your-upload-preset"
  }
}
```

### 2. Kiểm tra files đã upload

Mở Cloudinary Dashboard:
- Link: https://cloudinary.com/console/media_library/folders/family-tasks

Kiểm tra các folder sau:

#### ✅ `family-tasks/chests/wood/`
- [ ] Có file: `wood_chest_closed.png` hoặc `closed.png`

#### ✅ `family-tasks/chests/silver/`
- [ ] Có file: `silver_chest_closed.png` hoặc `closed.png`

#### ✅ `family-tasks/chests/gold/`
- [ ] Có file: `gold_chest_closed.png` hoặc `closed.png`

#### ✅ `family-tasks/chests/mystery/`
- [ ] Có file: `mystery_chest_closed.png` hoặc `closed.png`

#### ✅ `family-tasks/chests/legendary/`
- [ ] Có file: `legendary_chest_closed.png` hoặc `closed.png`

### 3. Kiểm tra tên file

**Format đúng:**
- `{type}_chest_closed.png` (ví dụ: `wood_chest_closed.png`)
- Hoặc: `closed.png` (cần cập nhật code để hỗ trợ)

**Format sai:**
- `wood chest new.png` ❌
- `wood-chest-closed.png` ❌
- `Wood_Chest_Closed.png` ❌ (case-sensitive)

### 4. Kiểm tra URL

Click vào file → Copy **Secure URL**

URL đúng sẽ có dạng:
```
https://res.cloudinary.com/{cloud-name}/image/upload/family-tasks/chests/{type}/{type}_chest_closed.png
```

Ví dụ:
```
https://res.cloudinary.com/dabc123xyz/image/upload/family-tasks/chests/wood/wood_chest_closed.png
```

---

## 🛠️ Nếu thiếu file hoặc sai tên:

### Cách 1: Dùng Cloudinary Extension trong Cursor
1. Mở Cloudinary extension
2. Upload file vào đúng folder
3. Đảm bảo tên file đúng format

### Cách 2: Dùng Cloudinary Dashboard
1. Mở: https://cloudinary.com/console/media_library
2. Navigate đến folder cần upload
3. Click "Upload" → Chọn file
4. Nhập folder path: `family-tasks/chests/{type}/`
5. Đổi tên file nếu cần (sau khi upload)

### Cách 3: Đổi tên file trên Cloudinary
1. Click vào file cần đổi tên
2. Click "Rename" hoặc "Edit"
3. Đổi thành: `{type}_chest_closed.png`

---

## 📝 Ghi chú:

- Code đang tìm file với format: `{type}_chest_closed.png`
- Nếu file có tên khác, cần đổi tên trên Cloudinary
- Hoặc cập nhật code để hỗ trợ format khác

---

## 🔗 Links:

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Folders**: https://cloudinary.com/console/media_library/folders/family-tasks

