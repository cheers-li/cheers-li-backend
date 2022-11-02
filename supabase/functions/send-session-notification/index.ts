import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@^1.33.2";

const getFriendsAndDevices = async (supabaseClient: any, userId: string) => {
    const { data, error } = await supabaseClient
        .from("friends")
        .select(
            "user_1 (id, username, avatar_url, active_at, devices(id, device_token)), user_2 (id, username, avatar_url, active_at, devices(id, device_token))"
        )
        .eq("accepted", true)
        .or(`user_1.eq.${userId},user_2.eq.${userId}`);

    if (error) {
        console.error(error);
    }

    const friendList = data?.map((friendConnection: any) => {
        const other =
            friendConnection.user_1.id === userId
                ? friendConnection.user_2
                : friendConnection.user_1;

        const friend = {
            id: other.id,
            username: other.username,
            avatarUrl: other.avatar_url,
            activeAt: other.active_at,
            devices: other.devices,
        };

        return friend;
    });

    return friendList;
};

serve(async (req) => {
    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const content = await req.json();
    const userId = content.record.user_id;
    const friends = await getFriendsAndDevices(supabaseClient, userId);
    const coordinates = content.record.location?.coordinates;
    const locationName = content.record.location_name;

    let body = "📍 at a nice place."

    if(coordinates) {
        body = `📍 ${coordinates[0]}, ${coordinates[1]}`    
    }
    if(locationName) {
        body = `📍 ${locationName}`    
    }

    const message = {
        notification: {
            title: content.record.name,
            body,
        },
        registration_ids: friends
            ?.map((friend: any) =>
                friend.devices.map((device: any) => device.device_token)
            )
            .flat(),
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
        headers: { "Content-Type": "application/json" },
    });
});
