# 🎨 Naming Convention cho Character Assets

## 📋 Format:

```
{gender}_{profession}_level{level}.png
```

### Ví dụ:
- `nam_bs_level5.png` - Nam bác sĩ level 5
- `nu_bs_level5.png` - Nữ bác sĩ level 5
- `nam_ch_level5.png` - Nam cứu hỏa level 5
- `nam_cs_level5.png` - Nam cảnh sát level 5
- `nu_ch_level10.png` - Nữ cứu hỏa level 10

**Lưu ý**: Tất cả trong 1 file, không tách riêng outfit/bg/pet.

---

## 🏷️ Các thành phần:

### 1. **Gender (Giới tính)**:
- `nam` - Nam
- `nu` - Nữ

### 2. **Profession (Nghề nghiệp)**:
- `bs` - Bác sĩ
- `ch` - Cứu hỏa
- `cs` - Cảnh sát
- (có thể thêm sau: `gv` - Giáo viên, `kysu` - Kỹ sư, etc.)

### 3. **Level**:
- `level5`, `level10`, `level15`, `level25`, etc.
- Sử dụng level asset gần nhất (xem `AVAILABLE_LEVELS`)

---

## 📁 Cấu trúc thư mục:

```
pic-avatar/
  ├── nam_bs_level1.png
  ├── nam_bs_level5.png
  ├── nam_bs_level10.png
  ├── nu_bs_level1.png
  ├── nu_bs_level5.png
  ├── nam_ch_level5.png
  ├── nam_cs_level5.png
  └── ...
```

**Tất cả trong một folder** - dễ quản lý và tìm kiếm.

---

## 📝 Mapping nghề nghiệp:

| Nghề nghiệp | Code | Ví dụ file |
|-------------|------|------------|
| Bác sĩ | `bs` | `nam_bs_level5.png` |
| Cứu hỏa | `ch` | `nam_ch_level5.png` |
| Cảnh sát | `cs` | `nam_cs_level5.png` |

---

## ✅ Checklist khi tạo file:

- [ ] Đúng format: `{gender}_{profession}_level{level}.png`
- [ ] Gender: `nam` hoặc `nu`
- [ ] Profession: `bs`, `ch`, hoặc `cs`
- [ ] Level: `level1`, `level5`, `level10`, etc.
- [ ] Extension: `.png` hoặc `.jpg`
- [ ] **Không có** `_outfit`, `_bg`, `_pet` trong tên file

---

## 🎯 Ví dụ đầy đủ:

### Nam bác sĩ:
- `nam_bs_level1.png`
- `nam_bs_level5.png`
- `nam_bs_level10.png`
- `nam_bs_level15.png`
- `nam_bs_level25.png`
- `nam_bs_level40.png`
- `nam_bs_level55.png`
- `nam_bs_level70.png`
- `nam_bs_level100.png`

### Nữ bác sĩ:
- `nu_bs_level1.png`
- `nu_bs_level5.png`
- `nu_bs_level10.png`
- ... (tương tự)

### Nam cứu hỏa:
- `nam_ch_level1.png`
- `nam_ch_level5.png`
- ... (tương tự)

### Nam cảnh sát:
- `nam_cs_level1.png`
- `nam_cs_level5.png`
- ... (tương tự)

---

## 🔧 Cách code hoạt động:

1. **Nếu có `gender` và `profession`**: 
   - Dùng format mới: `nam_bs_level5.png`
   - File này chứa toàn bộ nhân vật (outfit, background, pet đều trong 1 file)

2. **Nếu không có `gender`/`profession`**: 
   - Fallback về format cũ: `level5_outfit.png`, `level5_bg.png`, etc.
   - (Backward compatible)

---

## 🚀 Next Steps:

1. ✅ Cập nhật `UserProfile` interface để thêm `gender` và `profession`
2. ✅ Cập nhật `getCharacterAssets()` để hỗ trợ naming convention mới
3. ⏳ Tạo UI để user chọn gender và profession
4. ⏳ Tạo các file ảnh theo format mới
5. ⏳ Test với các file mới

---

## 💡 Tips:

- **Tên file ngắn gọn**: `nam_bs_level5.png` thay vì `nam_bacsi_level5_outfit.png`
- **Nhất quán**: Luôn dùng format `{gender}_{profession}_level{level}.png`
- **Level assets**: Chỉ cần tạo cho các level có trong `AVAILABLE_LEVELS`: [1, 5, 10, 15, 25, 40, 55, 70, 100]
- **Compress**: Nhớ compress ảnh bằng TinyPNG trước khi upload để giảm dung lượng
