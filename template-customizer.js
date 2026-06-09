(function(){
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const state={templates:{}};
  const packageOf=id=> id.includes('RH_Basic')?'RH Basic':id.includes('RH_Standard')?'RH Standard':id.includes('RH_Professional')?'RH Professional':'RH Premium';
  function buildUrl(){
    const id=$('template').value;
    const q=new URLSearchParams({
      company:$('company').value.trim(),
      service:$('service').value.trim(),
      tagline:$('tagline').value.trim(),
      location:$('location').value.trim(),
      whatsapp:$('whatsapp').value.trim(),
      color:$('color').value.trim()
    });
    return new URL(`templates/${id}.html?${q.toString()}`, location.origin + '/').toString();
  }
  function apply(){
    const id=$('template').value; if(!id) return;
    const url=buildUrl();
    $('frame').src=url;
    $('openFull').href=url;
    const pkg=packageOf(id), name=(state.templates[id]&&state.templates[id].name)||id;
    $('packageBadge').textContent=pkg; $('sumPackage').textContent=pkg; $('sumTemplate').textContent=name.replace(/^RH /,'');
    $('previewTitle').textContent=($('company').value||'Preview Live')+' · '+pkg;
    $('previewMeta').textContent=($('service').value||'Servis')+' · '+($('location').value||'Lokasi belum diisi');
    document.documentElement.style.setProperty('--brand',$('color').value||'#2563eb');
    document.body.classList.remove('open');
  }
  function copyConfig(){
    const id=$('template').value;
    const config={companyName:$('company').value,industry:$('service').value,location:$('location').value,whatsapp:$('whatsapp').value,themeColor:$('color').value,package:packageOf(id),template:id,previewUrl:buildUrl()};
    navigator.clipboard&&navigator.clipboard.writeText(JSON.stringify(config,null,2));
    $('sumLead').textContent='Copied'; setTimeout(()=>$('sumLead').textContent='Ready',1400);
  }
  function initTemplates(json){
    state.templates=json;
    const preferred=params.get('template') || Object.keys(json)[0];
    if(params.get('company')) $('company').value=params.get('company');
    if(params.get('service')) $('service').value=params.get('service');
    if(params.get('location')) $('location').value=params.get('location');
    if(params.get('tagline')) $('tagline').value=params.get('tagline');
    if(params.get('whatsapp')) $('whatsapp').value=params.get('whatsapp');
    if(params.get('color')) { $('color').value=params.get('color'); if(/^#[0-9a-f]{6}$/i.test(params.get('color'))) $('colorPicker').value=params.get('color'); }
    $('template').innerHTML=Object.entries(json).map(([id,t])=>`<option value="${id}">${packageOf(id)} — ${t.name||id}</option>`).join('');
    if(json[preferred]) $('template').value=preferred;
    apply();
  }
  ['company','service','tagline','location','whatsapp','color'].forEach(id=>$(id).addEventListener('input',apply));
  $('template').addEventListener('change',apply);
  $('colorPicker').addEventListener('input',e=>{$('color').value=e.target.value;apply()});
  $('color').addEventListener('input',e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value)) $('colorPicker').value=e.target.value});
  $('apply').addEventListener('click',apply); $('copyConfig').addEventListener('click',copyConfig);
  $('openPanel').addEventListener('click',()=>document.body.classList.add('open'));
  $('closePanel').addEventListener('click',()=>document.body.classList.remove('open'));
  fetch(new URL('content/templates-data.json?v=9.2.0', location.origin + '/').toString(),{cache:'no-store'}).then(r=>r.json()).then(initTemplates).catch(()=>{$('template').innerHTML='<option>Template data gagal dibaca</option>'});
})();
