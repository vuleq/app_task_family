# 🔧 Sửa Format .env.local

## ❌ Format SAI (hiện tại):

```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1 = 
"https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3"
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2 = 
"https://res.cloudinary.com/dvuy40chj/video/upload/v1767414925/background2_swr3yc.mp3"
```

**Vấn đề:**
- ❌ Có **dấu ngoặc kép** `"` xung quanh URL
- ❌ Có **khoảng trắng** xung quanh dấu `=`
- ❌ Có **xuống dòng** giữa tên biến và giá trị

---

## ✅ Format ĐÚNG:

```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767414925/background2_swr3yc.mp3
```

**Lưu ý:**
- ✅ **KHÔNG có** dấu ngoặc kép
- ✅ **KHÔNG có** khoảng trắng xung quanh dấu `=`
- ✅ Tên biến và giá trị trên **cùng 1 dòng**

---

## 🔧 Cách sửa:

1. **Mở file `.env.local`**
2. **Tìm và sửa** các dòng:
   - Xóa dấu ngoặc kép `"` ở đầu và cuối URL
   - Xóa khoảng trắng xung quanh dấu `=`
   - Đảm bảo tên biến và giá trị trên cùng 1 dòng

3. **Lưu file**
4. **Restart dev server** (Ctrl+C, rồi `npm run dev`)

---

## ✅ Sau khi sửa:

Console log sẽ hiển thị:
```
[BackgroundMusic] Using URL_X playlist: 2 tracks [1, 2]
```

Thay vì:
```
[BackgroundMusic] No music URL found, using fallback
```

