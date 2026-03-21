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
        <div className={`mb-10 p-8 rounded-[2.5rem] border-4 transition-all duration-700 shadow-kid relative overflow-hidden ${isDayComplete
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-300 text-white'
                : 'bg-white border-violet-100 text-violet-900'
            }`}>
            
            {/* Decorative elements */}
            {isDayComplete && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)] animate-pulse-slow" />
                </div>
            )}

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-soft ${isDayComplete ? 'bg-white/20' : 'bg-violet-50'}`}>
                       <span className={isDayComplete ? 'animate-bounce' : 'animate-pulse'}>{isDayComplete ? '🏆' : '🚀'}</span>
                    </div>
                    <h4 className={`text-2xl font-black uppercase tracking-tight ${isDayComplete ? 'text-white' : 'text-violet-900'}`}>
                        {language === 'vi' ? 'MỤC TIÊU HÔM NAY' : 'TODAY\'S GOALS'}
                    </h4>
                </div>
                {isDayComplete && (
                    <div className="bg-white/30 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/40 shadow-soft animate-bounce-in">
                       <span className="text-xs font-black uppercase tracking-widest">{language === 'vi' ? '🎉 HOÀN THÀNH!' : '🎉 NAILED IT!'}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div className={`p-6 rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all duration-500 hover:scale-[1.02] ${isDayComplete ? 'bg-white/10 border-white/20' : 'bg-violet-50/50 border-violet-100 shadow-inner'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDayComplete ? 'text-white/70' : 'text-violet-400'}`}>{language === 'vi' ? 'TỔNG NHIỆM VỤ' : 'TOTAL TASKS'}</p>
                    <div className="flex items-baseline gap-1">
                       <span className={`text-4xl font-black ${isDayComplete ? 'text-white' : 'text-violet-600'}`}>{totalCompleted}</span>
                       <span className={`text-sm font-black opacity-40`}>/ 6</span>
                    </div>
                    {totalCompleted >= 6 && !isDayComplete && <span className="text-[9px] font-black text-emerald-500 mt-2">✅ DONE</span>}
                </div>

                <div className={`p-6 rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all duration-500 hover:scale-[1.02] ${studyCompleted >= 2 ? (isDayComplete ? 'bg-white/20 border-white/30' : 'bg-emerald-50 border-emerald-200 shadow-soft') : (isDayComplete ? 'bg-white/10 border-white/20' : 'bg-amber-50 border-amber-100 shadow-inner')}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDayComplete ? 'text-white/70' : 'text-amber-500/80'}`}>{language === 'vi' ? 'HỌC TẬP' : 'STUDY'}</p>
                    <div className="flex items-baseline gap-1">
                       <span className={`text-4xl font-black ${isDayComplete ? 'text-white' : 'text-amber-600'}`}>{studyCompleted}</span>
                       <span className={`text-sm font-black opacity-40`}>/ 2</span>
                    </div>
                    {studyCompleted >= 2 && !isDayComplete && <span className="text-[9px] font-black text-emerald-500 mt-2">✅ DONE</span>}
                </div>

                <div className={`p-6 rounded-[2rem] flex flex-col items-center justify-center border-4 transition-all duration-500 hover:scale-[1.02] ${isDayComplete ? 'bg-white/10 border-white/20' : 'bg-indigo-50/50 border-indigo-100 shadow-inner'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDayComplete ? 'text-white/70' : 'text-indigo-400'}`}>{language === 'vi' ? 'CÔNG VIỆC KHÁC' : 'OTHERS'}</p>
                    <span className={`text-4xl font-black ${isDayComplete ? 'text-white' : 'text-indigo-600'}`}>{otherCompleted}</span>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center text-center relative z-10">
                {isDayComplete ? (
                    <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-[2rem] text-white font-black animate-pulse flex items-center gap-4 shadow-soft border-2 border-white/30">
                        <span className="text-3xl">✨</span>
                        <span className="uppercase tracking-tight">{language === 'vi' ? 'Bé thật xuất sắc! Tiếp tục vậy nhé!' : 'Brilliant job! Keep up the great work!'}</span>
                        <span className="text-3xl">✨</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 bg-violet-50/80 px-8 py-4 rounded-[2rem] border-2 border-violet-100 shadow-soft">
                        <span className="text-2xl animate-bounce-slow">🎨</span>
                        <span className="text-sm font-black text-violet-700 uppercase tracking-tight">
                            {language === 'vi'
                                ? `Gần xong rồi! Cần thêm ${Math.max(0, 6 - totalCompleted)} việc nữa thôi.`
                                : `Almost there! Just ${Math.max(0, 6 - totalCompleted)} more tasks to go.`}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
