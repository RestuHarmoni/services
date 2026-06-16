# Admin Login Speed Fix

- Login now uses an 8-second timeout for Supabase client and staff_users lookup.
- last_login update no longer blocks dashboard redirect.
- Login button is disabled while checking to avoid duplicate submits.
- Added clearer console error prefix: [RH ADMIN LOGIN ERROR].
- Added cache-busting query string to login assets.
