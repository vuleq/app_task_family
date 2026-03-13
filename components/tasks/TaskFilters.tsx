import React from 'react'

interface TaskFiltersProps {
    language: string
    categoryFilter: 'all' | 'hoc' | 'khac'
    setCategoryFilter: (filter: 'all' | 'hoc' | 'khac') => void
    t: (key: string) => string
}

export default function TaskFilters({ language, categoryFilter, setCategoryFilter, t }: TaskFiltersProps) {
    return (
        <div className="mb-4 flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <label className="text-sm font-medium text-gray-300">
                {language === 'vi' ? 'Lọc theo:' : 'Filter by:'}
            </label>
            <div className="relative">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'hoc' | 'khac')}
                    className="appearance-none pl-3 pr-8 py-1.5 border border-slate-600 rounded-lg text-sm bg-slate-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-all shadow-sm"
                >
                    <option value="all">{language === 'vi' ? 'Tất cả' : 'All'}</option>
                    <option value="hoc">{t('tasks.categoryStudy')}</option>
                    <option value="khac">{t('tasks.categoryOther')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>
    )
}
