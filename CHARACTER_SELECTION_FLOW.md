# 🎮 Character Selection Flow (Updated)

## 📋 Flow chọn nhân vật mới:

### Bước 1: Chọn Avatar Cơ Bản (Khi đăng nhập lần đầu)

User chọn 1 trong 4 avatar cơ bản:
- `nam1.png` - Nhân vật nam 1
- `nam2.png` - Nhân vật nam 2
- `nu1.png` - Nhân vật nữ 1
- `nu2.png` - Nhân vật nữ 2

**Lưu vào database:**
- `characterBase`: `'nam1'`, `'nam2'`, `'nu1'`, hoặc `'nu2'`
- `gender`: Tự động set từ `characterBase` (`'nam'` hoặc `'nu'`)

---

### Bước 2: Level 1-4 - Dùng File Cơ Bản

**Trong khoảng Level 1-4:**
- Luôn dùng file avatar cơ bản: `nam1.png`, `nam2.png`, `nu1.png`, `nu2.png`
- Chưa được chọn nghề nghiệp
- UI chọn nghề nghiệp **KHÔNG hiển thị**

---

### Bước 3: Level 5+ - Chọn Nghề Nghiệp

**Khi đạt Level 5:**
- UI chọn nghề nghiệp **TỰ ĐỘNG HIỂN THỊ**
- User có thể chọn 1 trong 3 nghề:
  - `bs` - Bác sĩ 👨‍⚕️
  - `ch` - Cứu hỏa 🚒
  - `cs` - Cảnh sát 👮

**Lưu vào database:**
- `profession`: `'bs'`, `'ch'`, hoặc `'cs'`

---

### Bước 4: Sau Khi Chọn Nghề (Level 5-100)

**Sau khi chọn nghề ở Level 5:**
- Từ Level 5 trở đi, nhân vật sẽ dùng file theo nghề nghiệp
- Format file: `{gender}_{profession}_level{level}.png`

**Ví dụ:**
- Level 5: `nam_bs_level5.png` (nếu là nam bác sĩ)
- Level 10: `nu_ch_level10.png` (nếu là nữ cứu hỏa)
- Level 15: `nam_cs_level15.png` (nếu là nam cảnh sát)
- ... tiếp tục đến Level 100

**Lưu ý**: Một khi đã chọn nghề, sẽ dùng file theo nghề từ Level 5 đến Level 100.

---

## 🔄 Logic hoạt động:

```typescript
if (level >= 5 && profession) {
  // Level 5+ và đã chọn nghề → dùng file theo nghề
  file = `${gender}_${profession}_level${assetLevel}.png`
} else {
  // Level 1-4 hoặc Level 5+ nhưng chưa chọn nghề → dùng file cơ bản
  file = `${characterBase}.png`
}
```

---

## 📁 Cấu trúc file:

```
pic-avatar/
  ├── nam1.png          # Avatar cơ bản (Level 1-4)
  ├── nam2.png
  ├── nu1.png
  ├── nu2.png
  ├── nam_bs_level5.png # Nam bác sĩ level 5
  ├── nam_bs_level10.png
  ├── nam_bs_level15.png
  ├── nu_bs_level5.png  # Nữ bác sĩ level 5
  ├── nam_ch_level5.png # Nam cứu hỏa level 5
  ├── nam_cs_level5.png # Nam cảnh sát level 5
  └── ... (tiếp tục đến level 100)
```

---

## ✅ Checklist khi tạo file:

### File cơ bản (Level 1-4):
- [ ] `nam1.png` - Nhân vật nam 1
- [ ] `nam2.png` - Nhân vật nam 2
- [ ] `nu1.png` - Nhân vật nữ 1
- [ ] `nu2.png` - Nhân vật nữ 2

### File theo nghề (Level 5+):
- [ ] `nam_bs_level5.png`, `nam_bs_level10.png`, ... đến level 100
- [ ] `nu_bs_level5.png`, `nu_bs_level10.png`, ... đến level 100
- [ ] `nam_ch_level5.png`, `nam_ch_level10.png`, ... đến level 100
- [ ] `nu_ch_level5.png`, `nu_ch_level10.png`, ... đến level 100
- [ ] `nam_cs_level5.png`, `nam_cs_level10.png`, ... đến level 100
- [ ] `nu_cs_level5.png`, `nu_cs_level10.png`, ... đến level 100

**Lưu ý**: Chỉ cần tạo cho các level có trong `AVAILABLE_LEVELS`: [1, 5, 10, 15, 25, 40, 55, 70, 100]

---

## 🎯 Ví dụ Flow:

### User A:
1. **Level 1**: Chọn `nam1.png` → `characterBase: 'nam1'`, `gender: 'nam'`
2. **Level 1-4**: Hiển thị `nam1.png` (file cơ bản)
3. **Level 5**: UI chọn nghề hiển thị → Chọn Bác sĩ → `profession: 'bs'`
4. **Level 5**: Hiển thị `nam_bs_level5.png`
5. **Level 10**: Hiển thị `nam_bs_level10.png`
6. **Level 15**: Hiển thị `nam_bs_level15.png`
7. ... tiếp tục đến Level 100

### User B:
1. **Level 1**: Chọn `nu2.png` → `characterBase: 'nu2'`, `gender: 'nu'`
2. **Level 1-4**: Hiển thị `nu2.png` (file cơ bản)
3. **Level 5**: UI chọn nghề hiển thị → Chọn Cứu hỏa → `profession: 'ch'`
4. **Level 5**: Hiển thị `nu_ch_level5.png`
5. **Level 10**: Hiển thị `nu_ch_level10.png`
6. ... tiếp tục đến Level 100

---

## 💡 Lưu ý:

- **Level 1-4**: Luôn dùng file cơ bản, không có option chọn nghề
- **Level 5+**: UI chọn nghề tự động hiển thị
- **Sau khi chọn nghề**: Dùng file theo nghề từ Level 5 đến Level 100
- **Chưa chọn nghề ở Level 5+**: Vẫn dùng file cơ bản cho đến khi chọn nghề
- **Asset levels**: Chỉ cần tạo cho các level có trong `AVAILABLE_LEVELS`: [1, 5, 10, 15, 25, 40, 55, 70, 100]

---

## 🚀 Next Steps:

1. ✅ Cập nhật code để chỉ cho phép chọn nghề từ Level 5
2. ✅ Thêm UI chọn nghề nghiệp khi level >= 5
3. ✅ Cập nhật logic getCharacterAssets
4. ⏳ Tạo các file ảnh theo format mới
5. ⏳ Test flow hoàn chỉnh
