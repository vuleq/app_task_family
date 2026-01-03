'use client'

import { useState, useEffect } from 'react'
import { loginWithEmail, signupWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

// Root code để tạo tài khoản root (có thể thay đổi sau)
const ROOT_CODE = 'FAMILY2024' // Có thể move vào .env.local sau

export default function LoginPage() {
  const { t, language } = useI18n()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [wantRoot, setWantRoot] = useState(false) // Checkbox muốn tạo root
  const [rootCode, setRootCode] = useState('') // Input root code
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
        // Kiểm tra root code nếu muốn tạo root
        let isRoot = false
        if (wantRoot) {
          if (rootCode.trim() !== ROOT_CODE) {
            setError(language === 'vi' 
              ? 'Mã Root không đúng. Vui lòng kiểm tra lại.'
              : 'Root code is incorrect. Please check again.')
            setLoading(false)
            return
          }
          isRoot = true
        }
        
        await signupWithEmail(email, password, isRoot)
      }
    } catch (err: any) {
      setError(err.message || t('login.errorOccurred'))
    } finally {
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-100 bg-slate-700/50 placeholder-gray-400"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-100 bg-slate-700/50 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {/* Root Account Option - Chỉ hiện khi đăng ký */}
          {!isLogin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wantRoot"
                  checked={wantRoot}
                  onChange={(e) => {
                    setWantRoot(e.target.checked)
                    if (!e.target.checked) {
                      setRootCode('')
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="wantRoot" className="text-sm font-medium text-gray-300 cursor-pointer">
                  {language === 'vi' ? '🔐 Tạo tài khoản quản trị (Root)' : '🔐 Create admin account (Root)'}
                </label>
              </div>
              {wantRoot && (
                <div>
                  <label htmlFor="rootCode" className="block text-xs font-medium text-gray-300 mb-1">
                    {language === 'vi' ? 'Mã Root:' : 'Root Code:'}
                  </label>
                  <input
                    id="rootCode"
                    type="text"
                    value={rootCode}
                    onChange={(e) => setRootCode(e.target.value)}
                    placeholder={language === 'vi' ? 'Nhập mã Root' : 'Enter root code'}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-100 bg-slate-700/50 placeholder-gray-400 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'vi' 
                      ? '💡 Mã Root cho phép bạn tạo và quản lý nhiệm vụ cho gia đình'
                      : '💡 Root code allows you to create and manage tasks for your family'}
                  </p>
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
              setRootCode('')
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

