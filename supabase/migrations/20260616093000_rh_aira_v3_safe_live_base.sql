-- RH Aira V3 Sales Consultant Safe Live Base
-- Run only if production Aira still loads old bank from Supabase.

alter table public.leads
add column if not exists domain_status text,
add column if not exists hosting_status text;

create table if not exists public.aira_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.aira_settings enable row level security;

drop policy if exists "public_read_aira_settings" on public.aira_settings;
create policy "public_read_aira_settings"
on public.aira_settings
for select
to anon
using (true);

drop policy if exists "public_upsert_aira_settings" on public.aira_settings;
create policy "public_upsert_aira_settings"
on public.aira_settings
for all
to anon
using (true)
with check (true);

insert into public.aira_settings(key,value,updated_at)
values
('question_bank','{"version": "v11.0-package-template-linking-aira-v3-sales-consultant", "assistantName": "Aira", "positioning": "AI Website Consultant", "intro": ["👋 Hai, saya <strong>Aira</strong>.", "Saya boleh bantu cadangkan website yang sesuai untuk bisnes anda dalam masa kurang 1 minit."], "steps": [{"key": "business_type", "question": "Apakah jenis bisnes anda?", "type": "choice", "required": true, "options": ["Servis", "Produk", "Restoran", "Event", "Hartanah", "Lain-lain"]}, {"key": "domain_status", "question": "Adakah anda sudah mempunyai domain?", "type": "choice", "required": false, "options": ["Ya", "Belum", "Tidak Pasti"]}, {"key": "hosting_status", "question": "Adakah anda sudah mempunyai hosting?", "type": "choice", "required": false, "options": ["Ya", "Belum", "Tidak Pasti"]}, {"key": "objective", "question": "Apakah objektif utama website anda?", "type": "choice", "required": true, "options": ["Dapatkan Lead", "Profil Syarikat", "Jual Produk", "Booking", "SEO Google"]}, {"key": "budget", "question": "Budget anggaran?", "type": "choice", "required": true, "options": ["RM799 (RH Basic)", "RM1999 (RH Growth)", "RM2999 (RH Ecosystem)", "RM3000+ (RH Enterprise)", "Tidak Pasti"]}, {"key": "timeline", "question": "Bila anda mahu website mula siap atau dilancarkan?", "type": "choice", "required": true, "options": ["Segera", "1–2 minggu", "Dalam 1 bulan", "Belum pasti"]}, {"key": "name", "question": "Boleh saya tahu nama anda?", "type": "input", "input": true, "placeholder": "Contoh: Ahmad", "required": true}, {"key": "phone", "question": "Nombor WhatsApp untuk team kami hubungi?", "type": "input", "input": true, "placeholder": "Contoh: 0123456789", "required": true, "validation": "phone"}], "packages": {"RH Basic": {"price": "RM799", "maintenance": "RM79/bulan", "templateCount": 1, "bestFor": ["Startup", "Personal web", "Bisnes kecil", "Profil ringkas"], "features": ["One-page / basic profile website", "Mobile responsive", "Lead form ringkas", "WhatsApp CTA", "SEO asas", "Google-ready structure"], "templateUrl": "/pakej/rh-basic/"}, "RH Growth": {"price": "RM1999", "maintenance": "RM129/bulan", "templateCount": 10, "bestFor": ["Bisnes servis", "Lead generation", "Portfolio", "Blog SEO"], "features": ["Multi-page website", "AI Chatbot Aira", "Lead Capture System", "Service / Product Listing", "Blog / Artikel", "Portfolio / Gallery", "SEO asas"], "templateUrl": "/pakej/rh-growth/"}, "RH Ecosystem": {"price": "RM2999", "maintenance": "RM249/bulan", "templateCount": 10, "bestFor": ["Syarikat berkembang", "Multi servis", "Admin dashboard", "AI sales funnel"], "features": ["Company Profile + Service Website", "Advanced AI Chatbot", "Blog CMS", "Dashboard Basic", "Lead Management Ready", "Analytics-ready structure", "Multi Website Structure"], "templateUrl": "/pakej/rh-ecosystem/"}, "RH Enterprise": {"price": "Custom", "maintenance": "Ikut scope", "templateCount": 0, "bestFor": ["Custom system", "Portal", "CRM", "Multi-branch"], "features": ["Custom quotation", "Portal / dashboard", "Automation flow", "Integration planning", "Advanced workflow"], "templateUrl": "/#aira-popup"}}}'::jsonb,now()),
('faq_bank','{"version": "v11.0-package-template-linking-aira-v3-sales-consultant", "quickActions": ["Lihat Pakej", "Harga Pakej RH", "Lihat Contoh Website", "Dapatkan Cadangan"], "faq": [{"topic": "harga", "triggers": ["harga", "kos", "price", "pakej", "package", "bayaran", "berapa", "lihat pakej"], "answer": "Kami ada 4 pilihan utama:<br><br><strong>RH Basic</strong> — RM799 + maintenance RM79/bulan<br><strong>RH Growth</strong> — RM1999 + maintenance RM129/bulan<br><strong>RH Ecosystem</strong> — RM2999 + maintenance RM249/bulan<br><strong>RH Enterprise</strong> — Custom quotation.<br><br>Aira boleh cadangkan pakej berdasarkan jenis bisnes, domain, hosting, objektif dan budget anda."}, {"topic": "basic", "triggers": ["basic", "rm799", "799", "starter murah", "industri kecil", "personal"], "answer": "<strong>RH Basic RM799</strong> sesuai untuk personal web, bisnes kecil, profil ringkas dan permulaan digital. Maintenance bermula RM79/bulan."}, {"topic": "growth", "triggers": ["growth", "rm1999", "1999"], "answer": "<strong>RH Growth RM1999</strong> sesuai untuk bisnes servis yang mahu dapatkan lead, paparkan portfolio, servis, artikel dan struktur website lebih lengkap."}, {"topic": "ecosystem", "triggers": ["ecosystem", "rm2999", "2999"], "answer": "<strong>RH Ecosystem RM2999</strong> sesuai untuk syarikat yang mahu website + Aira + blog CMS + dashboard basic + lead management."}, {"topic": "enterprise", "triggers": ["enterprise", "custom", "3000", "rm3000", "portal", "crm", "system"], "answer": "<strong>RH Enterprise</strong> ialah quotation custom untuk portal, dashboard, CRM, multi-branch, automation atau sistem khas."}, {"topic": "tempoh", "triggers": ["lama", "siap", "tempoh", "berapa hari", "duration", "ready"], "answer": "Kebanyakan website boleh siap dalam 3–7 hari bekerja selepas bahan lengkap diterima. Projek custom mungkin mengambil masa lebih lama."}, {"topic": "domain", "triggers": ["domain", ".com", ".my", "nama website"], "answer": "Jika belum ada domain, RH boleh bantu setup. Jika sudah ada domain, kami boleh bantu semak DNS dan sambungkan kepada website."}, {"topic": "hosting", "triggers": ["hosting", "server", "online", "publish"], "answer": "Jika belum ada hosting, RH boleh bantu urus setup. Jika sudah ada hosting sendiri, kami akan semak kesesuaian sebelum deployment."}, {"topic": "seo", "triggers": ["seo", "google", "ranking", "search", "carian"], "answer": "Website disediakan dengan SEO asas seperti meta title, meta description, heading structure, sitemap, mobile responsive dan struktur Google-ready."}, {"topic": "contoh", "triggers": ["contoh", "demo", "portfolio", "template", "sample"], "answer": "Anda boleh lihat contoh website mengikut pakej di halaman pakej RH. Aira juga boleh cadangkan pakej selepas menjawab beberapa soalan ringkas."}, {"topic": "maintenance", "triggers": ["maintenance", "support", "jaga website", "kemaskini bulanan", "update website"], "answer": "Maintenance bergantung kepada pakej. RH Basic bermula RM79/bulan, RH Growth RM129/bulan dan RH Ecosystem RM249/bulan."}]}'::jsonb,now())
on conflict (key) do update
set value=excluded.value,
    updated_at=now();
