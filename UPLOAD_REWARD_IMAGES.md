# 🎁 Hướng dẫn Upload Hình Ảnh Phần Thưởng Rương

## 📋 Mục tiêu
Upload hình ảnh phần thưởng lên Cloudinary để hiển thị sau khi mở rương.

---

## 📤 Bước 1: Upload Hình Ảnh lên Cloudinary

### **CÁCH 1: Upload qua Cloudinary Dashboard** (Khuyến nghị)

1. **Mở Cloudinary Dashboard**:
   - Link: https://cloudinary.com/console
   - Đăng nhập

2. **Upload Hình Ảnh**:
   - Click **"Media Library"** → **"Upload"**
   - Chọn **"Advanced"** hoặc **"Upload"**
   - Kéo thả hình ảnh vào
   - **Quan trọng**: Chọn folder đúng:
     - **Folder**: `family-tasks/chests/rewards/`
     - Hoặc: `family-tasks/chests/items/`

3. **Tên file** (khuyến nghị):
   - Format: `{type}_{value}_{rarity}.png`
   - Ví dụ:
     - `xp_50_common.png` - XP 50 (common)
     - `xp_100_common.png` - XP 100 (common)
     - `coins_10_common.png` - Coins 10 (common)
     - `coins_20_common.png` - Coins 20 (common)
     - `xp_200_rare.png` - XP 200 (rare)
     - `coins_50_rare.png` - Coins 50 (rare)
     - `xp_500_epic.png` - XP 500 (epic)
     - `coins_200_epic.png` - Coins 200 (epic)
     - `xp_1000_legendary.png` - XP 1000 (legendary)
     - `coins_500_legendary.png` - Coins 500 (legendary)

4. **Lấy Secure URL**:
   - Sau khi upload, click vào hình ảnh
   - Copy **"Secure URL"**
   - URL sẽ có dạng: `https://res.cloudinary.com/{cloud-name}/image/upload/v{version}/family-tasks/chests/rewards/{filename}.png`

### **CÁCH 2: Upload bằng Cloudinary Extension trong Cursor**

1. Mở Cloudinary extension trong Cursor
2. Click **"Upload"**
3. Chọn hình ảnh
4. Nhập folder path: `family-tasks/chests/rewards/`
5. Click **"Upload"**
6. Copy URL sau khi upload xong

---

## 📝 Bước 2: Cập nhật URL vào Code

Sau khi có Secure URL, cần cập nhật vào code:

### **File cần sửa**: `lib/firebase/chest.ts`

Tìm `DEFAULT_CHEST_ITEMS` và thêm field `image` cho từng item:

```typescript
export const DEFAULT_CHEST_ITEMS: Record<string, ChestItem[]> = {
  common: [
    { 
      id: 'xp_50', 
      type: 'xp', 
      name: 'XP Nhỏ', 
      value: 50, 
      rarity: 'common', 
      description: 'Nhận 50 XP',
      image: 'https://res.cloudinary.com/dvuy40chj/image/upload/v{version}/family-tasks/chests/rewards/xp_50_common.png'
    },
    { 
      id: 'xp_100', 
      type: 'xp', 
      name: 'XP Vừa', 
      value: 100, 
      rarity: 'common', 
      description: 'Nhận 100 XP',
      image: 'https://res.cloudinary.com/dvuy40chj/image/upload/v{version}/family-tasks/chests/rewards/xp_100_common.png'
    },
    // ... thêm image cho các item khác
  ],
  // ... tương tự cho rare, epic, legendary
}
```

---

## 📁 Cấu trúc Folder trên Cloudinary

```
family-tasks/
  └── chests/
      ├── rewards/          ← Upload hình ảnh phần thưởng vào đây
      │   ├── xp_50_common.png
      │   ├── xp_100_common.png
      │   ├── coins_10_common.png
      │   ├── coins_20_common.png
      │   ├── xp_200_rare.png
      │   ├── coins_50_rare.png
      │   ├── xp_500_epic.png
      │   ├── coins_200_epic.png
      │   ├── xp_1000_legendary.png
      │   └── coins_500_legendary.png
      ├── wood/
      ├── silver/
      ├── gold/
      ├── mystery/
      └── legendary/
```

---

## ✅ Checklist

- [ ] Đã upload hình ảnh phần thưởng lên Cloudinary
- [ ] Đã copy Secure URL của từng hình ảnh
- [ ] Đã cập nhật `image` field trong `DEFAULT_CHEST_ITEMS`
- [ ] Đã test mở rương và kiểm tra hình ảnh hiển thị

---

## 💡 Tips

1. **Nén hình ảnh trước khi upload**:
   - Dùng TinyPNG: https://tinypng.com/
   - Giảm dung lượng từ ~2MB xuống ~200-400KB

2. **Tên file nhất quán**:
   - Format: `{type}_{value}_{rarity}.png`
   - Dễ quản lý và tìm kiếm

3. **Kích thước hình ảnh**:
   - Khuyến nghị: 256x256px hoặc 512x512px
   - Format: PNG với transparent background (nếu cần)

4. **Cloudinary tự động optimize**:
   - Cloudinary tự động optimize hình ảnh
   - Có thể dùng transformation để resize nếu cần

---

## 🔗 Links hữu ích

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Upload**: https://cloudinary.com/console/media_library/upload
- **TinyPNG**: https://tinypng.com/

---

## 📋 Danh sách Items cần Upload

### Common Items:
- [ ] `xp_50_common.png` - XP 50
- [ ] `xp_100_common.png` - XP 100
- [ ] `coins_10_common.png` - Coins 10
- [ ] `coins_20_common.png` - Coins 20

### Rare Items:
- [ ] `xp_200_rare.png` - XP 200
- [ ] `xp_300_rare.png` - XP 300
- [ ] `coins_50_rare.png` - Coins 50
- [ ] `coins_100_rare.png` - Coins 100

### Epic Items:
- [ ] `xp_500_epic.png` - XP 500
- [ ] `coins_200_epic.png` - Coins 200
- [ ] `special_boost_epic.png` - Tăng Tốc

### Legendary Items:
- [ ] `xp_1000_legendary.png` - XP 1000
- [ ] `coins_500_legendary.png` - Coins 500
- [ ] `special_levelup_legendary.png` - Lên Level Ngay

---

**Lưu ý**: Sau khi upload và cập nhật URLs vào code, hình ảnh sẽ tự động hiển thị trong modal phần thưởng sau khi video mở rương xong.

