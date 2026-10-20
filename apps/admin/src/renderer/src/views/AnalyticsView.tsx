import React from 'react'
import type { Story, Category, Subscription } from '@khmer-horror/shared'
import { toKhmerDigits, formatDurationKhmer } from '@khmer-horror/shared'
import { BarChart3, TrendingUp, Headphones, Crown, Flame, PieChart } from 'lucide-react'

interface AnalyticsViewProps {
  stories: Story[]
  categories: Category[]
  subscriptions: Subscription[]
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stories,
  categories,
  subscriptions
}) => {
  const totalListens = stories.reduce((sum, s) => sum + (s.listen_count || 0), 0)
  const sortedByListens = [...stories].sort((a, b) => b.listen_count - a.listen_count)
  const topStories = sortedByListens.slice(0, 5)

  const activeVipCount = subscriptions.filter((s) => s.status === 'active').length

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-700" />
          <span>ស្ថិតិនៃការស្ដាប់ និងដំណើរការប្រព័ន្ធ (Listening Analytics)</span>
        </h2>
        <p className="text-xs text-slate-500">
          ទិន្នន័យជាក់ស្ដែងនៃការស្ដាប់រឿងរន្ធត់ខ្មែរ និងការចែកចាយទស្សនីយភាព
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="admin-card p-5 rounded-2xl space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">ចំនួនដងស្ដាប់សរុប (All-time Streams)</p>
          <p className="text-3xl font-black text-slate-900">{toKhmerDigits(totalListens)}</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ផ្អែកលើទិន្នន័យពិតនៃប្រព័ន្ធ
          </p>
        </div>

        <div className="admin-card p-5 rounded-2xl space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">សមាជិក VIP សកម្ម</p>
          <p className="text-3xl font-black text-amber-600">{toKhmerDigits(activeVipCount)}</p>
          <p className="text-xs text-slate-500">សមាជិកដែលកំពុងបង់ប្រាក់គាំទ្រ</p>
        </div>

        <div className="admin-card p-5 rounded-2xl space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">ចំនួនរឿងក្នុងប្រព័ន្ធ</p>
          <p className="text-3xl font-black text-purple-700">{toKhmerDigits(stories.length)}</p>
          <p className="text-xs text-slate-500">
            VIP: {stories.filter(s => s.is_premium).length} | Free: {stories.filter(s => !s.is_premium).length}
          </p>
        </div>
      </div>

      {/* Top 5 Most Listened Stories Table */}
      <div className="admin-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
          <Flame className="w-4 h-4 fill-rose-600" />
          <span>កំពូលរឿងទាំង ៥ ដែលមានអ្នកស្ដាប់ច្រើនបំផុត (Top Horror Stories)</span>
        </div>

        <div className="space-y-3">
          {topStories.map((story, index) => {
            const percentage = totalListens > 0 ? (story.listen_count / totalListens) * 100 : 0
            return (
              <div key={story.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span className="truncate max-w-md">{story.title}</span>
                  </span>
                  <span className="text-purple-700 font-mono">
                    {toKhmerDigits(story.listen_count)} ស្ដាប់ ({percentage.toFixed(1)}%)
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-700 to-rose-500 rounded-full"
                    style={{ width: `${Math.max(5, percentage)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="admin-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
          <PieChart className="w-4 h-4" />
          <span>ការបែងចែករឿងតាមប្រភេទទស្សនីយភាព</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = stories.filter((s) => s.category_id === cat.id).length
            const catListens = stories
              .filter((s) => s.category_id === cat.id)
              .reduce((sum, s) => sum + (s.listen_count || 0), 0)
            return (
              <div key={cat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">{cat.name}</h4>
                <p className="text-[11px] text-slate-500">{count} រឿងផលិតរួច</p>
                <p className="text-[11px] font-semibold text-purple-700">
                  {toKhmerDigits(catListens)} ដងស្ដាប់សរុប
                </p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
