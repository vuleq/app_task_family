# 🎵 Cách Nhạc Nền Phát

## 📋 Cách hoạt động hiện tại:

### **Phát theo thứ tự tuần tự (Sequential Playback)**

Nhạc nền sẽ phát **theo thứ tự** từ bài đầu đến bài cuối, sau đó **loop lại**:

```
Bài 1 → Bài 2 → Bài 3 → ... → Bài cuối → Bài 1 → Bài 2 → ...
```

**Ví dụ với 3 bài:**
- Bắt đầu: **Bài 1**
- Hết Bài 1 → **Bài 2**
- Hết Bài 2 → **Bài 3**
- Hết Bài 3 → **Bài 1** (loop lại)
- Hết Bài 1 → **Bài 2**
- ... (tiếp tục vô hạn)

---

## 🎮 Điều khiển:

### **Tự động:**
- Khi bài hiện tại kết thúc → Tự động chuyển sang bài tiếp theo
- Khi đến bài cuối → Tự động quay lại bài đầu

### **Thủ công (nếu có nhiều hơn 1 bài):**
- Nút **◀** (Previous): Chuyển về bài trước
- Nút **▶** (Next): Chuyển sang bài tiếp theo

---

## 🔄 So sánh với Random Mode:

### **Sequential (Hiện tại) - Phát theo thứ tự:**
- ✅ Dễ đoán trước
- ✅ Nghe theo thứ tự đã sắp xếp
- ✅ Có thể skip bài không thích bằng nút Next

### **Random - Phát ngẫu nhiên:**
- ✅ Đa dạng, không lặp lại
- ❌ Có thể phát cùng 1 bài nhiều lần liên tiếp
- ❌ Không theo thứ tự

---

## ⚙️ Nếu muốn đổi sang Random Mode:

Nếu bạn muốn nhạc phát **ngẫu nhiên** thay vì theo thứ tự, tôi có thể cập nhật code để:

1. Chọn bài ngẫu nhiên khi bài hiện tại kết thúc
2. Tránh phát lại bài vừa phát (nếu có nhiều hơn 2 bài)
3. Hoặc cho phép chọn mode (Sequential / Random) trong settings

**Bạn có muốn đổi sang Random Mode không?**

---

## 📝 Lưu ý:

- **Playlist được load từ environment variables** khi app khởi động
- **Thứ tự phát** = Thứ tự trong playlist (URL_1, URL_2, ... hoặc thứ tự trong PLAYLIST)
- **Loop vô hạn** - Nhạc sẽ phát liên tục không dừng
- **Lưu trạng thái** - Nhớ bài đang nghe (nếu có thể)

---

**Hiện tại: Phát theo thứ tự tuần tự (Sequential) 🔄**

