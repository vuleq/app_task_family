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
        <div className="flex space-x-2 mb-4 border-b border-slate-600 overflow-x-auto pb-2">
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
                        className={`px-3 py-2 font-medium transition-all duration-200 whitespace-nowrap flex flex-col items-center flex-shrink-0 rounded-t-lg ${selectedDay === index
                                ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-500/10'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/50'
                            }`}
                    >
                        <span className="text-xs uppercase tracking-wider">{dayName}</span>
                        <span className={`text-sm font-bold ${selectedDay === index ? 'text-primary-300' : ''}`}>{dayNumber}</span>
                        <div className="mt-1 h-4 flex items-center justify-center">
                            {isDayComplete && <span className="text-xs text-green-400" title="Day Complete">✓</span>}
                            {!isDayComplete && completedCount > 0 && <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full text-yellow-400">{completedCount}/6</span>}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
