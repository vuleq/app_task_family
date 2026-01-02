# 🎬 Hướng dẫn Nén và Upload Video Mở Rương

## 📋 Mục tiêu
Nén video MP4 để giảm dung lượng và upload lên Cloudinary để sử dụng trong app.

---

## 🎯 Bước 1: Nén Video

### **CÁCH 1: Dùng Online Tools (Khuyến nghị - Dễ nhất)**

#### **1. Clideo - Video Compressor** ⭐ (Khuyến nghị)
- **Link**: https://clideo.com/compress-video
- **Ưu điểm**: 
  - Miễn phí
  - Không cần đăng ký
  - Hỗ trợ nhiều format
  - Có thể chọn quality
- **Cách dùng**:
  1. Vào https://clideo.com/compress-video
  2. Click "Choose file" → Chọn video MP4
  3. Chọn quality (Medium hoặc High - khuyến nghị Medium để giảm dung lượng)
  4. Click "Compress"
  5. Đợi xong → Download video đã nén

#### **2. FreeConvert**
- **Link**: https://www.freeconvert.com/video-compressor
- **Ưu điểm**: 
  - Miễn phí
  - Có thể chọn target size
  - Hỗ trợ batch compress

#### **3. CloudConvert**
- **Link**: https://cloudconvert.com/video-compressor
- **Ưu điểm**: 
  - Miễn phí (có giới hạn)
  - Nhiều tùy chọn nén

#### **4. YouCompress**
- **Link**: https://www.youcompress.com/
- **Ưu điểm**: 
  - Đơn giản, dễ dùng
  - Không cần đăng ký

### **CÁCH 2: Dùng Software Desktop**

#### **HandBrake** (Miễn phí, mạnh mẽ)
- **Download**: https://handbrake.fr/
- **Ưu điểm**: 
  - Miễn phí, open source
  - Nhiều tùy chọn nén
  - Chất lượng tốt
- **Cách dùng**:
  1. Download và cài đặt HandBrake
  2. Mở video gốc
  3. Chọn preset: "Fast 1080p30" hoặc "Fast 720p30"
  4. Click "Start Encode"
  5. Đợi xong → Lấy video đã nén

---

## 📤 Bước 2: Upload Video lên Cloudinary

### **CÁCH 1: Upload qua Cloudinary Dashboard** (Khuyến nghị)

1. **Mở Cloudinary Dashboard**:
   - Link: https://cloudinary.com/console
   - Đăng nhập

2. **Upload Video**:
   - Click **"Media Library"** → **"Upload"**
   - Chọn **"Advanced"** hoặc **"Upload"**
   - Kéo thả video đã nén vào
   - **Quan trọng**: Chọn folder đúng:
     - **Folder**: `family-tasks/chests/{chestType}/`
     - Ví dụ:
       - `family-tasks/chests/wood/` cho rương gỗ
       - `family-tasks/chests/silver/` cho rương bạc
       - `family-tasks/chests/gold/` cho rương vàng
       - `family-tasks/chests/mystery/` cho rương bí ẩn
       - `family-tasks/chests/legendary/` cho rương huyền thoại

3. **Tên file** (tùy chọn):
   - Có thể đặt tên: `opening.mp4` hoặc `{type}_chest_opening.mp4`
   - Ví dụ: `wood_chest_opening.mp4`

4. **Lấy Secure URL**:
   - Sau khi upload, click vào video
   - Copy **"Secure URL"**
   - URL sẽ có dạng: `https://res.cloudinary.com/{cloud-name}/video/upload/v{version}/family-tasks/chests/{type}/{filename}.mp4`

### **CÁCH 2: Upload bằng Cloudinary Extension trong Cursor**

1. Mở Cloudinary extension trong Cursor
2. Click **"Upload"**
3. Chọn video đã nén
4. Nhập folder path: `family-tasks/chests/{type}/`
5. Click **"Upload"**
6. Copy URL sau khi upload xong

---

## 📝 Bước 3: Cập nhật URL vào Database

Sau khi có Secure URL, cần cập nhật vào database:

### **Cách 1: Qua Web App (Nếu có quyền root)**

1. Vào trang Chest System
2. Click nút **✏️** (Edit) trên rương cần cập nhật
3. Thêm/update field **"Opening Media URL"** với URL vừa copy
4. Click **"Save"**

### **Cách 2: Qua Firebase Console**

1. Mở Firebase Console: https://console.firebase.google.com/
2. Vào **Firestore Database**
3. Tìm collection **"chests"**
4. Click vào rương cần cập nhật
5. Thêm/update field: `openingMediaUrl` = URL vừa copy
6. Click **"Update"**

---

## ✅ Checklist

- [ ] Đã nén video (giảm dung lượng)
- [ ] Đã upload video lên Cloudinary
- [ ] Đã copy Secure URL
- [ ] Đã cập nhật `openingMediaUrl` vào database
- [ ] Đã test mở rương trên web

---

## 💡 Tips

1. **Nén video**:
   - Target size: ~2-5MB cho video ngắn (5-10 giây)
   - Quality: Medium hoặc High (không cần quá cao)
   - Resolution: 720p hoặc 1080p là đủ

2. **Tối ưu video**:
   - Cắt video ngắn (chỉ phần mở rương)
   - Giảm FPS nếu không cần thiết (24-30fps là đủ)
   - Dùng codec H.264 (MP4)

3. **Cloudinary**:
   - Cloudinary tự động optimize video
   - Có thể dùng transformation để giảm chất lượng nếu cần
   - Free tier: 25GB storage, 25GB bandwidth/tháng

---

## 🔗 Links hữu ích

### Video Compression:
- **Clideo**: https://clideo.com/compress-video
- **FreeConvert**: https://www.freeconvert.com/video-compressor
- **CloudConvert**: https://cloudconvert.com/video-compressor
- **YouCompress**: https://www.youcompress.com/
- **HandBrake**: https://handbrake.fr/

### Cloudinary:
- **Dashboard**: https://cloudinary.com/console
- **Media Library**: https://cloudinary.com/console/media_library
- **Upload**: https://cloudinary.com/console/media_library/upload

---

## 📋 Ví dụ URL sau khi upload

```
https://res.cloudinary.com/dvuy40chj/video/upload/v1767357000/family-tasks/chests/wood/wood_chest_opening.mp4
```

Sau đó cập nhật vào database:
```json
{
  "id": "chest-wood-1",
  "name": "Rương Gỗ",
  "openingMediaUrl": "https://res.cloudinary.com/dvuy40chj/video/upload/v1767357000/family-tasks/chests/wood/wood_chest_opening.mp4",
  ...
}
```

