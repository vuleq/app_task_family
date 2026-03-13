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
        <div className="mb-4 grid grid-cols-3 gap-3">
            <div className={`bg-slate-700/50 rounded-lg p-3 border ${taskLimits.daily.tasks >= TASK_LIMITS.daily.maxTasks || taskLimits.daily.coins >= TASK_LIMITS.daily.maxCoins
                    ? 'border-red-500/50' : 'border-slate-600'
                }`}>
                <p className="text-xs text-gray-400 mb-1">📅 {language === 'vi' ? 'Ngày' : 'Daily'}</p>
                <p className="text-sm font-semibold text-gray-200">
                    {taskLimits.daily.tasks}/{TASK_LIMITS.daily.maxTasks} {language === 'vi' ? 'nhiệm vụ' : 'tasks'}
                </p>
                <p className="text-sm font-semibold text-yellow-400">
                    {taskLimits.daily.coins}/{TASK_LIMITS.daily.maxCoins} {language === 'vi' ? 'coin' : 'coins'}
                </p>
                {(taskLimits.daily.tasks >= TASK_LIMITS.daily.maxTasks || taskLimits.daily.coins >= TASK_LIMITS.daily.maxCoins) && (
                    <p className="text-xs text-red-400 mt-1">⚠️ {language === 'vi' ? 'Đã đạt giới hạn' : 'Limit reached'}</p>
                )}
            </div>

            <div className={`bg-slate-700/50 rounded-lg p-3 border ${taskLimits.weekly.tasks >= TASK_LIMITS.weekly.maxTasks || taskLimits.weekly.coins >= TASK_LIMITS.weekly.maxCoins
                    ? 'border-red-500/50' : 'border-slate-600'
                }`}>
                <p className="text-xs text-gray-400 mb-1">📆 {language === 'vi' ? 'Tuần' : 'Weekly'}</p>
                <p className="text-sm font-semibold text-gray-200">
                    {taskLimits.weekly.tasks}/{TASK_LIMITS.weekly.maxTasks} {language === 'vi' ? 'nhiệm vụ' : 'tasks'}
                </p>
                <p className="text-sm font-semibold text-yellow-400">
                    {taskLimits.weekly.coins}/{TASK_LIMITS.weekly.maxCoins} {language === 'vi' ? 'coin' : 'coins'}
                </p>
                {(taskLimits.weekly.tasks >= TASK_LIMITS.weekly.maxTasks || taskLimits.weekly.coins >= TASK_LIMITS.weekly.maxCoins) && (
                    <p className="text-xs text-red-400 mt-1">⚠️ {language === 'vi' ? 'Đã đạt giới hạn' : 'Limit reached'}</p>
                )}
            </div>

            <div className={`bg-slate-700/50 rounded-lg p-3 border ${taskLimits.monthly.tasks >= TASK_LIMITS.monthly.maxTasks || taskLimits.monthly.coins >= TASK_LIMITS.monthly.maxCoins
                    ? 'border-red-500/50' : 'border-slate-600'
                }`}>
                <p className="text-xs text-gray-400 mb-1">🗓️ {language === 'vi' ? 'Tháng' : 'Monthly'}</p>
                <p className="text-sm font-semibold text-gray-200">
                    {taskLimits.monthly.tasks}/{TASK_LIMITS.monthly.maxTasks} {language === 'vi' ? 'nhiệm vụ' : 'tasks'}
                </p>
                <p className="text-sm font-semibold text-yellow-400">
                    {taskLimits.monthly.coins}/{TASK_LIMITS.monthly.maxCoins} {language === 'vi' ? 'coin' : 'coins'}
                </p>
                {(taskLimits.monthly.tasks >= TASK_LIMITS.monthly.maxTasks || taskLimits.monthly.coins >= TASK_LIMITS.monthly.maxCoins) && (
                    <p className="text-xs text-red-400 mt-1">⚠️ {language === 'vi' ? 'Đã đạt giới hạn' : 'Limit reached'}</p>
                )}
            </div>
        </div>
    )
}
