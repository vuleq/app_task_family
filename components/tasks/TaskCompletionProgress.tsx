import React from 'react'

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
    return (
        <div className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/50">
            <h4 className="text-sm font-semibold text-gray-100 mb-3">
                🎯 {t('tasks.completionRewards')}
            </h4>
            <div className="grid grid-cols-3 gap-3">
                <div className={`bg-slate-700/50 rounded-lg p-3 border ${completionProgress.daily.completed
                        ? 'border-green-500/50 bg-green-500/10'
                        : completionProgress.daily.current >= completionProgress.daily.required
                            ? 'border-yellow-500/50' : 'border-slate-600'
                    }`}>
                    <p className="text-xs text-gray-400 mb-1">📅 {t('tasks.completionDaily')}</p>
                    <p className="text-sm font-semibold text-gray-200 mb-1">
                        {completionProgress.daily.current}/{completionProgress.daily.required} {t('tasks.completionTasks')}
                    </p>
                    <p className="text-xs text-yellow-400">
                        💰 {COMPLETION_REWARDS.daily.coins} {t('profile.coins')} + {COMPLETION_REWARDS.daily.xp} {t('profile.xp')}
                    </p>
                    {completionProgress.daily.completed && (
                        <p className="text-xs text-green-400 mt-1">✅ {t('tasks.completionRewardReceived')}</p>
                    )}
                </div>

                <div className={`bg-slate-700/50 rounded-lg p-3 border ${completionProgress.weekly.completed
                        ? 'border-green-500/50 bg-green-500/10'
                        : completionProgress.weekly.current >= completionProgress.weekly.required
                            ? 'border-yellow-500/50' : 'border-slate-600'
                    }`}>
                    <p className="text-xs text-gray-400 mb-1">📆 {t('tasks.completionWeekly')}</p>
                    <p className="text-sm font-semibold text-gray-200 mb-1">
                        {completionProgress.weekly.current}/{completionProgress.weekly.required} {t('tasks.completionDays')}
                    </p>
                    <p className="text-xs text-yellow-400">
                        💰 {COMPLETION_REWARDS.weekly.coins} {t('profile.coins')} + {COMPLETION_REWARDS.weekly.xp} {t('profile.xp')}
                    </p>
                    {completionProgress.weekly.completed && (
                        <p className="text-xs text-green-400 mt-1">✅ {t('tasks.completionRewardReceived')}</p>
                    )}
                </div>

                <div className={`bg-slate-700/50 rounded-lg p-3 border ${completionProgress.monthly.completed
                        ? 'border-green-500/50 bg-green-500/10'
                        : completionProgress.monthly.current >= completionProgress.monthly.required
                            ? 'border-yellow-500/50' : 'border-slate-600'
                    }`}>
                    <p className="text-xs text-gray-400 mb-1">🗓️ {t('tasks.completionMonthly')}</p>
                    <p className="text-sm font-semibold text-gray-200 mb-1">
                        {completionProgress.monthly.current}/{completionProgress.monthly.required} {t('tasks.completionWeeks')}
                    </p>
                    <p className="text-xs text-yellow-400">
                        💰 {COMPLETION_REWARDS.monthly.coins} {t('profile.coins')} + {COMPLETION_REWARDS.monthly.xp} {t('profile.xp')}
                    </p>
                    {completionProgress.monthly.completed && (
                        <p className="text-xs text-green-400 mt-1">✅ {t('tasks.completionRewardReceived')}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
