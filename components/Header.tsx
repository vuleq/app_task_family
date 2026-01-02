'use client'

import { UserProfile } from '@/lib/firebase/profile'
import { logout } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

interface HeaderProps {
  profile: UserProfile
}

export default function Header({ profile }: HeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

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
    <header className="bg-white shadow-md sticky top-0 z-50">
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
              <h2 className="text-lg font-bold text-gray-800">{profile.name}</h2>
              {/* Ẩn XP và Coins cho public version */}
              {/* <div className="flex items-center space-x-3 text-sm">
                <span className="text-primary-600 font-medium">XP: {profile.xp}</span>
                <span className="text-yellow-600 font-medium">Coins: {profile.coins}</span>
              </div> */}
            </div>
          </div>

          {/* Logo/Title ở giữa */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-800">{t('login.title')}</h1>
          </div>

          {/* Nút đăng xuất bên phải */}
          <div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              {t('header.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

