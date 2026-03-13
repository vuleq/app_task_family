import React from 'react'
import { Task } from '@/hooks/useTasks'
import { UserProfile } from '@/lib/firebase/profile'
import { getTranslatedTaskTitle } from '@/lib/i18n/templateTranslations'
import PhotoEvidence from '../PhotoEvidence'

interface TaskItemProps {
    task: Task
    profile: UserProfile
    language: 'vi' | 'en'
    t: any
    onStart: (task: Task) => void
    onComplete: (task: Task) => void
    onDelete: (taskId: string) => void
    onEvidenceUploaded: () => void
}

export default function TaskItem({
    task,
    profile,
    language,
    t,
    onStart,
    onComplete,
    onDelete,
    onEvidenceUploaded
}: TaskItemProps) {
    const isParentTask = (task.type === 'weekly' || task.type === 'monthly') && !task.parentTaskId
    const isDailyTask = task.type === 'daily' && task.parentTaskId

    return (
        <div className={`bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-4 flex flex-col ${isParentTask ? 'border-2 border-purple-500/50' : ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2 relative">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                        <h5 className="font-medium text-gray-100">{getTranslatedTaskTitle(task.title, language)}</h5>
                        <span className={`px-2 py-0.5 rounded text-xs ${task.type === 'daily' ? 'bg-blue-500/20 text-blue-300' :
                            task.type === 'weekly' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-orange-500/20 text-orange-300'
                            }`}>
                            {task.type === 'daily' ? t('tasks.taskTypeDaily') :
                                task.type === 'weekly' ? t('tasks.taskTypeWeekly') :
                                    t('tasks.taskTypeMonthly')}
                        </span>
                        {task.category && (
                            <span className={`px-2 py-0.5 rounded text-xs ${task.category === 'hoc' ? 'bg-green-500/20 text-green-300' :
                                'bg-slate-700/50 text-gray-300'
                                }`}>
                                {task.category === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')}
                            </span>
                        )}
                        {isParentTask && (
                            <span className="px-2 py-0.5 rounded text-xs bg-purple-500/30 text-purple-200 font-semibold">
                                {t('tasks.parentTask')}
                            </span>
                        )}
                        {isDailyTask && (
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-gray-300">
                                {t('tasks.subTask')}
                            </span>
                        )}
                    </div>

                    {task.description && <p className="text-sm text-gray-300">{task.description}</p>}

                    {isParentTask && task.requiredCount !== undefined && (
                        <div className="mt-2">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-200">{t('tasks.progress')}:</span>
                                <span className="text-sm text-purple-400 font-semibold">
                                    {task.completedCount || 0} / {task.requiredCount}
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, ((task.completedCount || 0) / task.requiredCount) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {t('tasks.progressRemaining')
                                    ?.replace('{remaining}', (task.requiredCount - (task.completedCount || 0)).toString())
                                    .replace('{type}', task.type === 'weekly' ? t('tasks.taskTypeWeek') : t('tasks.taskTypeMonth'))}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center flex-wrap gap-2 text-sm pt-1">
                        <span className={`px-2 py-1 rounded ${task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                                task.status === 'completed' ? 'bg-indigo-500/20 text-indigo-300' :
                                    task.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                        'bg-slate-700/50 text-gray-300'
                            }`}>
                            {task.status === 'pending' ? t('tasks.statusPending') :
                                task.status === 'in_progress' ? t('tasks.statusInProgress') :
                                    task.status === 'completed' ? t('tasks.statusWaitingApproval') :
                                        task.status === 'approved' ? t('tasks.statusApproved') : task.status}
                        </span>
                        <span className="text-primary-300 font-medium">XP: {task.xpReward}</span>
                        <span className="text-yellow-400">Coins: {task.coinReward}</span>
                    </div>

                    {(task.status === 'in_progress' || task.status === 'completed' || task.status === 'approved') && (
                        <div className="mt-3">
                            <PhotoEvidence
                                taskId={task.id}
                                currentEvidence={task.evidence}
                                onEvidenceUploaded={onEvidenceUploaded}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                    {!isParentTask && task.status === 'pending' && (
                        <button
                            onClick={() => onStart(task)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                        >
                            {t('tasks.startTask')}
                        </button>
                    )}
                    {!isParentTask && task.status === 'in_progress' && (
                        <button
                            onClick={() => onComplete(task)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap"
                        >
                            {t('tasks.completeTask')}
                        </button>
                    )}
                    {profile.isRoot && (
                        <button
                            onClick={() => {
                                if (confirm(language === 'vi'
                                    ? `Bạn có chắc muốn xóa nhiệm vụ "${getTranslatedTaskTitle(task.title, language)}"?`
                                    : `Are you sure you want to delete task "${getTranslatedTaskTitle(task.title, language)}"?`)) {
                                    onDelete(task.id)
                                }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap"
                        >
                            {t('tasks.deleteTask')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
