# 🌿 Hướng dẫn Setup Branch cho Vercel

## Mục tiêu:
- **Branch `main`**: Dùng cho development
- **Branch `prod`**: Dùng cho production (publish ra internet)

## Bước 1: Tạo branch `prod` từ `main`

```bash
# Đảm bảo bạn đang ở branch main và code đã commit
git checkout main
git pull origin main

# Tạo branch prod từ main
git checkout -b prod

# Push branch prod lên GitHub
git push origin prod
```

## Bước 2: Cấu hình Vercel

### 2.1. Vào Project Settings trên Vercel

1. Vào Vercel Dashboard: https://vercel.com
2. Chọn project của bạn
3. Vào **Settings** → **Git**

### 2.2. Cấu hình Production Branch

1. Tìm phần **"Production Branch"**
2. Thay đổi từ `main` → `prod`
3. Click **"Save"**

### 2.3. Cấu hình Preview Branches (Optional)

1. Trong phần **"Preview Branches"**
2. Đảm bảo `main` và các branch khác được bật
3. Điều này cho phép:
   - `main` → Tự động deploy preview URL (cho testing)
   - `prod` → Deploy lên production URL

## Bước 3: Cấu hình Environment Variables (Nếu cần)

Nếu bạn muốn dùng environment variables khác nhau cho dev và prod:

### 3.1. Production Environment Variables

1. Vào **Settings** → **Environment Variables**
2. Thêm các biến cho **Production** (chỉ áp dụng cho branch `prod`)

### 3.2. Preview Environment Variables

1. Thêm các biến cho **Preview** (áp dụng cho branch `main` và các branch khác)

## Bước 4: Workflow

### Development (Branch `main`):
```bash
# Làm việc trên branch main
git checkout main
# ... code changes ...
git add .
git commit -m "feat: new feature"
git push origin main
# → Vercel tự động deploy preview URL
```

### Production (Branch `prod`):
```bash
# Khi code đã test xong trên main, merge vào prod
git checkout prod
git merge main
git push origin prod
# → Vercel tự động deploy lên production URL
```

## Lưu ý:

1. **Production URL**: Sẽ chỉ update khi push lên branch `prod`
2. **Preview URL**: Sẽ update mỗi khi push lên `main` hoặc các branch khác
3. **Environment Variables**: Có thể set khác nhau cho Production và Preview
4. **Auto Deploy**: Vercel tự động deploy khi có push

## Tùy chọn: Tắt Auto Deploy cho branch `main`

Nếu bạn không muốn auto deploy cho `main`:

1. Vào **Settings** → **Git**
2. Tắt **"Automatic deployments from Git"** cho branch `main`
3. Chỉ bật cho branch `prod`

---

**Sau khi setup xong, bạn sẽ có:**
- Production URL: Chỉ update khi push lên `prod`
- Preview URL: Update khi push lên `main` (để test trước)

