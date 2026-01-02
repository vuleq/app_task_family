# ⚡ Quick Start Guide

Hướng dẫn nhanh để bắt đầu với Family Tasks project.

## 🎯 Mục tiêu

1. ✅ Chạy được app trên local
2. ✅ Push code lên repo riêng

## 📋 Checklist

### 1. Cài đặt cơ bản (5 phút)

```bash
# Bước 1: Vào thư mục project
cd app_task_family

# Bước 2: Cài đặt dependencies
npm install

# Bước 3: Chạy dev server
npm run dev
```

Mở browser: http://localhost:3000

### 2. Setup Firebase (10 phút)

**Option A: Dùng Firebase thật (Khuyến nghị)**

1. Tạo project tại: https://console.firebase.google.com/
2. Bật Authentication (Email + Google)
3. Bật Firestore
4. Bật Storage
5. Copy `.env.example` → `.env.local`
6. Điền thông tin Firebase vào `.env.local`

**Option B: Dùng Emulator (Development)**

```bash
npm install -g firebase-tools
firebase login
firebase emulators:start
```

### 3. Test Local (2 phút)

```bash
# Chạy dev server
npm run dev

# Mở http://localhost:3000
# Test đăng ký/đăng nhập
# Test profile
```

### 4. Push lên Git (5 phút)

```bash
# Khởi tạo git
git init
git add .
git commit -m "Initial commit: Sprint 0"

# Kết nối với repo (thay YOUR_REPO_URL)
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
```

## 🚀 Các bước chi tiết

Xem thêm:
- **SETUP_LOCAL.md** - Hướng dẫn chi tiết chạy local
- **SETUP_GIT.md** - Hướng dẫn chi tiết setup Git
- **README.md** - Tổng quan về project

## ⚠️ Lưu ý

1. **KHÔNG** commit file `.env.local` lên Git
2. Tạo PWA icons nếu muốn test PWA đầy đủ
3. Firebase project cần bật đúng các services

## 🎉 Done!

Sau khi hoàn thành, bạn có:
- ✅ App chạy được trên local
- ✅ Code đã push lên Git
- ✅ Sẵn sàng cho Sprint tiếp theo

## 📞 Cần giúp đỡ?

- Xem **SETUP_LOCAL.md** cho vấn đề về local
- Xem **SETUP_GIT.md** cho vấn đề về Git
- Xem **README.md** cho thông tin tổng quan

