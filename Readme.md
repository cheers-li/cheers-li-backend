# Cheers.li Backend

## Deploy

```bash
supabase functions deploy send-session-notification 
```

## Test

```bash
curl -L -X POST 'https://ckiipzxuiudfldnxkxss.functions.supabase.co/send-session-notification' -H 'Authorization: Bearer [YOUR ANON KEY]' --data '{"name":"Functions"}'
```