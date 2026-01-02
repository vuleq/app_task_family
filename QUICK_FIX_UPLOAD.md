# ⚡ Sửa lỗi "Upload preset not found" - Hướng dẫn nhanh

## 🔴 Lỗi bạn gặp:
```
Upload preset not found
```

## ✅ Cách sửa (3 bước, 5 phút):

### Bước 1: Tạo Upload Preset trong Cloudinary

1. **Đăng nhập Cloudinary**: https://cloudinary.com/console
2. **Vào Settings**: Click icon bánh răng (⚙️) ở góc trên
3. **Chọn tab "Upload"**: Scroll xuống phần **"Upload presets"**
4. **Click "Add upload preset"**
5. **Điền thông tin**:
   - **Preset name**: `family-tasks-upload` (hoặc tên bạn muốn)
   - **Signing mode**: Chọn **"Unsigned"** ⚠️ (QUAN TRỌNG!)
   - **Folder**: `family-tasks` (tùy chọn)
6. **Click "Save"**
7. **Copy tên preset** vừa tạo (ví dụ: `family-tasks-upload`)

### Bước 2: Cập nhật file .env.local

Mở file `.env.local` và đảm bảo có dòng:

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=family-tasks-upload
```

**Thay `family-tasks-upload` bằng tên preset bạn vừa tạo!**

Ví dụ nếu bạn tạo preset tên `my-upload-preset`, thì:

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=my-upload-preset
```

### Bước 3: Restart dev server

```bash
# Nhấn Ctrl+C để dừng server
npm run dev
```

## ✅ Kiểm tra

1. Mở: http://localhost:3000
2. Đăng nhập
3. Vào Profile
4. Click "Chọn ảnh đại diện"
5. Chọn file ảnh
6. Nếu upload thành công → **Đã sửa xong!** ✅

## 🐛 Vẫn không được?

### Kiểm tra lại:

1. **Upload Preset đã tạo chưa?**
   - Vào Cloudinary Dashboard → Settings → Upload
   - Xem danh sách Upload presets
   - Đảm bảo có preset bạn vừa tạo

2. **Signing mode đúng chưa?**
   - Phải là **"Unsigned"** (không phải "Signed")
   - Nếu là "Signed" → Sửa lại preset

3. **Tên preset trong .env.local đúng chưa?**
   - Copy chính xác tên preset (không có khoảng trắng thừa)
   - Ví dụ: `family-tasks-upload` (đúng) vs `family-tasks-upload ` (sai - có khoảng trắng)

4. **Đã restart server chưa?**
   - Phải restart sau khi sửa .env.local

## 📸 Hình ảnh minh họa

### Nơi tạo Upload Preset:
**Cloudinary Dashboard** → **Settings** (⚙️) → **Upload** tab → **Upload presets** section → **Add upload preset**

### Cấu hình Upload Preset:
- **Preset name**: `family-tasks-upload`
- **Signing mode**: `Unsigned` ⚠️ (QUAN TRỌNG!)
- **Folder**: `family-tasks` (tùy chọn)

## 💡 Lưu ý

- **KHÔNG** dùng preset có Signing mode là "Signed" (sẽ không upload được từ client)
- Tên preset **phải khớp** với tên trong `.env.local`
- Sau khi sửa `.env.local`, **phải restart** dev server

## 📚 Xem thêm

- Hướng dẫn chi tiết: `CLOUDINARY_SETUP.md`
- Cloudinary Dashboard: https://cloudinary.com/console

