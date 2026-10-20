export * from './database'

export interface AudioTrack {
  id: string
  title: string
  slug: string
  categoryName?: string
  coverUrl?: string
  audioUrl?: string
  durationSeconds: number
  isPremium: boolean
  isPublished: boolean
}

export interface PlaybackState {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isMuted: boolean
  isLoading: boolean
  error: string | null
}

export interface AudioAccessResponse {
  allowed: boolean
  audioUrl?: string
  reason?: 'unauthenticated' | 'subscription_required' | 'not_found' | 'unpublished'
  expiresIn?: number
}

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly' | 'lifetime_vip'
  nameKm: string
  nameEn: string
  priceUsd: number
  billingInterval: 'month' | 'year' | 'lifetime'
  descriptionKm: string
  descriptionEn: string
  featuresKm: string[]
  featuresEn: string[]
  isPopular?: boolean
  badgeKm?: string
}

export interface StoryFilterOptions {
  search?: string
  categoryId?: string
  tier?: 'all' | 'free' | 'premium'
  sortBy?: 'latest' | 'popular' | 'duration_asc' | 'duration_desc'
  page?: number
  pageSize?: number
}
