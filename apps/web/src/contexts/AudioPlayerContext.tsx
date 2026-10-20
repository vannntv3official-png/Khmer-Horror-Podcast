import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type { Story, AudioTrack } from '@khmer-horror/shared'
import { fetchSignedAudioUrl, supabase, isSupabaseConfigured, getCoverImageUrl } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null
  currentStory: Story | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isMuted: boolean
  isLoading: boolean
  error: string | null
  playStory: (story: Story, initialTime?: number) => Promise<void>
  togglePlay: () => void
  pause: () => void
  resume: () => void
  seek: (seconds: number) => void
  setVolume: (val: number) => void
  setPlaybackRate: (rate: number) => void
  toggleMute: () => void
  skip: (seconds: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolumeState] = useState<number>(1)
  const [playbackRate, setPlaybackRateState] = useState<number>(1)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Progress save throttle ref
  const lastProgressSaveRef = useRef<number>(0)

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      
      // Save listening progress every 5 seconds if authenticated
      const now = Date.now()
      if (user && currentStory && now - lastProgressSaveRef.current > 5000 && isSupabaseConfigured) {
        lastProgressSaveRef.current = now
        const isCompleted = audio.duration > 0 && (audio.currentTime / audio.duration > 0.95)
        supabase
          .from('listening_progress')
          .upsert({
            user_id: user.id,
            story_id: currentStory.id,
            position_seconds: Math.floor(audio.currentTime),
            completed: isCompleted,
            updated_at: new Date().toISOString()
          })
          .then()
      }
    }

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setIsLoading(false)
    }

    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => {
      setIsLoading(false)
      setIsPlaying(true)
    }
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      // Log complete event
      if (currentStory && isSupabaseConfigured) {
        supabase.from('listening_events').insert({
          user_id: user?.id ?? null,
          story_id: currentStory.id,
          event_type: 'complete',
          position_seconds: Math.floor(audio.currentTime)
        }).then()
      }
    }
    const onError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      setError('មិនអាចចាក់សំឡេងបានទេ។ សូមព្យាយាមម្តងទៀត។ (Audio playback error)')
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
    }
  }, [user, currentStory])

  // Play a story
  const playStory = useCallback(async (story: Story, initialTime: number = 0) => {
    if (!audioRef.current) return
    setIsLoading(true)
    setError(null)
    setCurrentStory(story)

    try {
      const accessRes = await fetchSignedAudioUrl(story.id)
      if (!accessRes.allowed || !accessRes.audioUrl) {
        setIsLoading(false)
        if (accessRes.reason === 'subscription_required') {
          setError('រឿងនេះសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ។ សូមជាវគម្រោង Premium ដើម្បីស្ដាប់។')
        } else if (accessRes.reason === 'unauthenticated') {
          setError('សូមចូលគណនីរបស់អ្នកដើម្បីស្ដាប់រឿង VIP នេះ។')
        } else {
          setError(accessRes.message || 'មិនអាចបើកសំឡេងរឿងនេះបានទេ')
        }
        return
      }

      const track: AudioTrack = {
        id: story.id,
        title: story.title,
        slug: story.slug,
        categoryName: story.category?.name,
        coverUrl: getCoverImageUrl(story.cover_path),
        audioUrl: accessRes.audioUrl,
        durationSeconds: story.duration_seconds,
        isPremium: story.is_premium,
        isPublished: story.is_published
      }
      setCurrentTrack(track)

      const audio = audioRef.current
      audio.src = accessRes.audioUrl
      audio.load()

      if (initialTime > 0) {
        audio.currentTime = initialTime
      }

      await audio.play()
      setIsPlaying(true)

      // Record play event
      if (isSupabaseConfigured) {
        supabase.from('listening_events').insert({
          user_id: user?.id ?? null,
          story_id: story.id,
          event_type: 'play',
          position_seconds: Math.floor(initialTime)
        }).then()
      }
    } catch (err: any) {
      console.error('Error starting audio playback:', err)
      setError(err.message || 'Error loading audio')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(e => {
        console.error('Failed to resume audio:', e)
        setError('Failed to resume audio')
      })
    }
  }, [isPlaying, currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause()
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current) audioRef.current.play().catch(console.error)
  }, [])

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, audioRef.current.duration || seconds))
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolumeState(clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped
      setIsMuted(clamped === 0)
    }
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    const newMuted = !isMuted
    setIsMuted(newMuted)
    audioRef.current.muted = newMuted
  }, [isMuted])

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds
      audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration || newTime))
    }
  }, [])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        currentStory,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        isMuted,
        isLoading,
        error,
        playStory,
        togglePlay,
        pause,
        resume,
        seek,
        setVolume,
        setPlaybackRate,
        toggleMute,
        skip
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}
