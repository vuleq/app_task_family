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

      {/* Forms Section */}
      {(showAddForm || editingReward) && (
        <div className="kid-card p-10 bg-white border-violet-100 shadow-kid animate-bounce-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-30" />
          <h4 className="text-xl font-black text-violet-900 mb-8 uppercase tracking-tight flex items-center gap-3">
             <span className="text-2xl">✨</span>
             {editingReward ? 'Edit Reward' : t('rewardsShop.addReward')}
          </h4>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-2">Reward Name</label>
              <input 
                type="text" 
                value={editingReward ? editingReward.name : newReward.name} 
                onChange={(e) => editingReward ? setEditingReward({...editingReward, name: e.target.value}) : setNewReward({...newReward, name: e.target.value})}
                className="w-full px-6 py-4 border-4 border-violet-50 rounded-2xl bg-violet-50/30 font-black text-violet-900 focus:outline-none focus:border-violet-200"
                placeholder="E.g: Bedtime story"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-2">Description</label>
                  <input 
                    type="text" 
                    value={editingReward ? editingReward.description : newReward.description} 
                    onChange={(e) => editingReward ? setEditingReward({...editingReward, description: e.target.value}) : setNewReward({...newReward, description: e.target.value})}
                    className="w-full px-6 py-4 border-4 border-violet-50 rounded-2xl bg-violet-50/30 font-black text-violet-900 focus:outline-none focus:border-violet-200"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-violet-300 uppercase tracking-widest ml-2">Cost (Coins)</label>
                  <input 
                    type="number" 
                    value={editingReward ? editingReward.coinCost : newReward.coinCost} 
                    onChange={(e) => editingReward ? setEditingReward({...editingReward, coinCost: parseInt(e.target.value)}) : setNewReward({...newReward, coinCost: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 border-4 border-violet-50 rounded-2xl bg-violet-50/30 font-black text-violet-900 focus:outline-none focus:border-violet-200"
                  />
               </div>
            </div>
            <div className="mt-8 flex gap-4">
               <button onClick={editingReward ? handleUpdateReward : handleAddReward} className="flex-1 btn-playful bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-kid border-b-4 border-emerald-700 uppercase tracking-widest">SAVE REWARD</button>
               <button onClick={() => { setShowAddForm(false); setEditingReward(null); }} className="flex-1 btn-playful bg-white text-red-500 border-4 border-red-50 py-4 rounded-2xl font-black shadow-soft uppercase tracking-widest">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {rewards.map(reward => (
          <div key={reward.id} className="kid-card p-0 flex flex-col group relative overflow-hidden bg-white border-violet-100 shadow-soft hover:shadow-kid transition-all">
            <div className="aspect-video bg-gradient-to-br from-violet-50 to-emerald-50 flex items-center justify-center p-8 group-hover:from-violet-100 group-hover:to-emerald-100 transition-colors">
               <span className="text-6xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">🎁</span>
               {profile.isRoot && (
                 <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEditReward(reward)} className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-soft flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-all">✏️</button>
                    <button onClick={() => handleDeleteReward(reward.id)} className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-soft flex items-center justify-center text-sm hover:scale-110 active:scale-95 text-red-500 transition-all">🗑️</button>
                 </div>
               )}
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
               <h5 className="text-2xl font-black text-violet-900 uppercase tracking-tight mb-2 leading-none">{reward.name}</h5>
               <p className="text-sm font-bold text-violet-300 line-clamp-2 mb-8">{reward.description || 'No description provided.'}</p>
               
               <div className="mt-auto space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border-4 border-emerald-100 flex items-center justify-center gap-3">
                     <span className="text-2xl">🪙</span>
                     <span className="text-2xl font-black text-emerald-600">{reward.coinCost}</span>
                  </div>
                  <button 
                    onClick={() => handlePurchase(reward)}
                    disabled={profile.coins < reward.coinCost}
                    className={`w-full py-5 rounded-[1.8rem] text-sm font-black shadow-kid border-b-8 transition-all active:translate-y-1 active:border-b-4 ${
                      profile.coins >= reward.coinCost ? 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600' : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none grayscale'
                    }`}
                  >
                    {profile.coins >= reward.coinCost ? 'GET REWARD!' : 'NEED MORE COINS'}
                  </button>
               </div>
            </div>
          </div>
        ))}
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
