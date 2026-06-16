-- RH Services v1.3.5 Article Recovery Seed & SEO Restore
-- Base: services-main-update-v1.3.4-mobile-card-tables-all-admin.zip
-- Scope: Articles/Blog only.
-- Safe migration: no DROP TABLE, no DELETE DATA.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  category text default 'Website',
  status text default 'draft',
  content text,
  cover_image text,
  meta_title text,
  meta_description text,
  seo_title text,
  seo_description text,
  focus_keyword text,
  excerpt text,
  author text default 'RH Admin',
  is_featured boolean default false,
  featured boolean default false,
  views integer default 0,
  view_count integer default 0,
  published_at timestamptz,
  is_deleted boolean default false,
  deleted_at timestamptz,
  deleted_by text,
  delete_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts
  add column if not exists category text default 'Website',
  add column if not exists status text default 'draft',
  add column if not exists content text,
  add column if not exists cover_image text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists focus_keyword text,
  add column if not exists excerpt text,
  add column if not exists author text default 'RH Admin',
  add column if not exists is_featured boolean default false,
  add column if not exists featured boolean default false,
  add column if not exists views integer default 0,
  add column if not exists view_count integer default 0,
  add column if not exists published_at timestamptz,
  add column if not exists is_deleted boolean default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by text,
  add column if not exists delete_reason text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists blog_posts_slug_unique_idx on public.blog_posts(slug) where slug is not null;
create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index if not exists blog_posts_deleted_idx on public.blog_posts(is_deleted, deleted_at);

alter table public.blog_posts enable row level security;

drop policy if exists "public_read_published_blog_posts" on public.blog_posts;
create policy "public_read_published_blog_posts"
on public.blog_posts
for select
to anon
using (
  coalesce(is_deleted,false) = false
  and deleted_at is null
  and status = 'published'
);

drop policy if exists "admin_select_blog_posts_beta" on public.blog_posts;
create policy "admin_select_blog_posts_beta"
on public.blog_posts
for select
to anon
using (true);

drop policy if exists "admin_insert_blog_posts_beta" on public.blog_posts;
create policy "admin_insert_blog_posts_beta"
on public.blog_posts
for insert
to anon
with check (true);

drop policy if exists "admin_update_blog_posts_beta" on public.blog_posts;
create policy "admin_update_blog_posts_beta"
on public.blog_posts
for update
to anon
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/jpg'])
on conflict (id) do update set public = true;

drop policy if exists "public_read_blog_images" on storage.objects;
create policy "public_read_blog_images"
on storage.objects
for select
to anon
using (bucket_id = 'blog-images');

drop policy if exists "admin_insert_blog_images_beta" on storage.objects;
create policy "admin_insert_blog_images_beta"
on storage.objects
for insert
to anon
with check (bucket_id = 'blog-images');

drop policy if exists "admin_update_blog_images_beta" on storage.objects;
create policy "admin_update_blog_images_beta"
on storage.objects
for update
to anon
using (bucket_id = 'blog-images')
with check (bucket_id = 'blog-images');

insert into public.blog_posts
(title, slug, category, status, content, cover_image, meta_title, meta_description, seo_title, seo_description, focus_keyword, excerpt, author, is_featured, featured, published_at, created_at, updated_at)
values
('Kenapa Bisnes Perlu Website','kenapa-bisnes-perlu-website','Website','published','Pernah tak orang tanya tentang bisnes anda, tapi bila mereka cari di Google, mereka hanya jumpa Facebook atau tiada maklumat lengkap?

Dalam dunia bisnes sekarang, website bukan sekadar tempat letak profile. Website ialah pusat kepercayaan digital. Pelanggan boleh lihat servis, harga, testimoni, kawasan servis dan cara hubungi anda dalam satu tempat yang tersusun.

## Website Membina Kepercayaan

Apabila bisnes ada website sendiri, pelanggan nampak anda lebih serius. Mereka boleh semak maklumat pada bila-bila masa tanpa perlu tunggu balasan mesej.

Website juga membantu nampakkan bisnes lebih profesional berbanding hanya bergantung kepada media sosial.

## Mudah Dicari Di Google

Ramai pelanggan mencari servis melalui Google. Jika website anda mempunyai struktur SEO asas, halaman servis, artikel dan Google Business Profile yang lengkap, peluang untuk muncul dalam carian lebih baik.

## Sistem Lead Lebih Tersusun

Website boleh disambungkan dengan borang, WhatsApp, chatbot AI dan dashboard lead. Ini membantu pemilik bisnes susun pertanyaan pelanggan dengan lebih kemas.

## Kesimpulan

Jika anda mahu bisnes nampak dipercayai, mudah dicari dan mudah dihubungi, website ialah aset digital yang sangat penting.','https://services.restuharmoni.com/assets/rh-logo.png','Kenapa Bisnes Perlu Website','Ketahui kenapa website penting untuk bisnes kecil supaya pelanggan lebih mudah percaya, mudah cari di Google dan mudah hubungi anda.','Kenapa Bisnes Perlu Website','Ketahui kenapa website penting untuk bisnes kecil supaya pelanggan lebih mudah percaya, mudah cari di Google dan mudah hubungi anda.','bisnes perlu website','Ketahui kenapa website penting untuk bisnes kecil supaya pelanggan lebih mudah percaya, mudah cari di Google dan mudah hubungi anda.','Restu Harmoni Digital Solutions',true,true, now() - interval '10 days', now() - interval '10 days', now()),
('Website vs Facebook Page Untuk Bisnes','website-vs-facebook-page-untuk-bisnes','Digital Marketing','published','Ramai pemilik bisnes bertanya, “Kalau sudah ada Facebook Page, perlu lagi ke website?” Jawapannya, kedua-duanya ada fungsi berbeza.

Facebook Page bagus untuk engagement, posting harian dan bina komuniti. Tetapi website lebih sesuai sebagai pusat maklumat rasmi bisnes.

## Facebook Page Bergantung Kepada Platform

Apabila guna Facebook, paparan post bergantung kepada algoritma. Tidak semua follower akan nampak post anda.

Jika akaun bermasalah atau page disekat, bisnes boleh terjejas kerana anda tidak kawal sepenuhnya platform tersebut.

## Website Milik Bisnes Anda

Website ialah aset sendiri. Anda boleh susun servis, harga, testimoni, FAQ, artikel dan borang lead ikut strategi bisnes sendiri.

Pelanggan juga lebih mudah mencari maklumat melalui Google jika website dioptimumkan dengan SEO asas.

## Gabungan Terbaik

Strategi terbaik bukan pilih salah satu. Gunakan Facebook untuk tarik perhatian, kemudian bawa pelanggan ke website untuk bina kepercayaan dan dapatkan lead.

## Kesimpulan

Facebook Page bagus untuk pemasaran sosial. Website pula bagus untuk credibility, Google visibility dan sistem lead yang lebih tersusun.','https://services.restuharmoni.com/assets/rh-logo.png','Website vs Facebook Page Untuk Bisnes','Perbandingan ringkas antara website dan Facebook Page untuk bantu pemilik bisnes faham fungsi sebenar setiap platform.','Website vs Facebook Page Untuk Bisnes','Perbandingan ringkas antara website dan Facebook Page untuk bantu pemilik bisnes faham fungsi sebenar setiap platform.','website vs facebook page','Perbandingan ringkas antara website dan Facebook Page untuk bantu pemilik bisnes faham fungsi sebenar setiap platform.','Restu Harmoni Digital Solutions',true,true, now() - interval '9 days', now() - interval '9 days', now()),
('Cara Buat Website Untuk Bisnes Kecil Di Malaysia','cara-buat-website-untuk-bisnes-kecil-di-malaysia','Website','published','Nak buat website untuk bisnes kecil tidak semestinya perlu bermula dengan sistem yang terlalu kompleks. Yang penting ialah struktur website jelas dan pelanggan mudah faham apa yang anda tawarkan.

## Kenal Pasti Tujuan Website

Sebelum buat website, tentukan objektif utama. Adakah anda mahu dapat lead WhatsApp, bina portfolio, terima booking, jual produk atau paparkan servis?

Objektif ini akan menentukan susunan halaman dan fungsi yang diperlukan.

## Sediakan Maklumat Asas Bisnes

Antara maklumat penting ialah nama bisnes, servis utama, kawasan servis, gambar kerja, testimoni, soalan lazim dan cara pelanggan boleh hubungi anda.

Maklumat yang lengkap mempercepatkan proses pembangunan website.

## Pilih Struktur Website Yang Sesuai

Untuk bisnes servis, struktur asas biasanya merangkumi homepage, halaman servis, portfolio, testimoni, FAQ dan contact.

Jika mahu artikel SEO, tambah bahagian blog supaya website boleh berkembang dari masa ke masa.

## Kesimpulan

Website yang baik bukan hanya cantik. Ia mesti jelas, mobile-friendly, cepat dibuka dan membantu pelanggan membuat keputusan untuk menghubungi anda.','https://services.restuharmoni.com/assets/rh-logo.png','Cara Buat Website Untuk Bisnes Kecil Di Malaysia','Panduan asas untuk pemilik bisnes kecil di Malaysia yang mahu mula membina website profesional.','Cara Buat Website Untuk Bisnes Kecil Di Malaysia','Panduan asas untuk pemilik bisnes kecil di Malaysia yang mahu mula membina website profesional.','cara buat website','Panduan asas untuk pemilik bisnes kecil di Malaysia yang mahu mula membina website profesional.','Restu Harmoni Digital Solutions',true,true, now() - interval '8 days', now() - interval '8 days', now()),
('Website Sebagai Portfolio Digital Ejen Hartanah','website-sebagai-portfolio-digital-ejen-hartanah','Website','published','Pernah tak anda bantu orang cari rumah idaman mereka, tetapi bila bakal pelanggan cari nama anda di Google, maklumat yang keluar tidak lengkap?

Untuk ejen hartanah, website boleh bertindak sebagai portfolio digital yang sentiasa aktif 24 jam.

## Paparkan Profil Profesional

Website membolehkan ejen memaparkan pengalaman, kawasan kepakaran, jenis hartanah yang biasa diurus dan cara untuk berhubung.

Ini membantu pelanggan rasa lebih yakin sebelum membuat panggilan atau WhatsApp.

## Senarai Hartanah Lebih Tersusun

Dengan website, ejen boleh memaparkan rumah, tanah, kedai atau hartanah komersial dalam satu tempat yang mudah dilihat.

Setiap listing boleh ada gambar, lokasi, harga, butiran dan butang WhatsApp.

## Bantu Carian Google

Artikel seperti tips beli rumah, proses pinjaman dan panduan jual rumah boleh membantu website mendapat trafik daripada Google.

## Kesimpulan

Website menjadikan ejen hartanah nampak lebih profesional dan memudahkan pelanggan menilai servis anda sebelum berhubung.','https://services.restuharmoni.com/assets/rh-logo.png','Website Sebagai Portfolio Digital Ejen Hartanah','Kenapa ejen hartanah memerlukan website sebagai portfolio digital untuk membina kredibiliti dan menarik pelanggan.','Website Sebagai Portfolio Digital Ejen Hartanah','Kenapa ejen hartanah memerlukan website sebagai portfolio digital untuk membina kredibiliti dan menarik pelanggan.','website ejen hartanah','Kenapa ejen hartanah memerlukan website sebagai portfolio digital untuk membina kredibiliti dan menarik pelanggan.','Restu Harmoni Digital Solutions',false,false, now() - interval '7 days', now() - interval '7 days', now()),
('Google Business Profile Untuk PMKS','google-business-profile-untuk-pmks','Google Business','published','Google Business Profile ialah salah satu aset digital paling penting untuk bisnes tempatan. Apabila pelanggan mencari servis berdekatan, profil Google boleh membantu bisnes anda muncul dalam carian dan peta.

## Pelanggan Mudah Cari Lokasi Dan Maklumat

Dengan profil yang lengkap, pelanggan boleh nampak nama bisnes, waktu operasi, alamat, gambar, review dan link website.

Ini memudahkan mereka membuat keputusan dengan lebih cepat.

## Review Membina Kepercayaan

Review pelanggan memainkan peranan besar. Bisnes yang mempunyai review baik biasanya lebih mudah dipercayai berbanding profil yang kosong.

## Website Menguatkan Google Business

Apabila Google Business disambungkan dengan website, pelanggan boleh baca maklumat lebih lengkap tentang servis anda.

Website juga membantu Google memahami bisnes anda dengan lebih baik.

## Kesimpulan

PMKS yang mahu dapat pelanggan lokal perlu gabungkan Google Business Profile, website dan kandungan yang konsisten.','https://services.restuharmoni.com/assets/rh-logo.png','Google Business Profile Untuk PMKS','Panduan ringkas kenapa Google Business Profile penting untuk PMKS dan bagaimana ia membantu pelanggan tempatan mencari bisnes anda.','Google Business Profile Untuk PMKS','Panduan ringkas kenapa Google Business Profile penting untuk PMKS dan bagaimana ia membantu pelanggan tempatan mencari bisnes anda.','Google Business Profile PMKS','Panduan ringkas kenapa Google Business Profile penting untuk PMKS dan bagaimana ia membantu pelanggan tempatan mencari bisnes anda.','Restu Harmoni Digital Solutions',false,false, now() - interval '6 days', now() - interval '6 days', now()),
('SEO Lokal: Cara Mudah Dapat Pelanggan Dari Google','seo-lokal-cara-mudah-dapat-pelanggan-dari-google','SEO','published','SEO lokal ialah strategi supaya bisnes anda lebih mudah dijumpai apabila pelanggan mencari servis di kawasan tertentu.

Contohnya, pelanggan mungkin mencari “servis aircond Rawang” atau “buat website murah Selangor”. Jika website anda mempunyai struktur yang betul, peluang untuk ditemui lebih tinggi.

## Gunakan Keyword Kawasan

Masukkan kawasan servis dalam halaman website. Contohnya Selangor, Kuala Lumpur, Rawang, Shah Alam atau kawasan yang anda sasarkan.

Jangan spam keyword. Gunakan secara semula jadi dalam tajuk, penerangan dan kandungan.

## Buat Halaman Servis Yang Jelas

Setiap servis utama sebaiknya mempunyai halaman sendiri. Ini membantu Google faham topik halaman tersebut.

## Tulis Artikel Yang Menjawab Soalan Pelanggan

Artikel seperti harga, proses kerja, tips dan checklist boleh menarik trafik yang lebih berkualiti.

## Kesimpulan

SEO lokal membantu bisnes mendapat pelanggan yang memang sedang mencari servis anda. Ia perlukan struktur website, kandungan berkualiti dan konsisten.','https://services.restuharmoni.com/assets/rh-logo.png','SEO Lokal: Cara Mudah Dapat Pelanggan Dari Google','Ketahui asas SEO lokal untuk bantu bisnes servis muncul apabila pelanggan mencari servis di kawasan mereka.','SEO Lokal: Cara Mudah Dapat Pelanggan Dari Google','Ketahui asas SEO lokal untuk bantu bisnes servis muncul apabila pelanggan mencari servis di kawasan mereka.','SEO lokal','Ketahui asas SEO lokal untuk bantu bisnes servis muncul apabila pelanggan mencari servis di kawasan mereka.','Restu Harmoni Digital Solutions',false,false, now() - interval '5 days', now() - interval '5 days', now()),
('5 Tanda Bisnes Anda Perlukan Website','5-tanda-bisnes-anda-perlukan-website','Website','published','Tidak semua bisnes perlu website yang kompleks, tetapi hampir semua bisnes memerlukan tempat rasmi untuk pelanggan mendapatkan maklumat.

Berikut ialah tanda bisnes anda sudah perlukan website.

## 1. Pelanggan Selalu Tanya Soalan Sama

Jika pelanggan kerap tanya harga, servis, lokasi, proses dan contoh kerja, website boleh menjawab soalan ini secara automatik.

## 2. Anda Mahu Nampak Lebih Profesional

Website membantu membina imej bisnes yang lebih dipercayai.

## 3. Anda Mahu Dapat Lead Dari Google

Jika pelanggan mencari servis anda di Google, website memberi peluang untuk muncul dalam carian.

## 4. Anda Ada Banyak Portfolio

Gambar projek, testimoni dan hasil kerja lebih mudah disusun dalam website.

## 5. Anda Mahu Sistem Lead Lebih Kemas

Website boleh digabungkan dengan borang, WhatsApp dan AI chatbot supaya pertanyaan pelanggan tidak bersepah.

## Kesimpulan

Jika bisnes anda semakin berkembang, website boleh membantu operasi pemasaran menjadi lebih tersusun.','https://services.restuharmoni.com/assets/rh-logo.png','5 Tanda Bisnes Anda Perlukan Website','Lima tanda jelas bahawa bisnes anda sudah bersedia untuk mempunyai website sendiri.','5 Tanda Bisnes Anda Perlukan Website','Lima tanda jelas bahawa bisnes anda sudah bersedia untuk mempunyai website sendiri.','tanda bisnes perlukan website','Lima tanda jelas bahawa bisnes anda sudah bersedia untuk mempunyai website sendiri.','Restu Harmoni Digital Solutions',false,false, now() - interval '4 days', now() - interval '4 days', now()),
('Kesilapan PMKS Yang Bergantung 100% Pada Media Sosial','kesilapan-pmks-bergantung-100-kepada-media-sosial','Digital Marketing','published','Media sosial memang penting untuk bisnes. Tetapi bergantung 100% kepada media sosial boleh menjadi risiko besar.

Algoritma berubah, reach boleh menurun dan akaun boleh bermasalah. Jika tiada website, pelanggan mungkin sukar mencari maklumat rasmi tentang bisnes anda.

## Risiko Bergantung Kepada Platform Orang Lain

Anda tidak mengawal sepenuhnya platform media sosial. Peraturan dan algoritma boleh berubah bila-bila masa.

## Maklumat Mudah Tenggelam

Post lama sukar dicari. Pelanggan perlu scroll untuk mencari maklumat penting seperti servis, harga dan testimoni.

## Website Sebagai Pusat Maklumat

Website membantu menyusun maklumat bisnes dalam format yang lebih kekal dan mudah dicari.

## Kesimpulan

Media sosial bagus untuk tarik perhatian. Website pula penting sebagai aset rasmi yang membina kepercayaan dan menyimpan maklumat bisnes dengan lebih tersusun.','https://services.restuharmoni.com/assets/rh-logo.png','Kesilapan PMKS Yang Bergantung 100% Pada Media Sosial','Kenapa PMKS tidak patut bergantung sepenuhnya kepada media sosial dan perlu bina aset digital sendiri.','Kesilapan PMKS Yang Bergantung 100% Pada Media Sosial','Kenapa PMKS tidak patut bergantung sepenuhnya kepada media sosial dan perlu bina aset digital sendiri.','PMKS media sosial','Kenapa PMKS tidak patut bergantung sepenuhnya kepada media sosial dan perlu bina aset digital sendiri.','Restu Harmoni Digital Solutions',false,false, now() - interval '3 days', now() - interval '3 days', now()),
('Bagaimana AI Chatbot Membantu Menjawab Pelanggan 24/7','bagaimana-ai-chatbot-membantu-menjawab-pelanggan-24-7','AI Chatbot','published','Ramai pelanggan bertanya di luar waktu kerja. Jika tiada siapa membalas, peluang jualan boleh hilang.

AI chatbot membantu menjawab soalan asas pelanggan secara automatik dan mengumpul maklumat penting sebelum owner membuat follow up.

## Jawab Soalan Lazim Dengan Cepat

Chatbot boleh menjawab soalan seperti harga, servis, kawasan operasi, tempoh siap dan pakej yang sesuai.

## Kumpul Lead Secara Tersusun

Selain menjawab, chatbot boleh bertanya nama, nombor telefon, jenis bisnes, budget dan timeline.

Maklumat ini boleh terus masuk ke dashboard admin.

## Bantu Sales Follow Up

Apabila data lead tersusun, owner boleh follow up pelanggan dengan lebih tepat.

## Kesimpulan

AI chatbot bukan pengganti manusia sepenuhnya. Ia membantu proses awal supaya bisnes tidak terlepas pertanyaan penting.','https://services.restuharmoni.com/assets/rh-logo.png','Bagaimana AI Chatbot Membantu Menjawab Pelanggan 24/7','AI chatbot boleh membantu pemilik bisnes menjawab soalan asas pelanggan, menapis lead dan mengurangkan kehilangan peluang jualan.','Bagaimana AI Chatbot Membantu Menjawab Pelanggan 24/7','AI chatbot boleh membantu pemilik bisnes menjawab soalan asas pelanggan, menapis lead dan mengurangkan kehilangan peluang jualan.','AI chatbot bisnes','AI chatbot boleh membantu pemilik bisnes menjawab soalan asas pelanggan, menapis lead dan mengurangkan kehilangan peluang jualan.','Restu Harmoni Digital Solutions',false,false, now() - interval '2 days', now() - interval '2 days', now()),
('Kos Sebenar Membina Website Untuk Bisnes Di Malaysia','kos-sebenar-membina-website-untuk-bisnes-di-malaysia','Website','published','Kos membina website bergantung kepada jenis website, jumlah halaman, fungsi yang diperlukan dan tahap maintenance selepas siap.

Ada website ringkas untuk profile syarikat. Ada juga website yang memerlukan dashboard, sistem lead, blog, booking atau integrasi khas.

## Komponen Kos Website

Kos biasanya merangkumi reka bentuk, pembangunan, domain, hosting, SSL, setup SEO asas, borang contact dan integrasi WhatsApp.

Jika ada AI chatbot, dashboard atau sistem admin, kos akan lebih tinggi kerana fungsi lebih kompleks.

## Maintenance Bulanan

Maintenance penting untuk memastikan website dipantau, dikemaskini dan dibantu jika ada isu teknikal kecil.

## Jangan Pilih Berdasarkan Harga Sahaja

Website murah tidak semestinya salah, tetapi pastikan ia mobile-friendly, kemas, boleh diurus dan sesuai dengan objektif bisnes.

## Kesimpulan

Kos website yang baik perlu dilihat sebagai pelaburan digital, bukan sekadar belanja design. Yang penting ialah website tersebut membantu pelanggan faham dan menghubungi bisnes anda.','https://services.restuharmoni.com/assets/rh-logo.png','Kos Sebenar Membina Website Untuk Bisnes Di Malaysia','Fahami komponen kos membina website seperti design, domain, hosting, maintenance, SEO asas dan fungsi tambahan.','Kos Sebenar Membina Website Untuk Bisnes Di Malaysia','Fahami komponen kos membina website seperti design, domain, hosting, maintenance, SEO asas dan fungsi tambahan.','kos website Malaysia','Fahami komponen kos membina website seperti design, domain, hosting, maintenance, SEO asas dan fungsi tambahan.','Restu Harmoni Digital Solutions',false,false, now() - interval '1 days', now() - interval '1 days', now())
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  status = excluded.status,
  content = excluded.content,
  cover_image = excluded.cover_image,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  focus_keyword = excluded.focus_keyword,
  excerpt = excluded.excerpt,
  author = excluded.author,
  is_featured = excluded.is_featured,
  featured = excluded.featured,
  published_at = excluded.published_at,
  is_deleted = false,
  deleted_at = null,
  deleted_by = null,
  delete_reason = null,
  updated_at = now();
