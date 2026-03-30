import React from 'react'
import { useI18n } from '@/lib/i18n/context'

interface TaskCompletionProgressProps {
    completionProgress: {
        daily: { current: number; required: number; completed: boolean }
        weekly: { current: number; required: number; completed: boolean }
        monthly: { current: number; required: number; completed: boolean }
    }
    COMPLETION_REWARDS: any
    t: any
}

export function TaskCompletionProgress({ completionProgress, COMPLETION_REWARDS, t }: TaskCompletionProgressProps) {
    const { language } = useI18n()
    return (
        <div className="mb-8 kid-card p-8 border-amber-100 bg-gradient-to-br from-white to-amber-50/20 shadow-kid relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-30 animate-pulse-slow" />
            
            <div className="flex items-center justify-between mb-8 -mt-8 -mx-8 p-6 bg-amber-500 rounded-t-[2.5rem] border-b-4 border-amber-600/20 shadow-kid relative z-10">
                <h4 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className="text-3xl animate-bounce-slow">🎯</span>
                    {t('tasks.completionRewards')}
                </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Daily Card */}
                <div className={`kid-card p-6 flex flex-col transition-all relative overflow-hidden border-4 ${
                    completionProgress.daily.completed
                        ? 'border-emerald-200 bg-emerald-50 shadow-inner'
                        : completionProgress.daily.current >= completionProgress.daily.required
                            ? 'border-amber-300 bg-amber-50 shadow-kid animate-pulse-slow' 
                            : 'border-violet-100 bg-white shadow-soft'
                }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">📅</span>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${completionProgress.daily.completed ? 'text-emerald-600' : 'text-violet-400'}`}>
                            {t('tasks.completionDaily')}
                        </p>
                    </div>
                    
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-violet-900 leading-none">
                                {completionProgress.daily.current}
                            </span>
                            <span className="text-violet-200 font-black text-lg">/</span>
                            <span className="text-sm text-violet-300 font-black">{completionProgress.daily.required}</span>
                        </div>
                        <span className="text-[10px] font-black text-violet-200 uppercase tracking-widest">{t('tasks.completionTasks')}</span>
                    </div>

                    <div className="w-full bg-violet-50 rounded-full h-3 mb-4 border-2 border-violet-50 overflow-hidden p-0.5">
                        <div 
                            className={`h-full transition-all duration-1000 rounded-full shadow-inner ${completionProgress.daily.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-400 to-violet-600'}`}
                            style={{ width: `${Math.min(100, (completionProgress.daily.current / completionProgress.daily.required) * 100)}%` }}
                        />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t-2 border-violet-50/50">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-100/50 rounded-xl text-[10px] font-black text-amber-700 shadow-sm border border-amber-200/50">
                            🪙 {COMPLETION_REWARDS.daily.coins}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-violet-100/50 rounded-xl text-[10px] font-black text-violet-700 shadow-sm border border-violet-200/50">
                            ⚡ {COMPLETION_REWARDS.daily.xp}
                        </span>
                    </div>

                    {completionProgress.daily.completed && (
                        <div className="absolute top-2 right-2 rotate-12 scale-110">
                            <span className="bg-emerald-500 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-kid border-2 border-white uppercase tracking-widest">
                                {language === 'vi' ? 'ĐÃ NHẬN!' : 'RECEIVED!'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Weekly Card */}
                <div className={`kid-card p-6 flex flex-col transition-all relative overflow-hidden border-4 ${
                    completionProgress.weekly.completed
                        ? 'border-emerald-200 bg-emerald-50 shadow-inner'
                        : completionProgress.weekly.current >= completionProgress.weekly.required
                            ? 'border-amber-300 bg-amber-50 shadow-kid animate-pulse-slow' 
                            : 'border-indigo-100 bg-white shadow-soft'
                }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">📆</span>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${completionProgress.weekly.completed ? 'text-emerald-600' : 'text-indigo-400'}`}>
                            {t('tasks.completionWeekly')}
                        </p>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-indigo-900 leading-none">
                                {completionProgress.weekly.current}
                            </span>
                            <span className="text-indigo-200 font-black text-lg">/</span>
                            <span className="text-sm text-indigo-300 font-black">{completionProgress.weekly.required}</span>
                        </div>
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{t('tasks.completionDays')}</span>
                    </div>

                    <div className="w-full bg-indigo-50 rounded-full h-3 mb-4 border-2 border-indigo-50 overflow-hidden p-0.5">
                        <div 
                            className={`h-full transition-all duration-1000 rounded-full shadow-inner ${completionProgress.weekly.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`}
                            style={{ width: `${Math.min(100, (completionProgress.weekly.current / completionProgress.weekly.required) * 100)}%` }}
                        />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t-2 border-indigo-50/50">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-100/50 rounded-xl text-[10px] font-black text-amber-700 shadow-sm border border-amber-200/50">
                            🪙 {COMPLETION_REWARDS.weekly.coins}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100/50 rounded-xl text-[10px] font-black text-indigo-700 shadow-sm border border-indigo-200/50">
                            ⚡ {COMPLETION_REWARDS.weekly.xp}
                        </span>
                    </div>

                    {completionProgress.weekly.completed && (
                        <div className="absolute top-2 right-2 rotate-12 scale-110">
                            <span className="bg-emerald-500 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-kid border-2 border-white uppercase tracking-widest">
                                {language === 'vi' ? 'ĐÃ NHẬN!' : 'RECEIVED!'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Monthly Card */}
                <div className={`kid-card p-6 flex flex-col transition-all relative overflow-hidden border-4 ${
                    completionProgress.monthly.completed
                        ? 'border-emerald-200 bg-emerald-50 shadow-inner'
                        : completionProgress.monthly.current >= completionProgress.monthly.required
                            ? 'border-amber-300 bg-amber-50 shadow-kid animate-pulse-slow' 
                            : 'border-blue-100 bg-white shadow-soft'
                }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🗓️</span>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${completionProgress.monthly.completed ? 'text-emerald-600' : 'text-blue-400'}`}>
                            {t('tasks.completionMonthly')}
                        </p>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-blue-900 leading-none">
                                {completionProgress.monthly.current}
                            </span>
                            <span className="text-blue-200 font-black text-lg">/</span>
                            <span className="text-sm text-blue-300 font-black">{completionProgress.monthly.required}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{t('tasks.completionWeeks')}</span>
                    </div>

                    <div className="w-full bg-blue-50 rounded-full h-3 mb-4 border-2 border-blue-50 overflow-hidden p-0.5">
                        <div 
                            className={`h-full transition-all duration-1000 rounded-full shadow-inner ${completionProgress.monthly.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                            style={{ width: `${Math.min(100, (completionProgress.monthly.current / completionProgress.monthly.required) * 100)}%` }}
                        />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t-2 border-blue-50/50">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-100/50 rounded-xl text-[10px] font-black text-amber-700 shadow-sm border border-amber-200/50">
                            🪙 {COMPLETION_REWARDS.monthly.coins}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/50 rounded-xl text-[10px] font-black text-blue-700 shadow-sm border border-blue-200/50">
                            ⚡ {COMPLETION_REWARDS.monthly.xp}
                        </span>
                    </div>

                    {completionProgress.monthly.completed && (
                        <div className="absolute top-2 right-2 rotate-12 scale-110">
                            <span className="bg-emerald-500 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-kid border-2 border-white uppercase tracking-widest">
                                {language === 'vi' ? 'ĐÃ NHẬN!' : 'RECEIVED!'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
