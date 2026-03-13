# Discord Bot cho OpenClaw Integration

Bot này cho phép tích hợp **2 chiều** giữa OpenClaw và Discord:
- **Discord → OpenClaw**: Gửi lệnh từ Discord để control OpenClaw
- **OpenClaw → Discord**: OpenClaw gửi notifications/logs đến Discord

---

## 📋 Yêu cầu

- Node.js 16+
- Discord Bot Token
- Discord Channel ID

---

## 🚀 Cài đặt

### 1. Tạo Discord Bot

1. Truy cập: https://discord.com/developers/applications
2. Click **"New Application"** → Đặt tên cho bot
3. Vào tab **"Bot"** → Click **"Add Bot"**
4. **Reset Token** và copy token
5. Bật **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2. Invite Bot vào Discord Server

1. Vào tab **"OAuth2"** → **"URL Generator"**
2. Chọn scopes: `bot` và `applications.commands`
3. Chọn permissions:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
4. Copy URL và mở trong browser → Chọn server → Authorize

### 3. Lấy Discord Channel ID

1. Trong Discord, vào **Settings** → **Advanced** → Bật **Developer Mode**
2. Right-click vào channel muốn bot gửi messages → **Copy Channel ID**

### 4. Cấu hình .env.local

Mở file `.env.local` và cập nhật:

```env
# Discord Bot Token
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Discord Channel ID
DISCORD_CHANNEL_ID=your_channel_id_here

# Webhook Port (tùy chọn, mặc định: 3001)
WEBHOOK_PORT=3001

# OpenClaw Path (tùy chọn, mặc định: openclaw)
OPENCLAW_PATH=openclaw
```

---

## ▶️ Chạy Bot

### Chạy bot riêng:
```bash
npm run bot
```

### Chạy cả app và bot:
```bash
npm run dev:all
```

Bot sẽ:
- ✅ Kết nối Discord và online
- ✅ Khởi động webhook server tại `http://localhost:3001`

---

## 🎮 Sử dụng

### Discord Commands (Discord → OpenClaw)

Gõ các lệnh sau trong Discord channel:

```
!openclaw help              # Hiển thị hướng dẫn
!openclaw status            # Kiểm tra trạng thái OpenClaw
!openclaw run <task>        # Chạy task trên OpenClaw
```

**Ví dụ:**
```
!openclaw run deploy
!openclaw run build
!openclaw run test
```

---

### OpenClaw gửi messages đến Discord (OpenClaw → Discord)

#### Cách 1: Sử dụng discordNotifier service

Trong code OpenClaw của bạn:

```javascript
const discordNotifier = require('./bot/services/discordNotifier');

// Gửi message đơn giản
await discordNotifier.sendMessage('Hello from OpenClaw!');

// Notify khi task bắt đầu
await discordNotifier.notifyTaskStart('deploy');

// Notify khi task hoàn thành
await discordNotifier.notifyTaskComplete('deploy', 30, 'Deployment successful!');

// Notify khi task lỗi
await discordNotifier.notifyTaskError('deploy', 'Connection timeout');
```

#### Cách 2: Gọi webhook trực tiếp

Gửi POST request đến webhook server:

**Endpoint:** `http://localhost:3001/webhook/discord`

**Gửi message đơn giản:**
```bash
curl -X POST http://localhost:3001/webhook/discord \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from OpenClaw!"}'
```

**Gửi embed message (rich message):**
```bash
curl -X POST http://localhost:3001/webhook/discord \
  -H "Content-Type: application/json" \
  -d '{
    "embed": {
      "title": "Task Completed",
      "description": "Build task đã hoàn thành!",
      "color": 2870634,
      "fields": [
        {
          "name": "Duration",
          "value": "30s"
        }
      ]
    }
  }'
```

**Gửi đến channel cụ thể:**
```bash
curl -X POST http://localhost:3001/webhook/discord \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "channelId": "YOUR_CHANNEL_ID"
  }'
```

---

## 📁 Cấu trúc Files

```
bot/
├── index.js                      # Discord bot chính
├── services/
│   ├── openclawService.js        # Service để control OpenClaw
│   └── discordNotifier.js        # Service để OpenClaw gửi messages
├── commands/                     # (Dành cho tương lai: slash commands)
└── README.md                     # File này
```

---

## 🔧 Tích hợp với OpenClaw

### Ví dụ: OpenClaw Task Hook

Giả sử OpenClaw có hook khi task chạy:

```javascript
// openclaw.config.js
const discordNotifier = require('./bot/services/discordNotifier');

module.exports = {
  hooks: {
    onTaskStart: async (taskName) => {
      await discordNotifier.notifyTaskStart(taskName);
    },

    onTaskComplete: async (taskName, duration, output) => {
      await discordNotifier.notifyTaskComplete(taskName, duration, output);
    },

    onTaskError: async (taskName, error) => {
      await discordNotifier.notifyTaskError(taskName, error.message);
    },
  },
};
```

---

## 📊 Health Check

Kiểm tra bot có đang chạy không:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "bot": "online",
  "uptime": 123.456
}
```

---

## 🐛 Troubleshooting

### Bot offline trong Discord?
- ✅ Kiểm tra `DISCORD_BOT_TOKEN` có đúng không
- ✅ Kiểm tra bot có đang chạy không (`npm run bot`)
- ✅ Kiểm tra terminal có lỗi gì không

### Bot không trả lời commands?
- ✅ Kiểm tra đã bật **Message Content Intent** trong Discord Developer Portal
- ✅ Kiểm tra bot có quyền **Read Messages** và **Send Messages** trong channel

### Webhook không hoạt động?
- ✅ Kiểm tra `WEBHOOK_PORT` có đúng không (mặc định: 3001)
- ✅ Kiểm tra firewall có block port không
- ✅ Kiểm tra `DISCORD_CHANNEL_ID` có đúng không

---

## 🎯 Next Steps

- [ ] Thêm slash commands (commands với `/`)
- [ ] Thêm role-based permissions
- [ ] Thêm logging và monitoring
- [ ] Tích hợp với database để lưu task history

---

## 📝 License

MIT
