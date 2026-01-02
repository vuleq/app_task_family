# Hướng dẫn tạo Template Nhiệm vụ mặc định

Script này sẽ tạo tự động các template nhiệm vụ mặc định dựa trên danh sách đã cung cấp.

## Danh sách Template

### Việc học (15 template)
- H1: Làm xong bài tập về nhà (20 XP, 4 Coins)
- H2: Đọc sách 15 phút (10 XP, 2 Coins)
- H3: Đọc sách 30 phút (20 XP, 4 Coins)
- H4: Viết 1 đoạn văn ngắn (5–7 câu) (25 XP, 5 Coins)
- H5: Luyện toán 15 phút (10 XP, 2 Coins)
- H6: Luyện toán 30 phút (20 XP, 4 Coins)
- H7: Học từ vựng mới (5 từ) (10 XP, 2 Coins)
- H8: Học từ vựng mới (10 từ) (20 XP, 4 Coins)
- H9: Xem video học tập & tóm tắt (25 XP, 5 Coins)
- H10: Ôn bài trước khi đi ngủ (10 XP, 2 Coins)
- H11: Viết chính tả / luyện chữ (20 XP, 4 Coins)
- H12: Hoàn thành bài tập online (20 XP, 4 Coins)
- H13: Tự học 1 chủ đề mới (35 XP, 7 Coins)
- H14: Chuẩn bị bài cho ngày mai (10 XP, 2 Coins)
- H15: Học tập trung 45 phút (không xao nhãng) (40 XP, 8 Coins)

### Việc khác (25 template)

#### Việc nhà (6 template)
- N1: Dọn giường sau khi ngủ dậy (5 XP, 1 Coin)
- N2: Gấp quần áo (15 XP, 3 Coins)
- N3: Dọn bàn học (10 XP, 2 Coins)
- N4: Phụ giúp quét nhà (20 XP, 4 Coins)
- N5: Rửa chén (phụ giúp) (20 XP, 4 Coins)
- N6: Đổ rác (5 XP, 1 Coin)

#### Vận động (5 template)
- N7: Tập thể dục 10 phút (10 XP, 2 Coins)
- N8: Tập thể dục 20 phút (20 XP, 4 Coins)
- N9: Chạy nhảy / vận động ngoài trời (20 XP, 4 Coins)
- N10: Chơi thể thao cùng gia đình (30 XP, 6 Coins)
- N11: Uống đủ nước trong ngày (5 XP, 1 Coin)

#### Kỹ năng sống (5 template)
- N12: Tự chuẩn bị cặp sách (10 XP, 2 Coins)
- N13: Tự mặc quần áo (5 XP, 1 Coin)
- N14: Giúp bố/mẹ làm việc nhỏ (15 XP, 3 Coins)
- N15: Giữ phòng gọn gàng cả ngày (30 XP, 6 Coins)
- N16: Làm việc theo kế hoạch trong ngày (35 XP, 7 Coins)

#### Sáng tạo - Tinh thần (6 template)
- N17: Vẽ tranh / tô màu (10 XP, 2 Coins)
- N18: Làm đồ thủ công (20 XP, 4 Coins)
- N19: Viết nhật ký 5 phút (10 XP, 2 Coins)
- N20: Kể chuyện cho bố/mẹ nghe (10 XP, 2 Coins)
- N21: Học chơi nhạc cụ 15 phút (20 XP, 4 Coins)
- N22: Học chơi nhạc cụ 30 phút (35 XP, 7 Coins)

#### Thói quen tốt (3 template)
- N23: Đi ngủ đúng giờ (10 XP, 2 Coins)
- N24: Dậy đúng giờ (10 XP, 2 Coins)
- N25: Không dùng thiết bị điện tử quá giờ (40 XP, 8 Coins)

## Cách sử dụng

### Cách 1: Tạo từ UI (Khuyến nghị)

1. Login bằng account root
2. Vào "📋 Templates"
3. Tạo từng template thủ công hoặc dùng script

### Cách 2: Chạy script (Nếu có Node.js)

```bash
# Cài đặt dependencies nếu chưa có
npm install

# Chạy script với User ID của root account
npx ts-node scripts/create-default-templates.ts <USER_ID>
```

**Lưu ý:** 
- Thay `<USER_ID>` bằng User ID của root account (lấy từ Firebase Console hoặc từ URL khi login)
- Script sẽ kiểm tra xem đã có template chưa, nếu có sẽ không tạo lại
- Nếu muốn tạo lại, cần xóa template cũ trước

### Cách 3: Tạo thủ công từ UI

1. Login bằng account root
2. Click "+ Thêm nhiệm vụ"
3. Điền thông tin nhiệm vụ
4. Chọn category (Việc học hoặc Việc khác)
5. Chọn "Lưu làm template"
6. Click "Thêm nhiệm vụ"

## Tổng kết

- **Tổng cộng:** 40 template
- **Việc học:** 15 template
- **Việc khác:** 25 template
- **Tất cả đều là nhiệm vụ ngày (daily)**

Sau khi tạo template, bạn có thể:
- Dùng template để tạo nhiệm vụ cho nhiều người cùng lúc
- Tên nhiệm vụ sẽ tự động có prefix: "Nhiệm vụ ngày - Việc học/Việc khác - Tên nhiệm vụ"
