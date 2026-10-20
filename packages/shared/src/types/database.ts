export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_en: string | null
  slug: string
  description: string | null
  created_at: string
}

export interface Story {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  cover_path: string | null
  audio_path: string
  duration_seconds: number
  is_premium: boolean
  is_published: boolean
  created_by: string | null
  listen_count: number
  created_at: string
  updated_at: string
  category?: Category | null
  profiles?: Profile | null
}

export interface Favorite {
  user_id: string
  story_id: string
  created_at: string
  story?: Story
}

export interface ListeningProgress {
  user_id: string
  story_id: string
  position_seconds: number
  completed: boolean
  updated_at: string
  story?: Story
}

export type SubscriptionPlanId = 'monthly' | 'yearly' | 'lifetime_vip'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending'

export interface Subscription {
  id: string
  user_id: string
  plan_id: SubscriptionPlanId
  status: SubscriptionStatus
  starts_at: string
  expires_at: string | null
  provider_reference: string | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface PaymentEvent {
  id: string
  provider: string
  provider_event_id: string
  event_type: string
  user_id: string | null
  amount: number | null
  currency: string
  metadata: Json
  processed_at: string
  created_at: string
}

export interface ListeningEvent {
  id: string
  user_id: string | null
  story_id: string
  event_type: 'play' | 'pause' | 'complete' | 'progress'
  position_seconds: number
  created_at: string
}

export interface AdminActivityLog {
  id: string
  actor_id: string | null
  action: string
  target_type: string
  target_id: string | null
  metadata: Json
  created_at: string
  actor?: Profile | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Category>
        Relationships: []
      }
      stories: {
        Row: Story
        Insert: Omit<Story, 'id' | 'created_at' | 'updated_at' | 'listen_count'> & {
          id?: string
          listen_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Story>
        Relationships: []
      }
      favorites: {
        Row: Favorite
        Insert: Favorite
        Update: Partial<Favorite>
        Relationships: []
      }
      listening_progress: {
        Row: ListeningProgress
        Insert: ListeningProgress
        Update: Partial<ListeningProgress>
        Relationships: []
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Subscription>
        Relationships: []
      }
      payment_events: {
        Row: PaymentEvent
        Insert: Omit<PaymentEvent, 'id' | 'created_at' | 'processed_at'> & {
          id?: string
          processed_at?: string
          created_at?: string
        }
        Update: Partial<PaymentEvent>
        Relationships: []
      }
      listening_events: {
        Row: ListeningEvent
        Insert: Omit<ListeningEvent, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<ListeningEvent>
        Relationships: []
      }
      admin_activity_logs: {
        Row: AdminActivityLog
        Insert: Omit<AdminActivityLog, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<AdminActivityLog>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      has_active_subscription: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      increment_story_listen_count: {
        Args: { target_story_id: string }
        Returns: void
      }
    }
  }
}
