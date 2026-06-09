(function(){
  const state={templates:{}, filter:'all', q:'', package:''};
  const packageOf=id=> id.includes('RH_Basic')?'RH Basic':id.includes('RH_Standard')?'RH Standard':id.includes('RH_Professional')?'RH Professional':'RH Premium';
  const packageLimit=p=> p==='RH Basic'?'10 Template UI':p==='RH Standard'?'20 Template UI':p==='RH Professional'?'30 Template UI':'40 Template UI + Custom';
  const slugify=s=>String(s||'').toLowerCase();
  const grid=document.getElementById('templateGrid');
  const count=document.getElementById('templateCount');
  function card(id,t){
    const pkg=packageOf(id); const title=t.name||id.replaceAll('_',' ');
    const img=t.image||''; const desc=t.subheadline||t.headline||'';
    const url=`template-customizer.html?template=${encodeURIComponent(id)}`;
    const preview=`templates/${id}.html`;
    return `<article class="card" data-package="${pkg}">
      <div class="thumb" style="background-image:url('${img}')"><span class="badge">${pkg}</span></div>
      <div class="body">
        <h3>${title}</h3>
        <div class="meta"><span class="tag">${packageLimit(pkg)}</span><span class="tag">${t.industry||'Multi industri'}</span></div>
        <p class="muted">${desc}</p>
        <div class="actions"><a class="btn" href="${url}">Customize</a><a class="btn alt" target="_blank" href="${preview}">Preview</a></div>
      </div>
    </article>`;
  }
  function render(){
    const q=slugify(state.q); const f=state.filter;
    const rows=Object.entries(state.templates).filter(([id,t])=>{
      const pkg=packageOf(id);
      const text=slugify([id,t.name,t.industry,t.headline,t.subheadline].join(' '));
      return (f==='all'||pkg===f) && (!q||text.includes(q));
    });
    count.textContent=`${rows.length} template dipaparkan`;
    grid.innerHTML=rows.length?rows.map(([id,t])=>card(id,t)).join(''):`<div class="empty">Tiada template sepadan. Cuba kata kunci lain.</div>`;
  }
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); state.filter=btn.dataset.filter; render();
  }));
  document.getElementById('searchInput').addEventListener('input',e=>{state.q=e.target.value;render()});
  document.getElementById('packageSelect').addEventListener('change',e=>{state.filter=e.target.value||'all';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));render()});
  fetch('content/templates-data.json?v=9.0.0',{cache:'no-store'}).then(r=>r.json()).then(json=>{state.templates=json;render()}).catch(()=>{grid.innerHTML='<div class="empty">Data template tidak dapat dibaca.</div>'});
})();
