'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}
import { UserProfile, getAllUsers } from '@/lib/firebase/profile'
import PhotoEvidence from './PhotoEvidence'
import { 
  getTaskTemplates, 
  saveTaskTemplate, 
  deleteTaskTemplate, 
  createTaskFromTemplate,
  createRecurringDailyTasks,
  checkAndUpdateParentTask,
  deleteTask,
  deleteMultipleTasks,
  TaskTemplate 
} from '@/lib/firebase/tasks'
import CreateDefaultTemplates from './CreateDefaultTemplates'
import { useI18n } from '@/lib/i18n/context'
import { getTranslatedTemplateTitle, getTranslatedTaskTitle } from '@/lib/i18n/templateTranslations'
import Toast from './Toast'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  createdBy: string
  createdByName?: string // Thêm field này
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  type: 'daily' | 'weekly' | 'monthly'
  xpReward: number
  coinReward: number
  createdAt: any
  completedAt?: any
  evidence?: string
  parentTaskId?: string
  groupKey?: string
  requiredCount?: number
  completedCount?: number
}

interface TasksListProps {
  currentUser: { uid: string }
  profile: UserProfile
  onTaskComplete?: () => void
}

export default function TasksList({ currentUser, profile, onTaskComplete }: TasksListProps) {
  const { t, language, setLanguage } = useI18n()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]) // Chọn nhiều người
  const [taskCategory, setTaskCategory] = useState<'hoc' | 'khac' | ''>('') // Category cho template
  const [templateFilter, setTemplateFilter] = useState<'all' | 'hoc' | 'khac'>('all') // Filter templates
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]) // Chọn nhiều template để xóa
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    assignedTo: '', // Giữ lại cho backward compatibility
    assignedToName: '', // Giữ lại cho backward compatibility
    xpReward: 10, 
    coinReward: 5 
  })

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      // Mặc định không chọn ai, user phải tự chọn
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadTemplates = useCallback(async () => {
    try {
      const templatesData = await getTaskTemplates(currentUser.uid)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }, [currentUser.uid])

  const loadTasks = useCallback(async () => {
    try {
      if (!db) {
        console.error('Firestore not initialized')
        setLoading(false)
        return
      }
      
      // Auto-delete old completed tasks (chỉ root, chạy ngầm)
      if (profile.isRoot) {
        try {
          const { autoDeleteOldCompletedTasks } = await import('@/lib/firebase/tasks')
          const deletedCount = await autoDeleteOldCompletedTasks()
          if (deletedCount > 0) {
            console.log(`Auto-deleted ${deletedCount} old completed tasks`)
          }
        } catch (error) {
          console.error('Error auto-deleting old tasks:', error)
        }
      }
      
      const tasksRef = collection(checkDb(), 'tasks')
      const q = query(tasksRef)
      const snapshot = await getDocs(q)
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      setTasks(tasksData)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [db, profile.isRoot])

  useEffect(() => {
    loadTasks()
    loadUsers()
    loadTemplates()
  }, [loadTasks, loadTemplates])

  const handleAddTask = async () => {
    // Chỉ root mới có thể tạo nhiệm vụ
    if (!profile.isRoot) {
      setToast({ show: true, message: language === 'vi' 
        ? '⚠️ Chỉ tài khoản root mới có thể tạo nhiệm vụ!'
        : '⚠️ Only root accounts can create tasks!', type: 'error' })
      return
    }

    if (!newTask.title.trim()) {
      setToast({ show: true, message: language === 'vi' ? 'Vui lòng nhập tên nhiệm vụ' : 'Please enter task title', type: 'error' })
      return
    }

    if (selectedUsers.length === 0) {
      setToast({ show: true, message: t('tasks.selectAtLeastOnePerson'), type: 'error' })
      return
    }

    try {
      let totalTaskIds: string[] = []
      const assignedUsers = users.filter(u => selectedUsers.includes(u.id))

      // Tạo nhiệm vụ cho từng người được chọn
      for (const user of assignedUsers) {
        let taskIds: string[] = []

        // Nếu là nhiệm vụ ngày và chọn tạo cho tuần/tháng
        if (newTask.type === 'daily') {
          if (!db) {
            setToast({ show: true, message: 'Firestore chưa được khởi tạo', type: 'error' })
            return
          }
          // Tạo 1 nhiệm vụ ngày
          const docRef = await addDoc(collection(checkDb(), 'tasks'), {
            title: newTask.title,
            description: newTask.description,
            type: 'daily',
            assignedTo: user.id,
            assignedToName: user.name,
            createdBy: currentUser.uid,
            createdByName: profile.name,
            status: 'pending',
            xpReward: newTask.xpReward,
            coinReward: newTask.coinReward,
            createdAt: Timestamp.now()
          })
          taskIds.push(docRef.id)
        } else if (newTask.type === 'weekly') {
          // Tạo 6 nhiệm vụ ngày cho tuần
          const result = await createRecurringDailyTasks(
            {
              title: newTask.title,
              description: newTask.description,
              assignedTo: user.id,
              assignedToName: user.name,
              xpReward: newTask.xpReward,
              coinReward: newTask.coinReward,
            },
            currentUser.uid,
            profile.name,
            6, // 6 ngày
            'weekly'
          )
          taskIds = result.dailyTaskIds
        } else if (newTask.type === 'monthly') {
          // Tạo 26 nhiệm vụ ngày cho tháng
          const result = await createRecurringDailyTasks(
            {
              title: newTask.title,
              description: newTask.description,
              assignedTo: user.id,
              assignedToName: user.name,
              xpReward: newTask.xpReward,
              coinReward: newTask.coinReward,
            },
            currentUser.uid,
            profile.name,
            26, // 26 ngày
            'monthly'
          )
          taskIds = result.dailyTaskIds
        }

        totalTaskIds = [...totalTaskIds, ...taskIds]
      }

      // Lưu làm template nếu được chọn
      if (saveAsTemplate) {
        await saveTaskTemplate(
          newTask.title,
          newTask.description,
          newTask.type,
          newTask.xpReward,
          newTask.coinReward,
          currentUser.uid,
          taskCategory || undefined // Lưu category nếu có
        )
        loadTemplates()
      }

      setNewTask({ 
        title: '', 
        description: '', 
        type: 'daily',
        assignedTo: '',
        assignedToName: '',
        xpReward: 10, 
        coinReward: 5 
      })
      setSelectedUsers([])
      setSaveAsTemplate(false)
      setShowAddForm(false)
      loadTasks()
      
      const userCount = assignedUsers.length
      const taskCount = newTask.type === 'daily' ? userCount : 
                       newTask.type === 'weekly' ? userCount * 7 : 
                       userCount * 27
      
      let message = ''
      if (newTask.type === 'weekly') {
        message = t('tasks.taskCreatedWeekly')
          .replace('{userCount}', userCount.toString())
          .replace('{dailyCount}', totalTaskIds.length.toString())
      } else if (newTask.type === 'monthly') {
        message = t('tasks.taskCreatedMonthly')
          .replace('{userCount}', userCount.toString())
          .replace('{dailyCount}', totalTaskIds.length.toString())
      } else {
        message = t('tasks.taskCreatedDaily')
          .replace('{userCount}', userCount.toString())
          .replace('{taskCount}', totalTaskIds.length.toString())
      }
      if (saveAsTemplate) {
        message += t('tasks.taskSavedAsTemplate')
      }
      setToast({ show: true, message, type: 'success' })
    } catch (error) {
      console.error('Error adding task:', error)
      setToast({ show: true, message: t('tasks.addTaskError'), type: 'error' })
    }
  }

  const handleUseTemplate = (template: TaskTemplate) => {
    // Điền thông tin từ template vào form thêm nhiệm vụ
    setNewTask({
      title: template.title,
      description: template.description,
      type: template.type,
      assignedTo: '',
      assignedToName: '',
      xpReward: template.xpReward,
      coinReward: template.coinReward,
    })
    
    // Set category nếu có
    if (template.category) {
      setTaskCategory(template.category)
    } else {
      setTaskCategory('')
    }
    
    // Reset selectedUsers để user có thể chọn lại
    setSelectedUsers([])
    
    // Đóng phần Templates và mở form Thêm nhiệm vụ
    setShowTemplates(false)
    setShowAddForm(true)
    
    // Scroll đến form nếu cần
    setTimeout(() => {
      const formElement = document.getElementById('add-task-form')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTaskTemplate(templateId)
      loadTemplates()
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId))
      setToast({ show: true, message: t('tasks.taskDeletedTemplate'), type: 'success' })
    } catch (error) {
      console.error('Error deleting template:', error)
      setToast({ show: true, message: t('tasks.deleteTemplateError'), type: 'error' })
    }
  }

  const handleDeleteSelectedTemplates = async () => {
    if (selectedTemplates.length === 0) {
      setToast({ show: true, message: language === 'vi' ? 'Vui lòng chọn ít nhất một template để xóa' : 'Please select at least one template to delete', type: 'error' })
      return
    }

    try {
      let deleted = 0
      let errors = 0
      
      for (const templateId of selectedTemplates) {
        try {
          await deleteTaskTemplate(templateId)
          deleted++
        } catch (error) {
          console.error(`Error deleting template ${templateId}:`, error)
          errors++
        }
      }

      loadTemplates()
      setSelectedTemplates([])
      
      const successMsg = language === 'vi'
        ? `Đã xóa ${deleted} template${errors > 0 ? `\nLỗi: ${errors} template` : ''}`
        : `Deleted ${deleted} template${deleted !== 1 ? 's' : ''}${errors > 0 ? `\nError: ${errors} template${errors !== 1 ? 's' : ''}` : ''}`
      setToast({ show: true, message: successMsg, type: deleted > 0 ? 'success' : 'error' })
    } catch (error) {
      console.error('Error deleting templates:', error)
      setToast({ show: true, message: t('tasks.deleteTemplateError'), type: 'error' })
    }
  }

  const handleDeleteAllTemplates = async () => {
    const filteredTemplates = templateFilter === 'all' 
      ? templates 
      : templates.filter(t => t.category === templateFilter)
    
    if (filteredTemplates.length === 0) {
      setToast({ show: true, message: language === 'vi' ? 'Không có template nào để xóa' : 'No templates to delete', type: 'error' })
      return
    }

    try {
      let deleted = 0
      let errors = 0
      
      for (const template of filteredTemplates) {
        try {
          await deleteTaskTemplate(template.id)
          deleted++
        } catch (error) {
          console.error(`Error deleting template ${template.id}:`, error)
          errors++
        }
      }

      loadTemplates()
      setSelectedTemplates([])
      
      const successMsg = language === 'vi'
        ? `Đã xóa ${deleted} template${errors > 0 ? `\nLỗi: ${errors} template` : ''}`
        : `Deleted ${deleted} template${deleted !== 1 ? 's' : ''}${errors > 0 ? `\nError: ${errors} template${errors !== 1 ? 's' : ''}` : ''}`
      setToast({ show: true, message: successMsg, type: deleted > 0 ? 'success' : 'error' })
    } catch (error) {
      console.error('Error deleting all templates:', error)
      setToast({ show: true, message: t('tasks.deleteTemplateError'), type: 'error' })
    }
  }

  const handleToggleTemplateSelection = (templateId: string) => {
    if (selectedTemplates.includes(templateId)) {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId))
    } else {
      setSelectedTemplates([...selectedTemplates, templateId])
    }
  }

  const handleSelectAllTemplates = () => {
    const filteredTemplates = templateFilter === 'all' 
      ? templates 
      : templates.filter(t => t.category === templateFilter)
    
    const filteredIds = filteredTemplates.map(t => t.id)
    const allSelected = filteredIds.every(id => selectedTemplates.includes(id))
    
    if (allSelected) {
      // Deselect all
      setSelectedTemplates(selectedTemplates.filter(id => !filteredIds.includes(id)))
    } else {
      // Select all
      setSelectedTemplates([...new Set([...selectedTemplates, ...filteredIds])])
    }
  }

  const handleStartTask = async (task: Task) => {
    if (task.status !== 'pending') {
      return
    }

    try {
      if (!db) {
        setToast({ show: true, message: 'Firestore chưa được khởi tạo', type: 'error' })
        return
      }
      await updateDoc(doc(checkDb(), 'tasks', task.id), {
        status: 'in_progress'
      })
      loadTasks()
      setToast({ show: true, message: t('tasks.taskStarted'), type: 'success' })
    } catch (error) {
      console.error('Error starting task:', error)
      setToast({ show: true, message: t('tasks.taskStartError'), type: 'error' })
    }
  }

  const handleCompleteTask = async (task: Task) => {
    if (task.status === 'completed' || task.status === 'approved') {
      return
    }

    try {
      if (!db) {
        setToast({ show: true, message: 'Firestore chưa được khởi tạo', type: 'error' })
        return
      }
      await updateDoc(doc(checkDb(), 'tasks', task.id), {
        status: 'completed',
        completedAt: Timestamp.now()
      })
      
      // Nếu là nhiệm vụ ngày thuộc nhiệm vụ tuần/tháng, kiểm tra tiến độ
      if (task.parentTaskId && task.groupKey) {
        const isParentCompleted = await checkAndUpdateParentTask(task.parentTaskId, task.groupKey)
        if (isParentCompleted) {
          setToast({ show: true, message: t('tasks.parentTaskCompleted'), type: 'success' })
        }
      }

      loadTasks()
      if (onTaskComplete) onTaskComplete()
      setToast({ show: true, message: t('tasks.taskCompleted'), type: 'success' })
    } catch (error) {
      console.error('Error completing task:', error)
      setToast({ show: true, message: t('tasks.taskCompleteError'), type: 'error' })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (!db) {
        setToast({ show: true, message: 'Firestore chưa được khởi tạo', type: 'error' })
        return
      }
      
      // Sử dụng hàm deleteTask từ tasks.ts với kiểm tra quyền
      await deleteTask(taskId, currentUser.uid, profile.isRoot || false)
      loadTasks()
      setToast({ show: true, message: t('tasks.taskDeleted'), type: 'success' })
    } catch (error: any) {
      console.error('Error deleting task:', error)
      setToast({ 
        show: true, 
        message: error.message || t('tasks.taskDeleteError'), 
        type: 'error' 
      })
    }
  }
  
  // Xóa nhiều tasks cùng lúc (chỉ root)
  const handleDeleteMultipleTasks = async (taskIds: string[]) => {
    if (!profile.isRoot) {
      setToast({ 
        show: true, 
        message: language === 'vi' ? 'Chỉ root user mới có quyền xóa nhiều tasks' : 'Only root user can delete multiple tasks', 
        type: 'error' 
      })
      return
    }
    
    if (!confirm(language === 'vi' 
      ? `Bạn có chắc muốn xóa ${taskIds.length} nhiệm vụ?`
      : `Are you sure you want to delete ${taskIds.length} tasks?`)) {
      return
    }
    
    try {
      await deleteMultipleTasks(taskIds, currentUser.uid, profile.isRoot)
      loadTasks()
      setToast({ 
        show: true, 
        message: language === 'vi' 
          ? `✅ Đã xóa ${taskIds.length} nhiệm vụ!` 
          : `✅ Deleted ${taskIds.length} tasks!`, 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Error deleting multiple tasks:', error)
      setToast({ 
        show: true, 
        message: error.message || (language === 'vi' ? 'Lỗi khi xóa nhiều tasks' : 'Error deleting multiple tasks'), 
        type: 'error' 
      })
    }
  }

  const myTasks = tasks.filter(t => t.assignedTo === currentUser.uid)
  const otherTasks = tasks.filter(t => t.assignedTo !== currentUser.uid)
  
  // Summary nhiệm vụ theo loại (chỉ tính nhiệm vụ tổng hợp, không tính nhiệm vụ ngày con)
  const taskSummary = {
    daily: {
      total: myTasks.filter(t => t.type === 'daily' && !t.parentTaskId).length,
      pending: myTasks.filter(t => t.type === 'daily' && !t.parentTaskId && t.status === 'pending').length,
      in_progress: myTasks.filter(t => t.type === 'daily' && !t.parentTaskId && t.status === 'in_progress').length,
      completed: myTasks.filter(t => t.type === 'daily' && !t.parentTaskId && (t.status === 'completed' || t.status === 'approved')).length,
    },
    weekly: {
      total: myTasks.filter(t => t.type === 'weekly' && !t.parentTaskId).length,
      pending: myTasks.filter(t => t.type === 'weekly' && !t.parentTaskId && t.status === 'pending').length,
      in_progress: myTasks.filter(t => t.type === 'weekly' && !t.parentTaskId && t.status === 'in_progress').length,
      completed: myTasks.filter(t => t.type === 'weekly' && !t.parentTaskId && (t.status === 'completed' || t.status === 'approved')).length,
    },
    monthly: {
      total: myTasks.filter(t => t.type === 'monthly' && !t.parentTaskId).length,
      pending: myTasks.filter(t => t.type === 'monthly' && !t.parentTaskId && t.status === 'pending').length,
      in_progress: myTasks.filter(t => t.type === 'monthly' && !t.parentTaskId && t.status === 'in_progress').length,
      completed: myTasks.filter(t => t.type === 'monthly' && !t.parentTaskId && (t.status === 'completed' || t.status === 'approved')).length,
    },
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
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
        <h3 className="text-lg font-semibold text-gray-800">{t('tasks.title')}</h3>
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
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
          {/* Chỉ root mới có thể tạo nhiệm vụ */}
          {profile.isRoot ? (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setShowTemplates(false)
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              {showAddForm ? t('common.cancel') : `+ ${t('tasks.addTask')}`}
            </button>
          ) : (
            <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
              {t('tasks.onlyRootCanCreate')}
            </div>
          )}
        </div>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="bg-purple-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="font-medium text-gray-800">📋 {t('tasks.myTemplates')}</h4>
            
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Filter Templates by Category */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">{language === 'vi' ? 'Lọc:' : 'Filter:'}</label>
                <select
                  value={templateFilter}
                  onChange={(e) => {
                    setTemplateFilter(e.target.value as 'all' | 'hoc' | 'khac')
                    setSelectedTemplates([]) // Reset selection when filter changes
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">{language === 'vi' ? 'Tất cả' : 'All'}</option>
                  <option value="hoc">{t('tasks.categoryStudy')}</option>
                  <option value="khac">{t('tasks.categoryOther')}</option>
                </select>
              </div>
              
              {/* Delete buttons */}
              {(() => {
                const filteredTemplates = templateFilter === 'all' 
                  ? templates 
                  : templates.filter(t => t.category === templateFilter)
                const filteredIds = filteredTemplates.map(t => t.id)
                const selectedCount = selectedTemplates.filter(id => filteredIds.includes(id)).length
                
                return (
                  <>
                    {selectedCount > 0 && (
                      <button
                        onClick={handleDeleteSelectedTemplates}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        {language === 'vi' ? `Xóa đã chọn (${selectedCount})` : `Delete Selected (${selectedCount})`}
                      </button>
                    )}
                    {filteredTemplates.length > 0 && (
                      <button
                        onClick={handleDeleteAllTemplates}
                        className="px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-800"
                      >
                        {language === 'vi' ? `Xóa tất cả (${filteredTemplates.length})` : `Delete All (${filteredTemplates.length})`}
                      </button>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
          
          {/* Component tạo template mặc định */}
          <CreateDefaultTemplates 
            currentUserId={currentUser.uid}
            profile={profile}
            onTemplatesCreated={loadTemplates}
          />
          
          {/* Filtered Templates */}
          {(() => {
            const filteredTemplates = templateFilter === 'all' 
              ? templates 
              : templates.filter(t => t.category === templateFilter)
            
            return filteredTemplates.length === 0 ? (
              <p className="text-sm text-gray-500">
                {templateFilter === 'all' 
                  ? t('tasks.noTemplates')
                  : language === 'vi' 
                    ? `Không có template ${templateFilter === 'hoc' ? 'việc học' : 'việc khác'} nào.`
                    : `No ${templateFilter === 'hoc' ? 'study' : 'other'} templates.`}
              </p>
            ) : (
              <div className="space-y-2">
                {/* Select All checkbox */}
                <div className="flex items-center space-x-2 pb-2 border-b border-purple-200">
                  <input
                    type="checkbox"
                    checked={(() => {
                      const filteredIds = filteredTemplates.map(t => t.id)
                      return filteredIds.length > 0 && filteredIds.every(id => selectedTemplates.includes(id))
                    })()}
                    onChange={handleSelectAllTemplates}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="text-sm text-gray-700 cursor-pointer">
                    {language === 'vi' ? 'Chọn tất cả' : 'Select All'}
                  </label>
                  <span className="text-xs text-gray-500">
                    ({selectedTemplates.filter(id => filteredTemplates.map(t => t.id).includes(id)).length} / {filteredTemplates.length})
                  </span>
                </div>
                
                {filteredTemplates.map(template => (
                <div key={template.id} className={`bg-white border rounded-lg p-3 flex justify-between items-center ${
                  selectedTemplates.includes(template.id) ? 'border-purple-500 bg-purple-50' : 'border-purple-200'
                }`}>
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => handleToggleTemplateSelection(template.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h5 className="font-medium text-gray-800">{getTranslatedTemplateTitle(template.title, language)}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        template.type === 'daily' ? 'bg-blue-100 text-blue-800' :
                        template.type === 'weekly' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {template.type === 'daily' ? t('tasks.taskTypeDaily') :
                         template.type === 'weekly' ? t('tasks.taskTypeWeeklyFull') :
                         t('tasks.taskTypeMonthlyFull')}
                      </span>
                      {template.category && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          template.category === 'hoc' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {template.category === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')}
                        </span>
                      )}
                    </div>
                    {template.description && <p className="text-sm text-gray-600 mt-1">{template.description}</p>}
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span>XP: {template.xpReward}</span>
                      <span>Coins: {template.coinReward}</span>
                    </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                    >
                      {t('tasks.useTemplate')}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {showAddForm && (
        <div id="add-task-form" className="bg-gray-50 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder={t('tasks.taskTitle')}
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder={t('tasks.taskDescription')}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">{t('tasks.taskType')}</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="daily">{t('tasks.taskTypeDaily')}</option>
                <option value="weekly">{t('tasks.taskTypeWeekly')}</option>
                <option value="monthly">{t('tasks.taskTypeMonthly')}</option>
              </select>
              {newTask.type === 'weekly' && (
                <p className="text-xs text-blue-600 mt-1">ℹ️ {t('tasks.weeklyTaskInfo')}</p>
              )}
              {newTask.type === 'monthly' && (
                <p className="text-xs text-orange-600 mt-1">ℹ️ {t('tasks.monthlyTaskInfo')}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Giao cho {selectedUsers.length > 0 && `(${selectedUsers.length} người)`}
              </label>
              <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto">
                {users.map(user => (
                  <label key={user.id} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {user.name} {user.id === currentUser.uid ? `(${language === 'vi' ? 'Tôi' : 'Me'})` : ''}
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
              <label className="text-sm text-gray-600">{t('tasks.xpReward')}</label>
              <input
                type="number"
                value={newTask.xpReward}
                onChange={(e) => setNewTask({ ...newTask, xpReward: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">{t('tasks.coinReward')}</label>
              <input
                type="number"
                value={newTask.coinReward}
                onChange={(e) => setNewTask({ ...newTask, coinReward: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saveTemplate"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="saveTemplate" className="text-sm text-gray-700">
                {t('tasks.saveAsTemplate')}
              </label>
            </div>
            {saveAsTemplate && (
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('tasks.templateCategory')}</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as 'hoc' | 'khac' | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('tasks.noCategory')}</option>
                  <option value="hoc">{t('tasks.categoryStudy')}</option>
                  <option value="khac">{t('tasks.categoryOther')}</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'vi' 
                    ? `Khi dùng template, tên nhiệm vụ sẽ tự động có prefix: "${newTask.type === 'daily' ? 'Nhiệm vụ ngày' : newTask.type === 'weekly' ? 'Nhiệm vụ tuần' : 'Nhiệm vụ tháng'} - ${taskCategory === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')} - Tên nhiệm vụ"`
                    : `When using template, task title will automatically have prefix: "${newTask.type === 'daily' ? 'Daily Task' : newTask.type === 'weekly' ? 'Weekly Task' : 'Monthly Task'} - ${taskCategory === 'hoc' ? t('tasks.categoryStudy') : t('tasks.categoryOther')} - Task Title"`}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleAddTask}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {newTask.type === 'daily' ? t('tasks.addTask') :
             newTask.type === 'weekly' ? (language === 'vi' ? 'Tạo 6 nhiệm vụ ngày' : 'Create 6 daily tasks') :
             (language === 'vi' ? 'Tạo 26 nhiệm vụ ngày' : 'Create 26 daily tasks')}
          </button>
        </div>
      )}

      {/* Nhiệm vụ của tôi */}
      {myTasks.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">{t('tasks.myTasks')}</h4>
          <div className="space-y-2">
            {myTasks.map(task => {
              // Tách nhiệm vụ tổng hợp (weekly/monthly) và nhiệm vụ ngày
              const isParentTask = (task.type === 'weekly' || task.type === 'monthly') && !task.parentTaskId
              const isDailyTask = task.type === 'daily' && task.parentTaskId
              
              return (
              <div key={task.id} className={`bg-white border border-gray-200 rounded-lg p-4 ${isParentTask ? 'border-2 border-purple-300' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-gray-800">{getTranslatedTaskTitle(task.title, language)}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.type === 'daily' ? 'bg-blue-100 text-blue-800' :
                        task.type === 'weekly' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {task.type === 'daily' ? t('tasks.taskTypeDaily') :
                         task.type === 'weekly' ? t('tasks.taskTypeWeekly') :
                         t('tasks.taskTypeMonthly')}
                      </span>
                      {isParentTask && (
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-200 text-purple-900 font-semibold">
                          {t('tasks.parentTask')}
                        </span>
                      )}
                    </div>
                    {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                    {/* Hiển thị tiến độ cho nhiệm vụ tổng hợp */}
                    {isParentTask && task.requiredCount !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">{t('tasks.progress')}:</span>
                          <span className="text-sm text-purple-600 font-semibold">
                            {task.completedCount || 0} / {task.requiredCount}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((task.completedCount || 0) / task.requiredCount) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('tasks.progressRemaining')
                            .replace('{remaining}', (task.requiredCount - (task.completedCount || 0)).toString())
                            .replace('{type}', task.type === 'weekly' ? t('tasks.taskTypeWeek') : t('tasks.taskTypeMonth'))}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center flex-wrap gap-2 mt-2 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                        task.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'pending' ? t('tasks.statusPending') :
                         task.status === 'in_progress' ? t('tasks.statusInProgress') :
                         task.status === 'completed' ? t('tasks.statusWaitingApproval') :
                         task.status === 'approved' ? t('tasks.statusApproved') : task.status}
                      </span>
                      <span className="text-primary-600">XP: {task.xpReward}</span>
                      <span className="text-yellow-600">Coins: {task.coinReward}</span>
                    </div>
                    {/* Photo Evidence cho task đang làm hoặc đã hoàn thành */}
                    {(task.status === 'in_progress' || task.status === 'completed' || task.status === 'approved') && (
                      <div className="mt-3">
                        <PhotoEvidence 
                          taskId={task.id}
                          currentEvidence={task.evidence}
                          onEvidenceUploaded={loadTasks}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {/* Nhiệm vụ tổng hợp không có nút bắt đầu/hoàn thành, chỉ có xóa */}
                    {!isParentTask && task.status === 'pending' && (
                      <button
                        onClick={() => handleStartTask(task)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        {t('tasks.startTask')}
                      </button>
                    )}
                    {!isParentTask && task.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        {t('tasks.completeTask')}
                      </button>
                    )}
                    {/* Cho phép root user hoặc user tạo task xóa task */}
                    {(profile.isRoot || task.createdBy === currentUser.uid) && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        {t('tasks.deleteTask')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Nhiệm vụ của người khác */}
      {otherTasks.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">{t('tasks.otherTasks')}</h4>
          <div className="space-y-2">
            {otherTasks.map(task => (
              <div key={task.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{getTranslatedTaskTitle(task.title, language)}</h5>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <p>{t('tasks.assignedTo')}: <span className="font-medium">{task.assignedToName}</span></p>
                      {task.createdByName && (
                        <p>{t('tasks.createdBy')}: <span className="font-medium">{task.createdByName}</span></p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'pending' ? t('tasks.statusPending') :
                         task.status === 'completed' ? t('tasks.statusWaitingApproval') :
                         task.status === 'approved' ? t('tasks.statusApproved') : task.status}
                      </span>
                      <span className="text-primary-600">XP: {task.xpReward}</span>
                      <span className="text-yellow-600">Coins: {task.coinReward}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

