# 📁 Hướng dẫn sử dụng Files sau khi Rename

## ✅ Đã hoàn thành:

1. ✅ **Rename 59 files** theo format nhất quán
2. ✅ **Copy 36 character files** vào `public/pic-avatar/`

---

## 📂 Nơi lưu trữ Files:

### 1. **Character Files** → `public/pic-avatar/`

**Đã copy vào project:**
- `nam1.png`, `nam2.png`, `nu1.png`, `nu2.png` (avatar cơ bản)
- `nam_bs_level5.png`, `nam_bs_level10.png`, ... (nam bác sĩ)
- `nu_bs_level5.png`, `nu_bs_level10.png`, ... (nữ bác sĩ)
- `nam_ch_level5.png`, `nam_ch_level10.png`, ... (nam cứu hỏa)
- `nam_cs_level5.png`, `nam_cs_level10.png`, ... (nam cảnh sát)

**Cách sử dụng:**
- Files đã có trong `public/pic-avatar/`
- Code tự động load từ `/pic-avatar/`
- **Không cần upload** - dùng trực tiếp trong project

---

### 2. **Chest Files** → Upload lên **Cloudinary**

**Files cần upload:**
- `wood_chest_closed.png`
- `silver_chest_closed.png`
- `gold_chest_closed.png`
- `mystery_chest_closed.png`
- `legendary_chest_closed.png`

**Cách upload:**
1. Vào **https://cloudinary.com/console**
2. Media Library → Upload
3. Upload vào folder: `family-tasks/chests/{chestType}/`
   - Ví dụ: `family-tasks/chests/wood/closed.png`
4. Copy URL và cập nhật vào database khi tạo/chỉnh sửa rương

**Xem chi tiết:** `HOW_TO_UPLOAD_CHEST_IMAGES.md`

---

### 3. **Chest Item Files** → Upload lên **Cloudinary** (nếu cần)

**Files:**
- `chest_item_wood.png`, `chest_item_wood_nam.png`, `chest_item_wood_nu.png`
- `chest_item_silver.png`, `chest_item_silver_nu.png`
- `chest_item_gold.png`, `chest_item_gold_nam.png`, `chest_item_gold_nu.png`
- `chest_item_mystery.png`, `chest_item_mystery_nam.png`, `chest_item_mystery_nu.png`
- `chest_item_legendary_nam.png`, `chest_item_legendary_nu.png`, `chest_item_legendary_nu2.png`

**Cách upload:**
- Upload vào folder: `family-tasks/chests/items/`
- Hoặc `family-tasks/chests/{chestType}/items/`

---

### 4. **Coin & XP Files** → Upload lên **Cloudinary** (nếu cần)

**Files:**
- `coin_gold.png`, `coin_legendary.png`, `coin_mystery.png`
- `coin_pouch_small.png`, `coin_pouch_medium.png`
- `xp_gold.png`, `xp_mystery.png`, `xp_legendary.png`
- `xp_star_small.png`, `xp_star_medium.png`

**Cách upload:**
- Upload vào folder: `family-tasks/items/` hoặc `family-tasks/rewards/`

---

## 🎯 Tóm tắt:

| Loại File | Nơi lưu trữ | Cách sử dụng |
|-----------|-------------|--------------|
| **Character** | `public/pic-avatar/` | ✅ Đã copy, dùng trực tiếp |
| **Chest (closed)** | Cloudinary | Upload lên Cloudinary |
| **Chest (opening)** | Cloudinary | Upload lên Cloudinary (video/animation) |
| **Chest Items** | Cloudinary | Upload lên Cloudinary (nếu cần) |
| **Coins/XP** | Cloudinary | Upload lên Cloudinary (nếu cần) |

---

## ✅ Checklist:

- [x] Rename tất cả files theo format
- [x] Copy character files vào `public/pic-avatar/`
- [ ] Upload chest files lên Cloudinary
- [ ] Upload chest opening videos/animation lên Cloudinary
- [ ] Test hiển thị character trong app
- [ ] Test hiển thị chest trong app

---

## 🚀 Next Steps:

1. **Character files**: Đã sẵn sàng, có thể test ngay
2. **Chest files**: Upload lên Cloudinary và cập nhật URL vào database
3. **Test**: Kiểm tra hiển thị trong app

---

**Lưu ý**: 
- Character files đã được copy vào project, không cần upload
- Chest files cần upload lên Cloudinary để sử dụng
- Xem `HOW_TO_UPLOAD_CHEST_IMAGES.md` để biết cách upload chest files

