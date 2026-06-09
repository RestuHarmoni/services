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
    return `templates/${id}.html?${q.toString()}`;
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
    $('template').innerHTML=Object.entries(json).map(([id,t])=>`<option value="${id}">${packageOf(id)} — ${t.name||id}</option>`).join('');
    if(json[preferred]) $('template').value=preferred;
    apply();
  }
  ['template','company','service','tagline','location','whatsapp','color'].forEach(id=>$(id).addEventListener('input',apply));
  $('colorPicker').addEventListener('input',e=>{$('color').value=e.target.value;apply()});
  $('color').addEventListener('input',e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value)) $('colorPicker').value=e.target.value});
  $('apply').addEventListener('click',apply); $('copyConfig').addEventListener('click',copyConfig);
  $('openPanel').addEventListener('click',()=>document.body.classList.add('open'));
  $('closePanel').addEventListener('click',()=>document.body.classList.remove('open'));
  fetch('content/templates-data.json?v=9.0.0',{cache:'no-store'}).then(r=>r.json()).then(initTemplates).catch(()=>{$('template').innerHTML='<option>Template data gagal dibaca</option>'});
})();
