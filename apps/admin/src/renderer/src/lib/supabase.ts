import { createClient } from '@supabase/supabase-js'
import type { Database, Story, Category, Profile, Subscription, AdminActivityLog } from '@khmer-horror/shared'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'khmer_horror_admin_auth'
  }
})

/**
 * Log admin action into admin_activity_logs
 */
export async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string | null = null,
  metadata: any = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!isSupabaseConfigured || !user) {
      console.log('[Mock Audit Log]', { action, targetType, targetId, metadata })
      return
    }

    await supabase.from('admin_activity_logs').insert({
      actor_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata
    })
  } catch (err) {
    console.warn('Failed to record admin activity log:', err)
  }
}

/**
 * Upload cover image to storage bucket 'story-covers'
 */
export async function uploadCoverImage(file: File, storySlug: string): Promise<string> {
  if (!isSupabaseConfigured) {
    // Return sample local object path
    return `covers/${storySlug}-${Date.now()}.webp`
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `covers/${storySlug}-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('story-covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return filePath
}

/**
 * Upload MP3 audio to storage bucket 'story-audio'
 */
export async function uploadAudioFile(
  file: File,
  storySlug: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!isSupabaseConfigured) {
    // Return mock path
    return `audio/${storySlug}-${Date.now()}.mp3`
  }

  const fileExt = file.name.split('.').pop() || 'mp3'
  const filePath = `audio/${storySlug}-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('story-audio')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return filePath
}
