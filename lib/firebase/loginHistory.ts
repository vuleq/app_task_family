import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore'
import { checkDb } from './config'
import { getCurrentDate } from './taskLimits'

export interface MemberStats {
  loginDays: number
  loginStreak: number
  tasksApproved: number
  tasksPendingApproval: number
}

/**
 * Ghi nhận ngày đăng nhập của user (idempotent - bỏ qua nếu đã ghi hôm nay)
 */
export const recordDailyLogin = async (userId: string, familyId: string): Promise<void> => {
  if (!userId || !familyId) return
  const today = getCurrentDate()

  const loginRef = collection(checkDb(), 'loginHistory')
  const q = query(
    loginRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('date', '==', today)
  )
  const snap = await getDocs(q)
  if (snap.size > 0) return

  await addDoc(loginRef, {
    userId,
    familyId,
    date: today,
    loginAt: Timestamp.now(),
  })
}

/**
 * Lấy thống kê của 1 thành viên trong 30 ngày gần nhất
 */
export const getMemberStats = async (userId: string, familyId: string): Promise<MemberStats> => {
  const now = new Date()
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const monthAgo = new Date(vietnamTime.getTime() - 29 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = `${monthAgo.getUTCFullYear()}-${String(monthAgo.getUTCMonth() + 1).padStart(2, '0')}-${String(monthAgo.getUTCDate()).padStart(2, '0')}`

  const db = checkDb()

  // --- Login stats ---
  const loginRef = collection(db, 'loginHistory')
  const loginSnap = await getDocs(query(
    loginRef,
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('date', '>=', thirtyDaysAgo)
  ))
  const loginDates = loginSnap.docs.map(d => d.data().date as string).sort()
  const loginDays = loginDates.length

  // Tính streak: đếm ngày liên tiếp tính từ hôm nay về trước
  let loginStreak = 0
  if (loginDates.length > 0) {
    const dateSet = new Set(loginDates)
    const check = new Date(vietnamTime)
    while (true) {
      const dateStr = `${check.getUTCFullYear()}-${String(check.getUTCMonth() + 1).padStart(2, '0')}-${String(check.getUTCDate()).padStart(2, '0')}`
      if (dateSet.has(dateStr)) {
        loginStreak++
        check.setUTCDate(check.getUTCDate() - 1)
      } else {
        break
      }
    }
  }

  // --- Task stats ---
  const tasksRef = collection(db, 'tasks')

  const approvedSnap = await getDocs(query(
    tasksRef,
    where('assignedTo', '==', userId),
    where('familyId', '==', familyId),
    where('status', '==', 'approved'),
    where('completedDate', '>=', thirtyDaysAgo)
  ))

  const pendingSnap = await getDocs(query(
    tasksRef,
    where('assignedTo', '==', userId),
    where('familyId', '==', familyId),
    where('status', '==', 'completed')
  ))

  return {
    loginDays,
    loginStreak,
    tasksApproved: approvedSnap.size,
    tasksPendingApproval: pendingSnap.size,
  }
}
