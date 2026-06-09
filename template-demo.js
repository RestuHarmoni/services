
(function(){
  const params = new URLSearchParams(location.search);
  const slug = document.body.dataset.template || 'RH_Basic_Classic';
  const fallbackImages = {
    "RH_Basic_01_Classic_Service": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_02_Modern_Split": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_03_WhatsApp_CTA": "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_04_Compact_Profile": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_05_Local_Business": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_06_Clean_Cards": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_07_Bold_Hero": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_08_Service_Menu": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_09_Mini_Portfolio": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
    "RH_Basic_10_Starter_Brand": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_01_Corporate_Profile": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_02_Homestay_Booking": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_03_Car_Rental": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_04_Restaurant_Menu": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_05_Boutique_Catalog": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_06_Product_Online": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_07_Renovation_Grid": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_08_Education_Course": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_09_Event_Planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    "RH_Standard_10_Interior_Design": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_01_Lead_Generation": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_02_Consultant": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_03_Clinic": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_04_Dental": "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_05_Law_Firm": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_06_Accounting": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_07_Property_Agent": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_08_Training_Centre": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_09_Security_Service": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80",
    "RH_Professional_10_Engineering": "https://images.unsplash.com/photo-1581091870622-3d247d44a3cc?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_01_Luxury_Corporate": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_02_Hotel_Resort": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_03_Developer_Project": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_04_Medical_Group": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_05_Manufacturing": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_06_Franchise": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_07_Multi_Branch": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_08_Creative_Agency": "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_09_Travel_Agency": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
    "RH_Premium_10_Custom_Portal": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80"
};
  function fallback(){
    if(window.RH_TEMPLATE_DATA && window.RH_TEMPLATE_DATA[slug]) return window.RH_TEMPLATE_DATA[slug];
    return null;
  }
  async function loadData(){
    try{
      const res = await fetch('../content/templates-data.json?v=8.0.0',{cache:'no-store'});
      if(res.ok){
        const all = await res.json();
        return all[slug] || fallback();
      }
    }catch(e){}
    return fallback();
  }
  function setText(sel,val){document.querySelectorAll(sel).forEach(el=>el.textContent=val||'');}
  function cleanPhone(v){return String(v||'').replace(/[^0-9]/g,'');}
  function prettyService(v){return String(v||'').trim();}
  function setImage(url){
    const img = url || fallbackImages[slug] || fallbackImages['RH_Standard_01_Corporate_Profile'];
    document.documentElement.style.setProperty('--hero',`url("${img}")`);
    const probe = new Image();
    probe.onerror = function(){document.documentElement.style.setProperty('--hero',`url("${fallbackImages[slug] || fallbackImages['RH_Standard_01_Corporate_Profile']}")`);};
    probe.src = img;
  }
  function openAira(e){
    if(e) e.preventDefault();
    if(window.parent && window.parent.RH_OPEN_AIRA_POPUP) window.parent.RH_OPEN_AIRA_POPUP();
    if(window.RH_OPEN_AIRA_POPUP) window.RH_OPEN_AIRA_POPUP();
    location.hash = 'aira-popup';
  }
  function render(data){
    if(!data) return;
    const company = (params.get('company') || data.name || 'Nama Bisnes Anda').trim();
    const service = prettyService(params.get('service') || params.get('industry') || data.industry || 'Demo Website');
    const tagline = (params.get('tagline') || '').trim();
    const locationName = (params.get('location') || '').trim();
    const whatsapp = cleanPhone(params.get('whatsapp') || params.get('phone') || '');
    const color = params.get('color') || data.color || '#2563eb';
    const dynamicHeadline = params.get('headline') || (params.get('service') ? `${company} — ${service}` : (data.headline || 'Website Profesional Untuk Bisnes Anda'));
    const dynamicSubheadline = tagline || data.subheadline || 'Paparan demo lengkap dengan servis, pakej, galeri, testimoni dan CTA.';
    document.documentElement.style.setProperty('--brand',color);
    setImage(data.image);
    document.title = company + ' | Website ' + service;
    setText('[data-company]',company);
    setText('[data-industry]',service + (locationName ? ' · ' + locationName : ''));
    setText('[data-headline]',dynamicHeadline);
    setText('[data-subheadline]',dynamicSubheadline);
    setText('[data-testimonial]',data.testimonial || 'Website nampak lebih kemas dan mudah yakinkan pelanggan.');
    setText('[data-cta]',whatsapp ? 'WhatsApp Sekarang' : (data.cta || 'Mula Dengan Aira'));
    const services=document.getElementById('servicesGrid');
    if(services){
      services.innerHTML=(data.services||[]).map(s=>`<article class="card"><h3>${s}</h3><p>Disusun jelas supaya pelanggan faham dan terus hubungi anda.</p></article>`).join('');
    }
    const products=document.getElementById('productGrid');
    if(products){
      products.innerHTML=(data.products||[]).map(p=>`<article class="product"><div class="product-img">${p.title}</div><div class="product-body"><h3>${p.title}</h3><div class="price">${p.price}</div><p class="muted">${p.desc}</p></div></article>`).join('');
    }
    document.querySelectorAll('[data-demo-button], [data-wa]').forEach(a=>{
      if(whatsapp){
        const msg = encodeURIComponent(`Hai, saya berminat dengan website untuk ${company} (${service}).`);
        a.setAttribute('href',`https://wa.me/${whatsapp}?text=${msg}`);
        a.setAttribute('target','_blank');
      }else{
        a.setAttribute('href','#aira-popup');
        a.addEventListener('click',openAira);
      }
    });
  }
  loadData().then(render);
})();
