'use client'

import { useState, useEffect } from 'react'
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
    activeUsers: 0, // Users đã tham gia ít nhất 1 nhiệm vụ
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
      
      // Lấy tất cả users trong cùng family
      if (!profile.familyId) {
        console.error('Profile does not have familyId')
        return
      }
      const allUsers = await getAllUsers(profile.familyId)
      const totalUsers = allUsers.length
      
      // Đếm users đã tham gia nhiệm vụ (có ít nhất 1 task được assign) - chỉ trong cùng family
      const tasksRef = collection(checkDb(), 'tasks')
      const q = query(tasksRef, where('familyId', '==', profile.familyId))
      const tasksSnapshot = await getDocs(q)
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      
      // Filter tasks chỉ trong cùng family (nếu task có familyId)
      const familyTasks = tasks.filter(task => {
        // Nếu task chưa có familyId, kiểm tra assignedTo có trong family không
        if (!task.familyId) {
          return allUsers.some(u => u.id === task.assignedTo)
        }
        return task.familyId === profile.familyId
      })
      
      // Lấy danh sách unique user IDs đã được assign task (chỉ trong family)
      const activeUserIds = new Set<string>()
      familyTasks.forEach(task => {
        if (task.assignedTo) {
          activeUserIds.add(task.assignedTo)
        }
      })
      const activeUsers = activeUserIds.size
      
      // Đếm tổng số tasks và completed tasks (chỉ trong family)
      const totalTasks = familyTasks.length
      const completedTasks = familyTasks.filter(t => 
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
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          {language === 'vi' ? '📊 Thống Kê' : '📊 Statistics'}
        </h3>
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
          {language === 'vi' ? '📊 Thống Kê' : '📊 Statistics'}
        </h3>
        <button
          onClick={loadStatistics}
          className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
          title={language === 'vi' ? 'Làm mới' : 'Refresh'}
        >
          🔄
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Tổng số users */}
        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-sm text-gray-300 mb-1">
            {language === 'vi' ? '👥 Tổng Users' : '👥 Total Users'}
          </p>
          <p className="text-2xl font-bold text-blue-300">{stats.totalUsers}</p>
        </div>
        
        {/* Users đã tham gia nhiệm vụ */}
        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
          <p className="text-sm text-gray-300 mb-1">
            {language === 'vi' ? '✅ Users Hoạt Động' : '✅ Active Users'}
          </p>
          <p className="text-2xl font-bold text-green-300">{stats.activeUsers}</p>
          {stats.totalUsers > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
            </p>
          )}
        </div>
        
        {/* Tổng số nhiệm vụ */}
        <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
          <p className="text-sm text-gray-300 mb-1">
            {language === 'vi' ? '📋 Tổng Nhiệm Vụ' : '📋 Total Tasks'}
          </p>
          <p className="text-2xl font-bold text-purple-300">{stats.totalTasks}</p>
        </div>
        
        {/* Nhiệm vụ đã hoàn thành */}
        <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-sm text-gray-300 mb-1">
            {language === 'vi' ? '🎉 Đã Hoàn Thành' : '🎉 Completed'}
          </p>
          <p className="text-2xl font-bold text-yellow-300">{stats.completedTasks}</p>
          {stats.totalTasks > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

