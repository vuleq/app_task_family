'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllUsers, UserProfile } from '@/lib/firebase/profile'
import { getMemberStats, MemberStats } from '@/lib/firebase/loginHistory'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

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

const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-700 border border-slate-600 rounded p-2 text-xs shadow-lg">
      {label && <p className="text-gray-300 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>{entry.name}: <span className="font-bold">{entry.value}</span></p>
      ))}
    </div>
  )
}

export default function RootMemberDashboard({ currentUserId, familyId }: RootMemberDashboardProps) {
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

  const totalLoginDays = memberStats.reduce((s, { stats }) => s + stats.loginDays, 0)
  const totalTasksDone = memberStats.reduce((s, { stats }) => s + stats.tasksApproved, 0)
  const totalXP = memberStats.reduce((s, { member }) => s + (member.xp || 0), 0)

  const shortName = (name: string) => name.split(' ').pop() ?? name

  const barData = memberStats.map(({ member, stats }) => ({
    name: shortName(member.name),
    [language === 'vi' ? 'Ngày login' : 'Login Days']: stats.loginDays,
    [language === 'vi' ? 'Task xong' : 'Tasks Done']: stats.tasksApproved,
  }))

  const pieData = memberStats
    .filter(({ member }) => (member.xp || 0) > 0)
    .map(({ member }) => ({
      name: shortName(member.name),
      value: member.xp || 0,
    }))

  const summaryCards = [
    {
      label: language === 'vi' ? 'Tổng ngày đăng nhập' : 'Total Login Days',
      value: totalLoginDays,
      color: '#60a5fa',
      sparkData: memberStats.map(({ member, stats }) => ({ name: shortName(member.name), v: stats.loginDays })),
      gradId: 'gradLogin',
    },
    {
      label: language === 'vi' ? 'Task hoàn thành' : 'Tasks Completed',
      value: totalTasksDone,
      color: '#34d399',
      sparkData: memberStats.map(({ member, stats }) => ({ name: shortName(member.name), v: stats.tasksApproved })),
      gradId: 'gradTasks',
    },
    {
      label: language === 'vi' ? 'Tổng XP' : 'Total XP',
      value: totalXP,
      color: '#a78bfa',
      sparkData: memberStats.map(({ member }) => ({ name: shortName(member.name), v: member.xp || 0 })),
      gradId: 'gradXP',
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

      {/* Summary Cards with Sparklines */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.gradId} className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50">
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mb-2">{card.label}</p>
            <ResponsiveContainer width="100%" height={48}>
              <AreaChart data={card.sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={card.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={card.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={card.color}
                  strokeWidth={2}
                  fill={`url(#${card.gradId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grouped Bar Chart */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            {language === 'vi' ? 'Hoạt động thành viên' : 'Member Activity'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: '#ffffff08' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              <Bar dataKey={language === 'vi' ? 'Ngày login' : 'Login Days'} fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey={language === 'vi' ? 'Task xong' : 'Tasks Done'} fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            {language === 'vi' ? 'Phân bổ XP theo thành viên' : 'XP Distribution'}
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={MEMBER_COLORS[idx % MEMBER_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
              {language === 'vi' ? 'Chưa có dữ liệu XP' : 'No XP data yet'}
            </div>
          )}
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
