import { serve } from "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

serve(async () => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Delete old notifications (90+ days)
  const { count: notifCount } = await supabase.from('notifications').delete().lt('created_at', ninetyDaysAgo)

  // Delete stale push subscriptions (30+ days unused)
  const { count: pushCount } = await supabase.from('push_subscriptions').delete().lt('last_used_at', thirtyDaysAgo)

  return new Response(JSON.stringify({ deletedNotifications: notifCount, deletedPushSubs: pushCount }))
})
