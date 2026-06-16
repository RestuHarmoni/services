-- RH Aira V3 Sales Consultant Engine
-- Safe migration for live services.restuharmoni.com
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

drop policy if exists "anon_upsert_aira_settings" on public.aira_settings;
create policy "anon_upsert_aira_settings"
on public.aira_settings
for insert
to anon
with check (true);

drop policy if exists "anon_update_aira_settings" on public.aira_settings;
create policy "anon_update_aira_settings"
on public.aira_settings
for update
to anon
using (true)
with check (true);

insert into public.aira_settings(key,value,updated_at)
values
('question_bank', '{"version": "v12.0-aira-v3-sales-consultant-live-base", "assistantName": "Aira", "positioning": "AI Website Sales Consultant", "intro": ["👋 Hai, saya <strong>Aira</strong>.", "Saya boleh bantu cadangkan website yang sesuai untuk bisnes anda dalam masa kurang 1 minit."], "steps": [{"key": "business_type", "question": "Apakah jenis bisnes anda?", "type": "choice", "required": true, "options": ["Servis", "Produk", "Restoran", "Event", "Hartanah", "Company Profile", "E-commerce", "Custom System", "Lain-lain"]}, {"key": "domain_status", "question": "Adakah anda sudah mempunyai domain?", "type": "choice", "required": false, "options": ["Ya", "Belum", "Tidak Pasti"]}, {"key": "hosting_status", "question": "Adakah anda sudah mempunyai hosting?", "type": "choice", "required": false, "options": ["Ya", "Belum", "Tidak Pasti"]}, {"key": "objective", "question": "Apakah objektif utama website anda?", "type": "choice", "required": true, "options": ["Dapatkan Lead", "Profil Syarikat", "Jual Produk", "Booking", "SEO Google", "Sistem / Portal Custom"]}, {"key": "budget", "question": "Budget anggaran?", "type": "choice", "required": true, "options": ["RM799 (RH Basic)", "RM1,999 (RH Growth)", "RM2,999 (RH Ecosystem)", "RM3,000+ (RH Enterprise)", "Tidak Pasti"]}, {"key": "timeline", "question": "Bila anda mahu website mula siap atau dilancarkan?", "type": "choice", "required": true, "options": ["Segera", "1–2 minggu", "Dalam 1 bulan", "Belum pasti"]}, {"key": "name", "question": "Boleh saya tahu nama anda?", "type": "input", "input": true, "placeholder": "Contoh: Ahmad", "required": true}, {"key": "phone", "question": "Nombor WhatsApp untuk team kami hubungi?", "type": "input", "input": true, "placeholder": "Contoh: 0123456789", "required": true, "validation": "phone"}], "packages": {"RH Basic": {"price": "RM799", "maintenance": "RM79/bulan", "templateCount": 1, "bestFor": ["Personal website", "Bisnes kecil", "Profil ringkas", "Landing page asas"], "features": ["Website 1–3 halaman", "Mobile responsive", "Contact/WhatsApp CTA", "SEO asas", "Struktur profile ringkas"], "templateUrl": "/pakej/rh-basic/"}, "RH Growth": {"price": "RM1999", "maintenance": "RM129/bulan", "templateCount": 10, "bestFor": ["Bisnes servis", "Lead generation", "Portfolio", "SEO asas"], "features": ["Semua RH Basic", "Multi-page website", "Service section", "Blog / Artikel", "Portfolio / Gallery", "Lead capture", "Aira assistant basic"], "templateUrl": "/pakej/rh-growth/"}, "RH Ecosystem": {"price": "RM2999", "maintenance": "RM249/bulan", "templateCount": 10, "bestFor": ["Bisnes yang mahu sistem lengkap", "AI Chatbot", "Blog CMS", "Dashboard", "Lead Management"], "features": ["Semua RH Growth", "AI Chatbot Aira", "Blog CMS", "Admin Dashboard", "Lead Management", "Quotation/Invoice ready", "Multi-section business website"], "templateUrl": "/pakej/rh-ecosystem/"}, "RH Enterprise": {"price": "Custom", "maintenance": "Ikut scope", "templateCount": 0, "bestFor": ["Portal custom", "Multi branch", "Automation", "CRM/ERP ringkas", "Integrasi sistem"], "features": ["Custom scope", "System dashboard", "Workflow automation", "Advanced integration", "Dedicated quotation"], "templateUrl": "/pakej/"}}, "serviceRecommendations": {"Servis": {"recommendedPackage": "RH Growth", "priorityObjective": ["Dapatkan Lead", "SEO Google", "Booking"]}, "Produk": {"recommendedPackage": "RH Growth", "priorityObjective": ["Jual Produk", "Dapatkan Lead"]}, "Restoran": {"recommendedPackage": "RH Growth", "priorityObjective": ["Booking", "Profil Syarikat", "Dapatkan Lead"]}, "Event": {"recommendedPackage": "RH Ecosystem", "priorityObjective": ["Booking", "Dapatkan Lead", "Profil Syarikat"]}, "Hartanah": {"recommendedPackage": "RH Growth", "priorityObjective": ["Dapatkan Lead", "Profil Syarikat"]}, "Company Profile": {"recommendedPackage": "RH Basic", "priorityObjective": ["Profil Syarikat"]}, "E-commerce": {"recommendedPackage": "RH Ecosystem", "priorityObjective": ["Jual Produk"]}, "Custom System": {"recommendedPackage": "RH Enterprise", "priorityObjective": ["Sistem / Portal Custom"]}, "Lain-lain": {"recommendedPackage": "RH Basic", "priorityObjective": ["Profil Syarikat"]}}}'::jsonb, now()),
('faq_bank', '{"version": "v12.0-aira-v3-sales-consultant-live-base", "quickActions": ["📦 Lihat Pakej", "💰 Semak Harga", "🖥️ Lihat Demo Website", "💬 Dapatkan Cadangan"], "faq": [{"topic": "harga", "triggers": ["harga", "kos", "price", "pakej", "package", "bayaran", "berapa", "lihat pakej", "semak harga"], "answer": "<strong>Pakej rasmi RH:</strong><br><br>🥉 <strong>RH Basic</strong><br>RM799 + maintenance RM79/bulan<br>Sesuai untuk personal web, bisnes kecil dan profile ringkas.<br><a class=\"rh-aira-link\" href=\"/pakej/rh-basic/\" target=\"_blank\" rel=\"noopener\">Lihat RH Basic</a><br><br>🥈 <strong>RH Growth</strong><br>RM1999 + maintenance RM129/bulan<br>Sesuai untuk bisnes servis, portfolio, blog dan lead generation.<br><a class=\"rh-aira-link\" href=\"/pakej/rh-growth/\" target=\"_blank\" rel=\"noopener\">Lihat RH Growth</a><br><br>🥇 <strong>RH Ecosystem</strong><br>RM2999 + maintenance RM249/bulan<br>Sesuai untuk AI Chatbot, Blog CMS, Dashboard dan Lead Management.<br><a class=\"rh-aira-link\" href=\"/pakej/rh-ecosystem/\" target=\"_blank\" rel=\"noopener\">Lihat RH Ecosystem</a><br><br>🏢 <strong>RH Enterprise</strong><br>Custom quotation untuk sistem/portal khas."}, {"topic": "demo", "triggers": ["demo", "contoh", "template", "lihat demo", "website contoh"], "answer": "Boleh. Anda boleh lihat contoh dan pakej website RH di halaman pakej rasmi:<br><br><a class=\"rh-aira-link\" href=\"/pakej/\" target=\"_blank\" rel=\"noopener\">Lihat pakej & demo website RH</a>"}, {"topic": "tempoh", "triggers": ["lama", "siap", "tempoh", "berapa hari", "duration", "ready"], "answer": "Kebanyakan website boleh siap dalam <strong>3–7 hari bekerja</strong> selepas bahan lengkap diterima. Projek custom mungkin mengambil masa lebih lama."}, {"topic": "domain", "triggers": ["domain", ".com", ".my", "nama website"], "answer": "Domain boleh disediakan atau dibantu setup. Jika anda belum ada domain, Aira akan rekodkan supaya team RH boleh cadangkan pilihan yang sesuai."}, {"topic": "hosting", "triggers": ["hosting", "server", "online", "publish"], "answer": "Ya, RH boleh bantu setup hosting dan publish website. Jika anda sudah ada hosting sendiri, team RH boleh semak dahulu kesesuaiannya."}, {"topic": "seo", "triggers": ["seo", "google", "ranking", "search", "carian"], "answer": "Website disediakan dengan <strong>SEO asas</strong>: meta title, meta description, struktur heading, sitemap dan mobile responsive. Artikel blog boleh ditambah untuk SEO berterusan."}, {"topic": "maintenance", "triggers": ["maintenance", "support", "bulanan", "update", "kemaskini"], "answer": "Maintenance bergantung pakej: RH Basic RM79/bulan, RH Growth RM129/bulan, RH Ecosystem RM249/bulan. Ia meliputi sokongan asas dan kemaskini yang dipersetujui."}, {"topic": "facebook", "triggers": ["facebook", "fb", "page", "website atau facebook"], "answer": "Facebook Page sesuai untuk engagement, tetapi website lebih kuat sebagai portfolio rasmi, SEO Google dan pusat lead capture. Yang terbaik ialah gunakan kedua-duanya bersama."}]}'::jsonb, now())
on conflict (key) do update
set value=excluded.value,
    updated_at=now();
