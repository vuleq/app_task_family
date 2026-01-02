# 📤 Hướng dẫn Upload Files lên Cloudinary

## 🎯 Có 2 cách upload:

### **CÁCH 1: Upload qua Cloudinary Dashboard** (Dễ nhất - Khuyến nghị) ⭐

#### Bước 1: Mở Cloudinary Dashboard
1. Truy cập: **https://cloudinary.com/console**
2. Đăng nhập với tài khoản của bạn

#### Bước 2: Upload Chest Files

**Upload từng loại rương:**

1. **Wood Chest:**
   - Click **"Media Library"** → **"Upload"**
   - Chọn file: `wood_chest_closed.png` từ folder `hinh_compress`
   - Trong phần **"Folder"**, nhập: `family-tasks/chests/wood`
   - Click **"Upload"**
   - Copy **Secure URL** sau khi upload xong

2. **Silver Chest:**
   - Upload: `silver_chest_closed.png`
   - Folder: `family-tasks/chests/silver`

3. **Gold Chest:**
   - Upload: `gold_chest_closed.png`
   - Folder: `family-tasks/chests/gold`

4. **Mystery Chest:**
   - Upload: `mystery_chest_closed.png`
   - Folder: `family-tasks/chests/mystery`

5. **Legendary Chest:**
   - Upload: `legendary_chest_closed.png`
   - Folder: `family-tasks/chests/legendary`

#### Bước 3: Lấy URL

Sau khi upload, click vào ảnh → Copy **"Secure URL"**

URL sẽ có dạng:
```
https://res.cloudinary.com/{cloud-name}/image/upload/v1234567890/family-tasks/chests/wood/wood_chest_closed.png
```

#### Bước 4: Cập nhật vào Database

Khi tạo/chỉnh sửa rương trong app, dùng URL này để cập nhật vào `Chest.closedImageUrl`

---

### **CÁCH 2: Upload bằng Script** (Tự động)

#### Yêu cầu:
- Đã có Cloudinary credentials trong `.env.local`
- Đã cài đặt PowerShell

#### Cách chạy:
```powershell
cd "D:\linh tinh\web_for_FaSol\app_task_family"
powershell -ExecutionPolicy Bypass -File "scripts\upload-to-cloudinary.ps1"
```

**Lưu ý**: Script này cần load biến môi trường từ `.env.local`, có thể cần điều chỉnh.

---

## 📁 Cấu trúc Folder trên Cloudinary:

```
family-tasks/
  └── chests/
      ├── wood/
      │   └── closed.png (hoặc wood_chest_closed.png)
      ├── silver/
      │   └── closed.png
      ├── gold/
      │   └── closed.png
      ├── mystery/
      │   └── closed.png
      └── legendary/
          └── closed.png
```

---

## ✅ Checklist:

- [ ] Đăng nhập Cloudinary Dashboard
- [ ] Upload `wood_chest_closed.png` → folder `family-tasks/chests/wood`
- [ ] Upload `silver_chest_closed.png` → folder `family-tasks/chests/silver`
- [ ] Upload `gold_chest_closed.png` → folder `family-tasks/chests/gold`
- [ ] Upload `mystery_chest_closed.png` → folder `family-tasks/chests/mystery`
- [ ] Upload `legendary_chest_closed.png` → folder `family-tasks/chests/legendary`
- [ ] Copy URL của từng file
- [ ] Cập nhật URL vào database khi tạo/chỉnh sửa rương

---

## 🎬 Video/Animation cho Chest Opening:

Nếu bạn có video/animation khi mở rương (từ SORA), upload tương tự:

1. Upload file video/animation
2. Folder: `family-tasks/chests/{chestType}/`
3. Tên file: `opening.mp4` hoặc `opening.gif`
4. Copy URL và cập nhật vào `Chest.openingMediaUrl`

---

## 💡 Tips:

1. **Compress trước**: Dùng TinyPNG để compress ảnh trước khi upload (giảm dung lượng)
2. **Đúng folder**: Đảm bảo upload vào đúng folder để dễ quản lý
3. **Tên file**: Có thể đổi tên trên Cloudinary sau khi upload
4. **URL**: Cloudinary tự động optimize ảnh, URL có thể thêm transformation parameters

---

## 🔗 Links hữu ích:

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Upload**: https://cloudinary.com/console/media_library/upload

---

**Lưu ý**: Character files đã được copy vào `public/pic-avatar/`, không cần upload lên Cloudinary. Chỉ cần upload chest files và các file khác (items, coins, XP) nếu cần.

