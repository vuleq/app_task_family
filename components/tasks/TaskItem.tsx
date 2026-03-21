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

    // Status config
    const statusConfig = {
        pending: { label: t('tasks.statusPending'), color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-400' },
        in_progress: { label: t('tasks.statusInProgress'), color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400' },
        completed: { label: t('tasks.statusWaitingApproval'), color: 'text-violet-500', bg: 'bg-violet-50', dot: 'bg-violet-400' },
        approved: { label: t('tasks.statusApproved'), color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-400' }
    }[task.status as keyof typeof statusConfig] || { label: task.status, color: 'text-violet-400', bg: 'bg-violet-50', dot: 'bg-violet-300' }

    return (
        <div className={`kid-card p-6 flex flex-col transition-all active:scale-[0.99] border-2 group relative overflow-hidden ${
            isParentTask ? 'border-violet-200 bg-violet-50/10' : 'border-violet-50 bg-white'
        } ${task.status === 'approved' ? 'opacity-80' : 'shadow-soft'}`}>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform opacity-30" />

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <h5 className="text-xl font-black text-violet-900 leading-tight uppercase tracking-tight">{getTranslatedTaskTitle(task.title, language)}</h5>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                                task.type === 'daily' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                task.type === 'weekly' ? 'bg-violet-50 text-violet-500 border-violet-100' :
                                'bg-orange-50 text-orange-500 border-orange-100'
                            }`}>
                                {task.type === 'daily' ? t('tasks.taskTypeDaily') :
                                    task.type === 'weekly' ? t('tasks.taskTypeWeekly') :
                                        t('tasks.taskTypeMonthly')}
                            </span>
                            {task.category && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                                    task.category === 'hoc' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                    'bg-amber-50 text-amber-500 border-amber-100'
                                }`}>
                                    {task.category === 'hoc' ? `📚` : `✨`} {task.category === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')}
                                </span>
                            )}
                            {isParentTask && (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-kid border border-violet-700">
                                    👑 {t('tasks.parentTask')}
                                </span>
                            )}
                            {isDailyTask && (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-50 text-violet-400 border border-violet-100">
                                    🌱 {t('tasks.subTask')}
                                </span>
                            )}
                        </div>
                    </div>

                    {task.description && <p className="text-sm text-violet-400/80 font-bold leading-relaxed">{task.description}</p>}

                    {isParentTask && task.requiredCount !== undefined && (
                        <div className="mt-4 p-5 bg-violet-50/50 rounded-[2rem] border-4 border-white shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">{t('tasks.progress')}</span>
                                <div className="flex items-center gap-2">
                                   <span className="text-lg text-violet-600 font-black">
                                       {task.completedCount || 0}
                                   </span>
                                   <span className="text-violet-200 font-black">/</span>
                                   <span className="text-lg text-violet-300 font-black">
                                       {task.requiredCount}
                                   </span>
                                </div>
                            </div>
                            <div className="w-full bg-white rounded-full h-4 p-1 border-2 border-violet-100 shadow-soft overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-violet-400 to-violet-600 h-full rounded-full transition-all duration-1000 shadow-soft relative overflow-hidden"
                                    style={{ width: `${Math.min(100, ((task.completedCount || 0) / task.requiredCount) * 100)}%` }}
                                >
                                   <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <div className="h-px bg-violet-100 flex-1" />
                                <p className="text-[9px] text-violet-400 font-black uppercase tracking-widest whitespace-nowrap">
                                    {t('tasks.progressRemaining')
                                        ?.replace('{remaining}', (task.requiredCount - (task.completedCount || 0)).toString())
                                        .replace('{type}', task.type === 'weekly' ? t('tasks.taskTypeWeek') : t('tasks.taskTypeMonth'))}
                                </p>
                                <div className="h-px bg-violet-100 flex-1" />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center flex-wrap gap-4 pt-2">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-soft border-2 ${statusConfig.bg} ${statusConfig.color} border-white`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse shadow-soft`}></span>
                            {statusConfig.label}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 px-3 py-1 bg-violet-100/30 rounded-xl text-xs font-black text-violet-600 border border-violet-100 shadow-inner">
                                <span className="text-lg">⚡</span> {task.xpReward} <span className="opacity-40 text-[9px] tracking-tighter">XP</span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-amber-100/30 rounded-xl text-xs font-black text-amber-600 border border-amber-100 shadow-inner">
                                <span className="text-lg">🪙</span> {task.coinReward} <span className="opacity-40 text-[9px] tracking-tighter">COINS</span>
                            </span>
                        </div>
                    </div>

                    {(task.status === 'in_progress' || task.status === 'completed' || task.status === 'approved') && (
                        <div className="mt-4 p-4 bg-white rounded-3xl border-2 border-violet-50 shadow-soft">
                            <PhotoEvidence
                                taskId={task.id}
                                currentEvidence={task.evidence}
                                onEvidenceUploaded={onEvidenceUploaded}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
                    {!isParentTask && task.status === 'pending' && (
                        <button
                            onClick={() => onStart(task)}
                            className="flex-1 btn-playful bg-blue-500 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-kid hover:bg-blue-600 whitespace-nowrap flex items-center justify-center gap-2 uppercase tracking-widest border-b-4 border-blue-700"
                        >
                            <span className="text-lg">🚀</span> {t('tasks.startTask')}
                        </button>
                    )}
                    {!isParentTask && task.status === 'in_progress' && (
                        <button
                            onClick={() => onComplete(task)}
                            className="flex-1 btn-playful bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-kid hover:bg-emerald-600 whitespace-nowrap flex items-center justify-center gap-2 uppercase tracking-widest border-b-4 border-emerald-700"
                        >
                            <span className="text-lg">✅</span> {t('tasks.completeTask')}
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
                            className="flex-1 bg-white text-red-300 hover:text-red-500 hover:bg-red-50 px-6 py-3 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap flex items-center justify-center gap-2 uppercase tracking-widest border-2 border-transparent hover:border-red-100"
                        >
                            <span>🗑️</span> {t('tasks.deleteTask')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
