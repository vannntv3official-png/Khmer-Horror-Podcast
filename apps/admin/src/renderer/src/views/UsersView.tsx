import React, { useState } from 'react'
import type { Profile, Subscription } from '@khmer-horror/shared'
import { formatDate } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured, logAdminAction } from '../lib/supabase'
import { Users, Search, ShieldCheck, ShieldAlert, Crown, User, CheckCircle, AlertTriangle } from 'lucide-react'

interface UsersViewProps {
  users: Profile[]
  subscriptions: Subscription[]
  onUsersChange: (updatedUsers: Profile[]) => void
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  subscriptions,
  onUsersChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchName = u.display_name?.toLowerCase().includes(q)
      const matchId = u.id.toLowerCase().includes(q)
      if (!matchName && !matchId) return false
    }
    return true
  })

  // Promote / Demote Role
  const handleToggleRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const confirmMsg = `តើអ្នកប្រាកដជាចង់ប្តូរតួនាទីរបស់ «${user.display_name || user.id}» ទៅជា ${newRole.toUpperCase()} មែនទេ?`
    if (!confirm(confirmMsg)) return

    const updated = users.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u))
    onUsersChange(updated)

    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
      await logAdminAction('user_role_changed', 'user', user.id, {
        oldRole: user.role,
        newRole
      })
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <span>គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ (User Management)</span>
          </h2>
          <p className="text-xs text-slate-500">
            ពិនិត្យគណនីអ្នកស្ដាប់ សិទ្ធិ Admin និងស្ថានភាពសមាជិកភាព VIP
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

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs admin-input"
          >
            <option value="all">គ្រប់តួនាទី</option>
            <option value="admin">Administrator</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">អ្នកប្រើប្រាស់ (User)</th>
              <th className="py-3 px-3">លេខសម្គាល់ (ID)</th>
              <th className="py-3 px-3">តួនាទី (Role)</th>
              <th className="py-3 px-3">សមាជិកភាព VIP</th>
              <th className="py-3 px-3">កាលបរិច្ឆេទចុះឈ្មោះ</th>
              <th className="py-3 px-4 text-right">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const sub = subscriptions.find((s) => s.user_id === u.id && s.status === 'active')
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                        {u.display_name ? u.display_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="font-bold text-slate-900">
                        {u.display_name || 'គ្មានឈ្មោះ'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {u.id.slice(0, 12)}...
                  </td>
                  <td className="py-3 px-3">
                    {u.role === 'admin' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 flex items-center gap-1 w-max">
                        <ShieldAlert className="w-3 h-3 text-purple-700" /> ADMIN
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 w-max">
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {sub ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                        <Crown className="w-3 h-3 fill-current" /> {sub.plan_id.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Free</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition"
                    >
                      {u.role === 'admin' ? 'ដកសិទ្ធិ Admin' : 'តែងតាំងជា Admin'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
