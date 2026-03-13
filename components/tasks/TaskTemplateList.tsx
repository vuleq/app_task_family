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
        bulkCoin: number | ''
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
        <div className="bg-purple-500/20 rounded-lg p-4 space-y-3 border border-purple-500/50">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-medium text-gray-100">📋 {t('tasks.myTemplates')}</h4>

                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-300">{language === 'vi' ? 'Lọc:' : 'Filter:'}</label>
                        <select
                            value={templateFilter}
                            onChange={(e) => {
                                setTemplateFilter(e.target.value as any)
                                setSelectedTemplates([])
                            }}
                            className="px-3 py-1 border border-slate-600 rounded-lg text-sm bg-slate-700/50 text-gray-100"
                        >
                            <option value="all">{language === 'vi' ? 'Tất cả' : 'All'}</option>
                            <option value="hoc">{t('tasks.categoryStudy')}</option>
                            <option value="khac">{t('tasks.categoryOther')}</option>
                        </select>
                    </div>

                    {selectedCount > 0 && profile.isRoot && (
                        <button
                            onClick={() => {
                                setShowBulkCreate(!showBulkCreate)
                                setTimeout(() => {
                                    document.getElementById('bulk-create-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                }, 100)
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-semibold"
                        >
                            {language === 'vi' ? `✨ Tạo & Gán (${selectedCount})` : `✨ Create & Assign (${selectedCount})`}
                        </button>
                    )}
                    {selectedCount > 0 && (
                        <button
                            onClick={() => onDeleteSelected(selectedTemplates)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                            {language === 'vi' ? `Xóa đã chọn (${selectedCount})` : `Delete Selected (${selectedCount})`}
                        </button>
                    )}
                    {filteredTemplates.length > 0 && (
                        <button
                            onClick={() => onDeleteAll(filteredTemplates)}
                            className="px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-800"
                        >
                            {language === 'vi' ? `Xóa tất cả (${filteredTemplates.length})` : `Delete All (${filteredTemplates.length})`}
                        </button>
                    )}
                </div>
            </div>

            <CreateDefaultTemplates
                currentUserId={currentUser.uid}
                profile={profile}
                onTemplatesCreated={onTemplatesCreated}
            />

            {filteredTemplates.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {templateFilter === 'all'
                        ? t('tasks.noTemplates')
                        : language === 'vi'
                            ? `Không có template ${templateFilter === 'hoc' ? 'việc học' : 'việc khác'} nào.`
                            : `No ${templateFilter === 'hoc' ? 'study' : 'other'} templates.`}
                </p>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 pb-2 border-b border-purple-200/30">
                        <input
                            type="checkbox"
                            checked={filteredIds.length > 0 && filteredIds.every(id => selectedTemplates.includes(id))}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary-600 rounded bg-slate-700"
                        />
                        <label className="text-sm text-gray-200 cursor-pointer">
                            {language === 'vi' ? 'Chọn tất cả' : 'Select All'}
                        </label>
                        <span className="text-xs text-gray-400">
                            ({selectedCount} / {filteredTemplates.length})
                        </span>
                    </div>

                    {filteredTemplates.map(template => (
                        <div key={template.id} className={`bg-slate-800/80 backdrop-blur-sm border rounded-lg p-3 flex justify-between items-center ${selectedTemplates.includes(template.id) ? 'border-purple-500 bg-purple-500/20' : 'border-slate-600'
                            }`}>
                            <div className="flex items-center space-x-3 flex-1">
                                <input
                                    type="checkbox"
                                    checked={selectedTemplates.includes(template.id)}
                                    onChange={() => handleToggleSelection(template.id)}
                                    className="w-4 h-4 text-primary-600 border-slate-600 rounded flex-shrink-0 bg-slate-700"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 flex-wrap">
                                        <h5 className="font-medium text-gray-100">{getTranslatedTemplateTitle(template.title, language)}</h5>
                                        <span className={`px-2 py-0.5 rounded text-xs ${template.type === 'daily' ? 'bg-blue-500/20 text-blue-300' :
                                            template.type === 'weekly' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-orange-500/20 text-orange-300'
                                            }`}>
                                            {template.type === 'daily' ? t('tasks.taskTypeDaily') :
                                                template.type === 'weekly' ? t('tasks.taskTypeWeeklyFull') :
                                                    t('tasks.taskTypeMonthlyFull')}
                                        </span>
                                        {template.category && (
                                            <span className={`px-2 py-0.5 rounded text-xs ${template.category === 'hoc' ? 'bg-green-500/20 text-green-300' :
                                                'bg-slate-700/50 text-gray-300'
                                                }`}>
                                                {template.category === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')}
                                            </span>
                                        )}
                                    </div>
                                    {template.description && <p className="text-sm text-gray-300 mt-1">{template.description}</p>}
                                    <div className="flex items-center space-x-3 mt-1 text-xs">
                                        <span className="text-primary-300 font-medium">XP: {template.xpReward}</span>
                                        <span className="text-yellow-400 font-medium">Coins: {template.coinReward}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                                <button onClick={() => onUseTemplate(template)} className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                                    {t('tasks.useTemplate')}
                                </button>
                                <button onClick={() => onDeleteTemplate(template.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showBulkCreate && selectedTemplates.length > 0 && profile.isRoot && (
                <div id="bulk-create-form" className="mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border-2 border-green-500/50 space-y-4">
                    <h5 className="font-bold text-white text-lg flex items-center gap-2">
                        <span>✨</span>
                        {language === 'vi'
                            ? `Tạo & Gán ${selectedTemplates.length} Template cho Nhiều Users`
                            : `Create & Assign ${selectedTemplates.length} Templates to Multiple Users`}
                    </h5>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-green-500/30">
                        <p className="text-sm font-semibold text-white mb-2">
                            {language === 'vi'
                                ? '📝 Cập nhật XP & Coin (để trống = dùng giá trị từ template):'
                                : '📝 Update XP & Coin (leave empty = use template values):'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-300 block mb-1">
                                    {language === 'vi' ? 'XP (tùy chọn):' : 'XP (optional):'}
                                </label>
                                <input
                                    type="number"
                                    value={bulkXP}
                                    onChange={(e) => setBulkXP(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder={language === 'vi' ? 'VD: 20' : 'E.g: 20'}
                                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-300 block mb-1">
                                    {language === 'vi' ? 'Coin (tùy chọn):' : 'Coin (optional):'}
                                </label>
                                <input
                                    type="number"
                                    value={bulkCoin}
                                    onChange={(e) => setBulkCoin(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder={language === 'vi' ? 'VD: 10' : 'E.g: 10'}
                                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-green-500/30">
                        <p className="text-sm font-semibold text-white mb-2">
                            {language === 'vi'
                                ? `👥 Chọn Users để Assign (${selectedUsers.length} đã chọn):`
                                : `👥 Select Users to Assign (${selectedUsers.length} selected):`}
                        </p>
                        <div className="border border-slate-600 rounded-lg p-2 max-h-40 overflow-y-auto bg-slate-800/50">
                            {users.filter(u => !u.isRoot && !u.isSuperRoot).length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    {language === 'vi' ? 'Chưa có end user nào' : 'No end users available'}
                                </p>
                            ) : (
                                users.filter(u => !u.isRoot && !u.isSuperRoot).map(user => (
                                    <label key={user.id} className="flex items-center space-x-2 p-1 hover:bg-slate-700/50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={(e) => setSelectedUsers(prev => e.target.checked ? [...prev, user.id] : prev.filter(id => id !== user.id))}
                                            className="w-4 h-4 text-primary-600 rounded bg-slate-700"
                                        />
                                        <span className="text-sm text-white">{user.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                onBulkCreate(selectedTemplates, selectedUsers, users, bulkXP, bulkCoin)
                                setShowBulkCreate(false)
                                setSelectedTemplates([])
                                setSelectedUsers([])
                                setBulkXP('')
                                setBulkCoin('')
                            }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                            {language === 'vi'
                                ? `✅ Tạo & Gán ${selectedTemplates.length} Tasks cho ${selectedUsers.length} Users`
                                : `✅ Create & Assign ${selectedTemplates.length} Tasks to ${selectedUsers.length} Users`}
                        </button>
                        <button
                            onClick={() => {
                                setShowBulkCreate(false)
                                setBulkXP('')
                                setBulkCoin('')
                            }}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
