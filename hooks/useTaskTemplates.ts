import { useState, useCallback } from 'react'
import { getTaskTemplates, deleteTaskTemplate, TaskTemplate, createRecurringDailyTasks } from '@/lib/firebase/tasks'
import { createRecurringTaskDef } from '@/lib/firebase/recurringTasks'
import { UserProfile } from '@/lib/firebase/profile'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface UseTaskTemplatesProps {
    currentUser: { uid: string }
    profile: UserProfile
    language: string
    t: any
    showToast: (message: string, type: 'success' | 'error' | 'info') => void
    onTasksChanged: () => void
}

export function useTaskTemplates({ currentUser, profile, language, t, showToast, onTasksChanged }: UseTaskTemplatesProps) {
    const [templates, setTemplates] = useState<TaskTemplate[]>([])

    const loadTemplates = useCallback(async () => {
        try {
            const templatesData = await getTaskTemplates(currentUser.uid)
            setTemplates(templatesData)
            return templatesData
        } catch (error) {
            console.error('Error loading templates:', error)
            return []
        }
    }, [currentUser.uid])

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            await deleteTaskTemplate(templateId)
            await loadTemplates()
            showToast(t('tasks.taskDeletedTemplate'), 'success')
            return true
        } catch (error) {
            console.error('Error deleting template:', error)
            showToast(t('tasks.deleteTemplateError'), 'error')
            return false
        }
    }

    const handleDeleteSelectedTemplates = async (selectedTemplates: string[]) => {
        if (selectedTemplates.length === 0) {
            showToast(language === 'vi' ? 'Vui lòng chọn ít nhất một template để xóa' : 'Please select at least one template to delete', 'error')
            return false
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

            await loadTemplates()

            const successMsg = language === 'vi'
                ? `Đã xóa ${deleted} template${errors > 0 ? `\nLỗi: ${errors} template` : ''}`
                : `Deleted ${deleted} template${deleted !== 1 ? 's' : ''}${errors > 0 ? `\nError: ${errors} template${errors !== 1 ? 's' : ''}` : ''}`
            showToast(successMsg, deleted > 0 ? 'success' : 'error')
            return true
        } catch (error) {
            console.error('Error deleting templates:', error)
            showToast(t('tasks.deleteTemplateError'), 'error')
            return false
        }
    }

    const handleDeleteAllTemplates = async (filteredTemplates: TaskTemplate[]) => {
        if (filteredTemplates.length === 0) {
            showToast(language === 'vi' ? 'Không có template nào để xóa' : 'No templates to delete', 'error')
            return false
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

            await loadTemplates()

            const successMsg = language === 'vi'
                ? `Đã xóa ${deleted} template${errors > 0 ? `\nLỗi: ${errors} template` : ''}`
                : `Deleted ${deleted} template${deleted !== 1 ? 's' : ''}${errors > 0 ? `\nError: ${errors} template${errors !== 1 ? 's' : ''}` : ''}`
            showToast(successMsg, deleted > 0 ? 'success' : 'error')
            return true
        } catch (error) {
            console.error('Error deleting all templates:', error)
            showToast(t('tasks.deleteTemplateError'), 'error')
            return false
        }
    }

    const handleBulkCreateAndAssign = async (
        selectedTemplates: string[],
        selectedUsers: string[],
        users: UserProfile[],
        bulkXP: number | '',
        bulkCoin: number | '',
        bulkType: 'keep' | 'daily' | 'weekly' | 'monthly' | 'recurring' = 'keep'
    ) => {
        if (!profile.isRoot) {
            showToast(language === 'vi' ? '⚠️ Chỉ bố mẹ (ông bà) mới có thể tạo nhiệm vụ!' : '⚠️ Only parents (grandparents) can create tasks!', 'error')
            return false
        }

        if (selectedTemplates.length === 0) {
            showToast(language === 'vi' ? 'Vui lòng chọn ít nhất 1 template' : 'Please select at least 1 template', 'error')
            return false
        }

        if (selectedUsers.length === 0) {
            showToast(t('tasks.selectAtLeastOnePerson'), 'error')
            return false
        }

        try {
            const selectedTemplateObjects = templates.filter(t => selectedTemplates.includes(t.id))
            const assignedUsers = users.filter(u => selectedUsers.includes(u.id))

            let totalCreated = 0
            const errors: string[] = []

            for (const template of selectedTemplateObjects) {
                const finalXP = bulkXP !== '' ? Number(bulkXP) : template.xpReward
                const finalCoin = bulkCoin !== '' ? Number(bulkCoin) : template.coinReward

                for (const user of assignedUsers) {
                    try {
                        let taskIds: string[] = []
                        const effectiveType = bulkType === 'keep' ? template.type : bulkType

                        if (effectiveType === 'recurring') {
                            const defIds = await createRecurringTaskDef(
                                {
                                    title: template.title,
                                    description: template.description,
                                    xpReward: finalXP,
                                    coinReward: finalCoin,
                                    category: template.category,
                                },
                                [{ id: user.id, name: user.name }],
                                currentUser.uid,
                                profile.name,
                                profile.familyId || ''
                            )
                            taskIds = defIds
                        } else if (effectiveType === 'daily') {
                            if (!db) throw new Error('Firestore chưa được khởi tạo')
                            const now = new Date()
                            const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
                            const taskDate = `${vietnamTime.getUTCFullYear()}-${String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vietnamTime.getUTCDate()).padStart(2, '0')}`

                            const docRef = await addDoc(collection(db, 'tasks'), {
                                title: template.title,
                                description: template.description,
                                type: 'daily',
                                category: template.category || null,
                                assignedTo: user.id,
                                assignedToName: user.name,
                                createdBy: currentUser.uid,
                                createdByName: profile.name,
                                status: 'pending',
                                xpReward: finalXP,
                                coinReward: finalCoin,
                                familyId: profile.familyId,
                                createdAt: Timestamp.now(),
                                taskDate: taskDate
                            })
                            taskIds.push(docRef.id)
                        } else if (effectiveType === 'weekly' || effectiveType === 'monthly') {
                            const days = effectiveType === 'weekly' ? 6 : 26
                            const result = await createRecurringDailyTasks(
                                {
                                    title: template.title,
                                    description: template.description,
                                    assignedTo: user.id,
                                    assignedToName: user.name,
                                    xpReward: finalXP,
                                    coinReward: finalCoin,
                                    category: template.category,
                                },
                                currentUser.uid,
                                profile.name,
                                days,
                                effectiveType,
                                profile.familyId || ''
                            )
                            taskIds = result.dailyTaskIds
                        }

                        totalCreated += taskIds.length
                    } catch (error: any) {
                        console.error(`Error creating task from template ${template.title} for user ${user.name}:`, error)
                        errors.push(`${template.title} → ${user.name}: ${error.message}`)
                    }
                }
            }

            onTasksChanged()

            let message = language === 'vi'
                ? `✅ Đã tạo ${totalCreated} nhiệm vụ từ ${selectedTemplateObjects.length} template cho ${assignedUsers.length} người!`
                : `✅ Created ${totalCreated} tasks from ${selectedTemplateObjects.length} templates for ${assignedUsers.length} users!`

            if (errors.length > 0) {
                message += `\n⚠️ ${errors.length} lỗi: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`
            }

            showToast(message, errors.length > 0 ? 'error' : 'success')
            return errors.length === 0
        } catch (error: any) {
            console.error('Error in bulk create:', error)
            showToast(error.message || (language === 'vi' ? 'Lỗi khi tạo nhiều tasks' : 'Error creating multiple tasks'), 'error')
            return false
        }
    }

    return {
        templates,
        loadTemplates,
        handleDeleteTemplate,
        handleDeleteSelectedTemplates,
        handleDeleteAllTemplates,
        handleBulkCreateAndAssign
    }
}
