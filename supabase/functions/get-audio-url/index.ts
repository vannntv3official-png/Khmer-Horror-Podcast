import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase environment configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client for authenticating the requesting user
    const authHeader = req.headers.get('Authorization')
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })

    // Privileged service role client for verification & generating signed URL
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { storyId } = await req.json()
    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing storyId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch story from database
    const { data: story, error: storyError } = await adminClient
      .from('stories')
      .select('id, title, is_published, is_premium, audio_path')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return new Response(
        JSON.stringify({ allowed: false, reason: 'not_found', message: 'Story not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if story is published
    let isUserAdmin = false
    let currentUserId: string | null = null

    if (authHeader) {
      const { data: { user } } = await userClient.auth.getUser()
      if (user) {
        currentUserId = user.id
        // Check admin role
        const { data: profile } = await adminClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        isUserAdmin = profile?.role === 'admin'
      }
    }

    if (!story.is_published && !isUserAdmin) {
      return new Response(
        JSON.stringify({ allowed: false, reason: 'unpublished', message: 'This story is not yet published' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If story is premium, verify active subscription
    if (story.is_premium && !isUserAdmin) {
      if (!currentUserId) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: 'unauthenticated',
            message: 'Authentication required to access VIP horror stories'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check active subscription in subscriptions table
      const { data: subscription, error: subError } = await adminClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subError || !subscription) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: 'subscription_required',
            message: 'Active Premium membership required to listen to this VIP story'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify expiration date if not lifetime
      if (subscription.expires_at) {
        const expiryDate = new Date(subscription.expires_at).getTime()
        if (expiryDate <= Date.now()) {
          // Mark subscription as expired
          await adminClient
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', subscription.id)

          return new Response(
            JSON.stringify({
              allowed: false,
              reason: 'subscription_required',
              message: 'Your Premium membership has expired. Please renew to continue listening.'
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Story is either free or user has valid subscription/is admin
    // Generate a secure signed URL from storage bucket 'story-audio'
    // Expiration: 3600 seconds (1 hour)
    const expiresInSeconds = 3600
    const { data: signedData, error: signError } = await adminClient.storage
      .from('story-audio')
      .createSignedUrl(story.audio_path, expiresInSeconds)

    if (signError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate signed audio URL', details: signError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atomic increment listen count
    await adminClient.rpc('increment_story_listen_count', { target_story_id: story.id })

    return new Response(
      JSON.stringify({
        allowed: true,
        audioUrl: signedData.signedUrl,
        expiresIn: expiresInSeconds
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
