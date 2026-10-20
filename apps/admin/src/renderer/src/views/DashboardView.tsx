import React from 'react'
import type { Story, Profile, Subscription, AdminActivityLog } from '@khmer-horror/shared'
import { toKhmerDigits, formatDurationKhmer, formatDate } from '@khmer-horror/shared'
import {
  BookOpen,
  CheckCircle,
  Clock,
  Users,
  Crown,
  Headphones,
  UploadCloud,
  ArrowUpRight,
  ShieldAlert,
  HardDrive
} from 'lucide-react'

interface DashboardViewProps {
  stories: Story[]
  users: Profile[]
  subscriptions: Subscription[]
  logs: AdminActivityLog[]
  onNavigateTab: (tab: any) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stories,
  users,
  subscriptions,
  logs,
  onNavigateTab
}) => {
  const publishedStories = stories.filter((s) => s.is_published)
  const draftStories = stories.filter((s) => !s.is_published)
  const premiumStories = stories.filter((s) => s.is_premium)
  const activeSubs = subscriptions.filter((s) => s.status === 'active')
  const totalListens = stories.reduce((sum, s) => sum + (s.listen_count || 0), 0)

  return (
    <div className="space-y-8 p-8">
      
      {/* 1. STATS METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Stories */}
        <div className="admin-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              រឿងសរុប (Total Stories)
            </p>
            <p className="text-3xl font-black text-slate-900">
              {toKhmerDigits(stories.length)}
            </p>
            <p className="text-[11px] text-slate-500">
              បោះពុម្ព: {toKhmerDigits(publishedStories.length)} | ព្រាង: {toKhmerDigits(draftStories.length)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Total Users */}
        <div className="admin-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              អ្នកប្រើប្រាស់ (Users)
            </p>
            <p className="text-3xl font-black text-slate-900">
              {toKhmerDigits(users.length)}
            </p>
            <p className="text-[11px] text-slate-500">
              អ្នកស្ដាប់ដែលបានចុះឈ្មោះ
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active VIP Subscriptions */}
        <div className="admin-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              សមាជិក VIP សកម្ម
            </p>
            <p className="text-3xl font-black text-slate-900">
              {toKhmerDigits(activeSubs.length)}
            </p>
            <p className="text-[11px] text-amber-700 font-semibold">
              VIP Pass Memberships
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
        </div>

        {/* Total Listens */}
        <div className="admin-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ចំនួនដងស្ដាប់សរុប
            </p>
            <p className="text-3xl font-black text-slate-900">
              {toKhmerDigits(totalListens)}
            </p>
            <p className="text-[11px] text-slate-500">
              Total Stream Plays
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Headphones className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. RECENT STORIES & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Recent Stories Table (2 cols) */}
        <div className="lg:col-span-2 admin-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              រឿងទើបបញ្ចូល និងកែសម្រួលថ្មីៗ
            </h3>
            <button
              onClick={() => onNavigateTab('stories')}
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>មើលទាំងអស់</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ចំណងជើងរឿង</th>
                  <th className="py-2.5 px-3">ប្រភេទ</th>
                  <th className="py-2.5 px-3">រយៈពេល</th>
                  <th className="py-2.5 px-3">កម្រិត</th>
                  <th className="py-2.5 px-3">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stories.slice(0, 5).map((story) => (
                  <tr key={story.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-[200px] truncate">
                      {story.title}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {story.category?.name || 'ទូទៅ'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {formatDurationKhmer(story.duration_seconds)}
                    </td>
                    <td className="py-3 px-3">
                      {story.is_premium ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          VIP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {story.is_published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> បោះពុម្ព
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Clock className="w-3 h-3" /> សេចក្តីព្រាង
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Admin Shortcuts & Activity Log Summary */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="admin-card rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              សកម្មភាពរហ័ស (Quick Actions)
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('upload')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-between shadow-md transition"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>បញ្ចូលឯកសារ MP3 ថ្មី</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('stories')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  <span>គ្រប់គ្រងរឿងទាំងអស់</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('users')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>គ្រប់គ្រងអ្នកប្រើប្រាស់</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Activity Log snippet */}
          <div className="admin-card rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-700" />
              <span>កំណត់ត្រាសកម្មភាពចុងក្រោយ</span>
            </h3>
            <div className="space-y-2.5">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="truncate">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    គោលដៅ: {log.target_type} ({log.target_id?.slice(0, 8)}...)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
