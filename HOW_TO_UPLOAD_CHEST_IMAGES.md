# 📤 Hướng dẫn Upload Ảnh Rương lên Cloudinary

## 🎯 Tóm tắt nhanh:

1. **TinyPNG**: Chỉ để **compress** ảnh (giảm dung lượng) - KHÔNG phải nơi lưu trữ
2. **Cloudinary**: Là nơi **lưu trữ** ảnh cho app - ĐÂY là nơi bạn upload ảnh

---

## 📋 QUY TRÌNH ĐẦY ĐỦ:

### Bước 1: Compress ảnh (Tùy chọn nhưng khuyến nghị)

**Mục đích**: Giảm dung lượng từ ~2MB xuống ~200-400KB

1. Vào **https://tinypng.com/**
2. Kéo thả tất cả ảnh vào website
3. Đợi compress (tự động)
4. **Download** ảnh đã compress về máy

**Lưu ý**: TinyPNG chỉ để compress, KHÔNG phải nơi lưu trữ. Bạn phải download về và upload lên Cloudinary.

---

### Bước 2: Upload lên Cloudinary

Có **2 cách** để upload:

---

## 🔵 **CÁCH 1: Upload qua Cloudinary Dashboard** (Dễ nhất - Khuyến nghị)

### Bước 1: Đăng nhập Cloudinary
1. Vào **https://cloudinary.com/console**
2. Đăng nhập với tài khoản của bạn

### Bước 2: Upload ảnh
1. Click **"Media Library"** (hoặc **"Assets"**)
2. Click **"Upload"** (góc trên bên phải)
3. Chọn **"Advanced"** hoặc **"Upload"**
4. Kéo thả ảnh vào
5. **Quan trọng**: Chọn folder đúng:
   - **Folder**: `family-tasks/chests/{chestType}/`
   - Ví dụ:
     - `family-tasks/chests/wood/` cho rương gỗ
     - `family-tasks/chests/silver/` cho rương bạc
     - `family-tasks/chests/gold/` cho rương vàng
     - `family-tasks/chests/mystery/` cho rương bí ẩn
     - `family-tasks/chests/legendary/` cho rương huyền thoại

### Bước 3: Lấy URL
1. Sau khi upload, click vào ảnh
2. Copy **"Secure URL"** hoặc **"URL"**
3. URL sẽ có dạng: `https://res.cloudinary.com/.../family-tasks/chests/wood/closed.png`

### Bước 4: Cập nhật vào Database
- Dùng URL này để cập nhật vào `Chest.closedImageUrl` hoặc `Chest.openingMediaUrl`

---

## 🟢 **CÁCH 2: Upload qua App** (Tự động)

Nếu bạn đã có UI để upload trong app:

1. Vào app → Tạo/Chỉnh sửa rương
2. Click "Upload Image" hoặc "Choose File"
3. Chọn ảnh từ máy
4. App sẽ tự động:
   - Upload lên Cloudinary
   - Tự động compress
   - Lưu URL vào database

**Lưu ý**: Cách này cần có UI upload trong app (có thể chưa có).

---

## 📁 Cấu trúc Folder trên Cloudinary:

```
family-tasks/
  └── chests/
      ├── wood/
      │   ├── closed.png
      │   └── opening.mp4
      ├── silver/
      │   ├── closed.png
      │   └── opening.mp4
      ├── gold/
      │   ├── closed.png
      │   └── opening.mp4
      ├── mystery/
      │   ├── closed.png
      │   └── opening.mp4
      └── legendary/
          ├── closed.png
          └── opening.mp4
```

---

## ✅ Checklist:

- [ ] Compress ảnh bằng TinyPNG (nếu ảnh > 500KB)
- [ ] Đăng nhập Cloudinary Dashboard
- [ ] Tạo folder đúng: `family-tasks/chests/{chestType}/`
- [ ] Upload ảnh vào đúng folder
- [ ] Copy URL từ Cloudinary
- [ ] Cập nhật URL vào database (hoặc dùng UI trong app)

---

## 🎨 Tên file đề xuất:

- **Ảnh rương đóng**: `closed.png` hoặc `closed.jpg`
- **Video/animation mở**: `opening.mp4` hoặc `opening.gif`

---

## 💡 Tips:

1. **Compress trước**: Dùng TinyPNG để giảm dung lượng trước khi upload
2. **Đúng folder**: Đảm bảo upload vào đúng folder để dễ quản lý
3. **Tên file rõ ràng**: Dùng tên file dễ nhớ (closed.png, opening.mp4)
4. **Cloudinary tự động optimize**: Cloudinary sẽ tự động compress thêm khi upload

---

## ❓ FAQ:

**Q: TinyPNG có lưu trữ ảnh không?**  
A: Không. TinyPNG chỉ compress, bạn phải download về và upload lên Cloudinary.

**Q: Có thể upload trực tiếp lên Cloudinary không compress?**  
A: Có, nhưng file sẽ lớn hơn. Cloudinary sẽ tự động optimize một phần.

**Q: Làm sao biết đã upload đúng folder?**  
A: Vào Cloudinary Dashboard → Media Library → Kiểm tra path của ảnh.

**Q: Có thể upload nhiều ảnh cùng lúc không?**  
A: Có, Cloudinary hỗ trợ upload nhiều file cùng lúc.

---

## 🚀 Quick Start:

1. **Compress**: https://tinypng.com/ → Upload → Download
2. **Upload**: https://cloudinary.com/console → Media Library → Upload → Chọn folder
3. **Copy URL**: Click ảnh → Copy Secure URL
4. **Dùng URL**: Cập nhật vào database hoặc dùng trong app

---

**Lưu ý**: Cloudinary đã được setup sẵn trong code. Bạn chỉ cần upload ảnh lên Cloudinary và lấy URL để dùng!

