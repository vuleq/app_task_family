import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'

const checkDb = () => {
  if (!db) throw new Error('Firestore is not initialized.')
  return db
}

/** Vietnam midnight as UTC timestamp for today */
export const getVietnamMidnightToday = (): Date => {
  const now = new Date()
  // Vietnam is UTC+7, so midnight VN = 17:00 UTC previous day
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const vnMidnight = new Date(Date.UTC(
    vnNow.getUTCFullYear(),
    vnNow.getUTCMonth(),
    vnNow.getUTCDate(),
    0, 0, 0, 0
  ))
  // Convert back to UTC: subtract 7 hours
  return new Date(vnMidnight.getTime() - 7 * 60 * 60 * 1000)
}

export const getVietnamDateString = (): string => {
  const now = new Date()
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return `${vnNow.getUTCFullYear()}-${String(vnNow.getUTCMonth() + 1).padStart(2, '0')}-${String(vnNow.getUTCDate()).padStart(2, '0')}`
}

/**
 * For each recurring task definition assigned to a user, ensure a daily instance
 * exists for today. If not, create one.
 */
export const ensureRecurringTasksForToday = async (
  familyId: string,
  userId: string
): Promise<void> => {
  const db_ = checkDb()
  const today = getVietnamDateString()

  // Load all recurring task definitions for this user
  const defsSnap = await getDocs(
    query(
      collection(db_, 'recurringTaskDefs'),
      where('familyId', '==', familyId),
      where('assignedTo', '==', userId),
      where('active', '==', true)
    )
  )

  if (defsSnap.empty) return

  // Load today's existing instances for this user to avoid duplicates
  const existingSnap = await getDocs(
    query(
      collection(db_, 'tasks'),
      where('familyId', '==', familyId),
      where('assignedTo', '==', userId),
      where('taskDate', '==', today),
      where('type', '==', 'recurring')
    )
  )
  const existingDefIds = new Set(
    existingSnap.docs.map(d => d.data().recurringDefId as string).filter(Boolean)
  )

  const creates: Promise<any>[] = []
  defsSnap.forEach(defDoc => {
    if (existingDefIds.has(defDoc.id)) return
    const def = defDoc.data()
    creates.push(
      addDoc(collection(db_, 'tasks'), {
        title: def.title,
        description: def.description,
        type: 'recurring',
        category: def.category || null,
        assignedTo: def.assignedTo,
        assignedToName: def.assignedToName,
        createdBy: def.createdBy,
        createdByName: def.createdByName,
        status: 'pending',
        xpReward: def.xpReward,
        coinReward: def.coinReward,
        familyId,
        createdAt: Timestamp.now(),
        taskDate: today,
        recurringDefId: defDoc.id,
        expiresAt: Timestamp.fromDate(
          // expires at next Vietnam midnight
          new Date(getVietnamMidnightToday().getTime() + 24 * 60 * 60 * 1000)
        ),
      })
    )
  })

  await Promise.all(creates)
}

/**
 * Mark all pending/in_progress recurring tasks whose expiresAt has passed as 'expired'.
 * Returns number of tasks expired.
 */
export const expireOverdueRecurringTasks = async (familyId: string): Promise<number> => {
  const db_ = checkDb()
  const now = Timestamp.now()

  const snap = await getDocs(
    query(
      collection(db_, 'tasks'),
      where('familyId', '==', familyId),
      where('type', '==', 'recurring'),
      where('status', 'in', ['pending', 'in_progress'])
    )
  )

  const updates: Promise<void>[] = []
  snap.forEach(d => {
    const task = d.data()
    if (task.expiresAt && task.expiresAt.toMillis() <= now.toMillis()) {
      updates.push(
        updateDoc(doc(db_, 'tasks', d.id), { status: 'expired' })
      )
    }
  })

  await Promise.all(updates)
  return updates.length
}

/**
 * Create a recurring task definition and assign to multiple users.
 */
export const createRecurringTaskDef = async (
  task: {
    title: string
    description: string
    xpReward: number
    coinReward: number
    category?: 'hoc' | 'khac'
  },
  assignedUsers: { id: string; name: string }[],
  createdBy: string,
  createdByName: string,
  familyId: string
): Promise<string[]> => {
  const db_ = checkDb()
  const ids: string[] = []

  for (const user of assignedUsers) {
    const ref = await addDoc(collection(db_, 'recurringTaskDefs'), {
      title: task.title,
      description: task.description,
      category: task.category || null,
      xpReward: task.xpReward,
      coinReward: task.coinReward,
      assignedTo: user.id,
      assignedToName: user.name,
      createdBy,
      createdByName,
      familyId,
      active: true,
      createdAt: Timestamp.now(),
    })
    ids.push(ref.id)
  }

  return ids
}
