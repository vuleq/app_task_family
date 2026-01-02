# 🔗 Cách lấy Secure URL của Chest Images từ Cloudinary

## 📋 Bước 1: Mở từng folder và xem file

### Wood Chest:
1. Mở: https://console.cloudinary.com/app/c-c00b2fdfce4f3af4b4e8222e93c43a/assets/media_library/folders/cdbf5471e68940d6d7e9c3d12113a9178d?view_mode=mosaic
2. Click vào **file ảnh** trong folder (không phải folder)
3. Copy **"Secure URL"** hoặc **"URL"**

### Silver Chest:
1. Mở: https://console.cloudinary.com/app/c-c00b2fdfce4f3af4b4e8222e93c43a/assets/media_library/folders/cdbf547d21093c23658cc744d8a77c29f1?view_mode=mosaic
2. Click vào **file ảnh**
3. Copy **"Secure URL"**

### Gold Chest:
1. Mở: https://console.cloudinary.com/app/c-c00b2fdfce4f3af4b4e8222e93c43a/assets/media_library/folders/cdbf548549896afae975f98ea54a0c068b?view_mode=mosaic
2. Click vào **file ảnh**
3. Copy **"Secure URL"**

### Mystery Chest:
1. Mở: https://console.cloudinary.com/app/c-c00b2fdfce4f3af4b4e8222e93c43a/assets/media_library/folders/cdbf548fec892804b55e84677eb1d701f4?view_mode=mosaic
2. Click vào **file ảnh**
3. Copy **"Secure URL"**

### Legendary Chest:
1. Mở: https://console.cloudinary.com/app/c-c00b2fdfce4f3af4b4e8222e93c43a/assets/media_library/folders/cdbf549ab0895751897832be7d0eb56ebc?view_mode=mosaic
2. Click vào **file ảnh**
3. Copy **"Secure URL"**

## 📝 Bước 2: Ghi lại thông tin

Sau khi lấy Secure URL, ghi lại:

1. **Tên file** (Public ID) - Ví dụ: `family-tasks/chests/wood/wood_chest_closed.png`
2. **Secure URL** - Ví dụ: `https://res.cloudinary.com/.../family-tasks/chests/wood/wood_chest_closed.png`

## 🔍 Bước 3: Kiểm tra tên file

Secure URL sẽ có dạng:
```
https://res.cloudinary.com/{cloud-name}/image/upload/v{version}/family-tasks/chests/{type}/{filename}.png
```

Phần quan trọng là: `{filename}.png`

Ví dụ:
- `wood_chest_closed.png` ✅
- `closed.png` ⚠️
- `wood chest new.png` ❌ (có khoảng trắng)

## ✅ Checklist

- [ ] Wood chest: Tên file = `_________________`, Secure URL = `_________________`
- [ ] Silver chest: Tên file = `_________________`, Secure URL = `_________________`
- [ ] Gold chest: Tên file = `_________________`, Secure URL = `_________________`
- [ ] Mystery chest: Tên file = `_________________`, Secure URL = `_________________`
- [ ] Legendary chest: Tên file = `_________________`, Secure URL = `_________________`

## 🎯 Mục đích

Sau khi có Secure URL và tên file, chúng ta sẽ:
1. Kiểm tra xem tên file có đúng format `{type}_chest_closed.png` không
2. Nếu không đúng, có thể:
   - Đổi tên file trên Cloudinary
   - Hoặc cập nhật code để hỗ trợ tên file thực tế

