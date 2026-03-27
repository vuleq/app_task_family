'use client'

import React, { useState, useEffect } from 'react'
import { UserProfile } from '@/lib/firebase/profile'
import {
  getAllChests,
  purchaseChest,
  openChest,
  getUserChests,
  createChest,
  updateChest,
  deleteChest,
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showResult, setShowResult] = useState<ChestItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  type ChestType = 'wood' | 'silver' | 'gold' | 'mystery' | 'legendary' | 'candy' | 'cosmic' | 'nature' | 'tech' | 'frozen'
  const [newChest, setNewChest] = useState({ name: '', cost: 50, chestType: 'wood' as ChestType })
  const [editingChest, setEditingChest] = useState<Chest & { chestType?: string } | null>(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [openingChestImg, setOpeningChestImg] = useState<string | null>(null)
  const [openingPhase, setOpeningPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealed'>('idle')

  useEffect(() => {
    loadData()
  }, [])

  // Lấy loại rương: ưu tiên chestType lưu trong DB, fallback suy ra từ itemPool
  const getEffectiveChestType = (chest: Chest): string => {
    if (chest.chestType) return chest.chestType
    const hasLegendary = chest.itemPool.some(i => i.rarity === 'legendary')
    const hasEpic = chest.itemPool.some(i => i.rarity === 'epic')
    const hasRare = chest.itemPool.some(i => i.rarity === 'rare')
    const hasCommon = chest.itemPool.some(i => i.rarity === 'common')
    if (hasCommon && hasRare && hasEpic && hasLegendary) return 'mystery'
    if (hasEpic && hasLegendary && !hasCommon && !hasRare) return 'legendary'
    if (hasRare && hasEpic && !hasLegendary) return 'gold'
    if (hasCommon && hasRare && !hasEpic && !hasLegendary) return 'silver'
    return 'wood'
  }

  const sortChestsByCost = (chests: Chest[]): Chest[] => {
    return [...chests].sort((a, b) => a.cost - b.cost)
  }

  const loadData = async () => {
    try {
      if (!profile.familyId) return
      const [chestsData, userChestsData] = await Promise.all([
        getAllChests(profile.familyId),
        getUserChests(currentUserId, profile.familyId),
      ])
      setChests(sortChestsByCost(chestsData))
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
      setToast({ show: true, message: error.message || t('chestSystem.purchaseError'), type: 'error' })
    } finally {
      setPurchasing(null)
    }
  }

  const handleOpen = async (userChestId: string) => {
    if (opening) return
    const userChest = userChests.find(uc => uc.id === userChestId)
    const chest = userChest ? chests.find(c => c.id === userChest.chestId) : null
    const chestImg = chest ? getChestImageUrl(chest) : null

    setOpening(userChestId)
    let rewardItem: ChestItem | null = null

    try {
      rewardItem = await openChest(userChestId, currentUserId)
      loadData()
      if (onChestOpened) onChestOpened()
    } catch (error: any) {
      setToast({ show: true, message: error.message || t('chestSystem.openError'), type: 'error' })
      setOpening(null)
      return
    }

    if (rewardItem) {
      setOpeningChestImg(chestImg)
      setOpeningPhase('shaking')
      setShowResult(null)
      // Shake for 2s, then play open animation
      setTimeout(() => {
        setOpeningPhase('opening')
        // Open animation lasts 0.6s, then reveal reward
        setTimeout(() => {
          setShowResult(rewardItem)
          setOpeningPhase('revealed')
        }, 700)
      }, 2000)
    } else {
      setOpening(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-100 text-slate-600 border-slate-200'
      case 'rare': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'epic': return 'bg-violet-100 text-violet-600 border-violet-200'
      case 'legendary': return 'bg-amber-100 text-amber-600 border-amber-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return t('chestSystem.rarityCommon')
      case 'rare': return t('chestSystem.rarityRare')
      case 'epic': return t('chestSystem.rarityEpic')
      case 'legendary': return t('chestSystem.rarityLegendary')
      default: return rarity
    }
  }

  const getItemPoolByChestType = (chestType: ChestType): ChestItem[] => {
    switch (chestType) {
      case 'wood':
      case 'candy':
        return [...DEFAULT_CHEST_ITEMS.common]
      case 'silver':
      case 'frozen':
        return [...DEFAULT_CHEST_ITEMS.common, ...DEFAULT_CHEST_ITEMS.rare]
      case 'gold':
      case 'nature':
        return [...DEFAULT_CHEST_ITEMS.rare, ...DEFAULT_CHEST_ITEMS.epic]
      case 'mystery':
      case 'cosmic':
        return [...DEFAULT_CHEST_ITEMS.common, ...DEFAULT_CHEST_ITEMS.rare, ...DEFAULT_CHEST_ITEMS.epic, ...DEFAULT_CHEST_ITEMS.legendary]
      case 'legendary':
      case 'tech':
        return [...DEFAULT_CHEST_ITEMS.epic, ...DEFAULT_CHEST_ITEMS.legendary]
      default:
        return [...DEFAULT_CHEST_ITEMS.common]
    }
  }

  const chestImageUrls: Record<string, string> = {
    wood:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585192/wooden_chest-removebg-preview_ojd1od.png',
    silver:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Silver_chest-removebg-preview_rx2zzi.png',
    gold:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Golden_chest-removebg-preview_h6osf1.png',
    mystery:   'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Mystery_chest-removebg-preview_ybp3e3.png',
    legendary: 'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Legendary_chest-removebg-preview_ntolx5.png',
    candy:     'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585190/Candy_chest-removebg-preview_xwxmnz.png',
    cosmic:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Cosmic_chest-removebg-preview_qyrtb0.png',
    nature:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Nature_chest-removebg-preview_rblkbb.png',
    tech:      'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/tech_chest-removebg-preview_ovx4he.png',
    frozen:    'https://res.cloudinary.com/dvuy40chj/image/upload/v1774585191/Frozen_chest-removebg-preview_rgej5m.png',
  }

  const getChestImageUrl = (chest: Chest): string | null => {
    if (chest.closedImageUrl) return chest.closedImageUrl
    const type = getEffectiveChestType(chest)
    return chestImageUrls[type] || null
  }

  const getUserChestImageUrl = (userChest: UserChest): string | null => {
    const chest = chests.find(c => c.id === userChest.chestId)
    return chest ? getChestImageUrl(chest) : null
  }

  const handleEditChest = (chest: Chest) => {
    if (!profile.isRoot) return
    const chestType = getEffectiveChestType(chest)
    setEditingChest({ ...chest, chestType })
    setShowAddForm(false)
  }

  const handleUpdateChest = async () => {
    if (!editingChest) return
    try {
      const type = (editingChest.chestType || 'wood') as ChestType
      const itemPool = getItemPoolByChestType(type)
      const imageUrl = chestImageUrls[type] || ''
      await updateChest(editingChest.id, editingChest.name, editingChest.cost, itemPool, type, imageUrl)
      setEditingChest(null)
      loadData()
      setToast({ show: true, message: 'Updated!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: 'Error updating', type: 'error' })
    }
  }

  const handleDeleteChest = async (chestId: string) => {
    if (!confirm(language === 'vi' ? 'Xóa rương này?' : 'Delete this chest?')) return
    setDeleting(chestId)
    try {
      await deleteChest(chestId)
      setEditingChest(null)
      loadData()
      setToast({ show: true, message: language === 'vi' ? 'Đã xóa rương!' : 'Chest deleted!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: 'Error deleting', type: 'error' })
    } finally {
      setDeleting(null)
    }
  }

  const handleAddChest = async () => {
    if (!profile.isRoot || !profile.familyId) return
    try {
      const itemPool = getItemPoolByChestType(newChest.chestType)
      const imageUrl = chestImageUrls[newChest.chestType] || ''
      await createChest(newChest.name, newChest.cost, itemPool, profile.familyId, newChest.chestType, imageUrl)
      setNewChest({ name: '', cost: 50, chestType: 'wood' })
      setShowAddForm(false)
      loadData()
      setToast({ show: true, message: 'Created!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: 'Error creating', type: 'error' })
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-violet-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Chests...</p>
    </div>
  )

  const unopenedChests = userChests.filter(c => !c.opened)

  return (
    <div className="space-y-12 pb-20">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-violet-100 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-soft animate-bounce-slow">✨</div>
           <div>
              <h3 className="text-3xl font-black text-violet-900 uppercase tracking-tight">{t('chestSystem.title')}</h3>
              <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.2em]">{t('chestSystem.shop')}</p>
           </div>
        </div>
        {profile.isRoot && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingChest(null); }}
            className="btn-playful bg-violet-600 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black shadow-kid hover:bg-violet-700 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-violet-800"
          >
            {showAddForm ? t('common.cancel') : `+ ${language === 'vi' ? 'Thêm rương' : 'Add Chest'}`}
          </button>
        )}
      </div>

      {/* Add New Chest Form */}
      {showAddForm && (
        <div className="kid-card p-10 bg-white border-violet-100 shadow-kid animate-bounce-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 opacity-30" />
          <h4 className="text-xl font-black text-violet-900 mb-8 uppercase tracking-tight flex items-center gap-3">
            <span className="text-2xl">✨</span>
            {language === 'vi' ? 'Tạo rương mới' : 'New Chest'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-2">Name</label>
              <input type="text" value={newChest.name}
                onChange={(e) => setNewChest({...newChest, name: e.target.value})}
                className="w-full px-6 py-4 border-4 border-violet-50 rounded-2xl bg-violet-50/30 font-black text-violet-900 focus:outline-none focus:border-violet-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-2">Cost (Coins)</label>
              <input type="number" value={newChest.cost}
                onChange={(e) => setNewChest({...newChest, cost: parseInt(e.target.value)})}
                className="w-full px-6 py-4 border-4 border-violet-50 rounded-2xl bg-violet-50/30 font-black text-violet-900 focus:outline-none focus:border-violet-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-2">Type</label>
              <select value={newChest.chestType}
                onChange={(e) => setNewChest({...newChest, chestType: e.target.value as any})}
                className="w-full px-6 py-4 border-4 border-violet-50 rounded-2xl bg-violet-50/30 font-black text-violet-900 focus:outline-none focus:border-violet-200 appearance-none cursor-pointer"
              >
                <option value="wood">🪵 Wood</option>
                <option value="candy">🍬 Candy</option>
                <option value="silver">🥈 Silver</option>
                <option value="frozen">❄️ Frozen</option>
                <option value="gold">🥇 Gold</option>
                <option value="nature">🌿 Nature</option>
                <option value="mystery">🔮 Mystery</option>
                <option value="tech">🤖 Tech</option>
                <option value="legendary">👑 Legendary</option>
                <option value="cosmic">🌌 Cosmic</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={handleAddChest} className="flex-1 btn-playful bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-kid border-b-4 border-emerald-700">SAVE</button>
            <button onClick={() => setShowAddForm(false)} className="flex-1 btn-playful bg-white text-red-500 border-4 border-red-50 py-4 rounded-2xl font-black shadow-soft">CANCEL</button>
          </div>
        </div>
      )}

      {/* Shop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {chests.map(chest => {
          const chestImageUrl = getChestImageUrl(chest)
          const chestType = getEffectiveChestType(chest)
          const isEditing = editingChest?.id === chest.id
          const themes: Record<string, string> = {
            wood:      'bg-orange-50 border-orange-100 text-orange-900 shadow-orange-100',
            silver:    'bg-slate-50 border-slate-100 text-slate-900 shadow-slate-100',
            gold:      'bg-amber-50 border-amber-100 text-amber-900 shadow-amber-100',
            mystery:   'bg-purple-50 border-purple-100 text-purple-900 shadow-purple-100',
            legendary: 'bg-amber-100 border-amber-200 text-orange-900 shadow-amber-200',
            candy:     'bg-pink-50 border-pink-100 text-pink-900 shadow-pink-100',
            cosmic:    'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-indigo-200',
            nature:    'bg-green-50 border-green-100 text-green-900 shadow-green-100',
            tech:      'bg-sky-50 border-sky-100 text-sky-900 shadow-sky-100',
            frozen:    'bg-cyan-50 border-cyan-100 text-cyan-900 shadow-cyan-100',
          }

          // ── Inline Edit Mode ──
          if (isEditing && editingChest) {
            return (
              <div key={chest.id} className="kid-card p-6 flex flex-col border-4 border-violet-300 bg-violet-50/60 animate-bounce-in">
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">
                  ✏️ {language === 'vi' ? 'Sửa rương' : 'Edit Chest'}
                </p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Name</label>
                    <input type="text" value={editingChest.name}
                      onChange={e => setEditingChest({...editingChest, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-violet-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Cost 🪙</label>
                    <input type="number" value={editingChest.cost}
                      onChange={e => setEditingChest({...editingChest, cost: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-violet-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Type</label>
                    <select value={editingChest.chestType || chestType}
                      onChange={e => setEditingChest({...editingChest, chestType: e.target.value as any})}
                      className="w-full px-4 py-3 border-2 border-violet-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-violet-300 text-sm appearance-none"
                    >
                      <option value="wood">🪵 Wood</option>
                      <option value="candy">🍬 Candy</option>
                      <option value="silver">🥈 Silver</option>
                      <option value="frozen">❄️ Frozen</option>
                      <option value="gold">🥇 Gold</option>
                      <option value="nature">🌿 Nature</option>
                      <option value="mystery">🔮 Mystery</option>
                      <option value="tech">🤖 Tech</option>
                      <option value="legendary">👑 Legendary</option>
                      <option value="cosmic">🌌 Cosmic</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={handleUpdateChest}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black shadow-soft border-b-4 border-emerald-700 text-xs uppercase tracking-widest hover:bg-emerald-600 active:translate-y-0.5 active:border-b-2">
                    {language === 'vi' ? 'LƯU' : 'SAVE'}
                  </button>
                  <button onClick={() => setEditingChest(null)}
                    className="w-full py-3 bg-white text-violet-500 border-2 border-violet-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-50">
                    {language === 'vi' ? 'HỦY' : 'CANCEL'}
                  </button>
                  <button onClick={() => handleDeleteChest(chest.id)} disabled={deleting === chest.id}
                    className="w-full py-3 bg-white text-red-500 border-2 border-red-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 disabled:opacity-50">
                    {deleting === chest.id ? '...' : `🗑️ ${language === 'vi' ? 'XÓA RƯƠNG' : 'DELETE'}`}
                  </button>
                </div>
              </div>
            )
          }

          // ── Normal Card View ──
          return (
            <div key={chest.id} className={`kid-card p-8 flex flex-col group relative hover:rotate-1 transition-all border-4 ${themes[chestType]}`}>
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h5 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">{chest.name}</h5>
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{chestType} chest</p>
                 </div>
                 {profile.isRoot && (
                   <button onClick={() => handleEditChest(chest)} className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all">✏️</button>
                 )}
              </div>

              <div className="my-8 flex justify-center relative">
                 <div className="absolute inset-x-0 bottom-0 h-4 bg-black/10 blur-xl rounded-full scale-50 group-hover:scale-75 transition-transform" />
                 {chestImageUrl ? (
                    <img src={chestImageUrl} alt={chest.name} className="w-36 h-36 object-contain relative z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-2xl" />
                 ) : (
                    <div className="text-7xl py-6 animate-bounce-slow">🎁</div>
                 )}
              </div>

              <div className="mt-auto space-y-4">
                 <div className="bg-white/60 p-4 rounded-2xl border-4 border-white/40 flex items-center justify-center gap-3 shadow-inner">
                    <span className="text-2xl">🪙</span>
                    <span className="text-2xl font-black">{chest.cost}</span>
                 </div>
                 <button
                  onClick={() => handlePurchase(chest.id)}
                  disabled={purchasing === chest.id || profile.coins < chest.cost}
                  className={`w-full py-5 rounded-[1.8rem] text-sm font-black shadow-kid border-b-8 transition-all active:translate-y-1 active:border-b-4 ${
                    profile.coins >= chest.cost ? 'bg-violet-600 text-white border-violet-800 hover:bg-violet-700' : 'bg-slate-200 text-slate-400 border-slate-300 pointer-events-none grayscale'
                  }`}
                 >
                   {purchasing === chest.id ? 'BUYING...' : profile.coins >= chest.cost ? 'BUY CHEST!' : 'NOT ENOUGH COINS'}
                 </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inventory Section */}
      {unopenedChests.length > 0 && (
        <div className="bg-amber-50/50 rounded-[3.5rem] p-12 border-4 border-amber-200 border-dashed relative overflow-hidden">
           <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30 animate-pulse" />
           <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-soft flex items-center justify-center text-3xl">🎒</div>
              <h4 className="text-2xl font-black text-amber-900 uppercase tracking-tight">Your Chests ({unopenedChests.length})</h4>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {unopenedChests.map(userChest => {
                const img = getUserChestImageUrl(userChest)
                return (
                  <div key={userChest.id} className="kid-card p-6 bg-white border-amber-100 shadow-kid flex flex-col items-center group active:scale-95 transition-all cursor-pointer" onClick={() => handleOpen(userChest.id)}>
                     <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-amber-100 blur-2xl rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {img ? <img src={img} className="w-28 h-28 object-contain relative z-10 group-hover:animate-float" /> : <div className="text-6xl py-4">📦</div>}
                     </div>
                     <h5 className="text-sm font-black text-amber-900 mb-6 text-center leading-tight">{userChest.chestName}</h5>
                     <button className="w-full py-3 bg-amber-500 text-white rounded-xl font-black shadow-soft hover:bg-amber-600 uppercase tracking-widest text-[10px] border-b-4 border-amber-700">OPEN NOW</button>
                  </div>
                )
              })}
           </div>
        </div>
      )}

      {/* Opening Animation Modal */}
      {openingPhase !== 'idle' && (
        <div className="fixed inset-0 bg-violet-950/95 flex items-center justify-center z-[100] p-6 backdrop-blur-xl">
           <div className="flex flex-col items-center justify-center space-y-8">
              {/* Chest with shake/open animation */}
              {openingPhase !== 'revealed' && (
                <div className={openingPhase === 'shaking' ? 'animate-chest-shake' : 'animate-chest-open'}>
                  {openingChestImg
                    ? <img src={openingChestImg} alt="chest" className="w-48 h-48 object-contain drop-shadow-2xl" />
                    : <div className="text-9xl">📦</div>
                  }
                </div>
              )}

              {openingPhase === 'shaking' && (
                <p className="text-white font-black text-xl uppercase tracking-widest animate-pulse">Opening...</p>
              )}

              {openingPhase === 'opening' && (
                <div className="flex gap-4 text-4xl">
                  {['✨','⭐','💫','🌟','✨'].map((s, i) => (
                    <span key={i} className="animate-sparkle" style={{ animationDelay: `${i * 0.15}s` }}>{s}</span>
                  ))}
                </div>
              )}

              {/* Reward reveal */}
              {openingPhase === 'revealed' && showResult && (
                <div className="animate-reward-pop">
                  <div className={`kid-card p-12 max-w-sm w-full text-center bg-white shadow-kid border-8 ${getRarityColor(showResult.rarity)}`}>
                    <div className="text-7xl mb-6">🎁</div>
                    <h3 className="text-2xl font-black text-violet-900 mb-2 uppercase tracking-tight">{t('chestSystem.congratulations')}!</h3>
                    <div className="my-8">
                      {showResult.image && <img src={showResult.image} className="w-40 h-40 mx-auto object-contain drop-shadow-2xl animate-float" />}
                      <p className="text-2xl font-black text-violet-900 uppercase tracking-tight mt-4">{showResult.name}</p>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{getRarityName(showResult.rarity)}</span>
                    </div>
                    <button
                      onClick={() => { setOpeningPhase('idle'); setOpeningChestImg(null); setShowResult(null); setOpening(null); }}
                      className="w-full py-5 bg-violet-600 text-white rounded-[1.8rem] font-black shadow-kid uppercase tracking-widest hover:bg-violet-700 border-b-8 border-violet-800 active:translate-y-1 active:border-b-4"
                    >COLLECT REWARD</button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Simple Result Modal (fallback when animation skipped) */}
      {showResult && openingPhase === 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
           <div className={`kid-card p-12 max-w-sm w-full text-center bg-white shadow-kid border-8 animate-bounce-in ${getRarityColor(showResult.rarity)}`}>
              <div className="text-7xl mb-6">🎁</div>
              <h3 className="text-2xl font-black text-violet-900 mb-2 uppercase tracking-tight">WOW! YOU GOT:</h3>
              <div className="my-8">
                 {showResult.image && <img src={showResult.image} className="w-40 h-40 mx-auto object-contain drop-shadow-2xl animate-float" />}
                 <p className="text-2xl font-black text-violet-900 uppercase tracking-tight mt-4">{showResult.name}</p>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{getRarityName(showResult.rarity)}</span>
              </div>
              <button onClick={() => setShowResult(null)} className="w-full py-5 bg-violet-600 text-white rounded-[1.8rem] font-black shadow-kid uppercase tracking-widest hover:bg-violet-700 border-b-8 border-violet-800 active:translate-y-1 active:border-b-4">COLLECT REWARD</button>
           </div>
        </div>
      )}
    </div>
  )
}
