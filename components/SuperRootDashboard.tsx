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
}

export default function SuperRootDashboard({ currentUserId }: SuperRootDashboardProps) {
  const { t, language } = useI18n()
  const [families, setFamilies] = useState<Family[]>([])
  const [rootUsers, setRootUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const db = checkDb()
      
      // Load tất cả families
      const familiesRef = collection(db, 'families')
      const familiesSnapshot = await getDocs(familiesRef)
      const familiesData = familiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Family[]
      setFamilies(familiesData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0
        const bTime = b.createdAt?.toMillis() || 0
        return bTime - aTime // Mới nhất trước
      }))

      // Load tất cả root users
      const usersRef = collection(db, 'users')
      const rootUsersQuery = query(usersRef, where('isRoot', '==', true))
      const rootUsersSnapshot = await getDocs(rootUsersQuery)
      const rootUsersData = rootUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserProfile[]
      setRootUsers(rootUsersData.filter(u => !u.isSuperRoot)) // Loại bỏ super root
    } catch (error) {
      console.error('Error loading data:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi tải dữ liệu' : 'Error loading data', type: 'error' })
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
      const members = await getFamilyMembers(family.id)
      setFamilyMembers(members)
    } catch (error) {
      console.error('Error loading family members:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi tải thành viên gia đình' : 'Error loading family members', type: 'error' })
    }
  }

  const handleToggleRootStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateProfile(userId, { isRoot: !currentStatus })
      setToast({ 
        show: true, 
        message: language === 'vi' 
          ? `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} quyền root cho user`
          : `Root status ${!currentStatus ? 'enabled' : 'disabled'} for user`, 
        type: 'success' 
      })
      loadData()
      if (selectedFamily) {
        const members = await getFamilyMembers(selectedFamily.id)
        setFamilyMembers(members)
      }
    } catch (error) {
      console.error('Error updating root status:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi cập nhật quyền root' : 'Error updating root status', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
        <div className="text-center py-8 text-gray-400">
          {language === 'vi' ? 'Đang tải...' : 'Loading...'}
        </div>
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

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 border border-purple-500/50">
        <h2 className="text-2xl font-bold text-white mb-2">
          {language === 'vi' ? '👑 Super Root Dashboard' : '👑 Super Root Dashboard'}
        </h2>
        <p className="text-purple-100">
          {language === 'vi' 
            ? 'Quản lý tất cả families và root users trong hệ thống'
            : 'Manage all families and root users in the system'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Families List */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            {language === 'vi' ? '📋 Danh sách Gia đình' : '📋 Families List'}
            <span className="ml-2 text-sm text-gray-400">({families.length})</span>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {families.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {language === 'vi' ? 'Chưa có gia đình nào' : 'No families yet'}
              </p>
            ) : (
              families.map(family => (
                <div
                  key={family.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFamily?.id === family.id
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  }`}
                  onClick={() => handleViewFamily(family)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-100">{family.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {language === 'vi' ? 'Mã:' : 'Code:'} <span className="font-mono">{family.code}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {language === 'vi' ? 'Thành viên:' : 'Members:'} {family.memberCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Root Users List */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            {language === 'vi' ? '👤 Danh sách Root Users' : '👤 Root Users List'}
            <span className="ml-2 text-sm text-gray-400">({rootUsers.length})</span>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rootUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {language === 'vi' ? 'Chưa có root user nào' : 'No root users yet'}
              </p>
            ) : (
              rootUsers.map(user => (
                <div
                  key={user.id}
                  className="p-3 rounded-lg border bg-slate-700/50 border-slate-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                      {user.familyId && (
                        <p className="text-xs text-gray-400">
                          {language === 'vi' ? 'Family ID:' : 'Family ID:'} {user.familyId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleRootStatus(user.id, user.isRoot || false)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        user.isRoot
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={language === 'vi' 
                        ? (user.isRoot ? 'Vô hiệu hóa root' : 'Kích hoạt root')
                        : (user.isRoot ? 'Disable root' : 'Enable root')}
                    >
                      {user.isRoot ? (language === 'vi' ? 'Vô hiệu' : 'Disable') : (language === 'vi' ? 'Kích hoạt' : 'Enable')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Family Members Detail */}
      {selectedFamily && (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              {language === 'vi' ? '👨‍👩‍👧‍👦 Thành viên gia đình:' : '👨‍👩‍👧‍👦 Family Members:'} {selectedFamily.name}
            </h3>
            <button
              onClick={() => setSelectedFamily(null)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded text-sm"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {familyMembers.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-4">
                {language === 'vi' ? 'Chưa có thành viên nào' : 'No members yet'}
              </p>
            ) : (
              familyMembers.map(member => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg border bg-slate-700/50 border-slate-600"
                >
                  <p className="font-medium text-gray-100">{member.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{member.email}</p>
                  <div className="flex gap-2 mt-2">
                    {member.isRoot && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        {language === 'vi' ? 'Root' : 'Root'}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                      {member.role === 'parent' ? (language === 'vi' ? 'Phụ huynh' : 'Parent') : (language === 'vi' ? 'Trẻ em' : 'Child')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
