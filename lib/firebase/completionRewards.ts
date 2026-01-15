import { collection, query, where, getDocs, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore'
import { checkDb } from './config'
import { updateProfile, getProfile } from './profile'
import { getCurrentDate, getWeekStartDate, getMonthStartDate } from './taskLimits'

// Completion rewards configuration
export const COMPLETION_REWARDS = {
  daily: {
    requiredTasks: 6,
    coins: 50,
    xp: 100,
  },
  weekly: {
    requiredDays: 5,
    coins: 300,
    xp: 600,
  },
  monthly: {
    requiredWeeks: 4,
    coins: 1200,
    xp: 2400,
  },
}

interface CompletionRecord {
  userId: string
  familyId: string // ID của gia đình
  date: string // YYYY-MM-DD for daily, week start date for weekly, month start date for monthly
  rewarded: boolean
  rewardedAt?: any
}

/**
 * Lấy số daily tasks đã approved trong ngày
 */
export const getDailyTasksCount = async (userId: string, date: string, familyId: string): Promise<number> => {
  const tasksRef = collection(checkDb(), 'tasks')
  const q = query(
    tasksRef,
    where('assignedTo', '==', userId),
    where('status', '==', 'approved'),
    where('type', '==', 'daily'),
    where('completedDate', '==', date),
    where('familyId', '==', familyId)
  )
  const snapshot = await getDocs(q)
  return snapshot.size
}

/**
 * Kiểm tra xem đã được thưởng daily completion chưa
 */
const hasDailyRewardBeenGiven = async (userId: string, date: string, familyId: string): Promise<boolean> => {
  const completionsRef = collection(checkDb(), 'dailyCompletions')
  const q = query(
    completionsRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('date', '==', date),
    where('rewarded', '==', true)
  )
  const snapshot = await getDocs(q)
  return snapshot.size > 0
}

/**
 * Đánh dấu đã trao thưởng daily completion
 */
const markDailyRewardGiven = async (userId: string, date: string, familyId: string): Promise<void> => {
  const completionsRef = collection(checkDb(), 'dailyCompletions')
  await addDoc(completionsRef, {
    userId,
    familyId,
    date,
    rewarded: true,
    rewardedAt: Timestamp.now(),
  })
}

/**
 * Kiểm tra và trao thưởng daily completion (6 daily tasks trong ngày)
 */
export const checkDailyCompletion = async (userId: string, familyId: string, completedDate?: string): Promise<{ rewarded: boolean; message?: string }> => {
  try {
    const date = completedDate || getCurrentDate()
    
    // Kiểm tra xem đã được thưởng chưa
    if (await hasDailyRewardBeenGiven(userId, date, familyId)) {
      return { rewarded: false }
    }

    // Đếm số daily tasks đã approved trong ngày
    const dailyTasksCount = await getDailyTasksCount(userId, date, familyId)

    // Nếu đã đủ 6 tasks
    if (dailyTasksCount >= COMPLETION_REWARDS.daily.requiredTasks) {
      // Trao thưởng
      const profile = await getProfile(userId)
      if (profile) {
        await updateProfile(userId, {
          coins: profile.coins + COMPLETION_REWARDS.daily.coins,
          xp: profile.xp + COMPLETION_REWARDS.daily.xp,
        })
      }

      // Đánh dấu đã trao thưởng
      await markDailyRewardGiven(userId, date, familyId)

      return {
        rewarded: true,
        message: `🎉 Hoàn thành ngày! Bạn đã hoàn thành ${COMPLETION_REWARDS.daily.requiredTasks} nhiệm vụ ngày và nhận được ${COMPLETION_REWARDS.daily.coins} Coins + ${COMPLETION_REWARDS.daily.xp} XP!`,
      }
    }

    return { rewarded: false }
  } catch (error) {
    console.error('Error checking daily completion:', error)
    return { rewarded: false }
  }
}

/**
 * Lấy số ngày đã hoàn thành trong tuần (mỗi ngày >= 6 daily tasks)
 */
export const getCompletedDaysInWeek = async (userId: string, weekStartDate: string, familyId: string): Promise<string[]> => {
  const completionsRef = collection(checkDb(), 'dailyCompletions')
  const q = query(
    completionsRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('rewarded', '==', true)
  )
  const snapshot = await getDocs(q)
  
  const completedDates: string[] = []
  snapshot.forEach(docSnap => {
    const data = docSnap.data() as CompletionRecord
    // Kiểm tra xem date có trong tuần không
    if (data.date >= weekStartDate && data.date <= getCurrentDate()) {
      completedDates.push(data.date)
    }
  })

  return completedDates.sort()
}

/**
 * Kiểm tra xem đã được thưởng weekly completion chưa
 */
const hasWeeklyRewardBeenGiven = async (userId: string, weekStartDate: string, familyId: string): Promise<boolean> => {
  const completionsRef = collection(checkDb(), 'weeklyCompletions')
  const q = query(
    completionsRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('date', '==', weekStartDate),
    where('rewarded', '==', true)
  )
  const snapshot = await getDocs(q)
  return snapshot.size > 0
}

/**
 * Đánh dấu đã trao thưởng weekly completion
 */
const markWeeklyRewardGiven = async (userId: string, weekStartDate: string, familyId: string): Promise<void> => {
  const completionsRef = collection(checkDb(), 'weeklyCompletions')
  await addDoc(completionsRef, {
    userId,
    familyId,
    date: weekStartDate,
    rewarded: true,
    rewardedAt: Timestamp.now(),
  })
}

/**
 * Kiểm tra và trao thưởng weekly completion (5 ngày hoàn thành trong tuần)
 */
export const checkWeeklyCompletion = async (userId: string, familyId: string): Promise<{ rewarded: boolean; message?: string }> => {
  try {
    const weekStartDate = getWeekStartDate()
    
    // Kiểm tra xem đã được thưởng chưa
    if (await hasWeeklyRewardBeenGiven(userId, weekStartDate, familyId)) {
      return { rewarded: false }
    }

    // Lấy số ngày đã hoàn thành trong tuần
    const completedDays = await getCompletedDaysInWeek(userId, weekStartDate, familyId)

    // Nếu đã đủ 5 ngày
    if (completedDays.length >= COMPLETION_REWARDS.weekly.requiredDays) {
      // Trao thưởng
      const profile = await getProfile(userId)
      if (profile) {
        await updateProfile(userId, {
          coins: profile.coins + COMPLETION_REWARDS.weekly.coins,
          xp: profile.xp + COMPLETION_REWARDS.weekly.xp,
        })
      }

      // Đánh dấu đã trao thưởng
      await markWeeklyRewardGiven(userId, weekStartDate, familyId)

      return {
        rewarded: true,
        message: `🎉 Hoàn thành tuần! Bạn đã hoàn thành ${COMPLETION_REWARDS.weekly.requiredDays} ngày và nhận được ${COMPLETION_REWARDS.weekly.coins} Coins + ${COMPLETION_REWARDS.weekly.xp} XP!`,
      }
    }

    return { rewarded: false }
  } catch (error) {
    console.error('Error checking weekly completion:', error)
    return { rewarded: false }
  }
}

/**
 * Lấy số tuần đã hoàn thành trong tháng (mỗi tuần >= 5 ngày)
 */
export const getCompletedWeeksInMonth = async (userId: string, monthStartDate: string, familyId: string): Promise<string[]> => {
  const completionsRef = collection(checkDb(), 'weeklyCompletions')
  const q = query(
    completionsRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('rewarded', '==', true)
  )
  const snapshot = await getDocs(q)
  
  const completedWeekStarts: string[] = []
  snapshot.forEach(docSnap => {
    const data = docSnap.data() as CompletionRecord
    // Kiểm tra xem week start date có trong tháng không
    if (data.date >= monthStartDate && data.date <= getCurrentDate()) {
      completedWeekStarts.push(data.date)
    }
  })

  return completedWeekStarts.sort()
}

/**
 * Kiểm tra xem đã được thưởng monthly completion chưa
 */
const hasMonthlyRewardBeenGiven = async (userId: string, monthStartDate: string, familyId: string): Promise<boolean> => {
  const completionsRef = collection(checkDb(), 'monthlyCompletions')
  const q = query(
    completionsRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('date', '==', monthStartDate),
    where('rewarded', '==', true)
  )
  const snapshot = await getDocs(q)
  return snapshot.size > 0
}

/**
 * Đánh dấu đã trao thưởng monthly completion
 */
const markMonthlyRewardGiven = async (userId: string, monthStartDate: string, familyId: string): Promise<void> => {
  const completionsRef = collection(checkDb(), 'monthlyCompletions')
  await addDoc(completionsRef, {
    userId,
    familyId,
    date: monthStartDate,
    rewarded: true,
    rewardedAt: Timestamp.now(),
  })
}

/**
 * Kiểm tra và trao thưởng monthly completion (4 tuần hoàn thành trong tháng)
 */
export const checkMonthlyCompletion = async (userId: string, familyId: string): Promise<{ rewarded: boolean; message?: string }> => {
  try {
    const monthStartDate = getMonthStartDate()
    
    // Kiểm tra xem đã được thưởng chưa
    if (await hasMonthlyRewardBeenGiven(userId, monthStartDate, familyId)) {
      return { rewarded: false }
    }

    // Lấy số tuần đã hoàn thành trong tháng
    const completedWeeks = await getCompletedWeeksInMonth(userId, monthStartDate, familyId)

    // Nếu đã đủ 4 tuần
    if (completedWeeks.length >= COMPLETION_REWARDS.monthly.requiredWeeks) {
      // Trao thưởng
      const profile = await getProfile(userId)
      if (profile) {
        await updateProfile(userId, {
          coins: profile.coins + COMPLETION_REWARDS.monthly.coins,
          xp: profile.xp + COMPLETION_REWARDS.monthly.xp,
        })
      }

      // Đánh dấu đã trao thưởng
      await markMonthlyRewardGiven(userId, monthStartDate, familyId)

      return {
        rewarded: true,
        message: `🎉 Hoàn thành tháng! Bạn đã hoàn thành ${COMPLETION_REWARDS.monthly.requiredWeeks} tuần và nhận được ${COMPLETION_REWARDS.monthly.coins} Coins + ${COMPLETION_REWARDS.monthly.xp} XP!`,
      }
    }

    return { rewarded: false }
  } catch (error) {
    console.error('Error checking monthly completion:', error)
    return { rewarded: false }
  }
}

/**
 * Lấy progress của completion rewards
 */
export const getCompletionProgress = async (userId: string, familyId: string): Promise<{
  daily: { current: number; required: number; completed: boolean }
  weekly: { current: number; required: number; completed: boolean }
  monthly: { current: number; required: number; completed: boolean }
}> => {
  const currentDate = getCurrentDate()
  const weekStartDate = getWeekStartDate()
  const monthStartDate = getMonthStartDate()

  // Daily progress
  const dailyTasksCount = await getDailyTasksCount(userId, currentDate, familyId)
  const dailyRewarded = await hasDailyRewardBeenGiven(userId, currentDate, familyId)

  // Weekly progress
  const completedDays = await getCompletedDaysInWeek(userId, weekStartDate, familyId)
  const weeklyRewarded = await hasWeeklyRewardBeenGiven(userId, weekStartDate, familyId)

  // Monthly progress
  const completedWeeks = await getCompletedWeeksInMonth(userId, monthStartDate, familyId)
  const monthlyRewarded = await hasMonthlyRewardBeenGiven(userId, monthStartDate, familyId)

  return {
    daily: {
      current: dailyTasksCount,
      required: COMPLETION_REWARDS.daily.requiredTasks,
      completed: dailyRewarded,
    },
    weekly: {
      current: completedDays.length,
      required: COMPLETION_REWARDS.weekly.requiredDays,
      completed: weeklyRewarded,
    },
    monthly: {
      current: completedWeeks.length,
      required: COMPLETION_REWARDS.monthly.requiredWeeks,
      completed: monthlyRewarded,
    },
  }
}
