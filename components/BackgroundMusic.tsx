'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n/context'

interface BackgroundMusicProps {
  isLoggedIn: boolean
}

export default function BackgroundMusic({ isLoggedIn }: BackgroundMusicProps) {
  const { language } = useI18n()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.35) // 35% volume - vừa đủ nghe
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('bgMusicVolume')
      const savedMuted = localStorage.getItem('bgMusicMuted')
      const savedPlaying = localStorage.getItem('bgMusicPlaying')

      if (savedVolume) {
        setVolume(parseFloat(savedVolume))
      }
      if (savedMuted === 'true') {
        setIsMuted(true)
      }
      if (savedPlaying === 'true' && isLoggedIn) {
        setIsPlaying(true)
      }
    }
  }, [isLoggedIn])

  // Auto-play when logged in (after user interaction)
  useEffect(() => {
    if (isLoggedIn && audioRef.current) {
      // Đảm bảo audio đã load
      const setupAudio = () => {
        if (!audioRef.current) return
        
        // Set volume và muted state
        audioRef.current.volume = isMuted ? 0 : volume
        audioRef.current.muted = isMuted
        
        // Kiểm tra localStorage để xem user có muốn play không
        const shouldPlay = localStorage.getItem('bgMusicPlaying') !== 'false'
        
        if (shouldPlay && !isMuted) {
          // Thử play - nếu browser block autoplay thì sẽ catch
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true)
                console.log('Background music started')
              })
              .catch((err) => {
                // Browser may block autoplay, user will need to click
                console.log('Autoplay blocked, waiting for user interaction:', err)
                setIsPlaying(false)
              })
          }
        }
      }
      
      // Chờ một chút để đảm bảo audio đã load
      const timer = setTimeout(setupAudio, 500)
      
      // Cũng thử setup khi audio đã load
      if (audioRef.current) {
        audioRef.current.addEventListener('loadeddata', setupAudio)
      }

      return () => {
        clearTimeout(timer)
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadeddata', setupAudio)
        }
      }
    } else if (!isLoggedIn && audioRef.current) {
      // Pause khi logout
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [isLoggedIn, isMuted, volume])

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return

    setHasInteracted(true)
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      localStorage.setItem('bgMusicPlaying', 'false')
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err)
      })
      setIsPlaying(true)
      localStorage.setItem('bgMusicPlaying', 'true')
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    localStorage.setItem('bgMusicVolume', newVolume.toString())
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return

    const newMuted = !isMuted
    setIsMuted(newMuted)
    
    if (newMuted) {
      audioRef.current.volume = 0
      localStorage.setItem('bgMusicMuted', 'true')
    } else {
      audioRef.current.volume = volume
      localStorage.setItem('bgMusicMuted', 'false')
    }
  }

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume
    }
  }, [volume, isMuted])

  // Handle audio ended (loop)
  const handleEnded = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.error('Error replaying audio:', err)
      })
    }
  }

  if (!isLoggedIn) {
    return null
  }

  // Nhạc nền dễ chịu - có thể thay đổi URL này
  // Sử dụng nhạc miễn phí từ các nguồn như:
  // - Pixabay: https://pixabay.com/music/
  // - Free Music Archive: https://freemusicarchive.org/
  // - Hoặc upload lên Cloudinary
  const musicUrl = process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL || 
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Placeholder - thay bằng URL thực tế

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-3 border border-gray-200">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
          title={isPlaying ? (language === 'vi' ? 'Tạm dừng' : 'Pause') : (language === 'vi' ? 'Phát' : 'Play')}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
            title={isMuted ? (language === 'vi' ? 'Bật tiếng' : 'Unmute') : (language === 'vi' ? 'Tắt tiếng' : 'Mute')}
          >
            {isMuted || volume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            title={language === 'vi' ? `Âm lượng: ${Math.round(volume * 100)}%` : `Volume: ${Math.round(volume * 100)}%`}
          />
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          onEnded={handleEnded}
          onPlay={() => {
            setIsPlaying(true)
            localStorage.setItem('bgMusicPlaying', 'true')
          }}
          onPause={() => {
            setIsPlaying(false)
            localStorage.setItem('bgMusicPlaying', 'false')
          }}
          onError={(e) => {
            console.error('Error loading background music:', e)
            setIsPlaying(false)
          }}
        />
      </div>
    </div>
  )
}

