# RH Admin Project Module V1.2 — Department & Production Engine

## Status
Build update untuk menjadikan Project Module sebagai production engine asas.

## Ditambah
- Table `project_departments`
- Department cards dalam Project Detail
- Department progress berdasarkan task stage
- Department status: Pending, Active, In Progress, Review, Completed, Blocked
- Department timeline update
- Auto seed 7 department untuk project baru dan project sedia ada

## Department
1. Project Management
2. Content Collection
3. UI / Design
4. Development
5. SEO & Technical
6. QA Review
7. Delivery / Handover

## QA
1. Buka `/admin/projects.html`
2. View project
3. Semak section `Department & Production Engine`
4. Tekan Start / Review / Done / Block pada department
5. Tick task dan semak progress department bergerak

## SQL
Run:
`supabase/migrations/20260613004000_rh_admin_project_module_v1_2_department_production_engine.sql`
