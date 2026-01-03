# 🔧 Troubleshooting Playlist Nhạc Nền

## ❌ Vấn đề: Thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2` nhưng không nghe thấy nhạc

### 🔍 Nguyên nhân có thể:

1. **Vẫn còn `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` (single URL)**
   - Nếu bạn có cả `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` và `URL_2`, nhưng **KHÔNG có `URL_1`**, hệ thống sẽ dùng single URL thay vì tìm `URL_2`
   - **Giải pháp:** Xóa hoặc comment `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` nếu muốn dùng playlist

2. **Chưa restart dev server**
   - Next.js chỉ load environment variables khi khởi động
   - **Giải pháp:** Restart dev server (`npm run dev`)

3. **Thiếu `URL_1`**
   - Logic tìm từ `URL_1`, `URL_2`, ... theo thứ tự
   - Nếu không có `URL_1`, nó sẽ không tìm `URL_2`
   - **Giải pháp:** Đảm bảo có `URL_1` trước khi thêm `URL_2`

4. **Environment variable chưa được thêm đúng**
   - Kiểm tra tên biến có đúng không (case-sensitive)
   - Kiểm tra có khoảng trắng thừa không

---

## ✅ Cách kiểm tra và sửa:

### **Bước 1: Kiểm tra `.env.local`**

Mở file `.env.local` và kiểm tra:

```env
# ❌ SAI - Chỉ có URL_2, không có URL_1
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/.../music2.mp3

# ✅ ĐÚNG - Có cả URL_1 và URL_2
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/.../music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/.../music2.mp3
```

**Hoặc:**

```env
# ❌ SAI - Có cả single URL và URL_2 (sẽ dùng single URL)
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/.../music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/.../music2.mp3

# ✅ ĐÚNG - Xóa single URL, chỉ dùng URL_1 và URL_2
# NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/.../music1.mp3  (comment hoặc xóa)
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/.../music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/.../music2.mp3
```

### **Bước 2: Restart Dev Server**

Sau khi sửa `.env.local`:

1. **Dừng dev server** (Ctrl+C trong terminal)
2. **Khởi động lại:**
   ```bash
   npm run dev
   ```

### **Bước 3: Kiểm tra Console**

Mở browser console (F12) và tìm các log:
- `[BackgroundMusic] Using URL_X playlist: 2 tracks`
- `[BackgroundMusic] Loading track: 1/2`
- `[BackgroundMusic] Playing track: 1`

Nếu không thấy log này, có thể:
- Environment variable chưa được load
- Logic playlist chưa hoạt động đúng

---

## 🎯 Các cách setup đúng:

### **Cách 1: Dùng URL_1, URL_2, ... (Khuyến nghị nếu muốn nhiều bài)**

```env
# Phải có URL_1 trước
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/background2_xyz123.mp3
```

**Lưu ý:**
- ✅ Phải bắt đầu từ `URL_1`
- ✅ Đánh số liên tục (1, 2, 3, ...)
- ✅ Không cần `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` (single URL)

### **Cách 2: Dùng PLAYLIST (Comma-separated) - Khuyến nghị nhất**

```env
NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3,https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/background2_xyz123.mp3
```

**Lưu ý:**
- ✅ Các URL cách nhau bởi dấu **phẩy (`,`)**
- ✅ Không có khoảng trắng thừa
- ✅ Có thể có nhiều URL trên 1 dòng

### **Cách 3: Chỉ dùng single URL (nếu chỉ có 1 bài)**

```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3
```

---

## 🐛 Debug Steps:

1. **Kiểm tra console log:**
   - Mở browser console (F12)
   - Tìm log `[BackgroundMusic]`
   - Xem playlist có bao nhiêu tracks

2. **Kiểm tra network:**
   - Mở Network tab trong DevTools
   - Filter "media"
   - Xem có request đến file nhạc không
   - Xem status code (200 = OK, 404 = không tìm thấy)

3. **Kiểm tra audio element:**
   - Trong console, gõ: `document.querySelector('audio')`
   - Xem `src` attribute có đúng URL không

---

## ⚠️ Lưu ý quan trọng:

1. **Phải restart dev server** sau khi thêm/sửa environment variables
2. **Không mix** single URL với URL_X (chọn 1 trong 2)
3. **URL_X phải bắt đầu từ 1** (URL_1, URL_2, ...)
4. **Trên Vercel:** Phải thêm environment variables vào Vercel Dashboard và redeploy

---

## ✅ Checklist:

- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1` (bắt buộc)
- [ ] Đã thêm `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2`
- [ ] Đã xóa hoặc comment `NEXT_PUBLIC_BACKGROUND_MUSIC_URL` (nếu dùng playlist)
- [ ] Đã restart dev server
- [ ] Đã kiểm tra console log
- [ ] Đã kiểm tra network requests

---

**Nếu vẫn không hoạt động, hãy kiểm tra console log để xem playlist có được load đúng không!**

