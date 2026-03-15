// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Admin Client (service role — bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    const jwt = authHeader.replace('Bearer ', '');

    // Verify the caller using the service role client + their JWT
    const { data: { user: callerUser }, error: userError } =
      await supabaseAdmin.auth.getUser(jwt);
    if (userError || !callerUser) throw new Error('Unauthorized caller');

    // Extract payload
    const { targetUserId, updates } = await req.json();
    if (!targetUserId || !updates) throw new Error('Missing required fields');

    // Get caller's profile to verify role (using service role to bypass RLS)
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, company_id')
      .eq('id', callerUser.id)
      .single();

    if (profileError || !callerProfile) throw new Error('Caller profile not found');

    const isSuperAdmin = callerProfile.role === 'superadmin';
    const isOwner = callerProfile.role === 'owner';

    if (!isSuperAdmin && !isOwner) {
      throw new Error('Insufficient permissions to perform user updates');
    }

    // Verify Target User permissions
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('users')
      .select('company_id')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetProfile) throw new Error('Target user not found');

    if (!isSuperAdmin && targetProfile.company_id !== callerProfile.company_id) {
      throw new Error('Unauthorized to modify user outside your company');
    }

    // Perform Updates
    let authResult = null;
    let dbResult = null;

    // Update Auth (Username/Email or Password)
    if (updates.password || updates.username) {
      const authUpdates: Record<string, string> = {};
      if (updates.password) authUpdates.password = updates.password;
      if (updates.username) authUpdates.email = `${updates.username}@taskpod.system`;

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        authUpdates
      );
      if (error) throw error;
      authResult = data;
    }

    // Update Profile (Name, Username)
    if (updates.name || updates.username) {
      const profileUpdates: Record<string, string> = {};
      if (updates.name) profileUpdates.name = updates.name;
      if (updates.username) profileUpdates.username = updates.username;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(profileUpdates)
        .eq('id', targetUserId)
        .select();
      if (error) throw error;
      dbResult = data;
    }

    return new Response(JSON.stringify({ success: true, authResult, dbResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
