import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  category?: 'hoc' | 'khac' // Category: việc học hoặc việc khác
  xpReward: number
  coinReward: number
  createdBy: string
  createdAt: any
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  createdBy: string
  createdByName?: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  type: 'daily' | 'weekly' | 'monthly'
  category?: 'hoc' | 'khac' // Category: việc học hoặc việc khác
  xpReward: number
  coinReward: number
  familyId: string // ID của gia đình (family) mà task thuộc về
  createdAt: any
  completedAt?: any
  completedDate?: string // Ngày hoàn thành (YYYY-MM-DD) để đếm giới hạn
  startedAt?: any // Thời gian bắt đầu làm (khi chuyển sang in_progress)
  evidence?: string
  taskDate?: string // Ngày của nhiệm vụ (YYYY-MM-DD) - dùng để hiển thị theo tab ngày
  // Cho nhiệm vụ tuần/tháng
  parentTaskId?: string // ID của nhiệm vụ tổng hợp (weekly/monthly)
  groupKey?: string // Key để nhóm các nhiệm vụ ngày lại
  requiredCount?: number // Số nhiệm vụ ngày cần hoàn thành (6 cho tuần, 26 cho tháng)
  completedCount?: number // Số nhiệm vụ ngày đã hoàn thành
}

// Lấy tất cả task templates
export const getTaskTemplates = async (userId: string): Promise<TaskTemplate[]> => {
  if (!db) return []
  const templatesRef = collection(checkDb(), 'taskTemplates')
  const q = query(templatesRef, where('createdBy', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as TaskTemplate[]
}

// Lưu task template
export const saveTaskTemplate = async (
  title: string,
  description: string,
  type: 'daily' | 'weekly' | 'monthly',
  xpReward: number,
  coinReward: number,
  createdBy: string,
  category?: 'hoc' | 'khac' // Category: việc học hoặc việc khác
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized')
  const templateRef = collection(checkDb(), 'taskTemplates')
  const docRef = await addDoc(templateRef, {
    title,
    description,
    type,
    category: category || null,
    xpReward,
    coinReward,
    createdBy,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

// Xóa task template
export const deleteTaskTemplate = async (templateId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')
  await deleteDoc(doc(checkDb(), 'taskTemplates', templateId))
}

// Tạo nhiệm vụ từ template
export const createTaskFromTemplate = async (
  template: TaskTemplate,
  assignedTo: string,
  assignedToName: string,
  createdBy: string,
  createdByName: string
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized')
  const tasksRef = collection(checkDb(), 'tasks')
  
  // Tạo title với prefix nếu có category
  let taskTitle = template.title
  if (template.category) {
    const typeLabel = template.type === 'daily' ? 'Nhiệm vụ ngày' :
                     template.type === 'weekly' ? 'Nhiệm vụ tuần' :
                     'Nhiệm vụ tháng'
    const categoryLabel = template.category === 'hoc' ? 'Việc học' : 'Việc khác'
    taskTitle = `${typeLabel} - ${categoryLabel} - ${template.title}`
  }
  
  // Tính taskDate (ngày hôm nay theo múi giờ Việt Nam UTC+7)
  const now = new Date()
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const taskDate = `${vietnamTime.getUTCFullYear()}-${String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vietnamTime.getUTCDate()).padStart(2, '0')}`
  
  const docRef = await addDoc(tasksRef, {
    title: taskTitle,
    description: template.description,
    type: template.type,
    category: template.category || null, // Lưu category vào task
    assignedTo,
    assignedToName,
    createdBy,
    createdByName,
    status: 'pending',
    xpReward: template.xpReward,
    coinReward: template.coinReward,
    createdAt: Timestamp.now(),
    taskDate: taskDate, // Lưu ngày của nhiệm vụ
  })
  return docRef.id
}

// Tạo nhiều nhiệm vụ ngày từ một nhiệm vụ ngày (cho tuần/tháng)
export const createRecurringDailyTasks = async (
  baseTask: {
    title: string
    description: string
    assignedTo: string
    assignedToName: string
    xpReward: number
    coinReward: number
    category?: 'hoc' | 'khac' // Thêm category
  },
  createdBy: string,
  createdByName: string,
  numberOfDays: number,
  taskType: 'weekly' | 'monthly',
  familyId: string
): Promise<{ parentTaskId: string; dailyTaskIds: string[] }> => {
  if (!db) throw new Error('Firestore not initialized')
  const tasksRef = collection(checkDb(), 'tasks')
  const dailyTaskIds: string[] = []
  const today = new Date()
  
  // Tạo groupKey để nhóm các nhiệm vụ
  const groupKey = `${baseTask.title}_${createdBy}_${baseTask.assignedTo}_${Date.now()}`

  // Tạo nhiệm vụ tổng hợp (weekly/monthly) để theo dõi tiến độ
  const parentTaskRef = await addDoc(tasksRef, {
    title: baseTask.title,
    description: baseTask.description,
    type: taskType,
    category: baseTask.category || null, // Lưu category
    assignedTo: baseTask.assignedTo,
    assignedToName: baseTask.assignedToName,
    createdBy,
    createdByName,
    status: 'pending',
    xpReward: baseTask.xpReward * numberOfDays, // Tổng XP cho tất cả nhiệm vụ
    coinReward: baseTask.coinReward * numberOfDays, // Tổng Coins cho tất cả nhiệm vụ
    familyId: familyId, // Lưu familyId vào task
    createdAt: Timestamp.now(),
    groupKey,
    requiredCount: numberOfDays,
    completedCount: 0,
  })
  const parentTaskId = parentTaskRef.id

  // Tạo các nhiệm vụ ngày và liên kết với nhiệm vụ tổng hợp
  for (let i = 0; i < numberOfDays; i++) {
    const taskDateObj = new Date(today)
    taskDateObj.setDate(today.getDate() + i)
    
    // Format taskDate thành YYYY-MM-DD
    const taskDateStr = `${taskDateObj.getFullYear()}-${String(taskDateObj.getMonth() + 1).padStart(2, '0')}-${String(taskDateObj.getDate()).padStart(2, '0')}`
    
    const taskTitle = `${baseTask.title} - ${taskDateObj.toLocaleDateString('vi-VN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'numeric' 
    })}`

    const docRef = await addDoc(tasksRef, {
      title: taskTitle,
      description: baseTask.description,
      type: 'daily',
      category: baseTask.category || null, // Lưu category cho nhiệm vụ ngày
      assignedTo: baseTask.assignedTo,
      assignedToName: baseTask.assignedToName,
      createdBy,
      createdByName,
      status: 'pending',
      xpReward: baseTask.xpReward,
      coinReward: baseTask.coinReward,
      familyId: familyId, // Lưu familyId vào task
      createdAt: Timestamp.now(),
      scheduledDate: Timestamp.fromDate(taskDateObj),
      taskDate: taskDateStr, // Lưu ngày của nhiệm vụ (YYYY-MM-DD)
      parentTaskId,
      groupKey,
    })
    dailyTaskIds.push(docRef.id)
  }

  return { parentTaskId, dailyTaskIds }
}

// Kiểm tra và cập nhật tiến độ nhiệm vụ tuần/tháng
export const checkAndUpdateParentTask = async (
  parentTaskId: string,
  groupKey: string
): Promise<boolean> => {
  try {
    if (!db) return false

    // Đếm số nhiệm vụ ngày đã hoàn thành trong nhóm (chỉ đếm nhiệm vụ ngày, không đếm nhiệm vụ tổng hợp)
    const tasksRef = collection(checkDb(), 'tasks')
    
    // Lấy tất cả nhiệm vụ trong nhóm
    const groupQuery = query(tasksRef, where('groupKey', '==', groupKey))
    const groupSnapshot = await getDocs(groupQuery)
    
    // Đếm số nhiệm vụ ngày đã hoàn thành (completed hoặc approved)
    // Chỉ đếm nhiệm vụ có parentTaskId (tức là nhiệm vụ ngày, không phải nhiệm vụ tổng hợp)
    let completedCount = 0
    groupSnapshot.forEach(doc => {
      const task = doc.data()
      // Chỉ đếm nhiệm vụ ngày (có parentTaskId) và đã hoàn thành/approved
      if (task.parentTaskId && (task.status === 'completed' || task.status === 'approved')) {
        completedCount++
      }
    })

    // Lấy nhiệm vụ tổng hợp
    const parentTaskRef = doc(checkDb(), 'tasks', parentTaskId)
    const parentTaskSnap = await getDoc(parentTaskRef)
    
    if (!parentTaskSnap.exists()) {
      return false
    }

    const parentTask = parentTaskSnap.data()
    const requiredCount = parentTask.requiredCount || 0

    // Cập nhật số lượng đã hoàn thành
    await updateDoc(parentTaskRef, {
      completedCount,
    })

    // Nếu đã hoàn thành đủ số lượng → tự động hoàn thành nhiệm vụ tổng hợp
    if (completedCount >= requiredCount && (parentTask.status === 'pending' || parentTask.status === 'in_progress')) {
      await updateDoc(parentTaskRef, {
        status: 'completed',
        completedAt: Timestamp.now(),
      })
      return true // Đã hoàn thành
    }

    return false
  } catch (error) {
    console.error('Error checking parent task:', error)
    return false
  }
}

/**
 * Xóa task - cho phép xóa bất kỳ trạng thái nào
 * Quyền xóa: Chỉ bố mẹ (ông bà) mới được xóa nhiệm vụ
 */
export const deleteTask = async (taskId: string, userId: string, isRoot: boolean = false): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized')
  
  const taskRef = doc(checkDb(), 'tasks', taskId)
  const taskSnap = await getDoc(taskRef)
  
  if (!taskSnap.exists()) {
    throw new Error('Task không tồn tại')
  }
  
  const task = taskSnap.data() as Task
  
  // Kiểm tra quyền: Chỉ bố mẹ (ông bà) mới được xóa nhiệm vụ
  if (!isRoot) {
    throw new Error('Chỉ bố mẹ (ông bà) mới có quyền xóa nhiệm vụ')
  }
  
  // Nếu là parent task, cần xóa tất cả child tasks
  if (!task.parentTaskId && task.groupKey) {
    // Tìm tất cả tasks có cùng groupKey
    const tasksRef = collection(checkDb(), 'tasks')
    const groupQuery = query(tasksRef, where('groupKey', '==', task.groupKey))
    const groupSnapshot = await getDocs(groupQuery)
    
    // Xóa tất cả tasks trong group
    const deletePromises = groupSnapshot.docs.map(docSnap => deleteDoc(docSnap.ref))
    await Promise.all(deletePromises)
  } else {
    // Xóa task đơn lẻ
    await deleteDoc(taskRef)
  }
}

/**
 * Xóa nhiều tasks cùng lúc (chỉ root user)
 */
export const deleteMultipleTasks = async (taskIds: string[], userId: string, isRoot: boolean = false): Promise<void> => {
  if (!isRoot) {
    throw new Error('Chỉ root user mới có quyền xóa nhiều tasks cùng lúc')
  }
  
  if (!db) throw new Error('Firestore not initialized')
  
  const deletePromises = taskIds.map(taskId => {
    const taskRef = doc(checkDb(), 'tasks', taskId)
    return deleteDoc(taskRef).catch(err => {
      console.error(`Error deleting task ${taskId}:`, err)
      // Không throw để tiếp tục xóa các task khác
    })
  })
  
  await Promise.all(deletePromises)
}

/**
 * Tự động xóa các task đã hoàn thành quá 30 ngày
 */
export const autoDeleteOldCompletedTasks = async (): Promise<number> => {
  if (!db) return 0
  
  const tasksRef = collection(checkDb(), 'tasks')
  const now = Timestamp.now()
  const thirtyDaysAgo = Timestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000)
  
  // Lấy tất cả tasks đã hoàn thành hoặc approved
  const completedQuery = query(
    tasksRef,
    where('status', 'in', ['completed', 'approved'])
  )
  const snapshot = await getDocs(completedQuery)
  
  let deletedCount = 0
  const deletePromises: Promise<void>[] = []
  
  snapshot.docs.forEach(docSnap => {
    const task = docSnap.data() as Task
    const completedAt = task.completedAt as Timestamp | undefined
    
    // Nếu task đã hoàn thành quá 30 ngày, đánh dấu để xóa
    if (completedAt && completedAt.toMillis() < thirtyDaysAgo.toMillis()) {
      deletePromises.push(
        deleteDoc(docSnap.ref).then(() => {
          deletedCount++
        }).catch(err => {
          console.error(`Error deleting old task ${docSnap.id}:`, err)
        })
      )
    }
  })
  
  await Promise.all(deletePromises)
  return deletedCount
}

