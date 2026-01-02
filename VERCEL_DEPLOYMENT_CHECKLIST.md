# ✅ Vercel Deployment Checklist

## Đã hoàn thành:

### 1. ✅ Cấu hình Branch trên Vercel
- [x] Production Branch: `prod` (hoặc `production`)
- [x] Preview Branches: `main` và các branch khác

### 2. ✅ Environment Variables
Đảm bảo đã thêm tất cả các biến môi trường trong Vercel Dashboard:

**Firebase:**
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

**Cloudinary:**
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

**Lưu ý:** Chọn cả 3 môi trường: **Production**, **Preview**, và **Development**

### 3. ✅ Code Fixes
- [x] Fix TypeScript error trong `PhotoEvidence.tsx`
- [x] Fix TypeScript error trong `ProfilePage.tsx` (Toast show prop)
- [x] Fix React Hook warning trong `TasksList.tsx` (useEffect dependencies)
- [x] Ẩn các nút test Coin và XP

### 4. ✅ Firebase Configuration
- [ ] Đảm bảo Firebase Authorized Domains đã thêm domain Vercel
  - Vào Firebase Console → Authentication → Settings → Authorized domains
  - Thêm domain Vercel (ví dụ: `your-app.vercel.app`)

## Kiểm tra Deployment:

### Trên Vercel Dashboard:
1. Vào project → Tab **"Deployments"**
2. Kiểm tra deployment mới nhất từ branch `prod`
3. Xem logs nếu có lỗi

### Test Production URL:
1. Mở Production URL (ví dụ: `https://your-app.vercel.app`)
2. Test các chức năng:
   - [ ] Đăng nhập/Đăng ký
   - [ ] Tạo nhiệm vụ
   - [ ] Mua rương
   - [ ] Mở rương và xem video
   - [ ] Profile page

## Workflow hiện tại:

### Development:
```bash
# Làm việc trên main
git checkout main
# ... code changes ...
git add .
git commit -m "feat: new feature"
git push origin main
# → Vercel tự động deploy preview URL
```

### Production:
```bash
# Khi code đã test xong trên preview
git checkout prod
git merge main
git push origin prod
# → Vercel tự động deploy production URL
```

## Troubleshooting:

### Nếu build fail:
1. Kiểm tra logs trong Vercel Dashboard
2. Đảm bảo tất cả environment variables đã được thêm
3. Kiểm tra TypeScript errors: `npm run build` local

### Nếu runtime errors:
1. Kiểm tra console trong browser
2. Kiểm tra Firebase config
3. Kiểm tra Cloudinary config

### Nếu authentication không hoạt động:
1. Kiểm tra Firebase Authorized Domains
2. Đảm bảo domain Vercel đã được thêm

---

**🎉 Chúc mừng! App đã được deploy lên production!**

