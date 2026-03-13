import React, { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/firebase/profile'

interface TaskFormProps {
    users: UserProfile[]
    currentUser: { uid: string }
    language: 'vi' | 'en'
    t: any
    initialData?: {
        title: string
        description: string
        type: 'daily' | 'weekly' | 'monthly'
        xpReward: number
        coinReward: number
        category?: 'hoc' | 'khac' | ''
    } | null
    onSubmit: (
        taskData: { title: string; description: string; type: 'daily' | 'weekly' | 'monthly'; xpReward: number; coinReward: number; category?: 'hoc' | 'khac' },
        selectedUsers: string[],
        saveAsTemplate: boolean
    ) => void
    onCancel: () => void
}

export default function TaskForm({ users, currentUser, language, t, initialData, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [xpReward, setXpReward] = useState(10)
    const [coinReward, setCoinReward] = useState(5)
    const [category, setCategory] = useState<'hoc' | 'khac' | ''>('')
    const [saveAsTemplate, setSaveAsTemplate] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title)
            setDescription(initialData.description || '')
            setType(initialData.type)
            setXpReward(initialData.xpReward)
            setCoinReward(initialData.coinReward)
            setCategory(initialData.category || '')
            setSelectedUsers([])
            setSaveAsTemplate(false)
        }
    }, [initialData])

    const handleSubmit = () => {
        onSubmit(
            { title, description, type, xpReward, coinReward, category: category || undefined },
            selectedUsers,
            saveAsTemplate
        )
        if (!initialData) {
            setTitle('')
            setDescription('')
            setXpReward(10)
            setCoinReward(5)
            setSelectedUsers([])
            setSaveAsTemplate(false)
        }
    }

    return (
        <div id="add-task-form" className="bg-slate-700/80 rounded-lg p-4 space-y-4 border border-slate-600 shadow-xl">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-bold text-white">
                    {initialData ? t('tasks.useTemplate') : t('tasks.addTask')}
                </h4>
                <button onClick={onCancel} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
                <input
                    type="text"
                    placeholder={t('tasks.taskTitle')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-gray-100 placeholder-gray-400"
                />
                <textarea
                    placeholder={t('tasks.taskDescription')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-gray-100 placeholder-gray-400"
                    rows={2}
                />

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-gray-300 block mb-1">{t('tasks.taskType')}</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-gray-100"
                        >
                            <option value="daily">{t('tasks.taskTypeDaily')}</option>
                            <option value="weekly">{t('tasks.taskTypeWeekly')}</option>
                            <option value="monthly">{t('tasks.taskTypeMonthly')}</option>
                        </select>
                        {type === 'weekly' && <p className="text-xs text-blue-400 mt-1">ℹ️ {t('tasks.weeklyTaskInfo')}</p>}
                        {type === 'monthly' && <p className="text-xs text-orange-400 mt-1">ℹ️ {t('tasks.monthlyTaskInfo')}</p>}
                    </div>

                    <div>
                        <label className="text-sm text-gray-300 block mb-1">
                            Giao cho {selectedUsers.length > 0 && '(' + selectedUsers.length + ' người)'}
                        </label>
                        <div className="border border-slate-600 rounded-lg p-2 max-h-32 overflow-y-auto bg-slate-800">
                            {users.map(user => (
                                <label key={user.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-slate-700/80 rounded px-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedUsers([...selectedUsers, user.id])
                                            else setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                        }}
                                        className="w-4 h-4 text-primary-600 border-slate-600 rounded bg-slate-700"
                                    />
                                    <span className="text-sm text-gray-200">
                                        {user.name} {user.id === currentUser.uid ? '(' + (language === 'vi' ? 'Tôi' : 'Me') + ')' : ''}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedUsers.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">⚠️ {t('tasks.selectAtLeastOnePerson')}</p>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <div className="flex-1">
                        <label className="text-sm text-gray-300">{t('tasks.xpReward')}</label>
                        <input
                            type="number"
                            value={xpReward}
                            onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-gray-100"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm text-gray-300">{t('tasks.coinReward')}</label>
                        <input
                            type="number"
                            value={coinReward}
                            onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-gray-100"
                        />
                    </div>
                </div>

                <div className="space-y-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="saveTemplate"
                            checked={saveAsTemplate}
                            onChange={(e) => setSaveAsTemplate(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                        />
                        <label htmlFor="saveTemplate" className="text-sm text-gray-200 cursor-pointer">
                            {t('tasks.saveAsTemplate')}
                        </label>
                    </div>
                    {saveAsTemplate && (
                        <div className="pt-2">
                            <label className="text-sm text-gray-300 block mb-1">{t('tasks.templateCategory')}</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-gray-100"
                            >
                                <option value="">{t('tasks.noCategory')}</option>
                                <option value="hoc">{t('tasks.categoryStudy')}</option>
                                <option value="khac">{t('tasks.categoryOther')}</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                    >
                        {type === 'daily' ? t('tasks.addTask') :
                            type === 'weekly' ? (language === 'vi' ? 'Tạo 6 nhiệm vụ ngày' : 'Create 6 daily tasks') :
                                (language === 'vi' ? 'Tạo 26 nhiệm vụ ngày' : 'Create 26 daily tasks')}
                    </button>
                </div>
            </div>
        </div>
    )
}
