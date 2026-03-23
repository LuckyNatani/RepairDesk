import { serve } from "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const SUPERADMIN_USER_ID = Deno.env.get('SUPERADMIN_USER_ID')!

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  // Verify caller is superadmin
  const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1] || '')
  if (!user || user.id !== SUPERADMIN_USER_ID) return new Response('Forbidden', { status: 403 })

  const { businessName, ownerName, ownerEmail, ownerPhone, tempPassword } = await req.json()
  if (!businessName || !ownerName || !ownerEmail || !ownerPhone || !tempPassword) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  // 1. Create business
  const { data: business, error: bizError } = await supabase.from('businesses').insert({ name: businessName, account_status: 'trial_active' }).select().single()
  if (bizError) return new Response(JSON.stringify({ error: bizError.message }), { status: 500 })

  // 2. Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({ email: ownerEmail, password: tempPassword, email_confirm: true })
  if (authError) {
    await supabase.from('businesses').delete().eq('id', business.id)
    return new Response(JSON.stringify({ error: authError.message }), { status: 500 })
  }

  // 3. Create users record
  const { error: userError } = await supabase.from('users').insert({ id: authUser.user.id, email: ownerEmail, name: ownerName, phone: ownerPhone, role: 'owner', business_id: business.id, must_change_password: true })
  if (userError) return new Response(JSON.stringify({ error: userError.message }), { status: 500 })

  // 4. Set owner_id on business
  await supabase.from('businesses').update({ owner_id: authUser.user.id }).eq('id', business.id)

  // 5. Log account event
  await supabase.from('account_events').insert({ business_id: business.id, event_type: 'created', actor_id: SUPERADMIN_USER_ID, note: 'Business created by superadmin' })

  return new Response(JSON.stringify({ success: true, businessName, ownerEmail, tempPassword }), { headers: { 'Content-Type': 'application/json' } })
})
