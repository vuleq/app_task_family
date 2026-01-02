'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChangedSafe } from '@/lib/firebase/auth'
import { getProfile, createDefaultProfile, updateProfile, UserProfile } from '@/lib/firebase/profile'
import { User } from 'firebase/auth'
import LoginPage from '@/components/LoginPage'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProfilePage from '@/components/ProfilePage'
import Header from '@/components/Header'
import TasksList from '@/components/TasksList'
import PhotoEvidence from '@/components/PhotoEvidence'
import TaskApproval from '@/components/TaskApproval'
import RewardsShop from '@/components/RewardsShop'
import ChestSystem from '@/components/ChestSystem'
import { useI18n } from '@/lib/i18n/context'

export default function Home() {
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChangedSafe(async (user) => {
      if (user) {
        try {
          setUser(user)
          // Create or get profile
          let userProfile = await getProfile(user.uid)
          if (!userProfile) {
            // Check if user has isRoot flag (stored in localStorage during signup)
            let isRootFromSignup = false
            if (typeof window !== 'undefined') {
              isRootFromSignup = localStorage.getItem(`signup_isRoot_${user.uid}`) === 'true'
            }
            userProfile = await createDefaultProfile(user, isRootFromSignup)
            // Clean up localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`signup_isRoot_${user.uid}`)
            }
          }
          // Đảm bảo characterAvatar luôn có giá trị (cho user cũ chưa có)
          if (!userProfile.characterAvatar) {
            const avatarNumber = (user.uid.charCodeAt(0) % 7) + 1
            userProfile = { ...userProfile, characterAvatar: avatarNumber }
            // Cập nhật vào database
            try {
              await updateProfile(userProfile.id, { characterAvatar: avatarNumber })
            } catch (err) {
              console.error('Error updating characterAvatar:', err)
            }
          }
          setProfile(userProfile)
          setError(null)
        } catch (err: any) {
          console.error('Error loading profile:', err)
          setError(t('errors.cannotLoadUser'))
        } finally {
          setLoading(false)
        }
      } else {
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('errors.firebaseNotConfigured')}</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 mb-2"><strong>{t('errors.toFix')}</strong></p>
              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>{t('errors.createEnvFile')}</li>
                <li>{t('errors.addFirebaseInfo')}</li>
                <li>{t('errors.restartServer')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <LoginPage />
  }

  const handleProfileUpdate = async () => {
    if (user) {
      const updatedProfile = await getProfile(user.uid)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header với thông tin cá nhân ở góc trên bên trái */}
      <Header profile={profile} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái - Các tính năng chính */}
          <div className="lg:col-span-2 space-y-6">
            {/* Danh sách nhiệm vụ */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <TasksList 
                currentUser={user} 
                profile={profile}
                onTaskComplete={handleProfileUpdate}
              />
            </div>

            {/* Phê duyệt nhiệm vụ */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <TaskApproval 
                currentUserId={user.uid}
                currentUserRole={profile.role}
                onApprovalComplete={handleProfileUpdate}
              />
            </div>

            {/* Cửa hàng đổi thưởng */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <RewardsShop 
                currentUserId={user.uid}
                profile={profile}
                onPurchaseComplete={handleProfileUpdate}
              />
            </div>

            {/* Hệ thống Rương */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ChestSystem 
                currentUserId={user.uid}
                profile={profile}
                onChestOpened={handleProfileUpdate}
              />
            </div>
          </div>

          {/* Cột phải - Profile và các tính năng phụ */}
          <div className="space-y-6">
            {/* Profile Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ProfilePage 
                profile={profile} 
                onUpdate={(updatedProfile) => {
                  setProfile(updatedProfile)
                }} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

