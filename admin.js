
const DEFAULT_SITE = {"promo": {"enabled": true, "title": "🔥 Promo Website — 35% OFF Semua Pakej", "subtitle": "Starter RM699 • Business RM1,299 ⭐ Paling Popular • Premium RM1,999+ — promo tamat dalam 42 jam.", "cta": "Lihat Pakej Promo", "hours": 42}, "hero": {"headline": "Website Profesional Untuk Bisnes Anda", "subheadline": "Bina website yang nampak kemas, mudah difahami pelanggan dan terus bawa pertanyaan ke WhatsApp.", "ctaPrimary": "Tanya Aira", "ctaSecondary": "Lihat Contoh Website"}, "showcase": {"title": "Website Untuk Pelbagai Jenis Bisnes", "subtitle": "Lihat contoh website yang disusun lengkap dengan servis, gambar, testimoni dan butang WhatsApp."}, "contact": {"phone": "", "email": "sales@restuharmoni.com"}};
const DEFAULT_TEMPLATES = {"kedai-makan": {"name": "Warung Kak Siti", "industry": "Kedai Makan", "headline": "Masakan Kampung Panas-Panas Setiap Hari", "subheadline": "Menu harian, tempahan lauk dan catering kecil terus melalui WhatsApp.", "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80", "color": "#dc2626", "services": ["Menu Harian", "Tempahan Catering", "Set Nasi Berlauk", "Lokasi Google Maps"], "products": [{"title": "Nasi Ayam Special", "price": "RM8.90", "desc": "Set lengkap dengan sup dan sambal."}, {"title": "Ikan Bakar", "price": "RM15+", "desc": "Pilihan ikan segar ikut stok harian."}, {"title": "Set Keluarga", "price": "RM39+", "desc": "Sesuai untuk 4-5 orang."}], "testimonial": "Makanan sedap, mudah tengok menu dan terus WhatsApp untuk tempahan.", "cta": "Mula Dengan Aira"}, "homestay": {"name": "AZ Homestay Langkawi", "industry": "Homestay", "headline": "Penginapan Selesa Untuk Keluarga", "subheadline": "Lihat bilik, kemudahan, lokasi dan semak tarikh kosong terus melalui WhatsApp.", "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80", "color": "#059669", "services": ["Galeri Bilik", "Harga Penginapan", "Kemudahan Keluarga", "Booking melalui Aira"], "products": [{"title": "Bilik Keluarga", "price": "RM180/malam", "desc": "Sesuai untuk keluarga kecil."}, {"title": "Pakej Hujung Minggu", "price": "RM350+", "desc": "2 hari 1 malam, tertakluk tarikh kosong."}, {"title": "Kemudahan", "price": "Percuma", "desc": "Parking, WiFi dan ruang santai."}], "testimonial": "Senang semak info homestay dan terus booking melalui WhatsApp.", "cta": "Semak Tarikh Kosong"}, "kereta-sewa": {"name": "Maju Car Rental", "industry": "Kereta Sewa", "headline": "Kereta Sewa Harian & Bulanan", "subheadline": "Pilih kereta, semak harga dan booking pickup melalui WhatsApp.", "image": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80", "color": "#0f766e", "services": ["Kereta Ekonomi", "MPV Keluarga", "Pickup Airport", "Sewa Harian/Bulanan"], "products": [{"title": "Perodua Axia", "price": "RM90/hari", "desc": "Jimat minyak untuk kegunaan bandar."}, {"title": "Perodua Bezza", "price": "RM120/hari", "desc": "Sesuai untuk kerja dan keluarga kecil."}, {"title": "Perodua Alza", "price": "RM180/hari", "desc": "MPV untuk keluarga dan trip jauh."}], "testimonial": "Mudah tengok pilihan kereta dan terus buat tempahan.", "cta": "Booking Kereta"}, "aircond": {"name": "Dingin Aircond Services", "industry": "Servis Aircond", "headline": "Cuci, Repair & Install Aircond", "subheadline": "Servis aircond rumah dan pejabat dengan temujanji melalui WhatsApp.", "image": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=80", "color": "#2563eb", "services": ["Cuci Aircond", "Repair Aircond", "Install Aircond", "Maintenance Berkala"], "products": [{"title": "Cuci Aircond", "price": "RM80+", "desc": "Cuci indoor dan outdoor unit."}, {"title": "Repair Aircond", "price": "Quotation", "desc": "Troubleshoot masalah tidak sejuk/bocor."}, {"title": "Install Aircond", "price": "RM250+", "desc": "Pemasangan unit baru mengikut lokasi."}], "testimonial": "Website jelas tunjuk servis dan memudahkan pelanggan booking.", "cta": "Tempah Servis"}, "renovation": {"name": "Bina Reka Renovation", "industry": "Renovation / Contractor", "headline": "Kontraktor Renovation Rumah & Premis", "subheadline": "Paparkan portfolio projek, servis dan permintaan quotation secara tersusun.", "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80", "color": "#ea580c", "services": ["Renovation Rumah", "Kitchen Cabinet", "Extension Rumah", "Kerja Plaster Ceiling"], "products": [{"title": "Renovation Rumah", "price": "Quotation", "desc": "Kerja ubahsuai mengikut bajet dan scope."}, {"title": "Kitchen Cabinet", "price": "RM3,000+", "desc": "Design dan pemasangan kabinet dapur."}, {"title": "Extension Rumah", "price": "Site Visit", "desc": "Perlu semakan tapak untuk anggaran tepat."}], "testimonial": "Portfolio lebih mudah dilihat dan pelanggan senang minta quotation.", "cta": "Mula Dengan Aira"}, "butik": {"name": "Alya Boutique", "industry": "Butik / Fashion", "headline": "Koleksi Fashion Eksklusif Untuk Setiap Gaya", "subheadline": "Paparkan katalog, promosi dan order WhatsApp dengan lebih profesional.", "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80", "color": "#be185d", "services": ["Katalog Produk", "Promosi Musim", "Panduan Saiz", "Order melalui Aira"], "products": [{"title": "Kurung Modern", "price": "RM129+", "desc": "Rekaan kemas untuk kerja dan majlis."}, {"title": "Blouse Premium", "price": "RM79+", "desc": "Material selesa dan mudah digayakan."}, {"title": "Set Raya", "price": "RM159+", "desc": "Koleksi promosi mengikut musim."}], "testimonial": "Katalog nampak kemas dan pelanggan mudah pilih sebelum WhatsApp.", "cta": "Lihat Koleksi"}, "corporate": {"name": "Maju Jaya Holdings", "industry": "Company Profile", "headline": "Profil Syarikat Profesional & Meyakinkan", "subheadline": "Perkenalkan syarikat, servis, pengalaman dan cara hubungi dalam satu laman kemas.", "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80", "color": "#1d4ed8", "services": ["Profil Syarikat", "Servis Utama", "Portfolio", "Contact Page"], "products": [{"title": "Company Profile", "price": "Lengkap", "desc": "Pengenalan, visi, servis dan kekuatan syarikat."}, {"title": "Portfolio", "price": "Tersusun", "desc": "Paparan projek atau pengalaman kerja."}, {"title": "Contact", "price": "Mudah", "desc": "Butang WhatsApp, email dan lokasi."}], "testimonial": "Website nampak lebih korporat dan sesuai untuk rujukan pelanggan.", "cta": "Hubungi Syarikat"}, "produk-online": {"name": "Sihat Natura", "industry": "Produk Online", "headline": "Jual Produk Dengan Lebih Profesional", "subheadline": "Showcase produk, manfaat, testimoni dan order WhatsApp tanpa sistem rumit.", "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=80", "color": "#7c3aed", "services": ["Produk Pilihan", "Harga & Promosi", "Testimoni", "Order melalui Aira"], "products": [{"title": "Produk Utama", "price": "RM59+", "desc": "Paparkan manfaat dan cara guna."}, {"title": "Set Promosi", "price": "RM99+", "desc": "Bundle untuk tingkatkan nilai order."}, {"title": "Testimoni", "price": "Trust", "desc": "Bina keyakinan sebelum pelanggan membeli."}], "testimonial": "Lebih mudah terangkan produk dan terima order melalui WhatsApp.", "cta": "Order Sekarang"}};
(async()=>{await window.RH_ADMIN_AUTH.requireAdmin();})();

const $=id=>document.getElementById(id);
let site = JSON.parse(localStorage.getItem('rh_site_content')||'null') || DEFAULT_SITE;
let templates = JSON.parse(localStorage.getItem('rh_templates_data')||'null') || DEFAULT_TEMPLATES;

document.getElementById('logout').onclick=()=>window.RH_ADMIN_AUTH.signOut();

document.querySelectorAll('.side button[data-tab]').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.side button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
 ['dashboard','site','templates','blog','export'].forEach(t=>{const el=$('tab-'+t); if(el) el.style.display=(btn.dataset.tab===t?'block':'none');});
 if(btn.dataset.tab==='export') refreshExport(); if(btn.dataset.tab==='blog' && window.RH_BLOG_ADMIN){window.RH_BLOG_ADMIN.refreshPosts();}
});

function loadSite(){
 $('promoTitle').value=site.promo.title||'';
 $('promoSubtitle').value=site.promo.subtitle||'';
 $('promoCta').value=site.promo.cta||'';
 $('promoHours').value=site.promo.hours||42;
 $('heroHeadline').value=site.hero.headline||'';
 $('heroSub').value=site.hero.subheadline||'';
 $('heroCta').value=site.hero.ctaPrimary||'';
 $('showcaseTitle').value=site.showcase.title||'';
 $('showcaseSubtitle').value=site.showcase.subtitle||'';
}
$('saveSite').onclick=()=>{
 site.promo.title=$('promoTitle').value; site.promo.subtitle=$('promoSubtitle').value; site.promo.cta=$('promoCta').value; site.promo.hours=Number($('promoHours').value||42);
 site.hero.headline=$('heroHeadline').value; site.hero.subheadline=$('heroSub').value; site.hero.ctaPrimary=$('heroCta').value;
 site.showcase.title=$('showcaseTitle').value; site.showcase.subtitle=$('showcaseSubtitle').value;
 localStorage.setItem('rh_site_content',JSON.stringify(site)); alert('Services page disimpan dalam browser admin.');
};
$('resetSite').onclick=()=>{site=structuredClone(DEFAULT_SITE);localStorage.setItem('rh_site_content',JSON.stringify(site));loadSite();};

function fillSelect(){
 $('tplSelect').innerHTML=Object.entries(templates).map(([k,v])=>`<option value="${k}">${v.industry} - ${v.name}</option>`).join('');
}
function loadTpl(){
 const k=$('tplSelect').value; const t=templates[k]; if(!t)return;
 $('tplColor').value=t.color||'#2563eb'; $('tplName').value=t.name||''; $('tplIndustry').value=t.industry||''; $('tplHeadline').value=t.headline||''; $('tplSub').value=t.subheadline||''; $('tplImage').value=t.image||''; $('tplServices').value=(t.services||[]).join('\n'); $('tplProducts').value=(t.products||[]).map(p=>`${p.title} | ${p.price} | ${p.desc}`).join('\n'); $('tplTestimonial').value=t.testimonial||''; $('tplCta').value=t.cta||'';
 $('imgPreview').style.backgroundImage=`url("${t.image}")`;
 $('previewTpl').href=`templates/${k}.html?company=${encodeURIComponent(t.name)}`;
}
$('tplSelect').onchange=loadTpl; $('tplImage').oninput=()=>$('imgPreview').style.backgroundImage=`url("${$('tplImage').value}")`;
$('saveTpl').onclick=()=>{
 const k=$('tplSelect').value;
 templates[k]={...templates[k], color:$('tplColor').value, name:$('tplName').value, industry:$('tplIndustry').value, headline:$('tplHeadline').value, subheadline:$('tplSub').value, image:$('tplImage').value, services:$('tplServices').value.split('\n').map(x=>x.trim()).filter(Boolean), products:$('tplProducts').value.split('\n').map(line=>{const [title='',price='',desc='']=line.split('|').map(x=>x.trim());return {title,price,desc}}).filter(p=>p.title), testimonial:$('tplTestimonial').value, cta:$('tplCta').value};
 localStorage.setItem('rh_templates_data',JSON.stringify(templates)); loadTpl(); alert('Template disimpan dalam browser admin.');
};
$('resetTpl').onclick=()=>{const k=$('tplSelect').value; templates[k]=structuredClone(DEFAULT_TEMPLATES[k]); localStorage.setItem('rh_templates_data',JSON.stringify(templates));loadTpl();};

function refreshExport(){ $('exportSite').value=JSON.stringify(site,null,2); $('exportTemplates').value=JSON.stringify(templates,null,2); }
$('refreshExport').onclick=refreshExport;
$('clearAll').onclick=()=>{if(confirm('Padam semua local changes?')){localStorage.removeItem('rh_site_content');localStorage.removeItem('rh_templates_data');site=structuredClone(DEFAULT_SITE);templates=structuredClone(DEFAULT_TEMPLATES);loadSite();fillSelect();loadTpl();refreshExport();}};

loadSite(); fillSelect(); loadTpl();


document.querySelectorAll('[data-jump-blog]').forEach(btn=>btn.addEventListener('click',()=>{const b=document.querySelector('.side button[data-tab=\"blog\"]'); if(b) b.click(); if(window.RH_BLOG_ADMIN) window.RH_BLOG_ADMIN.newPost();}));
