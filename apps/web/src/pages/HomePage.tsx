import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Story, Category, ListeningProgress } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_STORIES, MOCK_CATEGORIES } from '../data/mockStories'
import { StoryCard } from '../components/stories/StoryCard'
import { useAuth } from '../contexts/AuthContext'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import {
  Skull,
  Radio,
  Flame,
  Crown,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react'

export const HomePage: React.FC = () => {
  const { user } = useAuth()
  const { playStory } = useAudioPlayer()

  const [categories, setCategories] = useState<Category[]>([])
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null)
  const [latestStories, setLatestStories] = useState<Story[]>([])
  const [popularStories, setPopularStories] = useState<Story[]>([])
  const [freeStories, setFreeStories] = useState<Story[]>([])
  const [premiumStories, setPremiumStories] = useState<Story[]>([])
  const [continueStories, setContinueStories] = useState<(ListeningProgress & { story: Story })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true)
      if (!isSupabaseConfigured) {
        // Use Mock data
        setCategories(MOCK_CATEGORIES)
        setFeaturedStory(MOCK_STORIES[3] || MOCK_STORIES[0])
        setLatestStories(MOCK_STORIES.slice(0, 4))
        setPopularStories([...MOCK_STORIES].sort((a, b) => b.listen_count - a.listen_count).slice(0, 4))
        setFreeStories(MOCK_STORIES.filter(s => !s.is_premium).slice(0, 4))
        setPremiumStories(MOCK_STORIES.filter(s => s.is_premium).slice(0, 4))
        setIsLoading(false)
        return
      }

      try {
        // Fetch categories
        const { data: catData } = await supabase.from('categories').select('*').order('name')
        if (catData) setCategories(catData as Category[])

        // Fetch published stories
        const { data: storyData } = await supabase
          .from('stories')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (storyData && storyData.length > 0) {
          const stories = storyData as Story[]
          setFeaturedStory(stories.find(s => s.is_premium) || stories[0])
          setLatestStories(stories.slice(0, 4))
          
          const sortedByPopular = [...stories].sort((a, b) => b.listen_count - a.listen_count)
          setPopularStories(sortedByPopular.slice(0, 4))

          setFreeStories(stories.filter(s => !s.is_premium).slice(0, 4))
          setPremiumStories(stories.filter(s => s.is_premium).slice(0, 4))
        }

        // Fetch continue listening if user logged in
        if (user) {
          const { data: progressData } = await supabase
            .from('listening_progress')
            .select('*, story:stories(*, category:categories(*))')
            .eq('user_id', user.id)
            .eq('completed', false)
            .order('updated_at', { ascending: false })
            .limit(3)

          if (progressData) {
            setContinueStories(progressData as any)
          }
        }
      } catch (err) {
        console.error('Failed to load home page data from Supabase:', err)
        // Fallback to mock
        setCategories(MOCK_CATEGORIES)
        setFeaturedStory(MOCK_STORIES[0])
        setLatestStories(MOCK_STORIES.slice(0, 4))
        setPopularStories(MOCK_STORIES.slice(0, 4))
        setFreeStories(MOCK_STORIES.filter(s => !s.is_premium).slice(0, 4))
        setPremiumStories(MOCK_STORIES.filter(s => s.is_premium).slice(0, 4))
      } finally {
        setIsLoading(false)
      }
    }

    loadHomeData()
  }, [user])

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        {/* Ambient violet horror glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] horror-glow pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-900 text-xs sm:text-sm font-semibold shadow-sm">
                <Skull className="w-4 h-4 text-purple-700 animate-pulse" />
                <span>វេទិកាស្ដាប់រឿងព្រឺព្រួច និងអបិយជំនឿខ្មែរលេខ ១</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight">
                ស្ដាប់រឿងរន្ធត់ខ្មែរ <br />
                <span className="bg-gradient-to-r from-purple-800 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                  សំឡេងព្រឺក្បាលកម្រិត HD
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                ជ្រួតជ្រាបជាមួយរឿងរ៉ាវព្រលឹងខ្មោច អាថ៌កំបាំងព្រៃជ្រៅ និងតំណមបុរាណដែលដូនតាហាមប្រាម។ ស្ដាប់បានគ្រប់ពេលវេលា គ្រប់ទីកន្លែង ដោយឥតគិតថ្លៃ និងកញ្ចប់ VIP ផ្តាច់មុខ។
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/stories"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-900 hover:to-violet-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-600/25 flex items-center gap-2 active:scale-95 transition"
                >
                  <Headphones className="w-5 h-5" />
                  <span>ស្ដាប់រឿងទាំងអស់ឥឡូវនេះ</span>
                </Link>

                <Link
                  to="/premium"
                  className="px-6 py-3.5 rounded-2xl glass-panel glass-panel-hover text-purple-900 font-bold text-sm sm:text-base flex items-center gap-2"
                >
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <span>ជាវកញ្ចប់ VIP ($2.99)</span>
                </Link>
              </div>

              {/* Feature Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-purple-100/80 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-900">100+</div>
                  <div className="text-xs text-slate-500 font-medium">រឿងរន្ធត់ផលិតរួចរាល់</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-900">HD 320k</div>
                  <div className="text-xs text-slate-500 font-medium">គុណភាពសំឡេងច្បាស់</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">និពន្ធ និងរៀបរៀងខ្មែរ</div>
                </div>
              </div>
            </div>

            {/* Right Hero Card: Featured Story Highlight */}
            {featuredStory && (
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl p-6 glass-panel border border-purple-200/80 shadow-2xl shadow-purple-900/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-700 text-white flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      រឿងពិសេសប្រចាំសប្តាហ៍
                    </span>
                    {featuredStory.is_premium && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-amber-500 text-amber-600" /> VIP
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg group cursor-pointer" onClick={() => playStory(featuredStory)}>
                    <img
                      src={featuredStory.cover_path || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                      alt={featuredStory.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/95 text-purple-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                      {featuredStory.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {featuredStory.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-purple-100">
                    <span className="font-semibold text-purple-700">
                      {featuredStory.category?.name || 'រឿងរន្ធត់ខ្មែរ'}
                    </span>
                    <button
                      onClick={() => playStory(featuredStory)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
                    >
                      <span>ចាក់ស្ដាប់ឥឡូវនេះ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 2. CONTINUE LISTENING (For authenticated users) */}
      {continueStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-6 rounded-3xl border border-purple-200/70">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span>ស្ដាប់បន្ត (Continue Listening)</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {continueStories.map((prog) => (
                <div
                  key={prog.story_id}
                  onClick={() => playStory(prog.story, prog.position_seconds)}
                  className="p-3.5 rounded-2xl bg-white/80 hover:bg-purple-50/80 border border-purple-100 cursor-pointer transition flex items-center gap-3 shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-900 overflow-hidden shrink-0 relative">
                    <img
                      src={prog.story.cover_path || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'}
                      alt={prog.story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-purple-700">
                      {prog.story.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      នៅសល់ {Math.max(0, Math.floor((prog.story.duration_seconds - prog.position_seconds) / 60))} នាទី
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CATEGORIES CAROUSEL/GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ប្រភេទទស្សនីយភាពរឿង
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">ជ្រើសរើសស្ដាប់តាមប្រភេទដែលអ្នកចូលចិត្ត</p>
          </div>
          <Link
            to="/stories"
            className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            មើលទាំងអស់ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/stories?categoryId=${cat.id}`}
              className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between h-28 group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 group-hover:bg-purple-700 group-hover:text-white text-purple-700 flex items-center justify-center transition">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {cat.name_en || 'Khmer Horror'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR STORIES (Based on listening counts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Flame className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                រឿងពេញនិយម និងមានអ្នកស្ដាប់ច្រើនបំផុត
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                រឿងព្រឺព្រួចដែលទទួលបានការគាំទ្រខ្លាំងជាងគេ
              </p>
            </div>
          </div>
          <Link
            to="/stories?sortBy=popular"
            className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            មើលបន្ថែម <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* 5. PREMIUM HORROR COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-8 horror-banner text-white relative overflow-hidden shadow-2xl mb-8">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 horror-glow opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 inline-flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" /> កម្រងរឿង VIP ផ្តាច់មុខ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                រឿងរន្ធត់ពិសេសសម្រាប់សមាជិក VIP
              </h2>
              <p className="text-xs sm:text-sm text-purple-200">
                ដំណើររឿងវែង ព្រឺក្បាលកម្រិតខ្ពស់ គ្មានការផ្សាយពាណិជ្ជកម្ម និងសំឡេង Effects ពិសេស។
              </p>
            </div>
            <Link
              to="/premium"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition whitespace-nowrap"
            >
              ជាវកញ្ចប់ VIP ត្រឹមតែ $2.99
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* 6. FREE HORROR STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              រឿងស្ដាប់ឥតគិតថ្លៃ (Free Collection)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              រីករាយជាមួយរឿងរន្ធត់ខ្មែរដោយសេរី មិនចាំបាច់មានគណនី VIP
            </p>
          </div>
          <Link
            to="/stories?tier=free"
            className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            មើលទាំងអស់ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {freeStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* 7. MEMBERSHIP PROMOTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-purple-200/80 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 shadow-md">
            <Crown className="w-8 h-8 fill-purple-700" />
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ក្លាយជាសមាជិក VIP នៃ Khmer Horror Podcast
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              គាំទ្រផលិតកររឿងខ្មែរ និងរីករាយជាមួយរឿងព្រឺព្រួចពិសេសៗគ្មានដែនកំណត់ ជាមួយគុណភាពសំឡេងច្បាស់បំផុត។
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> ស្ដាប់បានគ្រប់រឿងទាំងអស់
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> គ្មានពាណិជ្ជកម្មរំខាន
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> រឿងថ្មីៗរៀងរាល់សប្តាហ៍
            </span>
          </div>

          <div className="pt-2">
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-xl shadow-purple-600/20 active:scale-95 transition"
            >
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>ស្វែងយល់ពីកញ្ចប់ VIP ($2.99 / ខែ)</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
