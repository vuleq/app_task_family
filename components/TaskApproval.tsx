'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { checkDb } from '@/lib/firebase/config'
import { updateProfile, getProfile } from '@/lib/firebase/profile'
import { checkAndUpdateParentTask } from '@/lib/firebase/tasks'
import { useI18n } from '@/lib/i18n/context'
import { getTranslatedTaskTitle } from '@/lib/i18n/templateTranslations'
import Toast from './Toast'

interface Task {
  id: string
  title: string
  assignedToName: string
  assignedTo: string
  createdBy: string
  createdByName?: string
  status: string
  type: 'daily' | 'weekly' | 'monthly' // Thêm type để check limits
  xpReward: number
  coinReward: number
  evidence?: string
  parentTaskId?: string
  groupKey?: string
  completedDate?: string // Thêm completedDate để check limits
}

interface TaskApprovalProps {
  currentUserId: string
  currentUserRole: 'parent' | 'child'
  onApprovalComplete?: () => void
}

export default function TaskApproval({ currentUserId, currentUserRole, onApprovalComplete }: TaskApprovalProps) {
  const { t, language } = useI18n()
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const loadPendingTasks = useCallback(async () => {
    try {
      const tasksRef = collection(checkDb(), 'tasks')
      const q = query(tasksRef, where('status', '==', 'completed'))
      const snapshot = await getDocs(q)
      let tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]

      // Lọc chỉ những nhiệm vụ mà user hiện tại có quyền phê duyệt
      // Quyền phê duyệt: Người tạo nhiệm vụ HOẶC người có role 'parent'
      tasksData = tasksData.filter(task => {
        const isCreator = task.createdBy === currentUserId
        const isParent = currentUserRole === 'parent'
        return isCreator || isParent
      })

      // Lấy tên người tạo cho mỗi task
      for (const task of tasksData) {
        if (!task.createdByName && task.createdBy) {
          try {
            const creatorProfile = await getProfile(task.createdBy)
            if (creatorProfile) {
              task.createdByName = creatorProfile.name
            }
          } catch (error) {
            console.error('Error loading creator name:', error)
          }
        }
      }

      setPendingTasks(tasksData)
    } catch (error) {
      console.error('Error loading pending tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, currentUserRole])

  useEffect(() => {
    loadPendingTasks()
  }, [loadPendingTasks])

  const handleApprove = async (task: Task) => {
    try {
      // Kiểm tra giới hạn nhiệm vụ và coin trước khi approve
      const { canCompleteTask } = await import('@/lib/firebase/taskLimits')
      const limitCheck = await canCompleteTask(task.assignedTo, task.type, task.coinReward)
      
      if (!limitCheck.allowed) {
        setToast({ 
          show: true, 
          message: limitCheck.reason || 'Đã đạt giới hạn nhiệm vụ/coin', 
          type: 'error' 
        })
        return
      }

      // Lấy ngày hiện tại (YYYY-MM-DD) nếu chưa có completedDate
      let completedDate = task.completedDate
      if (!completedDate) {
        const now = new Date()
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000) // UTC+7
        completedDate = `${vietnamTime.getUTCFullYear()}-${String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vietnamTime.getUTCDate()).padStart(2, '0')}`
      }

      // Cập nhật trạng thái task
      await updateDoc(doc(checkDb(), 'tasks', task.id), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        completedDate: completedDate // Đảm bảo có completedDate
      })

      // Cập nhật XP và Coins cho người làm
      const userProfile = await getProfile(task.assignedTo)
      if (userProfile) {
        await updateProfile(task.assignedTo, {
          xp: userProfile.xp + task.xpReward,
          coins: userProfile.coins + task.coinReward
        })
      }

      // Nếu là nhiệm vụ ngày thuộc nhiệm vụ tuần/tháng, kiểm tra tiến độ
      let message = `Đã phê duyệt! ${task.assignedToName} nhận được ${task.xpReward} XP và ${task.coinReward} Coins.`
      if (task.parentTaskId && task.groupKey) {
        const isParentCompleted = await checkAndUpdateParentTask(task.parentTaskId, task.groupKey)
        if (isParentCompleted) {
          message = `🎉 Chúc mừng! ${task.assignedToName} đã hoàn thành nhiệm vụ tuần/tháng!\n\n${message}`
        }
      }
      
      setToast({ show: true, message, type: 'success' })
      loadPendingTasks()
      if (onApprovalComplete) onApprovalComplete()
    } catch (error) {
      console.error('Error approving task:', error)
      setToast({ show: true, message: t('errors.profileUpdateError'), type: 'error' })
    }
  }

  const handleReject = async (task: Task) => {
    try {
      await updateDoc(doc(checkDb(), 'tasks', task.id), {
        status: 'pending'
      })
      setToast({ show: true, message: 'Đã từ chối nhiệm vụ', type: 'success' })
      loadPendingTasks()
    } catch (error) {
      console.error('Error rejecting task:', error)
      setToast({ show: true, message: 'Lỗi khi từ chối nhiệm vụ', type: 'error' })
    }
  }

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>
  }

  if (pendingTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('approval.noPendingTasks')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <h3 className="text-lg font-semibold text-gray-100">✅ {t('approval.title')}</h3>
      <div className="space-y-3">
        {pendingTasks.map(task => (
          <div key={task.id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h5 className="font-medium text-gray-100">{getTranslatedTaskTitle(task.title, language)}</h5>
                <div className="text-sm text-gray-300 mt-1 space-y-1">
                  <p>{t('approval.assignedTo')}: <span className="font-medium">{task.assignedToName}</span></p>
                  <p>{t('approval.createdBy')}: <span className="font-medium">{task.createdByName || 'N/A'}</span></p>
                  {task.createdBy === currentUserId && (
                    <p className="text-xs text-blue-400">✨ Bạn là người tạo nhiệm vụ này</p>
                  )}
                  {currentUserRole === 'parent' && task.createdBy !== currentUserId && (
                    <p className="text-xs text-green-400">👨‍👩‍👧‍👦 Bạn có quyền phê duyệt (Parent)</p>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-primary-400">XP: {task.xpReward}</span>
                  <span className="text-yellow-400">Coins: {task.coinReward}</span>
                </div>
                {task.evidence && (
                  <div className="mt-3">
                    <img
                      src={task.evidence}
                      alt="Evidence"
                      className="w-full max-w-xs rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleApprove(task)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  {t('approval.approve')}
                </button>
                <button
                  onClick={() => handleReject(task)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  {t('approval.reject')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

