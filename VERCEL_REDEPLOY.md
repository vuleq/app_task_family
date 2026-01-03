# 🔄 Hướng dẫn Redeploy trên Vercel

## ⚠️ Quan trọng:

Sau khi thêm Environment Variables vào Vercel, **BẮT BUỘC** phải redeploy để các biến môi trường có hiệu lực!

---

## 🚀 Cách 1: Redeploy từ Vercel Dashboard (Nhanh nhất)

### Bước 1: Vào Vercel Dashboard
1. Truy cập: https://vercel.com/dashboard
2. Chọn project của bạn (`app_task_family`)

### Bước 2: Vào tab Deployments
1. Click vào tab **"Deployments"** ở trên cùng
2. Tìm deployment mới nhất (thường ở đầu danh sách)

### Bước 3: Redeploy
1. Click vào **"..."** (3 chấm) bên cạnh deployment
2. Chọn **"Redeploy"**
3. Xác nhận **"Redeploy"** lần nữa

### Bước 4: Đợi deploy xong
- Vercel sẽ tự động build và deploy lại
- Thời gian: khoảng 2-5 phút
- Bạn có thể xem logs trong quá trình deploy

### Bước 5: Test lại
- Sau khi deploy xong, test lại app
- Thử login để xem còn lỗi không

---

## 🚀 Cách 2: Push commit mới (Tự động)

Nếu bạn push một commit mới lên branch `production`, Vercel sẽ tự động deploy:

```bash
cd app_task_family
git checkout production
# Tạo một commit nhỏ (ví dụ: update README)
echo "" >> README.md
git add README.md
git commit -m "chore: trigger redeploy"
git push origin production
```

Vercel sẽ tự động detect và deploy lại.

---

## ✅ Checklist sau khi redeploy:

- [ ] Deployment đã hoàn thành (status: ✅ Ready)
- [ ] Không có lỗi build trong logs
- [ ] Test login trên Vercel URL
- [ ] Kiểm tra console browser (F12) xem còn lỗi Firebase không

---

## 🐛 Nếu vẫn còn lỗi sau khi redeploy:

### 1. Kiểm tra Environment Variables đã được thêm đúng chưa:
- Vào Settings → Environment Variables
- Đảm bảo tất cả 9 biến đã có
- Kiểm tra giá trị có đúng không (không có khoảng trắng thừa)

### 2. Kiểm tra Firebase Authorized Domains:
- Vào Firebase Console: https://console.firebase.google.com/
- Chọn project của bạn
- Vào **Authentication** → **Settings** → **Authorized domains**
- Thêm domain Vercel của bạn (ví dụ: `your-app.vercel.app`)
- Nếu dùng custom domain, thêm cả custom domain

### 3. Kiểm tra logs trong Vercel:
- Vào tab **Deployments** → Click vào deployment mới nhất
- Xem **Build Logs** và **Function Logs**
- Tìm các lỗi liên quan đến Firebase

### 4. Clear cache và test lại:
- Thử mở app trong **Incognito/Private window**
- Hoặc clear browser cache (Ctrl+Shift+Delete)

---

## 📝 Lưu ý:

- Environment variables chỉ áp dụng cho **deployments mới**
- Deployment cũ vẫn chạy với environment variables cũ (hoặc không có)
- Luôn redeploy sau khi thêm/sửa environment variables

---

**Sau khi redeploy xong, app sẽ hoạt động bình thường! 🎉**

