'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllUsers, UserProfile } from '@/lib/firebase/profile'
import { getMemberStats, MemberStats } from '@/lib/firebase/loginHistory'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

interface RootMemberDashboardProps {
  currentUserId: string
  familyId: string
  profile: UserProfile
}

interface MemberWithStats {
  member: UserProfile
  stats: MemberStats
}

export default function RootMemberDashboard({ currentUserId, familyId, profile }: RootMemberDashboardProps) {
  const { language } = useI18n()
  const [memberStats, setMemberStats] = useState<MemberWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const allUsers = await getAllUsers(familyId)
      const results = await Promise.all(
        allUsers.map(async (member) => {
          const stats = await getMemberStats(member.id, familyId)
          return { member, stats }
        })
      )
      results.sort((a, b) => {
        if (a.member.id === currentUserId) return -1
        if (b.member.id === currentUserId) return 1
        return a.member.name.localeCompare(b.member.name)
      })
      setMemberStats(results)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setToast({
        show: true,
        message: language === 'vi' ? 'Lỗi khi tải dashboard' : 'Error loading dashboard',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [familyId, currentUserId, language])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const getRoleLabel = (member: UserProfile) => {
    if (member.isRoot) return language === 'vi' ? 'Quản lý' : 'Root'
    if (member.role === 'parent') return language === 'vi' ? 'Phụ huynh' : 'Parent'
    return language === 'vi' ? 'Trẻ em' : 'Child'
  }

  if (loading) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
        <div className="text-center py-6 text-gray-400">
          {language === 'vi' ? 'Đang tải dashboard...' : 'Loading dashboard...'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100">
            📊 {language === 'vi' ? 'Theo dõi thành viên (30 ngày)' : 'Member Stats (Last 30 Days)'}
          </h2>
          <button
            onClick={loadDashboardData}
            className="text-xs text-gray-400 hover:text-gray-200 px-3 py-1 rounded border border-slate-600 hover:border-slate-400 transition-colors"
          >
            {language === 'vi' ? 'Làm mới' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Member cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {memberStats.map(({ member, stats }) => (
          <div
            key={member.id}
            className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50"
          >
            {/* Member header */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700/50">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-600 flex items-center justify-center">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg text-white font-bold">{member.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-100 truncate">{member.name}</p>
                <p className="text-xs text-gray-400">{getRoleLabel(member)}</p>
              </div>
              {member.id === currentUserId && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded flex-shrink-0">
                  {language === 'vi' ? 'Bạn' : 'You'}
                </span>
              )}
            </div>

            {/* Stats grid 2x3 */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.loginDays}</p>
                <p className="text-xs text-gray-400">{language === 'vi' ? 'Ngày đăng nhập' : 'Login Days'}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <p className="text-2xl font-bold text-orange-400">{stats.loginStreak}</p>
                <p className="text-xs text-gray-400">{language === 'vi' ? 'Chuỗi ngày 🔥' : 'Day Streak 🔥'}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <p className="text-2xl font-bold text-green-400">{stats.tasksApproved}</p>
                <p className="text-xs text-gray-400">{language === 'vi' ? 'Task đã duyệt' : 'Tasks Done'}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.tasksPendingApproval}</p>
                <p className="text-xs text-gray-400">{language === 'vi' ? 'Chờ duyệt' : 'Pending'}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <p className="text-2xl font-bold text-purple-400">{member.xp}</p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2 text-center">
                <p className="text-2xl font-bold text-yellow-300">{member.coins}</p>
                <p className="text-xs text-gray-400">{language === 'vi' ? 'Xu 🪙' : 'Coins 🪙'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
