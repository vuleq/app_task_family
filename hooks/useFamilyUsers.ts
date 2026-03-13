import { useState, useCallback } from 'react'
import { UserProfile, getAllUsers } from '@/lib/firebase/profile'

export function useFamilyUsers(familyId?: string) {
    const [users, setUsers] = useState<UserProfile[]>([])

    const loadUsers = useCallback(async () => {
        if (!familyId) return
        try {
            const allUsers = await getAllUsers(familyId)
            setUsers(allUsers)
        } catch (error) {
            console.error('Error loading users:', error)
        }
    }, [familyId])

    return { users, loadUsers }
}
