-- RH Admin V1.5.1 / Quotation Module V1.0.1
-- Purpose:
-- 1) Separate client-facing quotation notes from internal prospect notes.
-- 2) Keep existing quotations compatible.

alter table public.quotations
add column if not exists client_notes text;

-- Existing quotations that have internal/system notes remain untouched.
-- UI V1.0.1 will sanitize notes before showing them in quotation preview/PDF.
