import React, { useState } from 'react'
import type { Subscription, Profile } from '@khmer-horror/shared'
import { formatDate } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured, logAdminAction } from '../lib/supabase'
import { Crown, Plus, CheckCircle, Clock, XCircle, Search, Calendar, UserCheck } from 'lucide-react'

interface SubscriptionsViewProps {
  subscriptions: Subscription[]
  users: Profile[]
  onSubscriptionsChange: (updated: Subscription[]) => void
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  users,
  onSubscriptionsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all')

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime_vip'>('monthly')
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const filteredSubs = subscriptions.filter((sub) => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const userName = users.find((u) => u.id === sub.user_id)?.display_name?.toLowerCase() || ''
      if (!userName.includes(q) && !sub.user_id.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Grant manual subscription
  const handleGrantSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    setIsSaving(true)

    try {
      const now = new Date()
      let expiresAt: string | null = null

      if (selectedPlan === 'monthly') {
        const nextMonth = new Date(now)
        nextMonth.setDate(nextMonth.getDate() + 30)
        expiresAt = nextMonth.toISOString()
      } else if (selectedPlan === 'yearly') {
        const nextYear = new Date(now)
        nextYear.setDate(nextYear.getDate() + 365)
        expiresAt = nextYear.toISOString()
      }

      const newSub: Subscription = {
        id: `sub_${Date.now()}`,
        user_id: selectedUserId,
        plan_id: selectedPlan,
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expiresAt,
        provider_reference: 'manual_admin_grant',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('subscriptions').insert({
          user_id: selectedUserId,
          plan_id: selectedPlan,
          status: 'active',
          starts_at: now.toISOString(),
          expires_at: expiresAt,
          provider_reference: 'manual_admin_grant'
        }).select().single()

        if (error) throw error
        if (data) Object.assign(newSub, data)

        await logAdminAction('manual_subscription_granted', 'subscription', newSub.id, {
          userId: selectedUserId,
          plan: selectedPlan,
          expiresAt
        })
      }

      onSubscriptionsChange([newSub, ...subscriptions])
      setIsGrantModalOpen(false)
    } catch (err) {
      console.error('Grant subscription failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel/Revoke subscription
  const handleRevokeSubscription = async (sub: Subscription) => {
    if (!confirm('តើអ្នកពិតជាចង់បញ្ចប់សុពលភាពសមាជិកភាព VIP នេះមែនទេ?')) return

    const updated = subscriptions.map((s) => (s.id === sub.id ? { ...s, status: 'cancelled' as const } : s))
    onSubscriptionsChange(updated)

    if (isSupabaseConfigured) {
      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', sub.id)
      await logAdminAction('subscription_cancelled', 'subscription', sub.id, {
        userId: sub.user_id
      })
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>គ្រប់គ្រងសមាជិកភាព VIP (Premium Subscriptions)</span>
          </h2>
          <p className="text-xs text-slate-500">
            ត្រួតពិនិត្យ ផ្ដល់សិទ្ធិដោយផ្ទាល់ និងតាមដានសុពលភាពគម្រោង VIP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬ ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs admin-input"
            />
          </div>

          <button
            onClick={() => {
              setSelectedUserId(users[0]?.id || '')
              setIsGrantModalOpen(true)
            }}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>ផ្ដល់សិទ្ធិ VIP ដោយផ្ទាល់</span>
          </button>
        </div>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">អ្នកប្រើប្រាស់ (User)</th>
              <th className="py-3 px-3">គម្រោង (Plan)</th>
              <th className="py-3 px-3">ស្ថានភាព</th>
              <th className="py-3 px-3">ចាប់ផ្ដើម</th>
              <th className="py-3 px-3">ផុតកំណត់</th>
              <th className="py-3 px-3">ប្រភព/ឯកសារយោង</th>
              <th className="py-3 px-4 text-right">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubs.map((sub) => {
              const u = users.find((user) => user.id === sub.user_id)
              return (
                <tr key={sub.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{u?.display_name || 'អ្នកស្ដាប់'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{sub.user_id.slice(0, 12)}...</p>
                  </td>
                  <td className="py-3 px-3 font-bold text-purple-900 uppercase">
                    {sub.plan_id}
                  </td>
                  <td className="py-3 px-3">
                    {sub.status === 'active' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                        <CheckCircle className="w-3 h-3" /> សកម្ម
                      </span>
                    ) : sub.status === 'expired' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 flex items-center gap-1 w-max">
                        <Clock className="w-3 h-3" /> ផុតកំណត់
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-max">
                        <XCircle className="w-3 h-3" /> បោះបង់
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {formatDate(sub.starts_at)}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {sub.expires_at ? formatDate(sub.expires_at) : 'ពេញមួយជីវិត (Lifetime)'}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {sub.provider_reference || 'manual'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {sub.status === 'active' && (
                      <button
                        onClick={() => handleRevokeSubscription(sub)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200"
                      >
                        បញ្ចប់សិទ្ធិ
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* GRANT SUBSCRIPTION MODAL */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              ផ្ដល់សិទ្ធិ VIP ដោយផ្ទាល់ (Manual VIP Grant)
            </h3>

            <form onSubmit={handleGrantSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ជ្រើសរើសអ្នកប្រើប្រាស់ (User)
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name || u.id} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  កញ្ចប់សមាជិកភាព (Subscription Plan)
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                >
                  <option value="monthly">ប្រចាំខែ (Monthly - 30 ថ្ងៃ)</option>
                  <option value="yearly">ប្រចាំឆ្នាំ (Yearly - 365 ថ្ងៃ)</option>
                  <option value="lifetime_vip">ពេញមួយជីវិត (Lifetime VIP)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow"
                >
                  {isSaving ? 'កំពុងដំណើរការ...' : 'បញ្ជាក់ការផ្ដល់សិទ្ធិ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
