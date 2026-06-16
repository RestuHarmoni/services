# Admin Login Direct REST Hotfix

- Prevent form reload/navigation loop.
- Login button uses type=button.
- Staff login uses Supabase REST with apikey headers directly.
- 8 second timeout.
- last_login update no longer blocks dashboard redirect.
- Cache bust on login assets.
