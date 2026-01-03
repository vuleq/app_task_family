# 🎵 Hướng dẫn Setup Nhạc Nền

## ✅ Tính năng đã được thêm:

- ✅ Nhạc nền tự động phát khi login vào web
- ✅ Nút Play/Pause để điều khiển
- ✅ Điều chỉnh volume (mặc định 35% - vừa đủ nghe)
- ✅ Nút Mute/Unmute
- ✅ Lưu preferences vào localStorage (nhớ trạng thái play/pause và volume)
- ✅ Nhạc tự động loop (lặp lại)

## 🎨 Vị trí:

Nhạc nền control nằm ở **góc dưới bên phải** màn hình, chỉ hiển thị khi đã login.

## 🎼 Cách thêm nhạc nền của bạn:

### Option 1: Upload lên Cloudinary (Khuyến nghị)

1. **Upload file nhạc lên Cloudinary:**
   - Vào **Cloudinary Dashboard**: https://cloudinary.com/console
   - Click **"Media Library"** → **"Upload"**
   - Chọn file MP3 của bạn
   - **Folder**: `family-tasks/music/` (tự động tạo nếu chưa có)
   - Click **"Upload"**
   - Copy **Secure URL** sau khi upload xong
   - **Xem hướng dẫn chi tiết:** `UPLOAD_MUSIC_TO_CLOUDINARY.md`

2. **Thêm vào Environment Variable:**

   **⚠️ QUAN TRỌNG:** Phải thêm vào **CẢ 2 nơi**:
   
   **a) Vercel Dashboard (cho Production):**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Thêm biến: `NEXT_PUBLIC_BACKGROUND_MUSIC_URL`
   - Value: URL từ Cloudinary
   - Chọn cả 3 môi trường: Production, Preview, Development
   - **Redeploy** (bắt buộc!)
   - **Xem hướng dẫn chi tiết:** `ADD_MUSIC_TO_VERCEL.md`
   
   **b) `.env.local` (cho Local Development):**
   ```env
   NEXT_PUBLIC_BACKGROUND_MUSIC_URL=https://res.cloudinary.com/your-cloud/video/upload/your-music.mp3
   ```

### Option 2: Tạo nhạc bằng AI (Khuyến nghị cho nhạc nền tùy chỉnh)

**Các công cụ AI tạo nhạc tốt nhất:**

1. **OpenMusic AI** ⭐ (Khuyến nghị)
   - URL: https://openmusic.ai
   - ✅ Miễn phí, không bản quyền
   - ✅ Tạo nhạc dài tới 8 phút
   - ✅ Chất lượng chuyên nghiệp
   - ✅ Có thể dùng thương mại
   - **Cách dùng:** Chọn mood/emotion (relaxing, peaceful, calm) → Generate → Download MP3

2. **Canva AI Music Generator**
   - URL: https://www.canva.com/vi_vn/tinh-nang/nhac-ai/
   - ✅ Dễ sử dụng, tích hợp với Canva
   - ✅ Chọn mood, genre, theme
   - ⚠️ Cần tài khoản Canva

3. **FreeMusic AI**
   - URL: https://www.freemusic.ai
   - ✅ Miễn phí, không bản quyền
   - ✅ Tạo từ text prompt
   - ✅ Nhiều style và genre

4. **Adobe Firefly** (Nếu có Adobe account)
   - URL: https://www.adobe.com/products/firefly/features/ai-music-generator.html
   - ✅ Chất lượng cao
   - ✅ Tùy chỉnh nhiều tham số
   - ⚠️ Cần tài khoản Adobe

**Gợi ý prompt cho nhạc nền dễ chịu:**
- "Calm ambient background music, peaceful, relaxing, instrumental, no vocals, soft piano and strings, 60-80 BPM"
- "Lo-fi hip hop background music, chill, study music, soft beats, relaxing"
- "Gentle acoustic instrumental, peaceful, background music for app, soft guitar and piano"

**Sau khi tạo xong:**
1. Download file MP3
2. Upload lên Cloudinary (như Option 1)
3. Hoặc lưu vào `public/music/` folder và dùng relative path

### Option 3: Sử dụng nhạc miễn phí từ Internet

1. **Tìm nhạc nền dễ chịu:**
   - [Pixabay Music](https://pixabay.com/music/) - Nhạc miễn phí, không cần attribution
   - [Free Music Archive](https://freemusicarchive.org/) - Nhạc miễn phí
   - [Incompetech](https://incompetech.com/music/) - Nhạc nền game/app miễn phí

2. **Copy direct URL** và thêm vào environment variable như trên

### Option 4: Đặt trong code (tạm thời)

Mở file `components/BackgroundMusic.tsx` và thay đổi dòng:
```typescript
const musicUrl = process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL || 
  'https://your-music-url-here.mp3' // Thay bằng URL thực tế
```

## 🎯 Yêu cầu về nhạc:

- ✅ **Dễ chịu, không gây buồn ngủ** - Nhạc ambient, lo-fi, hoặc instrumental nhẹ nhàng
- ✅ **Không quá to** - Volume mặc định 35%, user có thể điều chỉnh
- ✅ **Vừa đủ nghe** - Không quá nhỏ, không quá to
- ✅ **Format:** MP3, OGG, hoặc WAV
- ✅ **Kích thước:** Nên < 5MB để load nhanh

## 🎵 Gợi ý loại nhạc:

- **Lo-fi hip hop** - Nhẹ nhàng, dễ tập trung
- **Ambient music** - Tạo không khí thư giãn
- **Acoustic instrumental** - Piano, guitar nhẹ nhàng
- **Nature sounds** - Tiếng mưa, sóng biển (nếu phù hợp)

## ⚙️ Cách hoạt động:

1. **Khi login:** Nhạc tự động phát sau 1 giây (nếu user chưa tắt trước đó)
2. **Lưu preferences:** 
   - Trạng thái play/pause được lưu vào localStorage
   - Volume được lưu vào localStorage
   - Lần sau login sẽ nhớ settings
3. **Auto-loop:** Nhạc tự động lặp lại khi hết

## 🐛 Troubleshooting:

### Nhạc không phát:
- Kiểm tra browser console (F12) xem có lỗi không
- Kiểm tra URL nhạc có đúng không
- Một số browser chặn autoplay - user cần click play button

### Nhạc quá to/nhỏ:
- Dùng volume slider để điều chỉnh
- Settings sẽ được lưu tự động

### Nhạc không loop:
- Kiểm tra file nhạc có đúng format không
- Thử với file MP3

---

**Sau khi setup xong, nhạc nền sẽ tự động phát khi login! 🎵**

