'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChangedSafe } from '@/lib/firebase/auth'
import { getProfileWithRetry, createDefaultProfile, updateProfile, UserProfile } from '@/lib/firebase/profile'
import { auth as firebaseAuth, db as firestoreDb } from '@/lib/firebase/config'
import { User } from 'firebase/auth'
import LoginPage from '@/components/LoginPage'
import JoinFamilyFlow from '@/components/JoinFamilyFlow'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProfilePage from '@/components/ProfilePage'
import Sidebar from '@/components/Sidebar'
import TasksList from '@/components/TasksList'
import PhotoEvidence from '@/components/PhotoEvidence'
import TaskApproval from '@/components/TaskApproval'
import RewardsShop from '@/components/RewardsShop'
import ChestSystem from '@/components/ChestSystem'
import BackgroundMusic from '@/components/BackgroundMusic'
import Statistics from '@/components/Statistics'
import TaskMonitoring from '@/components/TaskMonitoring'
import RootMemberDashboard from '@/components/RootMemberDashboard'
import { recordDailyLogin } from '@/lib/firebase/loginHistory'
import SuperRootDashboard from '@/components/SuperRootDashboard'
import CharacterCreation from '@/components/CharacterCreation'
import { useI18n } from '@/lib/i18n/context'
import { THEMES, ThemeId, getThemeById } from '@/lib/theme'

export default function Home() {
  const { t, language } = useI18n()
  const [themeId, setThemeId] = useState<ThemeId>('classic')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const router = useRouter()
  // Flag để tránh tạo profile nhiều lần
  const creatingProfileRef = useRef(false)
  const currentAuthUidRef = useRef<string | null>(null)

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app_theme') as ThemeId | null
    if (saved && THEMES.some(t => t.id === saved)) setThemeId(saved)
  }, [])

  useEffect(() => {
    // Timeout để tránh stuck ở loading quá lâu (10 giây)
    const timeoutId = setTimeout(() => {
      console.warn('Loading timeout - forcing loading to false')
      setLoading(false)
    }, 10000)

    const unsubscribe = onAuthStateChangedSafe(async (firebaseUser) => {
      // 1. Cập nhật ID hiện tại ngay lập tức để chặn các callback cũ
      const currentUid = firebaseUser?.uid || null
      currentAuthUidRef.current = currentUid

      const isMostRecent = () => currentAuthUidRef.current === currentUid

      if (!firebaseUser) {
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      // Check email verification (except for test accounts)
      const isTestAccount = firebaseUser.email?.includes('agent_test_2326')
      if (!firebaseUser.emailVerified && !isTestAccount) {
        console.warn('[page.tsx] 📧 Email not verified for:', firebaseUser.email)
        setVerificationError(
          language === 'vi'
            ? 'Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư đến và bấm vào link xác thực.'
            : 'Your email is not verified. Please check your inbox and click the verification link.'
        )
        import('@/lib/firebase/auth').then(({ logout }) => logout())
        setLoading(false)
        clearTimeout(timeoutId)
        return
      } else {
        setVerificationError(null)
      }

      // 2. Cập nhật user state ngay lập tức
      setUser(firebaseUser)
      console.log('[page.tsx] 🔐 User identified:', firebaseUser.email, '(Checking if most recent...)')

      try {
        // 3. Kiểm tra profile
        console.log('[page.tsx] 👤 Loading profile for:', firebaseUser.uid)
        let userProfile = await getProfileWithRetry(firebaseUser.uid)

        // Kiểm tra xem đây có còn là session mới nhất không trước khi sset state
        if (!isMostRecent()) {
          console.warn('[page.tsx] ⚠️ Overlapping auth session detected, aborting profile load for:', firebaseUser.uid)
          return
        }

        if (!userProfile) {
          if (creatingProfileRef.current) return
          creatingProfileRef.current = true
          try {
            console.log('[page.tsx] ✨ Creating new profile for UID:', firebaseUser.uid)
            const isRootFromSignup = typeof window !== 'undefined' && localStorage.getItem(`signup_isRoot_${firebaseUser.uid}`) === 'true'
            const isSuperRootFromSignup = typeof window !== 'undefined' && localStorage.getItem(`signup_isSuperRoot_${firebaseUser.uid}`) === 'true'
            const familyIdFromSignup = typeof window !== 'undefined' ? localStorage.getItem(`signup_familyId_${firebaseUser.uid}`) || undefined : undefined

            userProfile = await createDefaultProfile(firebaseUser, isRootFromSignup, familyIdFromSignup, isSuperRootFromSignup)
            
            if (!isMostRecent()) return // Double check after async creation
            
            // Cleanup signup flags
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`signup_isRoot_${firebaseUser.uid}`)
              localStorage.removeItem(`signup_isSuperRoot_${firebaseUser.uid}`)
              localStorage.removeItem(`signup_familyId_${firebaseUser.uid}`)
            }
          } finally {
            creatingProfileRef.current = false
          }
        }

        // 4. Hoàn tất cập nhật profile
        if (userProfile && typeof userProfile === 'object' && isMostRecent()) {
          // Sync Google avatar URL nếu user đăng nhập bằng Google và avatar chưa phải ảnh custom
          const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com')
          const isDefaultOrGoogleAvatar = !userProfile.avatar ||
            userProfile.avatar === '/icons/icon-192x192.png' ||
            userProfile.avatar.includes('lh3.googleusercontent.com') ||
            userProfile.avatar.includes('googleusercontent.com')
          if (isGoogleUser && firebaseUser.photoURL && isDefaultOrGoogleAvatar && userProfile.avatar !== firebaseUser.photoURL) {
            try {
              await updateProfile(userProfile.id, { avatar: firebaseUser.photoURL })
              userProfile = { ...userProfile, avatar: firebaseUser.photoURL }
              console.log('[page.tsx] ✅ Synced Google avatar URL')
            } catch (syncErr) {
              console.warn('[page.tsx] ⚠️ Could not sync Google avatar:', syncErr)
            }
          }

          // Migration cho user cũ (nếu cần)
          if (!userProfile.familyId && !userProfile.isSuperRoot && userProfile.isRoot) {
            try {
              const { createFamily } = await import('@/lib/firebase/family')
              const result = await createFamily(userProfile.name || 'Family', firebaseUser.uid)
              await updateProfile(userProfile.id, { familyId: result.familyId })
              userProfile = { ...userProfile, familyId: result.familyId }
            } catch (migrationErr) {
              console.error('[Migration] Error:', migrationErr)
            }
          }

          if (isMostRecent()) {
            setProfile(userProfile)
            if (userProfile.familyId) {
              recordDailyLogin(userProfile.id, userProfile.familyId).catch(console.error)
            }
            setError(null)
          }
        } else if (userProfile && isMostRecent()) {
          console.error('[page.tsx] Invalid profile found (not an object):', userProfile)
          setError('Profile found but data is corrupted. Please try logging out.')
        }
      } catch (err: any) {
        if (isMostRecent()) {
          console.error('[page.tsx] ❌ AUTH INITIALIZATION ERROR:', err)
          const errorDetail = err?.message || err?.code || String(err)
          setError(`Lỗi hệ thống: ${errorDetail}`)
        }
      } finally {
        if (isMostRecent()) {
          setLoading(false)
          clearTimeout(timeoutId)
        }
      }
    })

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, []) // Remove [language, t] to prevent resubscription on i18n changes



  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    const errorBackgroundStyle = {
      background: 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42))',
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-primary-50"
        style={errorBackgroundStyle}
      >
        <div className="kid-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-6 animate-bounce">⚠️</div>
          <h1 className="text-2xl font-black text-primary-900 mb-4">{t('errors.firebaseNotConfigured')}</h1>
          <p className="text-primary-700 mb-6 font-bold whitespace-pre-line">{error}</p>

          <div className="bg-white/50 border-2 border-primary-100 rounded-2xl p-4 text-left mb-6">
            <p className="text-xs text-primary-400 mb-2 font-black uppercase tracking-widest">🔍 TRẠNG THÁI HỆ THỐNG</p>
            <ul className="text-sm text-primary-600 space-y-1 font-bold">
              <li>Auth: {firebaseAuth ? '✅ Sẵn sàng' : '❌ Lỗi'}</li>
              <li>Database: {firestoreDb ? '✅ Sẵn sàng' : '❌ Lỗi'}</li>
              <li>User: {user ? `✅ ${user.email}` : '❌ Chưa đăng nhập'}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
               onClick={() => window.location.reload()}
               className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-kid hover:bg-primary-700 active:scale-95 transition-all uppercase tracking-tight"
            >
              🔄 {t('errors.tryAgain') || 'Thử lại'}
            </button>
            <button
               onClick={async () => {
                 const { logout } = await import('@/lib/firebase/auth');
                 await logout();
                 window.location.href = '/';
               }}
               className="w-full py-4 bg-white text-red-500 border-2 border-red-100 rounded-2xl font-black shadow-soft hover:bg-red-50 active:scale-95 transition-all uppercase tracking-tight"
            >
              🚪 {t('header.logout') || 'Đăng xuất'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginPage 
        externalError={verificationError} 
        onClearExternalError={() => setVerificationError(null)} 
      />
    )
  }

  const handleProfileUpdate = async () => {
    if (user) {
      const updatedProfile = await getProfileWithRetry(user.uid)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    }
  }

  // Nếu đã login nhưng chưa có profile hoặc chưa có familyId (ngoại trừ super root)
  // Dùng !profile.familyId để bắt cả undefined, null và '' (không chỉ '')
  if (!profile || (!profile.familyId && !profile.isSuperRoot)) {
    return (
      <JoinFamilyFlow
        user={user}
        profile={profile}
        onUpdated={handleProfileUpdate}
        backgroundImage={null}
      />
    )
  }

  const handleThemeChange = (id: ThemeId) => {
    setThemeId(id)
    localStorage.setItem('app_theme', id)
  }

  const backgroundStyle = { background: getThemeById(themeId).background }

  // Super Root Dashboard - hiển thị riêng cho super root
  if (profile.isSuperRoot) {
    return (
      <div className="flex min-h-screen" data-theme={themeId} style={backgroundStyle}>
        <Sidebar profile={profile} onThemeChange={handleThemeChange} />
        <div className="flex-1 lg:ml-72 transition-all duration-300">
          <BackgroundMusic isLoggedIn={!!user && !!profile} />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <div id="dashboard-section">
              <SuperRootDashboard currentUserId={user.uid} profile={profile} />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" data-theme={themeId} style={backgroundStyle}>
      <Sidebar profile={profile} onUpdate={handleProfileUpdate} onThemeChange={handleThemeChange} />

      <div className="flex-1 lg:ml-72 transition-all duration-300">
        <BackgroundMusic isLoggedIn={!!user && !!profile} />
        
        {profile && !profile.gender && (
          <CharacterCreation 
            profile={profile}
            onComplete={handleProfileUpdate}
          />
        )}

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái - Các tính năng chính */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dashboard theo dõi thành viên - chỉ hiển thị cho root user */}
              {profile.isRoot && !profile.isSuperRoot && (
                <div id="dashboard-section">
                  <RootMemberDashboard
                    currentUserId={user.uid}
                    familyId={profile.familyId}
                    profile={profile}
                  />
                </div>
              )}

              {/* Danh sách nhiệm vụ */}
              <div id="tasks-section" className="kid-card">
                <TasksList
                  currentUser={user}
                  profile={profile}
                  onTaskComplete={handleProfileUpdate}
                />
              </div>

              {/* Phê duyệt nhiệm vụ */}
              <div id="approval-section" className="kid-card">
                <TaskApproval
                  currentUserId={user.uid}
                  currentUserRole={profile.role}
                  familyId={profile.familyId}
                  onApprovalComplete={handleProfileUpdate}
                />
              </div>

              {/* Cửa hàng đổi thưởng */}
              <div id="shop-section" className="kid-card">
                <RewardsShop
                  currentUserId={user.uid}
                  profile={profile}
                  onPurchaseComplete={handleProfileUpdate}
                />
              </div>

              {/* Hệ thống Rương */}
              <div id="chests-section" className="kid-card">
                <ChestSystem
                  currentUserId={user.uid}
                  profile={profile}
                  onChestOpened={handleProfileUpdate}
                />
              </div>
            </div>

            {/* Cột phải - Profile và các tính năng phụ */}
            <div className="space-y-6">
              {/* Statistics */}
              <div id="statistics-section">
                <Statistics currentUserId={user.uid} profile={profile} />
              </div>

              {/* Task Monitoring - Chỉ hiển thị cho root user */}
              {profile.isRoot && (
                <div id="monitoring-section">
                  <TaskMonitoring currentUserId={user.uid} profile={profile} />
                </div>
              )}

              {/* Profile Management */}
              <div id="profile-section" className="kid-card">
                <ProfilePage
                  profile={profile}
                  onUpdate={(updatedProfile: UserProfile) => {
                    setProfile(updatedProfile)
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
