'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChangedSafe } from '@/lib/firebase/auth'
import { getProfile, createDefaultProfile, updateProfile, UserProfile } from '@/lib/firebase/profile'
import { db as firestoreDb, auth as firebaseAuth } from '@/lib/firebase/config'
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
import RootMemberDashboard from '@/components/RootMemberDashboard'
import { recordDailyLogin } from '@/lib/firebase/loginHistory'
import SuperRootDashboard from '@/components/SuperRootDashboard'
import { useI18n } from '@/lib/i18n/context'

export default function Home() {
  const { t, language } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // Flag ─æß╗â tr├ính tß║ío profile nhiß╗üu lß║ºn
  const creatingProfileRef = useRef(false)
  
  // Random background image
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  
  useEffect(() => {
    // Lß║Ñy danh s├ích background images tß╗½ environment variables
    const backgrounds: string[] = []
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1) {
      backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1)
    }
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2) {
      backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2)
    }
    
    // Random chß╗ìn 1 background
    if (backgrounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * backgrounds.length)
      setBackgroundImage(backgrounds[randomIndex])
    }
  }, [])

  useEffect(() => {
    // Timeout ─æß╗â tr├ính stuck ß╗ƒ loading qu├í l├óu (10 gi├óy)
    const timeoutId = setTimeout(() => {
      console.warn('Loading timeout - forcing loading to false')
      setLoading(false)
    }, 10000)

    const unsubscribe = onAuthStateChangedSafe(async (user) => {
      if (user) {
        try {
          // Kiß╗âm tra Firebase ─æ├ú ─æ╞░ß╗úc khß╗ƒi tß║ío ch╞░a - vß╗¢i retry logic
          let db = null
          let retries = 0
          const maxRetries = 10 // T─âng sß╗æ lß║ºn retry
          
          while (!db && retries < maxRetries) {
            const { db: firestoreDb } = await import('@/lib/firebase/config')
            if (firestoreDb) {
              db = firestoreDb
              break
            }
            // ─Éß╗úi 300ms tr╞░ß╗¢c khi retry (t─âng delay)
            await new Promise(resolve => setTimeout(resolve, 300))
            retries++
          }
          
          if (!db) {
            console.error('Firebase Firestore kh├┤ng khß╗ƒi tß║ío ─æ╞░ß╗úc sau', maxRetries, 'lß║ºn thß╗¡')
            // Kh├┤ng set error ngay, m├á thß╗¡ lß║íi sau 1 gi├óy
            setTimeout(async () => {
              const { db: retryDb } = await import('@/lib/firebase/config')
              if (retryDb) {
                // Retry load profile
                try {
                  setUser(user)
                  let userProfile = await getProfile(user.uid)
                  if (!userProfile) {
                    // Kiß╗âm tra xem ─æang tß║ío profile ch╞░a (tr├ính duplicate calls)
                    if (creatingProfileRef.current) {
                      console.log('[page.tsx] ΓÜá∩╕Å Profile creation already in progress (retry), skipping...')
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
                    
                    // Set flag ─æß╗â tr├ính duplicate calls
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
                  if (userProfile?.familyId) {
                    recordDailyLogin(userProfile.id, userProfile.familyId).catch(console.error)
                  }
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
          // ─Éß╗úi mß╗Öt ch├║t ─æß╗â ─æß║úm bß║úo Firebase ho├án to├án sß║╡n s├áng
          await new Promise(resolve => setTimeout(resolve, 200))
          
        // Create or get profile
        let userProfile = await getProfile(user.uid)
        if (!userProfile) {
            // Kiß╗âm tra xem ─æang tß║ío profile ch╞░a (tr├ính duplicate calls)
            if (creatingProfileRef.current) {
              console.log('[page.tsx] ΓÜá∩╕Å Profile creation already in progress, skipping...')
              return
            }
            
            // Check if user has isRoot, isSuperRoot flag and familyId (stored in localStorage during signup)
            let isRootFromSignup = false
            let isSuperRootFromSignup = false
            let familyIdFromSignup: string | undefined
            if (typeof window !== 'undefined') {
              isRootFromSignup = localStorage.getItem(`signup_isRoot_${user.uid}`) === 'true'
              isSuperRootFromSignup = localStorage.getItem(`signup_isSuperRoot_${user.uid}`) === 'true'
              
              // Retry logic: ─Éß╗ìc familyId vß╗¢i retry v├¼ c├│ thß╗â localStorage ch╞░a sync
              // Thß╗¡ ─æß╗ìc ngay lß║¡p tß╗⌐c tr╞░ß╗¢c
              familyIdFromSignup = localStorage.getItem(`signup_familyId_${user.uid}`) || undefined
              
              // Nß║┐u kh├┤ng t├¼m thß║Ñy, thß╗¡ t├¼m trong tß║Ñt cß║ú keys (c├│ thß╗â userId kh├íc)
              if (!familyIdFromSignup) {
                const allFamilyIdKeys = Object.keys(localStorage).filter(key => key.startsWith('signup_familyId_'))
                // T├¼m key c├│ chß╗⌐a user.uid (c├│ thß╗â c├│ format kh├íc)
                for (const key of allFamilyIdKeys) {
                  if (key.includes(user.uid)) {
                    familyIdFromSignup = localStorage.getItem(key) || undefined
                    if (familyIdFromSignup) {
                      console.log(`[page.tsx] Γ£à Found familyId from alternative key: ${key} = ${familyIdFromSignup}`)
                      break
                    }
                  }
                }
              }
              
              // Nß║┐u vß║½n kh├┤ng t├¼m thß║Ñy, mß╗¢i retry
              let retryCount = 0
              const maxRetries = 5 // Giß║úm sß╗æ lß║ºn retry v├¼ ─æ├ú thß╗¡ t├¼m trong tß║Ñt cß║ú keys
              while (retryCount < maxRetries && !familyIdFromSignup) {
                familyIdFromSignup = localStorage.getItem(`signup_familyId_${user.uid}`) || undefined
                if (!familyIdFromSignup && retryCount < maxRetries - 1) {
                  console.log(`[page.tsx] Retry ${retryCount + 1}/${maxRetries}: familyId not found, waiting 200ms...`)
                  await new Promise(resolve => setTimeout(resolve, 200))
                }
                retryCount++
              }
              
              // Debug: Kiß╗âm tra tß║Ñt cß║ú keys li├¬n quan
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
                // Kiß╗âm tra tß║Ñt cß║ú c├íc familyId keys ─æß╗â t├¼m xem c├│ key n├áo kh├íc kh├┤ng
                allFamilyIdValues: allFamilyIdKeys.map(key => ({
                  key,
                  value: localStorage.getItem(key),
                })),
              })
              
              // Cleanup: X├│a c├íc keys c┼⌐ kh├┤ng c├▓n d├╣ng (tß╗½ c├íc lß║ºn signup tr╞░ß╗¢c)
              if (typeof window !== 'undefined' && allFamilyIdKeys.length > 1) {
                // Giß╗» lß║íi key cß╗ºa user hiß╗çn tß║íi, x├│a c├íc key kh├íc
                const currentUserKey = `signup_familyId_${user.uid}`
                for (const key of allFamilyIdKeys) {
                  if (key !== currentUserKey) {
                    // Kiß╗âm tra xem key n├áy c├│ phß║úi cß╗ºa user kh├íc kh├┤ng (dß╗▒a v├áo userId trong key)
                    const keyUserId = key.replace('signup_familyId_', '')
                    // Chß╗ë x├│a nß║┐u kh├┤ng phß║úi l├á user hiß╗çn tß║íi
                    if (keyUserId !== user.uid) {
                      localStorage.removeItem(key)
                      console.log(`[page.tsx] Cleaned up old localStorage key: ${key}`)
                    }
                  }
                }
              }
              
              if (!familyIdFromSignup && isRootFromSignup) {
                console.error('[page.tsx] ΓÜá∩╕Å ERROR: familyIdFromSignup is undefined but isRootFromSignup is true!')
                console.error('[page.tsx] This will cause createDefaultProfile to create a new family with auto-generated codes.')
                console.error('[page.tsx] All localStorage keys:', allKeys)
                console.error('[page.tsx] All localStorage items:', allKeys.map(key => ({ key, value: localStorage.getItem(key) })))
              }
            }
            
            // Set flag ─æß╗â tr├ính duplicate calls
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
              // Hiß╗ân thß╗ï family code v├á root code nß║┐u c├│
              const familyCode = localStorage.getItem(`signup_familyCode_${user.uid}`)
              const rootCode = localStorage.getItem(`signup_rootCode_${user.uid}`)
              if (familyCode) {
                const message = language === 'vi'
                  ? `≡ƒÄë Gia ─æ├¼nh cß╗ºa bß║ín ─æ├ú ─æ╞░ß╗úc tß║ío!\n\n≡ƒôï M├ú gia ─æ├¼nh (─æß╗â tham gia): ${familyCode}\n≡ƒöÉ M├ú Root (─æß╗â trß╗ƒ th├ánh root): ${rootCode || 'N/A'}\n\n≡ƒÆí H├úy chia sß║╗ m├ú gia ─æ├¼nh vß╗¢i c├íc th├ánh vi├¬n ─æß╗â hß╗ì tham gia. Giß╗» b├¡ mß║¡t m├ú Root!`
                  : `≡ƒÄë Your family has been created!\n\n≡ƒôï Family code (to join): ${familyCode}\n≡ƒöÉ Root code (to become root): ${rootCode || 'N/A'}\n\n≡ƒÆí Share the family code with members to join. Keep the root code secret!`
                alert(message)
                localStorage.removeItem(`signup_familyCode_${user.uid}`)
                localStorage.removeItem(`signup_rootCode_${user.uid}`)
              }
            }
          }
          
          // Migration: Xß╗¡ l├╜ user c┼⌐ ch╞░a c├│ familyId
          if (!userProfile.familyId && !userProfile.isSuperRoot) {
            console.log('[Migration] User c┼⌐ ch╞░a c├│ familyId, ─æang xß╗¡ l├╜...')
            try {
              if (userProfile.isRoot) {
                // Nß║┐u l├á root user c┼⌐, tß╗▒ ─æß╗Öng tß║ío family cho hß╗ì
                const { createFamily } = await import('@/lib/firebase/family')
                const familyName = userProfile.name || user.email?.split('@')[0] || 'Family'
                const result = await createFamily(familyName, user.uid)
                await updateProfile(userProfile.id, { familyId: result.familyId })
                // Get lß║íi profile sau khi update
                userProfile = await getProfile(user.uid)
                if (!userProfile) {
                  throw new Error('Failed to get updated profile')
                }
                // Hiß╗ân thß╗ï th├┤ng b├ío
                if (typeof window !== 'undefined') {
                  alert(language === 'vi' 
                    ? `≡ƒÄë Hß╗ç thß╗æng ─æ├ú tß╗▒ ─æß╗Öng tß║ío gia ─æ├¼nh cho bß║ín! M├ú gia ─æ├¼nh: ${result.familyCode}\n\nH├úy chia sß║╗ m├ú n├áy vß╗¢i c├íc th├ánh vi├¬n kh├íc ─æß╗â hß╗ì c├│ thß╗â tham gia.`
                    : `≡ƒÄë System has automatically created a family for you! Family code: ${result.familyCode}\n\nShare this code with other members so they can join.`)
                }
              } else {
                // Nß║┐u kh├┤ng phß║úi root, vß║½n cho user v├áo app nh╞░ng hiß╗ân thß╗ï cß║únh b├ío
                console.warn('[Migration] User kh├┤ng phß║úi root v├á ch╞░a c├│ familyId')
                if (typeof window !== 'undefined') {
                  localStorage.setItem(`needsJoinFamily_${user.uid}`, 'true')
                }
              }
            } catch (migrationErr: any) {
              console.error('[Migration] Lß╗ùi khi tß║ío family cho user c┼⌐:', migrationErr)
              // Kh├┤ng crash app - vß║½n cho user v├áo vß╗¢i profile hiß╗çn tß║íi
              console.warn('[Migration] Bß╗Å qua migration, tiß║┐p tß╗Ñc vß╗¢i profile hiß╗çn tß║íi')
            }
          }
          
          // ─Éß║úm bß║úo characterAvatar lu├┤n c├│ gi├í trß╗ï (cho user c┼⌐ ch╞░a c├│)
          if (userProfile && !userProfile.characterAvatar) {
            const avatarNumber = (user.uid.charCodeAt(0) % 7) + 1
            userProfile = { ...userProfile, characterAvatar: avatarNumber }
            // Cß║¡p nhß║¡t v├áo database
            try {
              await updateProfile(userProfile.id, { characterAvatar: avatarNumber })
            } catch (err) {
              console.error('Error updating characterAvatar:', err)
            }
        }
        if (userProfile) {
          setProfile(userProfile)
          if (userProfile.familyId) {
            recordDailyLogin(userProfile.id, userProfile.familyId).catch(console.error)
          }
        }
          setError(null)
        } catch (err: any) {
          console.error('Error loading profile:', err)
          // Hiß╗ân thß╗ï lß╗ùi chi tiß║┐t ─æß╗â debug tr├¬n production
          const errorDetail = err?.message || err?.code || String(err)
          setError(`${t('errors.cannotLoadUser')}\n\n≡ƒöì Chi tiß║┐t: ${errorDetail}`)
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
            <div className="text-4xl mb-4">ΓÜá∩╕Å</div>
            <h1 className="text-xl font-bold text-gray-100 mb-4">{t('errors.firebaseNotConfigured')}</h1>
            <p className="text-gray-300 mb-6 whitespace-pre-line">{error}</p>
            
            {/* Debug info */}
            <div className="bg-slate-900/60 border border-slate-600/50 rounded-lg p-3 text-left mb-4">
              <p className="text-xs text-gray-400 mb-1 font-bold">≡ƒöì Debug Status:</p>
              <ul className="text-xs text-gray-500 space-y-0.5 font-mono">
                <li>Auth: {firebaseAuth ? 'Γ£à' : 'Γ¥î'} | DB: {firestoreDb ? 'Γ£à' : 'Γ¥î'}</li>
                <li>User: {user ? `Γ£à ${user.email}` : 'Γ¥î not logged in'}</li>
              </ul>
            </div>

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

  // Super Root Dashboard - hiß╗ân thß╗ï ri├¬ng cho super root
  if (profile.isSuperRoot) {
    return (
      <div 
        className="min-h-screen"
        style={backgroundStyle}
      >
        <BackgroundMusic isLoggedIn={!!user && !!profile} />
        <Header profile={profile} />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <SuperRootDashboard currentUserId={user.uid} profile={profile} />
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
      
      {/* Header vß╗¢i th├┤ng tin c├í nh├ón ß╗ƒ g├│c tr├¬n b├¬n tr├íi */}
      <Header profile={profile} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cß╗Öt tr├íi - C├íc t├¡nh n─âng ch├¡nh */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dashboard theo d├╡i th├ánh vi├¬n - chß╗ë hiß╗ân thß╗ï cho root user */}
            {profile.isRoot && !profile.isSuperRoot && (
              <RootMemberDashboard
                currentUserId={user.uid}
                familyId={profile.familyId}
                profile={profile}
              />
            )}

            {/* Danh s├ích nhiß╗çm vß╗Ñ */}
            <div className="bg-slate-800/90 rounded-lg shadow-xl p-6 border border-slate-700/50">
              <TasksList 
                currentUser={user} 
                profile={profile}
                onTaskComplete={handleProfileUpdate}
              />
        </div>

            {/* Ph├¬ duyß╗çt nhiß╗çm vß╗Ñ */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
              <TaskApproval 
                currentUserId={user.uid}
                currentUserRole={profile.role}
                familyId={profile.familyId}
                onApprovalComplete={handleProfileUpdate}
              />
            </div>

            {/* Cß╗¡a h├áng ─æß╗òi th╞░ß╗ƒng */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
              <RewardsShop 
                currentUserId={user.uid}
                profile={profile}
                onPurchaseComplete={handleProfileUpdate}
              />
            </div>

            {/* Hß╗ç thß╗æng R╞░╞íng */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-slate-700/50">
              <ChestSystem 
                currentUserId={user.uid}
                profile={profile}
                onChestOpened={handleProfileUpdate}
              />
            </div>
          </div>

          {/* Cß╗Öt phß║úi - Profile v├á c├íc t├¡nh n─âng phß╗Ñ */}
          <div className="space-y-6">
            {/* Statistics */}
            <Statistics currentUserId={user.uid} profile={profile} />
            
            {/* Task Monitoring - Chß╗ë hiß╗ân thß╗ï cho root user */}
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

