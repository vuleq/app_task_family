# 🚀 Quick Start Guide - Discord Bot cho OpenClaw

Hướng dẫn nhanh để setup và chạy Discord bot trong 5 phút!

---

## ✅ Checklist

- [ ] Đã có Discord Bot Token
- [ ] Đã invite bot vào Discord server
- [ ] Đã có Discord Channel ID
- [ ] Đã cài đặt dependencies (`npm install` đã chạy)

---

## 📝 Bước 1: Cấu hình .env.local

Mở file `.env.local` và điền thông tin:

```env
# Thay YOUR_BOT_TOKEN bằng token thật
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Thay YOUR_CHANNEL_ID bằng channel ID thật
DISCORD_CHANNEL_ID=YOUR_CHANNEL_ID_HERE
```

### Cách lấy Bot Token:
1. Vào: https://discord.com/developers/applications
2. Chọn bot → Tab "Bot" → Click "Reset Token"
3. Copy token

### Cách lấy Channel ID:
1. Discord → Settings → Advanced → Bật "Developer Mode"
2. Right-click vào channel → "Copy Channel ID"

---

## 🎮 Bước 2: Chạy Bot

```bash
npm run bot
```

Nếu thành công, bạn sẽ thấy:

```
✅ Discord Bot đã online: YourBot#1234
🚀 Webhook server đang chạy tại http://localhost:3001
```

Và bot sẽ **ONLINE** trong Discord (có dấu xanh ⚫→🟢)

---

## 💬 Bước 3: Test Bot

Trong Discord channel, gõ:

```
!openclaw help
```

Bot sẽ trả lời với danh sách commands!

**Thử các commands khác:**
```
!openclaw status
!openclaw run test
```

---

## 📤 Bước 4: Test OpenClaw gửi message đến Discord

### Cách 1: Dùng curl (nhanh nhất)

Mở terminal mới và chạy:

```bash
curl -X POST http://localhost:3001/webhook/discord -H "Content-Type: application/json" -d "{\"message\": \"Hello from OpenClaw!\"}"
```

### Cách 2: Dùng file demo

```bash
node bot/example-openclaw-integration.js
```

Uncomment dòng này trong file trước khi chạy:
```javascript
// simulateOpenClawTask(); // ← Bỏ comment dòng này
```

---

## ✨ Bước 5: Tích hợp với OpenClaw thật

Trong code OpenClaw, import và sử dụng:

```javascript
const discordNotifier = require('./bot/services/discordNotifier');

// Khi task bắt đầu
await discordNotifier.notifyTaskStart('deploy');

// Khi task hoàn thành
await discordNotifier.notifyTaskComplete('deploy', 30, 'Success!');

// Khi task lỗi
await discordNotifier.notifyTaskError('deploy', 'Error message');
```

---

## 🐛 Troubleshooting

### Bot vẫn offline?
```bash
# Kiểm tra bot token có đúng không
# Kiểm tra terminal có lỗi gì không
# Thử restart bot
```

### Commands không hoạt động?
1. Vào Discord Developer Portal
2. Bot tab → Privileged Gateway Intents
3. Bật: **Message Content Intent** ✅

### Webhook không nhận được messages?
```bash
# Test health endpoint
curl http://localhost:3001/health

# Kiểm tra bot có chạy không
# Kiểm tra DISCORD_CHANNEL_ID có đúng không
```

---

## 🎯 Next Steps

- ✅ Đọc [README.md](./README.md) để hiểu chi tiết hơn
- ✅ Customize commands trong [bot/index.js](./index.js)
- ✅ Xem examples trong [example-openclaw-integration.js](./example-openclaw-integration.js)
- ✅ Tích hợp với OpenClaw thật của bạn

---

**🎉 Chúc bạn thành công!**
