# Cheers.li Backend

## Deploy

```bash
supabase functions deploy send-session-notification 
supabase functions deploy send-friend-request
supabase functions deploy send-cheersli
supabase functions deploy delete-user
supabase functions deploy send-reaction-notification
```

## Run Locally

```bash
supabase start
supabase functions serve send-session-notification 
```

## Test

```bash
curl -L -X POST 'https://ckiipzxuiudfldnxkxss.functions.supabase.co/send-session-notification' -H 'Authorization: Bearer [YOUR ANON KEY]' --data '{"name":"Functions"}'
```