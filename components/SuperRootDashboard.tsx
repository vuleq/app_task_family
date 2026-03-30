'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { checkDb } from '@/lib/firebase/config'
import { getAllUsers, UserProfile, updateProfile } from '@/lib/firebase/profile'
import { getFamilyById, getFamilyMembers, Family } from '@/lib/firebase/family'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

interface SuperRootDashboardProps {
  currentUserId: string
  profile: UserProfile
}

interface AdjustState {
  userId: string
  xp: number
  coins: number
}

export default function SuperRootDashboard({ currentUserId, profile }: SuperRootDashboardProps) {
  const { t, language } = useI18n()
  const [families, setFamilies] = useState<Family[]>([])
  const [rootUsers, setRootUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  // Self-test panel
  const [selfXp, setSelfXp] = useState(100)
  const [selfCoins, setSelfCoins] = useState(100)
  const [savingSelf, setSavingSelf] = useState(false)

  // Per-member adjust state
  const [adjusting, setAdjusting] = useState<AdjustState | null>(null)
  const [savingMember, setSavingMember] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') =>
    setToast({ show: true, message, type })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const db = checkDb()

      const familiesRef = collection(db, 'families')
      const familiesSnapshot = await getDocs(familiesRef)
      const familiesData = familiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Family[]
      setFamilies(familiesData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0
        const bTime = b.createdAt?.toMillis() || 0
        return bTime - aTime
      }))

      const usersRef = collection(db, 'users')
      const rootUsersQuery = query(usersRef, where('isRoot', '==', true))
      const rootUsersSnapshot = await getDocs(rootUsersQuery)
      const rootUsersData = rootUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserProfile[]
      setRootUsers(rootUsersData.filter(u => !u.isSuperRoot))
    } catch (error) {
      console.error('Error loading data:', error)
      showToast(language === 'vi' ? 'Lỗi khi tải dữ liệu' : 'Error loading data', 'error')
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleViewFamily = async (family: Family) => {
    try {
      setSelectedFamily(family)
      setAdjusting(null)
      const members = await getFamilyMembers(family.id)
      setFamilyMembers(members)
    } catch (error) {
      showToast(language === 'vi' ? 'Lỗi khi tải thành viên gia đình' : 'Error loading family members', 'error')
    }
  }

  const handleToggleRootStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateProfile(userId, { isRoot: !currentStatus })
      showToast(
        language === 'vi'
          ? `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} quyền root cho user`
          : `Root status ${!currentStatus ? 'enabled' : 'disabled'} for user`,
        'success'
      )
      loadData()
      if (selectedFamily) {
        const members = await getFamilyMembers(selectedFamily.id)
        setFamilyMembers(members)
      }
    } catch (error) {
      showToast(language === 'vi' ? 'Lỗi khi cập nhật quyền root' : 'Error updating root status', 'error')
    }
  }

  // Add XP/coins to superroot's own account (for testing)
  const handleAddToSelf = async () => {
    if (savingSelf) return
    setSavingSelf(true)
    try {
      await updateProfile(currentUserId, {
        xp: (profile.xp || 0) + selfXp,
        coins: (profile.coins || 0) + selfCoins,
      })
      showToast(
        language === 'vi'
          ? `Đã thêm ${selfXp} XP và ${selfCoins} coins cho bạn!`
          : `Added ${selfXp} XP and ${selfCoins} coins to yourself!`,
        'success'
      )
    } catch (error) {
      showToast(language === 'vi' ? 'Lỗi khi cập nhật' : 'Error updating', 'error')
    } finally {
      setSavingSelf(false)
    }
  }

  // Save adjusted XP/coins to a family member
  const handleSaveMemberAdjust = async () => {
    if (!adjusting || savingMember) return
    setSavingMember(true)
    try {
      const member = familyMembers.find(m => m.id === adjusting.userId)
      if (!member) return
      await updateProfile(adjusting.userId, {
        xp: Math.max(0, (member.xp || 0) + adjusting.xp),
        coins: Math.max(0, (member.coins || 0) + adjusting.coins),
      })
      showToast(
        language === 'vi'
          ? `Đã cập nhật XP và coins cho ${member.name}!`
          : `Updated XP and coins for ${member.name}!`,
        'success'
      )
      // Refresh member list
      if (selectedFamily) {
        const members = await getFamilyMembers(selectedFamily.id)
        setFamilyMembers(members)
      }
      setAdjusting(null)
    } catch (error) {
      showToast(language === 'vi' ? 'Lỗi khi cập nhật' : 'Error updating', 'error')
    } finally {
      setSavingMember(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-violet-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-[2rem] p-8 shadow-kid">
        <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">👑 Super Root Dashboard</h2>
        <p className="text-violet-200 text-sm font-medium">
          {language === 'vi' ? 'Quản lý toàn hệ thống' : 'Manage the entire system'}
        </p>
        <div className="flex gap-6 mt-4 text-white/80 text-xs font-black uppercase tracking-widest">
          <span>🪙 {profile.coins} Coins</span>
          <span>⚡ {profile.xp} XP</span>
        </div>
      </div>

      {/* ── Self Test Panel ── */}
      <div className="kid-card p-8 border-4 border-violet-100 bg-violet-50/40">
        <h3 className="text-lg font-black text-violet-900 uppercase tracking-tight mb-6 flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          {language === 'vi' ? 'Tự tạo XP & Coins (Test)' : 'Add XP & Coins to Yourself (Test)'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">XP</label>
            <input
              type="number"
              min={0}
              value={selfXp}
              onChange={e => setSelfXp(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-5 py-3 border-4 border-violet-100 rounded-2xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">Coins 🪙</label>
            <input
              type="number"
              min={0}
              value={selfCoins}
              onChange={e => setSelfCoins(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-5 py-3 border-4 border-violet-100 rounded-2xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300"
            />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          {[100, 500, 1000].map(preset => (
            <button
              key={preset}
              onClick={() => { setSelfXp(preset); setSelfCoins(preset); }}
              className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              +{preset}
            </button>
          ))}
          <button
            onClick={handleAddToSelf}
            disabled={savingSelf}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black shadow-kid uppercase tracking-widest text-xs border-b-4 border-violet-800 active:translate-y-1 active:border-b-2 transition-all disabled:opacity-50"
          >
            {savingSelf ? '...' : (language === 'vi' ? '⚡ Thêm vào tài khoản của tôi' : '⚡ Add to My Account')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Families List */}
        <div className="kid-card p-6 border-violet-50">
          <h3 className="text-base font-black text-violet-900 mb-4 uppercase tracking-tight flex items-center gap-2">
            📋 {language === 'vi' ? 'Danh sách Gia đình' : 'Families'}
            <span className="text-xs text-violet-400 font-bold normal-case">({families.length})</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {families.length === 0 ? (
              <p className="text-violet-300 text-center py-6 text-sm">{language === 'vi' ? 'Chưa có gia đình nào' : 'No families yet'}</p>
            ) : (
              families.map(family => (
                <div
                  key={family.id}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedFamily?.id === family.id
                      ? 'bg-violet-100 border-violet-300'
                      : 'bg-violet-50/50 border-violet-50 hover:border-violet-200'
                  }`}
                  onClick={() => handleViewFamily(family)}
                >
                  <p className="font-black text-violet-900 text-sm">{family.name}</p>
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-1">
                    Code: <span className="font-mono">{family.code}</span> · {family.memberCount || 0} members
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Root Users List */}
        <div className="kid-card p-6 border-violet-50">
          <h3 className="text-base font-black text-violet-900 mb-4 uppercase tracking-tight flex items-center gap-2">
            👤 {language === 'vi' ? 'Root Users' : 'Root Users'}
            <span className="text-xs text-violet-400 font-bold normal-case">({rootUsers.length})</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {rootUsers.length === 0 ? (
              <p className="text-violet-300 text-center py-6 text-sm">{language === 'vi' ? 'Chưa có root user nào' : 'No root users yet'}</p>
            ) : (
              rootUsers.map(user => (
                <div key={user.id} className="p-3 rounded-2xl border-2 border-violet-50 bg-violet-50/50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-violet-900 text-sm truncate">{user.name}</p>
                    <p className="text-[10px] text-violet-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleToggleRootStatus(user.id, user.isRoot || false)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      user.isRoot
                        ? 'bg-red-100 hover:bg-red-200 text-red-600'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600'
                    }`}
                  >
                    {user.isRoot ? (language === 'vi' ? 'Vô hiệu' : 'Disable') : (language === 'vi' ? 'Kích hoạt' : 'Enable')}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Family Members Detail + XP/Coins Management */}
      {selectedFamily && (
        <div className="kid-card p-8 border-violet-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-violet-900 uppercase tracking-tight">
              👨‍👩‍👧‍👦 {selectedFamily.name}
            </h3>
            <button
              onClick={() => { setSelectedFamily(null); setFamilyMembers([]); setAdjusting(null); }}
              className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-600 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <p className="text-violet-300 text-center py-6 text-sm">{language === 'vi' ? 'Chưa có thành viên nào' : 'No members yet'}</p>
          ) : (
            <div className="space-y-3">
              {familyMembers.map(member => {
                const isAdjusting = adjusting?.userId === member.id
                return (
                  <div key={member.id} className="bg-violet-50/50 rounded-2xl border-2 border-violet-50 overflow-hidden">
                    {/* Member row */}
                    <div className="flex items-center gap-4 p-4">
                      {member.avatar && (
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-violet-900 text-sm">{member.name}</p>
                          {member.isRoot && <span className="px-2 py-0.5 bg-violet-600 text-white text-[9px] font-black uppercase rounded-full">Root</span>}
                          {member.isSuperRoot && <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black uppercase rounded-full">Super</span>}
                        </div>
                        <p className="text-[10px] text-violet-400 mt-0.5">
                          ⚡ {member.xp} XP · 🪙 {member.coins} Coins
                        </p>
                      </div>
                      <button
                        onClick={() => setAdjusting(isAdjusting ? null : { userId: member.id, xp: 100, coins: 100 })}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isAdjusting
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                        }`}
                      >
                        {isAdjusting ? (language === 'vi' ? 'Hủy' : 'Cancel') : '+ XP/Coins'}
                      </button>
                    </div>

                    {/* Adjust panel */}
                    {isAdjusting && adjusting && (
                      <div className="border-t-2 border-violet-100 p-4 bg-white">
                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">
                          {language === 'vi' ? 'Số lượng cộng thêm (âm = trừ đi)' : 'Amount to add (negative = subtract)'}
                        </p>
                        <div className="flex gap-3 flex-wrap items-end">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">XP</label>
                            <input
                              type="number"
                              value={adjusting.xp}
                              onChange={e => setAdjusting({ ...adjusting, xp: parseInt(e.target.value) || 0 })}
                              className="w-28 px-4 py-2 border-4 border-violet-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">Coins 🪙</label>
                            <input
                              type="number"
                              value={adjusting.coins}
                              onChange={e => setAdjusting({ ...adjusting, coins: parseInt(e.target.value) || 0 })}
                              className="w-28 px-4 py-2 border-4 border-violet-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            {[100, 500].map(p => (
                              <button key={p} onClick={() => setAdjusting({ ...adjusting, xp: p, coins: p })}
                                className="px-3 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                +{p}
                              </button>
                            ))}
                            <button
                              onClick={handleSaveMemberAdjust}
                              disabled={savingMember}
                              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-2 transition-all disabled:opacity-50"
                            >
                              {savingMember ? '...' : (language === 'vi' ? 'Lưu' : 'Save')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
