# 🛡️ Hướng dẫn Setup Branch Protection trên GitHub

## Mục tiêu:
- Bảo vệ branch `prod` để không ai có thể push trực tiếp hoặc xóa
- Yêu cầu pull request và review trước khi merge vào `prod`
- Bảo vệ branch `main` (tùy chọn)

## Bước 1: Vào Repository Settings

1. Vào repo trên GitHub: https://github.com/vuleq/app_task_family
2. Click tab **"Settings"** (ở trên cùng)
3. Trong menu bên trái, click **"Branches"**

## Bước 2: Thêm Branch Protection Rule cho `prod`

1. Trong phần **"Branch protection rules"**, click **"Add rule"**
2. Trong ô **"Branch name pattern"**, nhập: `prod`
3. Cấu hình các options:

### ✅ Các tùy chọn khuyên dùng:

#### **Protect matching branches:**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (hoặc số bạn muốn)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (nếu có file CODEOWNERS)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - (Nếu có CI/CD, thêm các checks ở đây)

- ✅ **Require conversation resolution before merging**
  - Yêu cầu tất cả comments phải được resolve

- ✅ **Require signed commits**
  - (Tùy chọn - yêu cầu commits phải được signed)

- ✅ **Require linear history**
  - Không cho phép merge commits, chỉ cho phép rebase/squash

- ✅ **Include administrators**
  - Áp dụng rules cho cả admin (khuyên dùng)

#### **Restrict who can push to matching branches:**
- ✅ **Restrict pushes that create matching branches**
  - Chỉ cho phép merge qua pull request

#### **Rules applied to everyone including administrators:**
- ✅ **Do not allow bypassing the above settings**
  - Không cho phép admin bypass rules

- ✅ **Do not allow force pushes**
  - Không cho phép force push

- ✅ **Do not allow deletions**
  - Không cho phép xóa branch

## Bước 3: Thêm Branch Protection Rule cho `main` (Tùy chọn)

Nếu bạn muốn bảo vệ cả branch `main`:

1. Click **"Add rule"** lần nữa
2. Branch name pattern: `main`
3. Cấu hình tương tự nhưng có thể ít strict hơn:
   - ✅ Require pull request (nhưng có thể không cần approval)
   - ✅ Do not allow force pushes
   - ✅ Do not allow deletions

## Bước 4: Workflow sau khi có Branch Protection

### Development trên `main`:
```bash
# Làm việc trên branch feature
git checkout -b feature/new-feature
# ... code changes ...
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature

# Tạo Pull Request từ feature/new-feature → main
# (Trên GitHub: New Pull Request)
```

### Deploy Production:
```bash
# Tạo Pull Request từ main → prod
# (Trên GitHub: New Pull Request)
# Yêu cầu review và approval
# Sau khi approved, merge vào prod
```

## Lưu ý:

1. **Pull Request Required**: Không thể push trực tiếp lên `prod`, phải qua PR
2. **Review Required**: Cần ít nhất 1 approval trước khi merge
3. **No Force Push**: Không thể force push (bảo vệ lịch sử)
4. **No Deletion**: Không thể xóa branch `prod`

## Tùy chọn nâng cao:

### Require Status Checks:
Nếu bạn có CI/CD (GitHub Actions, Vercel, etc.):
- Thêm các status checks vào phần "Require status checks to pass"
- Ví dụ: `vercel/deployment`, `build`, `test`, etc.

### Code Owners:
Tạo file `.github/CODEOWNERS` để tự động assign reviewers:
```
# .github/CODEOWNERS
* @vuleq
```

---

**Sau khi setup xong:**
- Branch `prod` được bảo vệ, chỉ có thể update qua Pull Request
- Cần approval trước khi merge
- Không thể force push hoặc xóa branch

