
(function(){
  const params = new URLSearchParams(location.search);
  const slug = document.body.dataset.template || 'kedai-makan';
  const fallbackImages = {
    'kedai-makan':'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    'homestay':'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
    'kereta-sewa':'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
    'aircond':'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1600&q=80',
    'renovation':'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    'butik':'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
    'corporate':'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
    'produk-online':'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80'
  };
  function fallback(){
    if(window.RH_TEMPLATE_DATA && window.RH_TEMPLATE_DATA[slug]) return window.RH_TEMPLATE_DATA[slug];
    return null;
  }
  async function loadData(){
    try{
      const res = await fetch('../content/templates-data.json?v=5.3.1',{cache:'no-store'});
      if(res.ok){
        const all = await res.json();
        return all[slug] || fallback();
      }
    }catch(e){}
    return fallback();
  }
  function setText(sel,val){document.querySelectorAll(sel).forEach(el=>el.textContent=val||'');}
  function setImage(url){
    const img = url || fallbackImages[slug] || fallbackImages['corporate'];
    document.documentElement.style.setProperty('--hero',`url("${img}")`);
    const probe = new Image();
    probe.onerror = function(){document.documentElement.style.setProperty('--hero',`url("${fallbackImages[slug] || fallbackImages['corporate']}")`);};
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
    const color = params.get('color') || data.color || '#2563eb';
    document.documentElement.style.setProperty('--brand',color);
    setImage(data.image);
    document.title = company + ' | Website ' + (data.industry || 'Demo');
    setText('[data-company]',company);
    setText('[data-industry]',data.industry || 'Demo Website');
    setText('[data-headline]',data.headline || 'Website Profesional Untuk Bisnes Anda');
    setText('[data-subheadline]',data.subheadline || 'Paparan demo lengkap dengan servis, pakej, galeri, testimoni dan CTA.');
    setText('[data-testimonial]',data.testimonial || 'Website nampak lebih kemas dan mudah yakinkan pelanggan.');
    setText('[data-cta]',data.cta || 'Mula Dengan Aira');
    const services=document.getElementById('servicesGrid');
    if(services){
      services.innerHTML=(data.services||[]).map(s=>`<article class="card"><h3>${s}</h3><p>Disusun jelas supaya pelanggan faham dan terus hubungi anda.</p></article>`).join('');
    }
    const products=document.getElementById('productGrid');
    if(products){
      products.innerHTML=(data.products||[]).map(p=>`<article class="product"><div class="product-img">${p.title}</div><div class="product-body"><h3>${p.title}</h3><div class="price">${p.price}</div><p class="muted">${p.desc}</p></div></article>`).join('');
    }
    document.querySelectorAll('[data-demo-button], [data-wa]').forEach(a=>{
      a.setAttribute('href','#aira-popup');
      a.addEventListener('click',openAira);
    });
  }
  loadData().then(render);
})();
