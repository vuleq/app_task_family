const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * OpenClaw Service - Tương tác với OpenClaw từ Discord bot
 */
class OpenClawService {
  constructor() {
    this.openclawPath = process.env.OPENCLAW_PATH || 'openclaw';
  }

  /**
   * Chạy OpenClaw command
   * @param {string} command - Command để chạy
   * @returns {Promise<{success: boolean, output: string, error?: string}>}
   */
  async runCommand(command) {
    try {
      const { stdout, stderr } = await execPromise(`${this.openclawPath} ${command}`);

      return {
        success: true,
        output: stdout || stderr,
      };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.message,
      };
    }
  }

  /**
   * Lấy status của OpenClaw
   */
  async getStatus() {
    try {
      const result = await this.runCommand('status');
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Không thể kết nối với OpenClaw',
      };
    }
  }

  /**
   * Chạy task trên OpenClaw
   * @param {string} taskName - Tên task
   */
  async runTask(taskName) {
    try {
      const result = await this.runCommand(`run ${taskName}`);
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Không thể chạy task: ${taskName}`,
      };
    }
  }

  /**
   * List tất cả tasks có sẵn
   */
  async listTasks() {
    try {
      const result = await this.runCommand('list');
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Không thể lấy danh sách tasks',
      };
    }
  }
}

module.exports = new OpenClawService();
