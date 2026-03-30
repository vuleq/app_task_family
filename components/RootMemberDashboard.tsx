'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllUsers, UserProfile } from '@/lib/firebase/profile'
import { getMemberStats, MemberStats } from '@/lib/firebase/loginHistory'
import { getFamilyById, Family } from '@/lib/firebase/family'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

// recharts is currently disabled due to installation issues in this environment
// import {
//   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
// } from 'recharts'

const MEMBER_COLORS = ['#60a5fa', '#34d399', '#f97316', '#a78bfa', '#fbbf24', '#2dd4bf', '#f472b6', '#94a3b8']

interface RootMemberDashboardProps {
  currentUserId: string
  familyId: string
  profile: UserProfile
}

interface MemberWithStats {
  member: UserProfile
  stats: MemberStats
}

export default function RootMemberDashboard({ currentUserId, familyId }: RootMemberDashboardProps) {
  const { language } = useI18n()
  const [memberStats, setMemberStats] = useState<MemberWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [family, setFamily] = useState<Family | null>(null)
  const [copiedCode, setCopiedCode] = useState<'family' | 'root' | null>(null)

  const copyToClipboard = (text: string, type: 'family' | 'root') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(type)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const [allUsers, familyData] = await Promise.all([
        getAllUsers(familyId),
        getFamilyById(familyId),
      ])
      setFamily(familyData)
      const results = await Promise.all(
        allUsers.map(async (member: UserProfile) => {
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

  const totalLoginDays = memberStats.reduce((s, { stats }) => s + stats.loginDays, 0)
  const totalTasksDone = memberStats.reduce((s, { stats }) => s + stats.tasksApproved, 0)
  const totalXP = memberStats.reduce((s, { member }) => s + (member.xp || 0), 0)

  const shortName = (name: string) => name.split(' ').pop() ?? name

  const summaryCards = [
    {
      label: language === 'vi' ? 'Tổng ngày đăng nhập' : 'Total Login Days',
      value: totalLoginDays,
      color: '#60a5fa',
    },
    {
      label: language === 'vi' ? 'Task hoàn thành' : 'Tasks Completed',
      value: totalTasksDone,
      color: '#34d399',
    },
    {
      label: language === 'vi' ? 'Tổng XP' : 'Total XP',
      value: totalXP,
      color: '#a78bfa',
    },
  ]

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

      {/* Family Codes */}
      {family && (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            🏠 {family.name} — {language === 'vi' ? 'Mã mời thành viên' : 'Invite Codes'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Family Code */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-blue-500/30">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">
                👥 {language === 'vi' ? 'Mã gia đình' : 'Family Code'}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xl font-black text-white tracking-widest">{family.code}</span>
                <button
                  onClick={() => copyToClipboard(family.code, 'family')}
                  className="text-[10px] px-2 py-1 rounded bg-blue-600/40 hover:bg-blue-500/60 text-blue-200 font-bold transition-colors"
                >
                  {copiedCode === 'family' ? '✓' : language === 'vi' ? 'Sao chép' : 'Copy'}
                </button>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">{language === 'vi' ? 'Cho thành viên thường' : 'For regular members'}</p>
            </div>
            {/* Root Code */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-amber-500/30">
              <p className="text-[10px] text-amber-300 font-bold uppercase tracking-widest mb-1">
                👑 {language === 'vi' ? 'Mã Root' : 'Root Code'}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xl font-black text-white tracking-widest">{family.rootCode}</span>
                <button
                  onClick={() => copyToClipboard(family.rootCode, 'root')}
                  className="text-[10px] px-2 py-1 rounded bg-amber-600/40 hover:bg-amber-500/60 text-amber-200 font-bold transition-colors"
                >
                  {copiedCode === 'root' ? '✓' : language === 'vi' ? 'Sao chép' : 'Copy'}
                </button>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">{language === 'vi' ? 'Chỉ dùng cho phụ huynh' : 'Parents/admins only'}</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50">
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{card.label}</p>
            <div className="h-1 mt-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{ width: '40%', backgroundColor: card.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50 min-h-[220px] flex flex-col items-center justify-center text-center">
          <p className="text-gray-300 font-medium mb-1">
            {language === 'vi' ? 'Hoạt động thành viên' : 'Member Activity'}
          </p>
          <p className="text-xs text-gray-500 max-w-[200px]">
            {language === 'vi' ? 'Biểu đồ đang được tối ưu hóa. Vui lòng quay lại sau.' : 'Charts are being optimized. Please check back later.'}
          </p>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50 min-h-[220px] flex flex-col items-center justify-center text-center">
          <p className="text-gray-300 font-medium mb-1">
            {language === 'vi' ? 'Phân bổ XP' : 'XP Distribution'}
          </p>
          <p className="text-xs text-gray-500 max-w-[200px]">
            {language === 'vi' ? 'Dữ liệu biểu đồ đang tạm ẩn để tăng tốc độ tải.' : 'XP chart data is hidden to improve loading speed.'}
          </p>
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {memberStats.map(({ member, stats }, idx) => (
          <div
            key={member.id}
            className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50"
          >
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700/50">
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundColor: MEMBER_COLORS[idx % MEMBER_COLORS.length] + '26',
                  border: `2px solid ${MEMBER_COLORS[idx % MEMBER_COLORS.length]}`,
                }}
              >
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
