# 🗑️ Hướng dẫn Clear Cache Next.js

## ⚠️ Khi nào cần clear cache:

- ✅ Đã restart dev server nhưng vẫn không hoạt động
- ✅ Gặp lỗi build/compile
- ✅ Code đã sửa nhưng không thấy thay đổi
- ✅ Environment variables không được load

---

## 🔧 Cách Clear Cache:

### **Cách 1: Xóa thư mục `.next` (Khuyến nghị)**

**Windows PowerShell:**
```powershell
cd "D:\linh tinh\web_for_FaSol\app_task_family"
Remove-Item -Recurse -Force .next
npm run dev
```

**Windows CMD:**
```cmd
cd "D:\linh tinh\web_for_FaSol\app_task_family"
rmdir /s /q .next
npm run dev
```

**Linux/Mac:**
```bash
cd app_task_family
rm -rf .next
npm run dev
```

### **Cách 2: Dùng npm script (nếu có)**

Nếu có script trong `package.json`:
```bash
npm run clean
npm run dev
```

---

## 📋 Checklist sau khi clear cache:

1. ✅ Đã xóa thư mục `.next`
2. ✅ Đã restart dev server
3. ✅ Đã reload browser (F5 hoặc Ctrl+Shift+R)
4. ✅ Đã kiểm tra console log

---

## 🎯 Đối với Environment Variables:

**Thông thường:**
- ✅ Chỉ cần **restart dev server** là đủ
- ❌ Không cần clear cache

**Nếu vẫn không hoạt động:**
- ✅ Clear cache (xóa `.next`)
- ✅ Restart dev server
- ✅ Reload browser

---

## 💡 Lưu ý:

- Cache Next.js được lưu trong thư mục `.next/`
- Xóa `.next/` sẽ làm Next.js phải build lại từ đầu (lần đầu sẽ chậm hơn)
- Environment variables được load khi server khởi động, không phụ thuộc vào cache

---

**Khuyến nghị: Thử restart trước, nếu không được thì mới clear cache!**

