'use client'

import { useState, useRef, useEffect } from 'react'
import { UserProfile, updateProfile, resetXPAndProfession, getAllUsers, resetUserXPAndCoins } from '@/lib/firebase/profile'
import { logout } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import CharacterDisplay from './CharacterDisplay'
import { calculateLevel, getCharacterAssets } from '@/lib/utils/level'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

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
  
  const currentLevel = calculateLevel(profile.xp)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload lên Cloudinary
      const url = await uploadImageToCloudinary(file, 'avatars')
      setAvatar(url)
      // Lưu URL vào profile
      await updateProfile(profile.id, { avatar: url })
      setToast({ show: true, message: t('errors.avatarUpdateSuccess'), type: 'success' })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setToast({ show: true, message: error.message || t('errors.avatarUpdateError'), type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload lên Cloudinary
      const url = await uploadImageToCloudinary(file, 'images')
      setImage(url)
      // Lưu URL vào profile
      await updateProfile(profile.id, { image: url })
      setToast({ show: true, message: t('errors.imageUpdateSuccess'), type: 'success' })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setToast({ show: true, message: error.message || t('errors.imageUpdateError'), type: 'error' })
    } finally {
      setUploading(false)
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
      // Redirect to home page and force reload to ensure state is cleared
      window.location.href = '/'
    } catch (error: any) {
      console.error('Error logging out:', error)
      // Logout error sẽ được xử lý tự động bởi redirect
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('profile.title')}</h1>

        <div className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.avatar')}
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-400">
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? t('common.loading') : (t('profile.avatar') + ' - ' + t('common.add'))}
                </button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.image')}
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Image" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400">{t('common.loading')}</span>
                )}
              </div>
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? t('common.loading') : (t('profile.image') + ' - ' + t('common.add'))}
                </button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.name')}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.email')}
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          {/* Character Base Selection - Ẩn nếu đã chọn nhân vật */}
          {!profile.characterBase && (
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.selectCharacter')}
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['nam1', 'nam2', 'nu1', 'nu2'] as const).map((base) => {
                const currentLevel = calculateLevel(profile.xp)
                const previewAssets = getCharacterAssets(
                  currentLevel, 
                  base,
                  profile.gender, 
                  profile.profession
                )
                const genderLabel = base.startsWith('nam') ? 'Nam' : 'Nữ'
                const numLabel = base.endsWith('1') ? '1' : '2'
                
                return (
                  <button
                    key={base}
                    onClick={async () => {
                      try {
                        // Tự động set gender từ characterBase
                        const gender = base.startsWith('nam') ? 'nam' : 'nu'
                        await updateProfile(profile.id, { 
                          characterBase: base,
                          gender: gender
                        })
                        onUpdate({ ...profile, characterBase: base, gender: gender })
                        setToast({ show: true, message: `Đã chọn ${genderLabel} ${numLabel}!`, type: 'success' })
                      } catch (error) {
                        console.error('Error updating character base:', error)
                        setToast({ show: true, message: 'Lỗi khi cập nhật nhân vật', type: 'error' })
                      }
                    }}
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 ${
                      profile.characterBase === base
                        ? 'border-purple-600 ring-2 ring-purple-300'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                    title={`${genderLabel} ${numLabel}`}
                  >
                    <img
                      src={previewAssets.character || `/pic-avatar/${base}.png`}
                      alt={`${genderLabel} ${numLabel}`}
                      className="relative w-full h-full object-contain z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        const parent = (e.target as HTMLImageElement).parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">${genderLabel} ${numLabel}</div>`
                        }
                      }}
                    />
                    {profile.characterBase === base && (
                      <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-30">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          )}

          {/* Character Display */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.character')}</h3>
            <CharacterDisplay profile={profile} size="medium" showLevelInfo={true} />
          </div>

          {/* Profession Selection - Chỉ hiển thị khi level >= 5 */}
          {currentLevel >= 5 && (
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'vi' ? '🎓 Chọn Nghề Nghiệp' : '🎓 Choose Profession'}
                {!profile.profession && (
                  <span className="ml-2 text-xs text-orange-600">
                    {language === 'vi' ? '(Chưa chọn)' : '(Not selected)'}
                  </span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'bs', name: language === 'vi' ? '👨‍⚕️ Bác Sĩ' : '👨‍⚕️ Doctor', nameEn: 'Doctor' },
                  { code: 'ch', name: language === 'vi' ? '🚒 Cứu Hỏa' : '🚒 Firefighter', nameEn: 'Firefighter' },
                  { code: 'cs', name: language === 'vi' ? '👮 Cảnh Sát' : '👮 Police', nameEn: 'Police' },
                ].map((prof) => (
                  <button
                    key={prof.code}
                    onClick={async () => {
                      // Nếu đã chọn nghề rồi, không cho thay đổi
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
                            ? `✅ Đã chọn nghề: ${prof.name}! (Không thể thay đổi)` 
                            : `✅ Selected profession: ${prof.nameEn}! (Cannot change)`, 
                          type: 'success' 
                        })
                      } catch (error) {
                        console.error('Error updating profession:', error)
                        setToast({ 
                          show: true, 
                          message: language === 'vi' ? 'Lỗi khi cập nhật nghề nghiệp' : 'Error updating profession', 
                          type: 'error' 
                        })
                      }
                    }}
                    disabled={!!profile.profession}
                    className={`relative px-4 py-3 rounded-lg border-2 transition-all ${
                      profile.profession === prof.code
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                        : profile.profession
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-purple-400 bg-white'
                    }`}
                    title={profile.profession ? (language === 'vi' ? 'Đã chọn nghề, không thể thay đổi' : 'Profession already chosen, cannot change') : prof.name}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{prof.name.split(' ')[0]}</div>
                      <div className="text-sm font-medium text-gray-700">{prof.name.split(' ').slice(1).join(' ')}</div>
                    </div>
                    {profile.profession === prof.code && (
                      <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {currentLevel >= 5 && !profile.profession && (
                <p className="mt-2 text-xs text-gray-500">
                  {language === 'vi' 
                    ? '💡 Bạn đã đạt Level 5! Hãy chọn nghề nghiệp để nhân vật có trang phục đặc biệt.'
                    : '💡 You reached Level 5! Choose a profession to unlock special outfits.'}
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">{t('profile.xp')}</p>
              <p className="text-2xl font-bold text-primary-600">{profile.xp}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">{t('profile.coins')}</p>
              <p className="text-2xl font-bold text-yellow-600">{profile.coins}</p>
            </div>
          </div>

          {/* Test Level (Development Only) - Ẩn cho public version */}
          {/* <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('profile.testLevel')}</h4>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  setTestingLevel(true)
                  try {
                    const newXP = profile.xp + 500
                    await updateProfile(profile.id, { xp: newXP })
                    const updatedProfile = { ...profile, xp: newXP }
                    onUpdate(updatedProfile)
                    setToast({ show: true, message: `Đã tăng XP! Level mới: ${calculateLevel(newXP)}`, type: 'success' })
                  } catch (error) {
                    console.error('Error updating XP:', error)
                    setToast({ show: true, message: 'Lỗi khi tăng XP', type: 'error' })
                  } finally {
                    setTestingLevel(false)
                  }
                }}
                disabled={testingLevel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {testingLevel ? 'Đang tăng...' : '+500 XP'}
              </button>
              <button
                onClick={async () => {
                  setTestingLevel(true)
                  try {
                    const newXP = profile.xp + 2000
                    await updateProfile(profile.id, { xp: newXP })
                    const updatedProfile = { ...profile, xp: newXP }
                    onUpdate(updatedProfile)
                    setToast({ show: true, message: `Đã tăng XP! Level mới: ${calculateLevel(newXP)}`, type: 'success' })
                  } catch (error) {
                    console.error('Error updating XP:', error)
                    setToast({ show: true, message: 'Lỗi khi tăng XP', type: 'error' })
                  } finally {
                    setTestingLevel(false)
                  }
                }}
                disabled={testingLevel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {testingLevel ? 'Đang tăng...' : '+2000 XP'}
              </button>
              <button
                onClick={async () => {
                  // Reset XP trực tiếp không cần confirm
                  // Khi reset XP về 0, cũng xóa profession để user có thể chọn lại nghề khi lên lại level 5
                  setTestingLevel(true)
                  try {
                    await resetXPAndProfession(profile.id)
                    
                    const updatedProfile = { ...profile, xp: 0, profession: undefined }
                    onUpdate(updatedProfile)
                    setToast({ 
                      show: true, 
                      message: language === 'vi' 
                        ? '✅ Đã reset XP về 0! Level mới: 1. Nghề nghiệp đã được xóa, bạn có thể chọn lại khi lên Level 5.' 
                        : '✅ Reset XP to 0! New level: 1. Profession cleared, you can choose again at Level 5.', 
                      type: 'success' 
                    })
                  } catch (error) {
                    console.error('Error resetting XP:', error)
                    setToast({ show: true, message: 'Lỗi khi reset XP', type: 'error' })
                  } finally {
                    setTestingLevel(false)
                  }
                }}
                disabled={testingLevel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {testingLevel ? 'Đang reset...' : '🔄 Reset XP về 0'}
              </button>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">💰 Test Coins</h4>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={async () => {
                    setTestingLevel(true)
                    try {
                      const newCoins = profile.coins + 100
                      await updateProfile(profile.id, { coins: newCoins })
                      const updatedProfile = { ...profile, coins: newCoins }
                      onUpdate(updatedProfile)
                      setToast({ show: true, message: `✅ Đã thêm 100 Coins! Tổng: ${newCoins} Coins`, type: 'success' })
                    } catch (error) {
                      console.error('Error updating coins:', error)
                      setToast({ show: true, message: 'Lỗi khi thêm Coins', type: 'error' })
                    } finally {
                      setTestingLevel(false)
                    }
                  }}
                  disabled={testingLevel}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  {testingLevel ? 'Đang thêm...' : '+100 Coins'}
                </button>
                <button
                  onClick={async () => {
                    setTestingLevel(true)
                    try {
                      const newCoins = profile.coins + 500
                      await updateProfile(profile.id, { coins: newCoins })
                      const updatedProfile = { ...profile, coins: newCoins }
                      onUpdate(updatedProfile)
                      setToast({ show: true, message: `✅ Đã thêm 500 Coins! Tổng: ${newCoins} Coins`, type: 'success' })
                    } catch (error) {
                      console.error('Error updating coins:', error)
                      setToast({ show: true, message: 'Lỗi khi thêm Coins', type: 'error' })
                    } finally {
                      setTestingLevel(false)
                    }
                  }}
                  disabled={testingLevel}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  {testingLevel ? 'Đang thêm...' : '+500 Coins'}
                </button>
                <button
                  onClick={async () => {
                    setTestingLevel(true)
                    try {
                      const newCoins = profile.coins + 1000
                      await updateProfile(profile.id, { coins: newCoins })
                      const updatedProfile = { ...profile, coins: newCoins }
                      onUpdate(updatedProfile)
                      setToast({ show: true, message: `✅ Đã thêm 1000 Coins! Tổng: ${newCoins} Coins`, type: 'success' })
                    } catch (error) {
                      console.error('Error updating coins:', error)
                      setToast({ show: true, message: 'Lỗi khi thêm Coins', type: 'error' })
                    } finally {
                      setTestingLevel(false)
                    }
                  }}
                  disabled={testingLevel}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  {testingLevel ? 'Đang thêm...' : '+1000 Coins'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Level hiện tại: <span className="font-bold">{currentLevel}</span>
            </p>
          </div> */}

          {/* Root Management - Quản lý users */}
          {profile.isRoot && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('profile.rootManagement')}</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('profile.rootStatus')}:</strong> {t('profile.rootStatusYes')}
                </p>
              </div>
              
              {/* User Management Section */}
              <UserManagementSection currentUserId={profile.id} />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 border-t border-gray-200 pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? t('common.loading') : t('profile.saveChanges')}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
            >
              {t('profile.logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component quản lý users cho root
function UserManagementSection({ currentUserId }: { currentUserId: string }) {
  const { t, language } = useI18n()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState<string | null>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi tải danh sách users' : 'Error loading users', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetUser = async (targetUserId: string, userName: string) => {
    if (!confirm(language === 'vi' 
      ? `Bạn có chắc muốn reset XP và Coin của "${userName}" về 0?`
      : `Are you sure you want to reset XP and Coins of "${userName}" to 0?`)) {
      return
    }

    setResetting(targetUserId)
    try {
      await resetUserXPAndCoins(targetUserId, currentUserId)
      setToast({ 
        show: true, 
        message: language === 'vi' 
          ? `✅ Đã reset XP và Coin của "${userName}" về 0!` 
          : `✅ Reset XP and Coins of "${userName}" to 0!`, 
        type: 'success' 
      })
      // Reload users để cập nhật
      await loadUsers()
    } catch (error: any) {
      console.error('Error resetting user:', error)
      setToast({ 
        show: true, 
        message: error.message || (language === 'vi' ? 'Lỗi khi reset user' : 'Error resetting user'), 
        type: 'error' 
      })
    } finally {
      setResetting(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-sm font-semibold text-gray-700">
          {language === 'vi' ? '👥 Quản lý Users' : '👥 User Management'}
        </h5>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (language === 'vi' ? 'Đang tải...' : 'Loading...') : '🔄 Refresh'}
        </button>
      </div>
      
      {loading && users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {language === 'vi' ? 'Đang tải...' : 'Loading...'}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {language === 'vi' ? 'Không có users nào' : 'No users found'}
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <div className="flex gap-4 mt-1 text-xs">
                  <span className="text-blue-600">XP: {user.xp}</span>
                  <span className="text-yellow-600">Coins: {user.coins}</span>
                  {user.isRoot && (
                    <span className="text-purple-600 font-bold">🔐 Root</span>
                  )}
                </div>
              </div>
              {user.id !== currentUserId && (
                <button
                  onClick={() => handleResetUser(user.id, user.name)}
                  disabled={resetting === user.id}
                  className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {resetting === user.id 
                    ? (language === 'vi' ? 'Đang reset...' : 'Resetting...')
                    : (language === 'vi' ? '🔄 Reset XP/Coin' : '🔄 Reset XP/Coin')
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  )
}

