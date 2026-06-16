# RH Services v1.3.1 — Subscription Package Price Fix

## Base
services-main-update-v1.3-subscription-renewal-engine.zip

## Purpose
Fix Subscription Engine pricing so it matches official Aira package pricing.

## Official RH Packages
- RH Basic — setup RM799 + maintenance RM79/month
- RH Growth — setup RM1999 + maintenance RM129/month
- RH Ecosystem — setup RM2999 + maintenance RM249/month
- RH Enterprise — custom quotation/custom maintenance

## Files Changed
- admin/assets/subscriptions.js
- admin/subscriptions.html

## SQL Required
Run:
- supabase/migrations/20260616143100_rh_admin_v1_3_1_subscription_package_price_fix.sql

## SQL Safety
- No DROP TABLE
- No DELETE DATA
- Existing wrong subscription amounts are updated safely based on package/plan name.

## Locked Modules Not Changed
- Leads
- Prospects
- Quotations
- Invoices
- Payments
- Projects
- Dashboard
