import { serve } from "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!

serve(async (req) => {
  try {
    const body = await req.json()
    const { table, type, record, old_record } = body

    // Only process INSERT and UPDATE
    if (type !== 'INSERT' && type !== 'UPDATE') return new Response('OK')

    let notificationPayload: { userId: string; message: string; eventType: string; taskId: string | null; businessId: string } | null = null

    if (table === 'tasks') {
      const task = record
      const prevTask = old_record

      if (type === 'INSERT' && !task.is_draft) {
        // Task assigned at creation
        if (task.assigned_to) {
          notificationPayload = { userId: task.assigned_to, message: `New task #${task.task_number} assigned to you.`, eventType: 'assigned', taskId: task.id, businessId: task.business_id }
        }
      }

      if (type === 'UPDATE') {
        // Assigned
        if (prevTask?.assigned_to === null && task.assigned_to !== null) {
          notificationPayload = { userId: task.assigned_to, message: `Task #${task.task_number} has been assigned to you.`, eventType: 'assigned', taskId: task.id, businessId: task.business_id }
        }
        // Reassigned (notify new assignee)
        else if (prevTask?.assigned_to !== null && task.assigned_to !== null && prevTask?.assigned_to !== task.assigned_to) {
          notificationPayload = { userId: task.assigned_to, message: `Task #${task.task_number} has been reassigned to you.`, eventType: 'reassigned', taskId: task.id, businessId: task.business_id }
        }
        // Completed — notify owner
        else if (prevTask?.status !== 'completed' && task.status === 'completed') {
          // Get owner
          const { data: biz } = await supabase.from('businesses').select('owner_id').eq('id', task.business_id).single()
          if (biz?.owner_id) {
            notificationPayload = { userId: biz.owner_id, message: `Task #${task.task_number} has been completed.`, eventType: 'completed', taskId: task.id, businessId: task.business_id }
          }
        }
      }
    }

    if (table === 'remarks') {
      const remark = record
      if (remark.is_system) return new Response('OK')
      // Get task + owner
      const { data: task } = await supabase.from('tasks').select('task_number, business_id, assigned_to, created_by').eq('id', remark.task_id).single()
      if (!task) return new Response('OK')
      // Notify owner if remark by staff
      const { data: biz } = await supabase.from('businesses').select('owner_id').eq('id', task.business_id).single()
      if (biz?.owner_id && remark.author_id !== biz.owner_id) {
        notificationPayload = { userId: biz.owner_id, message: `Remark added on Task #${task.task_number}.`, eventType: 'remarked', taskId: remark.task_id, businessId: task.business_id }
      }
    }

    if (!notificationPayload) return new Response('OK')

    // Insert notification record
    const { data: notification } = await supabase.from('notifications').insert(notificationPayload).select().single()

    // Get push subscriptions
    const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', notificationPayload.userId).eq('is_denied', false)
    if (!subs?.length) return new Response('OK')

    // Send push to each subscription
    const pushBody = JSON.stringify({ title: 'TaskPod', body: notificationPayload.message, tag: notificationPayload.taskId || 'general', data: { url: notificationPayload.taskId ? `/${notificationPayload.taskId}` : '/' } })
    for (const sub of subs) {
      try {
        const response = await sendWebPush(sub.subscription_json, pushBody)
        if (response.status === 410 || response.status === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        } else {
          await supabase.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('id', sub.id)
        }
        if (notification) {
          await supabase.from('notifications').update({ push_sent_at: new Date().toISOString(), push_success: response.ok }).eq('id', notification.id)
        }
      } catch (err) {
        console.error('Push send error:', err)
      }
    }

    return new Response('OK')
  } catch (err) {
    console.error(err)
    return new Response('Error', { status: 500 })
  }
})

async function sendWebPush(subscription: Record<string, unknown>, payload: string): Promise<Response> {
  // Dynamic import web-push compatible implementation
  const { endpoint, keys } = subscription as { endpoint: string; keys: { auth: string; p256dh: string } }
  // Use Supabase runtime fetch with Web Push headers
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
      'Authorization': `vapid t=${await generateVapidJWT(endpoint)},k=${VAPID_PUBLIC_KEY}`,
      'Content-Encoding': 'aes128gcm',
    },
    body: payload,
  })
}

async function generateVapidJWT(endpoint: string): Promise<string> {
  const origin = new URL(endpoint).origin
  const payload = { aud: origin, exp: Math.round(Date.now() / 1000) + 12 * 3600, sub: VAPID_SUBJECT }
  // Simple JWT — in production use web-push library via npm
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${header}.${body}`
}
