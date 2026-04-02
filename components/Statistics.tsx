'use client'

import React, { useState, useEffect } from 'react'
import { getAllUsers } from '@/lib/firebase/profile'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { checkDb } from '@/lib/firebase/config'
import { useI18n } from '@/lib/i18n/context'
import { UserProfile } from '@/lib/firebase/profile'
import { Task } from '@/lib/firebase/tasks'

interface StatisticsProps {
  currentUserId: string
  profile: UserProfile
}

export default function Statistics({ currentUserId, profile }: StatisticsProps) {
  const { t, language } = useI18n()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile.familyId) {
      loadStatistics()
    }
  }, [profile.familyId])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      
      if (!profile.familyId) {
        console.error('Profile does not have familyId')
        return
      }
      const allUsers = await getAllUsers(profile.familyId)
      const totalUsers = allUsers.length
      
      const tasksRef = collection(checkDb(), 'tasks')
      const q = query(tasksRef, where('familyId', '==', profile.familyId))
      const tasksSnapshot = await getDocs(q)
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      
      const activeUserIds = new Set<string>()
      tasksData.forEach(task => {
        if (task.assignedTo) {
          activeUserIds.add(task.assignedTo)
        }
      })
      const activeUsers = activeUserIds.size
      
      const totalTasks = tasksData.length
      const completedTasks = tasksData.filter(t => 
        t.status === 'completed' || t.status === 'approved'
      ).length
      
      setStats({
        totalUsers,
        activeUsers,
        totalTasks,
        completedTasks,
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="kid-card p-6 bg-white/50 border-violet-100 shadow-soft animate-pulse">
        <div className="h-6 bg-violet-100 w-32 rounded-xl mb-6" />
        <div className="grid grid-cols-2 gap-4">
           {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border-2 border-violet-50" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="kid-card p-8 bg-white border-violet-100 shadow-kid relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 opacity-30 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-xl font-black text-violet-900 flex items-center gap-3 uppercase tracking-tight">
          <span className="text-2xl">📊</span>
          {language === 'vi' ? 'Thống Kê' : language === 'ja' ? '統計' : language === 'es' ? 'Estadísticas' : 'Statistics'}
        </h3>
        <button
          onClick={loadStatistics}
          className="btn-playful w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shadow-soft hover:bg-violet-100 transition-all border-b-4 border-violet-200"
          title={language === 'vi' ? 'Làm mới' : 'Refresh'}
        >
          🔄
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[2rem] p-6 text-white shadow-soft border-4 border-blue-300/30 group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 opacity-80">
             <span className="text-xl">👥</span>
             <p className="text-[10px] font-black uppercase tracking-widest">
               {language === 'vi' ? 'Tổng Users' : language === 'ja' ? '総ユーザー' : language === 'es' ? 'Total usuarios' : 'Total Users'}
             </p>
          </div>
          <p className="text-4xl font-black">{stats.totalUsers}</p>
        </div>
        
        {/* Active Users */}
        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[2rem] p-6 text-white shadow-soft border-4 border-emerald-300/30 group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 opacity-80">
             <span className="text-xl">✅</span>
             <p className="text-[10px] font-black uppercase tracking-widest">
               {language === 'vi' ? 'Users Hoạt Động' : language === 'ja' ? 'アクティブユーザー' : language === 'es' ? 'Usuarios activos' : 'Active Users'}
             </p>
          </div>
          <div className="flex items-baseline gap-3">
             <p className="text-4xl font-black">{stats.activeUsers}</p>
             {stats.totalUsers > 0 && (
               <span className="text-sm font-black bg-white/20 px-2 py-0.5 rounded-lg">
                 {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
               </span>
             )}
          </div>
        </div>
        
        {/* Total Tasks */}
        <div className="bg-gradient-to-br from-violet-400 to-purple-600 rounded-[2rem] p-6 text-white shadow-soft border-4 border-violet-300/30 group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 opacity-80">
             <span className="text-xl">📋</span>
             <p className="text-[10px] font-black uppercase tracking-widest">
               {language === 'vi' ? 'Tổng Nhiệm Vụ' : language === 'ja' ? '総タスク' : language === 'es' ? 'Total tareas' : 'Total Tasks'}
             </p>
          </div>
          <p className="text-4xl font-black">{stats.totalTasks}</p>
        </div>
        
        {/* Completed Tasks */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-[2rem] p-6 text-white shadow-soft border-4 border-amber-300/30 group hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 opacity-80">
             <span className="text-xl">🎉</span>
             <p className="text-[10px] font-black uppercase tracking-widest">
               {language === 'vi' ? 'Đã Hoàn Thành' : language === 'ja' ? '完了済み' : language === 'es' ? 'Completado' : 'Completed'}
             </p>
          </div>
          <div className="flex items-baseline gap-3">
             <p className="text-4xl font-black">{stats.completedTasks}</p>
             {stats.totalTasks > 0 && (
               <span className="text-sm font-black bg-white/20 px-2 py-0.5 rounded-lg">
                 {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
               </span>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
