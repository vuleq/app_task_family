import React, { useState } from 'react'
import { TaskTemplate } from '@/lib/firebase/tasks'
import { UserProfile } from '@/lib/firebase/profile'
import { getTranslatedTemplateTitle } from '@/lib/i18n/templateTranslations'
import CreateDefaultTemplates from '../CreateDefaultTemplates'

interface TaskTemplateListProps {
    templates: TaskTemplate[]
    users: UserProfile[]
    currentUser: { uid: string }
    profile: UserProfile
    language: 'vi' | 'en'
    t: any
    onUseTemplate: (template: TaskTemplate) => void
    onDeleteTemplate: (templateId: string) => void
    onDeleteSelected: (templateIds: string[]) => void
    onDeleteAll: (templates: TaskTemplate[]) => void
    onTemplatesCreated: () => void
    onBulkCreate: (
        selectedTemplates: string[],
        selectedUsers: string[],
        users: UserProfile[],
        bulkXP: number | '',
        bulkCoin: number | '',
        bulkType: 'keep' | 'daily' | 'weekly' | 'monthly' | 'recurring'
    ) => void
}

export default function TaskTemplateList({
    templates,
    users,
    currentUser,
    profile,
    language,
    t,
    onUseTemplate,
    onDeleteTemplate,
    onDeleteSelected,
    onDeleteAll,
    onTemplatesCreated,
    onBulkCreate
}: TaskTemplateListProps) {
    const [templateFilter, setTemplateFilter] = useState<'all' | 'hoc' | 'khac'>('all')
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
    const [showBulkCreate, setShowBulkCreate] = useState(false)
    const [bulkXP, setBulkXP] = useState<number | ''>('')
    const [bulkCoin, setBulkCoin] = useState<number | ''>('')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [bulkType, setBulkType] = useState<'keep' | 'daily' | 'weekly' | 'monthly' | 'recurring'>('keep')

    const filteredTemplates = templateFilter === 'all'
        ? templates
        : templates.filter(t => t.category === templateFilter)
    const filteredIds = filteredTemplates.map(t => t.id)
    const selectedCount = selectedTemplates.filter(id => filteredIds.includes(id)).length

    const handleToggleSelection = (id: string) => {
        setSelectedTemplates(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id])
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTemplates([...new Set([...selectedTemplates, ...filteredIds])])
        } else {
            setSelectedTemplates(selectedTemplates.filter(id => !filteredIds.includes(id)))
        }
    }

    return (
        <div className="kid-card p-4 space-y-6 bg-violet-50/20 border-violet-100 shadow-soft overflow-hidden">
            <div className="flex justify-between items-center bg-violet-50 -mx-4 -mt-4 p-6 rounded-t-[2rem] border-b-4 border-violet-100 mb-4">
                <h4 className="text-2xl font-black text-violet-900 flex items-center gap-3">
                    <span className="text-3xl animate-bounce-slow">📋</span>
                    {t('tasks.myTemplates')}
                    <div className="ml-2 bg-violet-100 px-3 py-1 rounded-full text-xs font-black text-violet-600 border border-violet-200 uppercase tracking-widest">
                       {templates.length}
                    </div>
                </h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
                <div className="flex items-center bg-white p-2 rounded-2xl border-2 border-violet-100 shadow-soft">
                    <span className="text-[10px] font-black text-violet-300 uppercase tracking-widest mx-4">{language === 'vi' ? 'Bộ lọc' : 'Filter'}</span>
                    <div className="flex gap-1">
                        {(['all', 'hoc', 'khac'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setTemplateFilter(filter)
                                    setSelectedTemplates([])
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tight ${templateFilter === filter
                                    ? 'bg-violet-600 text-white shadow-soft scale-105 border-b-4 border-violet-800'
                                    : 'bg-white text-violet-400 hover:bg-violet-50 border-b-4 border-transparent'
                                    }`}
                            >
                                {filter === 'all' ? (language === 'vi' ? 'Tất cả' : 'All') :
                                    filter === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                    {selectedCount > 0 && profile.isRoot && (
                        <button
                            onClick={() => {
                                setShowBulkCreate(!showBulkCreate)
                                setTimeout(() => {
                                    document.getElementById('bulk-create-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                }, 100)
                            }}
                            className="btn-playful bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-soft hover:bg-emerald-600 uppercase tracking-widest border-b-4 border-emerald-700"
                        >
                            ✨ {language === 'vi' ? `Tạo & Gán (${selectedCount})` : `Create & Assign (${selectedCount})`}
                        </button>
                    )}
                    {selectedCount > 0 && (
                        <button
                            onClick={() => onDeleteSelected(selectedTemplates)}
                            className="btn-playful bg-white text-red-500 px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-soft hover:bg-red-50 uppercase tracking-widest border-2 border-red-100"
                        >
                            🗑️ {language === 'vi' ? `Xóa (${selectedCount})` : `Delete (${selectedCount})`}
                        </button>
                    )}
                    {filteredTemplates.length > 0 && profile.isRoot && (
                        <button
                            onClick={() => onDeleteAll(filteredTemplates)}
                            className="bg-red-50/50 text-red-300 text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors uppercase tracking-widest"
                        >
                            🔥 {language === 'vi' ? `Xóa hết` : `Delete All`}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white/50 p-2 rounded-3xl border-2 border-dashed border-violet-100">
               <CreateDefaultTemplates
                   currentUserId={currentUser.uid}
                   profile={profile}
                   onTemplatesCreated={onTemplatesCreated}
               />
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-violet-50">
                   <div className="text-6xl mb-4 grayscale opacity-20">📭</div>
                   <p className="text-sm text-violet-300 font-black uppercase tracking-widest">
                    {templateFilter === 'all'
                        ? t('tasks.noTemplates')
                        : language === 'vi'
                            ? `Bạn chưa có template ${templateFilter === 'hoc' ? 'việc học' : 'việc khác'}`
                            : `No ${templateFilter === 'hoc' ? 'study' : 'other'} templates found`}
                   </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-violet-50/50 rounded-2xl border-2 border-violet-50 transition-all group">
                        <div 
                            className={`w-8 h-8 rounded-xl flex items-center justify-center border-4 cursor-pointer transition-all shadow-soft ${filteredIds.length > 0 && filteredIds.every(id => selectedTemplates.includes(id)) ? 'bg-violet-600 border-white' : 'bg-white border-violet-100'}`}
                            onClick={() => {
                                const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedTemplates.includes(id));
                                handleSelectAll({ target: { checked: !allSelected } } as any);
                            }}
                        >
                            {filteredIds.length > 0 && filteredIds.every(id => selectedTemplates.includes(id)) && <span className="text-white font-black">✓</span>}
                        </div>
                        <label className="text-xs font-black text-violet-400 uppercase tracking-[0.2em] cursor-pointer select-none">
                            {language === 'vi' ? 'Chọn tất cả mẫu' : 'Select All Templates'}
                            <span className="ml-3 text-violet-200">
                                {selectedCount} <span className="mx-1">/</span> {filteredTemplates.length}
                            </span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTemplates.map(template => (
                            <div key={template.id} className={`kid-card p-6 flex flex-col justify-between transition-all relative overflow-hidden group ${
                                selectedTemplates.includes(template.id) 
                                    ? 'bg-violet-50 border-violet-300 ring-4 ring-violet-100 shadow-kid' 
                                    : 'bg-white border-violet-50 hover:border-violet-200 shadow-soft'
                            }`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform opacity-50" />
                                
                                <div className="relative z-10 flex items-start gap-4 mb-4">
                                    <div 
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center border-4 cursor-pointer transition-all flex-shrink-0 shadow-soft ${selectedTemplates.includes(template.id) ? 'bg-violet-600 border-white rotate-6' : 'bg-white border-violet-100 hover:rotate-6'}`}
                                        onClick={() => handleToggleSelection(template.id)}
                                    >
                                        {selectedTemplates.includes(template.id) && <span className="text-white text-xs font-black">✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm border ${
                                                template.type === 'daily' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                                template.type === 'weekly' ? 'bg-violet-50 text-violet-500 border-violet-100' :
                                                'bg-orange-50 text-orange-500 border-orange-100'
                                            }`}>
                                                {template.type === 'daily' ? t('tasks.taskTypeDaily') :
                                                    template.type === 'weekly' ? t('tasks.taskTypeWeeklyFull') :
                                                        t('tasks.taskTypeMonthlyFull')}
                                            </span>
                                            {template.category && (
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm border ${
                                                    template.category === 'hoc' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                    'bg-amber-50 text-amber-500 border-amber-100'
                                                }`}>
                                                    {template.category === 'hoc' ? `📚` : `✨`} {template.category === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')}
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="text-lg font-black text-violet-900 leading-tight uppercase tracking-tight truncate">{getTranslatedTemplateTitle(template.title, language)}</h5>
                                        {template.description && <p className="text-xs text-violet-400 font-bold line-clamp-2 mt-1">{template.description}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t-2 border-violet-50">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-100/50 rounded-xl text-[10px] font-black text-violet-600 border border-violet-100">
                                            ⚡ {template.xpReward}
                                        </span>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100/50 rounded-xl text-[10px] font-black text-amber-600 border border-amber-100">
                                            🪙 {template.coinReward}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onUseTemplate(template)} 
                                            className="w-10 h-10 flex items-center justify-center bg-violet-600 text-white rounded-xl shadow-soft hover:bg-violet-700 active:scale-90 transition-all font-black"
                                            title={t('tasks.useTemplate')}
                                        >
                                            🚀
                                        </button>
                                        <button 
                                            onClick={() => onDeleteTemplate(template.id)} 
                                            className="w-10 h-10 flex items-center justify-center bg-white text-red-500 rounded-xl shadow-soft hover:bg-red-50 active:scale-90 transition-all border-2 border-red-50"
                                            title={t('common.delete')}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showBulkCreate && selectedTemplates.length > 0 && profile.isRoot && (
                <div id="bulk-create-form" className="mt-8 kid-card p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 animate-bounce-in space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-30" />
                    
                    <div className="flex items-center justify-between -mx-8 -mt-8 p-6 bg-emerald-500 rounded-t-[2.5rem] border-b-4 border-emerald-600/20 mb-8 shadow-kid">
                        <h5 className="font-black text-white text-xl flex items-center gap-3">
                            <span className="text-3xl animate-pulse">✨</span>
                            {language === 'vi'
                                ? `Giao gộp ${selectedTemplates.length} mẫu việc cho bé`
                                : `Bulk Assign ${selectedTemplates.length} templates`}
                        </h5>
                        <button 
                            onClick={() => setShowBulkCreate(false)} 
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all active:scale-90"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="relative z-10 space-y-2 mb-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                            📋 {language === 'vi' ? 'Loại nhiệm vụ' : 'Task Type'}
                        </label>
                        <div className="relative">
                            <select
                                value={bulkType}
                                onChange={(e) => setBulkType(e.target.value as any)}
                                className="w-full px-6 py-4 border-2 border-emerald-100 rounded-2xl bg-white text-emerald-900 font-black focus:border-emerald-300 outline-none transition-all appearance-none cursor-pointer shadow-inner pr-12"
                            >
                                <option value="keep">{language === 'vi' ? '📋 Giữ nguyên loại của từng mẫu' : '📋 Keep each template type'}</option>
                                <option value="daily">📅 {t('tasks.taskTypeDaily')}</option>
                                <option value="weekly">🗓️ {t('tasks.taskTypeWeekly')}</option>
                                <option value="monthly">🌙 {t('tasks.taskTypeMonthly')}</option>
                                <option value="recurring">🔁 {t('tasks.taskTypeRecurring')}</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 font-black">▼</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                🎁 {language === 'vi' ? 'Thưởng thêm siêu cấp (Tùy chọn)' : 'Optional Extra Rewards'}
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-125 transition-transform">⚡</span>
                                    <input
                                        type="number"
                                        value={bulkXP}
                                        onChange={(e) => setBulkXP(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Bonus XP"
                                        className="w-full pl-16 pr-6 py-4 border-2 border-emerald-100 rounded-2xl bg-white text-emerald-900 font-black focus:border-emerald-300 outline-none transition-all shadow-inner"
                                        min="0"
                                    />
                                </div>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-125 transition-transform">🪙</span>
                                    <input
                                        type="number"
                                        value={bulkCoin}
                                        onChange={(e) => setBulkCoin(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Bonus Coins"
                                        className="w-full pl-16 pr-6 py-4 border-2 border-emerald-100 rounded-2xl bg-white text-emerald-900 font-black focus:border-emerald-300 outline-none transition-all shadow-inner"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-emerald-400 font-bold italic ml-1">
                               {language === 'vi' ? '* Thưởng này sẽ cộng dồn vào phần thưởng của từng mẫu.' : '* These rewards will be added on top of individual template rewards.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                👥 {language === 'vi' ? 'Chọn các bé nhận việc' : 'Select receiving kids'} {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                            </label>
                            <div className="border-4 border-white rounded-[2rem] p-4 max-h-56 overflow-y-auto bg-emerald-100/20 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-inner">
                                {users.filter(u => !u.isRoot && !u.isSuperRoot).length === 0 ? (
                                    <div className="col-span-2 text-center py-6">
                                        <p className="text-sm text-emerald-400 font-black uppercase tracking-widest">
                                            {language === 'vi' ? 'Chưa có bé nào tham gia gia đình' : 'No kids joined this family yet'}
                                        </p>
                                    </div>
                                ) : (
                                    users.filter(u => !u.isRoot && !u.isSuperRoot).map(user => (
                                        <label key={user.id} className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedUsers.includes(user.id) ? 'bg-white border-emerald-300 shadow-soft scale-[1.02]' : 'bg-white/50 border-transparent hover:bg-white'}`}>
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shadow-soft flex-shrink-0 ${selectedUsers.includes(user.id) ? 'bg-emerald-500 border-white' : 'bg-white border-emerald-100'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={(e) => setSelectedUsers(prev => e.target.checked ? [...prev, user.id] : prev.filter(id => id !== user.id))}
                                                    className="hidden"
                                                />
                                                {selectedUsers.includes(user.id) && <span className="text-white text-xs font-black">✓</span>}
                                            </div>
                                            <div className="flex items-center gap-3 min-w-0">
                                               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-600 border border-emerald-200 flex-shrink-0">
                                                  {user.name.charAt(0)}
                                               </div>
                                               <span className="text-sm font-black text-emerald-900 uppercase tracking-tight truncate">{user.name}</span>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 relative z-10">
                        <button
                            onClick={() => {
                                onBulkCreate(selectedTemplates, selectedUsers, users, bulkXP, bulkCoin, bulkType)
                                setShowBulkCreate(false)
                                setSelectedTemplates([])
                                setSelectedUsers([])
                                setBulkXP('')
                                setBulkCoin('')
                                setBulkType('keep')
                            }}
                            disabled={selectedUsers.length === 0}
                            className="w-full btn-playful bg-emerald-500 text-white px-8 py-6 rounded-[2.5rem] text-xl font-black shadow-kid hover:bg-emerald-600 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-4 group"
                        >
                            <span className="text-3xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-12">✅</span>
                            {language === 'vi'
                                ? `Sẵn sàng gán ${selectedTemplates.length} việc ngay!`
                                : `Assign ${selectedTemplates.length} tasks now!`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
