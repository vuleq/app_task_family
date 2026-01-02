# 🎁 Mapping Hình Ảnh Phần Thưởng

## ✅ Code đã được cập nhật

Code đã tự động map tên file của bạn với các phần thưởng dựa trên chest type và item type.

---

## 📋 Tên File và Mapping

### **Format tên file:**
```
{chestType}-{itemType}.png
```

### **Danh sách file cần upload:**

| Chest Type | Item Type | File Name | URL Example |
|------------|-----------|-----------|-------------|
| Wood | coin | `Wood-coin.png` | `family-tasks/chests/rewards/Wood-coin.png` |
| Wood | XP | `Wood-XP.png` | `family-tasks/chests/rewards/Wood-XP.png` |
| Silver | coin | `Silver-coin.png` | `family-tasks/chests/rewards/Silver-coin.png` |
| Silver | XP | `Silver-XP.png` | `family-tasks/chests/rewards/Silver-XP.png` |
| Gold | coin | `Gold-coin.png` | `family-tasks/chests/rewards/Gold-coin.png` |
| Gold | XP | `Gold-XP.png` | `family-tasks/chests/rewards/Gold-XP.png` |
| Mystery | coin | `Mystery-coin.png` | `family-tasks/chests/rewards/Mystery-coin.png` |
| Mystery | XP | `Mystery-XP.png` | `family-tasks/chests/rewards/Mystery-XP.png` |
| Legendary | coin | `Legendary-coin.png` | `family-tasks/chests/rewards/Legendary-coin.png` |
| Legendary | XP | `Legendary-XP.png` | `family-tasks/chests/rewards/Legendary-XP.png` |

---

## 📤 Upload lên Cloudinary

### **Bước 1: Upload các file**

1. **Mở Cloudinary Dashboard**: https://cloudinary.com/console
2. **Click "Media Library"** → **"Upload"**
3. **Upload các file vào folder**: `family-tasks/chests/rewards/`

### **Danh sách file cần upload:**

- [ ] `Wood-coin.png`
- [ ] `Wood-XP.png`
- [ ] `Silver-coin.png`
- [ ] `Silver-XP.png`
- [ ] `Gold-coin.png`
- [ ] `Gold-XP.png`
- [ ] `Mystery-coin.png`
- [ ] `Mystery-XP.png`
- [ ] `Legendary-coin.png`
- [ ] `Legendary-XP.png`

### **Lưu ý về tên file:**

- **Chest type**: Viết hoa chữ cái đầu (Wood, Silver, Gold, Mystery, Legendary)
- **Item type**: 
  - `coin` viết thường
  - `XP` viết hoa
- **Extension**: `.png`

---

## 🎯 Cách hoạt động

1. Khi mở rương, code tự động:
   - Xác định chest type từ itemPool
   - Xác định item type (xp hoặc coins)
   - Tạo URL hình ảnh: `{chestType}-{itemType}.png`
   - Thêm vào `receivedItem.image`

2. Modal hiển thị kết quả sẽ:
   - Hiển thị hình ảnh phần thưởng (nếu có)
   - Hiển thị tên, mô tả và rarity

---

## ✅ Checklist

- [ ] Đã upload `Wood-coin.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Wood-XP.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Silver-coin.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Silver-XP.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Gold-coin.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Gold-XP.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Mystery-coin.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Mystery-XP.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Legendary-coin.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `Legendary-XP.png` → `family-tasks/chests/rewards/`
- [ ] Đã test mở rương và kiểm tra hình ảnh hiển thị

---

## 💡 Tips

1. **Nén hình ảnh trước**: Dùng TinyPNG để giảm dung lượng
2. **Giữ nguyên tên file**: Code đã tự động map, không cần đổi tên
3. **Case sensitive**: 
   - `Wood-coin.png` ✅
   - `wood-coin.png` ❌ (sẽ không match)
   - `Wood-Coin.png` ❌ (sẽ không match)

---

## 🔗 Links

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **TinyPNG**: https://tinypng.com/

---

**Lưu ý**: Code tự động map dựa trên chest type và item type. Bạn chỉ cần upload file với đúng tên và folder là được!

