'use client'

import { useState, useRef } from 'react'
import { UserProfile, updateProfile } from '@/lib/firebase/profile'
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
  const { t } = useI18n()
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

          {/* Character Avatar Selection - Ẩn nếu đã chọn nhân vật */}
          {!profile.characterAvatar && (
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.selectCharacter')}
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const currentLevel = calculateLevel(profile.xp)
                const previewAssets = getCharacterAssets(currentLevel, num)
                return (
                  <button
                    key={num}
                    onClick={async () => {
                      try {
                        await updateProfile(profile.id, { characterAvatar: num })
                        onUpdate({ ...profile, characterAvatar: num })
                        setToast({ show: true, message: `Đã chọn nhân vật ${num}!`, type: 'success' })
                      } catch (error) {
                        console.error('Error updating character avatar:', error)
                        setToast({ show: true, message: 'Lỗi khi cập nhật nhân vật', type: 'error' })
                      }
                    }}
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 ${
                      profile.characterAvatar === num
                        ? 'border-purple-600 ring-2 ring-purple-300'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                    title={`Nhân vật ${num}`}
                  >
                    {/* Preview với background */}
                    {previewAssets.background && (
                      <img
                        src={previewAssets.background}
                        alt="BG"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                    )}
                    <img
                      src={`/pic-avatar/avatar${num}.png`}
                      alt={`Avatar ${num}`}
                      className="relative w-full h-full object-contain z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        const parent = (e.target as HTMLImageElement).parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">${num}</div>`
                        }
                      }}
                    />
                    {profile.characterAvatar === num && (
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

          {/* Test Level (Development Only) */}
          <div className="border-t border-gray-200 pt-4">
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
                  setTestingLevel(true)
                  try {
                    await updateProfile(profile.id, { xp: 0 })
                    const updatedProfile = { ...profile, xp: 0 }
                    onUpdate(updatedProfile)
                    setToast({ show: true, message: '✅ Đã reset XP về 0! Level mới: 1', type: 'success' })
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
            <p className="text-xs text-gray-500 mt-2">
              Level hiện tại: <span className="font-bold">{currentLevel}</span>
            </p>
          </div>

          {/* Root Management - Chỉ root mới có thể set root cho user khác */}
          {profile.isRoot && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('profile.rootManagement')}</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('profile.rootStatus')}:</strong> {t('profile.rootStatusYes')}
                </p>
                <p className="text-xs text-gray-600">
                  {t('profile.rootInstructions')}
                </p>
              </div>
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

