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
      <div className="text-center py-8">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-100">{t('tasks.title')}</h3>
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm hover:bg-slate-700 text-gray-100"
            title="Chọn ngôn ngữ / Select Language"
          >
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇬🇧 English</option>
          </select>

          <button
            onClick={() => {
              setShowTemplates(!showTemplates)
              setShowAddForm(false)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            {showTemplates ? t('common.cancel') : `📋 ${t('tasks.templates')}`}
          </button>
          {profile.isRoot ? (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setShowTemplates(false)
                setInitialTaskData(null)
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              {showAddForm ? t('common.cancel') : `+ ${t('tasks.addTask')}`}
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg text-sm">
              {t('tasks.onlyRootCanCreate')}
            </div>
          )}
        </div>
      </div>

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

      {taskLimits && <TaskLimits taskLimits={taskLimits} TASK_LIMITS={TASK_LIMITS} language={language} />}
      {completionProgress && <TaskCompletionProgress completionProgress={completionProgress} COMPLETION_REWARDS={COMPLETION_REWARDS} t={t} />}

      {showTemplates && (
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
              document.getElementById('add-task-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }, 100)
          }}
        />
      )}

      {showAddForm && (
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
            }
          }}
          onCancel={() => {
            setShowAddForm(false)
            setInitialTaskData(null)
          }}
        />
      )}

      {myTasks.length > 0 ? (
        <div>
          <h4 className="font-medium text-gray-200 mb-2">{t('tasks.myTasks')} ({myTasks.length})</h4>
          <div className="space-y-2">
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
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>{language === 'vi' ? 'Chưa có nhiệm vụ nào cho ngày này' : 'No tasks for this day'}</p>
          {categoryFilter !== 'all' && (
            <p className="text-sm mt-2">{language === 'vi' ? `Thử chọn category "Tất cả" để xem tất cả nhiệm vụ` : `Try selecting "All" category to see all tasks`}</p>
          )}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('tasks.noTasks')}
        </div>
      )}
    </div>
  )
}
