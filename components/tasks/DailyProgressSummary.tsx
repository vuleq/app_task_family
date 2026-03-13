import React from 'react'

interface DailyProgressSummaryProps {
    language: string
    tasks: any[]
    currentUserId: string
    selectedDate: string
}

export default function DailyProgressSummary({ language, tasks, currentUserId, selectedDate }: DailyProgressSummaryProps) {
    const dayTasks = tasks.filter(t => t.assignedTo === currentUserId && t.type === 'daily' && t.taskDate === selectedDate)
    const completedTasks = dayTasks.filter(t => t.status === 'completed' || t.status === 'approved')
    const totalCompleted = completedTasks.length
    const studyCompleted = completedTasks.filter(t => t.category === 'hoc').length
    const otherCompleted = completedTasks.filter(t => t.category === 'khac').length
    const isDayComplete = totalCompleted >= 6 && studyCompleted >= 2

    return (
        <div className={`mb-6 p-5 rounded-xl border transition-all duration-300 shadow-sm ${isDayComplete
                ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/40 shadow-green-500/10'
                : 'bg-gradient-to-br from-slate-700/60 to-slate-800/80 border-slate-600 shadow-black/20'
            }`}>
            <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl">{isDayComplete ? '🏆' : '📊'}</span>
                <h4 className="font-semibold text-gray-100">
                    {language === 'vi' ? 'Tiến độ ngày hôm nay' : 'Today\'s Progress'}
                </h4>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-800/40 p-3 rounded-lg flex flex-col items-center justify-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{language === 'vi' ? 'Tổng cộng' : 'Total'}</p>
                    <p className={`text-2xl font-bold ${isDayComplete ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-gray-200'}`}>{totalCompleted}<span className="text-sm font-normal text-gray-500">/6</span></p>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg flex flex-col items-center justify-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{language === 'vi' ? 'Việc học' : 'Study'}</p>
                    <p className={`text-2xl font-bold ${studyCompleted >= 2 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-yellow-400'}`}>{studyCompleted}<span className="text-sm font-normal text-gray-500">/2</span></p>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg flex flex-col items-center justify-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{language === 'vi' ? 'Khác' : 'Other'}</p>
                    <p className="text-2xl font-bold text-gray-200">{otherCompleted}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
                {isDayComplete ? (
                    <p className="text-green-400 text-sm font-medium animate-pulse flex items-center space-x-1">
                        <span>✨</span>
                        <span>{language === 'vi' ? 'Tuyệt vời! Đã hoàn thành mục tiêu ngày.' : 'Awesome! Day goals completed.'}</span>
                        <span>✨</span>
                    </p>
                ) : (
                    <p className="text-yellow-400/90 text-sm flex items-center space-x-2 bg-yellow-400/10 px-3 py-1.5 rounded-md">
                        <span>⚠️</span>
                        <span>{language === 'vi'
                            ? `Cần hoàn thành ≥ 6 nhiệm vụ (incl. ≥ 2 việc học).`
                            : `Need ≥ 6 tasks (incl. ≥ 2 study tasks).`}
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
}
