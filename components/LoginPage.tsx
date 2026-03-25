'use client'

import React, { useState, useEffect } from 'react'
import { loginWithEmail, signupWithEmail, loginWithGoogle, loginWithFacebook, sendVerificationEmail, logout, sendResetPasswordEmail, getSignInMethodsForEmail } from '@/lib/firebase/auth'
import { createFamily, joinFamilyByCode, getFamilyByRootCode } from '@/lib/firebase/family'
import { getAllUsers } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

// Super root code để tạo super root user (quản lý tất cả families)
const SUPER_ROOT_CODE = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPER_ROOT_CODE) || 'SUPERADMIN2024'

interface LoginPageProps {
  externalError?: string | null;
  onClearExternalError?: () => void;
}

export default function LoginPage({ externalError, onClearExternalError }: LoginPageProps) {
  const { t, language } = useI18n()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [wantRoot, setWantRoot] = useState(false) 
  const [wantSuperRoot, setWantSuperRoot] = useState(false) 
  const [rootAction, setRootAction] = useState<'create' | 'join'>('create') 
  const [rootCode, setRootCode] = useState('') 
  const [superRootCode, setSuperRootCode] = useState('') 
  const [familyCode, setFamilyCode] = useState('') 
  const [familyName, setFamilyName] = useState('') 
  const [customFamilyCode, setCustomFamilyCode] = useState('') 
  const [customRootCode, setCustomRootCode] = useState('') 
  const [useCustomCodes, setUseCustomCodes] = useState(false) 
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  useEffect(() => {
    const backgrounds: string[] = []
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1) backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1)
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2) backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2)

    if (backgrounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * backgrounds.length)
      setBackgroundImage(backgrounds[randomIndex])
    }
  }, [])

  // Đồng bộ externalError vào local error state
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await loginWithEmail(email, password)
        // Note: Verification check moved to parent (app/page.tsx) to prevent state loss on logout
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email.trim())) {
          setError(language === 'vi'
            ? 'Vui lòng nhập định dạng email hợp lệ (ví dụ: user@example.com)'
            : 'Please enter a valid email format (e.g., user@example.com)')
          setLoading(false)
          return
        }

        let isSuperRoot = false
        if (wantSuperRoot) {
          if (superRootCode.trim() !== SUPER_ROOT_CODE) {
            setError(language === 'vi' ? 'Mã Super Root không đúng.' : 'Super Root code is incorrect.')
            setLoading(false)
            return
          }
          isSuperRoot = true
        }

        let isRoot = false
        let familyId: string | undefined

        if (wantRoot && !isSuperRoot) {
          isRoot = true
          if (rootAction === 'join') {
            if (!rootCode.trim()) {
              setError(language === 'vi' ? 'Vui lòng nhập mã Root' : 'Please enter root code')
              setLoading(false)
              return
            }
            const family = await getFamilyByRootCode(rootCode.trim().toUpperCase())
            if (!family) {
              setError(language === 'vi' ? 'Mã Root không đúng' : 'Root code is incorrect')
              setLoading(false)
              return
            }
            const familyMembers = await getAllUsers(family.id)
            if (familyMembers.some(u => u.isRoot && !u.isSuperRoot)) {
              setError(language === 'vi' ? 'Gia đình này đã có root user rồi' : 'This family already has a root user')
              setLoading(false)
              return
            }
            familyId = family.id
          }
        }

        const userCredential = await signupWithEmail(email, password, isRoot)
        const userId = userCredential.user.uid

        try {
          await sendVerificationEmail()
        } catch (verifyErr) {
          console.error('[Signup] Error sending verification email:', verifyErr)
        }

        if (isSuperRoot) {
          familyId = undefined
        } else if (isRoot && rootAction === 'create') {
          const name = familyName.trim() || email.split('@')[0] || 'Family'
          if (useCustomCodes) {
            if (customFamilyCode.trim().length !== 6) {
              setError(language === 'vi' ? 'Mã gia đình phải có 6 ký tự' : 'Family code must be 6 characters')
              setLoading(false)
              return
            }
          }
          const result = await createFamily(
            name,
            userId,
            useCustomCodes ? customFamilyCode.trim() : undefined,
            useCustomCodes ? customRootCode.trim() : undefined
          )
          familyId = result.familyId
          if (typeof window !== 'undefined') {
            localStorage.setItem(`signup_familyCode_${userId}`, result.familyCode)
            localStorage.setItem(`signup_rootCode_${userId}`, result.rootCode)
          }
        } else if (!isRoot && familyCode.trim()) {
          const result = await joinFamilyByCode(familyCode.trim().toUpperCase(), userId)
          if (!result.success) {
            setError(result.error || (language === 'vi' ? 'Lỗi khi tham gia' : 'Error joining'))
            setLoading(false)
            return
          }
          familyId = result.familyId
        } else if (!isRoot && !familyCode.trim()) {
          setError(language === 'vi' ? 'Vui lòng nhập mã gia đình' : 'Please enter family code')
          setLoading(false)
          return
        }

        if (typeof window !== 'undefined') {
          if (isSuperRoot) localStorage.setItem(`signup_isSuperRoot_${userId}`, 'true')
          if (isRoot) localStorage.setItem(`signup_isRoot_${userId}`, 'true')
          if (familyId) localStorage.setItem(`signup_familyId_${userId}`, familyId)
        }

        await new Promise(resolve => setTimeout(resolve, 800))
        if (typeof window !== 'undefined') window.location.reload()
      }
    } catch (err: any) {
      // Check if this is a Google-linked account trying to use email/password
      if (isLogin && (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found')) {
        try {
          const methods = await getSignInMethodsForEmail(email.trim())
          if (methods.includes('google.com')) {
            setError(
              language === 'vi'
                ? '📧 Email này đã được đăng ký bằng Google. Vui lòng dùng nút "Đăng nhập với Google" bên dưới.'
                : '📧 This email was registered with Google. Please use the "Sign in with Google" button below.'
            )
            setLoading(false)
            return
          }
        } catch {
          // fallthrough to generic error
        }
      }
      setError(err.message || t('login.errorOccurred'))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithFacebook()
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError(language === 'vi' ? 'Vui lòng nhập email' : 'Please enter email')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendResetPasswordEmail(email)
      setResetEmailSent(true)
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      await loginWithEmail(email, password)
      await sendVerificationEmail()
      await logout()
      setToast({
        show: true,
        message: language === 'vi' ? 'Link xác thực đã được gửi lại!' : 'Verification link has been resent!',
        type: 'success'
      })
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-purple- white relative overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      {/* Dynamic Animated Circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />

      <div className="kid-card p-10 w-full max-w-lg bg-white border-violet-100 shadow-kid relative z-10 animate-bounce-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-violet-100 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-soft group hover:scale-110 transition-transform">
             <span className="animate-bounce-slow">🚀</span>
          </div>
          <h1 className="text-4xl font-black text-violet-900 mb-3 uppercase tracking-tight">
            {isForgotPassword ? (language === 'vi' ? 'Quên mật khẩu' : 'Forgot Password') : (isLogin ? t('login.title') : t('login.createNewAccount'))}
          </h1>
          <p className="text-violet-400 font-bold uppercase tracking-widest text-xs">
            {isForgotPassword ? (language === 'vi' ? 'Nhập email để nhận link' : 'Enter email to receive link') : (isLogin ? t('login.loginToAccount') : t('login.createNewAccount'))}
          </p>
        </div>

        {resetEmailSent && (
          <div className="bg-emerald-50 border-4 border-emerald-100 text-emerald-600 px-6 py-4 rounded-3xl mb-6 font-black text-sm text-center shadow-soft">
            {language === 'vi' ? 'Link đã được gửi! Kiểm tra email nhé!' : 'Link sent! Check your email!'}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-4 border-red-100 text-red-500 px-6 py-4 rounded-3xl mb-6 font-black text-sm shadow-soft text-center leading-relaxed">
            {error}
            {(error.includes('xác thực') || error.includes('verified')) && (
              <button onClick={handleResendVerification} className="block mt-2 w-full text-xs font-black underline hover:text-red-600 uppercase tracking-widest">
                {language === 'vi' ? 'Gửi lại mã xác thực' : 'Resend link'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-violet-300 uppercase tracking-[0.2em] ml-2">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 border-4 border-violet-50 rounded-[1.5rem] bg-violet-50/30 text-violet-900 font-black focus:outline-none focus:border-violet-200 transition-all shadow-inner placeholder-violet-200"
              placeholder="example@email.com"
            />
          </div>

          {!isForgotPassword && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-violet-300 uppercase tracking-[0.2em] ml-2">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-6 py-4 border-4 border-violet-50 rounded-[1.5rem] bg-violet-50/30 text-violet-900 font-black focus:outline-none focus:border-violet-200 transition-all shadow-inner placeholder-violet-200"
                placeholder="••••••••"
              />
            </div>
          )}

          {isLogin && !isForgotPassword && (
            <div className="flex justify-end pr-2">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-[10px] font-black text-violet-400 hover:text-violet-600 uppercase tracking-widest"
              >
                {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
              </button>
            </div>
          )}

          {!isLogin && !isForgotPassword && (
            <div className="space-y-4">
              {/* Super Root UI */}
              <div className={`p-6 rounded-[2rem] border-4 transition-all ${wantSuperRoot ? 'bg-indigo-600 border-indigo-400 text-white shadow-kid' : 'bg-indigo-50/30 border-indigo-100 text-indigo-400'}`}>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={wantSuperRoot}
                    onChange={(e) => {
                      setWantSuperRoot(e.target.checked)
                      if (e.target.checked) setWantRoot(false)
                    }}
                    className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-2 border-indigo-200"
                  />
                  <span className="text-xs font-black uppercase tracking-widest">
                    👑 Super Admin Account
                  </span>
                </div>
                {wantSuperRoot && (
                  <input
                    type="text"
                    value={superRootCode}
                    onChange={(e) => setSuperRootCode(e.target.value)}
                    placeholder="Enter Admin Code"
                    className="mt-4 w-full px-5 py-3 rounded-2xl bg-black/20 text-white placeholder-indigo-200 border-2 border-indigo-300 font-bold focus:outline-none"
                  />
                )}
              </div>

              {/* Root / Parent UI */}
              <div className={`p-6 rounded-[2rem] border-4 transition-all ${wantRoot ? 'bg-violet-600 border-violet-400 text-white shadow-kid' : 'bg-violet-50/30 border-violet-100 text-violet-400'}`}>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={wantRoot}
                    onChange={(e) => {
                      setWantRoot(e.target.checked)
                      if (e.target.checked) setWantSuperRoot(false)
                    }}
                    className="w-6 h-6 rounded-lg text-violet-600 focus:ring-violet-500 border-2 border-violet-200"
                  />
                  <span className="text-xs font-black uppercase tracking-widest">
                    👨‍👩‍👧‍👦 I'm a Parent (Root)
                  </span>
                </div>
                {wantRoot && (
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-2">
                       <button 
                        type="button" 
                        onClick={() => setRootAction('create')}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all ${rootAction === 'create' ? 'bg-white text-violet-600 shadow-soft' : 'bg-violet-700/50 text-violet-200'}`}
                       >
                         Create New
                       </button>
                       <button 
                        type="button" 
                        onClick={() => setRootAction('join')}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all ${rootAction === 'join' ? 'bg-white text-violet-600 shadow-soft' : 'bg-violet-700/50 text-violet-200'}`}
                       >
                         Join Existing
                       </button>
                    </div>
                    {rootAction === 'create' ? (
                       <div className="space-y-3">
                          <input
                            type="text"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            placeholder="Family Name (Optional)"
                            className="w-full px-5 py-3 rounded-2xl bg-white/10 text-white border-2 border-violet-400 placeholder-white/50 text-sm font-bold"
                          />
                          <div className="flex items-center gap-3 ml-2">
                             <input type="checkbox" checked={useCustomCodes} onChange={e => setUseCustomCodes(e.target.checked)} className="rounded" />
                             <span className="text-[10px] font-black uppercase">Custom Codes</span>
                          </div>
                          {useCustomCodes && (
                            <div className="grid grid-cols-2 gap-3">
                               <input type="text" value={customFamilyCode} onChange={e => setCustomFamilyCode(e.target.value.toUpperCase())} maxLength={6} placeholder="Family Code" className="px-4 py-3 rounded-2xl bg-white/20 border-2 border-violet-400 text-xs text-white font-mono" />
                               <input type="text" value={customRootCode} onChange={e => setCustomRootCode(e.target.value.toUpperCase())} maxLength={6} placeholder="Root Code" className="px-4 py-3 rounded-2xl bg-white/20 border-2 border-violet-400 text-xs text-white font-mono" />
                            </div>
                          )}
                       </div>
                    ) : (
                       <input
                        type="text"
                        value={rootCode}
                        onChange={(e) => setRootCode(e.target.value.toUpperCase())}
                        placeholder="6-Char Root Code"
                        maxLength={6}
                        className="w-full px-5 py-3 rounded-2xl bg-white/10 text-white border-2 border-violet-400 placeholder-white/50 text-sm font-bold font-mono"
                       />
                    )}
                  </div>
                )}
              </div>

              {!wantRoot && !wantSuperRoot && (
                <div className="p-6 rounded-[2rem] bg-emerald-50/50 border-4 border-emerald-100 text-emerald-600 shadow-inner">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Enter Family Code to Join:</p>
                   <input
                    type="text"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full px-6 py-4 border-4 border-white rounded-2xl bg-white text-emerald-600 font-black text-2xl text-center focus:outline-none focus:border-emerald-200 transition-all shadow-soft uppercase placeholder-emerald-100 font-mono tracking-widest"
                   />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-playful bg-violet-600 text-white py-5 px-6 rounded-[1.8rem] text-lg font-black shadow-kid hover:bg-violet-700 transition-all disabled:opacity-50 uppercase tracking-widest border-b-8 border-violet-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-3 group"
          >
            {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : 
              <> {isLogin ? 'Login Now!' : 'Join the Fun!'} <span className="group-hover:translate-x-2 transition-transform">➡️</span> </>}
          </button>
        </form>

        <div className="mt-10 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-4 border-violet-50"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-white text-violet-200 text-xs font-black uppercase tracking-widest">Or Sign In with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 w-full btn-playful bg-white border-4 border-violet-50 text-violet-900 py-4 px-6 rounded-[1.5rem] font-black shadow-soft hover:bg-violet-50 transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs active:translate-y-1"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          {t('login.loginWithGoogle')}
        </button>

        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="mt-4 w-full btn-playful bg-[#1877F2] text-white py-4 px-6 rounded-[1.5rem] font-black shadow-soft hover:bg-[#166fe5] transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs active:translate-y-1"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {t('login.loginWithFacebook')}
        </button>

        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setIsForgotPassword(false)
              setError('')
              if (onClearExternalError) onClearExternalError()
              setWantRoot(false)
              setWantSuperRoot(false)
              setFamilyCode('')
            }}
            className="text-xs font-black text-violet-400 hover:text-violet-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto decoration-2 underline-offset-4"
          >
            {isLogin ? (
              <> New here? <span className="text-violet-600 underline">Create an Account</span> </>
            ) : (
              <> Already have an account? <span className="text-violet-600 underline">Log in</span> </>
            )}
            {isForgotPassword && <span className="text-violet-600 underline">Back to Login</span>}
          </button>
        </div>
      </div>
      
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}
