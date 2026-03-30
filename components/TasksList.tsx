'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'
import { TASK_LIMITS } from '@/lib/firebase/taskLimits'
import { COMPLETION_REWARDS } from '@/lib/firebase/completionRewards'
import { useTasks } from '@/hooks/useTasks'
import { useTaskTemplates } from '@/hooks/useTaskTemplates'
import { useFamilyUsers } from '@/hooks/useFamilyUsers'
import TaskItem from './tasks/TaskItem'
import TaskForm from './tasks/TaskForm'
import TaskTemplateList from './tasks/TaskTemplateList'
import { TaskLimits } from './tasks/TaskLimits'
import { TaskCompletionProgress } from './tasks/TaskCompletionProgress'
import DaySelector from './tasks/DaySelector'
import TaskFilters from './tasks/TaskFilters'
import DailyProgressSummary from './tasks/DailyProgressSummary'

interface TasksListProps {
  currentUser: { uid: string }
  profile: UserProfile
  onTaskComplete?: () => void
}

export default function TasksList({ currentUser, profile, onTaskComplete }: TasksListProps) {
  const { t, language, setLanguage } = useI18n()
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const showToast = (message: string, type: 'success' | 'error' | 'info') => setToast({ show: true, message, type })

  const { users, loadUsers } = useFamilyUsers(profile.familyId)

  const {
    tasks,
    loadingTasks,
    taskLimits,
    completionProgress,
    loadTasks,
    handleAddTask,
    handleStartTask,
    handleCompleteTask,
    handleDeleteTask
  } = useTasks({ currentUser, profile, language, t, showToast, onTaskComplete })

  const {
    templates,
    loadTemplates,
    handleDeleteTemplate,
    handleDeleteSelectedTemplates,
    handleDeleteAllTemplates,
    handleBulkCreateAndAssign
  } = useTaskTemplates({ currentUser, profile, language, t, showToast, onTasksChanged: loadTasks })

  useEffect(() => {
    loadUsers()
    loadTasks()
    loadTemplates()
  }, [loadUsers, loadTasks, loadTemplates])

  const [showAddForm, setShowAddForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [initialTaskData, setInitialTaskData] = useState<any>(null)

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1
  })
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'hoc' | 'khac'>('all')

  const weekDates = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      dates.push(dateStr)
    }
    return dates
  }, [])

  const selectedDate = weekDates[selectedDay] || new Date().toISOString().split('T')[0]

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.assignedTo !== currentUser.uid) return false
      if (task.type === 'daily' && task.taskDate) {
        if (task.taskDate !== selectedDate) return false
      }
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'hoc' && task.category !== 'hoc') return false
        if (categoryFilter === 'khac' && task.category !== 'khac') return false
      }
      return true
    })
  }, [tasks, currentUser.uid, selectedDate, categoryFilter])

  const myTasks = filteredTasks

  if (loadingTasks) {
    return (
      <div className="kid-card text-center py-20 bg-white shadow-kid border-violet-100 animate-pulse">
        <div className="w-20 h-20 border-8 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-6 shadow-soft"></div>
        <p className="text-violet-600 font-black text-xl uppercase tracking-widest">{t('common.loading')}...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h3 className="text-3xl font-black text-violet-900 flex items-center gap-3 uppercase tracking-tight">
            <span className="text-4xl animate-bounce-slow">📝</span> {t('tasks.title')}
          </h3>
          <p className="text-sm text-violet-400 font-bold uppercase tracking-widest ml-12 overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[300px] md:max-w-none">
            {language === 'vi' ? 'Cùng hoàn thành nhiệm vụ và nhận thưởng nào!' : 'Complete tasks and earn rewards!'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Language Selector */}
          <div className="relative group shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
              className="appearance-none pl-12 pr-6 py-3 bg-white border-4 border-violet-100 rounded-2xl text-xs font-black text-violet-700 hover:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-50 transition-all cursor-pointer shadow-soft uppercase tracking-widest"
              title="Ngôn ngữ / Language"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none group-hover:scale-110 transition-transform">
              {language === 'vi' ? '🇻🇳' : '🇬🇧'}
            </span>
          </div>

          <button
            onClick={() => {
              setShowTemplates(!showTemplates)
              setShowAddForm(false)
            }}
            className={`btn-playful px-6 py-3 rounded-2xl text-xs font-black shadow-kid active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest border-b-4 ${
              showTemplates 
                ? 'bg-white text-red-500 border-red-100 hover:bg-red-50' 
                : 'bg-amber-500 text-white border-amber-700 hover:bg-amber-600'
            }`}
          >
            {showTemplates ? `❌ ${t('common.cancel')}` : `📋 ${t('tasks.templates')}`}
          </button>

          {profile.isRoot ? (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setShowTemplates(false)
                setInitialTaskData(null)
              }}
              className={`btn-playful px-6 py-3 rounded-2xl text-xs font-black shadow-kid active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest border-b-4 ${
                showAddForm 
                  ? 'bg-white text-red-500 border-red-100 hover:bg-red-50' 
                  : 'bg-violet-600 text-white border-violet-800 hover:bg-violet-700'
              }`}
            >
              {showAddForm ? `❌ ${t('common.cancel')}` : `✨ ${t('tasks.addTask')}`}
            </button>
          ) : (
            <div className="px-6 py-3 bg-violet-50 text-violet-400 border-4 border-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-soft">
              🔒 {t('tasks.onlyRootCanCreate')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-6">
          <DaySelector
            weekDates={weekDates}
            language={language}
            selectedDate={selectedDate}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            tasks={tasks}
            currentUserId={currentUser.uid}
          />

          <TaskFilters
            language={language}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            t={t}
          />

          <DailyProgressSummary
            language={language}
            tasks={tasks}
            currentUserId={currentUser.uid}
            selectedDate={selectedDate}
          />

          <div className="grid grid-cols-1 gap-6">
            {taskLimits && <TaskLimits taskLimits={taskLimits} TASK_LIMITS={TASK_LIMITS} language={language} />}
            {completionProgress && <TaskCompletionProgress completionProgress={completionProgress} COMPLETION_REWARDS={COMPLETION_REWARDS} t={t} />}
          </div>
        </section>

        {showTemplates && (
          <section className="animate-bounce-in">
            <TaskTemplateList
              templates={templates}
              users={users}
              currentUser={currentUser}
              profile={profile}
              language={language}
              t={t}
              onDeleteTemplate={handleDeleteTemplate}
              onDeleteSelected={handleDeleteSelectedTemplates}
              onDeleteAll={handleDeleteAllTemplates}
              onBulkCreate={handleBulkCreateAndAssign}
              onTemplatesCreated={loadTemplates}
              onUseTemplate={(template) => {
                setInitialTaskData(template)
                setShowTemplates(false)
                setShowAddForm(true)
                setTimeout(() => {
                  document.getElementById('add-task-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 300)
              }}
            />
          </section>
        )}

        {showAddForm && (
          <section className="animate-bounce-in">
            <TaskForm
              users={users.filter(u => !u.isRoot && !u.isSuperRoot)}
              currentUser={currentUser}
              language={language}
              t={t}
              initialData={initialTaskData}
              onSubmit={async (taskData, selectedUsers, saveAsTemplate) => {
                const success = await handleAddTask(taskData, selectedUsers, users, saveAsTemplate)
                if (success) {
                  setShowAddForm(false)
                  setInitialTaskData(null)
                  showToast(language === 'vi' ? '🎉 Đã thêm nhiệm vụ mới!' : '🎉 New task added!', 'success')
                }
              }}
              onCancel={() => {
                setShowAddForm(false)
                setInitialTaskData(null)
              }}
            />
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black text-violet-900 flex items-center gap-3 uppercase tracking-tight">
              <span className="p-2 bg-violet-100 rounded-xl shadow-soft">🎯</span> 
              {t('tasks.myTasks')} 
              <span className="text-violet-300 font-bold ml-2">({myTasks.length})</span>
            </h4>
          </div>

          {myTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {myTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  profile={profile}
                  language={language}
                  t={t}
                  onStart={handleStartTask}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onEvidenceUploaded={loadTasks}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border-4 border-dashed border-violet-100 shadow-inner group">
              <div className="text-7xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-110 opacity-30 group-hover:opacity-100">😴</div>
              <p className="text-violet-300 font-black text-xl uppercase tracking-widest">{language === 'vi' ? 'Không có nhiệm vụ nào hôm nay!' : 'No tasks for today!'}</p>
              {categoryFilter !== 'all' && (
                <p className="text-sm mt-3 text-violet-200 font-bold uppercase tracking-widest">{language === 'vi' ? `Thử chọn "Tất cả" để khám phá thêm nhé` : `Try "All" to find more missions`}</p>
              )}
            </div>
          )}

          {tasks.length === 0 && !loadingTasks && (
            <div className="text-center py-24 bg-gradient-to-br from-violet-50 to-white rounded-[3rem] border-4 border-violet-100 shadow-kid relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,0.1),transparent)]" />
               <div className="relative z-10">
                  <div className="text-8xl mb-8 animate-bounce-slow inline-block">🎈</div>
                  <p className="text-violet-900 font-black text-2xl uppercase tracking-tighter">{t('tasks.noTasks')}</p>
                  <p className="text-violet-400 font-bold mt-3 uppercase tracking-widest text-sm">{language === 'vi' ? 'Sẵn sàng để bắt đầu hành trình mới chưa bé?' : 'Ready to start a new adventure?'}</p>
                  {profile.isRoot && (
                    <button 
                      onClick={() => setShowAddForm(true)}
                      className="mt-8 btn-playful bg-violet-600 text-white px-8 py-4 rounded-2xl font-black shadow-kid hover:bg-violet-700 transition-all uppercase tracking-widest text-xs border-b-4 border-violet-800"
                    >
                      ✨ {t('tasks.addTask')}
                    </button>
                  )}
               </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
