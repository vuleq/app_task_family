/**
 * VÍ DỤ: OpenClaw gửi messages đến Discord
 *
 * File này demo cách OpenClaw có thể tích hợp với Discord bot
 * để gửi notifications khi chạy tasks
 */

const discordNotifier = require('./services/discordNotifier');

// Giả lập OpenClaw task
async function simulateOpenClawTask() {
  const taskName = 'deploy-production';

  try {
    console.log(`[OpenClaw] Bắt đầu task: ${taskName}`);

    // 1. Notify khi task bắt đầu
    await discordNotifier.notifyTaskStart(taskName);

    // 2. Giả lập task đang chạy (thay bằng logic thật của OpenClaw)
    console.log('[OpenClaw] Đang thực thi task...');
    await sleep(5000); // Sleep 5 giây

    // 3. Giả sử task thành công
    const duration = 5;
    const output = 'Deployment completed successfully!\nAll services are running.';

    console.log(`[OpenClaw] Task hoàn thành sau ${duration}s`);

    // 4. Notify khi task hoàn thành
    await discordNotifier.notifyTaskComplete(taskName, duration, output);

    console.log('[OpenClaw] ✅ Đã gửi notification đến Discord!');
  } catch (error) {
    console.error('[OpenClaw] ❌ Task thất bại:', error.message);

    // 5. Notify khi task lỗi
    await discordNotifier.notifyTaskError(taskName, error.message);
  }
}

// Helper function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// DEMO KHÁC: Gửi các loại messages khác nhau
// ============================================

async function demoVariousMessages() {
  // 1. Message đơn giản
  await discordNotifier.sendMessage('🚀 OpenClaw đã khởi động!');

  await sleep(1000);

  // 2. Custom embed
  const customEmbed = {
    title: '📊 System Status',
    description: 'Tất cả services đang hoạt động bình thường',
    color: 0x00ff00, // Green
    fields: [
      {
        name: 'CPU Usage',
        value: '45%',
        inline: true,
      },
      {
        name: 'Memory',
        value: '2.1GB / 4GB',
        inline: true,
      },
      {
        name: 'Uptime',
        value: '5 days',
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  await discordNotifier.sendEmbed(customEmbed);

  await sleep(1000);

  // 3. Warning message
  const warningEmbed = {
    title: '⚠️ Warning',
    description: 'Disk space đang thấp!',
    color: 0xff9900, // Orange
    fields: [
      {
        name: 'Available Space',
        value: '2.5GB',
        inline: false,
      },
    ],
  };

  await discordNotifier.sendEmbed(warningEmbed);
}

// ============================================
// CHẠY DEMO
// ============================================

// Uncomment dòng nào muốn chạy:

// simulateOpenClawTask();
// demoVariousMessages();

// Hoặc export để dùng trong OpenClaw thật:
module.exports = {
  simulateOpenClawTask,
  demoVariousMessages,
};
