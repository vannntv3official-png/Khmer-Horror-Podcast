import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Story, Category } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_STORIES, MOCK_CATEGORIES } from '../data/mockStories'
import { StoryCard } from '../components/stories/StoryCard'
import { Search, Filter, SlidersHorizontal, Radio, Crown, Sparkles, RefreshCw } from 'lucide-react'

export const StoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [stories, setStories] = useState<Story[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // URL query params
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('categoryId') || 'all'
  const initialTier = searchParams.get('tier') || 'all'
  const initialSort = searchParams.get('sortBy') || 'latest'

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedTier, setSelectedTier] = useState(initialTier)
  const [sortBy, setSortBy] = useState(initialSort)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Sync state with URL params
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
    setSelectedCategory(searchParams.get('categoryId') || 'all')
    setSelectedTier(searchParams.get('tier') || 'all')
    setSortBy(searchParams.get('sortBy') || 'latest')
    setCurrentPage(1)
  }, [searchParams])

  // Fetch stories & categories
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      if (!isSupabaseConfigured) {
        setCategories(MOCK_CATEGORIES)
        setStories(MOCK_STORIES)
        setIsLoading(false)
        return
      }

      try {
        const { data: catData } = await supabase.from('categories').select('*').order('name')
        if (catData) setCategories(catData as Category[])

        const { data: storyData } = await supabase
          .from('stories')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (storyData && storyData.length > 0) {
          setStories(storyData as Story[])
        } else {
          setStories(MOCK_STORIES)
        }
      } catch (err) {
        console.error('Error fetching stories:', err)
        setStories(MOCK_STORIES)
        setCategories(MOCK_CATEGORIES)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const updateFilters = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (val === 'all' || !val) {
      newParams.delete(key)
    } else {
      newParams.set(key, val)
    }
    setSearchParams(newParams)
  }

  // Filter & Sort stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const titleMatch = story.title.toLowerCase().includes(query)
        const descMatch = story.description?.toLowerCase().includes(query)
        if (!titleMatch && !descMatch) return false
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (story.category_id !== selectedCategory) return false
      }

      // Tier filter
      if (selectedTier === 'free' && story.is_premium) return false
      if (selectedTier === 'premium' && !story.is_premium) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return b.listen_count - a.listen_count
      }
      if (sortBy === 'duration_desc') {
        return b.duration_seconds - a.duration_seconds
      }
      if (sortBy === 'duration_asc') {
        return a.duration_seconds - b.duration_seconds
      }
      // 'latest'
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [stories, searchTerm, selectedCategory, selectedTier, sortBy])

  // Pagination slice
  const totalPages = Math.ceil(filteredStories.length / pageSize) || 1
  const paginatedStories = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStories.slice(start, start + pageSize)
  }, [filteredStories, currentPage, pageSize])

  const resetFilters = () => {
    setSearchParams(new URLSearchParams())
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedTier('all')
    setSortBy('latest')
    setCurrentPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 glass-panel border border-purple-200/80 overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <Radio className="w-3.5 h-3.5" />
            <span>បណ្ណាល័យសំឡេងខ្មែរ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            បណ្ណាល័យរឿងរន្ធត់ខ្មែរទាំងអស់
          </h1>
          <p className="text-sm text-slate-600">
            ស្វែងរក និងជ្រើសរើសស្ដាប់រឿងព្រឺព្រួច អបិយជំនឿ និងដំណើរផ្សងព្រេងព្រៃជ្រៅតាមតម្រូវការរបស់អ្នក។
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-200/80 space-y-4">
        
        {/* Top Search & Sort Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើងរឿង ឬពាក្យគន្លឹះ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                updateFilters('search', e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm glass-input placeholder:text-slate-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-auto flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" /> តម្រៀប៖
            </span>
            <select
              value={sortBy}
              onChange={(e) => updateFilters('sortBy', e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl glass-input text-slate-800 cursor-pointer"
            >
              <option value="latest">ថ្មីៗបំផុត (Newest)</option>
              <option value="popular">អ្នកស្ដាប់ច្រើនបំផុត (Most Popular)</option>
              <option value="duration_desc">រយៈពេលវែងជាងគេ (Longest)</option>
              <option value="duration_asc">រយៈពេលខ្លីជាងគេ (Shortest)</option>
            </select>
          </div>

        </div>

        {/* Tier & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-purple-100">
          
          {/* Tier Buttons: All, Free, VIP */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/70">
            <button
              onClick={() => updateFilters('tier', 'all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                selectedTier === 'all'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              ទាំងអស់
            </button>
            <button
              onClick={() => updateFilters('tier', 'free')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                selectedTier === 'free'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              ឥតគិតថ្លៃ (Free)
            </button>
            <button
              onClick={() => updateFilters('tier', 'premium')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1 ${
                selectedTier === 'premium'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Crown className="w-3 h-3 fill-current" />
              VIP ផ្តាច់មុខ
            </button>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
            <button
              onClick={() => updateFilters('categoryId', 'all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'bg-white/80 text-slate-600 hover:bg-purple-50'
              }`}
            >
              គ្រប់ប្រភេទ
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilters('categoryId', cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-white/80 text-slate-600 hover:bg-purple-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Story Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-3xl p-4 glass-panel animate-pulse space-y-4 h-80">
              <div className="aspect-[16/10] bg-purple-200/50 rounded-2xl" />
              <div className="h-4 bg-purple-200/50 rounded w-3/4" />
              <div className="h-3 bg-purple-200/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : paginatedStories.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel disabled:opacity-40 hover:bg-purple-50"
              >
                ទំព័រមុន
              </button>
              <span className="px-4 py-2 text-xs font-bold text-purple-900">
                ទំព័រ {currentPage} នៃ {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel disabled:opacity-40 hover:bg-purple-50"
              >
                ទំព័របន្ទាប់
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl p-12 glass-panel text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            មិនមានរឿងដែលត្រូវនឹងការស្វែងរកទេ
          </h3>
          <p className="text-xs text-slate-500">
            សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬជម្រះតម្រងស្វែងរក។
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white flex items-center gap-1.5 mx-auto hover:bg-purple-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>សម្អាតតម្រងទាំងអស់</span>
          </button>
        </div>
      )}

    </div>
  )
}
