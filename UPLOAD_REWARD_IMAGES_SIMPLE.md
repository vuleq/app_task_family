# 🎁 Hướng dẫn Upload Hình Ảnh Phần Thưởng (Dùng tên file hiện tại)

## ✅ Code đã được cập nhật

Code đã tự động map tên file hiện tại của bạn với các phần thưởng. Bạn chỉ cần upload các file lên Cloudinary với tên file hiện tại.

---

## 📤 Upload lên Cloudinary

### **Bước 1: Upload các file hình ảnh**

1. **Mở Cloudinary Dashboard**: https://cloudinary.com/console
2. **Click "Media Library"** → **"Upload"**
3. **Upload các file sau vào folder**: `family-tasks/chests/rewards/`

### **Danh sách file cần upload:**

#### **XP Items:**
- `xp_star_small.png` - Dùng cho XP common (50, 100)
- `xp_star_medium.png` - Dùng cho XP rare (200, 300)
- `xp_gold.png` - Dùng cho XP epic (500)
- `xp_legendary.png` - Dùng cho XP legendary (1000)
- `xp_mystery.png` - Có thể dùng thay thế

#### **Coins Items:**
- `coin_pouch_small.png` - Dùng cho Coins common (10, 20)
- `coin_pouch_medium.png` - Dùng cho Coins rare (50, 100)
- `coin_gold.png` - Dùng cho Coins epic (200)
- `coin_legendary.png` - Dùng cho Coins legendary (500)
- `coin_mystery.png` - Có thể dùng thay thế

#### **Special Items:**
- `chest_item_mystery.png` - Dùng cho special epic
- `chest_item_legendary.png` - Dùng cho special legendary

---

## 📋 Mapping tự động

Code sẽ tự động map như sau:

| Item Type | Rarity | File Name |
|-----------|--------|-----------|
| XP | common | `xp_star_small.png` |
| XP | rare | `xp_star_medium.png` |
| XP | epic | `xp_gold.png` |
| XP | legendary | `xp_legendary.png` |
| Coins | common | `coin_pouch_small.png` |
| Coins | rare | `coin_pouch_medium.png` |
| Coins | epic | `coin_gold.png` |
| Coins | legendary | `coin_legendary.png` |
| Special | epic | `chest_item_mystery.png` |
| Special | legendary | `chest_item_legendary.png` |

---

## ✅ Checklist

- [ ] Đã upload `xp_star_small.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `xp_star_medium.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `xp_gold.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `xp_legendary.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `coin_pouch_small.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `coin_pouch_medium.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `coin_gold.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `coin_legendary.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `chest_item_mystery.png` → `family-tasks/chests/rewards/`
- [ ] Đã upload `chest_item_legendary.png` → `family-tasks/chests/rewards/`

---

## 💡 Tips

1. **Nén hình ảnh trước**: Dùng TinyPNG để giảm dung lượng
2. **Giữ nguyên tên file**: Không cần đổi tên, code sẽ tự động map
3. **Folder**: Upload vào `family-tasks/chests/rewards/`
4. **Test**: Sau khi upload, test mở rương để xem hình ảnh có hiển thị không

---

## 🔗 Links

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **TinyPNG**: https://tinypng.com/

---

**Lưu ý**: Bạn không cần đổi tên file! Code đã tự động map tên file hiện tại với các phần thưởng.

