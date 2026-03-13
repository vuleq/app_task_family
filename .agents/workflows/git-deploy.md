---
description: Quy trình đồng bộ Main sang Production và Deploy lên Vercel
---

Quy trình này giúp bạn đẩy code lên `main`, sau đó tự động merge sang `production` để Vercel deploy.

// turbo
1. Lưu toàn bộ thay đổi vào nhánh `main`:
   `git add .`
   `git commit -m "Update from main: %DATE% %TIME%"`
   `git push origin main`

// turbo
2. Chuyển sang nhánh `production`, lấy code mới nhất và merge:
   `git checkout production`
   `git pull origin production --rebase`
   `git merge main`

// turbo
3. Đẩy code lên `production` để kích hoạt Vercel Deploy:
   `git push origin production`

4. Quay lại nhánh `main` để tiếp tục làm việc:
   `git checkout main`

**Lưu ý:** Vercel sẽ tự động deploy khi thấy nhánh `production` có code mới.


