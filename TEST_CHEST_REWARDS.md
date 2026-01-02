# 🧪 Hướng dẫn Test Mở Rương và Hiển thị Phần Thưởng

## ✅ Code đã sẵn sàng

Code đã được cập nhật để:
- ✅ Tự động thêm image URL vào phần thưởng khi mở rương
- ✅ Hiển thị hình ảnh phần thưởng trong modal
- ✅ Map đúng tên file với chest type và item type

---

## 🚀 Cách Test

### **Bước 1: Đảm bảo Web đang chạy**

```powershell
cd "D:\linh tinh\web_for_FaSol\app_task_family"
npm run dev
```

### **Bước 2: Thêm Coin để test**

1. Vào **Profile Page**
2. Scroll xuống phần **"💰 Test Coins"**
3. Click button **"+1000 Coins"** (hoặc số khác)
4. Kiểm tra coin có tăng không

### **Bước 3: Mua Rương**

1. Vào **Chest System** (trang rương)
2. Chọn một rương (Wood, Silver, Gold, Mystery, hoặc Legendary)
3. Click **"Purchase"** (Mua)
4. Kiểm tra coin có bị trừ không

### **Bước 4: Mở Rương**

1. Tìm rương vừa mua trong phần **"My Chests"**
2. Click **"Open"** (Mở)
3. **Video sẽ tự động chạy** (nếu có)
4. Sau khi video xong → **Modal hiển thị phần thưởng**

### **Bước 5: Kiểm tra Hình Ảnh Phần Thưởng**

Trong modal phần thưởng, kiểm tra:
- [ ] Hình ảnh có hiển thị không? (thay vì chỉ có text)
- [ ] Hình ảnh đúng với loại rương không?
  - Wood chest → `Wood-coin.png` hoặc `Wood-XP.png`
  - Silver chest → `Silver-coin.png` hoặc `Silver-XP.png`
  - Gold chest → `Gold-coin.png` hoặc `Gold-XP.png`
  - Mystery chest → `Mystery-coin.png` hoặc `Mystery-XP.png`
  - Legendary chest → `Legendary-coin.png` hoặc `Legendary-XP.png`
- [ ] Tên phần thưởng có đúng không?
- [ ] Mô tả có đúng không?

---

## 🔍 Debug nếu có vấn đề

### **1. Mở Browser Console (F12)**

Kiểm tra logs:
- Tìm logs bắt đầu bằng `[ChestSystem]`
- Xem URL hình ảnh được tạo
- Xem có lỗi nào không

### **2. Kiểm tra Network Tab**

1. Mở **Network tab** trong Developer Tools
2. Filter theo **Img**
3. Tìm request đến Cloudinary
4. Kiểm tra:
   - **Status**: Phải là `200 OK`
   - **URL**: Xem URL có đúng format không

### **3. Test URL trực tiếp**

1. Copy URL từ Console logs
2. Paste vào browser address bar
3. Xem có load được ảnh không:
   - ✅ Load được → File tồn tại
   - ❌ 404 Not Found → File không tồn tại hoặc tên sai

### **4. Kiểm tra trên Cloudinary Dashboard**

1. Mở: https://cloudinary.com/console/media_library
2. Navigate đến: `family-tasks/chests/rewards/`
3. Kiểm tra:
   - [ ] File có tồn tại không?
   - [ ] Tên file có đúng format không?
     - `Wood-coin.png` ✅
     - `wood-coin.png` ❌ (sai case)
     - `Wood-Coin.png` ❌ (sai case)

---

## 🐛 Troubleshooting

### **Vấn đề 1: Hình ảnh không hiển thị**

**Nguyên nhân có thể:**
- File chưa được upload
- Tên file sai (case sensitive)
- URL không đúng

**Giải pháp:**
1. Kiểm tra Console logs để xem URL được tạo
2. Kiểm tra trên Cloudinary Dashboard xem file có tồn tại không
3. Đảm bảo tên file đúng format: `{chestType}-{itemType}.png`

### **Vấn đề 2: Hình ảnh sai loại rương**

**Nguyên nhân:**
- Chest type được xác định sai từ itemPool

**Giải pháp:**
- Kiểm tra logic xác định chest type trong `openChest()`
- Có thể cần điều chỉnh logic nếu itemPool không đúng

### **Vấn đề 3: Video không chạy**

**Nguyên nhân:**
- Video chưa được upload
- URL video không đúng

**Giải pháp:**
- Kiểm tra `openingMediaUrl` trong database
- Hoặc kiểm tra mapping `chestOpeningVideoUrls` trong code

---

## ✅ Checklist Test

- [ ] Web đang chạy (`npm run dev`)
- [ ] Đã thêm coin để test
- [ ] Đã mua ít nhất 1 rương
- [ ] Đã mở rương
- [ ] Video có chạy không? (nếu có)
- [ ] Modal phần thưởng có hiển thị không?
- [ ] Hình ảnh phần thưởng có hiển thị không?
- [ ] Hình ảnh đúng với loại rương không?
- [ ] Tên và mô tả phần thưởng có đúng không?
- [ ] Coin/XP có được cộng vào profile không?

---

## 🎯 Test từng loại rương

Để test đầy đủ, nên test mở từng loại rương:

1. **Wood Chest** → Kiểm tra `Wood-coin.png` hoặc `Wood-XP.png`
2. **Silver Chest** → Kiểm tra `Silver-coin.png` hoặc `Silver-XP.png`
3. **Gold Chest** → Kiểm tra `Gold-coin.png` hoặc `Gold-XP.png`
4. **Mystery Chest** → Kiểm tra `Mystery-coin.png` hoặc `Mystery-XP.png`
5. **Legendary Chest** → Kiểm tra `Legendary-coin.png` hoặc `Legendary-XP.png`

---

## 💡 Tips

1. **Dùng Console để debug**: Tất cả logs đều bắt đầu với `[ChestSystem]`
2. **Test nhiều lần**: Mở nhiều rương để test các phần thưởng khác nhau
3. **Kiểm tra Network tab**: Xem request có thành công không
4. **Kiểm tra Cloudinary Dashboard**: Đảm bảo file đã được upload đúng

---

## 🔗 Links

- **Local Web**: http://localhost:3000
- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library

---

**Chúc bạn test thành công!** 🎉

