(function(global){
  const packageOf=id=> id.includes('RH_Basic')?'RH Basic':id.includes('RH_Standard')?'RH Standard':id.includes('RH_Professional')?'RH Professional':'RH Premium';
  const normalize=v=>String(v||'').toLowerCase().trim();
  async function loadJson(path){const r=await fetch(path,{cache:'no-store'}); if(!r.ok) throw new Error(path); return r.json();}
  async function recommend(input){
    const service=normalize(input && (input.service || input.industry || input.businessType));
    const goal=normalize(input && input.goal);
    const [templates,map]=await Promise.all([loadJson('/content/templates-data.json?v=9.0.0').catch(()=>loadJson('../content/templates-data.json?v=9.0.0')),loadJson('/content/template-service-map.json?v=9.0.0').catch(()=>loadJson('../content/template-service-map.json?v=9.0.0'))]);
    let hit=map[service] || Object.entries(map).find(([k])=>service.includes(k)||k.includes(service))?.[1];
    let ids=hit && hit.templates ? hit.templates.slice(0,3) : [];
    if(!ids.length){
      ids=Object.keys(templates).filter(id=>normalize([id,templates[id].industry,templates[id].headline].join(' ')).includes(service)).slice(0,3);
    }
    if(!ids.length) ids=['RH_Basic_02_Modern_Split','RH_Professional_01_Lead_Generation','RH_Premium_01_Luxury_Corporate'];
    const pkg=(hit&&hit.recommendedPackage)||packageOf(ids[0]);
    return {service,goal,recommendedPackage:pkg,templates:ids.map(id=>({id,package:packageOf(id),name:templates[id]?.name||id,previewUrl:`/template-customizer.html?template=${encodeURIComponent(id)}`})),reason:(hit&&hit.reason)||'Padanan dibuat melalui metadata template dan jenis servis.'};
  }
  global.RH_AIRA_RECOMMENDATION_V2={recommend};
})(window);
