import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";
import androidConfig from "../_shared/androidConfig.ts";

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

    const profile1 = await getProfile(supabaseClient, content.record.user_1);
    const profile2 = await getProfile(supabaseClient, content.record.user_2);

    const message = {
        notification: {
            title: "New Friend Request",
            body: `${profile1.username} sent you a friend request`,
            icon: "ic_notification",
        },
        android: androidConfig("io.supabase.cheersli://app/friends"),
        registration_ids: profile2.devices?.map(
            (device: any) => device.device_token
        ),
    };

    if (!message.registration_ids) {
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
