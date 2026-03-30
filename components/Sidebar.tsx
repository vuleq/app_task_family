'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import { logout } from '@/lib/firebase/auth'
import { useI18n } from '@/lib/i18n/context'
import { getFamilyById, Family } from '@/lib/firebase/family'
import { calculateLevel } from '@/lib/utils/level'
const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
)

const ShoppingBagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
)

const ChartBarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
)

const CheckBadgeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
)

const BeakerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .462.202.9.553 1.201a4.5 4.5 0 0 1 1.447 3.451v3.451a4.5 4.5 0 0 1-1.447 3.451c-.351.302-.553.739-.553 1.201v1.244c0 1.543 1.488 2.657 3 2.657s3-1.114 3-2.657v-1.244c0-.462-.202-.9-.553-1.201a4.5 4.5 0 0 1-1.447-3.451V9c0-1.558.793-2.914 2-3.714m-12 0c1.207.8 2 2.156 2 3.714v3.451a4.5 4.5 0 0 1-1.447 3.451c-.351.302-.553.739-.553 1.201v1.244c0 1.543 1.488 2.657 3 2.657s3-1.114 3-2.657v-1.244c0-.462-.202-.9-.553-1.201a4.5 4.5 0 0 1-1.447-3.451V9c0-1.558.793-2.914 2-3.714" />
    </svg>
)

const GlobeAltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
)

const ArrowLeftOnRectangleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
)

const Bars3Icon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
)

const XMarkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
)

interface SidebarProps {
    profile: UserProfile
    onUpdate?: () => void
}

export default function Sidebar({ profile, onUpdate }: SidebarProps) {
    const { t, language, setLanguage } = useI18n()
    const [familyInfo, setFamilyInfo] = useState<Family | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const loadFamilyInfo = useCallback(async () => {
        if (!profile.familyId) return
        try {
            const family = await getFamilyById(profile.familyId)
            setFamilyInfo(family)
        } catch (error) {
            console.error('Error loading family info in Sidebar:', error)
        }
    }, [profile.familyId])

    useEffect(() => {
        if (profile.familyId) {
            loadFamilyInfo()
        }
    }, [profile.familyId, loadFamilyInfo])

    const handleLogout = async () => {
        try {
            await logout()
            window.location.href = '/'
        } catch (error: any) {
            console.error('Error logging out:', error)
        }
    }

    const toggleSidebar = () => setIsOpen(!isOpen)

    const navItems = [
        { id: 'tasks', label: t('tasks.title'), icon: HomeIcon, sectionId: 'tasks-section' },
        { id: 'approval', label: t('approval.title'), icon: CheckBadgeIcon, sectionId: 'approval-section' },
        { id: 'shop', label: t('shop.title'), icon: ShoppingBagIcon, sectionId: 'shop-section' },
        { id: 'chests', label: t('chests.title'), icon: BeakerIcon, sectionId: 'chests-section' },
        { id: 'statistics', label: t('statistics.title'), icon: ChartBarIcon, sectionId: 'statistics-section' },
        { id: 'profile', label: t('profile.title'), icon: UserIcon, sectionId: 'profile-section' },
    ]

    const adminItems = [
        { id: 'monitoring', label: t('monitoring.title'), icon: GlobeAltIcon, sectionId: 'monitoring-section', show: profile.isRoot },
        { id: 'dashboard', label: t('dashboard.title'), icon: UsersIcon, sectionId: 'dashboard-section', show: profile.isRoot && !profile.isSuperRoot },
    ]

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            if (window.innerWidth < 1024) setIsOpen(false)
        }
    }

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 right-4 z-[60] p-3 bg-primary-600 text-white rounded-full shadow-lg border-2 border-primary-400 active:scale-95 transition-all"
            >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 bottom-0 z-[55]
        w-80 bg-white/95 backdrop-blur-md border-r-4 border-indigo-50
        flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 shadow-soft'}
      `}>
                {/* User Profile Summary */}
                <div className="p-8 border-b-4 border-indigo-50 bg-gradient-to-b from-indigo-50/30 to-white">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-400 to-indigo-600 rotate-3 overflow-hidden flex items-center justify-center flex-shrink-0 border-4 border-white shadow-kid group">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt={profile.name}
                                        className="w-full h-full object-cover -rotate-3 group-hover:scale-110 transition-transform"
                                    />
                                ) : (
                                    <span className="text-3xl text-white font-black -rotate-3">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-soft">
                                L{calculateLevel(profile.xp)}
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-indigo-900 truncate w-full uppercase tracking-tight">{profile.name}</h2>
                        {familyInfo && (
                            <p className="text-[10px] text-indigo-300 font-black tracking-widest mt-1 uppercase">{familyInfo.name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-indigo-50 rounded-2xl p-3 text-center border-2 border-indigo-100 shadow-soft transition-transform hover:scale-105 group">
                            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-black mb-1">XP</p>
                            <div className="flex items-center justify-center gap-1 font-black text-indigo-600">
                               <span className="text-xs">✨</span>
                               <span>{profile.xp}</span>
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-3 text-center border-2 border-amber-100 shadow-soft transition-transform hover:scale-105 group">
                            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-black mb-1">COINS</p>
                            <div className="flex items-center justify-center gap-1 font-black text-amber-600">
                               <span className="text-xs">🪙</span>
                               <span>{profile.coins}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 custom-scrollbar">
                    <p className="px-4 pb-4 text-[10px] uppercase tracking-[0.2em] text-indigo-200 font-black">Menu</p>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.sectionId)}
                            className="w-full flex items-center justify-between px-5 py-4 text-indigo-900 hover:bg-indigo-50/50 rounded-2xl transition-all group active:scale-95 border-2 border-transparent hover:border-indigo-50/50"
                        >
                            <div className="flex items-center space-x-4">
                               <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-white transition-colors">
                                  <item.icon className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 transition-colors" />
                               </div>
                               <span className="font-black text-sm uppercase tracking-tight">{item.label}</span>
                            </div>
                            <span className="text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                    ))}

                    {adminItems.some(i => i.show) && (
                        <>
                            <div className="pt-8 pb-4">
                              <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-amber-300 font-black">Admin</p>
                            </div>
                            {adminItems.filter(i => i.show).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.sectionId)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-accent-700 hover:bg-accent-50/50 rounded-2xl transition-all group active:scale-95 border-2 border-transparent hover:border-accent-50/50"
                                >
                                    <div className="flex items-center space-x-4">
                                       <div className="p-2 bg-accent-50 rounded-xl group-hover:bg-white transition-colors">
                                          <item.icon className="w-5 h-5 text-accent-300 group-hover:text-accent-600 transition-colors" />
                                       </div>
                                       <span className="font-black text-sm uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    <span className="text-accent-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                            ))}
                        </>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="p-6 border-t-4 border-indigo-50 space-y-3 bg-white">
                    <button
                        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                        className="w-full flex items-center justify-between px-5 py-4 text-indigo-900 bg-indigo-50/30 hover:bg-indigo-50 rounded-2xl transition-all font-black active:scale-95 group border-2 border-indigo-50"
                    >
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="text-xl group-hover:scale-125 transition-transform duration-300">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
                            <span className="uppercase tracking-tight">{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 bg-white px-2 py-1 rounded-full border border-indigo-100">{language === 'vi' ? 'VI' : 'EN'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 px-5 py-4 text-red-500 bg-red-50/30 hover:bg-red-50 rounded-2xl transition-all font-black group active:scale-95 border-2 border-red-50"
                    >
                        <div className="p-2 bg-white rounded-xl shadow-soft">
                          <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="uppercase tracking-tight">{t('header.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
