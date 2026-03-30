'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs as getDocsQuery } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserProfile, updateProfile, getProfile } from '@/lib/firebase/profile'
import { useI18n } from '@/lib/i18n/context'
import Toast from './Toast'

interface Reward {
  id: string
  name: string
  description: string
  coinCost: number
  image?: string
  familyId: string
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

  const loadRewards = useCallback(async () => {
    try {
      if (!db || !profile.familyId) return
      const rewardsRef = collection(db, 'rewards')
      const q = query(rewardsRef, where('familyId', '==', profile.familyId))
      const snapshot = await getDocs(q)
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
  }, [profile.familyId])

  const loadMyRewards = useCallback(async () => {
    try {
      if (!db || !profile.familyId) return
      const userRewardsRef = collection(db, 'userRewards')
      const q = query(
        userRewardsRef, 
        where('userId', '==', currentUserId),
        where('familyId', '==', profile.familyId)
      )
      const snapshot = await getDocsQuery(q)
      const myRewardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMyRewards(myRewardsData)
    } catch (error) {
      console.error('Error loading my rewards:', error)
    }
  }, [currentUserId, profile.familyId])

  useEffect(() => {
    loadRewards()
    loadMyRewards()
  }, [loadRewards, loadMyRewards])

  const handlePurchase = async (reward: Reward) => {
    if (profile.coins < reward.coinCost) {
      setToast({ show: true, message: t('rewardsShop.notEnoughCoins'), type: 'error' })
      return
    }

    try {
      await updateProfile(currentUserId, { coins: profile.coins - reward.coinCost })
      if (!db) return
      await addDoc(collection(db, 'userRewards'), {
        userId: currentUserId,
        rewardId: reward.id,
        rewardName: reward.name,
        familyId: profile.familyId,
        purchasedAt: new Date()
      })
      setToast({ show: true, message: t('rewardsShop.purchaseSuccess').replace('{name}', reward.name), type: 'success' })
      loadMyRewards()
      if (onPurchaseComplete) onPurchaseComplete()
    } catch (error) {
      setToast({ show: true, message: t('rewardsShop.purchaseError'), type: 'error' })
    }
  }

  const handleAddReward = async () => {
    if (!newReward.name.trim()) {
      setToast({ show: true, message: t('rewardsShop.enterRewardName'), type: 'error' })
      return
    }
    try {
      if (!db) return
      await addDoc(collection(db, 'rewards'), {
        name: newReward.name,
        description: newReward.description,
        coinCost: newReward.coinCost,
        familyId: profile.familyId
      })
      setNewReward({ name: '', description: '', coinCost: 10 })
      setShowAddForm(false)
      loadRewards()
      setToast({ show: true, message: t('rewardsShop.addRewardSuccess'), type: 'success' })
    } catch (error) {
      setToast({ show: true, message: t('rewardsShop.addRewardError'), type: 'error' })
    }
  }

  const handleEditReward = (reward: Reward) => {
    if (!profile.isRoot) return
    setEditingReward(reward)
    setShowAddForm(false)
  }

  const handleUpdateReward = async () => {
    if (!editingReward || !db) return
    try {
      await updateDoc(doc(db, 'rewards', editingReward.id), {
        name: editingReward.name,
        description: editingReward.description,
        coinCost: editingReward.coinCost
      })
      setEditingReward(null)
      loadRewards()
      setToast({ show: true, message: 'Reward updated!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: 'Error updating', type: 'error' })
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    if (!profile.isRoot || !db) return
    try {
      await deleteDoc(doc(db, 'rewards', rewardId))
      loadRewards()
      setToast({ show: true, message: 'Deleted!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: 'Error deleting', type: 'error' })
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-violet-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Rewards...</p>
    </div>
  )

  return (
    <div className="space-y-12 pb-20">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-emerald-100 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-soft animate-bounce-slow">🎁</div>
           <div>
              <h3 className="text-3xl font-black text-violet-900 uppercase tracking-tight">{t('rewardsShop.title')}</h3>
              <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.2em]">Spend your coins!</p>
           </div>
        </div>
        {profile.isRoot && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingReward(null); }}
            className="btn-playful bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black shadow-kid hover:bg-emerald-600 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-emerald-700"
          >
            {showAddForm || editingReward ? t('common.cancel') : `+ ${t('rewardsShop.addReward')}`}
          </button>
        )}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add new reward inline card */}
        {showAddForm && (
          <div className="kid-card p-5 flex flex-col border-4 border-emerald-300 bg-emerald-50/60 animate-bounce-in">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">✨ {t('rewardsShop.addReward')}</p>
            <div className="space-y-2 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Name</label>
                <input type="text" value={newReward.name}
                  onChange={e => setNewReward({...newReward, name: e.target.value})}
                  placeholder="E.g: Bedtime story"
                  className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-emerald-300 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Description</label>
                <input type="text" value={newReward.description}
                  onChange={e => setNewReward({...newReward, description: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-emerald-300 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Cost 🪙</label>
                <input type="number" value={newReward.coinCost}
                  onChange={e => setNewReward({...newReward, coinCost: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-emerald-300 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={handleAddReward} className="w-full py-2 bg-emerald-500 text-white rounded-xl font-black shadow-soft border-b-4 border-emerald-700 text-xs uppercase tracking-widest hover:bg-emerald-600">SAVE</button>
              <button onClick={() => setShowAddForm(false)} className="w-full py-2 bg-white text-red-400 border-2 border-red-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50">CANCEL</button>
            </div>
          </div>
        )}

        {rewards.map(reward => {
          const isEditing = editingReward?.id === reward.id
          if (isEditing && editingReward) {
            return (
              <div key={reward.id} className="kid-card p-5 flex flex-col border-4 border-emerald-300 bg-emerald-50/60 animate-bounce-in">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">✏️ Edit Reward</p>
                <div className="space-y-2 flex-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Name</label>
                    <input type="text" value={editingReward.name}
                      onChange={e => setEditingReward({...editingReward, name: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-emerald-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Description</label>
                    <input type="text" value={editingReward.description}
                      onChange={e => setEditingReward({...editingReward, description: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-emerald-300 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-1">Cost 🪙</label>
                    <input type="number" value={editingReward.coinCost}
                      onChange={e => setEditingReward({...editingReward, coinCost: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl bg-white font-black text-violet-900 focus:outline-none focus:border-emerald-300 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <button onClick={handleUpdateReward} className="w-full py-2 bg-emerald-500 text-white rounded-xl font-black shadow-soft border-b-4 border-emerald-700 text-xs uppercase tracking-widest hover:bg-emerald-600">SAVE</button>
                  <button onClick={() => setEditingReward(null)} className="w-full py-2 bg-white text-violet-400 border-2 border-violet-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-50">CANCEL</button>
                  <button onClick={() => handleDeleteReward(reward.id)} className="w-full py-2 bg-white text-red-400 border-2 border-red-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50">🗑️ DELETE</button>
                </div>
              </div>
            )
          }
          return (
          <div key={reward.id} className="kid-card p-5 flex flex-col group relative overflow-hidden bg-white border-violet-100 shadow-soft hover:shadow-kid transition-all">
            <div className="flex items-center justify-between mb-3">
               <span className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">🎁</span>
               {profile.isRoot && (
                 <div className="flex gap-1">
                    <button onClick={() => handleEditReward(reward)} className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-all">✏️</button>
                    <button onClick={() => handleDeleteReward(reward.id)} className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-all">🗑️</button>
                 </div>
               )}
            </div>
            <h5 className="text-lg font-black text-violet-900 uppercase tracking-tight mb-1 leading-none">{reward.name}</h5>
            <p className="text-xs font-bold text-violet-300 line-clamp-2 mb-4">{reward.description || ''}</p>
            <div className="mt-auto space-y-3">
               <div className="bg-emerald-50 p-3 rounded-2xl border-2 border-emerald-100 flex items-center justify-center gap-2">
                  <span className="text-lg">🪙</span>
                  <span className="text-xl font-black text-emerald-600">{reward.coinCost}</span>
               </div>
               <button
                 onClick={() => handlePurchase(reward)}
                 disabled={profile.coins < reward.coinCost}
                 className={`w-full py-3 rounded-[1.5rem] text-sm font-black shadow-kid border-b-4 transition-all active:translate-y-0.5 active:border-b-2 ${
                   profile.coins >= reward.coinCost ? 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600' : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none grayscale'
                 }`}
               >
                 {profile.coins >= reward.coinCost ? 'GET!' : 'NOT ENOUGH'}
               </button>
            </div>
          </div>
          )
        })}
      </div>

      {/* Empty State */}
      {rewards.length === 0 && (
        <div className="text-center py-20 bg-violet-50/30 rounded-[3rem] border-4 border-dashed border-violet-100">
           <div className="text-7xl mb-6 grayscale opacity-30">🎁</div>
           <p className="text-violet-300 font-black uppercase tracking-widest">{t('rewardsShop.noRewards')}</p>
        </div>
      )}

      {/* My Rewards History */}
      {myRewards.length > 0 && (
         <div className="bg-violet-900 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-800 rounded-full blur-3xl opacity-20" />
            <div className="flex items-center gap-4 mb-10 relative z-10">
               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-3xl">🧺</div>
               <h4 className="text-2xl font-black text-white uppercase tracking-tight">Your Rewards Collection ({myRewards.length})</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
               {myRewards.map(reward => (
                 <div key={reward.id} className="p-6 bg-white/10 border-2 border-white/10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/20 transition-all">
                    <div className="mb-4 text-4xl group-hover:scale-110 transition-transform">📜</div>
                    <h5 className="text-white font-black uppercase tracking-tight truncate w-full px-2 mb-2">{reward.rewardName}</h5>
                    <p className="text-[9px] font-black text-violet-300 uppercase tracking-widest">
                       {new Date(reward.purchasedAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                    <div className="mt-4 px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-full shadow-soft">OWNED</div>
                 </div>
               ))}
            </div>
         </div>
      )}
    </div>
  )
}
