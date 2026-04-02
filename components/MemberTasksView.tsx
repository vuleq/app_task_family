'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { checkDb } from '@/lib/firebase/config'
import { getAllUsers, UserProfile } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import { Task } from '@/hooks/useTasks'

interface MemberTasksViewProps {
  currentUserId: string
  familyId: string
}

const STATUS_CONFIG = {
  pending:    { label: { vi: 'Chờ làm', en: 'Pending', ja: '未着手', es: 'Pendiente' },     color: 'bg-slate-100 text-slate-600 border-slate-200' },
  in_progress:{ label: { vi: 'Đang làm', en: 'In Progress', ja: '進行中', es: 'En progreso' }, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed:  { label: { vi: 'Chờ duyệt', en: 'Waiting', ja: '承認待ち', es: 'Esperando' },   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved:   { label: { vi: 'Đã duyệt', en: 'Approved', ja: '承認済み', es: 'Aprobado' },   color: 'bg-green-100 text-green-700 border-green-200' },
  expired:    { label: { vi: 'Hết hạn', en: 'Expired', ja: '期限切れ', es: 'Vencido' },      color: 'bg-red-100 text-red-600 border-red-200' },
}

const TYPE_CONFIG = {
  daily:     { label: { vi: 'Ngày', en: 'Daily', ja: 'デイリー', es: 'Diario' },       color: 'bg-violet-100 text-violet-700' },
  weekly:    { label: { vi: 'Tuần', en: 'Weekly', ja: 'ウィークリー', es: 'Semanal' }, color: 'bg-indigo-100 text-indigo-700' },
  monthly:   { label: { vi: 'Tháng', en: 'Monthly', ja: 'マンスリー', es: 'Mensual' }, color: 'bg-pink-100 text-pink-700' },
  recurring: { label: { vi: 'Lặp lại', en: 'Recurring', ja: '繰り返し', es: 'Recurrente' }, color: 'bg-teal-100 text-teal-700' },
}

export default function MemberTasksView({ currentUserId: _currentUserId, familyId }: MemberTasksViewProps) {
  const { language } = useI18n()
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<string | null>(null) // memberId

  const [filterMember, setFilterMember] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  // Default to today so the list isn't overwhelming
  const [filterDate, setFilterDate] = useState<string>(() => {
    const now = new Date()
    const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    return `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}-${String(vn.getUTCDate()).padStart(2, '0')}`
  })
  const [groupByMember, setGroupByMember] = useState(true)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    if (!familyId) return
    setLoading(true)
    setSelectedIds(new Set())
    try {
      const [allUsers, snap] = await Promise.all([
        getAllUsers(familyId),
        getDocs(query(collection(checkDb(), 'tasks'), where('familyId', '==', familyId))),
      ])
      const nonRoot = allUsers.filter(u => !u.isRoot && !u.isSuperRoot)
      setMembers(nonRoot)
      const allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
      const nonRootIds = new Set(nonRoot.map(u => u.id))
      setTasks(allTasks.filter(t => nonRootIds.has(t.assignedTo)))
    } catch (e) {
      console.error('Error loading member tasks:', e)
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => { loadData() }, [loadData])

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterMember !== 'all' && t.assignedTo !== filterMember) return false
      if (filterStatus !== 'all' && t.status !== filterStatus) return false
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterDate) {
        const dateField = t.taskDate || t.completedDate || (t.createdAt?.toDate?.()?.toISOString().split('T')[0])
        if (!dateField || !dateField.startsWith(filterDate)) return false
      }
      return true
    }).sort((a, b) => {
      const dateA = a.taskDate || a.completedDate || ''
      const dateB = b.taskDate || b.completedDate || ''
      return dateB.localeCompare(dateA)
    })
  }, [tasks, filterMember, filterStatus, filterType, filterDate])

  const grouped = useMemo(() => {
    const map: Record<string, { member: UserProfile; tasks: Task[] }> = {}
    filtered.forEach(t => {
      if (!map[t.assignedTo]) {
        const member = members.find(m => m.id === t.assignedTo)
        if (!member) return
        map[t.assignedTo] = { member, tasks: [] }
      }
      map[t.assignedTo].tasks.push(t)
    })
    return Object.values(map).sort((a, b) => a.member.name.localeCompare(b.member.name))
  }, [filtered, members])

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: filtered.length, pending: 0, in_progress: 0, completed: 0, approved: 0 }
    filtered.forEach(t => { if (c[t.status] !== undefined) c[t.status]++ })
    return c
  }, [filtered])

  // Selection helpers
  const filteredIds = useMemo(() => filtered.map(t => t.id), [filtered])
  const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.has(id))
  const someSelected = selectedIds.size > 0

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredIds))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    setDeleting(true)
    setConfirmDelete(false)
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => deleteDoc(doc(checkDb(), 'tasks', id)))
      )
      await loadData()
    } catch (e) {
      console.error('Error deleting tasks:', e)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAllForMember = async (memberId: string) => {
    const ids = tasks.filter(t => t.assignedTo === memberId).map(t => t.id)
    if (ids.length === 0) return
    setDeleting(true)
    setConfirmDeleteMember(null)
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(checkDb(), 'tasks', id))))
      await loadData()
    } catch (e) {
      console.error('Error deleting tasks:', e)
    } finally {
      setDeleting(false)
    }
  }

  const TaskRow = ({ task }: { task: Task }) => {
    const statusCfg = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
    const typeCfg = TYPE_CONFIG[task.type as keyof typeof TYPE_CONFIG]
    const member = members.find(m => m.id === task.assignedTo)
    const date = task.taskDate || task.completedDate || ''
    const isSelected = selectedIds.has(task.id)

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'border-red-300 bg-red-50'
            : 'border-slate-100 hover:border-violet-200 hover:bg-violet-50/30'
        }`}
        onClick={() => toggleSelect(task.id)}
      >
        {/* Checkbox */}
        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isSelected ? 'bg-red-500 border-red-500' : 'border-slate-300'
        }`}>
          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
        </div>

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          task.status === 'approved' ? 'bg-green-500' :
          task.status === 'completed' ? 'bg-yellow-400' :
          task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
        }`} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {!groupByMember && member && (
              <span className="text-xs text-slate-500 font-medium">{member.name}</span>
            )}
            {date && <span className="text-xs text-slate-400">{date}</span>}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {typeCfg && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeCfg.color}`}>
              {typeCfg.label[language as keyof typeof typeCfg.label] ?? typeCfg.label['en']}
            </span>
          )}
          {statusCfg && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
              {statusCfg.label[language as keyof typeof statusCfg.label] ?? statusCfg.label['en']}
            </span>
          )}
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-2 flex-shrink-0 text-xs">
          <span className="text-yellow-600 font-bold">{task.coinReward}🪙</span>
          <span className="text-purple-600 font-bold">{task.xpReward}XP</span>
        </div>

        {/* Evidence thumbnail */}
        {task.evidence && (
          <a
            href={task.evidence}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 hover:border-violet-300 transition-colors"
          >
            <img src={task.evidence} alt="" className="w-full h-full object-cover" />
          </a>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="text-center py-8 text-slate-400 animate-pulse">
          {language === 'vi' ? 'Đang tải...' : 'Loading...'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-black text-violet-900 flex items-center gap-2 uppercase tracking-tight">
            <span className="text-2xl">👥</span>
            {language === 'vi' ? 'Nhiệm vụ của thành viên' : 'Member Tasks'}
            <span className="text-sm font-bold text-violet-400">({filtered.length})</span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setGroupByMember(g => !g)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                groupByMember
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-violet-600 border-violet-200 hover:border-violet-400'
              }`}
            >
              {groupByMember
                ? (language === 'vi' ? '👤 Theo thành viên' : '👤 Grouped')
                : (language === 'vi' ? '📋 Danh sách' : '📋 Flat list')}
            </button>
            <button
              onClick={loadData}
              className="text-xs px-3 py-1.5 rounded-xl font-bold border border-slate-200 text-slate-500 hover:border-slate-400 transition-colors"
            >
              ↻ {language === 'vi' ? 'Làm mới' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-3">
        <select
          value={filterMember}
          onChange={e => setFilterMember(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-400"
        >
          <option value="all">{language === 'vi' ? '👥 Tất cả thành viên' : '👥 All members'}</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-400"
        >
          <option value="all">{language === 'vi' ? 'Tất cả loại' : language === 'ja' ? 'すべての種類' : language === 'es' ? 'Todos los tipos' : 'All types'}</option>
          <option value="daily">{language === 'vi' ? 'Ngày' : language === 'ja' ? 'デイリー' : language === 'es' ? 'Diario' : 'Daily'}</option>
          <option value="weekly">{language === 'vi' ? 'Tuần' : language === 'ja' ? 'ウィークリー' : language === 'es' ? 'Semanal' : 'Weekly'}</option>
          <option value="monthly">{language === 'vi' ? 'Tháng' : language === 'ja' ? 'マンスリー' : language === 'es' ? 'Mensual' : 'Monthly'}</option>
          <option value="recurring">{language === 'vi' ? 'Lặp lại' : language === 'ja' ? '繰り返し' : language === 'es' ? 'Recurrente' : 'Recurring'}</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-violet-400"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="text-xs px-2 py-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition-colors"
          >✕</button>
        )}
      </div>

      {/* Status tabs */}
      <div className="px-4 pt-3 pb-0 flex gap-2 flex-wrap border-b border-slate-100">
        {(['all', 'pending', 'in_progress', 'completed', 'approved'] as const).map(s => {
          const label = s === 'all'
            ? (language === 'vi' ? 'Tất cả' : 'All')
            : STATUS_CONFIG[s].label[language as keyof typeof STATUS_CONFIG[typeof s]['label']] ?? STATUS_CONFIG[s].label['en']
          const count = statusCounts[s] ?? 0
          const active = filterStatus === s
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs font-bold px-3 py-2 rounded-t-xl border-b-2 transition-colors flex items-center gap-1.5 ${
                active
                  ? 'border-violet-600 text-violet-700 bg-violet-50'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bulk action bar */}
      {filtered.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              allSelected
                ? 'bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {allSelected
              ? (language === 'vi' ? '☑ Bỏ chọn tất cả' : '☑ Deselect all')
              : (language === 'vi' ? '☐ Chọn tất cả' : '☐ Select all')}
          </button>

          {someSelected && (
            <>
              <span className="text-xs text-slate-500">
                {language === 'vi' ? `Đã chọn ${selectedIds.size} task` : `${selectedIds.size} selected`}
              </span>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition-colors ml-auto"
                >
                  🗑 {language === 'vi' ? `Xóa ${selectedIds.size} task` : `Delete ${selectedIds.size} tasks`}
                </button>
              ) : (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600">
                    {language === 'vi' ? 'Xác nhận xóa?' : 'Confirm delete?'}
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="text-xs font-black px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? '...' : (language === 'vi' ? '✓ Xóa ngay' : '✓ Delete')}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-slate-500 border border-slate-200 hover:border-slate-400 transition-colors"
                  >
                    {language === 'vi' ? 'Huỷ' : 'Cancel'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold">{language === 'vi' ? 'Không có nhiệm vụ nào' : 'No tasks found'}</p>
          </div>
        ) : groupByMember ? (
          <div className="space-y-5">
            {grouped.map(({ member, tasks: memberTasks }) => {
              return (
                <div key={member.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-sm font-black text-violet-700 flex-shrink-0 overflow-hidden">
                      {member.avatar
                        ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        : member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-black text-slate-700">{member.name}</span>
                    <span className="text-xs text-slate-400 font-medium">({memberTasks.length})</span>

                    {confirmDeleteMember === member.id ? (
                      <>
                        <span className="text-[10px] font-bold text-red-600">
                          {language === 'vi' ? 'Xóa hết?' : 'Delete all?'}
                        </span>
                        <button
                          onClick={() => handleDeleteAllForMember(member.id)}
                          disabled={deleting}
                          className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          {deleting ? '...' : '✓'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteMember(null)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 hover:border-slate-400 transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteMember(member.id)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded border bg-red-50 text-red-500 border-red-200 hover:bg-red-100 transition-colors"
                      >
                        🗑 {language === 'vi' ? 'Xóa tất cả' : 'Delete all'}
                      </button>
                    )}

                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <div className="space-y-1.5 pl-9">
                    {memberTasks.map(task => <TaskRow key={task.id} task={task} />)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(task => <TaskRow key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  )
}
