'use client'

import { useState, useEffect } from 'react'
import { loginWithEmail, signupWithEmail, loginWithGoogle, loginWithGoogleRedirect, sendVerificationEmail, logout, sendResetPasswordEmail } from '@/lib/firebase/auth'
import { createFamily, joinFamilyByCode, getFamilyByRootCode } from '@/lib/firebase/family'
import { getAllUsers } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

// Super root code để tạo super root user (quản lý tất cả families)
// Lấy từ environment variable, fallback về default
const SUPER_ROOT_CODE = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPER_ROOT_CODE) || 'SUPERADMIN2024'

export default function LoginPage() {
  const { t, language } = useI18n()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [wantRoot, setWantRoot] = useState(false) // Checkbox muốn tạo root
  const [wantSuperRoot, setWantSuperRoot] = useState(false) // Checkbox muốn tạo super root
  const [rootAction, setRootAction] = useState<'create' | 'join'>('create') // Tạo mới hoặc join family đã có
  const [rootCode, setRootCode] = useState('') // Input root code (để join family đã có)
  const [superRootCode, setSuperRootCode] = useState('') // Input super root code
  const [familyCode, setFamilyCode] = useState('') // Code để join family (end user)
  const [familyName, setFamilyName] = useState('') // Tên family khi tạo mới
  const [customFamilyCode, setCustomFamilyCode] = useState('') // Mã gia đình tùy chỉnh
  const [customRootCode, setCustomRootCode] = useState('') // Mã root tùy chỉnh
  const [useCustomCodes, setUseCustomCodes] = useState(false) // Checkbox để sử dụng mã tùy chỉnh
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  // Random background image
  useEffect(() => {
    const backgrounds: string[] = []
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1) {
      backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_1)
    }
    if (process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2) {
      backgrounds.push(process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_2)
    }

    if (backgrounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * backgrounds.length)
      setBackgroundImage(backgrounds[randomIndex])
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const userCredential = await loginWithEmail(email, password)
        // Kiểm tra xem email đã xác thực chưa
        if (!userCredential.user.emailVerified) {
          await logout()
          setError(language === 'vi'
            ? 'Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư đến và bấm vào link xác thực.'
            : 'Your email is not verified. Please check your inbox and click the verification link.')
          setLoading(false)
          return
        }
      } else {
        // Strict email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email.trim())) {
          setError(language === 'vi'
            ? 'Vui lòng nhập định dạng email hợp lệ (ví dụ: user@example.com)'
            : 'Please enter a valid email format (e.g., user@example.com)')
          setLoading(false)
          return
        }

        // Kiểm tra super root code trước (ưu tiên cao nhất)
        let isSuperRoot = false
        if (wantSuperRoot) {
          if (superRootCode.trim() !== SUPER_ROOT_CODE) {
            setError(language === 'vi'
              ? 'Mã Super Root không đúng. Vui lòng kiểm tra lại.'
              : 'Super Root code is incorrect. Please check again.')
            setLoading(false)
            return
          }
          isSuperRoot = true
        }

        // Xử lý root user (chỉ nếu không phải super root)
        let isRoot = false
        let familyId: string | undefined

        if (wantRoot && !isSuperRoot) {
          isRoot = true

          if (rootAction === 'create') {
            // Tạo family mới - không cần root code
            // Sẽ tạo family và root code tự động
          } else if (rootAction === 'join') {
            // Trở thành root của family đã có - cần root code
            if (!rootCode.trim()) {
              setError(language === 'vi'
                ? 'Vui lòng nhập mã Root của gia đình'
                : 'Please enter family root code')
              setLoading(false)
              return
            }

            // Kiểm tra root code
            const family = await getFamilyByRootCode(rootCode.trim().toUpperCase())
            if (!family) {
              setError(language === 'vi'
                ? 'Mã Root không đúng hoặc không tồn tại'
                : 'Root code is incorrect or does not exist')
              setLoading(false)
              return
            }

            // Kiểm tra family đã có root user chưa
            const familyMembers = await getAllUsers(family.id)
            const hasRoot = familyMembers.some(u => u.isRoot && !u.isSuperRoot)
            if (hasRoot) {
              setError(language === 'vi'
                ? 'Gia đình này đã có root user rồi'
                : 'This family already has a root user')
              setLoading(false)
              return
            }

            familyId = family.id
          }
        }

        // Tạo user account trước
        const userCredential = await signupWithEmail(email, password, isRoot)
        const userId = userCredential.user.uid

        // Gửi email xác thực
        try {
          await sendVerificationEmail()
          console.log('[Signup] Verification email sent to:', email)
        } catch (verifyErr) {
          console.error('[Signup] Error sending verification email:', verifyErr)
          // Không ngăn cản flow chính, chỉ log lỗi
        }

        // Xử lý family: tạo mới (nếu root) hoặc join (nếu có code) - skip nếu super root
        if (isSuperRoot) {
          // Super root không cần family
          familyId = undefined
        } else if (isRoot && rootAction === 'create') {
          // Root user: tạo family mới
          const name = familyName.trim() || email.split('@')[0] || 'Family'
          // Validate custom codes nếu có
          if (useCustomCodes) {
            if (customFamilyCode.trim().length !== 6) {
              setError(language === 'vi'
                ? 'Mã gia đình phải có đúng 6 ký tự'
                : 'Family code must be exactly 6 characters')
              setLoading(false)
              return
            }
            // Root code là optional, nhưng nếu nhập thì phải đúng 6 ký tự
            if (customRootCode.trim().length > 0 && customRootCode.trim().length !== 6) {
              setError(language === 'vi'
                ? 'Mã Root phải có đúng 6 ký tự hoặc để trống'
                : 'Root code must be exactly 6 characters or leave empty')
              setLoading(false)
              return
            }
            // Cảnh báo nếu root code giống family code
            if (customRootCode.trim().toUpperCase() === customFamilyCode.trim().toUpperCase() && customRootCode.trim().length > 0) {
              setError(language === 'vi'
                ? '⚠️ Không nên dùng Root Code giống Family Code. Vui lòng chọn mã khác hoặc để trống để tự tạo.'
                : '⚠️ Do not use same Root Code as Family Code. Please choose different code or leave empty to auto-generate.')
              setLoading(false)
              return
            }
          }
          try {
            console.log('[Signup] Creating family with:', {
              useCustomCodes,
              customFamilyCode: useCustomCodes ? customFamilyCode.trim() : undefined,
              customRootCode: useCustomCodes ? customRootCode.trim() : undefined,
            })
            const result = await createFamily(
              name,
              userId,
              useCustomCodes ? customFamilyCode.trim() : undefined,
              useCustomCodes ? customRootCode.trim() : undefined
            )
            console.log('[Signup] Family created with codes:', {
              familyCode: result.familyCode,
              rootCode: result.rootCode,
              familyId: result.familyId,
            })
            familyId = result.familyId

            // ⚠️ CRITICAL: Đảm bảo familyId được set
            if (!familyId) {
              console.error('[Signup] ⚠️ CRITICAL ERROR: familyId is undefined after createFamily!')
              setError(language === 'vi' ? 'Lỗi: Không thể tạo gia đình. Vui lòng thử lại.' : 'Error: Cannot create family. Please try again.')
              setLoading(false)
              return
            }

            // Lưu cả family code, root code và familyId vào localStorage để hiển thị sau
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`signup_familyCode_${userId}`, result.familyCode)
                localStorage.setItem(`signup_rootCode_${userId}`, result.rootCode)
                localStorage.setItem(`signup_familyId_${userId}`, result.familyId)

                // Verify ngay lập tức
                const verifyFamilyId = localStorage.getItem(`signup_familyId_${userId}`)
                const verifyFamilyCode = localStorage.getItem(`signup_familyCode_${userId}`)
                const verifyRootCode = localStorage.getItem(`signup_rootCode_${userId}`)

                console.log('[Signup] Saved to localStorage:', {
                  familyCode: result.familyCode,
                  rootCode: result.rootCode,
                  familyId: result.familyId,
                  verified: {
                    familyId: verifyFamilyId,
                    familyCode: verifyFamilyCode,
                    rootCode: verifyRootCode,
                  },
                })

                if (verifyFamilyId !== result.familyId) {
                  console.error('[Signup] ⚠️ CRITICAL: localStorage verification failed for familyId!', {
                    expected: result.familyId,
                    actual: verifyFamilyId,
                  })
                }
              } catch (e) {
                console.error('[Signup] ⚠️ CRITICAL: Error saving to localStorage:', e)
                setError(language === 'vi' ? 'Lỗi: Không thể lưu thông tin. Vui lòng thử lại.' : 'Error: Cannot save information. Please try again.')
                setLoading(false)
                return
              }
            }
          } catch (err: any) {
            // Xử lý lỗi từ createFamily (ví dụ: mã đã tồn tại)
            setError(err.message || (language === 'vi' ? 'Lỗi khi tạo gia đình' : 'Error creating family'))
            setLoading(false)
            return
          }
        } else if (!isRoot && familyCode.trim()) {
          // End user: Join family bằng code
          try {
            const result = await joinFamilyByCode(familyCode.trim().toUpperCase(), userId)
            if (!result.success) {
              setError(result.error || (language === 'vi' ? 'Không thể tham gia gia đình' : 'Cannot join family'))
              setLoading(false)
              return
            }
            familyId = result.familyId
          } catch (err: any) {
            setError(err.message || (language === 'vi' ? 'Lỗi khi tham gia gia đình' : 'Error joining family'))
            setLoading(false)
            return
          }
        } else if (!isRoot && !familyCode.trim()) {
          setError(language === 'vi'
            ? 'Vui lòng nhập mã gia đình để tham gia'
            : 'Please enter family code to join')
          setLoading(false)
          return
        }

        // Lưu flags vào localStorage để dùng khi tạo profile
        // Note: familyId đã được lưu ở trên (line 174) nếu tạo family mới
        // Chỉ cần lưu lại nếu chưa có (trường hợp join family)
        if (typeof window !== 'undefined') {
          if (isSuperRoot) {
            localStorage.setItem(`signup_isSuperRoot_${userId}`, 'true')
          }
          if (isRoot) {
            localStorage.setItem(`signup_isRoot_${userId}`, 'true')
          }
          // Chỉ lưu familyId nếu chưa có (tránh overwrite)
          if (familyId && !localStorage.getItem(`signup_familyId_${userId}`)) {
            localStorage.setItem(`signup_familyId_${userId}`, familyId)
            console.log('[Signup] Saved familyId to localStorage (second time):', {
              userId,
              familyId,
            })
          } else if (familyId) {
            console.log('[Signup] familyId already saved to localStorage:', {
              userId,
              familyId,
              existing: localStorage.getItem(`signup_familyId_${userId}`),
            })
          } else {
            console.warn('[Signup] familyId is undefined! Not saving to localStorage.')
          }
        }

        // Đợi một chút để đảm bảo Firebase Auth state đã được cập nhật
        // Và đảm bảo localStorage đã được lưu SYNCHRONOUSLY
        // Force sync localStorage bằng cách đọc lại ngay sau khi ghi
        if (typeof window !== 'undefined' && familyId) {
          // Đảm bảo localStorage được sync bằng cách force write và read
          localStorage.setItem(`signup_familyId_${userId}`, familyId)
          // Force sync bằng cách trigger storage event
          const verifyFamilyId = localStorage.getItem(`signup_familyId_${userId}`)
          if (verifyFamilyId !== familyId) {
            console.error('[Signup] ⚠️ CRITICAL: localStorage write failed!', {
              expected: familyId,
              actual: verifyFamilyId,
            })
            // Thử lại với JSON stringify (một số browser cần format đặc biệt)
            try {
              localStorage.setItem(`signup_familyId_${userId}`, String(familyId))
              const retryVerify = localStorage.getItem(`signup_familyId_${userId}`)
              if (retryVerify !== familyId) {
                console.error('[Signup] ⚠️ CRITICAL: localStorage retry also failed!')
              } else {
                console.log('[Signup] ✅ localStorage write succeeded after retry')
              }
            } catch (e) {
              console.error('[Signup] ⚠️ CRITICAL: localStorage write error:', e)
            }
          } else {
            console.log('[Signup] ✅ Verified: familyId correctly saved to localStorage (synchronous check)')
          }
        }

        // Đợi thêm một chút để đảm bảo tất cả operations đã hoàn tất
        await new Promise(resolve => setTimeout(resolve, 800))

        // Final verification trước khi reload
        if (typeof window !== 'undefined' && familyId) {
          const finalCheck = localStorage.getItem(`signup_familyId_${userId}`)
          if (finalCheck !== familyId) {
            console.error('[Signup] ⚠️ FINAL CHECK FAILED: familyId mismatch before reload!', {
              expected: familyId,
              actual: finalCheck,
            })
            // Force save one more time
            localStorage.setItem(`signup_familyId_${userId}`, familyId)
            console.log('[Signup] Force saved familyId one more time before reload')
          } else {
            console.log('[Signup] ✅ Final check passed: familyId is correct before reload')
          }
        }

        // Reload page để trigger onAuthStateChanged và load profile
        // Điều này đảm bảo Firebase hoàn toàn sẵn sàng
        if (typeof window !== 'undefined') {
          console.log('[Signup] Reloading page now...')
          window.location.reload()
        }
      }
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      // Lưu state đăng ký/gia đình vào localStorage trước khi redirect
      // để có thể khôi phục sau khi quay lại
      if (typeof window !== 'undefined') {
        const pendingData = {
          isLogin,
          wantRoot,
          wantSuperRoot,
          rootAction,
          rootCode,
          superRootCode,
          familyCode,
          familyName,
          customFamilyCode,
          customRootCode,
          useCustomCodes,
          timestamp: Date.now()
        }
        localStorage.setItem('pending_google_auth_state', JSON.stringify(pendingData))
        console.log('[LoginPage] Saved pending Google auth state:', pendingData)
      }

      await loginWithGoogleRedirect()
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError(language === 'vi' ? 'Vui lòng nhập email để khôi phục mật khẩu' : 'Please enter your email to reset password')
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
    if (!email || !password) {
      setError(language === 'vi' ? 'Vui lòng nhập email và mật khẩu để gửi lại link xác thực' : 'Please enter email and password to resend verification link')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Firebase yêu cầu user phải đăng nhập (mặc dù unverified) để gửi email xác thực
      const userCredential = await loginWithEmail(email, password)
      await sendVerificationEmail()
      await logout()
      setToast({
        show: true,
        message: language === 'vi'
          ? 'Link xác thực đã được gửi lại vào email của bạn.'
          : 'Verification link has been resent to your email.',
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
      className="min-h-screen flex items-center justify-center p-4"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      } : {
        background: 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42))',
      }}
    >
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md border border-slate-700/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            {isForgotPassword ? (language === 'vi' ? 'Quên mật khẩu' : 'Forgot Password') : t('login.title')}
          </h1>
          <p className="text-gray-300">
            {isForgotPassword
              ? (language === 'vi' ? 'Nhập email để nhận link đặt lại mật khẩu' : 'Enter email to receive reset link')
              : isLogin ? t('login.loginToAccount') : t('login.createNewAccount')}
          </p>
        </div>

        {resetEmailSent && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded mb-4">
            {language === 'vi'
              ? 'Link đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra email.'
              : 'Password reset link sent! Please check your email.'}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-4">
            {error}
            {(error.includes('xác thực') || error.includes('verified')) && (
              <button
                onClick={handleResendVerification}
                className="block mt-2 text-sm font-bold underline hover:text-white"
              >
                {language === 'vi' ? 'Gửi lại mã xác thực' : 'Resend verification link'}
              </button>
            )}
          </div>
        )}

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-100 mb-1">
                {t('login.email')}
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white bg-slate-700/50 placeholder-gray-300"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('login.processing') : (language === 'vi' ? 'Gửi link reset' : 'Send reset link')}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setError('')
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {language === 'vi' ? 'Quay lại đăng nhập' : 'Back to login'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-100 mb-1">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white bg-slate-700/50 placeholder-gray-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-100 mb-1">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white bg-slate-700/50 placeholder-gray-300"
                placeholder="••••••••"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true)
                    setError('')
                    setResetEmailSent(false)
                  }}
                  className="text-xs text-primary-500 hover:text-primary-400 font-medium"
                >
                  {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-3">
                {/* Super Root Account Option */}
                <div className="bg-purple-600/90 border-2 border-purple-400 rounded-lg p-4 space-y-3 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="wantSuperRoot"
                      checked={wantSuperRoot}
                      onChange={(e) => {
                        setWantSuperRoot(e.target.checked)
                        if (e.target.checked) {
                          setWantRoot(false)
                          setRootCode('')
                          setFamilyCode('')
                          setFamilyName('')
                        }
                      }}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <label htmlFor="wantSuperRoot" className="text-base font-bold text-white cursor-pointer flex items-center gap-2">
                      <span className="text-yellow-300 text-xl">👑</span>
                      <span className="bg-white/20 px-3 py-1 rounded">
                        {language === 'vi' ? 'Tạo tài khoản Super Root' : 'Create Super Root account'}
                      </span>
                    </label>
                  </div>
                  {wantSuperRoot && (
                    <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-400">
                      <label htmlFor="superRootCode" className="block text-sm font-bold text-white mb-2">
                        {language === 'vi' ? 'Mã Super Root:' : 'Super Root Code:'}
                        <span className="ml-2 text-yellow-300 font-mono text-sm font-bold bg-black/30 px-2 py-1 rounded">({SUPER_ROOT_CODE})</span>
                      </label>
                      <input
                        id="superRootCode"
                        type="text"
                        value={superRootCode}
                        onChange={(e) => setSuperRootCode(e.target.value)}
                        placeholder={language === 'vi' ? `Nhập mã Super Root` : `Enter super root code`}
                        className="w-full px-4 py-3 border-2 border-purple-400 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Root Account Option */}
                <div className="bg-blue-600/90 border-2 border-blue-400 rounded-lg p-4 space-y-3 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="wantRoot"
                      checked={wantRoot}
                      onChange={(e) => {
                        setWantRoot(e.target.checked)
                        if (!e.target.checked) {
                          setRootCode('')
                          setFamilyName('')
                          setRootAction('create')
                        } else {
                          setFamilyCode('')
                          setWantSuperRoot(false)
                          setSuperRootCode('')
                        }
                      }}
                      disabled={wantSuperRoot}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="wantRoot" className="text-base font-bold text-white cursor-pointer flex items-center gap-2">
                      <span className="text-yellow-300 text-xl">🔐</span>
                      <span className="bg-white/20 px-3 py-1 rounded">
                        {language === 'vi' ? 'Tạo tài khoản quản trị (Root)' : 'Create admin account (Root)'}
                      </span>
                    </label>
                  </div>
                  {wantRoot && (
                    <div className="space-y-3 bg-blue-900/50 p-3 rounded-lg border border-blue-400">
                      <div>
                        <label className="block text-sm font-bold text-white mb-3">
                          {language === 'vi' ? 'Bạn muốn:' : 'You want to:'}
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRootAction('create')
                              setRootCode('')
                            }}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${rootAction === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                          >
                            {language === 'vi' ? '✨ Tạo gia đình mới' : '✨ Create new family'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRootAction('join')
                              setFamilyName('')
                            }}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${rootAction === 'join' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                          >
                            {language === 'vi' ? '🔑 Join family đã có' : '🔑 Join existing family'}
                          </button>
                        </div>
                      </div>

                      {rootAction === 'create' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            placeholder={language === 'vi' ? 'Tên gia đình (tùy chọn)' : 'Family name (optional)'}
                            className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                          />
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="useCustomCodes"
                              checked={useCustomCodes}
                              onChange={(e) => setUseCustomCodes(e.target.checked)}
                              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <label htmlFor="useCustomCodes" className="text-sm font-bold text-white">
                              {language === 'vi' ? 'Tự tạo mã code riêng' : 'Use custom codes'}
                            </label>
                          </div>
                          {useCustomCodes && (
                            <div className="space-y-4 bg-gradient-to-br from-green-600/95 to-emerald-600/95 p-5 rounded-lg border-2 border-green-400">
                              <input
                                type="text"
                                value={customFamilyCode}
                                onChange={(e) => setCustomFamilyCode(e.target.value.toUpperCase().slice(0, 6))}
                                placeholder="Family Code (6 chars)"
                                maxLength={6}
                                className="w-full px-4 py-3 border-2 border-green-400 rounded-lg bg-black/50 text-white font-mono font-bold"
                              />
                              <input
                                type="text"
                                value={customRootCode}
                                onChange={(e) => setCustomRootCode(e.target.value.toUpperCase().slice(0, 6))}
                                placeholder="Root Code (6 chars, optional)"
                                maxLength={6}
                                className="w-full px-4 py-3 border-2 border-green-400 rounded-lg bg-black/50 text-white font-mono font-bold"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {rootAction === 'join' && (
                        <input
                          type="text"
                          value={rootCode}
                          onChange={(e) => setRootCode(e.target.value.toUpperCase())}
                          placeholder={language === 'vi' ? 'Mã Root (6 ký tự)' : 'Root Code (6 characters)'}
                          maxLength={6}
                          className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                        />
                      )}
                    </div>
                  )}
                </div>

                {!wantRoot && (
                  <div className="bg-green-600/90 border-2 border-green-400 rounded-lg p-4 shadow-xl">
                    <label htmlFor="familyCode" className="block text-sm font-bold text-white mb-2">
                      {language === 'vi' ? 'Mã gia đình để tham gia:' : 'Family code to join:'}
                    </label>
                    <input
                      id="familyCode"
                      type="text"
                      value={familyCode}
                      onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('login.processing') : (isLogin ? t('login.login') : t('login.signup'))}
            </button>
          </form>
        )}

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/90 text-gray-400">{t('login.or')}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-slate-600 rounded-lg shadow-sm bg-slate-700/50 text-sm font-medium text-gray-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('login.loginWithGoogle')}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setWantRoot(false)
              setWantSuperRoot(false)
              setRootCode('')
              setSuperRootCode('')
              setFamilyCode('')
              setFamilyName('')
            }}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {isLogin
              ? t('login.noAccount')
              : t('login.hasAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}
