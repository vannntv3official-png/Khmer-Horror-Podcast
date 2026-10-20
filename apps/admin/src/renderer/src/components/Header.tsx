import React from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { AdminTab } from './Sidebar'
import { Database, ShieldCheck, Bell, ExternalLink, RefreshCw } from 'lucide-react'

interface HeaderProps {
  currentTab: AdminTab
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onRefresh, isRefreshing }) => {
  const titles: Record<AdminTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'ផ្ទាំងគ្រប់គ្រងទូទៅ (Dashboard)', subtitle: 'ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ ស្ថិតិរឿង និងសមាជិកភាព' },
    stories: { title: 'គ្រប់គ្រងរឿង (Stories)', subtitle: 'បង្កើត កែសម្រួល បោះពុម្ព និងលុបរឿងរន្ធត់ខ្មែរ' },
    upload: { title: 'បញ្ចូលឯកសារ MP3 (Upload Center)', subtitle: 'Upload សំឡេងរឿងថ្មីៗ ពិនិត្យរយៈពេល និងកំណត់រូបភាពគម្រប' },
    categories: { title: 'ប្រភេទទស្សនីយភាព (Categories)', subtitle: 'គ្រប់គ្រងប្រភេទនៃរឿងរន្ធត់ និងអបិយជំនឿ' },
    users: { title: 'គ្រប់គ្រងអ្នកប្រើប្រាស់ (Users)', subtitle: 'បញ្ជីឈ្មោះអ្នកស្ដាប់ និងការកំណត់សិទ្ធិ Admin' },
    subscriptions: { title: 'សមាជិកភាព VIP (Subscriptions)', subtitle: 'គ្រប់គ្រងការជាវកញ្ចប់ VIP និងការកំណត់ដោយផ្ទាល់' },
    analytics: { title: 'ស្ថិតិនៃការស្ដាប់ (Listening Analytics)', subtitle: 'ចំនួនអ្នកស្ដាប់ និងរឿងដែលពេញនិយមបំផុត' },
    storage: { title: 'គ្រប់គ្រង Storage (Buckets)', subtitle: 'ពិនិត្យឯកសារក្នុង story-audio និង story-covers' },
    logs: { title: 'កំណត់ត្រាសកម្មភាព (Activity Logs)', subtitle: 'ប្រវត្តិនៃការកែប្រែទិន្នន័យដោយ Admin' },
    settings: { title: 'ការកំណត់ប្រព័ន្ធ (Settings)', subtitle: 'ព័ត៌មានប្រព័ន្ធ និងស្ថានភាពតភ្ជាប់ Supabase' }
  }

  const currentInfo = titles[currentTab]

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between select-none shrink-0">
      <div>
        <h2 className="text-lg font-black text-slate-900">{currentInfo.title}</h2>
        <p className="text-xs text-slate-500">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200">
          <Database className="w-3.5 h-3.5 text-purple-600" />
          <span>Supabase:</span>
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Standalone Demo
            </span>
          )}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition"
            title="ទាញយកទិន្នន័យឡើងវិញ (Refresh)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-700' : ''}`} />
          </button>
        )}
      </div>
    </header>
  )
}
