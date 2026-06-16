-- RH Admin v1.3.1 Subscription Package Price Fix
-- Align Subscription Engine with official Aira package pricing:
-- RH Basic RM799 + maintenance RM79/month
-- RH Growth RM1999 + maintenance RM129/month
-- RH Ecosystem RM2999 + maintenance RM249/month
-- RH Enterprise custom
-- Safe migration: no DROP TABLE, no DELETE DATA.

-- Fix existing subscriptions created by v1.3 default mapping.
UPDATE public.subscriptions
SET
  plan_name = 'RH Basic Maintenance',
  monthly_amount = 79,
  cycle_amount = CASE
    WHEN billing_cycle = 'yearly' THEN 79 * 12
    WHEN billing_cycle = 'six_months' THEN 79 * 6
    ELSE 79
  END,
  discount_amount = 0,
  updated_at = now(),
  notes = concat_ws(E'\n', notes, 'System note: v1.3.1 package price fixed to RH Basic Maintenance RM79/month.')
WHERE is_deleted = false
  AND (
    lower(coalesce(package_name,'')) LIKE '%basic%'
    OR lower(coalesce(plan_name,'')) LIKE '%basic%'
  );

UPDATE public.subscriptions
SET
  plan_name = 'RH Growth Maintenance',
  monthly_amount = 129,
  cycle_amount = CASE
    WHEN billing_cycle = 'yearly' THEN 129 * 12
    WHEN billing_cycle = 'six_months' THEN 129 * 6
    ELSE 129
  END,
  discount_amount = 0,
  updated_at = now(),
  notes = concat_ws(E'\n', notes, 'System note: v1.3.1 package price fixed to RH Growth Maintenance RM129/month.')
WHERE is_deleted = false
  AND (
    lower(coalesce(package_name,'')) LIKE '%growth%'
    OR lower(coalesce(plan_name,'')) LIKE '%growth%'
  );

UPDATE public.subscriptions
SET
  plan_name = 'RH Ecosystem Maintenance',
  monthly_amount = 249,
  cycle_amount = CASE
    WHEN billing_cycle = 'yearly' THEN 249 * 12
    WHEN billing_cycle = 'six_months' THEN 249 * 6
    ELSE 249
  END,
  discount_amount = 0,
  updated_at = now(),
  notes = concat_ws(E'\n', notes, 'System note: v1.3.1 package price fixed to RH Ecosystem Maintenance RM249/month.')
WHERE is_deleted = false
  AND (
    lower(coalesce(package_name,'')) LIKE '%ecosystem%'
    OR lower(coalesce(plan_name,'')) LIKE '%ecosystem%'
  );

UPDATE public.subscriptions
SET
  plan_name = 'RH Enterprise Maintenance',
  monthly_amount = 0,
  cycle_amount = 0,
  discount_amount = 0,
  updated_at = now(),
  notes = concat_ws(E'\n', notes, 'System note: v1.3.1 package price fixed to RH Enterprise custom maintenance.')
WHERE is_deleted = false
  AND (
    lower(coalesce(package_name,'')) LIKE '%enterprise%'
    OR lower(coalesce(plan_name,'')) LIKE '%enterprise%'
    OR lower(coalesce(package_name,'')) LIKE '%custom%'
  );
