'use client'

import { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import { calculateLevel, getCharacterAssets, getXPProgress, getAssetLevel } from '@/lib/utils/level'

// Professions that have static images
const STATIC_PROFESSIONS = ['bs', 'ch', 'cs']

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
  const assets = getCharacterAssets(level, profile.characterBase, profile.gender, profile.profession)
  const xpProgress = getXPProgress(profile.xp)

  // For new professions, we need to generate/fetch the avatar
  const needsGenerated = !!(
    profile.profession &&
    profile.gender &&
    level >= 5 &&
    !STATIC_PROFESSIONS.includes(profile.profession)
  )

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!needsGenerated) return
    const assetLevel = getAssetLevel(level)
    const cacheKey = `avatar_${profile.gender}_${profile.profession}_level${assetLevel}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      setGeneratedUrl(cached)
      return
    }
    setGenerating(true)
    fetch('/api/generate-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: profile.gender, profession: profile.profession, level: assetLevel }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          setGeneratedUrl(data.url)
          sessionStorage.setItem(cacheKey, data.url)
        }
      })
      .catch(console.error)
      .finally(() => setGenerating(false))
  }, [needsGenerated, profile.gender, profile.profession, level])

  const characterSrc = needsGenerated
    ? (generatedUrl || assets.character || '/pic-avatar/avatar1.png')
    : (assets.character || '/pic-avatar/avatar1.png')
  
  const sizeClasses = {
    small: 'w-24 h-24 sm:w-32 sm:h-32',
    medium: 'w-48 h-48 sm:w-64 sm:h-64 max-w-full',
    large: 'w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 max-w-full',
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
        
        {/* Generated avatar for new professions (phi, hk, it) */}
        {needsGenerated && (
          generating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60">
              <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-violet-500 font-bold">Đang tạo nhân vật...</span>
            </div>
          ) : generatedUrl ? (
            <img
              key={`generated-${profile.profession}-${level}`}
              src={generatedUrl}
              alt="Character"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: 6, pointerEvents: 'none' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/pic-avatar/avatar1.png' }}
            />
          ) : null
        )}

        {/* Face/character layer - only show for static professions */}
        {!needsGenerated && (assets.face ? (
          <img
            key={`face-${profile.characterBase || 'default'}-${level}`}
            src={assets.face}
            alt="Face"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ zIndex: 6, pointerEvents: 'none', width: '100%', height: '100%', display: 'block', opacity: 1, visibility: 'visible', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (assets.character) target.src = assets.character
            }}
          />
        ) : (
          // Fallback: Nếu không có face, dùng avatar đầy đủ
          <img
            key={`avatar-${profile.characterBase || 'default'}-${level}`}
            src={assets.character || '/pic-avatar/avatar1.png'}
            alt="Character"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ zIndex: 6, pointerEvents: 'none', width: '100%', height: '100%', display: 'block', opacity: 1, visibility: 'visible', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (assets.character !== '/pic-avatar/avatar1.png') {
                target.src = '/pic-avatar/avatar1.png'
              } else {
                target.style.display = 'none'
              }
            }}
          />
        ))}
        
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
            <p className="text-lg font-semibold text-violet-800">Level {level}</p>
            <p className="text-sm text-violet-600 font-medium">{profile.xp} XP</p>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span className="font-medium">{xpProgress.current} / {xpProgress.next} XP</span>
              <span className="font-medium text-violet-600">{Math.round(xpProgress.percentage)}%</span>
            </div>
            <div className="w-full bg-violet-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-500 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/50"
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
