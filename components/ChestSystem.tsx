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
  const [openingVideoUrl, setOpeningVideoUrl] = useState<string | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [showRewardDelay, setShowRewardDelay] = useState(false) // Delay để hiển thị phần thưởng

  useEffect(() => {
    loadData()
  }, [])

  // Sắp xếp chests theo thứ tự: Wood → Silver → Gold → Mystery → Legendary
  const sortChestsByType = (chests: Chest[]): Chest[] => {
    const order: Record<string, number> = {
      'wood': 1,
      'silver': 2,
      'gold': 3,
      'mystery': 4,
      'legendary': 5,
    }
    
    return [...chests].sort((a, b) => {
      const typeA = getChestTypeFromItemPool(a.itemPool)
      const typeB = getChestTypeFromItemPool(b.itemPool)
      const orderA = order[typeA] || 999
      const orderB = order[typeB] || 999
      
      // Nếu cùng loại, sắp xếp theo cost (từ thấp đến cao)
      if (orderA === orderB) {
        return a.cost - b.cost
      }
      
      return orderA - orderB
    })
  }

  const loadData = async () => {
    try {
      const [chestsData, userChestsData] = await Promise.all([
        getAllChests(),
        getUserChests(currentUserId),
      ])
      // Sắp xếp chests theo thứ tự mong muốn
      const sortedChests = sortChestsByType(chestsData)
      setChests(sortedChests)
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

    // Tìm chest tương ứng để lấy openingMediaUrl
    const userChest = userChests.find(uc => uc.id === userChestId)
    const chest = userChest ? chests.find(c => c.id === userChest.chestId) : null
    
    // Xác định chest type
    const chestType = chest ? getChestTypeFromItemPool(chest.itemPool) : null
    
    // Ưu tiên: 1. openingMediaUrl từ database, 2. URL từ mapping, 3. Không có video
    const videoUrl = chest?.openingMediaUrl || (chestType ? chestOpeningVideoUrls[chestType] : null)
    
    // Mở rương ngay để lấy phần thưởng (không đợi video xong)
    setOpening(userChestId)
    let rewardItem: ChestItem | null = null
    
    try {
      // Mở rương ngay để lấy phần thưởng
      rewardItem = await openChest(userChestId, currentUserId)
      loadData()
      if (onChestOpened) onChestOpened()
    } catch (error: any) {
      console.error('Error opening chest:', error)
      setToast({ show: true, message: error.message || t('chestSystem.openError'), type: 'error' })
      setOpening(null)
      return
    }
    
    // Nếu có video/animation, hiển thị video với phần thưởng overlay (delay 2-3 giây)
    if (videoUrl && rewardItem) {
      setOpeningVideoUrl(videoUrl)
      setVideoEnded(false)
      setShowRewardDelay(false) // Reset delay state
      setShowResult(null) // Chưa hiển thị phần thưởng ngay
      console.log(`[ChestSystem] Playing opening video for ${chestType} chest with reward:`, rewardItem)
      
      // Delay 2.5 giây trước khi hiển thị phần thưởng
      setTimeout(() => {
        setShowResult(rewardItem)
        setShowRewardDelay(true)
      }, 2500) // 2.5 giây delay
      
      // Video sẽ tự động đóng khi xong, phần thưởng đã hiển thị
      return
    }

    // Nếu không có video, chỉ hiển thị phần thưởng
    if (rewardItem) {
      setShowResult(rewardItem)
    }
    setOpening(null)
  }

  // Mở rương trực tiếp (không có video)
  const openChestDirectly = async (userChestId: string) => {
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

  // Xử lý khi video kết thúc
  const handleVideoEnd = async () => {
    setVideoEnded(true)
    // Đóng video sau 1s, phần thưởng vẫn hiển thị
    setTimeout(() => {
      setOpeningVideoUrl(null)
      setVideoEnded(false)
      setShowRewardDelay(false)
      setOpening(null)
      // Phần thưởng đã được hiển thị trong modal showResult, không cần làm gì thêm
    }, 1000)
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

  // Mapping các chest type với URL thực tế trên Cloudinary (ảnh đóng)
  const chestImageUrls: Record<string, string> = {
    wood: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1767356618/wood_chest_closed_iagexl.png',
    silver: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1767356711/silver_chest_closed_pcyuoh.png',
    gold: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1767356728/gold_chest_closed_qfovoa.png',
    mystery: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1767356739/mystery_chest_closed_ljqpnj.png',
    legendary: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1767356745/legendary_chest_closed_aurtuy.png',
  }

  // Mapping các chest type với URL video mở rương trên Cloudinary
  const chestOpeningVideoUrls: Record<string, string> = {
    wood: 'https://res.cloudinary.com/dvuy40chj/video/upload/v1767360488/wooden_chest_open_l9b8jv.mp4',
    silver: 'https://res.cloudinary.com/dvuy40chj/video/upload/v1767360533/silver_chest_open_flmbw7.mp4',
    gold: 'https://res.cloudinary.com/dvuy40chj/video/upload/v1767360576/gold_chest_open_o7mz7g.mp4',
    mystery: 'https://res.cloudinary.com/dvuy40chj/video/upload/v1767360618/mystery_chest_open_xaa7pc.mp4',
    legendary: 'https://res.cloudinary.com/dvuy40chj/video/upload/v1767360650/legendary_chest_open_juqrdc.mp4',
  }

  // Lấy URL hình ảnh rương dựa trên chest type
  const getChestImageUrl = (chest: Chest): string | null => {
    // Nếu có closedImageUrl trong database, dùng nó (ưu tiên cao nhất)
    if (chest.closedImageUrl) {
      console.log(`[ChestSystem] Using database URL for chest ${chest.id}:`, chest.closedImageUrl)
      return chest.closedImageUrl
    }
    
    // Nếu không có, xác định chest type và dùng URL từ mapping
    const chestType = getChestTypeFromItemPool(chest.itemPool)
    
    // Kiểm tra xem có URL trong mapping không
    if (chestImageUrls[chestType]) {
      console.log(`[ChestSystem] Using mapped URL for ${chestType} chest:`, chestImageUrls[chestType])
      return chestImageUrls[chestType]
    }
    
    // Fallback: thử tìm trong folder (nếu có)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvuy40chj'
    const fallbackUrl = `https://res.cloudinary.com/${cloudName}/image/upload/family-tasks/chests/${chestType}/${chestType}_chest_closed.png`
    console.log(`[ChestSystem] Using fallback URL for ${chestType} chest:`, fallbackUrl)
    return fallbackUrl
  }

  // Lấy URL hình ảnh cho user chest (rương của user)
  const getUserChestImageUrl = (userChest: UserChest): string | null => {
    // Tìm chest tương ứng
    const chest = chests.find(c => c.id === userChest.chestId)
    if (chest) {
      return getChestImageUrl(chest)
    }
    return null
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
  
  // Group các rương đã mở giống nhau theo chestId và receivedItem
  interface GroupedOpenedChest {
    chestId: string
    chestName: string
    receivedItem: ChestItem | undefined
    count: number
    firstChest: UserChest // Giữ lại một chest để lấy thông tin
  }
  
  const groupedOpenedChests: GroupedOpenedChest[] = []
  const chestGroups = new Map<string, GroupedOpenedChest>()
  
  openedChests.forEach(userChest => {
    // Tạo key dựa trên chestId và receivedItem.id (nếu có)
    const key = userChest.receivedItem 
      ? `${userChest.chestId}_${userChest.receivedItem.id}`
      : `${userChest.chestId}_no_item`
    
    if (chestGroups.has(key)) {
      const group = chestGroups.get(key)!
      group.count++
    } else {
      chestGroups.set(key, {
        chestId: userChest.chestId,
        chestName: userChest.chestName,
        receivedItem: userChest.receivedItem,
        count: 1,
        firstChest: userChest,
      })
    }
  })
  
  groupedOpenedChests.push(...Array.from(chestGroups.values()))

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
          {chests.map(chest => {
            const chestImageUrl = getChestImageUrl(chest)
            return (
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
              
              {/* Hình ảnh rương */}
              {chestImageUrl && (
                <div className="mb-3 flex justify-center">
                  <img
                    src={chestImageUrl}
                    alt={chest.name}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      // Fallback nếu ảnh không load được
                      const target = e.target as HTMLImageElement
                      const chestType = getChestTypeFromItemPool(chest.itemPool)
                      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                      
                      console.error(`[ChestSystem] Failed to load chest image: ${chestImageUrl}`)
                      console.log(`[ChestSystem] Chest type: ${chestType}, Cloud name: ${cloudName}`)
                      console.log(`[ChestSystem] Please check Cloudinary Dashboard for actual file name in folder: family-tasks/chests/${chestType}/`)
                      
                      // Hiển thị emoji fallback
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="text-4xl">📦</div>'
                      }
                    }}
                    onLoad={() => {
                      console.log(`[ChestSystem] Successfully loaded chest image: ${chestImageUrl}`)
                    }}
                  />
                </div>
              )}
              
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
          )
          })}
        </div>
      </div>

      {/* Rương chưa mở */}
      {unopenedChests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">
            {t('chestSystem.myChests')} ({unopenedChests.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unopenedChests.map(userChest => {
              const chestImageUrl = getUserChestImageUrl(userChest)
              return (
              <div
                key={userChest.id}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 text-center"
              >
                {/* Hình ảnh rương */}
                {chestImageUrl ? (
                  <div className="mb-2 flex justify-center">
                    <img
                      src={chestImageUrl}
                      alt={userChest.chestName}
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        console.error(`[ChestSystem] Failed to load user chest image: ${chestImageUrl}`, e)
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="text-6xl mb-2">📦</div>'
                        }
                      }}
                      onLoad={() => {
                        console.log(`[ChestSystem] Successfully loaded user chest image: ${chestImageUrl}`)
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-6xl mb-2">📦</div>
                )}
                <h5 className="font-semibold text-gray-800 mb-2">{userChest.chestName}</h5>
                <button
                  onClick={() => handleOpen(userChest.id)}
                  disabled={opening === userChest.id}
                  className="w-full py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
                >
                  {opening === userChest.id ? t('chestSystem.opening') : t('chestSystem.open')}
                </button>
              </div>
            )
            })}
          </div>
        </div>
      )}

      {/* Rương đã mở - Grouped */}
      {groupedOpenedChests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">
            {t('chestSystem.openHistory')} ({openedChests.length} {language === 'vi' ? 'rương' : 'chests'})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groupedOpenedChests.map((group, index) => {
              const chestImageUrl = getUserChestImageUrl(group.firstChest)
              return (
              <div
                key={`${group.chestId}_${group.receivedItem?.id || 'no_item'}_${index}`}
                className="bg-gray-100 border border-gray-300 rounded-lg p-4"
              >
                {/* Hình ảnh rương */}
                {chestImageUrl ? (
                  <div className="mb-2 flex justify-center">
                    <img
                      src={chestImageUrl}
                      alt={group.chestName}
                      className="w-16 h-16 object-contain opacity-60"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        console.error(`[ChestSystem] Failed to load opened chest image: ${chestImageUrl}`, e)
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="text-4xl mb-2 text-center">📦</div>'
                        }
                      }}
                      onLoad={() => {
                        console.log(`[ChestSystem] Successfully loaded opened chest image: ${chestImageUrl}`)
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-4xl mb-2 text-center">📦</div>
                )}
                <h5 className="font-semibold text-gray-800 mb-1 text-center">
                  {group.chestName}
                </h5>
                {/* Hiển thị count nếu > 1 */}
                {group.count > 1 && (
                  <div className="text-center mb-2">
                    <span className="inline-block bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      x{group.count}
                    </span>
                  </div>
                )}
                {group.receivedItem && (
                  <div
                    className={`border-2 rounded-lg p-3 mt-2 ${getRarityColor(
                      group.receivedItem.rarity
                    )}`}
                  >
                    <p className="font-semibold">{group.receivedItem.name}</p>
                    <p className="text-xs mt-1">
                      {group.receivedItem.description || group.receivedItem.type}
                    </p>
                    <p className="text-xs mt-1">
                      {t('chestSystem.rarity')}: <span className="font-bold">{getRarityName(group.receivedItem.rarity)}</span>
                    </p>
                  </div>
                )}
              </div>
            )
            })}
          </div>
        </div>
      )}

      {/* Modal hiển thị video mở rương với phần thưởng overlay */}
      {openingVideoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Video container */}
            <div className="relative">
              {openingVideoUrl.endsWith('.mp4') || openingVideoUrl.endsWith('.webm') || openingVideoUrl.includes('video') ? (
                <video
                  src={openingVideoUrl}
                  autoPlay
                  onEnded={handleVideoEnd}
                  className="w-full h-auto rounded-lg"
                  controls={false}
                />
              ) : (
                <img
                  src={openingVideoUrl}
                  alt="Opening animation"
                  className="w-full h-auto rounded-lg"
                  onLoad={() => {
                    // Nếu là ảnh, tự động đóng sau 3 giây
                    setTimeout(() => {
                      handleVideoEnd()
                    }, 3000)
                  }}
                />
              )}
              
              {/* Phần thưởng overlay - hiển thị sau 2.5 giây khi video chạy */}
              {showResult && showRewardDelay && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 rounded-b-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-white mb-3">{t('chestSystem.congratulations')}</h3>
                    <div className={`border-2 rounded-lg p-4 mb-3 ${getRarityColor(showResult.rarity)} bg-white/95`}>
                      {/* Hình ảnh phần thưởng */}
                      {showResult.image && (
                        <div className="mb-3 flex justify-center">
                          <img
                            src={showResult.image}
                            alt={showResult.name}
                            className="w-24 h-24 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      <p className="text-lg font-bold mb-1">{showResult.name}</p>
                      <p className="text-xs mb-1">{showResult.description}</p>
                      <p className="text-xs">
                        {t('chestSystem.rarity')}: <span className="font-bold">{getRarityName(showResult.rarity)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOpeningVideoUrl(null)
                        setShowResult(null)
                        setShowRewardDelay(false)
                        setOpening(null)
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                    >
                      {t('common.close')}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                {/* Hình ảnh phần thưởng */}
                {showResult.image && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={showResult.image}
                      alt={showResult.name}
                      className="w-32 h-32 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <p className="text-2xl font-bold mb-2">{showResult.name}</p>
                <p className="text-sm mb-2">{showResult.description}</p>
                <p className="text-xs">
                  {t('chestSystem.rarity')}: <span className="font-bold">{getRarityName(showResult.rarity)}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResult(null)
                  setShowRewardDelay(false)
                }}
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
