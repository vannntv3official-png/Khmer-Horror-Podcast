import React, { useState } from 'react'
import type { AdminActivityLog } from '@khmer-horror/shared'
import { formatDate } from '@khmer-horror/shared'
import { FileText, Search, ShieldAlert, Filter } from 'lucide-react'

interface LogsViewProps {
  logs: AdminActivityLog[]
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('all')

  const filteredLogs = logs.filter((log) => {
    if (targetTypeFilter !== 'all' && log.target_type !== targetTypeFilter) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchAction = log.action.toLowerCase().includes(q)
      const matchTarget = log.target_type.toLowerCase().includes(q)
      if (!matchAction && !matchTarget) return false
    }
    return true
  })

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            <span>កំណត់ត្រាសកម្មភាពគ្រប់គ្រង (Admin Activity Logs)</span>
          </h2>
          <p className="text-xs text-slate-500">
            ប្រវត្តិសវនកម្ម (Audit Trail) នៃរាល់សកម្មភាពបង្កើត កែប្រែ លុប និងផ្ដល់សិទ្ធិ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមសកម្មភាព..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs admin-input"
            />
          </div>

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs admin-input"
          >
            <option value="all">គ្រប់ប្រភេទគោលដៅ</option>
            <option value="story">Story</option>
            <option value="category">Category</option>
            <option value="user">User</option>
            <option value="subscription">Subscription</option>
            <option value="storage">Storage</option>
          </select>
        </div>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">សកម្មភាព (Action)</th>
              <th className="py-3 px-3">ប្រភេទគោលដៅ (Target)</th>
              <th className="py-3 px-3">លេខសម្គាល់គោលដៅ (Target ID)</th>
              <th className="py-3 px-3">ព័ត៌មានលម្អិត (Metadata)</th>
              <th className="py-3 px-4 text-right">ពេលវេលា</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 font-mono text-[11px] border border-purple-200">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-700 font-semibold uppercase text-[11px]">
                  {log.target_type}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                  {log.target_id || '—'}
                </td>
                <td className="py-3 px-3 text-[11px] text-slate-600 max-w-xs truncate font-mono">
                  {JSON.stringify(log.metadata)}
                </td>
                <td className="py-3 px-4 text-right text-slate-500">
                  {formatDate(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
