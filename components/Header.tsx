'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import { logout } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { getFamilyById, Family } from '@/lib/firebase/family'

interface HeaderProps {
  profile: UserProfile
}

export default function Header({ profile }: HeaderProps) {
  const router = useRouter()
  const { t, language, setLanguage } = useI18n()
  const [familyInfo, setFamilyInfo] = useState<Family | null>(null)
  
  // Load family info để hiển thị family name
  const loadFamilyInfo = useCallback(async () => {
    if (!profile.familyId) return
    try {
      const family = await getFamilyById(profile.familyId)
      setFamilyInfo(family)
    } catch (error) {
      console.error('Error loading family info in Header:', error)
    }
  }, [profile.familyId])
  
  useEffect(() => {
    if (profile.familyId) {
      loadFamilyInfo()
    }
  }, [profile.familyId, loadFamilyInfo])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error: any) {
      console.error('Error logging out:', error)
      // Logout error sẽ được xử lý tự động bởi redirect
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b-4 border-indigo-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* User Info Left */}
          <div className="flex items-center gap-4 bg-indigo-50/50 p-2 pr-6 rounded-full border-2 border-white shadow-soft transition-transform hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 overflow-hidden flex items-center justify-center flex-shrink-0 border-4 border-white shadow-soft relative group">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              ) : (
                <span className="text-xl text-white font-black">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-indigo-900 leading-none mb-1 uppercase tracking-tight">{profile.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white text-indigo-600 px-2 py-0.5 rounded-full font-black border border-indigo-100">✨ {profile.xp}</span>
                <span className="text-[10px] bg-white text-amber-600 px-2 py-0.5 rounded-full font-black border border-amber-100">🪙 {profile.coins}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
             <div className="flex items-center gap-2 mb-0.5">
               <span className="text-2xl animate-bounce-slow">🚀</span>
               <h1 className="text-xl sm:text-2xl font-black text-indigo-900 tracking-tight uppercase">{t('login.title')}</h1>
             </div>
            {familyInfo && (
              <div className="flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-indigo-200" />
                 <p className="text-[10px] text-indigo-300 font-black tracking-[0.2em] uppercase">{t('profile.familyName') || 'FAMILY'}: {familyInfo.name}</p>
                 <span className="w-1 h-1 rounded-full bg-indigo-200" />
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="btn-playful hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-50 text-indigo-600 rounded-2xl font-black text-xs shadow-soft hover:bg-indigo-50 active:scale-95 transition-all"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <span>{language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="btn-playful px-5 py-2.5 bg-red-50 text-red-500 rounded-2xl font-black text-xs hover:bg-red-100 active:scale-95 transition-all border-2 border-red-100 shadow-soft"
            >
              🚪 {t('header.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

