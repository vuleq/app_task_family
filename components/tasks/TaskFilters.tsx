import React from 'react'

interface TaskFiltersProps {
    language: string
    categoryFilter: 'all' | 'hoc' | 'khac'
    setCategoryFilter: (filter: 'all' | 'hoc' | 'khac') => void
    t: (key: string) => string
}

export default function TaskFilters({ language, categoryFilter, setCategoryFilter, t }: TaskFiltersProps) {
    return (
        <div className="mb-8 flex flex-col md:flex-row items-center gap-6 p-6 bg-white/50 rounded-[2rem] border-4 border-violet-100 shadow-soft backdrop-blur-sm">
            <div className="flex items-center gap-3 shrink-0">
               <span className="text-2xl animate-pulse">🔍</span>
               <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] whitespace-nowrap">
                  {language === 'vi' ? 'LỌC NHIỆM VỤ' : 'FILTER TASKS'}
               </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
                {[
                    { id: 'all', label: language === 'vi' ? 'Tất cả' : 'All', icon: '🌈' },
                    { id: 'hoc', label: t('tasks.categoryStudy'), icon: '📚' },
                    { id: 'khac', label: t('tasks.categoryOther'), icon: '✨' }
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setCategoryFilter(filter.id as any)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 border-b-4 ${categoryFilter === filter.id
                                ? 'bg-violet-600 border-violet-800 text-white shadow-kid scale-105'
                                : 'bg-white border-violet-100 text-violet-400 hover:border-violet-200 hover:bg-violet-50 hover:translate-y-[-2px]'
                            }`}
                    >
                        <span className="text-lg">{filter.icon}</span>
                        <span className="uppercase tracking-tight">{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
