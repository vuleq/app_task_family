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
  // Outfit đã được tắt theo yêu cầu
  // const [showOutfit, setShowOutfit] = useState(true)
  const level = calculateLevel(profile.xp)
  // Đảm bảo characterAvatar luôn có giá trị (mặc định là 1)
  const characterAvatar = profile.characterAvatar || 1
  const assets = getCharacterAssets(level, characterAvatar)
  const xpProgress = getXPProgress(profile.xp)
  
  // Debug log
  console.log('CharacterDisplay Debug:', {
    level,
    characterAvatar,
    characterPath: assets.character,
    outfitPath: assets.outfit,
    backgroundPath: assets.background
  })
  
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-64 h-64',
    large: 'w-96 h-96',
  }
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Character Container */}
      <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden border-4 border-purple-300 shadow-lg`}>
        {/* Background - Layer 1 (dưới cùng) */}
        {assets.background ? (
          <img
            src={assets.background}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 z-0" />
        )}
        
        {/* Base Body - Layer 2a (body chung từ avatarbase.png) - Đã tắt vì có nền làm xấu nhân vật */}
        {/* Nếu cần dùng base body, uncomment phần code dưới và xử lý loại bỏ background */}
        {/* {assets.base && (
          <img
            key={`base-${level}`}
            src={assets.base}
            alt="Base Body"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ 
              zIndex: 5,
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              mixBlendMode: 'multiply',
              filter: 'contrast(1.1)',
              WebkitFilter: 'contrast(1.1)'
            }}
          />
        )} */}
        
        {/* Face - Layer 2b (mặt từ avatar1-7) */}
        {assets.face ? (
          <img
            key={`face-${characterAvatar}-${level}`}
            src={assets.face}
            alt="Face"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ 
              zIndex: 6, // Face ở trên base body
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              console.error('❌ Failed to load face:', assets.face)
              // Fallback về avatar đầy đủ nếu không có face
              if (assets.character) {
                target.src = assets.character
              }
            }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              console.log('✅ Face loaded:', assets.face)
            }}
          />
        ) : (
          // Fallback: Nếu không có face, dùng avatar đầy đủ
          <img
            key={`avatar-${characterAvatar}-${level}`}
            src={assets.character || '/pic-avatar/avatar1.png'}
            alt="Character"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ 
              zIndex: 6,
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              display: 'block',
              opacity: 1,
              visibility: 'visible',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              console.error('❌ Failed to load character avatar:', assets.character)
              if (assets.character !== '/pic-avatar/avatar1.png') {
                target.src = '/pic-avatar/avatar1.png'
              } else {
                target.style.display = 'none'
              }
            }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              console.log('✅ Character avatar loaded (fallback):', assets.character)
            }}
          />
        )}
        
        {/* Outfit - Đã tắt theo yêu cầu */}
        {/* {showOutfit && assets.outfit && (
          <img
            src={assets.outfit}
            alt="Outfit"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ 
              zIndex: 10,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              opacity: 1,
              filter: 'contrast(1.2) saturate(1.1)',
              WebkitFilter: 'contrast(1.2) saturate(1.1)'
            }}
          />
        )} */}
        
        {/* Pet - Layer 4 (pet, trên cùng) */}
        {assets.pet && (
          <img
            src={assets.pet}
            alt="Pet"
            className="absolute bottom-0 right-0 w-1/3 h-1/3 object-contain z-20"
          />
        )}
        
        {/* Level Badge - Layer 5 (badge, trên cùng nhất) */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold z-30 shadow-md">
          Lv.{level}
        </div>
      </div>
      
      {/* Button toggle outfit đã được ẩn - Outfit không còn được sử dụng */}
      
      {/* Level Info */}
      {showLevelInfo && (
        <div className="w-full max-w-xs space-y-2">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">Level {level}</p>
            <p className="text-sm text-gray-600">{profile.xp} XP</p>
          </div>
          
          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{xpProgress.current} / {xpProgress.next} XP</span>
              <span>{Math.round(xpProgress.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, xpProgress.percentage)}%` }}
              ></div>
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
