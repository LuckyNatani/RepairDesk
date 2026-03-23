import { serve } from "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

serve(async () => {
  const now = new Date()
  // Find trial_active businesses with expired trial
  const { data: expired } = await supabase.from('businesses').select('id, owner_id').eq('account_status', 'trial_active').lt('trial_ends_at', now.toISOString())

  for (const biz of expired || []) {
    await supabase.from('businesses').update({ account_status: 'trial_expired' }).eq('id', biz.id)
    await supabase.from('account_events').insert({ business_id: biz.id, event_type: 'trial_expired', actor_id: biz.owner_id, note: 'Trial expired automatically' })
    if (biz.owner_id) {
      await supabase.from('notifications').insert({ user_id: biz.owner_id, business_id: biz.id, task_id: null, event_type: 'account_suspended', message: 'Your trial has expired. Contact TaskPod to activate.' })
    }
  }

  return new Response(JSON.stringify({ processed: expired?.length || 0 }))
})
