// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
// @ts-ignore
import WebPush from "https://esm.sh/web-push@3.6.6"

declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { task_id, recipient_id, event_type } = await req.json()

        // 1. Fetch recipient's push subscription
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('name, push_subscription')
            .eq('id', recipient_id)
            .single()

        if (userError || !user?.push_subscription) {
            throw new Error('User not found or no push subscription')
        }

        // 2. Fetch task details for the message
        const { data: task, error: taskError } = await supabaseClient
            .from('tasks')
            .select('task_number, customer_name, customer_address')
            .eq('id', task_id)
            .single()

        if (taskError) throw taskError

        // 3. Configure WebPush
        WebPush.setVapidDetails(
            Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@repairdesk.com',
            Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
            Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
        )

        // 4. Prepare message
        let title = 'RepairDesk Update'
        let body = ''

        if (event_type === 'assigned') {
            title = `Task #${task.task_number} Assigned`
            body = `New task at ${task.customer_address} for ${task.customer_name}`
        } else if (event_type === 'completed') {
            title = `Task #${task.task_number} Completed`
            body = `Task for ${task.customer_name} has been marked as finished.`
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: '/icons/icon-192.png',
            data: {
                url: `/tasks/${task_id}`,
                task_number: task.task_number
            }
        })

        // 5. Send Notification
        await WebPush.sendNotification(user.push_subscription, payload)

        // 6. Log success
        await supabaseClient.from('push_logs').insert([{
            task_id,
            recipient_id,
            event_type,
            success: true
        }])

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Push Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
