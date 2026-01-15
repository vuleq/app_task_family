'use client'

import { useState, useEffect, useCallback } from 'react'
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
    <header className="bg-slate-800/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Thông tin cá nhân bên trái */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 overflow-hidden flex items-center justify-center flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg text-white font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">{profile.name}</h2>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-primary-300 font-medium">XP: {profile.xp}</span>
                <span className="text-yellow-400 font-medium">Coins: {profile.coins}</span>
              </div>
            </div>
          </div>

          {/* Logo/Title ở giữa */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-100">{t('login.title')}</h1>
            {familyInfo && (
              <p className="text-sm text-primary-300 mt-1">👨‍👩‍👧‍👦 {familyInfo.name}</p>
            )}
          </div>

          {/* Nút chuyển đổi ngôn ngữ và đăng xuất bên phải */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-3 py-1.5 text-sm border border-slate-600 text-gray-200 rounded-lg font-medium hover:bg-slate-700/50 transition-colors flex items-center justify-center space-x-1.5 min-w-[70px]"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <span className="text-base leading-none">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
              <span className="leading-none">{language === 'vi' ? 'VI' : 'EN'}</span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border border-red-500/50 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
            >
              {t('header.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

