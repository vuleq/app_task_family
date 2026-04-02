'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  suspiciousCompletions: number
  averageCompletionTime: number
  tasksWithEvidence: number
  tasksWithoutEvidence: number
}

export default function TaskMonitoring({ currentUserId, profile }: TaskMonitoringProps) {
  const { t, language } = useI18n()
  const [userStats, setUserStats] = useState<UserTaskStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  const loadMonitoringData = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!profile.familyId) {
        console.error('Profile does not have familyId')
        return
      }
      const allUsers = await getAllUsers(profile.familyId)
      const childUsers = allUsers.filter(u => !u.isRoot && u.id !== currentUserId)
      
      const tasksRef = collection(checkDb(), 'tasks')
      const tasksQuery = query(tasksRef, where('familyId', '==', profile.familyId))
      const tasksSnapshot = await getDocs(tasksQuery)
      const allTasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]

      const stats: UserTaskStats[] = []
      
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
        
        const filteredTasks = userTasks.filter(task => {
          if (!task.createdAt) return false
          const taskDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt)
          return taskDate >= startDate
        })

        const dailyTasks = filteredTasks.filter(t => (t.type === 'daily' || t.type === 'recurring') && !t.parentTaskId)
        const weeklyTasks = filteredTasks.filter(t => t.type === 'weekly' && !t.parentTaskId)
        const monthlyTasks = filteredTasks.filter(t => t.type === 'monthly' && !t.parentTaskId)

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
          const timeDiff = (completedAt.getTime() - startedAt.getTime()) / 1000 / 60

          if (timeDiff < 1) {
            suspiciousCount++
          } else {
            totalCompletionTime += timeDiff
            validCompletions++
          }
        })

        const avgCompletionTime = validCompletions > 0 ? totalCompletionTime / validCompletions : 0
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
  }, [currentUserId, selectedPeriod, profile.familyId])

  useEffect(() => {
    loadMonitoringData()
  }, [loadMonitoringData])

  if (loading) {
    return (
      <div className="kid-card p-8 bg-white/50 border-violet-100 shadow-soft animate-pulse">
        <div className="flex justify-between items-center mb-8">
           <div className="h-8 bg-violet-100 w-48 rounded-xl" />
           <div className="h-10 bg-violet-100 w-32 rounded-xl" />
        </div>
        <div className="space-y-6">
           {[1,2].map(i => (
             <div key={i} className="h-32 bg-white rounded-[2rem] border-2 border-violet-50" />
           ))}
        </div>
      </div>
    )
  }

  return (
    <div className="kid-card p-8 bg-white border-violet-100 shadow-kid relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-violet-50 rounded-full -mr-24 -mt-24 opacity-30 animate-pulse-slow pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
        <h3 className="text-2xl font-black text-violet-900 flex items-center gap-3 uppercase tracking-tight">
          <span className="text-3xl">📊</span>
          {language === 'vi' ? 'Theo Dõi Hoạt Động' : 'Activity Monitoring'}
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
            className="flex-1 sm:flex-none appearance-none px-6 py-3 border-4 border-violet-50 rounded-2xl text-xs font-black bg-white text-violet-700 shadow-soft focus:outline-none focus:ring-4 focus:ring-violet-50 uppercase tracking-widest cursor-pointer"
          >
            <option value="today">{language === 'vi' ? 'Hôm nay' : 'Today'}</option>
            <option value="week">{language === 'vi' ? '7 ngày qua' : 'Last 7 days'}</option>
            <option value="month">{language === 'vi' ? '30 ngày qua' : 'Last 30 days'}</option>
          </select>
          <button
            onClick={loadMonitoringData}
            className="btn-playful w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center shadow-soft hover:bg-violet-200 transition-all border-b-4 border-violet-300 active:scale-95"
            title={language === 'vi' ? 'Làm mới' : 'Refresh'}
          >
            🔄
          </button>
        </div>
      </div>

      {userStats.length === 0 ? (
        <div className="text-center py-16 bg-violet-50/30 rounded-[2.5rem] border-4 border-dashed border-violet-100">
          <div className="text-6xl mb-6 grayscale opacity-30">📭</div>
          <p className="text-violet-400 font-black text-lg uppercase tracking-widest italic">
            {language === 'vi' ? 'Không có dữ liệu theo dõi' : 'No monitoring data available'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          {userStats.map(stat => (
            <div key={stat.userId} className="p-6 bg-white rounded-[2.5rem] border-4 border-violet-50 shadow-soft hover:shadow-kid hover:border-violet-200 transition-all group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">👤</div>
                   <div>
                      <h4 className="text-xl font-black text-violet-900 uppercase tracking-tight">{stat.userName}</h4>
                      <p className="text-[10px] font-black text-violet-300 uppercase tracking-widest">{language === 'vi' ? 'Thành viên' : language === 'ja' ? 'メンバー' : language === 'es' ? 'Miembro' : 'Member'}</p>
                   </div>
                </div>
                
                {stat.suspiciousCompletions > 0 && (
                  <div className="px-4 py-2 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-2 animate-pulse shadow-soft">
                    <span className="text-lg">⚠️</span>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                       {stat.suspiciousCompletions} {language === 'vi' ? 'Lần làm bài cực nhanh' : 'Fast Completions'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Daily */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-[1.8rem] p-5 text-white shadow-soft border-4 border-blue-300/30 group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between mb-3 text-white/80">
                    <span className="text-xs font-black uppercase tracking-widest truncate">📅 {language === 'vi' ? 'Ngày' : language === 'ja' ? 'デイリー' : language === 'es' ? 'Diario' : 'Daily'}</span>
                    <span className="text-lg font-black flex-shrink-0 ml-1">
                      {stat.daily.total > 0 ? `${Math.round((stat.daily.completed / stat.daily.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{stat.daily.completed}</span>
                    <span className="text-sm font-bold opacity-60">/ {stat.daily.total}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-4 overflow-hidden">
                     <div 
                        className="bg-white h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${stat.daily.total > 0 ? (stat.daily.completed / stat.daily.total) * 100 : 0}%` }}
                     />
                  </div>
                </div>

                {/* Weekly */}
                <div className="bg-gradient-to-br from-violet-400 to-violet-600 rounded-[1.8rem] p-5 text-white shadow-soft border-4 border-violet-300/30 group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between mb-3 text-white/80">
                    <span className="text-xs font-black uppercase tracking-widest truncate">📆 {language === 'vi' ? 'Tuần' : language === 'ja' ? 'ウィークリー' : language === 'es' ? 'Semanal' : 'Weekly'}</span>
                    <span className="text-lg font-black flex-shrink-0 ml-1">
                      {stat.weekly.total > 0 ? `${Math.round((stat.weekly.completed / stat.weekly.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{stat.weekly.completed}</span>
                    <span className="text-sm font-bold opacity-60">/ {stat.weekly.total}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-4 overflow-hidden">
                     <div 
                        className="bg-white h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${stat.weekly.total > 0 ? (stat.weekly.completed / stat.weekly.total) * 100 : 0}%` }}
                     />
                  </div>
                </div>

                {/* Monthly */}
                <div className="bg-gradient-to-br from-orange-400 to-amber-600 rounded-[1.8rem] p-5 text-white shadow-soft border-4 border-amber-300/30 group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between mb-3 text-white/80">
                    <span className="text-xs font-black uppercase tracking-widest truncate">🗓️ {language === 'vi' ? 'Tháng' : language === 'ja' ? 'マンスリー' : language === 'es' ? 'Mensual' : 'Monthly'}</span>
                    <span className="text-lg font-black flex-shrink-0 ml-1">
                      {stat.monthly.total > 0 ? `${Math.round((stat.monthly.completed / stat.monthly.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{stat.monthly.completed}</span>
                    <span className="text-sm font-bold opacity-60">/ {stat.monthly.total}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-4 overflow-hidden">
                     <div 
                        className="bg-white h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${stat.monthly.total > 0 ? (stat.monthly.completed / stat.monthly.total) * 100 : 0}%` }}
                     />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-violet-50/50 rounded-[1.5rem] p-4 border-2 border-violet-50 flex items-center gap-4 group-hover:bg-white transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center text-xl">⏱️</div>
                  <div>
                    <p className="text-[10px] font-black text-violet-300 uppercase tracking-widest mb-1">
                      {language === 'vi' ? 'Thời gian TB' : 'Avg Time'}
                    </p>
                    <p className="text-sm font-black text-violet-900 uppercase tracking-tight">
                      {stat.averageCompletionTime > 0 
                        ? `${Math.round(stat.averageCompletionTime)} ${language === 'vi' ? 'PHÚT' : 'MIN'}`
                        : language === 'vi' ? 'CHƯA CÓ' : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-indigo-50/50 rounded-[1.5rem] p-4 border-2 border-indigo-50 flex items-center gap-4 group-hover:bg-white transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center text-xl">📷</div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">
                      {language === 'vi' ? 'Số ảnh minh chứng' : 'Photos Uploaded'}
                    </p>
                    <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">
                      {stat.tasksWithEvidence} <span className="text-indigo-200">/</span> {stat.tasksWithEvidence + stat.tasksWithoutEvidence}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
