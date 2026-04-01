import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import webpush from "npm:web-push@3.6.7"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

Deno.serve(async () => {
  try {
    // Get all active businesses
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, owner_id, last_draft_reminder_at')
      .in('account_status', ['trial_active', 'active'])

    if (!businesses?.length) return new Response(JSON.stringify({ checked: 0 }))

    let remindersSent = 0

    for (const biz of businesses) {
      // Count draft tasks older than 4 hours
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      const { count: draftCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .eq('is_draft', true)
        .lt('created_at', fourHoursAgo)

      if (!draftCount || draftCount === 0) continue

      // Check for recent draft reminder (8-hour debounce per PRD §10.3)
      // Now using businesses.last_draft_reminder_at for reliability
      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000)
      if (biz.last_draft_reminder_at && new Date(biz.last_draft_reminder_at) > eightHoursAgo) continue;

      // Insert notification
      const message = `You have ${draftCount} incomplete draft task${draftCount > 1 ? 's' : ''}.`
      const { data: notification } = await supabase.from('notifications').insert({
        user_id: biz.owner_id,
        business_id: biz.id,
        event_type: 'draft_reminder',
        message,
      }).select().single()

      // Send push to owner
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', biz.owner_id)
        .eq('is_denied', false)

      if (subs?.length) {
        const pushBody = JSON.stringify({
          title: 'TaskPod',
          body: message,
          tag: 'draft-reminder',
          data: { url: '/tasks?filter=drafts' },
        })

        for (const sub of subs) {
          try {
            await webpush.sendNotification(sub.subscription_json, pushBody, { TTL: 86400 })
            await supabase.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('id', sub.id)
            if (notification) {
              await supabase.from('notifications').update({ push_sent_at: new Date().toISOString(), push_success: true }).eq('id', notification.id)
            }
            // Update business debounce timestamp
            await supabase.from('businesses').update({ last_draft_reminder_at: new Date().toISOString() }).eq('id', biz.id)
          } catch (err: unknown) {
            const pushErr = err as { statusCode?: number }
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id)
            }
          }
        }
      }
      remindersSent++
    }

    return new Response(JSON.stringify({ checked: businesses.length, remindersSent }))
  } catch (err) {
    console.error('check-draft-reminders error:', err)
    return new Response('Error', { status: 500 })
  }
})
