import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Story, ListeningProgress } from '@khmer-horror/shared'
import { formatDate, formatDurationKhmer } from '@khmer-horror/shared'
import { StoryCard } from '../components/stories/StoryCard'
import {
  User,
  Heart,
  History,
  Crown,
  Settings,
  LogOut,
  Save,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history' | 'settings'>(
    initialTab as any
  )

  const { user, profile, subscription, hasActiveSubscription, updateProfile, signOut } = useAuth()
  const { playStory } = useAudioPlayer()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [favorites, setFavorites] = useState<Story[]>([])
  const [historyList, setHistoryList] = useState<(ListeningProgress & { story: Story })[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name)
    }
  }, [profile])

  // Fetch favorites & history
  useEffect(() => {
    async function fetchUserData() {
      if (!user || !isSupabaseConfigured) {
        setDataLoading(false)
        return
      }

      setDataLoading(true)
      try {
        // Fetch favorites
        const { data: favData } = await supabase
          .from('favorites')
          .select('story:stories(*, category:categories(*))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (favData) {
          setFavorites(favData.map((f: any) => f.story).filter(Boolean))
        }

        // Fetch history
        const { data: histData } = await supabase
          .from('listening_progress')
          .select('*, story:stories(*, category:categories(*))')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (histData) {
          setHistoryList(histData as any)
        }
      } catch (err) {
        console.error('Error fetching user activity:', err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    const { error } = await updateProfile({ display_name: displayName })
    setSaveLoading(false)
    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl text-center space-y-4">
        <User className="w-12 h-12 text-purple-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">សូមចូលគណនី</h2>
        <p className="text-xs text-slate-500">
          អ្នកត្រូវតែចូលគណនីដើម្បីមើលទំព័រព័ត៌មានផ្ទាល់ខ្លួន និងរឿងចូលចិត្ត។
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-sm shadow-md"
        >
          ចូលគណនីឥឡូវនេះ
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-200/80 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-800 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-600/30">
            {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {profile?.display_name || 'អ្នកស្ដាប់រឿងខ្មែរ'}
              </h1>
              {hasActiveSubscription ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-current" /> VIP ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  Free Member
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
          </div>
        </div>

        {!hasActiveSubscription && (
          <Link
            to="/premium"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-violet-600 hover:from-purple-900 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>ដំឡើងជាសមាជិក VIP</span>
          </Link>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-purple-100">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-purple-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>ទិន្នន័យគណនី</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-purple-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>រឿងចូលចិត្ត ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-purple-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ប្រវត្តិស្ដាប់ ({historyList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:bg-purple-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ការកំណត់</span>
        </button>
      </div>

      {/* Tab 1: Profile & Membership */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>ស្ថានភាពសមាជិកភាព VIP</span>
            </h3>

            {hasActiveSubscription ? (
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">គម្រោង៖ {subscription?.plan_id?.toUpperCase() || 'VIP'}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                    សកម្ម (Active)
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  {subscription?.expires_at
                    ? `ផុតកំណត់នៅថ្ងៃទី៖ ${formatDate(subscription.expires_at)}`
                    : 'គម្រោង VIP ពេញមួយជីវិត (Lifetime Access)'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-100/80 text-slate-700">
                <p className="text-xs">
                  បច្ចុប្បន្នអ្នកជាសមាជិកឥតគិតថ្លៃ (Free Listener)។ អ្នកអាចស្ដាប់រឿង Free ទាំងអស់បានដោយសេរី។
                </p>
                <Link
                  to="/premium"
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 underline"
                >
                  មើលគម្រោង VIP ដើម្បីដោះសោរឿងរន្ធត់ទាំងអស់
                </Link>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-purple-200/80 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span>ព័ត៌មានគណនី</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-2 border-b border-purple-100">
                <span className="font-semibold">លេខសម្គាល់គណនី (User ID):</span>
                <span className="font-mono text-[11px] text-slate-400">{user.id.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between py-2 border-b border-purple-100">
                <span className="font-semibold">អ៊ីមែល៖</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-purple-100">
                <span className="font-semibold">តួនាទី (Role):</span>
                <span className="font-bold uppercase text-purple-700">{profile?.role || 'User'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">កាលបរិច្ឆេទបង្កើតគណនី៖</span>
                <span>{formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((st) => (
                <StoryCard key={st.id} story={st} initialIsFavorite={true} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">មិនទាន់មានរឿងចូលចិត្តនៅឡើយទេ</h4>
              <p className="text-xs text-slate-500">
                ចុចរូបបេះដូងលើរឿងដែលអ្នកពេញចិត្ត ដើម្បីរក្សាទុកស្ដាប់ពេលក្រោយ។
              </p>
              <Link to="/stories" className="inline-block text-xs font-bold text-purple-700 underline">
                រុករកបណ្ណាល័យរឿង
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyList.length > 0 ? (
            <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-purple-100 border border-purple-200/80">
              {historyList.map((item) => (
                <div
                  key={item.story_id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-purple-50/50 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.story?.cover_path || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                      alt={item.story?.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/stories/${item.story?.id}`}
                        className="font-bold text-sm text-slate-900 truncate hover:text-purple-700 block"
                      >
                        {item.story?.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        បានស្ដាប់ដល់៖ {formatDurationKhmer(item.position_seconds)} / {formatDurationKhmer(item.story?.duration_seconds || 0)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => item.story && playStory(item.story, item.position_seconds)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ស្ដាប់បន្ត</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">មិនទាន់មានប្រវត្តិស្ដាប់ទេ</h4>
              <p className="text-xs text-slate-500">
                នៅពេលអ្នកចាប់ផ្ដើមស្ដាប់រឿង ប្រវត្តិនិងចំណុចដែលអ្នកបានស្ដាប់នឹងបង្ហាញនៅទីនេះ។
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Settings */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-200/80 max-w-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            កែប្រែព័ត៌មានគណនី
          </h3>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span>បានរក្សាទុកព័ត៌មានដោយជោគជ័យ!</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ឈ្មោះបង្ហាញ (Display Name)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input"
              />
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold shadow-md hover:bg-purple-800 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}</span>
            </button>
          </form>

          <div className="pt-6 border-t border-purple-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">ចាកចេញពីគណនី</h4>
              <p className="text-xs text-slate-500">ចាកចេញពីឧបករណ៍នេះ</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>ចាកចេញ (Sign Out)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
