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
  
  // Load currentTrackIndex từ localStorage để nhớ bài đang nghe
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedIndex = localStorage.getItem('bgMusicCurrentTrackIndex')
      if (savedIndex !== null) {
        const index = parseInt(savedIndex, 10)
        if (!isNaN(index) && index >= 0) {
          return index
        }
      }
    }
    return 0 // Mặc định bắt đầu từ bài 1 (index 0)
  })
  
  // Tạo playlist từ environment variables
  // Hỗ trợ nhiều cách:
  // 1. NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST (comma-separated URLs) - Ưu tiên cao nhất
  // 2. NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1, URL_2, ... (multiple URLs) - Ưu tiên thứ 2
  // 3. NEXT_PUBLIC_BACKGROUND_MUSIC_URL (single URL - backward compatible) - Ưu tiên thứ 3
  const getPlaylist = (): string[] => {
    const playlist: string[] = []
    
    // Debug: Log tất cả environment variables liên quan đến music
    if (typeof window !== 'undefined') {
      console.log('[BackgroundMusic] Debug - Checking environment variables:')
      console.log('  NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST:', process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST)
      console.log('  NEXT_PUBLIC_BACKGROUND_MUSIC_URL:', process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL)
      console.log('  NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1:', process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL_1)
      console.log('  NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2:', process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL_2)
    }
    
    // Cách 1: Playlist từ biến comma-separated (Ưu tiên cao nhất)
    const playlistEnv = process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_PLAYLIST
    if (playlistEnv) {
      const urls = playlistEnv.split(',').map(url => {
        let cleanUrl = url.trim()
        // Loại bỏ dấu ngoặc kép nếu có
        if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
          cleanUrl = cleanUrl.slice(1, -1)
        }
        if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) {
          cleanUrl = cleanUrl.slice(1, -1)
        }
        return cleanUrl
      }).filter(url => url.length > 0)
      if (urls.length > 0) {
        console.log('[BackgroundMusic] Using PLAYLIST:', urls.length, 'tracks')
        return urls
      }
    }
    
    // Cách 1.5: Single URL (ưu tiên thứ 2 - nếu có single URL thì dùng luôn, không cần tìm URL_X)
    const singleUrl = process.env.NEXT_PUBLIC_BACKGROUND_MUSIC_URL
    if (singleUrl && singleUrl.trim().length > 0) {
      // Loại bỏ dấu ngoặc kép nếu có
      let cleanUrl = singleUrl.trim()
      if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
        cleanUrl = cleanUrl.slice(1, -1)
      }
      if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) {
        cleanUrl = cleanUrl.slice(1, -1)
      }
      if (cleanUrl.length > 0) {
        console.log('[BackgroundMusic] Using single URL')
        return [cleanUrl]
      }
    }
    
    // Cách 2: Nhiều biến URL_1, URL_2, ... (Ưu tiên thứ 3)
    // Tìm tất cả URL_X có sẵn (không cần bắt đầu từ 1)
    const urlKeys: number[] = []
    let index = 1
    // Tìm tất cả các URL_X có sẵn
    while (index <= 20) { // Giới hạn tối đa 20 bài để tránh vòng lặp vô hạn
      const envKey = `NEXT_PUBLIC_BACKGROUND_MUSIC_URL_${index}`
      const url = process.env[envKey]
      if (url && url.trim().length > 0) {
        // Loại bỏ dấu ngoặc kép nếu có (để tương thích với format có dấu ngoặc kép)
        let cleanUrl = url.trim()
        if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
          cleanUrl = cleanUrl.slice(1, -1)
        }
        if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) {
          cleanUrl = cleanUrl.slice(1, -1)
        }
        if (cleanUrl.length > 0) {
          urlKeys.push(index)
          playlist.push(cleanUrl)
          console.log(`[BackgroundMusic] Found ${envKey}:`, cleanUrl.substring(0, 50) + '...')
        }
      }
      index++
    }
    
    // Nếu tìm thấy ít nhất 1 URL_X, dùng playlist này
    if (playlist.length > 0) {
      console.log('[BackgroundMusic] Using URL_X playlist:', playlist.length, 'tracks', urlKeys)
      return playlist
    }
    
    // Fallback nếu không có gì
    console.warn('[BackgroundMusic] No music URL found, using fallback')
    return ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3']
  }
  
  const playlist = getPlaylist()
  const currentTrack = playlist[currentTrackIndex] || playlist[0]

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

  // Handle audio ended - chuyển sang bài tiếp theo hoặc loop lại
  // Logic: Phát theo thứ tự tuần tự (Bài 1 → Bài 2 → ... → Bài cuối → Bài 1)
  const handleEnded = () => {
    if (!audioRef.current || !isPlaying) return
    
    // Nếu có nhiều bài trong playlist, chuyển sang bài tiếp theo theo thứ tự
    if (playlist.length > 1) {
      // Tính index bài tiếp theo: (index hiện tại + 1) % số lượng bài
      // Ví dụ: 3 bài, đang ở bài 2 (index=1) → (1+1) % 3 = 2 (bài 3)
      //        Đang ở bài 3 (index=2) → (2+1) % 3 = 0 (quay lại bài 1)
      const nextIndex = (currentTrackIndex + 1) % playlist.length
      console.log(`[BackgroundMusic] Track ${currentTrackIndex + 1} ended, moving to track ${nextIndex + 1}`)
      setCurrentTrackIndex(nextIndex)
      // Lưu vào localStorage để nhớ bài đang nghe (khi logout/login lại sẽ tiếp tục từ đây)
      localStorage.setItem('bgMusicCurrentTrackIndex', nextIndex.toString())
      // Audio src sẽ được update tự động qua useEffect
    } else {
      // Nếu chỉ có 1 bài, loop lại (phát lại từ đầu)
      console.log('[BackgroundMusic] Single track ended, looping...')
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.error('Error replaying audio:', err)
      })
    }
  }
  
  // Update audio src khi currentTrack thay đổi
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const wasPlaying = isPlaying
      console.log('[BackgroundMusic] Loading track:', currentTrackIndex + 1, '/', playlist.length, currentTrack)
      audioRef.current.src = currentTrack
      audioRef.current.load()
      
      // Nếu đang play, tiếp tục play bài mới
      // Chỉ play nếu user đã tương tác (để tránh autoplay error)
      if (wasPlaying && hasInteracted) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[BackgroundMusic] Playing track:', currentTrackIndex + 1)
            })
            .catch(err => {
              // Không log error nếu là autoplay error (bình thường)
              if (err.name !== 'NotAllowedError') {
                console.error('[BackgroundMusic] Error playing next track:', err)
              }
            })
        }
      }
    }
  }, [currentTrack, currentTrackIndex, playlist.length, isPlaying, hasInteracted])

  if (!isLoggedIn) {
    return null
  }

  // Nút chuyển bài (chỉ hiển thị nếu có nhiều hơn 1 bài)
  const handleNextTrack = () => {
    if (playlist.length > 1) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length
      setCurrentTrackIndex(nextIndex)
      // Lưu vào localStorage
      localStorage.setItem('bgMusicCurrentTrackIndex', nextIndex.toString())
    }
  }
  
  const handlePrevTrack = () => {
    if (playlist.length > 1) {
      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
      setCurrentTrackIndex(prevIndex)
      // Lưu vào localStorage
      localStorage.setItem('bgMusicCurrentTrackIndex', prevIndex.toString())
    }
  }
  
  // Lưu currentTrackIndex vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && playlist.length > 0) {
      // Đảm bảo index hợp lệ (không vượt quá số lượng bài)
      const validIndex = Math.min(currentTrackIndex, playlist.length - 1)
      localStorage.setItem('bgMusicCurrentTrackIndex', validIndex.toString())
    }
  }, [currentTrackIndex, playlist.length])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-3 flex items-center space-x-3 border border-slate-700/50">
        {/* Previous Track Button (chỉ hiển thị nếu có nhiều hơn 1 bài) */}
        {playlist.length > 1 && (
          <button
            onClick={handlePrevTrack}
            className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600 text-gray-200 flex items-center justify-center transition-colors"
            title={language === 'vi' ? 'Bài trước' : 'Previous track'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>
        )}
        
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
        
        {/* Next Track Button (chỉ hiển thị nếu có nhiều hơn 1 bài) */}
        {playlist.length > 1 && (
          <button
            onClick={handleNextTrack}
            className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600 text-gray-200 flex items-center justify-center transition-colors"
            title={language === 'vi' ? 'Bài tiếp theo' : 'Next track'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l10-6a1 1 0 000-1.664l-10-6zM14 7.755l-7.416 4.551v-9.102L14 7.755z" />
            </svg>
          </button>
        )}

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="w-8 h-8 text-gray-300 hover:text-gray-100 transition-colors"
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
            className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
            title={language === 'vi' ? `Âm lượng: ${Math.round(volume * 100)}%` : `Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
        
        {/* Track Info (chỉ hiển thị nếu có nhiều hơn 1 bài) */}
        {playlist.length > 1 && (
          <div className="text-xs text-gray-400 px-2">
            {language === 'vi' ? `Bài ${currentTrackIndex + 1}/${playlist.length}` : `Track ${currentTrackIndex + 1}/${playlist.length}`}
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={currentTrack}
          loop={playlist.length === 1} // Chỉ loop nếu chỉ có 1 bài
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


