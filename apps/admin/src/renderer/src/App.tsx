import React, { useState, useEffect } from 'react'
import type { Story, Category, Profile, Subscription, AdminActivityLog } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { Sidebar, AdminTab } from './components/Sidebar'
import { Header } from './components/Header'

// Views
import { DashboardView } from './views/DashboardView'
import { StoriesView } from './views/StoriesView'
import { UploadMp3View } from './views/UploadMp3View'
import { CategoriesView } from './views/CategoriesView'
import { UsersView } from './views/UsersView'
import { SubscriptionsView } from './views/SubscriptionsView'
import { AnalyticsView } from './views/AnalyticsView'
import { StorageView } from './views/StorageView'
import { LogsView } from './views/LogsView'
import { SettingsView } from './views/SettingsView'

// Initial fallback mock data for testing standalone
const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'ព្រលឹងវិញ្ញាណ', name_en: 'Spirits & Ghosts', slug: 'spirits-and-ghosts', description: 'រឿងរ៉ាវខ្មោចព្រលឹង', created_at: new Date().toISOString() },
  { id: 'c2', name: 'ព្រៃអាថ៌កំបាំង', name_en: 'Mysterious Forest', slug: 'mysterious-forest', description: 'ដំណើរផ្សងព្រេងព្រៃជ្រៅ', created_at: new Date().toISOString() },
  { id: 'c3', name: 'អបិយជំនឿបុរាណ', name_en: 'Khmer Folklore', slug: 'khmer-folklore', description: 'តំណមដូនតា', created_at: new Date().toISOString() },
  { id: 'c4', name: 'ឃាតកម្មអាថ៌កំបាំង', name_en: 'Horror Crimes', slug: 'horror-crimes', description: 'ឃាតកម្មព្រឺព្រួច', created_at: new Date().toISOString() },
  { id: 'c5', name: 'ផ្ទះខ្មោចលង', name_en: 'Haunted Houses', slug: 'haunted-houses', description: 'ភូមិគ្រឹះខ្មោចលង', created_at: new Date().toISOString() }
]

const INITIAL_STORIES: Story[] = [
  {
    id: 's1',
    title: 'សំឡេងយំក្រោយផ្ទះបាយកណ្តាលអធ្រាត្រ',
    slug: 'crying-behind-kitchen-midnight',
    description: 'នៅពេលម៉ោង ២ យប់ ក្នុងភូមិស្ងាត់ជ្រងំ សំឡេងកូនក្មេងយំអណ្តែតអណ្តូងពីក្រោយផ្ទះ...',
    category_id: 'c1',
    cover_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    audio_path: 'audio/sample-story-1.mp3',
    duration_seconds: 1380,
    is_premium: false,
    is_published: true,
    created_by: null,
    listen_count: 4820,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's2',
    title: 'ផ្លូវកាត់ព្រៃលិចទឹកកំពង់ធំ',
    slug: 'kampong-thom-swamp-shortcut',
    description: 'អ្នកបើកបរឡានឈ្នួលម្នាក់បានសម្រេចចិត្តកាត់ផ្លូវព្រៃលិចទឹកដើម្បីឆាប់ដល់ផ្ទះ...',
    category_id: 'c2',
    cover_path: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=400&q=80',
    audio_path: 'audio/sample-story-2.mp3',
    duration_seconds: 1920,
    is_premium: false,
    is_published: true,
    created_by: null,
    listen_count: 6290,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's3',
    title: 'បន្ទប់ជួលលេខ ៤០៤ ផ្លូវកម្ពុជាក្រោម [VIP]',
    slug: 'rented-room-404-kampuchea-krom-vip',
    description: 'បន្ទប់ជួលតម្លៃថោកមិនគួរឱ្យជឿកណ្តាលរាជធានីភ្នំពេញ...',
    category_id: 'c5',
    cover_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    audio_path: 'audio/sample-vip-1.mp3',
    duration_seconds: 2540,
    is_premium: true,
    is_published: true,
    created_by: null,
    listen_count: 12400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's4',
    title: 'សេចក្តីព្រាង៖ រឿងព្រឺព្រួចនៅទំនប់ទឹកចាស់',
    slug: 'draft-dam-horror',
    description: 'កំពុងកាត់តសំឡេង...',
    category_id: 'c2',
    cover_path: null,
    audio_path: 'audio/draft.mp3',
    duration_seconds: 900,
    is_premium: false,
    is_published: false, // DRAFT
    created_by: null,
    listen_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const INITIAL_USERS: Profile[] = [
  { id: 'u1', display_name: 'អ្នកគ្រប់គ្រង Khmer Horror', avatar_url: null, role: 'admin', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', display_name: 'សុខា កំពង់ចាម', avatar_url: null, role: 'user', created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-05T00:00:00Z' },
  { id: 'u3', display_name: 'ចាន់ថា ភ្នំពេញ', avatar_url: null, role: 'user', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
  { id: 'u4', display_name: 'វឌ្ឍនា បាត់ដំបង', avatar_url: null, role: 'user', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' }
]

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub1', user_id: 'u2', plan_id: 'monthly', status: 'active', starts_at: '2026-01-05T00:00:00Z', expires_at: '2026-11-05T00:00:00Z', provider_reference: 'aba_khqr_123', created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-05T00:00:00Z' },
  { id: 'sub2', user_id: 'u3', plan_id: 'yearly', status: 'active', starts_at: '2026-01-10T00:00:00Z', expires_at: '2027-01-10T00:00:00Z', provider_reference: 'aba_khqr_456', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' }
]

const INITIAL_LOGS: AdminActivityLog[] = [
  { id: 'l1', actor_id: 'u1', action: 'story_published', target_type: 'story', target_id: 's3', metadata: { title: 'បន្ទប់ជួលលេខ ៤០៤' }, created_at: '2026-01-20T10:00:00Z' },
  { id: 'l2', actor_id: 'u1', action: 'manual_subscription_granted', target_type: 'subscription', target_id: 'u2', metadata: { plan: 'monthly' }, created_at: '2026-01-05T08:30:00Z' }
]

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard')
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES)
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)
  const [users, setUsers] = useState<Profile[]>(INITIAL_USERS)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS)
  const [logs, setLogs] = useState<AdminActivityLog[]>(INITIAL_LOGS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch real data from Supabase if configured
  const loadData = async () => {
    if (!isSupabaseConfigured) return
    setIsRefreshing(true)
    try {
      const [storyRes, catRes, userRes, subRes, logRes] = await Promise.all([
        supabase.from('stories').select('*, category:categories(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ])

      if (storyRes.data && storyRes.data.length > 0) setStories(storyRes.data as Story[])
      if (catRes.data && catRes.data.length > 0) setCategories(catRes.data as Category[])
      if (userRes.data && userRes.data.length > 0) setUsers(userRes.data as Profile[])
      if (subRes.data && subRes.data.length > 0) setSubscriptions(subRes.data as Subscription[])
      if (logRes.data && logRes.data.length > 0) setLogs(logRes.data as AdminActivityLog[])
    } catch (err) {
      console.error('Failed to load data from Supabase:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      
      {/* 1. Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSignOut={() => alert('Sign out')}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          currentTab={currentTab}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              stories={stories}
              users={users}
              subscriptions={subscriptions}
              logs={logs}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'stories' && (
            <StoriesView
              stories={stories}
              categories={categories}
              onStoriesChange={setStories}
            />
          )}

          {currentTab === 'upload' && (
            <UploadMp3View
              categories={categories}
              onStoryUploaded={(newStory) => {
                setStories((prev) => [newStory, ...prev])
                setCurrentTab('stories')
              }}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              stories={stories}
              onCategoriesChange={setCategories}
            />
          )}

          {currentTab === 'users' && (
            <UsersView
              users={users}
              subscriptions={subscriptions}
              onUsersChange={setUsers}
            />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              users={users}
              onSubscriptionsChange={setSubscriptions}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              stories={stories}
              categories={categories}
              subscriptions={subscriptions}
            />
          )}

          {currentTab === 'storage' && (
            <StorageView stories={stories} />
          )}

          {currentTab === 'logs' && (
            <LogsView logs={logs} />
          )}

          {currentTab === 'settings' && (
            <SettingsView onSignOut={() => alert('Sign out')} />
          )}
        </main>
      </div>

    </div>
  )
}

export default App
