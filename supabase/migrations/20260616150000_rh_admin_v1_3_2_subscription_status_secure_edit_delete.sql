-- RH Admin v1.3.2 Subscription Status + Secure Edit/Delete Fix
-- Safe migration only: no DROP TABLE, no DELETE DATA.

alter table public.subscriptions
  add column if not exists delete_reason text;

alter table public.subscription_invoices
  add column if not exists delete_reason text;

-- Existing subscriptions created before this patch without any renewal invoice
-- should wait for first renewal invoice instead of showing Due Soon/Active.
update public.subscriptions s
set status = 'pending_invoice',
    current_period_start = null,
    current_period_end = null,
    next_billing_date = null,
    updated_at = now(),
    notes = coalesce(s.notes,'') || E'\n[v1.3.2] Status corrected to Pending Invoice until first renewal invoice is paid.'
where coalesce(s.is_deleted,false) = false
  and lower(coalesce(s.status,'')) in ('active','due_soon')
  and not exists (
    select 1 from public.subscription_invoices si
    where si.subscription_id = s.id
      and coalesce(si.is_deleted,false) = false
  );

create index if not exists idx_subscriptions_is_deleted on public.subscriptions(is_deleted);
create index if not exists idx_subscription_invoices_is_deleted on public.subscription_invoices(is_deleted);
