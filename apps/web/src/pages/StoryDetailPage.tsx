import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Story } from '@khmer-horror/shared'
import { formatDurationKhmer, toKhmerDigits, formatDate } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured, getCoverImageUrl } from '../lib/supabase'
import { MOCK_STORIES } from '../data/mockStories'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import { useAuth } from '../contexts/AuthContext'
import { StoryCard } from '../components/stories/StoryCard'
import {
  Play,
  Pause,
  Crown,
  Clock,
  Headphones,
  Heart,
  Share2,
  Calendar,
  Lock,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles
} from 'lucide-react'

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, hasActiveSubscription } = useAuth()
  const {
    currentStory,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    isLoading: isAudioLoading,
    playStory,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
    skip
  } = useAudioPlayer()

  const [story, setStory] = useState<Story | null>(null)
  const [relatedStories, setRelatedStories] = useState<Story[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)

  // Fetch story details
  useEffect(() => {
    async function loadStory() {
      setIsLoading(true)
      if (!isSupabaseConfigured) {
        const found = MOCK_STORIES.find((s) => s.id === id || s.slug === id) || MOCK_STORIES[0]
        setStory(found)
        setRelatedStories(MOCK_STORIES.filter((s) => s.id !== found.id && s.category_id === found.category_id).slice(0, 3))
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*, category:categories(*)')
          .or(`id.eq.${id},slug.eq.${id}`)
          .single()

        if (error || !data) {
          const fallback = MOCK_STORIES.find((s) => s.id === id || s.slug === id) || MOCK_STORIES[0]
          setStory(fallback)
        } else {
          setStory(data as Story)

          // Fetch related stories in the same category
          if (data.category_id) {
            const { data: related } = await supabase
              .from('stories')
              .select('*, category:categories(*)')
              .eq('category_id', data.category_id)
              .neq('id', data.id)
              .eq('is_published', true)
              .limit(3)
            if (related) setRelatedStories(related as Story[])
          }
        }

        // Check if favorite
        if (user && data) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('story_id', data.id)
            .maybeSingle()
          setIsFavorite(Boolean(fav))
        }
      } catch (err) {
        console.error('Error loading story details:', err)
        const fallback = MOCK_STORIES[0]
        setStory(fallback)
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [id, user])

  const isThisStoryActive = currentStory?.id === story?.id
  const isPlayingThis = isThisStoryActive && isPlaying

  const isLocked = story?.is_premium && !hasActiveSubscription

  const handlePlayToggle = () => {
    if (!story) return
    if (isThisStoryActive) {
      togglePlay()
    } else {
      playStory(story)
    }
  }

  const handleFavoriteToggle = async () => {
    if (!user || !story || !isSupabaseConfigured) return
    try {
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('story_id', story.id)
        setIsFavorite(false)
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, story_id: story.id })
        setIsFavorite(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (isLoading || !story) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm text-slate-500">កំពុងទាញយកព័ត៌មានរឿង...</p>
      </div>
    )
  }

  const coverUrl = getCoverImageUrl(story.cover_path)
  const currentDuration = isThisStoryActive && duration > 0 ? duration : story.duration_seconds
  const progressPercent = currentDuration > 0 ? (currentTime / currentDuration) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. HERO PLAYER CARD */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-purple-200/80 shadow-2xl p-6 sm:p-10">
        
        {/* Background Blurred Glow */}
        <div
          className="absolute inset-0 opacity-15 filter blur-3xl pointer-events-none scale-125"
          style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover' }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Cover Image */}
          <div className="md:col-span-5 aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/50 relative group bg-slate-950">
            <img
              src={coverUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {story.is_premium && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-lg flex items-center gap-1.5 border border-amber-200">
                <Crown className="w-4 h-4 fill-current" />
                VIP STORY
              </div>
            )}
          </div>

          {/* Player & Story Details */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              {story.category && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  {story.category.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                {formatDurationKhmer(story.duration_seconds)}
              </span>
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-purple-600" />
                {toKhmerDigits(story.listen_count)} ស្ដាប់
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                {formatDate(story.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
              {story.title}
            </h1>

            {/* Locked Premium Banner OR Full Dedicated Audio Player */}
            {isLocked ? (
              <div className="p-6 rounded-2xl horror-banner text-white space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-amber-300">
                      រឿងនេះសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ
                    </h3>
                    <p className="text-xs text-purple-200">
                      ដើម្បីស្ដាប់រឿងនេះ និងរឿងរន្ធត់ផ្តាច់មុខដទៃទៀត សូមជាវគម្រោង VIP Pass។
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    to="/premium"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>ជាវកញ្ចប់ VIP ($2.99 / ខែ)</span>
                  </Link>
                  {!user && (
                    <Link
                      to="/login"
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
                    >
                      ចូលគណនីរបស់អ្នក
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Audio Player Controls Box */
              <div className="p-5 rounded-2xl bg-white/80 border border-purple-200/80 shadow-md space-y-4">
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="relative flex items-center group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={isThisStoryActive ? progressPercent : 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        seek((val / 100) * currentDuration)
                      }}
                      className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-700"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold tabular-nums">
                    <span>{isThisStoryActive ? formatDurationKhmer(currentTime) : '00:00'}</span>
                    <span>{formatDurationKhmer(currentDuration)}</span>
                  </div>
                </div>

                {/* Player Buttons */}
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Skip buttons & Big Play/Pause */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => skip(-10)}
                      className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-100/60 rounded-full transition"
                      title="ថយ ១០ វិនាទី"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handlePlayToggle}
                      disabled={isAudioLoading}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-800 to-violet-600 hover:from-purple-900 hover:to-violet-700 text-white flex items-center justify-center shadow-xl shadow-purple-600/30 active:scale-95 transition"
                    >
                      {isAudioLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isPlayingThis ? (
                        <Pause className="w-6 h-6 fill-white" />
                      ) : (
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => skip(10)}
                      className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-100/60 rounded-full transition"
                      title="ទៅមុខ ១០ វិនាទី"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Speed and Volume */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const speeds = [0.8, 1, 1.25, 1.5, 2]
                        const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
                        setPlaybackRate(speeds[nextIdx])
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                    >
                      {playbackRate}x
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-2 text-slate-600 hover:text-purple-700 rounded-full transition"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* Actions: Favorite & Share */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleFavoriteToggle}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white/80 border-purple-200 text-slate-700 hover:bg-purple-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorite ? 'បានដាក់ក្នុងបញ្ជីចូលចិត្ត' : 'ចូលចិត្ត (Favorite)'}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/80 border border-purple-200 text-slate-700 hover:bg-purple-50 transition flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'បានចម្លងតំណភ្ជាប់!' : 'ចែករំលែក (Share)'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 2. STORY DESCRIPTION */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-200/80 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-700" />
          <span>ដំណើររឿងសង្ខេប</span>
        </h2>
        <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line">
          {story.description || 'មិនទាន់មានការពិពណ៌នាបន្ថែមសម្រាប់រឿងនេះនៅឡើយទេ។'}
        </p>
      </div>

      {/* 3. RELATED STORIES */}
      {relatedStories.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            រឿងស្រដៀងគ្នាក្នុងប្រភេទ «{story.category?.name || 'រឿងរន្ធត់'}»
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStories.map((rel) => (
              <StoryCard key={rel.id} story={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
