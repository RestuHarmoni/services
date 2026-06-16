# RH Admin V1 Dashboard Foundation

## Status
Beta foundation added.

## New files
- admin/login.html
- admin/dashboard.html
- admin/index.html
- admin/assets/admin.css
- admin/assets/admin.js
- supabase/migrations/20260612160000_rh_admin_v1_foundation.sql

## Features
- Staff ID login: SUPER001, ADMIN001, STAFF001
- Dark RH Command Center UI
- Mobile sidebar drawer
- Dashboard cards
- Leads weekly graph
- Sales status donut graph
- Recent leads
- Recent activity placeholder

## Default login after SQL
- Staff ID: SUPER001
- Password: rh123456

## Important
This is beta-level staff login using Supabase table lookup and client-side SHA-256. It is acceptable for beta QA only. Production should later harden RLS and use a server-side/session strategy.
