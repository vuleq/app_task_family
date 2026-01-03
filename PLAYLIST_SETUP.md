# 🎵 Hướng dẫn Setup Playlist Nhạc Nền

## ✅ Tính năng mới:

- ✅ Hỗ trợ **nhiều bài nhạc** trong playlist
- ✅ **Tự động chuyển bài** khi bài hiện tại kết thúc
- ✅ Nút **Previous/Next** để chuyển bài thủ công
- ✅ Hiển thị **số thứ tự bài** (Bài 1/3, Bài 2/3, ...)
- ✅ **Backward compatible** - vẫn hoạt động với single URL

---

## 🎼 Cách Setup Playlist:

### **Cách 1: Dùng biến Playlist (Comma-separated) - Khuyến nghị**

Thêm vào `.env.local`:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3,https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/background2_xyz123.mp3,https://res.cloudinary.com/dvuy40chj/video/upload/v1767406710/background3_abc456.mp3
```

**Lưu ý:** 
- Các URL cách nhau bởi dấu **phẩy (`,`)**
- Không có khoảng trắng thừa
- Mỗi URL trên 1 dòng hoặc tất cả trên 1 dòng đều được

### **Cách 2: Dùng nhiều biến URL_1, URL_2, ...**

Thêm vào `.env.local`:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/background2_xyz123.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_3=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406710/background3_abc456.mp3
```

**Lưu ý:**
- Đánh số liên tục từ 1, 2, 3, ...
- Nếu thiếu số nào (ví dụ có 1, 2, 4 nhưng không có 3), playlist sẽ dừng ở bài 2

### **Cách 3: Single URL (Backward compatible)**

Nếu chỉ có 1 bài, vẫn dùng:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/background1_yrb9be.mp3
```

---

## 🚀 Setup trên Vercel:

Sau khi setup trong `.env.local`, bạn **PHẢI** thêm vào Vercel Dashboard:

### **Nếu dùng Cách 1 (Playlist):**

1. Vào **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Thêm biến:
   - **Name**: `NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST`
   - **Value**: Paste tất cả URLs, cách nhau bởi dấu phẩy
   - **Environment**: Chọn cả 3 (Production, Preview, Development)
3. Click **Save**

### **Nếu dùng Cách 2 (URL_1, URL_2, ...):**

1. Vào **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Thêm từng biến:
   - `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1` = URL bài 1
   - `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2` = URL bài 2
   - `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_3` = URL bài 3
   - ... (tiếp tục nếu có nhiều hơn)
3. Mỗi biến chọn cả 3 môi trường
4. Click **Save** cho từng biến

### **Redeploy:**

Sau khi thêm environment variables, **BẮT BUỘC** phải redeploy:
- Vào **Deployments** tab
- Click **"..."** → **"Redeploy"**

---

## 🎮 Cách sử dụng:

1. **Tự động chuyển bài:**
   - Khi bài hiện tại kết thúc, tự động chuyển sang bài tiếp theo
   - Khi đến bài cuối, quay lại bài đầu (loop playlist)

2. **Chuyển bài thủ công:**
   - Click nút **◀** (Previous) để nghe bài trước
   - Click nút **▶** (Next) để nghe bài tiếp theo

3. **Xem số thứ tự:**
   - Hiển thị "Bài 1/3", "Bài 2/3", ... ở control panel

---

## 📝 Ví dụ Setup:

### **Ví dụ 1: 3 bài nhạc**

`.env.local`:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/music1.mp3,https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/music2.mp3,https://res.cloudinary.com/dvuy40chj/video/upload/v1767406710/music3.mp3
```

### **Ví dụ 2: 2 bài nhạc (dùng URL_1, URL_2)**

`.env.local`:
```env
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406708/music1.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2=https://res.cloudinary.com/dvuy40chj/video/upload/v1767406709/music2.mp3
```

---

## ⚙️ Ưu tiên Load Playlist:

Hệ thống sẽ load playlist theo thứ tự ưu tiên:

1. **NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST** (comma-separated) - **Ưu tiên cao nhất**
2. **NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1, URL_2, ...** (nhiều biến)
3. **NEXT_PUBLIC_BACKGROUND_MUSIC_URL** (single URL - backward compatible)
4. **Fallback** (nếu không có gì)

---

## 🎯 Lưu ý:

- ✅ **Không giới hạn số lượng bài** trong playlist
- ✅ **Tự động loop** playlist (khi đến bài cuối, quay lại bài đầu)
- ✅ **Lưu trạng thái** - nhớ bài đang nghe (nếu có thể)
- ✅ **Backward compatible** - vẫn hoạt động với single URL cũ
- ⚠️ **Phải redeploy** sau khi thêm environment variables trên Vercel

---

**Sau khi setup xong, playlist sẽ tự động chuyển bài khi hết! 🎵**

