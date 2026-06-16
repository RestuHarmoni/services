-- RH Admin Invoice Module V1.1.3 - Financial & Print Engine Fix
-- Fix existing draft invoices where balance_due was stored as full invoice total despite deposit_amount.

update public.invoices
set balance_due = greatest(0, coalesce(grand_total, total_amount, net_amount, 0) - coalesce(deposit_amount, 0)),
    balance_after_deposit = greatest(0, coalesce(grand_total, total_amount, net_amount, 0) - coalesce(deposit_amount, 0)),
    updated_at = now()
where coalesce(amount_paid, 0) = 0
  and coalesce(deposit_amount, 0) > 0
  and coalesce(balance_due, 0) = coalesce(grand_total, total_amount, net_amount, 0);
