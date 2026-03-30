const axios = require('axios');

/**
 * Discord Notifier - OpenClaw sẽ dùng service này để gửi messages đến Discord
 */
class DiscordNotifier {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'http://localhost:3001/webhook/discord';
  }

  /**
   * Gửi message đơn giản đến Discord
   * @param {string} message - Nội dung message
   * @param {string} channelId - Discord channel ID (optional)
   */
  async sendMessage(message, channelId = null) {
    try {
      const response = await axios.post(this.webhookUrl, {
        message,
        channelId,
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi gửi message đến Discord:', error.message);
      throw error;
    }
  }

  /**
   * Gửi embed message (rich message) đến Discord
   * @param {Object} embedData - Embed data
   * @param {string} channelId - Discord channel ID (optional)
   */
  async sendEmbed(embedData, channelId = null) {
    try {
      const response = await axios.post(this.webhookUrl, {
        embed: embedData,
        channelId,
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi gửi embed đến Discord:', error.message);
      throw error;
    }
  }

  /**
   * Gửi notification khi OpenClaw task bắt đầu
   */
  async notifyTaskStart(taskName) {
    const embed = {
      title: '⚙️ OpenClaw Task Started',
      description: `Task **${taskName}** đang được thực thi...`,
      color: 0x3498db, // Blue
      timestamp: new Date().toISOString(),
      footer: {
        text: 'OpenClaw Bot',
      },
    };

    return this.sendEmbed(embed);
  }

  /**
   * Gửi notification khi OpenClaw task hoàn thành
   */
  async notifyTaskComplete(taskName, duration, output = '') {
    const embed = {
      title: '✅ OpenClaw Task Completed',
      description: `Task **${taskName}** đã hoàn thành thành công!`,
      color: 0x2ecc71, // Green
      fields: [
        {
          name: 'Duration',
          value: `${duration}s`,
          inline: true,
        },
        {
          name: 'Output',
          value: output.substring(0, 1000) || 'Không có output',
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'OpenClaw Bot',
      },
    };

    return this.sendEmbed(embed);
  }

  /**
   * Gửi notification khi OpenClaw task thất bại
   */
  async notifyTaskError(taskName, error) {
    const embed = {
      title: '❌ OpenClaw Task Failed',
      description: `Task **${taskName}** đã thất bại!`,
      color: 0xe74c3c, // Red
      fields: [
        {
          name: 'Error',
          value: error.substring(0, 1000),
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'OpenClaw Bot',
      },
    };

    return this.sendEmbed(embed);
  }
}

module.exports = new DiscordNotifier();
