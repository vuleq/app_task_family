# 🚀 Hướng dẫn Deploy lên Vercel

## Bước 1: Đăng ký/Đăng nhập Vercel

1. Vào https://vercel.com
2. Click **"Sign Up"** hoặc **"Log In"**
3. Chọn **"Continue with GitHub"** và đăng nhập bằng tài khoản GitHub của bạn

## Bước 2: Import Project

1. Sau khi đăng nhập, click **"Add New..."** → **"Project"**
2. Tìm và chọn repo `vuleq/app_task_family` (hoặc repo fork của bạn)
3. Click **"Import"**

## Bước 3: Cấu hình Project

Vercel sẽ tự động detect Next.js. Bạn chỉ cần kiểm tra:

- **Framework Preset**: Next.js (tự động)
- **Root Directory**: `./` (mặc định)
- **Build Command**: `npm run build` (tự động)
- **Output Directory**: `.next` (tự động)

## Bước 4: Thêm Environment Variables ⚠️ QUAN TRỌNG

**Bạn PHẢI thêm các biến môi trường từ file `.env.local`:**

Trong phần **"Environment Variables"**, thêm các biến sau:

### Firebase Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Cloudinary Variables:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Cách thêm:**
1. Click **"Environment Variables"**
2. Thêm từng biến:
   - **Key**: Tên biến (ví dụ: `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: Giá trị từ file `.env.local` của bạn
   - **Environment**: Chọn cả 3: **Production**, **Preview**, và **Development**
3. Click **"Add"** cho mỗi biến

## Bước 5: Deploy

1. Click nút **"Deploy"** ở dưới cùng
2. Vercel sẽ tự động:
   - Install dependencies (`npm install`)
   - Build project (`npm run build`)
   - Deploy lên server
3. Đợi vài phút để hoàn tất

## Bước 6: Kiểm tra kết quả

- Sau khi deploy xong, bạn sẽ có URL như: `https://app-task-family-xxx.vercel.app`
- Click vào URL để mở app
- Test các chức năng: đăng nhập, tạo task, mua rương, etc.

## 🔄 Auto Deploy

- Mỗi lần bạn **push code lên GitHub**, Vercel sẽ tự động deploy lại
- Bạn có thể xem logs trong tab **"Deployments"**

## 🐛 Troubleshooting

### Lỗi Build:
- Kiểm tra logs trong Vercel dashboard
- Đảm bảo tất cả environment variables đã được thêm đúng

### Lỗi Runtime:
- Kiểm tra console trong browser
- Đảm bảo Firebase và Cloudinary config đúng

### Lỗi Authentication:
- Kiểm tra Firebase Auth domain trong `.env.local`
- Đảm bảo đã thêm domain Vercel vào Firebase Authorized domains

## 📝 Custom Domain (Tùy chọn)

Sau khi deploy thành công, bạn có thể:
1. Vào **Settings** → **Domains**
2. Thêm domain của bạn (ví dụ: `app.yourdomain.com`)
3. Follow hướng dẫn để setup DNS

---

**Chúc bạn deploy thành công! 🎉**

