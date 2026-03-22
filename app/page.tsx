'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChangedSafe } from '@/lib/firebase/auth'
import { getProfile, getProfileWithRetry, createDefaultProfile, updateProfile, UserProfile } from '@/lib/firebase/profile'
import { db as firestoreDb, auth as firebaseAuth } from '@/lib/firebase/config'
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

export default function Home() {
  const { t, language } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // Flag để tránh tạo profile nhiều lần
  const creatingProfileRef = useRef(false)

  // Random background image
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  useEffect(() => {
    // Lấy danh sách background images từ environment variables
    const backgrounds: string[] = []
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1) {
      backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1)
    }
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2) {
      backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2)
    }

    // Random chọn 1 background
    if (backgrounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * backgrounds.length)
      setBackgroundImage(backgrounds[randomIndex])
    }
  }, [])

  useEffect(() => {
    // Timeout để tránh stuck ở loading quá lâu (10 giây)
    const timeoutId = setTimeout(() => {
      console.warn('Loading timeout - forcing loading to false')
      setLoading(false)
    }, 10000)

    const unsubscribe = onAuthStateChangedSafe(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
        clearTimeout(timeoutId)
        return
      }

      // 1. Set user state ngay lập tức
      setUser(firebaseUser)
      console.log('[page.tsx] 🔐 User authenticated:', firebaseUser.email)

      try {
        // 2. Chờ Firebase initialized (với retry logic nhẹ nhàng hơn)
        let dbInstance = null
        let retries = 0
        const maxRetries = 5

        while (!dbInstance && retries < maxRetries) {
          const { db } = await import('@/lib/firebase/config')
          if (db) {
            dbInstance = db
            break
          }
          await new Promise(resolve => setTimeout(resolve, 500))
          retries++
        }

        if (!dbInstance) {
          throw new Error('Firebase Firestore could not be initialized. Please check your .env.local file.')
        }

        // 3. Handle Google Redirect state if exists
        if (typeof window !== 'undefined') {
          const pendingStateStr = localStorage.getItem('pending_google_auth_state')
          if (pendingStateStr) {
            try {
              const pendingState = JSON.parse(pendingStateStr)
              if (Date.now() - pendingState.timestamp < 30 * 60 * 1000) {
                console.log('[page.tsx] 🔄 Migrating pending Google state to UID:', firebaseUser.uid)
                if (pendingState.wantRoot) localStorage.setItem(`signup_isRoot_${firebaseUser.uid}`, 'true')
                if (pendingState.wantSuperRoot) localStorage.setItem(`signup_isSuperRoot_${firebaseUser.uid}`, 'true')
                if (pendingState.familyId) localStorage.setItem(`signup_familyId_${firebaseUser.uid}`, pendingState.familyId)
                localStorage.setItem(`is_google_signup_${firebaseUser.uid}`, 'true')
              }
              localStorage.removeItem('pending_google_auth_state')
            } catch (e) {
              console.error('[page.tsx] Error parsing pending state:', e)
            }
          }
        }

        // 4. Load or Create Profile
        const currentAuthUser = (await import('@/lib/firebase/config')).auth?.currentUser
        console.log('[page.tsx] 🔐 Auth State Check:', {
          onAuthStateChangedUser: firebaseUser.uid,
          currentAuthUser: currentAuthUser?.uid || 'NONE',
          isMatches: currentAuthUser?.uid === firebaseUser.uid
        })
        
        console.log('[page.tsx] 👤 Loading profile for:', firebaseUser.uid)
        let userProfile = await getProfileWithRetry(firebaseUser.uid)

        if (!userProfile) {
          if (creatingProfileRef.current) return
          
          creatingProfileRef.current = true
          try {
            console.log('[page.tsx] ✨ Creating new profile for UID:', firebaseUser.uid, 'on Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
            const isRootFromSignup = typeof window !== 'undefined' && localStorage.getItem(`signup_isRoot_${firebaseUser.uid}`) === 'true'
            const isSuperRootFromSignup = typeof window !== 'undefined' && localStorage.getItem(`signup_isSuperRoot_${firebaseUser.uid}`) === 'true'
            const familyIdFromSignup = typeof window !== 'undefined' ? localStorage.getItem(`signup_familyId_${firebaseUser.uid}`) || undefined : undefined

            userProfile = await createDefaultProfile(firebaseUser, isRootFromSignup, familyIdFromSignup, isSuperRootFromSignup)
            
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

        // 5. Finalize status
        if (userProfile) {
          // Migration cho user cũ
          if (!userProfile.familyId && !userProfile.isSuperRoot) {
            if (userProfile.isRoot) {
              try {
                const { createFamily } = await import('@/lib/firebase/family')
                const result = await createFamily(userProfile.name || 'Family', firebaseUser.uid)
                await updateProfile(userProfile.id, { familyId: result.familyId })
                userProfile = { ...userProfile, familyId: result.familyId }
              } catch (migrationErr: any) {
                console.error('[Migration] Lỗi khi tạo family cho user cũ:', migrationErr)
                console.warn('[Migration] Bỏ qua migration, tiếp tục với profile hiện tại')
              }
            }
          }

          setProfile(userProfile)
          if (userProfile.familyId) {
            recordDailyLogin(userProfile.id, userProfile.familyId).catch(console.error)
          }
          setError(null)
        }
      } catch (err: any) {
        console.error('[page.tsx] ❌ AUTH INITIALIZATION ERROR:', {
          message: err?.message,
          code: err?.code,
          name: err?.name,
          fullError: err,
          uid: firebaseUser.uid,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        })
        const errorDetail = err?.message || err?.code || String(err)
        const errorType = err?.code === 'permission-denied' ? 'Lỗi quyền truy cập (Permission Denied)' : 'Lỗi tải dữ liệu'
        setError(`${errorType}\n\n🔍 Chi tiết: ${errorDetail}\n\nProject ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '(Auto-detected)'}`)
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    })

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [language, t])

  console.log('[page.tsx] 📺 UI State:', { 
    user: user?.email || 'NONE', 
    profile: profile?.id || 'NONE', 
    loading, 
    error: !!error 
  })

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    const errorBackgroundStyle = backgroundImage
      ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
      : {
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

  // Nếu đã login nhưng chưa có profile hoặc chưa có familyId (ngoại trừ super root)
  if (!profile || (profile.familyId === '' && !profile.isSuperRoot)) {
    return (
      <JoinFamilyFlow
        user={user}
        profile={profile}
        onUpdated={handleProfileUpdate}
        backgroundImage={backgroundImage}
      />
    )
  }

  // Style cho background image
  const backgroundStyle = backgroundImage
    ? {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }
    : {
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    }

  // Super Root Dashboard - hiển thị riêng cho super root
  if (profile.isSuperRoot) {
    return (
      <div className="flex min-h-screen">
        <Sidebar profile={profile} />
        <div className="flex-1 lg:ml-80 transition-all duration-300">
          <BackgroundMusic isLoggedIn={!!user && !!profile} />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <div id="dashboard-section">
              <SuperRootDashboard currentUserId={user.uid} />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={backgroundStyle}>
      <Sidebar profile={profile} onUpdate={handleProfileUpdate} />

      <div className="flex-1 lg:ml-80 transition-all duration-300">
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
                  onUpdate={(updatedProfile) => {
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
