'use client'

import { useEffect, useState, useRef } from 'react'
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
import BackgroundMusic from '@/components/BackgroundMusic'
import Statistics from '@/components/Statistics'
import TaskMonitoring from '@/components/TaskMonitoring'
import SuperRootDashboard from '@/components/SuperRootDashboard'
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

    const unsubscribe = onAuthStateChangedSafe(async (user) => {
      if (user) {
        try {
          // Kiểm tra Firebase đã được khởi tạo chưa - với retry logic
          let db = null
          let retries = 0
          const maxRetries = 10 // Tăng số lần retry
          
          while (!db && retries < maxRetries) {
            const { db: firestoreDb } = await import('@/lib/firebase/config')
            if (firestoreDb) {
              db = firestoreDb
              break
            }
            // Đợi 300ms trước khi retry (tăng delay)
            await new Promise(resolve => setTimeout(resolve, 300))
            retries++
          }
          
          if (!db) {
            console.error('Firebase Firestore không khởi tạo được sau', maxRetries, 'lần thử')
            // Không set error ngay, mà thử lại sau 1 giây
            setTimeout(async () => {
              const { db: retryDb } = await import('@/lib/firebase/config')
              if (retryDb) {
                // Retry load profile
                try {
                  setUser(user)
                  let userProfile = await getProfile(user.uid)
                  if (!userProfile) {
                    // Kiểm tra xem đang tạo profile chưa (tránh duplicate calls)
                    if (creatingProfileRef.current) {
                      console.log('[page.tsx] ⚠️ Profile creation already in progress (retry), skipping...')
                      return
                    }
                    
                    const isRootFromSignup = typeof window !== 'undefined' && localStorage.getItem(`signup_isRoot_${user.uid}`) === 'true'
                    const isSuperRootFromSignup = typeof window !== 'undefined' && localStorage.getItem(`signup_isSuperRoot_${user.uid}`) === 'true'
                    
                    // Retry logic cho familyId
                    let familyIdFromSignup: string | undefined
                    if (typeof window !== 'undefined') {
                      let retryCount = 0
                      const maxRetries = 5
                      while (retryCount < maxRetries && !familyIdFromSignup) {
                        familyIdFromSignup = localStorage.getItem(`signup_familyId_${user.uid}`) || undefined
                        if (!familyIdFromSignup && retryCount < maxRetries - 1) {
                          await new Promise(resolve => setTimeout(resolve, 200))
                        }
                        retryCount++
                      }
                      console.log('[page.tsx] Retry flow - familyIdFromSignup:', familyIdFromSignup)
                    }
                    
                    // Set flag để tránh duplicate calls
                    creatingProfileRef.current = true
                    try {
                      userProfile = await createDefaultProfile(user, isRootFromSignup, familyIdFromSignup, isSuperRootFromSignup)
                    } finally {
                      creatingProfileRef.current = false
                    }
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem(`signup_isRoot_${user.uid}`)
                      localStorage.removeItem(`signup_isSuperRoot_${user.uid}`)
                      localStorage.removeItem(`signup_familyId_${user.uid}`)
                    }
                  }
                  setProfile(userProfile)
                  setError(null)
                  setLoading(false)
                } catch (err) {
                  console.error('Error retrying profile load:', err)
                }
              } else {
                setError(t('errors.cannotLoadUser'))
                setLoading(false)
              }
            }, 1000)
            return
          }
          
        setUser(user)
          // Đợi một chút để đảm bảo Firebase hoàn toàn sẵn sàng
          await new Promise(resolve => setTimeout(resolve, 200))
          
        // Create or get profile
        let userProfile = await getProfile(user.uid)
        if (!userProfile) {
            // Kiểm tra xem đang tạo profile chưa (tránh duplicate calls)
            if (creatingProfileRef.current) {
              console.log('[page.tsx] ⚠️ Profile creation already in progress, skipping...')
              return
            }
            
            // Check if user has isRoot, isSuperRoot flag and familyId (stored in localStorage during signup)
            let isRootFromSignup = false
            let isSuperRootFromSignup = false
            let familyIdFromSignup: string | undefined
            if (typeof window !== 'undefined') {
              isRootFromSignup = localStorage.getItem(`signup_isRoot_${user.uid}`) === 'true'
              isSuperRootFromSignup = localStorage.getItem(`signup_isSuperRoot_${user.uid}`) === 'true'
              
              // Retry logic: Đọc familyId với retry vì có thể localStorage chưa sync
              // Thử đọc ngay lập tức trước
              familyIdFromSignup = localStorage.getItem(`signup_familyId_${user.uid}`) || undefined
              
              // Nếu không tìm thấy, thử tìm trong tất cả keys (có thể userId khác)
              if (!familyIdFromSignup) {
                const allFamilyIdKeys = Object.keys(localStorage).filter(key => key.startsWith('signup_familyId_'))
                // Tìm key có chứa user.uid (có thể có format khác)
                for (const key of allFamilyIdKeys) {
                  if (key.includes(user.uid)) {
                    familyIdFromSignup = localStorage.getItem(key) || undefined
                    if (familyIdFromSignup) {
                      console.log(`[page.tsx] ✅ Found familyId from alternative key: ${key} = ${familyIdFromSignup}`)
                      break
                    }
                  }
                }
              }
              
              // Nếu vẫn không tìm thấy, mới retry
              let retryCount = 0
              const maxRetries = 5 // Giảm số lần retry vì đã thử tìm trong tất cả keys
              while (retryCount < maxRetries && !familyIdFromSignup) {
                familyIdFromSignup = localStorage.getItem(`signup_familyId_${user.uid}`) || undefined
                if (!familyIdFromSignup && retryCount < maxRetries - 1) {
                  console.log(`[page.tsx] Retry ${retryCount + 1}/${maxRetries}: familyId not found, waiting 200ms...`)
                  await new Promise(resolve => setTimeout(resolve, 200))
                }
                retryCount++
              }
              
              // Debug: Kiểm tra tất cả keys liên quan
              const allKeys = Object.keys(localStorage).filter(key => key.includes(user.uid) || key.includes('signup'))
              const allFamilyIdKeys = Object.keys(localStorage).filter(key => key.includes('signup_familyId'))
              
              console.log('[page.tsx] Reading from localStorage:', {
                userId: user.uid,
                isRootFromSignup,
                isSuperRootFromSignup,
                familyIdFromSignup,
                allSignupKeys: allKeys,
                allFamilyIdKeys: allFamilyIdKeys,
                familyIdValue: localStorage.getItem(`signup_familyId_${user.uid}`),
                retries: retryCount,
                // Kiểm tra tất cả các familyId keys để tìm xem có key nào khác không
                allFamilyIdValues: allFamilyIdKeys.map(key => ({
                  key,
                  value: localStorage.getItem(key),
                })),
              })
              
              // Cleanup: Xóa các keys cũ không còn dùng (từ các lần signup trước)
              if (typeof window !== 'undefined' && allFamilyIdKeys.length > 1) {
                // Giữ lại key của user hiện tại, xóa các key khác
                const currentUserKey = `signup_familyId_${user.uid}`
                for (const key of allFamilyIdKeys) {
                  if (key !== currentUserKey) {
                    // Kiểm tra xem key này có phải của user khác không (dựa vào userId trong key)
                    const keyUserId = key.replace('signup_familyId_', '')
                    // Chỉ xóa nếu không phải là user hiện tại
                    if (keyUserId !== user.uid) {
                      localStorage.removeItem(key)
                      console.log(`[page.tsx] Cleaned up old localStorage key: ${key}`)
                    }
                  }
                }
              }
              
              if (!familyIdFromSignup && isRootFromSignup) {
                console.error('[page.tsx] ⚠️ ERROR: familyIdFromSignup is undefined but isRootFromSignup is true!')
                console.error('[page.tsx] This will cause createDefaultProfile to create a new family with auto-generated codes.')
                console.error('[page.tsx] All localStorage keys:', allKeys)
                console.error('[page.tsx] All localStorage items:', allKeys.map(key => ({ key, value: localStorage.getItem(key) })))
              }
            }
            
            // Set flag để tránh duplicate calls
            creatingProfileRef.current = true
            try {
              userProfile = await createDefaultProfile(user, isRootFromSignup, familyIdFromSignup, isSuperRootFromSignup)
            } finally {
              creatingProfileRef.current = false
            }
            // Clean up localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`signup_isRoot_${user.uid}`)
              localStorage.removeItem(`signup_isSuperRoot_${user.uid}`)
              localStorage.removeItem(`signup_familyId_${user.uid}`)
              // Hiển thị family code và root code nếu có
              const familyCode = localStorage.getItem(`signup_familyCode_${user.uid}`)
              const rootCode = localStorage.getItem(`signup_rootCode_${user.uid}`)
              if (familyCode) {
                const message = language === 'vi'
                  ? `🎉 Gia đình của bạn đã được tạo!\n\n📋 Mã gia đình (để tham gia): ${familyCode}\n🔐 Mã Root (để trở thành root): ${rootCode || 'N/A'}\n\n💡 Hãy chia sẻ mã gia đình với các thành viên để họ tham gia. Giữ bí mật mã Root!`
                  : `🎉 Your family has been created!\n\n📋 Family code (to join): ${familyCode}\n🔐 Root code (to become root): ${rootCode || 'N/A'}\n\n💡 Share the family code with members to join. Keep the root code secret!`
                alert(message)
                localStorage.removeItem(`signup_familyCode_${user.uid}`)
                localStorage.removeItem(`signup_rootCode_${user.uid}`)
              }
            }
          }
          
          // Migration: Xử lý user cũ chưa có familyId
          if (!userProfile.familyId) {
            console.log('[Migration] User cũ chưa có familyId, đang xử lý...')
            if (userProfile.isRoot) {
              // Nếu là root user cũ, tự động tạo family cho họ
              const { createFamily } = await import('@/lib/firebase/family')
              const familyName = userProfile.name || user.email?.split('@')[0] || 'Family'
              const result = await createFamily(familyName, user.uid)
              await updateProfile(userProfile.id, { familyId: result.familyId })
              // Get lại profile sau khi update
              userProfile = await getProfile(user.uid)
              if (!userProfile) {
                throw new Error('Failed to get updated profile')
              }
              // Hiển thị thông báo
              if (typeof window !== 'undefined') {
                alert(language === 'vi' 
                  ? `🎉 Hệ thống đã tự động tạo gia đình cho bạn! Mã gia đình: ${result.familyCode}\n\nHãy chia sẻ mã này với các thành viên khác để họ có thể tham gia.`
                  : `🎉 System has automatically created a family for you! Family code: ${result.familyCode}\n\nShare this code with other members so they can join.`)
              }
            } else {
              // Nếu không phải root, yêu cầu join family
              // Lưu flag để hiển thị UI join family
              if (typeof window !== 'undefined') {
                localStorage.setItem(`needsJoinFamily_${user.uid}`, 'true')
              }
              // Tạm thời set error để hiển thị thông báo
              setError(language === 'vi' 
                ? '⚠️ Bạn cần tham gia một gia đình để tiếp tục sử dụng. Vui lòng liên hệ người quản trị (Root) để lấy mã gia đình.'
                : '⚠️ You need to join a family to continue. Please contact your admin (Root) to get the family code.')
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
          clearTimeout(timeoutId)
        }
      } else {
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
        clearTimeout(timeoutId)
      }
    })

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

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
        className="min-h-screen flex items-center justify-center p-4"
        style={errorBackgroundStyle}
      >
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-md w-full border border-slate-700/50">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-100 mb-4">{t('errors.firebaseNotConfigured')}</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-200 mb-2"><strong>{t('errors.toFix')}</strong></p>
              <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1">
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
        background: 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42))',
      }

  // Super Root Dashboard - hiển thị riêng cho super root
  if (profile.isSuperRoot) {
    return (
      <div 
        className="min-h-screen"
        style={backgroundStyle}
      >
        <BackgroundMusic isLoggedIn={!!user && !!profile} />
        <Header profile={profile} />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <SuperRootDashboard currentUserId={user.uid} />
        </main>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={backgroundStyle}
    >
      {/* Background Music */}
      <BackgroundMusic isLoggedIn={!!user && !!profile} />
      
      {/* Header với thông tin cá nhân ở góc trên bên trái */}
      <Header profile={profile} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái - Các tính năng chính */}
          <div className="lg:col-span-2 space-y-6">
            {/* Danh sách nhiệm vụ */}
            <div className="bg-slate-800/90 rounded-lg shadow-xl p-6 border border-slate-700/50">
              <TasksList 
                currentUser={user} 
                profile={profile}
                onTaskComplete={handleProfileUpdate}
              />
        </div>

            {/* Phê duyệt nhiệm vụ */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
              <TaskApproval 
                currentUserId={user.uid}
                currentUserRole={profile.role}
                familyId={profile.familyId}
                onApprovalComplete={handleProfileUpdate}
              />
            </div>

            {/* Cửa hàng đổi thưởng */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
              <RewardsShop 
                currentUserId={user.uid}
                profile={profile}
                onPurchaseComplete={handleProfileUpdate}
              />
            </div>

            {/* Hệ thống Rương */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
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
            <Statistics currentUserId={user.uid} profile={profile} />
            
            {/* Task Monitoring - Chỉ hiển thị cho root user */}
            {profile.isRoot && (
              <TaskMonitoring currentUserId={user.uid} profile={profile} />
            )}
            
            {/* Profile Management */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
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

