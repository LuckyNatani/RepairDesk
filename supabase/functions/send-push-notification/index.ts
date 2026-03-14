// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
// @ts-ignore
import WebPush from "npm:web-push@3.6.6"

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

        const payload = await req.json()

        let task_id, recipient_id, event_type;

        // Determine if this is a custom payload (old method) or a Supabase Database Webhook (new method)
        if (payload.type && payload.record) {
            // Supabase Database Webhook format
            const record = payload.record;
            const old_record = payload.old_record;

            task_id = record.id;

            if (payload.type === 'INSERT' && record.assigned_to) {
                event_type = 'assigned';
                recipient_id = record.assigned_to;
            } else if (payload.type === 'UPDATE') {
                if (record.assigned_to && old_record?.assigned_to !== record.assigned_to) {
                    event_type = 'assigned';
                    recipient_id = record.assigned_to;
                } else if (record.status === 'completed' && old_record?.status !== 'completed') {
                    event_type = 'completed';
                    recipient_id = record.assigned_to || record.created_by; // Fallback to someone relevant
                } else {
                    return new Response(JSON.stringify({ message: "No relevant changes for push notification." }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 200,
                    });
                }
            } else {
                return new Response(JSON.stringify({ message: "Event ignored." }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
        } else {
            // Old custom payload format fallback (for direct testing)
            task_id = payload.task_id;
            recipient_id = payload.recipient_id;
            event_type = payload.event_type;
        }

        if (!recipient_id) {
            console.log('No recipient_id found in payload');
            return new Response(JSON.stringify({ message: "No recipient for this event." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log('Recipient ID identified:', recipient_id);

        // 1. Fetch recipient's push subscription
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('name, push_subscription')
            .eq('id', recipient_id)
            .single()

        if (userError) {
            console.error('Error fetching user:', userError.message);
            throw new Error('User not found');
        }

        if (!user?.push_subscription) {
            console.log('User has no push subscription registered, skipping external push but continuing to in-app notification');
        } else {
            console.log('Push subscription found for user:', user.name);
        }

        // 2. Fetch task details for the message
        const { data: task, error: taskError } = await supabaseClient
            .from('tasks')
            .select('task_number, customer_name, customer_address')
            .eq('id', task_id)
            .single()

        if (taskError) throw taskError

        // 3. Configure WebPush
        let vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'admin@taskpod.app'
        if (!vapidSubject.startsWith('mailto:') && !vapidSubject.startsWith('http')) {
            vapidSubject = `mailto:${vapidSubject}`
        }

        WebPush.setVapidDetails(
            vapidSubject,
            Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
            Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
        )

        // 4. Prepare message
        let title = 'RepairDesk Update'
        let body = ''

        if (event_type === 'assigned') {
            title = `Assigned Task #${task.task_number}`
            body = `A new task is assigned` // User specified exact text
        } else if (event_type === 'completed') {
            title = `Task #${task.task_number} Completed`
            body = `Task for ${task.customer_name} has been marked as finished.`
        }

        const pushPayload = JSON.stringify({
            title,
            body,
            icon: '/icons/icon-192.png',
            sound: 'default', // Instructs the device to use default notification sound
            vibrate: [200, 100, 200], // Haptic feedback
            data: {
                url: `/tasks/${task_id}`,
                task_number: task.task_number
            }
        })

        // 5. Send Notification & Save In-App Notification
        const notificationPromises = []
        if (user.push_subscription) {
            notificationPromises.push(WebPush.sendNotification(user.push_subscription, pushPayload))
        }

        notificationPromises.push(
            supabaseClient.from('notifications').insert([{
                user_id: recipient_id,
                task_id,
                message: body
            }])
        )

        await Promise.allSettled(notificationPromises)

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
