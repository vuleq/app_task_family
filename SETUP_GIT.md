# 📦 Hướng dẫn Push lên Git Repository riêng

## Bước 1: Tạo Repository mới

### GitHub
1. Đăng nhập vào https://github.com
2. Click "New repository"
3. Đặt tên: `family_tasks` (hoặc tên bạn muốn)
4. Chọn **Private** (khuyến nghị)
5. **KHÔNG** tích "Initialize with README" (vì đã có code)
6. Click "Create repository"

### GitLab
1. Đăng nhập vào GitLab
2. Click "New project"
3. Chọn "Create blank project"
4. Đặt tên và chọn visibility
5. Click "Create project"

### Bitbucket
1. Đăng nhập vào Bitbucket
2. Click "Create repository"
3. Điền thông tin và tạo

## Bước 2: Khởi tạo Git trong project

Mở terminal/PowerShell trong thư mục `app_task_family`:

```bash
cd app_task_family

# Khởi tạo git repository
git init

# Thêm tất cả files
git add .

# Commit lần đầu
git commit -m "Initial commit: Sprint 0 - Setup foundation"
```

## Bước 3: Kết nối với Remote Repository

### GitHub
```bash
# Thay YOUR_USERNAME và YOUR_REPO_NAME bằng thông tin của bạn
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Hoặc sử dụng SSH (nếu đã setup SSH key)
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### GitLab
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Bitbucket
```bash
git remote add origin https://bitbucket.org/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Bước 4: Push code lên Repository

```bash
# Đổi tên branch thành main (nếu cần)
git branch -M main

# Push code lên remote
git push -u origin main
```

Nếu gặp lỗi authentication, bạn có thể:
- Sử dụng Personal Access Token (GitHub/GitLab)
- Hoặc setup SSH keys

## Bước 5: Verify

Kiểm tra trên website của Git provider, bạn sẽ thấy code đã được push lên.

## Các lệnh Git hữu ích

### Xem trạng thái
```bash
git status
```

### Xem remote đã kết nối
```bash
git remote -v
```

### Thêm files mới
```bash
git add .
git commit -m "Your commit message"
git push
```

### Tạo branch mới cho feature
```bash
git checkout -b feature/task-management
# Làm việc trên branch này
git push -u origin feature/task-management
```

### Pull code mới nhất
```bash
git pull origin main
```

## ⚠️ Lưu ý quan trọng

### Files đã được ignore (không push lên)

Các file sau đã được thêm vào `.gitignore` và sẽ **KHÔNG** được push:
- `.env.local` - Chứa thông tin Firebase của bạn (BẢO MẬT)
- `node_modules/` - Dependencies
- `.next/` - Build files
- `.firebase/` - Firebase cache
- Các file log và cache khác

### Bảo mật thông tin

**QUAN TRỌNG**: 
- ❌ **KHÔNG BAO GIỜ** commit file `.env.local` lên Git
- ✅ File `.env.example` đã được tạo sẵn (không có thông tin thật)
- ✅ Nếu vô tình commit `.env.local`, hãy xóa ngay và thay đổi Firebase keys

### Setup cho team members

Khi team member khác clone repo:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Cài đặt dependencies
npm install

# Copy .env.example thành .env.local
cp .env.example .env.local

# Điền thông tin Firebase vào .env.local
# (Mỗi người có thể dùng Firebase project riêng hoặc dùng chung)
```

## Cấu trúc Git cho project

### Branch Strategy (Khuyến nghị)

```
main                    # Production-ready code
├── develop            # Development branch
├── feature/task-management
├── feature/rewards-shop
└── hotfix/...
```

### Workflow

1. Tạo branch mới từ `main`:
```bash
git checkout -b feature/new-feature
```

2. Làm việc và commit:
```bash
git add .
git commit -m "Add new feature"
```

3. Push branch:
```bash
git push -u origin feature/new-feature
```

4. Tạo Pull Request/Merge Request trên Git provider

5. Sau khi merge, xóa branch local:
```bash
git checkout main
git pull origin main
git branch -d feature/new-feature
```

## CI/CD Setup (Tùy chọn)

### GitHub Actions

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      # Thêm bước deploy Firebase/Vercel
```

### Vercel

1. Kết nối GitHub repo với Vercel
2. Vercel sẽ tự động deploy khi push code

### Firebase Hosting

1. Setup trong Firebase Console
2. Sử dụng GitHub integration hoặc CLI

## Troubleshooting

### Lỗi: "remote origin already exists"
```bash
# Xóa remote cũ
git remote remove origin

# Thêm lại
git remote add origin YOUR_REPO_URL
```

### Lỗi: "failed to push some refs"
```bash
# Pull code mới nhất trước
git pull origin main --rebase

# Push lại
git push origin main
```

### Lỗi: Authentication failed
- Kiểm tra username/password
- Sử dụng Personal Access Token thay vì password
- Hoặc setup SSH keys

## Next Steps

Sau khi push code lên repo:
1. ✅ Code đã được backup trên Git
2. ✅ Có thể làm việc từ nhiều máy khác nhau
3. ✅ Có thể setup CI/CD để auto deploy
4. ✅ Có thể collaborate với team

