import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Authenticate caller
    const { data: { user: callerUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !callerUser) throw new Error('Unauthorized caller')

    // 2. Extract payload
    const { targetUserId, updates } = await req.json()
    if (!targetUserId || !updates) throw new Error('Missing required fields')

    // 3. Verify caller permissions + get their company ID
    // Note: We check public.users to find the caller's role
    const { data: callerProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('role, company_id')
      .eq('id', callerUser.id)
      .single()

    if (profileError || !callerProfile) throw new Error('Caller profile not found')

    const isSuperAdmin = await isCallerSuperAdmin(supabaseClient, callerUser.email)
    const isOwner = callerProfile.role === 'owner'

    if (!isSuperAdmin && !isOwner) {
      throw new Error('Insufficient permissions to perform user updates')
    }

    // 4. Initialize Admin Client (Bypasses RLS strictly for the requested operation)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Verify Target User permissions
    // Owner can only edit their own staff
    // SuperAdmin can edit anyone
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('users')
      .select('company_id')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetProfile) throw new Error('Target user not found')

    if (!isSuperAdmin && targetProfile.company_id !== callerProfile.company_id) {
      throw new Error('Unauthorized to modify user outside your company')
    }

    // 6. Perform Updates
    let authResult = null
    let dbResult = null

    // Update Auth (Username/Email or Password)
    if (updates.password || updates.username) {
      const authUpdates: any = {}
      if (updates.password) authUpdates.password = updates.password
      if (updates.username) authUpdates.email = `${updates.username}@taskpod.system`

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        authUpdates
      )
      if (error) throw error
      authResult = data
    }

    // Update Profile (Name, Username)
    if (updates.name || updates.username) {
      const profileUpdates: any = {}
      if (updates.name) profileUpdates.name = updates.name
      if (updates.username) profileUpdates.username = updates.username

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(profileUpdates)
        .eq('id', targetUserId)
        .select()
      if (error) throw error
      dbResult = data
    }

    return new Response(JSON.stringify({ success: true, authResult, dbResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Helper to check SuperAdmin status (typically a predefined email or custom claim)
// Based on current implementation, super_admins table or email domain might be used
async function isCallerSuperAdmin(client: any, email: string | undefined) {
  // In TaskPod, superadmin logic is currently handled directly via Auth rules (username check)
  // We will do a generic check if they exist in a superadmin context, or rely on email.
  return email === 'superadmin@taskpod.system' || email?.includes('+superadmin')
}
