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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    const {
      provider = 'aba_pay',
      provider_event_id,
      event_type,
      user_id,
      plan_id,
      amount,
      currency = 'USD',
      metadata = {}
    } = payload

    if (!provider_event_id || !event_type || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required webhook fields: provider_event_id, event_type, user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Idempotency check: check if event already processed
    const { data: existingEvent } = await adminClient
      .from('payment_events')
      .select('id')
      .eq('provider', provider)
      .eq('provider_event_id', provider_event_id)
      .maybeSingle()

    if (existingEvent) {
      return new Response(
        JSON.stringify({ status: 'already_processed', message: 'Event already handled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Record payment event
    await adminClient.from('payment_events').insert({
      provider,
      provider_event_id,
      event_type,
      user_id,
      amount,
      currency,
      metadata
    })

    // 3. Process subscription upgrade if payment succeeded
    if (event_type === 'payment.succeeded' || event_type === 'subscription.created') {
      let expiresAt: string | null = null
      const now = new Date()

      if (plan_id === 'monthly') {
        const nextMonth = new Date(now)
        nextMonth.setDate(nextMonth.getDate() + 30)
        expiresAt = nextMonth.toISOString()
      } else if (plan_id === 'yearly') {
        const nextYear = new Date(now)
        nextYear.setDate(nextYear.getDate() + 365)
        expiresAt = nextYear.toISOString()
      } else if (plan_id === 'lifetime_vip') {
        expiresAt = null
      }

      // Check if user already has an active subscription to update or insert new
      const { data: currentSub } = await adminClient
        .from('subscriptions')
        .select('id, expires_at')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .maybeSingle()

      if (currentSub && plan_id !== 'lifetime_vip' && currentSub.expires_at) {
        // Extend existing subscription
        const currentExpiry = new Date(currentSub.expires_at)
        const baseDate = currentExpiry.getTime() > now.getTime() ? currentExpiry : now
        if (plan_id === 'monthly') {
          baseDate.setDate(baseDate.getDate() + 30)
        } else if (plan_id === 'yearly') {
          baseDate.setDate(baseDate.getDate() + 365)
        }
        await adminClient
          .from('subscriptions')
          .update({
            plan_id,
            expires_at: baseDate.toISOString(),
            provider_reference: provider_event_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSub.id)
      } else {
        await adminClient.from('subscriptions').insert({
          user_id,
          plan_id: plan_id || 'monthly',
          status: 'active',
          starts_at: now.toISOString(),
          expires_at: expiresAt,
          provider_reference: provider_event_id
        })
      }

      // Record activity log
      await adminClient.from('admin_activity_logs').insert({
        actor_id: user_id,
        action: 'subscription_activated',
        target_type: 'subscription',
        target_id: user_id,
        metadata: { provider, plan_id, amount, provider_event_id }
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment webhook processed successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Webhook internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
