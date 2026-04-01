import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

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
    // Auth: caller must be an active owner (Verified from users table using JWT)
    const token = req.headers.get('Authorization')?.split('Bearer ')[1] || ''
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // Verify caller is an active owner in the users table
    const { data: caller, error: callerError } = await supabase
      .from('users')
      .select('id, role, business_id, is_active')
      .eq('id', user.id)
      .single()
    
    if (callerError || !caller) return json({ error: 'User profile not found' }, 404)
    if (!caller.is_active) return json({ error: 'Your account is deactivated' }, 403)
    if (caller.role !== 'owner') return json({ error: 'Forbidden: Only business owners can manage staff' }, 403)

    const body = await req.json()
    const { action, businessId } = body

    // Verify the owner manages this business
    if (caller.business_id !== businessId) return json({ error: 'Business mismatch' }, 403)

    switch (action) {
      case 'create': {
        const { name, email, phone, tempPassword } = body
        if (!name?.trim() || !email?.trim() || !phone?.trim() || !tempPassword) {
          return json({ error: 'All fields are required' }, 400)
        }
        if (tempPassword.length < 8) {
          return json({ error: 'Password must be at least 8 characters' }, 400)
        }

        // Check staff limit (max 14 staff + 1 owner = 15 users per business)
        const { count } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('business_id', businessId)
        if ((count ?? 0) >= 15) {
          return json({ error: 'Maximum 15 users per business reached' }, 400)
        }

        // Check duplicate email (Global across TaskPod)
        const { data: existing } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).maybeSingle()
        if (existing) {
          return json({ error: 'A user with this email already exists' }, 400)
        }

        // Note: Phone uniqueness within business is now enforced by DB constraint 'unique_business_phone'.
        // We still check here for a better UX, but the DB constraint is the source of truth for race conditions.
        const { data: phoneDup } = await supabase.from('users')
          .select('id').eq('business_id', businessId).eq('phone', phone.trim()).maybeSingle()
        if (phoneDup) {
          return json({ error: 'This phone number is already registered to a staff member in your business' }, 400)
        }

        // Create auth user
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password: tempPassword,
          email_confirm: true,
        })
        if (authErr) return json({ error: 'Failed to create account: ' + authErr.message }, 500)

        const userId = authUser.user.id
        const colors = ['#1E3A5F', '#6A1B9A', '#1565C0', '#2E7D32', '#C62828', '#E65100', '#00838F', '#4527A0']
        const avatarColor = colors[Math.floor(Math.random() * colors.length)]

        // Insert users row
        const { error: userErr } = await supabase.from('users').insert({
          id: userId,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim(),
          role: 'staff',
          business_id: businessId,
          is_active: true,
          must_change_password: true,
          avatar_color: avatarColor,
        })
        if (userErr) {
          await supabase.auth.admin.deleteUser(userId)
          if (userErr.code === '23505') { // Unique violation
             return json({ error: 'A staff member with this phone number already exists in your business (Database Sync)' }, 400)
          }
          return json({ error: 'Failed to create user record: ' + userErr.message }, 500)
        }

        return json({ success: true, staffId: userId, name: name.trim(), email: email.trim().toLowerCase() })
      }

      case 'reset_password': {
        const { staffId, tempPassword } = body
        if (!staffId || !tempPassword) return json({ error: 'Staff ID and password required' }, 400)
        if (tempPassword.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)

        // Verify staff belongs to this business
        const { data: staff } = await supabase.from('users')
          .select('id, business_id').eq('id', staffId).eq('business_id', businessId).eq('role', 'staff').single()
        if (!staff) return json({ error: 'Staff member not found in your business' }, 404)

        // Update password via admin API
        const { error: pwErr } = await supabase.auth.admin.updateUserById(staffId, { password: tempPassword })
        if (pwErr) return json({ error: 'Failed to reset password: ' + pwErr.message }, 500)

        // Set must_change_password
        await supabase.from('users').update({ must_change_password: true }).eq('id', staffId)

        return json({ success: true })
      }

      default:
        return json({ error: 'Unknown action: ' + action }, 400)
    }
  } catch (err) {
    console.error('manage-staff error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
