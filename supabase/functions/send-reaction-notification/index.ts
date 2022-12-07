import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";
import androidConfig from "../_shared/androidConfig.ts";

const getSession = async (supabaseClient: any, sessionId: string) => {
    const { data, error } = await supabaseClient
        .from("sessions")
        .select(
            "id, name, created_at, ended_at, location, location_name, session_tag, user:user_id (id, username, avatarUrl:avatar_url, devices(id, device_token))"
        )
        .eq("id", sessionId)
        .single();

    if (error) {
        console.error(error);
    }

    return data;
};

const getProfile = async (supabaseClient: any, userId: string) => {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, username, devices(id, device_token)")
        .eq("id", userId)
        .single();

    if (error) {
        console.error(error);
    }

    return data;
};

serve(async (req) => {
    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const content = await req.json();

    const session = await getSession(supabaseClient, content.record.session_id);
    const profile = await getProfile(supabaseClient, content.record.profile_id);

    const message = {
        notification: {
            title: "New Reaction",
            body: `${profile.username} reacted to your session`,
            icon: "ic_notification",
        },
        android: androidConfig(
            `io.supabase.cheersli://app/sessions/${content.record.session_id}`
        ),
        registration_ids: session.user.devices?.map(
            (device: any) => device.device_token
        ),
    };

    if (!message.registration_ids || message.registration_ids.length === 0) {
        return new Response(JSON.stringify(message), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const key = Deno.env.get("FIREBASE_ACCESS_TOKEN");
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `key=${key}`,
        },
        body: JSON.stringify(message),
    });
    const payload = await response.json();
    return new Response(JSON.stringify({ payload, message }), {
        headers: { "Content-Type": "application/json" },
    });
});
