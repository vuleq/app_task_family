import { useState, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserProfile } from '@/lib/firebase/profile'
import {
    createRecurringDailyTasks,
    checkAndUpdateParentTask,
    deleteTask,
    deleteMultipleTasks,
    saveTaskTemplate
} from '@/lib/firebase/tasks'
import {
    ensureRecurringTasksForToday,
    expireOverdueRecurringTasks,
    createRecurringTaskDef,
    ensureRecurringTasksForFamily,
} from '@/lib/firebase/recurringTasks'
import { getTaskStats } from '@/lib/firebase/taskLimits'
import { getCompletionProgress } from '@/lib/firebase/completionRewards'

export interface Task {
    id: string
    title: string
    description: string
    assignedTo: string
    assignedToName: string
    createdBy: string
    createdByName?: string
    status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'expired'
    type: 'daily' | 'weekly' | 'monthly' | 'recurring'
    category?: 'hoc' | 'khac'
    xpReward: number
    coinReward: number
    familyId?: string
    createdAt: any
    completedAt?: any
    completedDate?: string
    startedAt?: any
    evidence?: string
    taskDate?: string
    parentTaskId?: string
    groupKey?: string
    requiredCount?: number
    completedCount?: number
    recurringDefId?: string
    expiresAt?: any
}

interface UseTasksProps {
    currentUser: { uid: string }
    profile: UserProfile
    language: string
    t: any
    showToast: (message: string, type: 'success' | 'error' | 'info') => void
    onTaskComplete?: () => void
}

export function useTasks({ currentUser, profile, language, t, showToast, onTaskComplete }: UseTasksProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loadingTasks, setLoadingTasks] = useState(true)
    const [taskLimits, setTaskLimits] = useState<{
        daily: { tasks: number; coins: number }
        weekly: { tasks: number; coins: number }
        monthly: { tasks: number; coins: number }
    } | null>(null)
    const [completionProgress, setCompletionProgress] = useState<{
        daily: { current: number; required: number; completed: boolean }
        weekly: { current: number; required: number; completed: boolean }
        monthly: { current: number; required: number; completed: boolean }
    } | null>(null)

    const loadTasks = useCallback(async () => {
        try {
            if (!db) {
                setLoadingTasks(false)
                return
            }

            if (profile.isRoot) {
                try {
                    const { autoDeleteOldCompletedTasks } = await import('@/lib/firebase/tasks')
                    await autoDeleteOldCompletedTasks()
                } catch (error) {
                    console.error('Error auto-deleting old tasks:', error)
                }
            }

            if (!profile.familyId) return

            // Expire overdue recurring tasks, then generate today's instances for this user
            try {
                await expireOverdueRecurringTasks(profile.familyId)
                if (profile.isRoot) {
                    // Root generates for ALL members so they don't need to open app first
                    await ensureRecurringTasksForFamily(profile.familyId)
                } else {
                    await ensureRecurringTasksForToday(profile.familyId, currentUser.uid)
                }
            } catch (error) {
                console.error('Error handling recurring tasks:', error)
            }

            const tasksRef = collection(db, 'tasks')
            const q = query(tasksRef, where('familyId', '==', profile.familyId))
            const snapshot = await getDocs(q)
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Task[]
            setTasks(tasksData)

            try {
                const [dailyStats, weeklyStats, monthlyStats, completion] = await Promise.all([
                    getTaskStats(currentUser.uid, 'daily', profile.familyId),
                    getTaskStats(currentUser.uid, 'weekly', profile.familyId),
                    getTaskStats(currentUser.uid, 'monthly', profile.familyId),
                    getCompletionProgress(currentUser.uid, profile.familyId),
                ])

                setTaskLimits({
                    daily: { tasks: dailyStats.taskCount, coins: dailyStats.totalCoins },
                    weekly: { tasks: weeklyStats.taskCount, coins: weeklyStats.totalCoins },
                    monthly: { tasks: monthlyStats.taskCount, coins: monthlyStats.totalCoins },
                })
                setCompletionProgress(completion)
            } catch (error) {
                console.error('Error loading task limits:', error)
            }
        } catch (error) {
            console.error('Error loading tasks:', error)
        } finally {
            setLoadingTasks(false)
        }
    }, [currentUser.uid, profile.isRoot, profile.familyId])

    const handleAddTask = async (
        newTask: { title: string, description: string, type: 'daily' | 'weekly' | 'monthly' | 'recurring', xpReward: number, coinReward: number, category?: 'hoc' | 'khac' },
        selectedUsers: string[],
        users: UserProfile[],
        saveAsTemplate: boolean
    ): Promise<boolean> => {
        if (!profile.isRoot) {
            showToast(language === 'vi' ? '⚠️ Chỉ bố mẹ (ông bà) mới có thể tạo nhiệm vụ!' : '⚠️ Only parents (grandparents) can create tasks!', 'error')
            return false
        }

        if (!newTask.title.trim()) {
            showToast(language === 'vi' ? 'Vui lòng nhập tên nhiệm vụ' : 'Please enter task title', 'error')
            return false
        }

        if (selectedUsers.length === 0) {
            showToast(t('tasks.selectAtLeastOnePerson'), 'error')
            return false
        }

        try {
            let totalTaskIds: string[] = []
            const assignedUsers = users.filter(u => selectedUsers.includes(u.id))

            for (const user of assignedUsers) {
                let taskIds: string[] = []

                if (newTask.type === 'daily') {
                    if (!db) return false
                    const now = new Date()
                    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
                    const taskDate = `${vietnamTime.getUTCFullYear()}-${String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vietnamTime.getUTCDate()).padStart(2, '0')}`

                    const docRef = await addDoc(collection(db, 'tasks'), {
                        title: newTask.title,
                        description: newTask.description,
                        type: 'daily',
                        category: newTask.category || null,
                        assignedTo: user.id,
                        assignedToName: user.name,
                        createdBy: currentUser.uid,
                        createdByName: profile.name,
                        status: 'pending',
                        xpReward: newTask.xpReward,
                        coinReward: newTask.coinReward,
                        familyId: profile.familyId,
                        createdAt: Timestamp.now(),
                        taskDate: taskDate
                    })
                    taskIds.push(docRef.id)
                } else if (newTask.type === 'weekly' || newTask.type === 'monthly') {
                    const days = newTask.type === 'weekly' ? 6 : 26
                    const result = await createRecurringDailyTasks(
                        {
                            title: newTask.title,
                            description: newTask.description,
                            assignedTo: user.id,
                            assignedToName: user.name,
                            xpReward: newTask.xpReward,
                            coinReward: newTask.coinReward,
                            category: newTask.category,
                        },
                        currentUser.uid,
                        profile.name,
                        days,
                        newTask.type,
                        profile.familyId || ''
                    )
                    taskIds = result.dailyTaskIds
                } else if (newTask.type === 'recurring') {
                    const defIds = await createRecurringTaskDef(
                        {
                            title: newTask.title,
                            description: newTask.description,
                            xpReward: newTask.xpReward,
                            coinReward: newTask.coinReward,
                            category: newTask.category,
                        },
                        [{ id: user.id, name: user.name }],
                        currentUser.uid,
                        profile.name,
                        profile.familyId || ''
                    )
                    taskIds = defIds
                }
                totalTaskIds = [...totalTaskIds, ...taskIds]
            }

            if (saveAsTemplate) {
                await saveTaskTemplate(
                    newTask.title,
                    newTask.description,
                    newTask.type === 'recurring' ? 'daily' : newTask.type,
                    newTask.xpReward,
                    newTask.coinReward,
                    currentUser.uid,
                    newTask.category
                )
            }

            loadTasks()

            const userCount = assignedUsers.length
            let message = ''
            if (newTask.type === 'weekly') {
                message = t('tasks.taskCreatedWeekly').replace('{userCount}', userCount.toString()).replace('{dailyCount}', totalTaskIds.length.toString())
            } else if (newTask.type === 'monthly') {
                message = t('tasks.taskCreatedMonthly').replace('{userCount}', userCount.toString()).replace('{dailyCount}', totalTaskIds.length.toString())
            } else if (newTask.type === 'recurring') {
                message = t('tasks.taskCreatedRecurring').replace('{userCount}', userCount.toString())
            } else {
                message = t('tasks.taskCreatedDaily').replace('{userCount}', userCount.toString()).replace('{taskCount}', totalTaskIds.length.toString())
            }
            if (saveAsTemplate) {
                message += t('tasks.taskSavedAsTemplate')
            }
            showToast(message, 'success')
            return true
        } catch (error) {
            console.error('Error adding task:', error)
            showToast(t('tasks.addTaskError'), 'error')
            return false
        }
    }

    const handleStartTask = async (task: Task) => {
        if (task.status !== 'pending') return

        try {
            if (!db) return
            await updateDoc(doc(db, 'tasks', task.id), {
                status: 'in_progress',
                startedAt: Timestamp.now()
            })
            loadTasks()
            showToast(t('tasks.taskStarted'), 'success')
        } catch (error) {
            console.error('Error starting task:', error)
            showToast(t('tasks.taskStartError'), 'error')
        }
    }

    const handleCompleteTask = async (task: Task) => {
        if (task.status === 'completed' || task.status === 'approved') return

        try {
            if (!db) return
            const now = new Date()
            const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
            const completedDate = `${vietnamTime.getUTCFullYear()}-${String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vietnamTime.getUTCDate()).padStart(2, '0')}`

            await updateDoc(doc(db, 'tasks', task.id), {
                status: 'completed',
                completedAt: Timestamp.now(),
                completedDate: completedDate
            })

            if (task.parentTaskId && task.groupKey) {
                const isParentCompleted = await checkAndUpdateParentTask(task.parentTaskId, task.groupKey)
                if (isParentCompleted) {
                    showToast(t('tasks.parentTaskCompleted'), 'success')
                }
            }

            loadTasks()

            if (profile.familyId) {
                const completion = await getCompletionProgress(currentUser.uid, profile.familyId)
                setCompletionProgress(completion)
            }

            if (onTaskComplete) onTaskComplete()
            showToast(t('tasks.taskCompleted'), 'success')
        } catch (error) {
            console.error('Error completing task:', error)
            showToast(t('tasks.taskCompleteError'), 'error')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId, currentUser.uid, profile.isRoot || false)
            loadTasks()
            showToast(t('tasks.taskDeleted'), 'success')
        } catch (error: any) {
            console.error('Error deleting task:', error)
            showToast(error.message || t('tasks.taskDeleteError'), 'error')
        }
    }

    const handleDeleteMultipleTasks = async (taskIds: string[]) => {
        if (!profile.isRoot) {
            showToast(language === 'vi' ? 'Chỉ bố mẹ (ông bà) mới có quyền xóa nhiều tasks' : 'Only parents (grandparents) can delete multiple tasks', 'error')
            return
        }

        if (!confirm(language === 'vi' ? `Bạn có chắc muốn xóa ${taskIds.length} nhiệm vụ?` : `Are you sure you want to delete ${taskIds.length} tasks?`)) {
            return
        }

        try {
            await deleteMultipleTasks(taskIds, currentUser.uid, profile.isRoot)
            loadTasks()
            showToast(language === 'vi' ? `✅ Đã xóa ${taskIds.length} nhiệm vụ!` : `✅ Deleted ${taskIds.length} tasks!`, 'success')
        } catch (error: any) {
            console.error('Error deleting multiple tasks:', error)
            showToast(error.message || (language === 'vi' ? 'Lỗi khi xóa nhiều tasks' : 'Error deleting multiple tasks'), 'error')
        }
    }

    return {
        tasks,
        loadingTasks,
        taskLimits,
        completionProgress,
        loadTasks,
        handleAddTask,
        handleStartTask,
        handleCompleteTask,
        handleDeleteTask,
        handleDeleteMultipleTasks
    }
}
