import "jsr:@supabase/functions-js/edge-runtime.d.ts"

/**
 * Returns Superadmin contact info for the trial-expired / suspended screens.
 * No auth required — only returns public contact info.
 */
Deno.serve(async () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  // These come from edge function env or could be hardcoded for the single SA
  const contact = {
    name: 'TaskPod Support',
    phone: Deno.env.get('SUPPORT_PHONE') || '',
    email: Deno.env.get('SUPPORT_EMAIL') || '',
  }

  return new Response(JSON.stringify(contact), { headers: corsHeaders })
})
