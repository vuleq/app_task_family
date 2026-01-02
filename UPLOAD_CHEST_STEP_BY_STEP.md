# 📤 Hướng dẫn Upload Chest Files - Từng Bước

## 🎯 Mục tiêu: Upload 5 chest files lên Cloudinary

---

## 📋 Bước 1: Đăng nhập Cloudinary

1. Cloudinary Dashboard đã được mở: **https://cloudinary.com/console**
2. Đăng nhập với tài khoản của bạn
3. Nếu chưa có tài khoản, đăng ký miễn phí tại: https://cloudinary.com/

---

## 📋 Bước 2: Upload Wood Chest

1. Click **"Media Library"** (menu bên trái)
2. Click nút **"Upload"** (góc trên bên phải, có icon upload)
3. Chọn **"Advanced"** hoặc **"Upload"**
4. **Kéo thả** hoặc **Browse** file: `wood_chest_closed.png`
   - File nằm trong: `D:\linh tinh\web_for_FaSol\hinh_compress\wood_chest_closed.png`
5. **Quan trọng**: Trong phần **"Folder"**, nhập:
   ```
   family-tasks/chests/wood
   ```
6. Click **"Upload"**
7. Đợi upload xong
8. Click vào ảnh vừa upload → Copy **"Secure URL"** (URL có dạng `https://res.cloudinary.com/...`)

---

## 📋 Bước 3: Upload Silver Chest

1. Click **"Upload"** lại
2. Chọn file: `silver_chest_closed.png`
3. Folder: `family-tasks/chests/silver`
4. Click **"Upload"**
5. Copy **Secure URL**

---

## 📋 Bước 4: Upload Gold Chest

1. Click **"Upload"**
2. Chọn file: `gold_chest_closed.png`
3. Folder: `family-tasks/chests/gold`
4. Click **"Upload"**
5. Copy **Secure URL**

---

## 📋 Bước 5: Upload Mystery Chest

1. Click **"Upload"**
2. Chọn file: `mystery_chest_closed.png`
3. Folder: `family-tasks/chests/mystery`
4. Click **"Upload"**
5. Copy **Secure URL**

---

## 📋 Bước 6: Upload Legendary Chest

1. Click **"Upload"**
2. Chọn file: `legendary_chest_closed.png`
3. Folder: `family-tasks/chests/legendary`
4. Click **"Upload"**
5. Copy **Secure URL**

---

## ✅ Checklist:

- [ ] Wood chest uploaded → URL: `_________________`
- [ ] Silver chest uploaded → URL: `_________________`
- [ ] Gold chest uploaded → URL: `_________________`
- [ ] Mystery chest uploaded → URL: `_________________`
- [ ] Legendary chest uploaded → URL: `_________________`

---

## 📝 Lưu URLs:

Sau khi upload xong, lưu các URLs vào đâu đó để dùng sau:

```
Wood: https://res.cloudinary.com/...
Silver: https://res.cloudinary.com/...
Gold: https://res.cloudinary.com/...
Mystery: https://res.cloudinary.com/...
Legendary: https://res.cloudinary.com/...
```

---

## 🎯 Sau khi upload:

1. **Test trong app**: Cập nhật URL vào database khi tạo/chỉnh sửa rương
2. **Hoặc**: Tôi có thể giúp bạn tạo script để tự động cập nhật URLs vào database

---

## 💡 Tips:

- **Upload nhiều file cùng lúc**: Có thể chọn nhiều file và upload cùng lúc, nhưng cần set folder cho từng file
- **Kiểm tra folder**: Sau khi upload, vào Media Library → kiểm tra xem file có nằm đúng folder không
- **Rename trên Cloudinary**: Có thể đổi tên file trên Cloudinary sau khi upload

---

**Bạn đã đăng nhập Cloudinary chưa? Nếu rồi, bắt đầu upload từ Bước 2 nhé!** 🚀

