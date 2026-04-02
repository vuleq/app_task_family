'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { updateProfile, getProfile } from '@/lib/firebase/profile'
import { checkAndUpdateParentTask } from '@/lib/firebase/tasks'
import { checkDailyCompletion, checkWeeklyCompletion, checkMonthlyCompletion } from '@/lib/firebase/completionRewards'
import { useI18n } from '@/lib/i18n/context'
import { getTranslatedTaskTitle } from '@/lib/i18n/templateTranslations'
import Toast from './Toast'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

interface Task {
  id: string
  title: string
  assignedToName: string
  assignedTo: string
  createdBy: string
  createdByName?: string
  status: string
  type: 'daily' | 'weekly' | 'monthly' | 'recurring'
  xpReward: number
  coinReward: number
  evidence?: string
  parentTaskId?: string
  groupKey?: string
  completedDate?: string
}

interface TaskApprovalProps {
  currentUserId: string
  currentUserRole: 'parent' | 'child'
  isRoot?: boolean
  familyId: string
  onApprovalComplete?: () => void
}

export default function TaskApproval({ currentUserId, currentUserRole, isRoot, familyId, onApprovalComplete }: TaskApprovalProps) {
  const { t, language } = useI18n()
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const loadPendingTasks = useCallback(async () => {
    try {
      if (!db) return
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef, 
        where('status', 'in', ['completed', 'expired']),
        where('familyId', '==', familyId)
      )
      const snapshot = await getDocs(q)
      let tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]

      // Only show expired tasks that member actually started (not just pending ones that expired)
      tasksData = tasksData.filter(task => {
        if (task.status === 'expired' && !task.startedAt) return false
        return true
      })

      tasksData = tasksData.filter(task => {
        const isCreator = task.createdBy === currentUserId
        const isParent = currentUserRole === 'parent' || isRoot === true
        return isCreator || isParent
      })

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
  }, [currentUserId, currentUserRole, familyId])

  useEffect(() => {
    loadPendingTasks()
  }, [loadPendingTasks])

  const handleApprove = async (task: Task) => {
    try {
      const { canCompleteTask } = await import('@/lib/firebase/taskLimits')
      // recurring tasks dùng limit của daily
      const limitType = (task.type === 'recurring' ? 'daily' : task.type) as 'daily' | 'weekly' | 'monthly'
      const limitCheck = await canCompleteTask(task.assignedTo, limitType, task.coinReward, familyId)
      
      if (!limitCheck.allowed) {
        setToast({ 
          show: true, 
          message: limitCheck.reason || 'Đã đạt giới hạn nhiệm vụ/coin', 
          type: 'error' 
        })
        return
      }

      let completedDate = task.completedDate
      if (!completedDate) {
        const now = new Date()
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
        completedDate = `${vietnamTime.getUTCFullYear()}-${String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vietnamTime.getUTCDate()).padStart(2, '0')}`
      }

      if (!db) {
        setToast({ show: true, message: t('errors.firestoreNotInitialized'), type: 'error' })
        return
      }
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        completedDate: completedDate
      })

      const userProfile = await getProfile(task.assignedTo)
      if (userProfile) {
        await updateProfile(task.assignedTo, {
          xp: userProfile.xp + task.xpReward,
          coins: userProfile.coins + task.coinReward
        })
      }

      let message = `Đã phê duyệt! ${task.assignedToName} nhận được ${task.xpReward} XP và ${task.coinReward} Coins.`
      if (task.parentTaskId && task.groupKey) {
        const isParentCompleted = await checkAndUpdateParentTask(task.parentTaskId, task.groupKey)
        if (isParentCompleted) {
          message = `🎉 Chúc mừng! ${task.assignedToName} đã hoàn thành nhiệm vụ tuần/tháng!\n\n${message}`
        }
      }

      if (task.type === 'daily') {
        const dailyResult = await checkDailyCompletion(task.assignedTo, familyId, completedDate)
        if (dailyResult.rewarded && dailyResult.message) {
          message = `${dailyResult.message}\n\n${message}`
        }

        const weeklyResult = await checkWeeklyCompletion(task.assignedTo, familyId)
        if (weeklyResult.rewarded && weeklyResult.message) {
          message = `${weeklyResult.message}\n\n${message}`
        }

        const monthlyResult = await checkMonthlyCompletion(task.assignedTo, familyId)
        if (monthlyResult.rewarded && monthlyResult.message) {
          message = `${monthlyResult.message}\n\n${message}`
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
      if (!db) {
        setToast({ show: true, message: t('errors.firestoreNotInitialized'), type: 'error' })
        return
      }
      await updateDoc(doc(db, 'tasks', task.id), {
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
    return (
      <div className="text-center py-20 bg-white/50 rounded-[2rem] border-4 border-dashed border-violet-100">
        <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-violet-600 font-black uppercase tracking-widest text-sm animate-pulse">{t('common.loading')}...</p>
      </div>
    )
  }

  if (pendingTasks.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border-4 border-dashed border-violet-100 group">
        <div className="text-7xl mb-6 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110">😴</div>
        <p className="text-violet-400 font-black text-xl uppercase tracking-widest italic">
          {t('approval.noPendingTasks')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="flex items-center gap-3 mb-6">
         <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-soft">✅</div>
         <h3 className="text-2xl font-black text-violet-900 uppercase tracking-tight">{t('approval.title')}</h3>
         <span className="bg-violet-100 px-3 py-1 rounded-full text-xs font-black text-violet-600 border border-violet-200 uppercase tracking-widest shadow-soft">
            {pendingTasks.length}
         </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingTasks.map(task => (
          <div key={task.id} className="kid-card p-8 bg-white border-violet-100 shadow-kid hover:border-violet-300 transition-all group relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <h5 className="text-2xl font-black text-violet-900 leading-tight uppercase tracking-tight">{getTranslatedTaskTitle(task.title, language)}</h5>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-soft ${
                      task.type === 'daily' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                      task.type === 'weekly' ? 'bg-violet-50 text-violet-500 border-violet-100' :
                      'bg-orange-50 text-orange-500 border-orange-100'
                  }`}>
                    {task.type === 'daily' ? t('tasks.taskTypeDaily') :
                        task.type === 'weekly' ? t('tasks.taskTypeWeekly') :
                            t('tasks.taskTypeMonthly')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-violet-50/50 p-4 rounded-2xl border-2 border-violet-50 shadow-inner flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-lg">👤</div>
                      <div>
                         <p className="text-[9px] font-black text-violet-300 uppercase tracking-[0.2em] mb-1">{t('approval.assignedTo')}</p>
                         <p className="text-sm font-black text-violet-900 uppercase tracking-tight">{task.assignedToName}</p>
                      </div>
                   </div>
                   <div className="bg-indigo-50/50 p-4 rounded-2xl border-2 border-indigo-50 shadow-inner flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-lg">✏️</div>
                      <div>
                         <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">{t('approval.createdBy')}</p>
                         <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">{task.createdByName || 'N/A'}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                   <div className="flex items-center gap-2">
                       <span className="text-2xl">⚡</span>
                       <div>
                          <p className="text-[8px] font-black text-violet-300 uppercase tracking-widest">XP Reward</p>
                          <p className="text-xl font-black text-violet-600 leading-none">{task.xpReward}</p>
                       </div>
                   </div>
                   <div className="flex items-center gap-2">
                       <span className="text-2xl">🪙</span>
                       <div>
                          <p className="text-[8px] font-black text-amber-300 uppercase tracking-widest">Coin Reward</p>
                          <p className="text-xl font-black text-amber-600 leading-none">{task.coinReward}</p>
                       </div>
                   </div>
                   {task.createdBy === currentUserId && (
                      <div className="ml-auto bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-2 shadow-soft animate-pulse">
                         <span className="text-xs">✨</span>
                         <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">You created this</span>
                      </div>
                   )}
                </div>

                {task.evidence && (
                  <div className="mt-6 p-4 bg-violet-50/30 rounded-3xl border-4 border-white shadow-inner">
                    <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.2em] mb-3 ml-2">Evidence Photo</p>
                    <img
                      src={task.evidence}
                      alt="Evidence"
                      className="w-full max-w-sm rounded-[1.5rem] border-4 border-white shadow-soft hover:scale-[1.02] transition-transform cursor-pointer"
                      onClick={() => window.open(task.evidence, '_blank')}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto shrink-0 pt-4 lg:pt-0">
                <button
                  onClick={() => handleApprove(task)}
                  className="flex-1 btn-playful bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-kid hover:bg-emerald-600 uppercase tracking-widest border-b-4 border-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">✅</span> {t('approval.approve')}
                </button>
                <button
                  onClick={() => handleReject(task)}
                  className="flex-1 btn-playful bg-white text-red-500 px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-soft hover:bg-red-50 uppercase tracking-widest border-2 border-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">❌</span> {t('approval.reject')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
