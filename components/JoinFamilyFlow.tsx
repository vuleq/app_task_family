'use client'

import { useState } from 'react'
import { createFamily, joinFamilyByCode, getFamilyByRootCode } from '@/lib/firebase/family'
import { updateProfile, UserProfile } from '@/lib/firebase/profile'
import { logout } from '@/lib/firebase/auth'
import { useI18n } from '@/lib/i18n/context'
import { User } from 'firebase/auth'
import Toast from './Toast'

interface JoinFamilyFlowProps {
    user: User
    profile: UserProfile | null
    onUpdated: () => void
    backgroundImage?: string | null
}

export default function JoinFamilyFlow({ user, profile, onUpdated, backgroundImage }: JoinFamilyFlowProps) {
    const { t, language } = useI18n()
    const [loading, setLoading] = useState(false)
    const [familyCode, setFamilyCode] = useState('')
    const [familyName, setFamilyName] = useState('')
    const [rootCode, setRootCode] = useState('')
    const [mode, setMode] = useState<'selection' | 'join' | 'create' | 'root_join'>('selection')
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

    const handleJoinFamily = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!familyCode.trim() || familyCode.trim().length !== 6) {
            setToast({
                show: true,
                message: language === 'vi' ? 'Mã gia đình phải có 6 ký tự' : 'Family code must be 6 characters',
                type: 'error'
            })
            return
        }

        setLoading(true)
        try {
            const result = await joinFamilyByCode(familyCode.trim().toUpperCase(), user.uid)
            if (result.success && result.familyId) {
                await updateProfile(user.uid, { familyId: result.familyId })
                onUpdated()
            } else {
                setToast({ show: true, message: result.error || 'Lỗi khi tham gia', type: 'error' })
            }
        } catch (err: any) {
            setToast({ show: true, message: err.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleJoinAsRoot = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rootCode.trim() || rootCode.trim().length !== 6) {
            setToast({
                show: true,
                message: language === 'vi' ? 'Mã Root phải có 6 ký tự' : 'Root code must be 6 characters',
                type: 'error'
            })
            return
        }

        setLoading(true)
        try {
            const family = await getFamilyByRootCode(rootCode.trim().toUpperCase())
            if (family) {
                await updateProfile(user.uid, {
                    familyId: family.id,
                    isRoot: true,
                    role: 'parent'
                })
                onUpdated()
            } else {
                setToast({
                    show: true,
                    message: language === 'vi' ? 'Mã Root không tồn tại' : 'Root code does not exist',
                    type: 'error'
                })
            }
        } catch (err: any) {
            setToast({ show: true, message: err.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateFamily = async (e: React.FormEvent) => {
        e.preventDefault()
        const name = familyName.trim() || user.displayName || user.email?.split('@')[0] || 'Family'

        setLoading(true)
        try {
            const result = await createFamily(name, user.uid)
            await updateProfile(user.uid, {
                familyId: result.familyId,
                isRoot: true,
                role: 'parent'
            })

            // Store codes to show to user
            if (typeof window !== 'undefined') {
                localStorage.setItem(`signup_familyCode_${user.uid}`, result.familyCode)
                localStorage.setItem(`signup_rootCode_${user.uid}`, result.rootCode)
            }

            onUpdated()
        } catch (err: any) {
            setToast({ show: true, message: err.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
    }

    const cardStyle = "bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50 transform transition-all duration-300"

    const containerStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
    } : {
        background: 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgb(15 23 42))',
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={containerStyle}>
            <div className={cardStyle}>
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4 animate-bounce">🏠</div>
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                        {language === 'vi' ? 'Chào mừng bạn!' : 'Welcome!'}
                    </h1>
                    <p className="text-slate-300 text-sm">
                        {language === 'vi'
                            ? 'Hãy tham gia hoặc tạo một gia đình để bắt đầu'
                            : 'Join or create a family to get started'}
                    </p>
                </div>

                {mode === 'selection' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('join')}
                            className="group w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-between transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/20"
                        >
                            <div className="text-left">
                                <div className="text-lg">{language === 'vi' ? 'Tham gia gia đình' : 'Join Family'}</div>
                                <div className="text-xs font-normal text-blue-100 opacity-80">{language === 'vi' ? 'Sử dụng mã được chia sẻ' : 'Use a shared code'}</div>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                        </button>

                        <button
                            onClick={() => setMode('create')}
                            className="group w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-between transition-all hover:scale-[1.02] shadow-lg shadow-emerald-900/20"
                        >
                            <div className="text-left">
                                <div className="text-lg">{language === 'vi' ? 'Tạo gia đình mới' : 'Create New Family'}</div>
                                <div className="text-xs font-normal text-emerald-100 opacity-80">{language === 'vi' ? 'Trở thành Root user' : 'Become a Root user'}</div>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                        </button>

                        <button
                            onClick={() => setMode('root_join')}
                            className="group w-full bg-amber-600 hover:bg-amber-500 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-between transition-all hover:scale-[1.02] shadow-lg shadow-amber-900/20"
                        >
                            <div className="text-left">
                                <div className="text-lg">{language === 'vi' ? 'Trở thành Root User' : 'Join as Root'}</div>
                                <div className="text-xs font-normal text-amber-100 opacity-80">{language === 'vi' ? 'Dùng mã Root của gia đình' : 'Use a Family Root code'}</div>
                            </div>
                            <span className="text-2xl group-hover:translate-x-1 transition-transform">🔑</span>
                        </button>

                        <div className="pt-6 border-t border-slate-700/50 mt-6">
                            <button
                                onClick={handleLogout}
                                className="w-full text-slate-400 hover:text-white text-sm transition-colors py-2"
                            >
                                {language === 'vi' ? 'Đăng xuất' : 'Sign Out'}
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'join' && (
                    <form onSubmit={handleJoinFamily} className="space-y-6">
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                {language === 'vi' ? 'Mã gia đình (6 ký tự)' : 'Family Code (6 characters)'}
                            </label>
                            <input
                                type="text"
                                value={familyCode}
                                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={6}
                                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all font-mono text-center text-xl tracking-widest"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                        >
                            {loading ? '...' : (language === 'vi' ? 'Tham gia ngay' : 'Join Now')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('selection')}
                            className="w-full text-slate-400 hover:text-slate-300 text-sm font-medium"
                        >
                            {language === 'vi' ? 'Quay lại' : 'Back'}
                        </button>
                    </form>
                )}

                {mode === 'root_join' && (
                    <form onSubmit={handleJoinAsRoot} className="space-y-6">
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                {language === 'vi' ? 'Mã Root (6 ký tự)' : 'Root Code (6 characters)'}
                            </label>
                            <input
                                type="text"
                                value={rootCode}
                                onChange={(e) => setRootCode(e.target.value.toUpperCase())}
                                placeholder="XYZ789"
                                maxLength={6}
                                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-all font-mono text-center text-xl tracking-widest"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20"
                        >
                            {loading ? '...' : (language === 'vi' ? 'Xác nhận Root User' : 'Confirm Root User')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('selection')}
                            className="w-full text-slate-400 hover:text-slate-300 text-sm font-medium"
                        >
                            {language === 'vi' ? 'Quay lại' : 'Back'}
                        </button>
                    </form>
                )}

                {mode === 'create' && (
                    <form onSubmit={handleCreateFamily} className="space-y-6">
                        <div>
                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                {language === 'vi' ? 'Tên gia đình' : 'Family Name'}
                            </label>
                            <input
                                type="text"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                placeholder={language === 'vi' ? 'Ví dụ: Gia đình Bình An' : 'e.g. Happy Family'}
                                className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-100/80">
                            {language === 'vi'
                                ? '💡 Bạn sẽ trở thành Root user - người có quyền tạo và quản lý nhiệm vụ cho mọi thành viên.'
                                : '💡 You will become a Root user - with permissions to create and manage tasks for all members.'}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? '...' : (language === 'vi' ? 'Tạo gia đình' : 'Create Family')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('selection')}
                            className="w-full text-slate-400 hover:text-slate-300 text-sm font-medium"
                        >
                            {language === 'vi' ? 'Quay lại' : 'Back'}
                        </button>
                    </form>
                )}
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
