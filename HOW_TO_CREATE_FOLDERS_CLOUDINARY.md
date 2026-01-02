# 📁 Hướng dẫn Tạo Folder trên Cloudinary Dashboard

## 🎯 Có 2 cách tạo folder:

---

## 🔵 **CÁCH 1: Tạo folder khi Upload** (Dễ nhất - Khuyến nghị) ⭐

**Cloudinary tự động tạo folder khi bạn upload file vào folder đó!**

### Cách làm:
1. Khi upload file, trong phần **"Folder"**, nhập: `family-tasks/chests/wood`
2. Cloudinary sẽ **tự động tạo** các folder: `family-tasks` → `chests` → `wood`
3. Không cần tạo folder trước!

**Ví dụ:**
- Upload file `wood_chest_closed.png`
- Folder: `family-tasks/chests/wood`
- Cloudinary tự động tạo: `family-tasks/` → `chests/` → `wood/`

---

## 🟢 **CÁCH 2: Tạo folder thủ công** (Nếu muốn tạo trước)

### Bước 1: Tạo folder `family-tasks`
1. Vào **Media Library**
2. Click **"Create Folder"** hoặc icon folder (nếu có)
3. Tên folder: `family-tasks`
4. Click **"Create"**

### Bước 2: Tạo folder `chests` trong `family-tasks`
1. Click vào folder `family-tasks`
2. Click **"Create Folder"** (hoặc icon folder)
3. Tên folder: `chests`
4. Click **"Create"`

### Bước 3: Tạo các folder con cho từng loại rương
1. Click vào folder `chests`
2. Tạo các folder:
   - `wood`
   - `silver`
   - `gold`
   - `mystery`
   - `legendary`

---

## 💡 **Khuyến nghị: Dùng CÁCH 1**

**Lý do:**
- ✅ Đơn giản hơn, không cần tạo folder trước
- ✅ Tự động tạo folder khi upload
- ✅ Tiết kiệm thời gian

**Cách làm:**
1. Upload file `wood_chest_closed.png`
2. Trong phần **"Folder"**, nhập: `family-tasks/chests/wood`
3. Click **"Upload"**
4. Xong! Folder đã được tạo tự động

---

## 📋 Checklist khi Upload:

- [ ] Upload `wood_chest_closed.png` → Folder: `family-tasks/chests/wood`
- [ ] Upload `silver_chest_closed.png` → Folder: `family-tasks/chests/silver`
- [ ] Upload `gold_chest_closed.png` → Folder: `family-tasks/chests/gold`
- [ ] Upload `mystery_chest_closed.png` → Folder: `family-tasks/chests/mystery`
- [ ] Upload `legendary_chest_closed.png` → Folder: `family-tasks/chests/legendary`

**Lưu ý**: Chỉ cần nhập folder path khi upload, Cloudinary sẽ tự động tạo!

---

## 🎯 Cấu trúc Folder sau khi Upload:

```
family-tasks/
  └── chests/
      ├── wood/
      │   └── wood_chest_closed.png
      ├── silver/
      │   └── silver_chest_closed.png
      ├── gold/
      │   └── gold_chest_closed.png
      ├── mystery/
      │   └── mystery_chest_closed.png
      └── legendary/
          └── legendary_chest_closed.png
```

---

## ❓ FAQ:

**Q: Có cần tạo folder trước không?**  
A: Không cần! Cloudinary tự động tạo folder khi bạn upload file vào folder path đó.

**Q: Làm sao biết folder đã được tạo?**  
A: Sau khi upload, vào Media Library → bạn sẽ thấy folder structure bên trái.

**Q: Có thể đổi tên folder sau không?**  
A: Có, nhưng nên tạo đúng từ đầu để tránh phức tạp.

---

**Tóm lại: Chỉ cần upload file và nhập folder path, Cloudinary sẽ tự động tạo folder cho bạn!** 🚀

