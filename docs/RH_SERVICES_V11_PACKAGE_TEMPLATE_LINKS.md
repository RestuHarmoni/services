# RH Services v11.0 Package Template Links

Status: Ready for deploy

## Tujuan

Masukkan template pakej rasmi ke dalam website supaya Aira boleh beri link terus kepada client selepas cadangan pakej.

## URL Baru

- `/pakej/` — hub perbandingan pakej
- `/pakej/rh-starter/` — template RH Starter
- `/pakej/rh-growth/` — template RH Growth
- `/pakej/rh-ecosystem/` — template RH Ecosystem

## Aira Flow

Aira kini boleh:

1. Terangkan pakej rasmi RH
2. Beri link template mengikut pakej
3. Selepas cadangan lead, tunjuk butang `Lihat detail template <pakej>`

## Supabase

Run migration:

```sql
supabase/migrations/20260611110000_rh_services_v110_package_template_links.sql
```
