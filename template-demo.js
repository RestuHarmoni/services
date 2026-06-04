
(function(){
  const params=new URLSearchParams(location.search);
  const slug=document.body.dataset.template || 'kedai-makan';
  const phone='60184611625';
  function fallback(){
    return window.RH_TEMPLATE_DATA && window.RH_TEMPLATE_DATA[slug] ? window.RH_TEMPLATE_DATA[slug] : null;
  }
  async function loadData(){
    try{
      const res=await fetch('../content/templates-data.json',{cache:'no-store'});
      if(res.ok){
        const all=await res.json();
        return all[slug] || fallback();
      }
    }catch(e){}
    return fallback();
  }
  function setText(sel,val){document.querySelectorAll(sel).forEach(el=>el.textContent=val||'');}
  function render(data){
    if(!data)return;
    const company=(params.get('company')||data.name||'Nama Bisnes Anda').trim();
    const color=params.get('color')||data.color||'#2563eb';
    document.documentElement.style.setProperty('--brand',color);
    document.documentElement.style.setProperty('--hero',`url("${data.image}")`);
    document.title=company+' | Website '+data.industry;
    setText('[data-company]',company);
    setText('[data-industry]',data.industry);
    setText('[data-headline]',data.headline);
    setText('[data-subheadline]',data.subheadline);
    setText('[data-testimonial]',data.testimonial);
    setText('[data-cta]',data.cta || 'WhatsApp Sekarang');
    const services=document.getElementById('servicesGrid');
    if(services){
      services.innerHTML=(data.services||[]).map(s=>`<article class="card"><h3>${s}</h3><p>Disusun jelas supaya pelanggan faham dan terus hubungi anda.</p></article>`).join('');
    }
    const products=document.getElementById('productGrid');
    if(products){
      products.innerHTML=(data.products||[]).map(p=>`<article class="product"><div class="product-img">${p.title}</div><div class="product-body"><h3>${p.title}</h3><div class="price">${p.price}</div><p class="muted">${p.desc}</p></div></article>`).join('');
    }
    const waText=encodeURIComponent(`Hi Restu Harmoni.\n\nSaya berminat dengan website seperti contoh ini.\n\nNama Bisnes: ${company}\nTemplate: ${data.industry}\n\nMohon cadangan pakej yang sesuai.`);
    document.querySelectorAll('[data-wa]').forEach(a=>a.href=`https://wa.me/${phone}?text=${waText}`);
  }
  loadData().then(render);
})();
