import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Expose-Headers": "Content-Length, X-JSON",
    "Access-Control-Allow-Headers": "apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
};

serve(async (req) => {
    console.log(req);
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const content = await req.json();
    const deviceToken = content.device_token;
    const userName = content.user.username;

    const message = {
        notification: {
            title: `${userName} sent you a message`,
            body: "Cheersli 🍻",
        },
        registration_ids: deviceToken,
    };

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

    return new Response(JSON.stringify(message), {
        headers: corsHeaders,
    });
});
