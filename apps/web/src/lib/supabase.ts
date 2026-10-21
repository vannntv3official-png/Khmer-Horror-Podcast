import { createClient } from '@supabase/supabase-js'
import type { Database } from '@khmer-horror/shared'

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
    detectSessionInUrl: true,
    storageKey: 'khmer_horror_web_auth'
  }
})

/**
 * Get public URL for cover images stored in 'story-covers'
 */
export function getCoverImageUrl(coverPath?: string | null): string {
  if (!coverPath) {
    return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  }
  if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
    return coverPath
  }
  if (!isSupabaseConfigured) {
    // Return sample aesthetic horror cover if in offline/demo mode
    return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  }
  const { data } = supabase.storage.from('story-covers').getPublicUrl(coverPath)
  return data.publicUrl
}

/**
 * Request secure audio URL (Tries Edge Function first, falls back to direct Storage)
 */
export async function fetchSignedAudioUrl(storyId: string): Promise<{
  allowed: boolean
  audioUrl?: string
  reason?: string
  message?: string
}> {
  try {
    if (!isSupabaseConfigured) {
      // In standalone demo mode, return an open audio preview stream
      return {
        allowed: true,
        audioUrl: 'https://cdn.freesound.org/previews/517/517175_10795454-lq.mp3'
      }
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const user = sessionData.session?.user

    // 1. Try Supabase Edge Function 'get-audio-url' if available
    try {
      const functionUrl = import.meta.env.VITE_EDGE_FUNCTION_URL || `${supabaseUrl}/functions/v1/get-audio-url`
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ storyId })
      })

      if (res.ok) {
        const result = await res.json()
        if (result && result.audioUrl) {
          return result
        }
      }
    } catch {
      // Proceed to direct fallback
    }

    // 2. Direct fallback from Supabase Database & Storage
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id, audio_path, is_premium')
      .eq('id', storyId)
      .maybeSingle()

    if (storyErr || !story) {
      return {
        allowed: false,
        reason: 'not_found',
        message: 'រកមិនឃើញឯកសាររឿងនេះទេ'
      }
    }

    // Check VIP requirement
    if (story.is_premium) {
      if (!user) {
        return {
          allowed: false,
          reason: 'premium_required',
          message: 'រឿងនេះតម្រូវឱ្យមានគណនី VIP សូមចូលគណនី ឬជាវកញ្ចប់'
        }
      }

      // Check active subscription via RPC
      const { data: hasSub } = await supabase.rpc('has_active_subscription', { check_user_id: user.id })
      if (!hasSub) {
        return {
          allowed: false,
          reason: 'premium_required',
          message: 'សូមជាវកញ្ចប់ VIP ដើម្បីស្ដាប់រឿងនេះ'
        }
      }
    }

    // If audio_path is already a full URL
    if (story.audio_path.startsWith('http://') || story.audio_path.startsWith('https://')) {
      return { allowed: true, audioUrl: story.audio_path }
    }

    // Create signed URL for 2 hours (7200 seconds)
    const cleanPath = story.audio_path.replace(/^story-audio\//, '')
    const { data: signedData, error: signErr } = await supabase.storage
      .from('story-audio')
      .createSignedUrl(cleanPath, 7200)

    if (signedData?.signedUrl) {
      return { allowed: true, audioUrl: signedData.signedUrl }
    }

    // Public URL fallback
    const { data: publicData } = supabase.storage.from('story-audio').getPublicUrl(cleanPath)
    if (publicData?.publicUrl) {
      return { allowed: true, audioUrl: publicData.publicUrl }
    }

    return {
      allowed: false,
      reason: 'playback_error',
      message: 'មិនអាចទាញយកសំឡេងបានទេ'
    }
  } catch (err: any) {
    console.error('Failed to fetch audio url:', err)
    return {
      allowed: false,
      reason: 'network_error',
      message: err.message || 'Unable to connect to audio service'
    }
  }
}
