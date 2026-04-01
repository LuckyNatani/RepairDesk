import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

/**
 * Returns Superadmin contact info for the trial-expired / suspended screens.
 * Requires a valid JWT (any authenticated user).
 */
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Verify auth: any valid TaskPod user can see contact info
  const token = req.headers.get('Authorization')?.split('Bearer ')[1] || ''
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  // These come from edge function env or could be hardcoded for the single SA
  const contact = {
    name: 'TaskPod Support',
    phone: Deno.env.get('SUPPORT_PHONE') || '',
    email: Deno.env.get('SUPPORT_EMAIL') || '',
  }

  return new Response(JSON.stringify(contact), { headers: corsHeaders })
})
