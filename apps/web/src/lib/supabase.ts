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
 * Request secure signed audio URL from Supabase Edge Function
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

    // Call Supabase Edge Function 'get-audio-url'
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

    const result = await res.json()
    return result
  } catch (err: any) {
    console.error('Failed to fetch signed audio url:', err)
    return {
      allowed: false,
      reason: 'network_error',
      message: err.message || 'Unable to connect to audio service'
    }
  }
}
