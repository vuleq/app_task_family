const { Client, GatewayIntentBits, Events } = require('discord.js');
const express = require('express');
require('dotenv').config({ path: '.env.local' });

// Discord Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Express server cho webhook (OpenClaw gửi messages vào đây)
const app = express();
app.use(express.json());

const PORT = process.env.WEBHOOK_PORT || 3001;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// ============================================
// PHẦN 1: Discord Bot nhận lệnh từ Discord
// ============================================

client.on(Events.ClientReady, () => {
  console.log(`✅ Discord Bot đã online: ${client.user.tag}`);
  console.log(`🚀 Webhook server đang chạy tại http://localhost:${PORT}`);
});

// Lắng nghe messages từ Discord
client.on(Events.MessageCreate, async (message) => {
  // Bỏ qua messages từ bot
  if (message.author.bot) return;

  // Command: !openclaw status
  if (message.content === '!openclaw status') {
    message.reply('🤖 OpenClaw đang chạy trên máy local!');
  }

  // Command: !openclaw help
  if (message.content === '!openclaw help') {
    const helpMessage = `
**OpenClaw Discord Bot Commands:**
\`!openclaw status\` - Kiểm tra trạng thái OpenClaw
\`!openclaw help\` - Hiển thị hướng dẫn
\`!openclaw run <task>\` - Chạy task trên OpenClaw
    `;
    message.reply(helpMessage);
  }

  // Command: !openclaw run <task>
  if (message.content.startsWith('!openclaw run')) {
    const task = message.content.replace('!openclaw run', '').trim();
    if (!task) {
      message.reply('❌ Vui lòng nhập tên task. Ví dụ: `!openclaw run deploy`');
      return;
    }

    // TODO: Gọi OpenClaw API/CLI để chạy task
    message.reply(`⚙️ Đang chạy task: **${task}** trên OpenClaw...`);

    // Giả lập gọi OpenClaw (bạn sẽ thay bằng logic thật)
    setTimeout(() => {
      message.channel.send(`✅ Task **${task}** đã hoàn thành!`);
    }, 3000);
  }
});

// ============================================
// PHẦN 2: Webhook để OpenClaw gửi messages đến Discord
// ============================================

// Endpoint: OpenClaw gửi POST request vào đây để gửi message đến Discord
app.post('/webhook/discord', async (req, res) => {
  try {
    const { message, channelId, embed } = req.body;

    if (!message && !embed) {
      return res.status(400).json({ error: 'Message hoặc embed là bắt buộc' });
    }

    const targetChannelId = channelId || DISCORD_CHANNEL_ID;

    if (!targetChannelId) {
      return res.status(400).json({ error: 'Channel ID không được cung cấp' });
    }

    const channel = await client.channels.fetch(targetChannelId);

    if (!channel) {
      return res.status(404).json({ error: 'Không tìm thấy channel' });
    }

    // Gửi message đơn giản
    if (message) {
      await channel.send(message);
    }

    // Gửi embed (rich message)
    if (embed) {
      await channel.send({ embeds: [embed] });
    }

    res.json({ success: true, message: 'Đã gửi message đến Discord' });
  } catch (error) {
    console.error('Lỗi khi gửi message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.user ? 'online' : 'offline',
    uptime: process.uptime()
  });
});

// Start webhook server
app.listen(PORT, () => {
  console.log(`🌐 Webhook server đang lắng nghe tại port ${PORT}`);
});

// Login Discord bot
client.login(process.env.DISCORD_BOT_TOKEN);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Đang tắt bot...');
  client.destroy();
  process.exit(0);
});
