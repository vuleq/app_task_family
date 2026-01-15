'use client'

import { useState, useEffect } from 'react'
import { loginWithEmail, signupWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
        await loginWithEmail(email, password)
      } else {
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
      await loginWithGoogle()
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
            {t('login.title')}
          </h1>
          <p className="text-gray-300">
            {isLogin ? t('login.loginToAccount') : t('login.createNewAccount')}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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

          {/* Family & Root Account Option - Chỉ hiện khi đăng ký */}
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
                        // Disable các option khác khi chọn super root
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
                      {language === 'vi' ? 'Tạo tài khoản Super Root (Quản lý tất cả gia đình)' : 'Create Super Root account (Manage all families)'}
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
                      placeholder={language === 'vi' ? `Nhập mã Super Root: ${SUPER_ROOT_CODE}` : `Enter super root code: ${SUPER_ROOT_CODE}`}
                      className="w-full px-4 py-3 border-2 border-purple-400 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                    />
                    <div className="bg-yellow-500/90 border-2 border-yellow-400 rounded p-2 mt-3">
                      <p className="text-sm text-white font-bold">
                        {language === 'vi' 
                          ? `💡 Super Root có quyền quản lý tất cả families và root users trong hệ thống. Mã mặc định: ${SUPER_ROOT_CODE}`
                          : `💡 Super Root has permission to manage all families and root users in the system. Default code: ${SUPER_ROOT_CODE}`}
                      </p>
                    </div>
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
                        setWantSuperRoot(false) // Disable super root khi chọn root
                        setSuperRootCode('')
                      }
                    }}
                    disabled={wantSuperRoot} // Disable nếu đã chọn super root
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
                    {/* Chọn hành động: Tạo mới hoặc Join family đã có */}
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
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                            rootAction === 'create'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          {language === 'vi' ? '✨ Tạo gia đình mới' : '✨ Create new family'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRootAction('join')
                            setFamilyName('')
                          }}
                          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                            rootAction === 'join'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          {language === 'vi' ? '🔑 Trở thành Root của gia đình đã có' : '🔑 Become Root of existing family'}
                        </button>
                      </div>
                    </div>

                    {/* Form tạo family mới */}
                    {rootAction === 'create' && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="familyName" className="block text-sm font-bold text-white mb-2">
                            {language === 'vi' ? 'Tên gia đình (tùy chọn):' : 'Family name (optional):'}
                          </label>
                          <input
                            id="familyName"
                            type="text"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            placeholder={language === 'vi' ? 'Tên gia đình của bạn' : 'Your family name'}
                            className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                          />
                        </div>

                        {/* Option để tự tạo mã code */}
                        <div className="bg-blue-600/90 border-2 border-blue-400 rounded-lg p-4 mb-3 shadow-xl">
                          <div className="flex items-center space-x-3 mb-3">
                            <input
                              type="checkbox"
                              id="useCustomCodes"
                              checked={useCustomCodes}
                              onChange={(e) => {
                                setUseCustomCodes(e.target.checked)
                                if (!e.target.checked) {
                                  setCustomFamilyCode('')
                                  setCustomRootCode('')
                                }
                              }}
                              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <label htmlFor="useCustomCodes" className="text-base font-bold text-white cursor-pointer flex items-center gap-2">
                              <span className="text-yellow-300 text-xl">✨</span>
                              <span className="bg-white/20 px-3 py-1 rounded">
                                {language === 'vi' ? 'Tự tạo mã code riêng (BẮT BUỘC nếu muốn dùng mã tùy chỉnh)' : 'Create custom codes (REQUIRED if you want custom codes)'}
                              </span>
                            </label>
                          </div>
                          {!useCustomCodes && (
                            <div className="bg-yellow-500/90 border-2 border-yellow-400 rounded p-3 ml-8">
                              <p className="text-sm text-white font-bold">
                                {language === 'vi' 
                                  ? '⚠️ Nếu bạn KHÔNG check ô này, hệ thống sẽ tự động tạo mã ngẫu nhiên (không phải mã bạn nhập)'
                                  : '⚠️ If you DO NOT check this, system will auto-generate random codes (not your input)'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Input cho custom codes */}
                        {useCustomCodes && (
                          <div className="space-y-4 bg-gradient-to-br from-green-600/95 to-emerald-600/95 p-5 rounded-lg border-2 border-green-400 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 bg-white/20 px-4 py-2 rounded-lg">
                              <span className="text-white text-2xl">✨</span>
                              <h4 className="text-lg font-bold text-white">
                                {language === 'vi' ? '📝 Mã Code Tùy Chỉnh (Custom Codes)' : '📝 Custom Codes'}
                              </h4>
                            </div>
                            
                            <div className="bg-slate-900/95 p-4 rounded-lg border-2 border-green-400 shadow-inner">
                              <label htmlFor="customFamilyCode" className="block text-base font-bold text-white mb-3 flex items-center gap-2">
                                <span className="bg-green-500 px-3 py-1 rounded text-white text-xs font-bold shadow-lg">CUSTOM</span>
                                <span className="text-white bg-black/30 px-2 py-1 rounded">
                                  {language === 'vi' ? 'Mã gia đình (6 ký tự):' : 'Family code (6 characters):'}
                                </span>
                              </label>
                              <input
                                id="customFamilyCode"
                                type="text"
                                value={customFamilyCode}
                                onChange={(e) => setCustomFamilyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                placeholder={language === 'vi' ? 'VD: ABC123' : 'E.g: ABC123'}
                                maxLength={6}
                                className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-white bg-black/50 placeholder-gray-400 text-base font-mono font-bold tracking-wider shadow-inner"
                              />
                              {customFamilyCode.length === 6 && (
                                <p className="text-sm text-green-200 mt-2 flex items-center gap-2 font-bold bg-green-600/30 px-2 py-1 rounded">
                                  <span className="text-green-300 text-lg">✓</span> 
                                  <span className="text-white">{language === 'vi' ? 'Mã hợp lệ!' : 'Valid code!'}</span>
                                </p>
                              )}
                            </div>
                            
                            <div className="bg-slate-900/95 p-4 rounded-lg border-2 border-green-400 shadow-inner">
                              <label htmlFor="customRootCode" className="block text-base font-bold text-white mb-3 flex items-center gap-2 flex-wrap">
                                <span className="bg-green-500 px-3 py-1 rounded text-white text-xs font-bold shadow-lg">CUSTOM</span>
                                <span className="text-white bg-black/30 px-2 py-1 rounded">
                                  {language === 'vi' ? 'Mã Root (6 ký tự, tùy chọn):' : 'Root code (6 characters, optional):'}
                                </span>
                                <span className="text-white bg-slate-700/80 px-2 py-1 rounded text-xs font-normal">
                                  {language === 'vi' ? '(để trống = tự tạo)' : '(leave empty = auto-generate)'}
                                </span>
                              </label>
                              <input
                                id="customRootCode"
                                type="text"
                                value={customRootCode}
                                onChange={(e) => setCustomRootCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                placeholder={language === 'vi' ? 'VD: ROOT01 (hoặc để trống)' : 'E.g: ROOT01 (or leave empty)'}
                                maxLength={6}
                                className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-white bg-black/50 placeholder-gray-400 text-base font-mono font-bold tracking-wider shadow-inner"
                              />
                              {customRootCode.length === 6 && (
                                <p className="text-sm text-green-200 mt-2 flex items-center gap-2 font-bold bg-green-600/30 px-2 py-1 rounded">
                                  <span className="text-green-300 text-lg">✓</span>
                                  <span className="text-white">{language === 'vi' ? 'Mã hợp lệ!' : 'Valid code!'}</span>
                                </p>
                              )}
                              {customRootCode.length > 0 && customRootCode.length < 6 && (
                                <p className="text-sm text-yellow-200 mt-2 font-bold bg-yellow-600/30 px-2 py-1 rounded">
                                  {language === 'vi' ? `Còn thiếu ${6 - customRootCode.length} ký tự` : `${6 - customRootCode.length} characters remaining`}
                                </p>
                              )}
                              <div className="bg-yellow-600/90 border-2 border-yellow-400 rounded p-3 mt-3">
                                <p className="text-sm text-white font-bold">
                                  {language === 'vi' 
                                    ? '⚠️ Khuyến nghị: KHÔNG nên dùng Root Code giống Family Code (vì lý do bảo mật)'
                                    : '⚠️ Recommendation: Do NOT use same Root Code as Family Code (for security)'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-blue-600/90 border-2 border-blue-400 rounded p-3">
                              <p className="text-sm text-white font-bold">
                                {language === 'vi' 
                                  ? '💡 Lưu ý: Mã code phải là duy nhất. Nếu mã đã tồn tại, hệ thống sẽ báo lỗi.'
                                  : '💡 Note: Codes must be unique. If code already exists, system will show an error.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {!useCustomCodes && (
                          <div className="bg-blue-600/90 border-2 border-blue-400 rounded-lg p-3">
                            <p className="text-sm text-white font-bold">
                              {language === 'vi' 
                                ? '💡 Hệ thống sẽ tự động tạo mã gia đình và mã Root riêng cho bạn'
                                : '💡 System will automatically create unique family code and root code for you'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form join family đã có */}
                    {rootAction === 'join' && (
                      <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-400">
                        <label htmlFor="rootCode" className="block text-sm font-bold text-white mb-2">
                          {language === 'vi' ? 'Mã Root của gia đình:' : 'Family Root Code:'}
                        </label>
                        <input
                          id="rootCode"
                          type="text"
                          value={rootCode}
                          onChange={(e) => setRootCode(e.target.value.toUpperCase())}
                          placeholder={language === 'vi' ? 'Nhập mã Root (6 ký tự)' : 'Enter root code (6 characters)'}
                          className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                          maxLength={6}
                        />
                        <div className="bg-yellow-500/90 border-2 border-yellow-400 rounded p-2 mt-3">
                          <p className="text-sm text-white font-bold">
                            {language === 'vi' 
                              ? '💡 Nhập mã Root mà root user hiện tại của gia đình đã cung cấp cho bạn'
                              : '💡 Enter the root code provided by the current root user of the family'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Join Family Option */}
              {!wantRoot && (
                <div className="bg-green-600/90 border-2 border-green-400 rounded-lg p-4 shadow-xl">
                  <label htmlFor="familyCode" className="block text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-yellow-300 text-xl">👨‍👩‍👧‍👦</span>
                    <span className="bg-white/20 px-3 py-1 rounded">
                      {language === 'vi' ? 'Mã gia đình (để tham gia):' : 'Family code (to join):'}
                    </span>
                  </label>
                  <input
                    id="familyCode"
                    type="text"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                    placeholder={language === 'vi' ? 'Nhập mã gia đình (6 ký tự)' : 'Enter family code (6 characters)'}
                    className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-white bg-black/50 placeholder-gray-400 text-sm font-bold"
                    maxLength={6}
                  />
                  <div className="bg-yellow-500/90 border-2 border-yellow-400 rounded p-2 mt-3">
                    <p className="text-sm text-white font-bold">
                      {language === 'vi' 
                        ? '💡 Nhập mã gia đình mà người quản trị (Root) đã cung cấp cho bạn'
                        : '💡 Enter the family code provided by your family admin (Root)'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('login.processing') : isLogin ? t('login.login') : t('login.signup')}
          </button>
        </form>

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

