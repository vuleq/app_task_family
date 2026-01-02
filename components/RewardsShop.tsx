'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs as getDocsQuery } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserProfile, updateProfile, getProfile } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

const checkDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your .env.local file.')
  }
  return db
}

interface Reward {
  id: string
  name: string
  description: string
  coinCost: number
  image?: string
}

interface RewardsShopProps {
  currentUserId: string
  profile: UserProfile
  onPurchaseComplete?: () => void
}

export default function RewardsShop({ currentUserId, profile, onPurchaseComplete }: RewardsShopProps) {
  const { t, language } = useI18n()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [myRewards, setMyRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReward, setNewReward] = useState({ name: '', description: '', coinCost: 10 })
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  useEffect(() => {
    loadRewards()
    loadMyRewards()
  }, [])

  const loadRewards = async () => {
    try {
      const rewardsRef = collection(checkDb(), 'rewards')
      const snapshot = await getDocs(rewardsRef)
      const rewardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reward[]
      setRewards(rewardsData)
    } catch (error) {
      console.error('Error loading rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyRewards = async () => {
    try {
      const userRewardsRef = collection(checkDb(), 'userRewards')
      const q = query(userRewardsRef, where('userId', '==', currentUserId))
      const snapshot = await getDocsQuery(q)
      const myRewardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMyRewards(myRewardsData)
    } catch (error) {
      console.error('Error loading my rewards:', error)
    }
  }

  const handlePurchase = async (reward: Reward) => {
    if (profile.coins < reward.coinCost) {
      setToast({ show: true, message: t('rewardsShop.notEnoughCoins'), type: 'error' })
      return
    }

    try {
      // Trừ coins
      await updateProfile(currentUserId, {
        coins: profile.coins - reward.coinCost
      })

      // Thêm vào userRewards
      await addDoc(collection(checkDb(), 'userRewards'), {
        userId: currentUserId,
        rewardId: reward.id,
        rewardName: reward.name,
        purchasedAt: new Date()
      })

      const successMsg = t('rewardsShop.purchaseSuccess').replace('{name}', reward.name)
      setToast({ show: true, message: successMsg, type: 'success' })
      loadMyRewards()
      if (onPurchaseComplete) onPurchaseComplete()
    } catch (error) {
      console.error('Error purchasing reward:', error)
      setToast({ show: true, message: t('rewardsShop.purchaseError'), type: 'error' })
    }
  }

  const handleAddReward = async () => {
    if (!newReward.name.trim()) {
      setToast({ show: true, message: t('rewardsShop.enterRewardName'), type: 'error' })
      return
    }

    try {
      await addDoc(collection(checkDb(), 'rewards'), {
        name: newReward.name,
        description: newReward.description,
        coinCost: newReward.coinCost
      })
      setNewReward({ name: '', description: '', coinCost: 10 })
      setShowAddForm(false)
      loadRewards()
      setToast({ show: true, message: t('rewardsShop.addRewardSuccess'), type: 'success' })
    } catch (error) {
      console.error('Error adding reward:', error)
      setToast({ show: true, message: t('rewardsShop.addRewardError'), type: 'error' })
    }
  }

  const handleEditReward = (reward: Reward) => {
    if (!profile.isRoot) {
      setToast({ show: true, message: language === 'vi' 
        ? '⚠️ Chỉ tài khoản root mới có thể chỉnh sửa phần thưởng!'
        : '⚠️ Only root accounts can edit rewards!', type: 'error' })
      return
    }
    setEditingReward(reward)
    setShowAddForm(false)
  }

  const handleUpdateReward = async () => {
    if (!editingReward) return

    if (!editingReward.name.trim()) {
      setToast({ show: true, message: t('rewardsShop.enterRewardName'), type: 'error' })
      return
    }

    try {
      const rewardRef = doc(checkDb(), 'rewards', editingReward.id)
      await updateDoc(rewardRef, {
        name: editingReward.name,
        description: editingReward.description,
        coinCost: editingReward.coinCost
      })
      setEditingReward(null)
      loadRewards()
      setToast({ show: true, message: language === 'vi' ? 'Đã cập nhật phần thưởng thành công!' : 'Reward updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating reward:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi cập nhật phần thưởng' : 'Error updating reward', type: 'error' })
    }
  }

  const handleDeleteReward = async (rewardId: string, rewardName: string) => {
    if (!profile.isRoot) {
      setToast({ show: true, message: language === 'vi' 
        ? '⚠️ Chỉ tài khoản root mới có thể xóa phần thưởng!'
        : '⚠️ Only root accounts can delete rewards!', type: 'error' })
      return
    }

    try {
      const rewardRef = doc(checkDb(), 'rewards', rewardId)
      await deleteDoc(rewardRef)
      loadRewards()
      setToast({ show: true, message: language === 'vi' ? 'Đã xóa phần thưởng thành công!' : 'Reward deleted successfully!', type: 'success' })
    } catch (error) {
      console.error('Error deleting reward:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi xóa phần thưởng' : 'Error deleting reward', type: 'error' })
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">🛒 {t('rewardsShop.title')}</h3>
        {/* Chỉ root mới có thể thêm phần thưởng */}
        {profile.isRoot ? (
        <button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setEditingReward(null)
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
        >
          {showAddForm || editingReward ? t('common.cancel') : `+ ${t('rewardsShop.addReward')}`}
        </button>
        ) : (
          <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
            {language === 'vi' ? '⚠️ Chỉ root mới tạo phần thưởng' : '⚠️ Only root can create rewards'}
          </div>
        )}
      </div>

      {/* Form thêm phần thưởng */}
      {showAddForm && profile.isRoot && !editingReward && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-700">{language === 'vi' ? 'Thêm phần thưởng mới' : 'Add New Reward'}</h4>
          <input
            type="text"
            placeholder={t('rewardsShop.rewardName')}
            value={newReward.name}
            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder={t('rewardsShop.description')}
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={2}
          />
          <div>
            <label className="text-sm text-gray-600">{t('rewardsShop.price')}</label>
            <input
              type="number"
              value={newReward.coinCost}
              onChange={(e) => setNewReward({ ...newReward, coinCost: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleAddReward}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('rewardsShop.addReward')}
          </button>
        </div>
      )}

      {/* Form chỉnh sửa phần thưởng */}
      {editingReward && profile.isRoot && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3 border-2 border-blue-300">
          <h4 className="font-medium text-gray-700">{language === 'vi' ? 'Chỉnh sửa phần thưởng' : 'Edit Reward'}</h4>
          <input
            type="text"
            placeholder={t('rewardsShop.rewardName')}
            value={editingReward.name}
            onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder={t('rewardsShop.description')}
            value={editingReward.description}
            onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={2}
          />
          <div>
            <label className="text-sm text-gray-600">{t('rewardsShop.price')}</label>
            <input
              type="number"
              value={editingReward.coinCost}
              onChange={(e) => setEditingReward({ ...editingReward, coinCost: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateReward}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {language === 'vi' ? 'Lưu' : 'Save'}
            </button>
            <button
              onClick={() => setEditingReward(null)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách phần thưởng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h5 className="font-medium text-gray-800 mb-1">{reward.name}</h5>
                {reward.description && <p className="text-sm text-gray-600 mb-3">{reward.description}</p>}
              </div>
              {/* Nút chỉnh sửa và xóa - chỉ root mới thấy */}
              {profile.isRoot && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditReward(reward)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    title={language === 'vi' ? 'Chỉnh sửa phần thưởng' : 'Edit reward'}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id, reward.name)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    title={language === 'vi' ? 'Xóa phần thưởng' : 'Delete reward'}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-600 font-medium">{reward.coinCost} Coins</span>
              <button
                onClick={() => handlePurchase(reward)}
                disabled={profile.coins < reward.coinCost}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {t('rewardsShop.purchase')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('rewardsShop.noRewards')}
        </div>
      )}

      {/* Phần thưởng đã mua */}
      {myRewards.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">{t('rewardsShop.myRewards')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myRewards.map(reward => (
              <div key={reward.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800">{reward.rewardName}</h5>
                <p className="text-xs text-gray-500 mt-1">
                  {t('rewardsShop.purchasedAt')}: {new Date(reward.purchasedAt?.seconds * 1000).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

