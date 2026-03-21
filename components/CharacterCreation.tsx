'use client'

import React, { useState } from 'react'
import { UserProfile, updateProfile } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

interface CharacterCreationProps {
  profile: UserProfile
  onComplete: (updatedProfile: UserProfile) => void
}

export default function CharacterCreation({ profile, onComplete }: CharacterCreationProps) {
  const { language } = useI18n()
  const [selectedBase, setSelectedBase] = useState<'nam1' | 'nam2' | 'nu1' | 'nu2' | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  const characters = [
    { id: 'nam1', gender: 'nam', label: language === 'vi' ? 'Bé Trai 1' : 'Boy 1', image: '/pic-avatar/nam1.png' },
    { id: 'nam2', gender: 'nam', label: language === 'vi' ? 'Bé Trai 2' : 'Boy 2', image: '/pic-avatar/nam2.png' },
    { id: 'nu1', gender: 'nu', label: language === 'vi' ? 'Bé Gái 1' : 'Girl 1', image: '/pic-avatar/nu1.png' },
    { id: 'nu2', gender: 'nu', label: language === 'vi' ? 'Bé Gái 2' : 'Girl 2', image: '/pic-avatar/nu2.png' },
  ] as const

  const handleSubmit = async () => {
    if (!selectedBase) {
      setToast({
        show: true,
        message: language === 'vi' ? 'Vui lòng chọn một nhân vật!' : 'Please select a character!',
        type: 'error'
      })
      return
    }

    setLoading(true)
    try {
      const gender = selectedBase.startsWith('nam') ? 'nam' : 'nu'
      await updateProfile(profile.id, { 
        characterBase: selectedBase,
        gender: gender as 'nam' | 'nu'
      })
      
      onComplete({ 
        ...profile, 
        characterBase: selectedBase,
        gender: gender as 'nam' | 'nu'
      })
    } catch (error: any) {
      console.error('Error updating character base:', error)
      setToast({
        show: true,
        message: language === 'vi' ? 'Có lỗi xảy ra, thử lại sau!' : 'An error occurred, try again!',
        type: 'error'
      })
      setLoading(false) // Only stop loading on error so the screen doesn't flicker before unmounting
    }
  }

  return (
    <div className="fixed inset-0 bg-violet-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-8 animate-fade-in overflow-y-auto">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="bg-white max-w-4xl w-full rounded-[3rem] p-8 lg:p-12 shadow-kid border-8 border-violet-100 flex flex-col items-center text-center animate-bounce-in relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 w-full">
          <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-soft animate-bounce-slow">
            🎮
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-black text-violet-900 mb-4 uppercase tracking-tighter">
            {language === 'vi' ? 'Tạo Nhân Vật Mới' : 'Create Character'}
          </h1>
          <p className="text-violet-500 font-bold mb-10 text-lg">
            {language === 'vi' ? 'Hãy chọn nhân vật đại diện cho bạn nhé!' : 'Choose your avatar representation!'}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 w-full max-w-3xl mx-auto">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedBase(char.id)}
                className={`relative group rounded-3xl p-4 transition-all duration-300 ${
                  selectedBase === char.id
                    ? 'bg-violet-50 border-4 border-violet-500 shadow-kid scale-105'
                    : 'bg-slate-50 border-4 border-slate-100 hover:border-violet-300 hover:bg-violet-50/50 hover:-translate-y-2'
                }`}
              >
                <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-violet-100 to-white shadow-inner">
                  <img 
                    src={char.image} 
                    alt={char.label}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="font-black text-violet-900 uppercase tracking-widest text-sm">
                  {char.label}
                </div>
                
                {selectedBase === char.id && (
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-soft border-4 border-white animate-bounce-in">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedBase || loading}
            className={`btn-playful text-white px-10 py-5 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-kid border-b-8 transition-all flex items-center justify-center mx-auto gap-4 ${
              selectedBase 
                ? 'bg-violet-600 hover:bg-violet-700 border-violet-800 active:translate-y-2 active:border-b-0 cursor-pointer' 
                : 'bg-slate-300 border-slate-400 cursor-not-allowed opacity-70'
            }`}
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {language === 'vi' ? 'Bắt đầu cuộc phiêu lưu!' : 'Start your adventure!'}
                <span className="text-2xl">🚀</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
