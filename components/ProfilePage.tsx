'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { UserProfile, updateProfile, resetXPAndProfession, getAllUsers, resetUserXPAndCoins, deleteUser } from '@/lib/firebase/profile'
import { logout } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import CharacterDisplay from './CharacterDisplay'
import { calculateLevel, getCharacterAssets } from '@/lib/utils/level'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'
import { getFamilyById, Family } from '@/lib/firebase/family'

interface ProfilePageProps {
  profile: UserProfile
  onUpdate: (updatedProfile: UserProfile) => void
}

export default function ProfilePage({ profile, onUpdate }: ProfilePageProps) {
  const { t, language } = useI18n()
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.avatar || '')
  const [image, setImage] = useState(profile.image || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingLevel, setTestingLevel] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [familyInfo, setFamilyInfo] = useState<Family | null>(null)
  const [loadingFamily, setLoadingFamily] = useState(false)
  
  const currentLevel = calculateLevel(profile.xp)
  
  // Load family info for root users
  const loadFamilyInfo = useCallback(async () => {
    if (!profile.familyId) return
    setLoadingFamily(true)
    try {
      const family = await getFamilyById(profile.familyId)
      setFamilyInfo(family)
    } catch (error) {
      console.error('Error loading family info:', error)
    } finally {
      setLoadingFamily(false)
    }
  }, [profile.familyId])
  
  useEffect(() => {
    if (profile.familyId) {
      loadFamilyInfo()
    }
  }, [profile.familyId, loadFamilyInfo])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file, 'family-tasks/avatars')
      setAvatar(url)
      await updateProfile(profile.id, { avatar: url })
      setToast({ show: true, message: t('errors.avatarUpdateSuccess'), type: 'success' })
    } catch (error: any) {
      console.error('[Avatar Upload] Error:', error)
      const errorMessage = error.message || t('errors.avatarUpdateError')
      setToast({ show: true, message: errorMessage, type: 'error' })
    } finally {
      setUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file, 'family-tasks/images')
      setImage(url)
      await updateProfile(profile.id, { image: url })
      setToast({ show: true, message: t('errors.imageUpdateSuccess'), type: 'success' })
    } catch (error: any) {
      console.error('[Image Upload] Error:', error)
      const errorMessage = error.message || t('errors.imageUpdateError')
      setToast({ show: true, message: errorMessage, type: 'error' })
    } finally {
      setUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(profile.id, { name, avatar, image })
      onUpdate({ ...profile, name, avatar, image })
      setToast({ show: true, message: t('errors.profileUpdateSuccess'), type: 'success' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setToast({ show: true, message: t('errors.profileUpdateError'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error: any) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      
      <div className="flex flex-col sm:flex-row items-center justify-between bg-violet-50 -mx-4 sm:-mx-6 -mt-6 lg:-mt-10 p-8 rounded-t-[3rem] border-b-4 border-violet-100 mb-8 gap-4">
        <h1 className="text-3xl font-black text-violet-900 flex items-center gap-4">
          <span className="text-4xl animate-bounce-slow">👤</span>
          {t('profile.title')}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-playful bg-violet-600 text-white px-6 py-3 rounded-2xl font-black shadow-kid hover:bg-violet-700 active:scale-95 transition-all text-sm"
          >
            {saving ? '...' : `✨ ${t('profile.saveChanges')}`}
          </button>
          <button
            onClick={handleLogout}
            className="btn-playful bg-white text-red-500 border-2 border-red-50 rounded-2xl px-6 py-3 font-black shadow-soft hover:bg-red-50 active:scale-95 transition-all text-sm"
          >
             🚪 {t('profile.logout')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {/* Avatar & Basic Info Card */}
          <div className="kid-card p-8 bg-white border-violet-100 shadow-kid relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-100 to-violet-50 p-1 shadow-soft ring-4 ring-white">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-violet-200">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-violet-600 text-white rounded-full border-4 border-white shadow-soft flex items-center justify-center hover:bg-violet-700 active:scale-90 transition-all"
                >
                  ✏️
                </button>
              </div>

              <div className="w-full space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('profile.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-violet-100 rounded-2xl bg-violet-50/50 text-violet-900 font-black focus:border-violet-400 focus:bg-white outline-none transition-all text-lg shadow-inner"
                    placeholder={t('profile.name')}
                  />
                </div>

                <div className="space-y-1 opacity-70">
                  <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('profile.email')}</label>
                  <div className="w-full px-5 py-4 border-2 border-transparent bg-slate-100 rounded-2xl text-slate-500 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                    {profile.email}
                  </div>
                </div>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="kid-card p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 text-white shadow-kid transform transition-transform hover:scale-[1.02]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('profile.xp')}</p>
              <p className="text-3xl font-black drop-shadow-md flex items-center gap-2">
                <span className="text-2xl">✨</span> {profile.xp}
              </p>
            </div>
            <div className="kid-card p-6 bg-gradient-to-br from-amber-400 to-accent-600 border-accent-400 text-white shadow-kid transform transition-transform hover:scale-[1.02]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('profile.coins')}</p>
              <p className="text-3xl font-black drop-shadow-md flex items-center gap-2">
                <span className="text-2xl">🪙</span> {profile.coins}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Character Info Card */}
          <div className="kid-card p-8 bg-white border-violet-100 shadow-kid min-h-full">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-violet-900 uppercase tracking-tight">{t('profile.character')}</h3>
               <div className="bg-violet-100 text-violet-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                 LEVEL {currentLevel}
               </div>
            </div>
            
            <div className="flex flex-col items-center">
              <CharacterDisplay profile={profile} size="large" showLevelInfo={true} />
            </div>

            {/* Profession Selection - Chỉ hiển thị khi level >= 5 */}
            {currentLevel >= 5 && (
              <div className="mt-8 pt-8 border-t-2 border-violet-50">
                <label className="block text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">
                  🎓 {language === 'vi' ? 'Chọn Nghề Nghiệp' : 'Choose Profession'}
                  {!profile.profession && (
                    <span className="ml-2 text-accent-500">
                      {language === 'vi' ? '(Chưa chọn)' : '(Not selected)'}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: 'bs', emoji: '👨‍⚕️', name: language === 'vi' ? 'Bác Sĩ' : 'Doctor' },
                    { code: 'ch', emoji: '🚒', name: language === 'vi' ? 'Cứu Hỏa' : 'Firefighter' },
                    { code: 'cs', emoji: '👮', name: language === 'vi' ? 'Cảnh Sát' : 'Police' },
                  ].map((prof) => (
                    <button
                      key={prof.code}
                      onClick={async () => {
                        if (profile.profession) {
                          setToast({ 
                            show: true, 
                            message: language === 'vi' 
                              ? '⚠️ Bạn đã chọn nghề rồi, không thể thay đổi!' 
                              : '⚠️ You have already chosen a profession, cannot change!', 
                            type: 'error' 
                          })
                          return
                        }
                        
                        try {
                          await updateProfile(profile.id, { profession: prof.code })
                          onUpdate({ ...profile, profession: prof.code })
                          setToast({ 
                            show: true, 
                            message: language === 'vi' 
                              ? `✅ Đã chọn nghề: ${prof.name}!` 
                              : `✅ Selected profession: ${prof.name}!`, 
                            type: 'success' 
                          })
                        } catch (error) {
                          console.error('Error updating profession:', error)
                          setToast({ show: true, message: 'Error', type: 'error' })
                        }
                      }}
                      disabled={!!profile.profession}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                        profile.profession === prof.code
                          ? 'border-violet-600 bg-violet-50 shadow-soft'
                          : profile.profession
                          ? 'border-slate-100 opacity-40 grayscale cursor-not-allowed'
                          : 'border-violet-100 hover:border-violet-300 hover:bg-violet-50 active:scale-95'
                      }`}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{prof.emoji}</span>
                      <span className="text-[10px] font-black uppercase text-violet-900">{prof.name}</span>
                      {profile.profession === prof.code && (
                        <div className="absolute -top-2 -right-2 bg-violet-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-soft border-2 border-white">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Root Management */}
      {profile.isRoot && (
        <div className="kid-card p-8 bg-white border-violet-100 shadow-kid">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">🔐</div>
             <div>
                <h4 className="text-xl font-black text-violet-900 uppercase tracking-tight">{t('profile.rootManagement')}</h4>
                <p className="text-xs text-violet-400 font-bold uppercase tracking-widest">{t('profile.rootStatusYes')}</p>
             </div>
          </div>
          
          {loadingFamily ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-violet-50 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-violet-50 rounded"></div>
                  <div className="h-4 bg-violet-50 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : familyInfo ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-violet-50 rounded-3xl border-2 border-violet-100 relative overflow-hidden group">
                  <label className="block text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">📋 {t('profile.familyCode')}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white border-2 border-violet-100 rounded-xl px-4 py-3 text-violet-900 font-mono font-black text-lg tracking-wider group-hover:border-violet-200 transition-colors">
                      {familyInfo.code}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(familyInfo.code)
                        setToast({ show: true, message: t('profile.codeCopied'), type: 'success' })
                      }}
                      className="p-3 bg-violet-600 text-white rounded-xl shadow-soft hover:bg-violet-700 active:scale-90 transition-all"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100 relative overflow-hidden group">
                  <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">🔐 {t('profile.rootCode')}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white border-2 border-amber-100 rounded-xl px-4 py-3 text-amber-900 font-mono font-black text-lg tracking-wider group-hover:border-amber-200 transition-colors">
                      {familyInfo.rootCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(familyInfo.rootCode)
                        setToast({ show: true, message: t('profile.codeCopied'), type: 'success' })
                      }}
                      className="p-3 bg-amber-500 text-white rounded-xl shadow-soft hover:bg-amber-600 active:scale-90 transition-all"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <UserManagementSection currentUserId={profile.id} familyId={profile.familyId} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function UserManagementSection({ currentUserId, familyId }: { currentUserId: string; familyId: string }) {
  const { t, language } = useI18n()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const loadUsers = useCallback(async () => {
    if (!familyId) return
    setLoading(true)
    try {
      const allUsers = await getAllUsers(familyId)
      setUsers(allUsers.filter(u => u.id !== currentUserId))
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, familyId])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleResetUser = async (targetUserId: string, userName: string) => {
    if (!confirm(`${t('common.confirm')}?`)) return
    setResetting(targetUserId)
    try {
      await resetUserXPAndCoins(targetUserId, currentUserId)
      setToast({ show: true, message: 'Done!', type: 'success' })
      loadUsers()
    } catch (error: any) {
      setToast({ show: true, message: error.message, type: 'error' })
    } finally {
      setResetting(null)
    }
  }

  const handleDeleteUser = async (targetUserId: string, userName: string) => {
    if (!confirm(`${t('common.confirm')}?`)) return
    setDeleting(targetUserId)
    try {
      await deleteUser(targetUserId, currentUserId)
      setToast({ show: true, message: 'Deleted!', type: 'success' })
      loadUsers()
    } catch (error: any) {
      setToast({ show: true, message: error.message, type: 'error' })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-sm font-black text-violet-900 uppercase tracking-widest">
           👥 {language === 'vi' ? 'Quản lý thành viên' : 'Member Management'}
        </h5>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="p-3 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 active:scale-90 transition-all border border-violet-100"
        >
          🔄
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <div key={user.id} className="p-4 bg-violet-50/50 rounded-2xl border-2 border-violet-100 flex items-center justify-between group hover:border-violet-200 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-white border-2 border-violet-100 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-violet-300">{user.name.charAt(0)}</span>
                  )}
               </div>
               <div>
                  <p className="font-black text-violet-900 leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">XP: {user.xp} • 🪙 {user.coins}</p>
               </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleResetUser(user.id, user.name)}
                disabled={!!resetting || !!deleting}
                className="p-2 bg-white text-orange-500 rounded-lg shadow-soft border border-orange-100 hover:bg-orange-50 active:scale-90"
                title="Reset Stats"
              >
                🔄
              </button>
              <button
                onClick={() => handleDeleteUser(user.id, user.name)}
                disabled={!!resetting || !!deleting}
                className="p-2 bg-white text-red-500 rounded-lg shadow-soft border border-red-100 hover:bg-red-50 active:scale-90"
                title="Delete User"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-[100]">
           <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </div>
      )}
    </div>
  )
}
