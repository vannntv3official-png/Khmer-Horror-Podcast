import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate caller
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if caller is admin
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin privilege required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action, targetUserId, newRole, planId, durationDays, note } = body

    if (action === 'set_role') {
      if (!targetUserId || !newRole) {
        return new Response(
          JSON.stringify({ error: 'targetUserId and newRole are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      await adminClient.from('profiles').update({ role: newRole }).eq('id', targetUserId)

      // Log activity
      await adminClient.from('admin_activity_logs').insert({
        actor_id: user.id,
        action: 'user_role_updated',
        target_type: 'user',
        target_id: targetUserId,
        metadata: { newRole, note }
      })

      return new Response(
        JSON.stringify({ success: true, message: `User role updated to ${newRole}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'grant_subscription') {
      if (!targetUserId || !planId) {
        return new Response(
          JSON.stringify({ error: 'targetUserId and planId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let expiresAt: string | null = null
      if (planId !== 'lifetime_vip') {
        const days = durationDays || (planId === 'yearly' ? 365 : 30)
        const exp = new Date()
        exp.setDate(exp.getDate() + days)
        expiresAt = exp.toISOString()
      }

      await adminClient.from('subscriptions').insert({
        user_id: targetUserId,
        plan_id: planId,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt,
        provider_reference: `manual_admin_${user.id.slice(0, 8)}`
      })

      // Log activity
      await adminClient.from('admin_activity_logs').insert({
        actor_id: user.id,
        action: 'manual_subscription_granted',
        target_type: 'subscription',
        target_id: targetUserId,
        metadata: { planId, expiresAt, note }
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription successfully granted' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'revoke_subscription') {
      const { subscriptionId } = body
      if (!subscriptionId) {
        return new Response(
          JSON.stringify({ error: 'subscriptionId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await adminClient
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

      await adminClient.from('admin_activity_logs').insert({
        actor_id: user.id,
        action: 'subscription_cancelled',
        target_type: 'subscription',
        target_id: subscriptionId,
        metadata: { note }
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription cancelled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
