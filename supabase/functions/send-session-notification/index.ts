import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

serve(async (req) => {
    const message = await req.json();
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

    return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
    });
});
