import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { checkDb } from './config'
import { Task } from './tasks'

// Giới hạn nhiệm vụ và coin
export const TASK_LIMITS = {
  daily: {
    maxTasks: 10,
    maxCoins: 50,
  },
  weekly: {
    maxTasks: 7,
    maxCoins: 50, // Tương tự daily
  },
  monthly: {
    maxTasks: 30,
    maxCoins: 50, // Tương tự daily
  },
}

/**
 * Lấy ngày hiện tại dạng YYYY-MM-DD (theo múi giờ Việt Nam)
 */
export const getCurrentDate = (): string => {
  const now = new Date()
  // Chuyển sang múi giờ Việt Nam (UTC+7)
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const year = vietnamTime.getUTCFullYear()
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(vietnamTime.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Lấy ngày bắt đầu của tuần (7 ngày trước)
 */
export const getWeekStartDate = (): string => {
  const now = new Date()
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const weekAgo = new Date(vietnamTime.getTime() - 6 * 24 * 60 * 60 * 1000) // 6 ngày trước + hôm nay = 7 ngày
  const year = weekAgo.getUTCFullYear()
  const month = String(weekAgo.getUTCMonth() + 1).padStart(2, '0')
  const day = String(weekAgo.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Lấy ngày bắt đầu của tháng (30 ngày trước)
 */
export const getMonthStartDate = (): string => {
  const now = new Date()
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const monthAgo = new Date(vietnamTime.getTime() - 29 * 24 * 60 * 60 * 1000) // 29 ngày trước + hôm nay = 30 ngày
  const year = monthAgo.getUTCFullYear()
  const month = String(monthAgo.getUTCMonth() + 1).padStart(2, '0')
  const day = String(monthAgo.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Đếm số nhiệm vụ đã hoàn thành và tổng coin trong khoảng thời gian
 */
export const getTaskStats = async (
  userId: string,
  taskType: 'daily' | 'weekly' | 'monthly'
): Promise<{ taskCount: number; totalCoins: number; tasks: Task[] }> => {
  const tasksRef = collection(checkDb(), 'tasks')
  
  let startDate: string
  if (taskType === 'daily') {
    startDate = getCurrentDate()
  } else if (taskType === 'weekly') {
    startDate = getWeekStartDate()
  } else {
    startDate = getMonthStartDate()
  }

  // Lấy tất cả tasks đã được approve của user
  const q = query(
    tasksRef,
    where('assignedTo', '==', userId),
    where('status', '==', 'approved')
  )
  
  const snapshot = await getDocs(q)
  const allTasks = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Task[]

  // Filter theo completedDate trong khoảng thời gian
  const filteredTasks = allTasks.filter(task => {
    if (!task.completedDate) return false
    
    // So sánh ngày (YYYY-MM-DD)
    return task.completedDate >= startDate && task.completedDate <= getCurrentDate()
  })

  const taskCount = filteredTasks.length
  const totalCoins = filteredTasks.reduce((sum, task) => sum + (task.coinReward || 0), 0)

  return { taskCount, totalCoins, tasks: filteredTasks }
}

/**
 * Kiểm tra xem có thể hoàn thành nhiệm vụ không (chưa đạt giới hạn)
 */
export const canCompleteTask = async (
  userId: string,
  taskType: 'daily' | 'weekly' | 'monthly',
  taskCoinReward: number
): Promise<{ allowed: boolean; reason?: string; currentTasks: number; currentCoins: number; maxTasks: number; maxCoins: number }> => {
  const stats = await getTaskStats(userId, taskType)
  const limits = TASK_LIMITS[taskType]

  // Kiểm tra giới hạn số nhiệm vụ
  if (stats.taskCount >= limits.maxTasks) {
    return {
      allowed: false,
      reason: `Đã đạt giới hạn ${limits.maxTasks} nhiệm vụ ${taskType === 'daily' ? 'ngày' : taskType === 'weekly' ? 'tuần' : 'tháng'}`,
      currentTasks: stats.taskCount,
      currentCoins: stats.totalCoins,
      maxTasks: limits.maxTasks,
      maxCoins: limits.maxCoins,
    }
  }

  // Kiểm tra giới hạn coin
  if (stats.totalCoins + taskCoinReward > limits.maxCoins) {
    return {
      allowed: false,
      reason: `Đã đạt giới hạn ${limits.maxCoins} coin ${taskType === 'daily' ? 'ngày' : taskType === 'weekly' ? 'tuần' : 'tháng'}. Còn lại: ${limits.maxCoins - stats.totalCoins} coin`,
      currentTasks: stats.taskCount,
      currentCoins: stats.totalCoins,
      maxTasks: limits.maxTasks,
      maxCoins: limits.maxCoins,
    }
  }

  return {
    allowed: true,
    currentTasks: stats.taskCount,
    currentCoins: stats.totalCoins,
    maxTasks: limits.maxTasks,
    maxCoins: limits.maxCoins,
  }
}

