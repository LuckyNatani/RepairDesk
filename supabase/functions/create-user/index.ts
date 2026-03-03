import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Authenticate the caller using their JWT
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        const {
            data: { user: callerUser },
            error: userError,
        } = await supabaseClient.auth.getUser();
        if (userError || !callerUser) throw new Error("Unauthorized caller");

        // Get caller's profile to verify role
        const { data: callerProfile, error: profileError } = await supabaseClient
            .from("users")
            .select("role, company_id")
            .eq("id", callerUser.id)
            .single();

        if (profileError || !callerProfile)
            throw new Error("Caller profile not found");

        // Parse request body
        const { name, username, password, role, companyId } = await req.json();

        // Validate required fields
        if (!name || !username || !password) {
            throw new Error("Missing required fields: name, username, password");
        }
        if (username.length < 3) {
            throw new Error("Username must be at least 3 characters");
        }
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        // Permission check: who can create what
        const isSuperAdmin = callerProfile.role === "superadmin";
        const isOwner = callerProfile.role === "owner";
        const targetRole = role || "staff";

        if (targetRole === "owner" && !isSuperAdmin) {
            throw new Error("Only SuperAdmins can create company owners");
        }
        if (targetRole === "staff" && !isOwner && !isSuperAdmin) {
            throw new Error("Only Owners and SuperAdmins can create staff");
        }
        if (targetRole === "superadmin") {
            throw new Error("SuperAdmin accounts cannot be created via this function");
        }

        // Determine the company_id for the new user
        let targetCompanyId;
        if (isSuperAdmin) {
            // SuperAdmin must specify the company for owners
            if (targetRole === "owner" && !companyId) {
                throw new Error("SuperAdmin must specify companyId when creating owners");
            }
            targetCompanyId = companyId;
        } else if (isOwner) {
            // Owner creates staff in their own company
            targetCompanyId = callerProfile.company_id;
        }

        if (!targetCompanyId) {
            throw new Error("Could not determine company for the new user");
        }

        // Initialize Admin Client (bypasses RLS)
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Check for duplicate username
        const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (existingUser) {
            throw new Error("Username is already taken. Please choose another.");
        }

        // Create the auth user using admin API (does NOT affect caller's session)
        const systemEmail = `${username}@taskpod.system`;
        const { data: authData, error: signUpError } =
            await supabaseAdmin.auth.admin.createUser({
                email: systemEmail,
                password: password,
                email_confirm: true,
            });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Failed to create auth user");

        // Insert profile row
        const { data: profileData, error: insertError } = await supabaseAdmin
            .from("users")
            .insert([
                {
                    id: authData.user.id,
                    name: name,
                    username: username,
                    role: targetRole,
                    company_id: targetCompanyId,
                },
            ])
            .select()
            .single();

        if (insertError) {
            // Rollback: delete the auth user if profile insert fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw new Error(`Profile creation failed: ${insertError.message}`);
        }

        return new Response(
            JSON.stringify({ success: true, user: profileData }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
