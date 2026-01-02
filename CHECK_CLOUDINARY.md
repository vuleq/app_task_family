# 🔍 Kiểm tra cấu trúc Cloudinary

## 📋 Cấu trúc folder và file cần có:

```
family-tasks/
  └── chests/
      ├── wood/
      │   └── wood_chest_closed.png  ✅ (Format khuyến nghị)
      │   └── closed.png              ✅ (Format thay thế)
      ├── silver/
      │   └── silver_chest_closed.png
      ├── gold/
      │   └── gold_chest_closed.png
      ├── mystery/
      │   └── mystery_chest_closed.png
      └── legendary/
          └── legendary_chest_closed.png
```

## ✅ Checklist kiểm tra:

1. **Mở Cloudinary Media Library:**
   - Link: https://cloudinary.com/console/media_library
   - Hoặc: https://cloudinary.com/console/media_library/folders/family-tasks

2. **Kiểm tra từng folder:**
   - [ ] `family-tasks/chests/wood/` - Có file `wood_chest_closed.png` hoặc `closed.png`?
   - [ ] `family-tasks/chests/silver/` - Có file `silver_chest_closed.png` hoặc `closed.png`?
   - [ ] `family-tasks/chests/gold/` - Có file `gold_chest_closed.png` hoặc `closed.png`?
   - [ ] `family-tasks/chests/mystery/` - Có file `mystery_chest_closed.png` hoặc `closed.png`?
   - [ ] `family-tasks/chests/legendary/` - Có file `legendary_chest_closed.png` hoặc `closed.png`?

3. **Kiểm tra tên file:**
   - Code đang tìm file với format: `{type}_chest_closed.png`
   - Ví dụ: `wood_chest_closed.png`, `silver_chest_closed.png`, etc.
   - Nếu file có tên khác, cần đổi tên trên Cloudinary

4. **Kiểm tra URL:**
   - URL sẽ có dạng: `https://res.cloudinary.com/{cloud-name}/image/upload/family-tasks/chests/{type}/{type}_chest_closed.png`
   - Thay `{cloud-name}` bằng cloud name của bạn
   - Thay `{type}` bằng: wood, silver, gold, mystery, legendary

## 🔧 Nếu file có tên khác:

### Cách 1: Đổi tên trên Cloudinary (Khuyến nghị)
1. Mở Cloudinary Media Library
2. Click vào file cần đổi tên
3. Click "Rename" hoặc "Edit"
4. Đổi tên thành: `{type}_chest_closed.png`
   - Ví dụ: `wood_chest_closed.png`

### Cách 2: Cập nhật code
Nếu không thể đổi tên, có thể cập nhật code để hỗ trợ format tên file khác.

## 📝 Ghi chú:

- **Format khuyến nghị:** `{type}_chest_closed.png` (ví dụ: `wood_chest_closed.png`)
- **Format thay thế:** `closed.png` (cần cập nhật code để hỗ trợ)
- Code hiện tại chỉ hỗ trợ format: `{type}_chest_closed.png`

## 🔗 Links hữu ích:

- **Cloudinary Media Library**: https://cloudinary.com/console/media_library
- **Cloudinary Folders**: https://cloudinary.com/console/media_library/folders/family-tasks

