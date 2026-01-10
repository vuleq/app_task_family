# 🔥 Hướng dẫn xóa User trong Firebase Console

## Bước 1: Truy cập Firebase Console

1. Mở trình duyệt và vào: **https://console.firebase.google.com/**
2. Đăng nhập bằng tài khoản Google của bạn
3. Chọn **project** của bạn (project chứa ứng dụng task family)

---

## Bước 2: Vào phần Authentication

1. Trong menu bên trái, tìm và click vào **Authentication** (biểu tượng khóa 🔒)
2. Bạn sẽ thấy tab **Users** được chọn mặc định

---

## Bước 3: Tìm User cần xóa

Có 2 cách để tìm user:

### Cách 1: Tìm bằng Search (Nếu có nhiều users)

1. Ở phía trên danh sách users, có ô **Search users**
2. Nhập email cần tìm (ví dụ: `sol@mail.com`)
3. User sẽ hiện ra trong danh sách

### Cách 2: Cuộn danh sách (Nếu có ít users)

1. Cuộn xuống để tìm user trong danh sách
2. Mỗi user hiển thị:
   - Email
   - UID
   - Provider (Email/Password, Google, etc.)
   - Created date

---

## Bước 4: Xóa User

1. **Click vào user** cần xóa (click vào dòng chứa email của user)
2. Màn hình chi tiết user sẽ hiện ra
3. Ở phía trên bên phải, tìm nút **Delete user** (có thể là icon thùng rác 🗑️ hoặc nút "Delete")
4. Click vào **Delete user**
5. Một popup xác nhận sẽ hiện ra:
   - **"Are you sure you want to delete this user?"**
   - Click **Delete** để xác nhận
   - Hoặc click **Cancel** để hủy

---

## Bước 5: Xác nhận đã xóa

1. Sau khi xóa thành công, bạn sẽ quay lại trang danh sách users
2. User đã bị xóa sẽ **không còn** trong danh sách nữa
3. Bạn có thể tìm lại để xác nhận (nếu search không thấy = đã xóa thành công)

---

## ✅ Kết quả

Sau khi xóa user khỏi Firebase Authentication:

- ✅ User **không thể đăng nhập** nữa với email đó
- ✅ User **có thể đăng ký lại** với cùng email đó
- ✅ Tất cả dữ liệu trong Firestore vẫn còn (nếu chưa xóa)
- ✅ Nếu muốn xóa hoàn toàn, cần xóa thêm trong Firestore

---

## 📝 Lưu ý quan trọng

1. **Xóa trong Authentication ≠ Xóa trong Firestore**
   - Xóa trong Authentication: User không thể đăng nhập
   - Xóa trong Firestore: Xóa profile, tasks, templates
   - Để xóa hoàn toàn, cần xóa cả 2 nơi

2. **Nếu user đã bị xóa khỏi Firestore trước đó:**
   - Chỉ cần xóa trong Authentication là đủ
   - Sau đó user có thể đăng ký lại

3. **Nếu muốn xóa user hoàn toàn từ UI:**
   - Đăng nhập bằng tài khoản root
   - Vào Profile Page → Quản lý Users
   - Click "🗑️ Xóa User" (sẽ xóa cả Firestore + Authentication)

---

## 🆘 Gặp vấn đề?

### Không tìm thấy nút Delete?
- Đảm bảo bạn đã click vào user để mở trang chi tiết
- Nút Delete thường ở góc trên bên phải

### Không thấy user trong danh sách?
- User có thể đã bị xóa rồi
- Thử search lại bằng email chính xác
- Kiểm tra xem có đang ở đúng project không

### Lỗi khi xóa?
- Đảm bảo bạn có quyền admin trong project
- Thử refresh trang và làm lại

---

## 🎯 Ví dụ cụ thể: Xóa user "sol@mail.com"

1. Vào Firebase Console → Authentication → Users
2. Search: `sol@mail.com`
3. Click vào user "sol@mail.com"
4. Click nút **Delete user** (góc trên bên phải)
5. Xác nhận **Delete**
6. ✅ Xong! User đã bị xóa
7. Bây giờ có thể đăng ký lại với email `sol@mail.com`

---

**Chúc bạn thành công! 🎉**
