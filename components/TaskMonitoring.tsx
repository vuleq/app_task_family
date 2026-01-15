'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { checkDb } from '@/lib/firebase/config'
import { getAllUsers } from '@/lib/firebase/profile'
import { Task } from '@/lib/firebase/tasks'
import { useI18n } from '@/lib/i18n/context'
import { UserProfile } from '@/lib/firebase/profile'

interface TaskMonitoringProps {
  currentUserId: string
  profile: UserProfile
}

interface UserTaskStats {
  userId: string
  userName: string
  daily: {
    total: number
    completed: number
    inProgress: number
    pending: number
  }
  weekly: {
    total: number
    completed: number
    inProgress: number
    pending: number
  }
  monthly: {
    total: number
    completed: number
    inProgress: number
    pending: number
  }
  // Monitoring metrics
  suspiciousCompletions: number // Hoàn thành quá nhanh (< 1 phút)
  averageCompletionTime: number // Thời gian trung bình hoàn thành (phút)
  tasksWithEvidence: number // Số nhiệm vụ có ảnh evidence
  tasksWithoutEvidence: number // Số nhiệm vụ không có ảnh evidence
}

export default function TaskMonitoring({ currentUserId, profile }: TaskMonitoringProps) {
  const { t, language } = useI18n()
  const [userStats, setUserStats] = useState<UserTaskStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  const loadMonitoringData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Lấy tất cả users trong cùng family (trừ root)
      if (!profile.familyId) {
        console.error('Profile does not have familyId')
        return
      }
      const allUsers = await getAllUsers(profile.familyId)
      const childUsers = allUsers.filter(u => !u.isRoot && u.id !== currentUserId)
      
      // Lấy tất cả tasks trong cùng family
      const tasksRef = collection(checkDb(), 'tasks')
      const tasksQuery = query(tasksRef, where('familyId', '==', profile.familyId))
      const tasksSnapshot = await getDocs(tasksQuery)
      const allTasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]

      // Tính toán thống kê cho từng user
      const stats: UserTaskStats[] = []
      
      // Tính thời gian filter
      const now = new Date()
      let startDate: Date
      if (selectedPeriod === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (selectedPeriod === 'week') {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
      } else {
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
      }

      childUsers.forEach(user => {
        const userTasks = allTasks.filter(t => t.assignedTo === user.id)
        
        // Filter theo thời gian
        const filteredTasks = userTasks.filter(task => {
          if (!task.createdAt) return false
          const taskDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt)
          return taskDate >= startDate
        })

        // Tính thống kê theo type
        const dailyTasks = filteredTasks.filter(t => t.type === 'daily' && !t.parentTaskId)
        const weeklyTasks = filteredTasks.filter(t => t.type === 'weekly' && !t.parentTaskId)
        const monthlyTasks = filteredTasks.filter(t => t.type === 'monthly' && !t.parentTaskId)

        // Tính suspicious completions (hoàn thành quá nhanh < 1 phút)
        const completedTasks = filteredTasks.filter(t => 
          (t.status === 'completed' || t.status === 'approved') && 
          t.startedAt && 
          t.completedAt
        )
        
        let suspiciousCount = 0
        let totalCompletionTime = 0
        let validCompletions = 0

        completedTasks.forEach(task => {
          const startedAt = task.startedAt?.toDate ? task.startedAt.toDate() : new Date(task.startedAt)
          const completedAt = task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt)
          const timeDiff = (completedAt.getTime() - startedAt.getTime()) / 1000 / 60 // phút

          if (timeDiff < 1) {
            suspiciousCount++
          } else {
            totalCompletionTime += timeDiff
            validCompletions++
          }
        })

        const avgCompletionTime = validCompletions > 0 ? totalCompletionTime / validCompletions : 0

        // Đếm tasks có/không có evidence
        const tasksWithEvidence = completedTasks.filter(t => t.evidence).length
        const tasksWithoutEvidence = completedTasks.length - tasksWithEvidence

        stats.push({
          userId: user.id,
          userName: user.name,
          daily: {
            total: dailyTasks.length,
            completed: dailyTasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
            inProgress: dailyTasks.filter(t => t.status === 'in_progress').length,
            pending: dailyTasks.filter(t => t.status === 'pending').length,
          },
          weekly: {
            total: weeklyTasks.length,
            completed: weeklyTasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
            inProgress: weeklyTasks.filter(t => t.status === 'in_progress').length,
            pending: weeklyTasks.filter(t => t.status === 'pending').length,
          },
          monthly: {
            total: monthlyTasks.length,
            completed: monthlyTasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
            inProgress: monthlyTasks.filter(t => t.status === 'in_progress').length,
            pending: monthlyTasks.filter(t => t.status === 'pending').length,
          },
          suspiciousCompletions: suspiciousCount,
          averageCompletionTime: avgCompletionTime,
          tasksWithEvidence: tasksWithEvidence,
          tasksWithoutEvidence: tasksWithoutEvidence,
        })
      })

      // Sắp xếp theo tổng số nhiệm vụ đã hoàn thành (giảm dần)
      stats.sort((a, b) => {
        const totalA = a.daily.completed + a.weekly.completed + a.monthly.completed
        const totalB = b.daily.completed + b.weekly.completed + b.monthly.completed
        return totalB - totalA
      })

      setUserStats(stats)
    } catch (error) {
      console.error('Error loading monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, selectedPeriod])

  useEffect(() => {
    loadMonitoringData()
  }, [loadMonitoringData])

  if (loading) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
        <div className="text-center py-4 text-gray-400">
          {language === 'vi' ? 'Đang tải...' : 'Loading...'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-100">
          {language === 'vi' ? '📊 Theo Dõi Hoạt Động' : '📊 Activity Monitoring'}
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
            className="px-3 py-1 border border-slate-600 rounded-lg text-sm bg-slate-700/50 text-gray-100"
          >
            <option value="today">{language === 'vi' ? 'Hôm nay' : 'Today'}</option>
            <option value="week">{language === 'vi' ? '7 ngày qua' : 'Last 7 days'}</option>
            <option value="month">{language === 'vi' ? '30 ngày qua' : 'Last 30 days'}</option>
          </select>
          <button
            onClick={loadMonitoringData}
            className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
            title={language === 'vi' ? 'Làm mới' : 'Refresh'}
          >
            🔄
          </button>
        </div>
      </div>

      {userStats.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          {language === 'vi' ? 'Không có dữ liệu' : 'No data available'}
        </div>
      ) : (
        <div className="space-y-4">
          {userStats.map(stat => (
            <div key={stat.userId} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-100">{stat.userName}</h4>
                {/* Cảnh báo nếu có suspicious completions */}
                {stat.suspiciousCompletions > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                    ⚠️ {stat.suspiciousCompletions} {language === 'vi' ? 'hoàn thành quá nhanh' : 'suspicious completions'}
                  </span>
                )}
              </div>

              {/* Thống kê theo type */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {/* Daily */}
                <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-xs text-gray-300 mb-1">📅 {language === 'vi' ? 'Ngày' : 'Daily'}</p>
                  <p className="text-lg font-bold text-blue-300">
                    {stat.daily.completed}/{stat.daily.total}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.daily.total > 0 
                      ? `${Math.round((stat.daily.completed / stat.daily.total) * 100)}%`
                      : '0%'}
                  </p>
                </div>

                {/* Weekly */}
                <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                  <p className="text-xs text-gray-300 mb-1">📆 {language === 'vi' ? 'Tuần' : 'Weekly'}</p>
                  <p className="text-lg font-bold text-purple-300">
                    {stat.weekly.completed}/{stat.weekly.total}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.weekly.total > 0 
                      ? `${Math.round((stat.weekly.completed / stat.weekly.total) * 100)}%`
                      : '0%'}
                  </p>
                </div>

                {/* Monthly */}
                <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-500/30">
                  <p className="text-xs text-gray-300 mb-1">🗓️ {language === 'vi' ? 'Tháng' : 'Monthly'}</p>
                  <p className="text-lg font-bold text-orange-300">
                    {stat.monthly.completed}/{stat.monthly.total}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.monthly.total > 0 
                      ? `${Math.round((stat.monthly.completed / stat.monthly.total) * 100)}%`
                      : '0%'}
                  </p>
                </div>
              </div>

              {/* Monitoring metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-600/50 rounded p-2">
                  <p className="text-gray-400">
                    {language === 'vi' ? '⏱️ Thời gian TB:' : '⏱️ Avg Time:'}
                  </p>
                  <p className="text-gray-200 font-semibold">
                    {stat.averageCompletionTime > 0 
                      ? `${Math.round(stat.averageCompletionTime)} ${language === 'vi' ? 'phút' : 'min'}`
                      : language === 'vi' ? 'Chưa có' : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-600/50 rounded p-2">
                  <p className="text-gray-400">
                    {language === 'vi' ? '📷 Có ảnh:' : '📷 With Photo:'}
                  </p>
                  <p className="text-gray-200 font-semibold">
                    {stat.tasksWithEvidence}/{stat.tasksWithEvidence + stat.tasksWithoutEvidence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

