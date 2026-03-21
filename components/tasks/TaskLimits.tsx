import React from 'react'

interface TaskLimitsProps {
    taskLimits: {
        daily: { tasks: number; coins: number }
        weekly: { tasks: number; coins: number }
        monthly: { tasks: number; coins: number }
    }
    TASK_LIMITS: any
    language: string
}

export function TaskLimits({ taskLimits, TASK_LIMITS, language }: TaskLimitsProps) {
    return (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Daily Limit */}
            <div className={`kid-card p-6 border-4 transition-all duration-500 shadow-soft relative overflow-hidden ${
                taskLimits.daily.tasks >= TASK_LIMITS.daily.maxTasks || taskLimits.daily.coins >= TASK_LIMITS.daily.maxCoins
                    ? 'border-red-200 bg-red-50/20' : 'border-violet-100 bg-white'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📅</span>
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">{language === 'vi' ? 'Giới hạn Ngày' : 'Daily Goal'}</p>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-violet-900 uppercase tracking-tight">{language === 'vi' ? 'Nhiệm vụ' : 'Tasks'}</span>
                            <span className={`text-sm font-black ${taskLimits.daily.tasks >= TASK_LIMITS.daily.maxTasks ? 'text-red-500' : 'text-violet-600'}`}>
                                {taskLimits.daily.tasks} <span className="text-violet-200">/</span> {TASK_LIMITS.daily.maxTasks}
                            </span>
                        </div>
                        <div className="w-full bg-violet-50 rounded-full h-2 overflow-hidden border border-violet-50">
                            <div 
                                className={`h-full transition-all duration-1000 rounded-full ${taskLimits.daily.tasks >= TASK_LIMITS.daily.maxTasks ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-violet-500'}`}
                                style={{ width: `${Math.min(100, (taskLimits.daily.tasks / TASK_LIMITS.daily.maxTasks) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-tight">{language === 'vi' ? 'Tiền vàng' : 'Coins'}</span>
                            <span className={`text-sm font-black ${taskLimits.daily.coins >= TASK_LIMITS.daily.maxCoins ? 'text-orange-600' : 'text-amber-500'}`}>
                                {taskLimits.daily.coins} <span className="text-amber-100">/</span> {TASK_LIMITS.daily.maxCoins}
                            </span>
                        </div>
                        <div className="w-full bg-amber-50 rounded-full h-2 overflow-hidden border border-amber-50">
                            <div 
                                className={`h-full transition-all duration-1000 rounded-full ${taskLimits.daily.coins >= TASK_LIMITS.daily.maxCoins ? 'bg-orange-600' : 'bg-amber-400'}`}
                                style={{ width: `${Math.min(100, (taskLimits.daily.coins / TASK_LIMITS.daily.maxCoins) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {(taskLimits.daily.tasks >= TASK_LIMITS.daily.maxTasks || taskLimits.daily.coins >= TASK_LIMITS.daily.maxCoins) && (
                    <div className="mt-4 pt-4 border-t-2 border-red-100/50">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                            {language === 'vi' ? '⚠️ Bé đã đạt giới hạn hôm nay!' : '⚠️ Daily target reached!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Weekly Limit */}
            <div className={`kid-card p-6 border-4 transition-all duration-500 shadow-soft relative overflow-hidden ${
                taskLimits.weekly.tasks >= TASK_LIMITS.weekly.maxTasks || taskLimits.weekly.coins >= TASK_LIMITS.weekly.maxCoins
                    ? 'border-red-200 bg-red-50/20' : 'border-indigo-100 bg-white'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📆</span>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{language === 'vi' ? 'Giới hạn Tuần' : 'Weekly Goal'}</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-indigo-900 uppercase tracking-tight">{language === 'vi' ? 'Nhiệm vụ' : 'Tasks'}</span>
                            <span className={`text-sm font-black ${taskLimits.weekly.tasks >= TASK_LIMITS.weekly.maxTasks ? 'text-red-500' : 'text-indigo-600'}`}>
                                {taskLimits.weekly.tasks} <span className="text-indigo-200">/</span> {TASK_LIMITS.weekly.maxTasks}
                            </span>
                        </div>
                        <div className="w-full bg-indigo-50 rounded-full h-2 overflow-hidden border border-indigo-50">
                            <div 
                                className={`h-full transition-all duration-1000 rounded-full ${taskLimits.weekly.tasks >= TASK_LIMITS.weekly.maxTasks ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, (taskLimits.weekly.tasks / TASK_LIMITS.weekly.maxTasks) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-tight">{language === 'vi' ? 'Tiền vàng' : 'Coins'}</span>
                            <span className={`text-sm font-black ${taskLimits.weekly.coins >= TASK_LIMITS.weekly.maxCoins ? 'text-orange-600' : 'text-amber-500'}`}>
                                {taskLimits.weekly.coins} <span className="text-amber-100">/</span> {TASK_LIMITS.weekly.maxCoins}
                            </span>
                        </div>
                        <div className="w-full bg-amber-50 rounded-full h-2 overflow-hidden border border-amber-50">
                            <div 
                                className={`h-full transition-all duration-1000 rounded-full ${taskLimits.weekly.coins >= TASK_LIMITS.weekly.maxCoins ? 'bg-orange-600' : 'bg-amber-400'}`}
                                style={{ width: `${Math.min(100, (taskLimits.weekly.coins / TASK_LIMITS.weekly.maxCoins) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
                {(taskLimits.weekly.tasks >= TASK_LIMITS.weekly.maxTasks || taskLimits.weekly.coins >= TASK_LIMITS.weekly.maxCoins) && (
                    <div className="mt-4 pt-4 border-t-2 border-red-100/50">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                            {language === 'vi' ? '⚠️ Bé đã đạt giới hạn tuần!' : '⚠️ Weekly target reached!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Monthly Limit */}
            <div className={`kid-card p-6 border-4 transition-all duration-500 shadow-soft relative overflow-hidden ${
                taskLimits.monthly.tasks >= TASK_LIMITS.monthly.maxTasks || taskLimits.monthly.coins >= TASK_LIMITS.monthly.maxCoins
                    ? 'border-red-200 bg-red-50/20' : 'border-blue-100 bg-white'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🗓️</span>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{language === 'vi' ? 'Giới hạn Tháng' : 'Monthly Goal'}</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-blue-900 uppercase tracking-tight">{language === 'vi' ? 'Nhiệm vụ' : 'Tasks'}</span>
                            <span className={`text-sm font-black ${taskLimits.monthly.tasks >= TASK_LIMITS.monthly.maxTasks ? 'text-red-500' : 'text-blue-600'}`}>
                                {taskLimits.monthly.tasks} <span className="text-blue-200">/</span> {TASK_LIMITS.monthly.maxTasks}
                            </span>
                        </div>
                        <div className="w-full bg-blue-50 rounded-full h-2 overflow-hidden border border-blue-50">
                            <div 
                                className={`h-full transition-all duration-1000 rounded-full ${taskLimits.monthly.tasks >= TASK_LIMITS.monthly.maxTasks ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (taskLimits.monthly.tasks / TASK_LIMITS.monthly.maxTasks) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-tight">{language === 'vi' ? 'Tiền vàng' : 'Coins'}</span>
                            <span className={`text-sm font-black ${taskLimits.monthly.coins >= TASK_LIMITS.monthly.maxCoins ? 'text-orange-600' : 'text-amber-500'}`}>
                                {taskLimits.monthly.coins} <span className="text-amber-100">/</span> {TASK_LIMITS.monthly.maxCoins}
                            </span>
                        </div>
                        <div className="w-full bg-amber-50 rounded-full h-2 overflow-hidden border border-amber-50">
                            <div 
                                className={`h-full transition-all duration-1000 rounded-full ${taskLimits.monthly.coins >= TASK_LIMITS.monthly.maxCoins ? 'bg-orange-600' : 'bg-amber-400'}`}
                                style={{ width: `${Math.min(100, (taskLimits.monthly.coins / TASK_LIMITS.monthly.maxCoins) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
                {(taskLimits.monthly.tasks >= TASK_LIMITS.monthly.maxTasks || taskLimits.monthly.coins >= TASK_LIMITS.monthly.maxCoins) && (
                    <div className="mt-4 pt-4 border-t-2 border-red-100/50">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
                            {language === 'vi' ? '⚠️ Xuất sắc! Bé đã phá kỉ lục tháng!' : '⚠️ Monthly target smashed!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
