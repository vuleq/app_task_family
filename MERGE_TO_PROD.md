# 🔄 Hướng dẫn Merge từ Main sang Prod

## Cách 1: Merge trực tiếp (Khuyên dùng)

```bash
# 1. Đảm bảo bạn đang ở branch main và đã commit tất cả thay đổi
git checkout main
git add .
git commit -m "your commit message"
git push origin main

# 2. Chuyển sang branch prod
git checkout prod

# 3. Merge main vào prod
git merge main

# 4. Push lên GitHub
git push origin prod
```

## Cách 2: Sử dụng script tự động

Tạo file `merge-to-prod.ps1`:

```powershell
# Merge main vào prod
Write-Host "🔄 Merging main into prod..." -ForegroundColor Cyan

# Đảm bảo đang ở main và code đã commit
git checkout main
git pull origin main

# Chuyển sang prod
git checkout prod
git pull origin prod

# Merge main vào prod
git merge main -m "Merge main into prod for production deployment"

# Push lên GitHub
git push origin prod

Write-Host "✅ Done! Production branch updated." -ForegroundColor Green
```

## Workflow đề xuất:

1. **Development trên main:**
   ```bash
   git checkout main
   # ... làm việc ...
   git add .
   git commit -m "feat: new feature"
   git push origin main
   # → Vercel tự động deploy preview
   ```

2. **Khi sẵn sàng deploy production:**
   ```bash
   git checkout prod
   git merge main
   git push origin prod
   # → Vercel tự động deploy production
   ```

## Lưu ý:

- Luôn test trên preview (main) trước khi merge vào prod
- Đảm bảo code trên main đã stable
- Có thể tạo tag cho mỗi production release:
  ```bash
  git tag -a v1.0.0 -m "Production release v1.0.0"
  git push origin v1.0.0
  ```

