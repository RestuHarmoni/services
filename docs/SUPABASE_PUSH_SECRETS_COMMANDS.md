# Supabase Secrets Untuk Push Notification

Run command ini di terminal yang sudah login Supabase CLI.

```bash
supabase secrets set VAPID_SUBJECT="mailto:restuharmoni@gmail.com"
supabase secrets set VAPID_PUBLIC_KEY="BH2-Ruc4z1daSYb82e1gbSZ29i1NLejYrtl90lUwvuGvyMz2x63pmnAbwS2U0GaH-h3bGiFaUcyEXV9nL87qPto"
supabase secrets set VAPID_PRIVATE_KEY="PRIVATE_KEY_DARI_GENERATOR_ANDA"
```

Jangan letak private key dalam GitHub, Cloudflare frontend, `push-config.js`, atau fail public.
