import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const SUPERADMIN_USER_ID = Deno.env.get('SUPERADMIN_USER_ID')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1] || '')
  if (!user || user.id !== SUPERADMIN_USER_ID) return new Response('Forbidden', { status: 403, headers: corsHeaders })
  const body = await req.json()
  const { action, businessId, days, userId, isActive } = body
  const now = new Date().toISOString()
  let update: Record<string, unknown> = {}
  let eventType = action

  switch (action) {
    case 'activate':
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      update = { account_status: 'active', activated_at: now, activated_by: SUPERADMIN_USER_ID, trial_ends_at: oneYearFromNow.toISOString() }
      eventType = 'activated'
      break
    case 'suspend':
      update = { account_status: 'suspended', suspended_at: now }
      eventType = 'suspended'
      break
    case 'reactivate':
      update = { account_status: 'active', suspended_at: null }
      eventType = 'reactivated'
      break
    case 'extend_trial':
      const extendDays = Math.min(Math.max(days || 7, 1), 365)
      const { data: biz } = await supabase.from('businesses').select('trial_ends_at, account_status').eq('id', businessId).single()
      const base = (biz?.account_status === 'trial_active' || biz?.account_status === 'active') && biz.trial_ends_at ? new Date(biz.trial_ends_at) : new Date()
      base.setDate(base.getDate() + extendDays)
      update = { account_status: biz?.account_status === 'active' ? 'active' : 'trial_active', trial_ends_at: base.toISOString() }
      eventType = 'trial_extended'
      break
    case 'toggle_user':
      const { error: userErr } = await supabase.from('users').update({ is_active: isActive }).eq('id', userId)
      if (userErr) return new Response(JSON.stringify({ error: userErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    default:

      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const { error } = await supabase.from('businesses').update(update).eq('id', businessId)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  await supabase.from('account_events').insert({ business_id: businessId, event_type: eventType, actor_id: SUPERADMIN_USER_ID, notes: `${action} via SA panel` })

  // Get all users in this business
  const { data: bizUsers } = await supabase.from('users').select('id, role').eq('business_id', businessId)
  const ownerId = bizUsers?.find(u => u.role === 'owner')?.id
  const allUserIds = bizUsers?.map(u => u.id) || []

  // Suspension security cascade (PRD §11.2)
  if (action === 'suspend') {
    // 1. Invalidate sessions for ALL users in the business
    for (const uid of allUserIds) {
      try { await supabase.auth.admin.signOut(uid, 'global' as any) } catch (_) { /* best effort */ }
    }
    // 2. Delete all push subscriptions for the business
    for (const uid of allUserIds) {
      await supabase.from('push_subscriptions').delete().eq('user_id', uid)
    }
    // 3. Notify ALL users (owner + staff)
    for (const uid of allUserIds) {
      await supabase.from('notifications').insert({
        user_id: uid, business_id: businessId, task_id: null,
        event_type: 'account_suspended',
        message: 'Your account has been suspended. Contact support.',
      })
    }
  } else {
    // For non-suspend actions, just notify the owner
    if (ownerId) {
      const msg = action === 'activate' ? 'Your account is now active!' : action === 'reactivate' ? 'Your account has been reactivated!' : `Your trial has been extended by ${body.days || 7} days.`
      await supabase.from('notifications').insert({ user_id: ownerId, business_id: businessId, task_id: null, event_type: 'account_activated', message: msg })
    }
  }

  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
