# Admin Buttons Restore + Login Stabilizer

This patch is based on the latest live admin build.

Fixes:
- Restores full admin/assets/admin.js module logic.
- Keeps login route stable at /admin/login and /admin/login.html.
- Prevents browser form reload.
- Uses direct Supabase REST login with apikey header.
- Does not change SQL, Payment, Invoice, Project or Department logic.
