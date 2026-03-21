import React from 'react'

interface DaySelectorProps {
    weekDates: string[]
    language: string
    selectedDate: string
    selectedDay: number
    setSelectedDay: (index: number) => void
    tasks: any[]
    currentUserId: string
}

export default function DaySelector({
    weekDates,
    language,
    selectedDay,
    setSelectedDay,
    tasks,
    currentUserId,
    selectedDate
}: DaySelectorProps) {
    return (
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar snap-x">
            {weekDates.map((dateStr, index) => {
                const date = new Date(dateStr + 'T00:00:00')
                const dayNames = language === 'vi' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                const dayName = dayNames[index]
                const dayNumber = date.getDate()

                const dayTasks = tasks.filter(t => t.assignedTo === currentUserId && t.type === 'daily' && t.taskDate === dateStr && (t.status === 'completed' || t.status === 'approved'))
                const completedCount = dayTasks.length
                const studyCount = dayTasks.filter(t => t.category === 'hoc').length
                const isDayComplete = completedCount >= 6 && studyCount >= 2

                return (
                    <button
                        key={dateStr}
                        onClick={() => setSelectedDay(index)}
                        className={`group relative p-4 min-w-[85px] transition-all duration-500 flex flex-col items-center flex-shrink-0 rounded-[2rem] snap-center border-4 ${selectedDay === index
                                ? 'bg-violet-600 border-violet-800 text-white shadow-kid scale-110 -translate-y-2'
                                : 'bg-white border-violet-50 text-violet-400 hover:border-violet-100 hover:bg-violet-50 hover:shadow-soft'
                            }`}
                    >
                        {/* Selected Indicator Glow */}
                        {selectedDay === index && (
                            <div className="absolute inset-0 bg-violet-400 rounded-[1.8rem] blur-xl opacity-20 -z-10 animate-pulse" />
                        )}
                        
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors ${selectedDay === index ? 'text-violet-200' : 'text-violet-300'}`}>
                            {dayName}
                        </span>
                        
                        <span className={`text-2xl font-black transition-colors ${selectedDay === index ? 'text-white' : 'text-violet-900 group-hover:text-violet-600'}`}>
                            {dayNumber}
                        </span>
                        
                        <div className="mt-3 flex items-center justify-center min-h-[24px]">
                            {isDayComplete ? (
                                <div className="text-xl animate-bounce-slow drop-shadow-md">🌟</div>
                            ) : completedCount > 0 ? (
                                <div className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black border-2 transition-all shadow-soft ${selectedDay === index ? 'bg-violet-500 border-violet-400 text-white' : 'bg-violet-50 border-white text-violet-600'}`}>
                                    {completedCount}
                                </div>
                            ) : (
                                <div className={`w-2 h-2 rounded-full transition-all ${selectedDay === index ? 'bg-violet-400 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-violet-50 group-hover:bg-violet-200'}`}></div>
                            )}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
