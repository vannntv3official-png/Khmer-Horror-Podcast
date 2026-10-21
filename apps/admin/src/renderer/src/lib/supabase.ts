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
 * Generate S3/Supabase compliant storage key (ASCII alphanumeric and hyphens only)
 * Prevents "Invalid key" errors when story titles or slugs contain Khmer Unicode
 */
function toSafeStorageKey(prefix: string, nameOrSlug: string, ext: string): string {
  const safeAscii = nameOrSlug
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

  const identifier = safeAscii ? `${safeAscii}-${Date.now()}` : `track-${Date.now()}`
  return `${prefix}/${identifier}.${ext}`
}

/**
 * Upload cover image to storage bucket 'story-covers'
 */
export async function uploadCoverImage(file: File, storySlug: string): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp'
  const filePath = toSafeStorageKey('covers', storySlug, fileExt)

  if (!isSupabaseConfigured) {
    // Return sample local object path
    return filePath
  }

  const mimeType = file.type || (fileExt === 'webp' ? 'image/webp' : fileExt === 'png' ? 'image/png' : 'image/jpeg')

  const { error } = await supabase.storage
    .from('story-covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: mimeType
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
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3'
  const filePath = toSafeStorageKey('audio', storySlug, fileExt)

  if (!isSupabaseConfigured) {
    // Return mock path
    return filePath
  }

  const mimeType = file.type || (fileExt === 'wav' ? 'audio/wav' : fileExt === 'ogg' ? 'audio/ogg' : fileExt === 'm4a' ? 'audio/x-m4a' : 'audio/mpeg')

  const { error } = await supabase.storage
    .from('story-audio')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: mimeType
    })

  if (error) throw error
  return filePath
}
