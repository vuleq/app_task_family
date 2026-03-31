'use client'

import { UserProfile } from '@/lib/firebase/profile'
import { calculateLevel, getCharacterAssets, getXPProgress } from '@/lib/utils/level'

interface CharacterDisplayProps {
  profile: UserProfile
  size?: 'small' | 'medium' | 'large'
  showLevelInfo?: boolean
}

export default function CharacterDisplay({ 
  profile, 
  size = 'medium',
  showLevelInfo = true 
}: CharacterDisplayProps) {
  const level = calculateLevel(profile.xp)
  const assets = getCharacterAssets(
    level, 
    profile.characterBase,
    profile.gender, 
    profile.profession
  )
  const xpProgress = getXPProgress(profile.xp)
  
  const sizeClasses = {
    small: 'w-24 h-24 sm:w-32 sm:h-32',
    medium: 'w-48 h-48 sm:w-64 sm:h-64 max-w-full',
    large: 'w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 max-w-full',
  }
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Character Container */}
      <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden border-4 border-purple-300 shadow-lg`}>
        {/* Background */}
        {assets.background ? (
          <img
            src={assets.background}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 z-0" />
        )}

        {/* Character avatar */}
        <img
          key={`avatar-${profile.characterBase || 'default'}-${level}`}
          src={assets.character || '/pic-avatar/avatar1.png'}
          alt="Character"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ zIndex: 6, pointerEvents: 'none' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== window.location.origin + '/pic-avatar/avatar1.png') {
              target.src = '/pic-avatar/avatar1.png'
            }
          }}
        />

        {/* Pet */}
        {assets.pet && (
          <img
            src={assets.pet}
            alt="Pet"
            className="absolute bottom-0 right-0 w-1/3 h-1/3 object-contain z-20"
          />
        )}
        
        {/* Level Badge */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold z-30 shadow-md">
          Lv.{level}
        </div>
      </div>
      
      {/* Level Info */}
      {showLevelInfo && (
        <div className="w-full max-w-xs space-y-2">
          <div className="text-center">
            <p className="text-lg font-semibold text-violet-800">Level {level}</p>
            <p className="text-sm text-violet-600 font-medium">{profile.xp} XP</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span className="font-medium">{xpProgress.current} / {xpProgress.next} XP</span>
              <span className="font-medium text-violet-600">{Math.round(xpProgress.percentage)}%</span>
            </div>
            <div className="w-full bg-violet-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, xpProgress.percentage)}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500">
              Cần {xpProgress.next - xpProgress.current} XP để lên Level {level + 1}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
