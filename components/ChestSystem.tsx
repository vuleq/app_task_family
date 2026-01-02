'use client'

import { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import {
  getAllChests,
  purchaseChest,
  openChest,
  getUserChests,
  createChest,
  updateChest,
  Chest,
  UserChest,
  ChestItem,
  DEFAULT_CHEST_ITEMS,
} from '@/lib/firebase/chest'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

interface ChestSystemProps {
  currentUserId: string
  profile: UserProfile
  onChestOpened?: () => void
}

export default function ChestSystem({ currentUserId, profile, onChestOpened }: ChestSystemProps) {
  const { t, language } = useI18n()
  const [chests, setChests] = useState<Chest[]>([])
  const [userChests, setUserChests] = useState<UserChest[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [showResult, setShowResult] = useState<ChestItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newChest, setNewChest] = useState({ name: '', cost: 50, chestType: 'wood' as 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary' })
  const [editingChest, setEditingChest] = useState<Chest & { chestType?: string } | null>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [chestsData, userChestsData] = await Promise.all([
        getAllChests(),
        getUserChests(currentUserId),
      ])
      setChests(chestsData)
      setUserChests(userChestsData)
    } catch (error) {
      console.error('Error loading chests:', error)
      setToast({ show: true, message: t('chestSystem.loadError'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (chestId: string) => {
    if (purchasing) return

    setPurchasing(chestId)
    try {
      await purchaseChest(currentUserId, chestId)
      setToast({ show: true, message: t('chestSystem.purchaseSuccess'), type: 'success' })
      loadData()
      if (onChestOpened) onChestOpened()
    } catch (error: any) {
      console.error('Error purchasing chest:', error)
      setToast({ show: true, message: error.message || t('chestSystem.purchaseError'), type: 'error' })
    } finally {
      setPurchasing(null)
    }
  }

  const handleOpen = async (userChestId: string) => {
    if (opening) return

    setOpening(userChestId)
    try {
      const item = await openChest(userChestId, currentUserId)
      setShowResult(item)
      loadData()
      if (onChestOpened) onChestOpened()
    } catch (error: any) {
      console.error('Error opening chest:', error)
      setToast({ show: true, message: error.message || t('chestSystem.openError'), type: 'error' })
    } finally {
      setOpening(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return t('chestSystem.rarityCommon')
      case 'rare':
        return t('chestSystem.rarityRare')
      case 'epic':
        return t('chestSystem.rarityEpic')
      case 'legendary':
        return t('chestSystem.rarityLegendary')
      default:
        return rarity
    }
  }

  const getItemPoolByChestType = (chestType: 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary'): ChestItem[] => {
    switch (chestType) {
      case 'wood':
        // Rương gỗ: chỉ có common items
        return [...DEFAULT_CHEST_ITEMS.common]
      case 'silver':
        // Rương bạc: common + rare items
        return [...DEFAULT_CHEST_ITEMS.common, ...DEFAULT_CHEST_ITEMS.rare]
      case 'gold':
        // Rương vàng: rare + epic items
        return [...DEFAULT_CHEST_ITEMS.rare, ...DEFAULT_CHEST_ITEMS.epic]
      case 'mystery':
        // Rương bí ẩn: tất cả loại items (common, rare, epic, legendary)
        return [...DEFAULT_CHEST_ITEMS.common, ...DEFAULT_CHEST_ITEMS.rare, ...DEFAULT_CHEST_ITEMS.epic, ...DEFAULT_CHEST_ITEMS.legendary]
      case 'legendary':
        // Rương huyền thoại: epic + legendary items
        return [...DEFAULT_CHEST_ITEMS.epic, ...DEFAULT_CHEST_ITEMS.legendary]
      default:
        return [...DEFAULT_CHEST_ITEMS.common]
    }
  }

  const getChestTypeFromItemPool = (itemPool: ChestItem[]): 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary' => {
    const hasLegendary = itemPool.some(item => item.rarity === 'legendary')
    const hasEpic = itemPool.some(item => item.rarity === 'epic')
    const hasRare = itemPool.some(item => item.rarity === 'rare')
    const hasCommon = itemPool.some(item => item.rarity === 'common')
    
    // Mystery: có tất cả các loại
    if (hasCommon && hasRare && hasEpic && hasLegendary) {
      return 'mystery'
    }
    // Legendary: có epic và legendary
    if (hasEpic && hasLegendary && !hasCommon && !hasRare) {
      return 'legendary'
    }
    // Gold: có rare và epic
    if (hasRare && hasEpic && !hasLegendary) {
      return 'gold'
    }
    // Silver: có common và rare
    if (hasCommon && hasRare && !hasEpic && !hasLegendary) {
      return 'silver'
    }
    // Wood: chỉ có common
    return 'wood'
  }

  const handleEditChest = (chest: Chest) => {
    if (!profile.isRoot) {
      setToast({ show: true, message: language === 'vi' 
        ? '⚠️ Chỉ tài khoản root mới có thể chỉnh sửa rương!'
        : '⚠️ Only root accounts can edit chests!', type: 'error' })
      return
    }
    // Xác định chestType dựa trên itemPool
    const chestType = getChestTypeFromItemPool(chest.itemPool)
    setEditingChest({ ...chest, chestType })
    setShowAddForm(false)
  }

  const handleUpdateChest = async () => {
    if (!editingChest) return

    if (!editingChest.name.trim()) {
      setToast({ show: true, message: language === 'vi' ? 'Vui lòng nhập tên rương' : 'Please enter chest name', type: 'error' })
      return
    }

    try {
      const itemPool = getItemPoolByChestType(editingChest.chestType as 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary')
      await updateChest(editingChest.id, editingChest.name, editingChest.cost, itemPool)
      setEditingChest(null)
      loadData()
      setToast({ show: true, message: language === 'vi' ? 'Đã cập nhật rương thành công!' : 'Chest updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating chest:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi cập nhật rương' : 'Error updating chest', type: 'error' })
    }
  }

  const handleAddChest = async () => {
    if (!profile.isRoot) {
      setToast({ show: true, message: language === 'vi' 
        ? '⚠️ Chỉ tài khoản root mới có thể tạo rương!'
        : '⚠️ Only root accounts can create chests!', type: 'error' })
      return
    }

    if (!newChest.name.trim()) {
      setToast({ show: true, message: language === 'vi' ? 'Vui lòng nhập tên rương' : 'Please enter chest name', type: 'error' })
      return
    }

    try {
      const itemPool = getItemPoolByChestType(newChest.chestType)
      await createChest(newChest.name, newChest.cost, itemPool)
      setNewChest({ name: '', cost: 50, chestType: 'wood' })
      setShowAddForm(false)
      loadData()
      setToast({ show: true, message: language === 'vi' ? 'Đã tạo rương thành công!' : 'Chest created successfully!', type: 'success' })
    } catch (error) {
      console.error('Error creating chest:', error)
      setToast({ show: true, message: language === 'vi' ? 'Lỗi khi tạo rương' : 'Error creating chest', type: 'error' })
    }
  }

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>
  }

  const unopenedChests = userChests.filter(c => !c.opened)
  const openedChests = userChests.filter(c => c.opened)

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">🎁 {t('chestSystem.title')}</h3>
        {/* Chỉ root mới có thể tạo rương */}
        {profile.isRoot ? (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingChest(null)
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            {showAddForm || editingChest ? t('common.cancel') : `+ ${language === 'vi' ? 'Thêm rương' : 'Add Chest'}`}
          </button>
        ) : (
          <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
            {language === 'vi' ? '⚠️ Chỉ root mới tạo rương' : '⚠️ Only root can create chests'}
          </div>
        )}
      </div>

      {/* Form thêm rương mới - Chỉ root mới thấy */}
      {showAddForm && profile.isRoot && !editingChest && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-700">{language === 'vi' ? 'Thêm rương mới' : 'Add New Chest'}</h4>
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tên rương' : 'Chest Name'}
            value={newChest.name}
            onChange={(e) => setNewChest({ ...newChest, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">{t('chestSystem.price')}</label>
              <input
                type="number"
                value={newChest.cost}
                onChange={(e) => setNewChest({ ...newChest, cost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">{language === 'vi' ? 'Loại rương' : 'Chest Type'}</label>
              <select
                value={newChest.chestType}
                onChange={(e) => setNewChest({ ...newChest, chestType: e.target.value as 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="wood">{language === 'vi' ? '🪵 Rương Gỗ' : '🪵 Wood Chest'}</option>
                <option value="silver">{language === 'vi' ? '🥈 Rương Bạc' : '🥈 Silver Chest'}</option>
                <option value="gold">{language === 'vi' ? '🥇 Rương Vàng' : '🥇 Gold Chest'}</option>
                <option value="mystery">{language === 'vi' ? '❓ Rương Bí Ẩn' : '❓ Mystery Chest'}</option>
                <option value="legendary">{language === 'vi' ? '⭐ Rương Huyền Thoại' : '⭐ Legendary Chest'}</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddChest}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {language === 'vi' ? 'Thêm rương' : 'Add Chest'}
          </button>
        </div>
      )}

      {/* Form chỉnh sửa rương - Chỉ root mới thấy */}
      {editingChest && profile.isRoot && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3 border-2 border-blue-300">
          <h4 className="font-medium text-gray-700">{language === 'vi' ? 'Chỉnh sửa rương' : 'Edit Chest'}</h4>
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tên rương' : 'Chest Name'}
            value={editingChest.name}
            onChange={(e) => setEditingChest({ ...editingChest, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">{t('chestSystem.price')}</label>
              <input
                type="number"
                value={editingChest.cost}
                onChange={(e) => setEditingChest({ ...editingChest, cost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">{language === 'vi' ? 'Loại rương' : 'Chest Type'}</label>
              <select
                value={editingChest.chestType || 'wood'}
                onChange={(e) => setEditingChest({ ...editingChest, chestType: e.target.value as 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="wood">{language === 'vi' ? '🪵 Rương Gỗ' : '🪵 Wood Chest'}</option>
                <option value="silver">{language === 'vi' ? '🥈 Rương Bạc' : '🥈 Silver Chest'}</option>
                <option value="gold">{language === 'vi' ? '🥇 Rương Vàng' : '🥇 Gold Chest'}</option>
                <option value="mystery">{language === 'vi' ? '❓ Rương Bí Ẩn' : '❓ Mystery Chest'}</option>
                <option value="legendary">{language === 'vi' ? '⭐ Rương Huyền Thoại' : '⭐ Legendary Chest'}</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateChest}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {language === 'vi' ? 'Lưu' : 'Save'}
            </button>
            <button
              onClick={() => setEditingChest(null)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Shop - Mua rương */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">{t('chestSystem.shop')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chests.map(chest => (
            <div
              key={chest.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-gray-800">{chest.name}</h5>
                {/* Nút chỉnh sửa - chỉ root mới thấy */}
                {profile.isRoot && (
                  <button
                    onClick={() => handleEditChest(chest)}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    title={language === 'vi' ? 'Chỉnh sửa rương' : 'Edit chest'}
                  >
                    ✏️
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {t('chestSystem.price')}: <span className="font-bold text-yellow-600">{chest.cost} Coins</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {t('chestSystem.canReceive')}
              </p>
              <button
                onClick={() => handlePurchase(chest.id)}
                disabled={purchasing === chest.id || profile.coins < chest.cost}
                className={`w-full py-2 rounded-lg font-medium ${
                  profile.coins >= chest.cost
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {purchasing === chest.id
                  ? t('chestSystem.purchasing')
                  : profile.coins >= chest.cost
                  ? `${t('chestSystem.purchase')} (${chest.cost} Coins)`
                  : t('chestSystem.notEnoughCoins')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rương chưa mở */}
      {unopenedChests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">
            {t('chestSystem.myChests')} ({unopenedChests.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unopenedChests.map(userChest => (
              <div
                key={userChest.id}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 text-center"
              >
                <div className="text-6xl mb-2">📦</div>
                <h5 className="font-semibold text-gray-800 mb-2">{userChest.chestName}</h5>
                <button
                  onClick={() => handleOpen(userChest.id)}
                  disabled={opening === userChest.id}
                  className="w-full py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
                >
                  {opening === userChest.id ? t('chestSystem.opening') : t('chestSystem.open')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rương đã mở */}
      {openedChests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">{t('chestSystem.openHistory')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {openedChests.map(userChest => (
              <div
                key={userChest.id}
                className="bg-gray-100 border border-gray-300 rounded-lg p-4"
              >
                <div className="text-4xl mb-2 text-center">📦</div>
                <h5 className="font-semibold text-gray-800 mb-2 text-center">
                  {userChest.chestName}
                </h5>
                {userChest.receivedItem && (
                  <div
                    className={`border-2 rounded-lg p-3 mt-2 ${getRarityColor(
                      userChest.receivedItem.rarity
                    )}`}
                  >
                    <p className="font-semibold">{userChest.receivedItem.name}</p>
                    <p className="text-xs mt-1">
                      {userChest.receivedItem.description || userChest.receivedItem.type}
                    </p>
                    <p className="text-xs mt-1">
                      {t('chestSystem.rarity')}: <span className="font-bold">{getRarityName(userChest.receivedItem.rarity)}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal hiển thị kết quả */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('chestSystem.congratulations')}</h3>
              <div
                className={`border-4 rounded-lg p-6 mb-4 ${getRarityColor(showResult.rarity)}`}
              >
                <p className="text-2xl font-bold mb-2">{showResult.name}</p>
                <p className="text-sm mb-2">{showResult.description}</p>
                <p className="text-xs">
                  {t('chestSystem.rarity')}: <span className="font-bold">{getRarityName(showResult.rarity)}</span>
                </p>
              </div>
              <button
                onClick={() => setShowResult(null)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                {t('chestSystem.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {chests.length === 0 && userChests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('chestSystem.noChests')}
        </div>
      )}
    </div>
  )
}
