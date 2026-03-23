import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { data: { user: callerUser } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1] || '')
  if (!callerUser) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  const { data: caller } = await supabase.from('users').select('role, business_id, is_active').eq('id', callerUser.id).single()
  if (!caller || caller.role !== 'owner' || !caller.is_active) return new Response('Forbidden', { status: 403, headers: corsHeaders })

  const { action, businessId, name, email, phone, tempPassword, staffId } = await req.json()
  if (businessId !== caller.business_id) return new Response('Forbidden', { status: 403, headers: corsHeaders })

  if (action === 'create') {
    // Check max 15 users
    const { count } = await supabase.from('users').select('id', { count: 'exact' }).eq('business_id', businessId)
    if ((count || 0) >= 15) return new Response(JSON.stringify({ error: 'Maximum 15 users reached' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({ email, password: tempPassword, email_confirm: true })
    if (authErr) return new Response(JSON.stringify({ error: authErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { error } = await supabase.from('users').insert({ id: authUser.user.id, email, name, phone, role: 'staff', business_id: businessId, must_change_password: true })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    return new Response(JSON.stringify({ success: true, userId: authUser.user.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  if (action === 'reset_password') {
    const { data: staffData } = await supabase.from('users').select('id').eq('id', staffId).eq('business_id', businessId).single()
    if (!staffData) return new Response('Not found', { status: 404, headers: corsHeaders })

    await supabase.auth.admin.updateUserById(staffId, { password: tempPassword })
    await supabase.from('users').update({ must_change_password: true }).eq('id', staffId)

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
