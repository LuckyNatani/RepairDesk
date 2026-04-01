import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const SUPERADMIN_USER_ID = Deno.env.get('SUPERADMIN_USER_ID')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Auth: only superadmin (Verified against users table)
    const token = req.headers.get('Authorization')?.split('Bearer ')[1] || ''
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const { data: caller, error: callerError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (callerError || !caller || caller.role !== 'superadmin') {
      return json({ error: 'Forbidden: Superadmin access required' }, 403)
    }

    const { businessName, ownerName, ownerEmail, ownerPhone, tempPassword, startAs } = await req.json()

    // Validate
    if (!businessName?.trim() || !ownerName?.trim() || !ownerEmail?.trim() || !ownerPhone?.trim() || !tempPassword) {
      return json({ error: 'All fields are required' }, 400)
    }
    if (tempPassword.length < 8) {
      return json({ error: 'Password must be at least 8 characters' }, 400)
    }

    // Check max 2 businesses
    const { count } = await supabase.from('businesses').select('id', { count: 'exact', head: true })
    if ((count ?? 0) >= 2) {
      return json({ error: 'Maximum of 2 businesses allowed on this platform' }, 400)
    }

    // Check duplicate email
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', ownerEmail.trim().toLowerCase()).maybeSingle()
    if (existingUser) {
      return json({ error: 'A user with this email already exists' }, 400)
    }

    // 1. Create auth user
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: ownerEmail.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
    })
    if (authErr) return json({ error: 'Failed to create auth account: ' + authErr.message }, 500)

    const userId = authUser.user.id
    const now = new Date()
    const isActive = startAs === 'active'
    const trialEnds = new Date(now)
    if (isActive) {
      trialEnds.setFullYear(trialEnds.getFullYear() + 1)
    } else {
      trialEnds.setDate(trialEnds.getDate() + 7)
    }

    // Generate a random avatar color
    const colors = ['#1E3A5F', '#6A1B9A', '#1565C0', '#2E7D32', '#C62828', '#E65100', '#00838F', '#4527A0']
    const avatarColor = colors[Math.floor(Math.random() * colors.length)]

    // 2. Insert users row
    const { error: userErr } = await supabase.from('users').insert({
      id: userId,
      email: ownerEmail.trim().toLowerCase(),
      name: ownerName.trim(),
      phone: ownerPhone.trim(),
      role: 'owner',
      is_active: true,
      must_change_password: true,
      avatar_color: avatarColor,
    })
    if (userErr) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(userId)
      return json({ error: 'Failed to create user record: ' + userErr.message }, 500)
    }

    // 3. Insert businesses row
    const { data: biz, error: bizErr } = await supabase.from('businesses').insert({
      name: businessName.trim(),
      owner_id: userId,
      account_status: isActive ? 'active' : 'trial_active',
      trial_ends_at: trialEnds.toISOString(),
      activated_at: isActive ? now.toISOString() : null,
      activated_by: isActive ? SUPERADMIN_USER_ID : null,
    }).select('id').single()
    if (bizErr) {
      // Rollback
      await supabase.from('users').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      return json({ error: 'Failed to create business: ' + bizErr.message }, 500)
    }

    // 4. Link user to business
    await supabase.from('users').update({ business_id: biz.id }).eq('id', userId)

    // 5. Insert account_events
    await supabase.from('account_events').insert({
      business_id: biz.id,
      event_type: 'created',
      actor_id: SUPERADMIN_USER_ID,
      note: `Business created by Superadmin. Start: ${isActive ? 'Active' : 'Trial (7 days)'}`,
    })

    return json({
      success: true,
      businessId: biz.id,
      businessName: businessName.trim(),
      ownerEmail: ownerEmail.trim().toLowerCase(),
      ownerName: ownerName.trim(),
      tempPassword,
    })
  } catch (err) {
    console.error('create-business error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
