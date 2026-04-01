import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import webpush from "npm:web-push@3.6.7"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const { table, type, record, old_record } = body

    if (type !== 'INSERT' && type !== 'UPDATE') return new Response('OK')

    let notificationPayload: {
      userId: string
      message: string
      eventType: string
      taskId: string | null
      businessId: string
    } | null = null

    // Secondary notification for reassignment (notify OLD assignee)
    let secondaryPayload: typeof notificationPayload = null

    if (table === 'tasks') {
      const task = record
      const prevTask = old_record

      if (type === 'INSERT' && !task.is_draft) {
        if (task.assigned_to) {
          notificationPayload = {
            userId: task.assigned_to,
            message: `Task #${task.task_number} assigned to you.`,
            eventType: 'assigned',
            taskId: task.id,
            businessId: task.business_id,
          }
        }
      }

      if (type === 'UPDATE') {
        // First assignment
        if (!prevTask?.assigned_to && task.assigned_to) {
          notificationPayload = {
            userId: task.assigned_to,
            message: `Task #${task.task_number} has been assigned to you.`,
            eventType: 'assigned',
            taskId: task.id,
            businessId: task.business_id,
          }
        }
        // Reassignment — notify BOTH old and new (PRD §10.1)
        else if (prevTask?.assigned_to && task.assigned_to && prevTask.assigned_to !== task.assigned_to) {
          notificationPayload = {
            userId: task.assigned_to,
            message: `Task #${task.task_number} has been assigned to you.`,
            eventType: 'assigned',
            taskId: task.id,
            businessId: task.business_id,
          }
          secondaryPayload = {
            userId: prevTask.assigned_to,
            message: `Task #${task.task_number} has been reassigned to another staff member.`,
            eventType: 'reassigned',
            taskId: task.id,
            businessId: task.business_id,
          }
        }
        // Completed — notify owner
        else if (prevTask?.status !== 'completed' && task.status === 'completed') {
          const { data: biz } = await supabase.from('businesses').select('owner_id').eq('id', task.business_id).single()
          if (biz?.owner_id) {
            notificationPayload = {
              userId: biz.owner_id,
              message: `Task #${task.task_number} has been completed.`,
              eventType: 'completed',
              taskId: task.id,
              businessId: task.business_id,
            }
          }
        }
      }
    }

    if (table === 'remarks') {
      const remark = record
      if (remark.is_system) return new Response('OK')

      const { data: task } = await supabase
        .from('tasks')
        .select('task_number, business_id, assigned_to, created_by')
        .eq('id', remark.task_id)
        .single()
      if (!task) return new Response('OK')

      const { data: biz } = await supabase.from('businesses').select('owner_id').eq('id', task.business_id).single()
      if (biz?.owner_id && remark.author_id !== biz.owner_id) {
        // ── Debounce check (PRD §10.2): max 1 push per task per 10 min ──
        const { data: recentPush } = await supabase
          .from('notifications')
          .select('id')
          .eq('task_id', remark.task_id)
          .eq('event_type', 'remarked')
          .not('push_sent_at', 'is', null)
          .gte('push_sent_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
          .limit(1)

        if (recentPush && recentPush.length > 0) {
          // Debounced — insert in-app only notification (no push)
          await supabase.from('notifications').insert({
            user_id: biz.owner_id,
            business_id: task.business_id,
            task_id: remark.task_id,
            event_type: 'remarked',
            message: `Remark added on Task #${task.task_number}.`,
            push_sent_at: null,
            push_success: null,
          })
          return new Response('OK — debounced')
        }

        notificationPayload = {
          userId: biz.owner_id,
          message: `Remark added on Task #${task.task_number}.`,
          eventType: 'remarked',
          taskId: remark.task_id,
          businessId: task.business_id,
        }
      }
    }

    // Process primary notification
    if (notificationPayload) {
      await processNotification(notificationPayload)
    }
    // Process secondary (reassignment to old assignee)
    if (secondaryPayload) {
      await processNotification(secondaryPayload)
    }

    return new Response('OK')
  } catch (err) {
    console.error('Push notification error:', err)
    return new Response('Error', { status: 500 })
  }
})

async function processNotification(payload: {
  userId: string; message: string; eventType: string; taskId: string | null; businessId: string
}) {
  // Insert notification record
  const { data: notification } = await supabase.from('notifications').insert({
    user_id: payload.userId,
    business_id: payload.businessId,
    task_id: payload.taskId,
    event_type: payload.eventType,
    message: payload.message,
  }).select().single()

  // Get push subscriptions
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', payload.userId)
    .eq('is_denied', false)
  if (!subs?.length) return

  // PII-redacted push body (PRD §10 — no customer info in push)
  const pushBody = JSON.stringify({
    title: 'TaskPod',
    body: payload.message,
    tag: payload.taskId || 'general',
    data: { url: payload.taskId ? `/${payload.taskId}` : '/' },
  })

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription_json, pushBody, { TTL: 86400 })

      // Update subscription last_used_at
      await supabase.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('id', sub.id)

      // Mark push as sent
      if (notification) {
        await supabase.from('notifications').update({
          push_sent_at: new Date().toISOString(),
          push_success: true,
        }).eq('id', notification.id)
      }
    } catch (err: unknown) {
      const pushErr = err as { statusCode?: number; message?: string }
      console.error('Push send error:', pushErr.message)

      // 410 Gone or 404 — subscription expired, remove it
      if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      }

      if (notification) {
        await supabase.from('notifications').update({
          push_sent_at: new Date().toISOString(),
          push_success: false,
        }).eq('id', notification.id)
      }
    }
  }
}
