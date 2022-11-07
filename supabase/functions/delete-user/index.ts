import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";

const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Expose-Headers": "Content-Length, X-JSON",
    "Access-Control-Allow-Headers":
        "apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const content = await req.json();
    const userId = content.user_id;

    const { error: errorDeleteProfile } = await supabaseClient
        .from("profiles")
        .delete()
        .match({ id: userId });

    if (errorDeleteProfile) {
        console.error(errorDeleteProfile);
        return new Response(JSON.stringify(errorDeleteProfile), {
            status: 500,
        });
    }

    const { data, error } = await supabaseClient.auth.api.deleteUser(userId);
    if (error) {
        console.error(error);
        return new Response(JSON.stringify(error), { status: error.status });
    }

    return new Response(JSON.stringify(data), {
        headers: corsHeaders,
    });
});
