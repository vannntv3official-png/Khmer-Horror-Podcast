import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Story } from '@khmer-horror/shared'
import { formatDurationKhmer, toKhmerDigits } from '@khmer-horror/shared'
import { getCoverImageUrl, supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'
import { useAuth } from '../../contexts/AuthContext'
import { Play, Pause, Crown, Clock, Headphones, Heart } from 'lucide-react'

interface StoryCardProps {
  story: Story
  initialIsFavorite?: boolean
  onFavoriteToggle?: (storyId: string, isFav: boolean) => void
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  initialIsFavorite = false,
  onFavoriteToggle
}) => {
  const { playStory, currentStory, isPlaying, togglePlay } = useAudioPlayer()
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isFavLoading, setIsFavLoading] = useState(false)

  const isCurrentStory = currentStory?.id === story.id
  const isThisPlaying = isCurrentStory && isPlaying
  const coverUrl = getCoverImageUrl(story.cover_path)

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCurrentStory) {
      togglePlay()
    } else {
      playStory(story)
    }
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !isSupabaseConfigured) return

    setIsFavLoading(true)
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', story.id)
        setIsFavorite(false)
        onFavoriteToggle?.(story.id, false)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, story_id: story.id })
        setIsFavorite(true)
        onFavoriteToggle?.(story.id, true)
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err)
    } finally {
      setIsFavLoading(false)
    }
  }

  return (
    <div className="group relative rounded-3xl overflow-hidden glass-panel glass-panel-hover flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={coverUrl}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Badges: VIP / Free */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {story.is_premium ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1 border border-amber-300">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              VIP
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-emerald-700 shadow-sm border border-emerald-200">
              ឥតគិតថ្លៃ (Free)
            </span>
          )}

          {story.category && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/40 backdrop-blur-md text-purple-200 border border-purple-400/30">
              {story.category.name}
            </span>
          )}
        </div>

        {/* Favorite Button (top right) */}
        {user && (
          <button
            onClick={handleFavoriteClick}
            disabled={isFavLoading}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-rose-500 hover:bg-white/80 transition shadow-sm"
            title={isFavorite ? 'ដកចេញពីបញ្ជីចូលចិត្ត' : 'ដាក់ក្នុងបញ្ជីចូលចិត្ត'}
          >
            <Heart
              className={`w-4 h-4 transition ${
                isFavorite ? 'text-rose-500 fill-rose-500' : ''
              }`}
            />
          </button>
        )}

        {/* Play/Pause Button on Cover */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
            isThisPlaying
              ? 'bg-purple-600 text-white scale-100 shadow-purple-600/40'
              : 'bg-white/90 text-purple-950 hover:bg-purple-600 hover:text-white group-hover:scale-105'
          }`}
          title={isThisPlaying ? 'ផ្អាកសំឡេង' : 'ចាក់ស្ដាប់ឥឡូវនេះ'}
        >
          {isThisPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Story Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/stories/${story.id}`}
            className="font-bold text-base text-slate-900 group-hover:text-purple-700 transition line-clamp-2 leading-snug"
          >
            {story.title}
          </Link>

          {story.description && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {story.description}
            </p>
          )}
        </div>

        {/* Meta: Duration & Listen Count */}
        <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5 text-purple-700">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDurationKhmer(story.duration_seconds)}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Headphones className="w-3.5 h-3.5" />
            <span>{toKhmerDigits(story.listen_count)} ស្ដាប់</span>
          </div>
        </div>
      </div>
    </div>
  )
}
