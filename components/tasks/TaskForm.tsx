import React, { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import { Language } from '@/lib/i18n/translations'

interface TaskFormProps {
    users: UserProfile[]
    currentUser: { uid: string }
    language: Language
    t: any
    initialData?: {
        title: string
        description: string
        type: 'daily' | 'weekly' | 'monthly' | 'recurring'
        xpReward: number
        coinReward: number
        category?: 'hoc' | 'khac' | ''
    } | null
    onSubmit: (
        taskData: { title: string; description: string; type: 'daily' | 'weekly' | 'monthly' | 'recurring'; xpReward: number; coinReward: number; category?: 'hoc' | 'khac' },
        selectedUsers: string[],
        saveAsTemplate: boolean
    ) => void
    onCancel: () => void
}

export default function TaskForm({ users, currentUser, language, t, initialData, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'daily' | 'weekly' | 'monthly' | 'recurring'>('daily')
    const [xpReward, setXpReward] = useState(10)
    const [coinReward, setCoinReward] = useState(5)
    const [category, setCategory] = useState<'hoc' | 'khac' | ''>('')
    const [saveAsTemplate, setSaveAsTemplate] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title)
            setDescription(initialData.description || '')
            setType(initialData.type)
            setXpReward(initialData.xpReward)
            setCoinReward(initialData.coinReward)
            setCategory(initialData.category || '')
            setSelectedUsers([])
            setSaveAsTemplate(false)
        }
    }, [initialData])

    const handleSubmit = () => {
        onSubmit(
            { title, description, type, xpReward, coinReward, category: category || undefined },
            selectedUsers,
            saveAsTemplate
        )
        if (!initialData) {
            setTitle('')
            setDescription('')
            setXpReward(10)
            setCoinReward(5)
            setSelectedUsers([])
            setSaveAsTemplate(false)
        }
    }

    return (
        <div id="add-task-form" className="kid-card p-8 bg-white border-violet-100 shadow-kid animate-bounce-in">
            <div className="flex justify-between items-center bg-violet-50 -mx-8 -mt-8 p-6 rounded-t-[2rem] border-b-4 border-violet-100 mb-8">
                <h4 className="text-2xl font-black text-violet-900 flex items-center gap-3">
                    <span className="text-3xl animate-bounce-slow">{initialData ? '📋' : '✨'}</span>
                    {initialData ? t('tasks.useTemplate') : t('tasks.addTask')}
                </h4>
                <button 
                    onClick={onCancel} 
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border-2 border-violet-100 text-violet-400 hover:text-violet-600 hover:border-violet-200 transition-all shadow-soft active:scale-90"
                >
                    <span className="text-2xl font-black">✕</span>
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('tasks.taskTitle')}</label>
                    <input
                        type="text"
                        placeholder={language === 'vi' ? "VD: Quét nhà, Học tiếng Anh..." : "Ex: Cleaning, Studying..."}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-violet-100 rounded-2xl bg-violet-50/30 text-violet-900 placeholder-violet-200 focus:border-violet-300 focus:bg-white outline-none transition-all font-black text-lg shadow-inner"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('tasks.taskDescription')}</label>
                    <textarea
                        placeholder={language === 'vi' ? "Thêm chi tiết để bé hiểu rõ hơn nhé..." : "Add details for the kids..."}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-violet-100 rounded-2xl bg-violet-50/30 text-violet-900 placeholder-violet-200 focus:border-violet-300 focus:bg-white outline-none transition-all font-bold min-h-[100px] shadow-inner"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('tasks.taskType')}</label>
                        <div className="relative group">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full px-6 py-4 border-2 border-violet-100 rounded-2xl bg-violet-50/30 text-violet-900 font-black focus:border-violet-300 focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-inner pr-12"
                            >
                                <option value="daily">📅 {t('tasks.taskTypeDaily')}</option>
                                <option value="weekly">🗓️ {t('tasks.taskTypeWeekly')}</option>
                                <option value="monthly">🌙 {t('tasks.taskTypeMonthly')}</option>
                                <option value="recurring">🔁 {t('tasks.taskTypeRecurring')}</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400 font-black">▼</div>
                        </div>
                        {type === 'weekly' && <p className="text-[10px] text-accent-500 font-black mt-2 ml-1 animate-pulse flex items-center gap-1"><span>ℹ️</span> {t('tasks.weeklyTaskInfo')}</p>}
                        {type === 'monthly' && <p className="text-[10px] text-accent-500 font-black mt-2 ml-1 animate-pulse flex items-center gap-1"><span>ℹ️</span> {t('tasks.monthlyTaskInfo')}</p>}
                        {type === 'recurring' && <p className="text-[10px] text-accent-500 font-black mt-2 ml-1 animate-pulse flex items-center gap-1"><span>ℹ️</span> {t('tasks.recurringTaskInfo')}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">
                            {language === 'vi' ? '👥 Giao cho' : '👥 Assign to'} {selectedUsers.length > 0 && '(' + selectedUsers.length + ')'}
                        </label>
                        <div className="border-2 border-violet-100 rounded-2xl p-3 max-h-40 overflow-y-auto bg-violet-50/20 custom-scrollbar space-y-1">
                            {users.map(user => (
                                <label key={user.id} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all border-2 border-transparent ${selectedUsers.includes(user.id) ? 'bg-white border-violet-100 shadow-soft' : 'hover:bg-violet-50'}`}>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selectedUsers.includes(user.id) ? 'bg-violet-600 border-violet-600 shadow-soft' : 'bg-white border-violet-200'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedUsers([...selectedUsers, user.id])
                                                else setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                            }}
                                            className="hidden"
                                        />
                                        {selectedUsers.includes(user.id) && <span className="text-white text-xs font-black">✓</span>}
                                    </div>
                                    <span className="text-sm font-black text-violet-900">
                                        {user.name} {user.id === currentUser.uid ? '(' + (language === 'vi' ? 'Tôi' : 'Me') + ')' : ''}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedUsers.length === 0 && (
                            <p className="text-[10px] text-red-400 font-black mt-2 ml-1 flex items-center gap-1"><span>⚠️</span> {t('tasks.selectAtLeastOnePerson')}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('tasks.xpReward')}</label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-125 transition-transform">⚡</span>
                            <input
                                type="number"
                                value={xpReward}
                                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                                className="w-full pl-16 pr-6 py-4 border-2 border-violet-100 rounded-2xl bg-violet-50/30 text-violet-900 font-black focus:border-violet-300 focus:bg-white outline-none transition-all shadow-inner text-lg"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('tasks.coinReward')}</label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-125 transition-transform">🪙</span>
                            <input
                                type="number"
                                value={coinReward}
                                onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
                                className="w-full pl-16 pr-6 py-4 border-2 border-violet-100 rounded-2xl bg-violet-50/30 text-violet-900 font-black focus:border-violet-300 focus:bg-white outline-none transition-all shadow-inner text-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-violet-50/50 rounded-[2rem] border-2 border-violet-50 space-y-4">
                    <button 
                        onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                        className="flex items-center space-x-4 cursor-pointer group w-full text-left"
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-4 transition-all shadow-soft ${saveAsTemplate ? 'bg-violet-600 border-white' : 'bg-white border-violet-100 group-hover:border-violet-200'}`}>
                            {saveAsTemplate && <span className="text-white font-black">✓</span>}
                        </div>
                        <div className="flex-1">
                            <span className="text-sm font-black text-violet-900 uppercase tracking-tight">
                                {t('tasks.saveAsTemplate')}
                            </span>
                            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">
                                {language === 'vi' ? 'Lưu lại để dùng cho lần sau' : 'Reuse this task later'}
                            </p>
                        </div>
                    </button>
                    
                    {saveAsTemplate && (
                        <div className="pt-2 animate-bounce-in space-y-2">
                            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest ml-1">{t('tasks.templateCategory')}</label>
                            <div className="relative group">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as any)}
                                    className="w-full px-6 py-4 border-2 border-white rounded-2xl bg-white text-violet-900 font-black outline-none cursor-pointer shadow-soft appearance-none pr-12"
                                >
                                    <option value="">🌈 {t('tasks.noCategory')}</option>
                                    <option value="hoc">📚 {t('tasks.categoryStudy')}</option>
                                    <option value="khac">✨ {t('tasks.categoryOther')}</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-violet-300">▼</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!title || selectedUsers.length === 0}
                        className="w-full btn-playful bg-violet-600 text-white px-8 py-5 rounded-[2rem] text-xl font-black shadow-kid hover:bg-violet-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <span className="text-2xl transition-transform group-hover:rotate-12">
                            {type === 'daily' ? '🚀' : type === 'weekly' ? '🔥' : type === 'recurring' ? '🔁' : '💎'}
                        </span>
                        {type === 'daily' ? t('tasks.addTask') :
                            type === 'weekly' ? (language === 'vi' ? 'Tạo 6 nhiệm vụ ngày' : 'Create 6 daily tasks') :
                            type === 'recurring' ? (language === 'vi' ? 'Tạo nhiệm vụ lặp lại' : 'Create recurring task') :
                                (language === 'vi' ? 'Tạo 26 nhiệm vụ ngày' : 'Create 26 daily tasks')}
                    </button>
                </div>
            </div>
        </div>
    )
}
