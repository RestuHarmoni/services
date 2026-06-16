const RHAdmin = (() => {
  const SESSION_KEY = 'rh_admin_session_v1';
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => [...document.querySelectorAll(s)];
  let currentLead = null;
  let leadsCache = [];
  let prospectsCache = [];
  let currentProspect = null;
  let quotationsCache = [];
  let currentQuotation = null;
  let invoicesCache = [];
  let invoiceAcceptedQuotesCache = [];
  let currentInvoice = null;
  let projectsCache = [];
  let currentProject = null;
  const fmtRM = (n) => new Intl.NumberFormat('ms-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(Number(n||0));
  async function getClient(){
    if(window.RHGetSupabaseClient) return await window.RHGetSupabaseClient();
    return window.supabaseClient || null;
  }
  function getSupabaseRestConfig(){
    const cfg=window.RH_SUPABASE_CONFIG || {};
    const url = cfg.url || cfg.supabaseUrl || cfg.SUPABASE_URL;
    const anonKey = cfg.anonKey || cfg.anon_key || cfg.key || cfg.SUPABASE_ANON_KEY;
    if(!url || !anonKey){
      throw new Error('Supabase config tidak lengkap untuk REST request.');
    }
    return {url:String(url).replace(/\/$/,''), anonKey:String(anonKey)};
  }
  async function supabaseRestInsert(table, payload){
    const cfg=getSupabaseRestConfig();
    const res=await fetch(`${cfg.url}/rest/v1/${table}`,{
      method:'POST',
      headers:{
        apikey:cfg.anonKey,
        Authorization:`Bearer ${cfg.anonKey}`,
        'Content-Type':'application/json',
        Prefer:'return=representation'
      },
      body:JSON.stringify(Array.isArray(payload)?payload:[payload])
    });
    const txt=await res.text();
    let json=null;
    try{ json=txt?JSON.parse(txt):null; }catch{ json=txt; }
    if(!res.ok){
      const msg=(json&&json.message)||txt||`Supabase REST insert ${table} gagal (${res.status})`;
      const err=new Error(msg); err.details=json; err.status=res.status; throw err;
    }
    return Array.isArray(json) ? json : (json?[json]:[]);
  }
  async function sha256(text){
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function setMsg(msg){ const el=qs('#loginMessage'); if(el) el.textContent=msg||''; }
  function saveSession(user){
    localStorage.setItem(SESSION_KEY, JSON.stringify({staff_id:user.staff_id, full_name:user.full_name, role:user.role, login_at:new Date().toISOString()}));
  }
  function getSession(){ try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null} }
  function clearSession(){ localStorage.removeItem(SESSION_KEY); }
  async function login(e){
    if(e && typeof e.preventDefault === 'function') e.preventDefault();
    if(e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const btn = qs('#loginButton') || qs('#loginForm button');
    try{
      setMsg('Menyemak login...');
      if(btn){ btn.disabled=true; btn.textContent='Checking...'; }
      const staffInput = qs('#staffId');
      const passInput = qs('#password');
      const staffId = String(staffInput?.value||'').trim().toUpperCase();
      const password = String(passInput?.value||'');
      if(!staffId){ setMsg('Sila masukkan Staff ID.'); staffInput?.focus(); return false; }
      if(!password){ setMsg('Sila masukkan password.'); passInput?.focus(); return false; }
      const passwordHash = await sha256(password);
      const cfg = getSupabaseRestConfig();
      const controller = new AbortController();
      const timer = setTimeout(()=>controller.abort(), 8000);
      const url = `${cfg.url}/rest/v1/staff_users?select=staff_id,full_name,role,status,password_hash&staff_id=eq.${encodeURIComponent(staffId)}&limit=1`;
      const res = await fetch(url, {method:'GET', signal:controller.signal, headers:{apikey:cfg.anonKey, Authorization:`Bearer ${cfg.anonKey}`, Accept:'application/json'}});
      clearTimeout(timer);
      const body = await res.text();
      let rows=[]; try{ rows = body ? JSON.parse(body) : []; }catch{ rows=[]; }
      if(!res.ok){ setMsg((rows && rows.message) || body || 'Gagal semak staff login.'); return false; }
      const data = Array.isArray(rows) ? rows[0] : null;
      if(!data || data.status !== 'active' || data.password_hash !== passwordHash){ setMsg('Staff ID atau password tidak sah.'); return false; }
      saveSession(data);
      fetch(`${cfg.url}/rest/v1/staff_users?staff_id=eq.${encodeURIComponent(staffId)}`,{method:'PATCH',headers:{apikey:cfg.anonKey,Authorization:`Bearer ${cfg.anonKey}`,'Content-Type':'application/json'},body:JSON.stringify({last_login:new Date().toISOString()})}).catch(()=>{});
      location.href='dashboard.html';
    }catch(err){
      console.error('[RH ADMIN LOGIN ERROR]', err);
      setMsg(err?.name === 'AbortError' ? 'Login timeout. Sila cuba semula.' : (err?.message || 'Login gagal.'));
    }finally{ if(btn){ btn.disabled=false; btn.textContent='Login'; } }
    return false;
  }
  function protect(){
    const path = location.pathname;
    const cleanPath = path.replace(/\/+$/,'');
    const isAdminPage = path.includes('/admin');
    const isLogin = cleanPath.endsWith('/admin/login') || cleanPath.endsWith('/admin/login.html') || cleanPath.endsWith('/admin') || cleanPath.endsWith('/admin/index.html');
    if(isAdminPage && !isLogin){
      const s = getSession();
      if(!s){ location.href='login.html'; return null; }
      const badge=qs('#staffBadge'); if(badge) badge.textContent=`${s.staff_id} • ${s.role}`;
      return s;
    }
    return null;
  }
  function drawLineChart(canvas, points){
    if(!canvas) return; const ctx=canvas.getContext('2d'); const w=canvas.width=canvas.clientWidth*2; const h=canvas.height=canvas.clientHeight*2||240; ctx.clearRect(0,0,w,h);
    const pad=42, max=Math.max(5,...points.map(p=>p.value));
    ctx.strokeStyle='rgba(148,163,184,.22)'; ctx.lineWidth=1; for(let i=0;i<4;i++){const y=pad+(h-pad*2)*i/3; ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke();}
    const step=(w-pad*2)/Math.max(1,points.length-1); const xy=points.map((p,i)=>({x:pad+i*step,y:h-pad-(p.value/max)*(h-pad*2),...p}));
    const grad=ctx.createLinearGradient(0,0,w,0); grad.addColorStop(0,'#2563eb'); grad.addColorStop(1,'#38bdf8');
    ctx.strokeStyle=grad; ctx.lineWidth=5; ctx.lineJoin='round'; ctx.beginPath(); xy.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
    xy.forEach(p=>{ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#94a3b8';ctx.font='22px Inter,Arial';ctx.textAlign='center';ctx.fillText(p.label,p.x,h-12);});
  }
  function drawDonut(canvas, rows){
    if(!canvas) return; const ctx=canvas.getContext('2d'); const w=canvas.width, h=canvas.height; const cx=w/2, cy=h/2, r=78; const total=rows.reduce((a,b)=>a+b.value,0)||1; let start=-Math.PI/2; const colors=['#2563eb','#16a34a','#f59e0b','#7c3aed']; ctx.clearRect(0,0,w,h);
    rows.forEach((row,i)=>{const ang=(row.value/total)*Math.PI*2; ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,start,start+ang);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();start+=ang;});
    ctx.beginPath();ctx.arc(cx,cy,48,0,Math.PI*2);ctx.fillStyle='#1e293b';ctx.fill();ctx.fillStyle='#f8fafc';ctx.font='bold 24px Inter,Arial';ctx.textAlign='center';ctx.fillText(String(total),cx,cy+8);
  }
  async function countTable(client, table, filter){
    try{let q=client.from(table).select('*',{count:'exact',head:true}); if(filter) q=filter(q); const {count,error}=await q; return error?0:(count||0);}catch{return 0;}
  }
  function groupLast7(leads){
    const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return {key:d.toISOString().slice(0,10), label:d.toLocaleDateString('ms-MY',{weekday:'short'}), value:0};});
    leads.forEach(l=>{const k=String(l.created_at||'').slice(0,10); const found=days.find(d=>d.key===k); if(found) found.value++;}); return days;
  }
  async function fetchActiveRows(client, table, select='*'){
    try{
      const {data,error}=await client.from(table).select(select).order('created_at',{ascending:false});
      if(error) return [];
      return (data||[]).filter(r=>!isDeleted(r));
    }catch{return [];}
  }
  async function loadDashboard(){
    const client=await getClient(); if(!client) return;
    const [leadRows,prospectRows,quotationRows,invoiceRows,articleRows]=await Promise.all([
      fetchActiveRows(client,'leads','*'),
      fetchActiveRows(client,'prospects','*'),
      fetchActiveRows(client,'quotations','*'),
      fetchActiveRows(client,'invoices','*'),
      fetchActiveRows(client,'blog_posts','*')
    ]);
    const publishedArticles=articleRows.filter(a=>String(a.status||'').toLowerCase()==='published');
    const leads=leadRows.length, prospects=prospectRows.length, quotations=quotationRows.length, invoices=invoiceRows.length, articles=publishedArticles.length;
    qs('#totalLeads').textContent=leads; qs('#totalProspects').textContent=prospects; qs('#totalQuotations').textContent=quotations; qs('#totalInvoices').textContent=invoices; qs('#totalArticles').textContent=articles;
    const paid=invoiceRows.filter(inv=>String(inv.status||'').toLowerCase()==='paid').reduce((a,b)=>a+Number(b.amount_paid||b.total_amount||b.grand_total||0),0);
    qs('#paidAmount').textContent=fmtRM(paid);
    const recent=(leadRows||[]).slice(0,6);
    renderRecentLeads(recent||[]); drawLineChart(qs('#leadChart'), groupLast7(recent||[])); drawDonut(qs('#statusChart'), [{label:'Leads',value:leads},{label:'Prospects',value:prospects},{label:'Quotations',value:quotations},{label:'Invoices',value:invoices}]);
    try{const {data:logs}=await client.from('activity_logs').select('message,created_at').order('created_at',{ascending:false}).limit(5); renderActivity(logs||[]);}catch{}
  }
  function esc(s){return String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function renderRecentLeads(rows){const el=qs('#recentLeads'); if(!el) return; if(!rows.length){el.innerHTML='<div class="empty-state">Belum ada lead.</div>';return;} el.innerHTML=rows.map(r=>`<div class="lead-row"><div><strong>${esc(r.name||'Tanpa nama')}</strong><span>${esc(r.phone||'-')} • ${esc(r.business_type||'Bisnes')}</span></div><b class="status-pill">${esc(r.status||'new')}</b></div>`).join('');}
  function renderActivity(rows){const el=qs('#recentActivity'); if(!el) return; if(!rows.length){el.innerHTML='<div class="empty-state">Belum ada aktiviti.</div>';return;} el.innerHTML=rows.map(r=>`<div class="activity-item">${esc(r.message||'Aktiviti sistem')}</div>`).join('');}

  function dateShort(v){ try{return new Date(v).toLocaleDateString('ms-MY',{day:'2-digit',month:'short',year:'numeric'});}catch{return '-';} }
  function statusClass(v){ return String(v||'new').toLowerCase().replace(/[^a-z0-9_-]/g,''); }
  function stageLabel(v){
    const key=String(v||'data_review').toLowerCase();
    return ({
      new_prospect:'Data Review',
      data_review:'Data Review',
      contacted:'Data Review',
      proposal_sent:'Proposal Sent',
      negotiation:'Negotiation',
      won:'Won',
      lost:'Lost'
    })[key] || key.replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
  }
  function normalizeProspectStage(v){
    const key=String(v||'data_review').toLowerCase();
    if(key==='new_prospect' || key==='contacted') return 'data_review';
    return ['data_review','proposal_sent','negotiation','won','lost'].includes(key) ? key : 'data_review';
  }
  function firstAnswerLike(answers, patterns){
    const list=Array.isArray(answers)?answers:[];
    const keys=patterns.map(p=>String(p).toLowerCase());
    const found=list.find(a=>{
      const hay=[a.question_key,a.question,a.answer_type].join(' ').toLowerCase();
      return keys.some(k=>hay.includes(k));
    });
    return found ? (found.answer || '') : '';
  }
  function cleanLeadName(name){
    const n=String(name||'').trim();
    if(n.length < 2) return '';
    if(/[\[\]{}<>]/.test(n)) return '';
    return n;
  }
  function isSuperAdmin(){ return String((getSession()||{}).role||'').toUpperCase()==='SUPER_ADMIN'; }
  function normalizeStatus(st){ return String(st||'new').toLowerCase(); }
  function statusLabel(st){
    const map={new:'New',contacted:'Contacted',qualified:'Qualified',converted:'Converted',archived:'Archived',closed:'Closed',lost:'Lost'};
    return map[normalizeStatus(st)] || String(st||'New');
  }
  function isDeleted(row){ const st=normalizeStatus(row && row.status); return !!(row && (row.is_deleted===true || row.deleted_at)) || st==='archived' || st==='deleted'; }
  function needsReviewLead(lead){ return !cleanLeadName(lead?.name) || !String(lead?.phone||'').trim(); }
  function phoneOnly(p){ return String(p||'').replace(/\D/g,''); }
  function duplicatePhoneCount(row, rows){ const p=phoneOnly(row.phone); return p ? rows.filter(r=>phoneOnly(r.phone)===p && !isDeleted(r)).length : 0; }

  async function addLog(client, action, message, entityType='lead', entityId=''){
    const s=getSession()||{};
    try{await client.from('activity_logs').insert({entity_type:entityType,entity_id:String(entityId||''),action,message,staff_id:s.staff_id||'system'});}catch{}
  }
  async function loadLeadsPage(){
    const client=await getClient(); if(!client) return;
    const {data,error}=await client.from('leads').select('*').order('created_at',{ascending:false}).limit(200);
    if(error){ const el=qs('#leadsTableBody'); if(el) el.innerHTML='<tr><td colspan="7"><div class="empty-state">Gagal load leads. Semak table leads atau RLS.</div></td></tr>'; return; }
    leadsCache=(data||[]).filter(r=>!isDeleted(r));
    renderLeadStats(leadsCache); renderLeadsTable();
  }
  function renderLeadStats(rows){
    const total=rows.length;
    const by=(st)=>rows.filter(r=>String(r.status||'new').toLowerCase()===st).length;
    const set=(id,val)=>{const el=qs(id); if(el) el.textContent=val;};
    set('#leadCountTotal',total); set('#leadCountNew',by('new')); set('#leadCountContacted',by('contacted')); set('#leadCountQualified',by('qualified')); set('#leadCountConverted',by('converted'));
  }
  function renderLeadsTable(){
    const body=qs('#leadsTableBody'); if(!body) return;
    const search=(qs('#leadSearch')?.value||'').toLowerCase().trim();
    const filter=(qs('#leadStatusFilter')?.value||'').toLowerCase();
    let rows=leadsCache.slice();
    if(filter) rows=rows.filter(r=>String(r.status||'new').toLowerCase()===filter);
    if(search) rows=rows.filter(r=>[r.name,r.phone,r.business_type,r.objective,r.budget,r.timeline,r.recommended_package].join(' ').toLowerCase().includes(search));
    if(!rows.length){body.innerHTML='<tr><td colspan="7"><div class="empty-state">Tiada lead untuk filter ini.</div></td></tr>';return;}
    body.innerHTML=rows.map(r=>{
      const dup=duplicatePhoneCount(r, leadsCache)>1;
      const bad=needsReviewLead(r);
      const warn=(dup||bad)?`<span class="small-muted warning-text">${bad?'Semak data':dup?'Duplicate phone':''}</span>`:'';
      return `<tr>
      <td data-label="Nama"><strong>${esc(r.name||'Tanpa nama')}</strong><span class="small-muted">${esc(r.source||'aira')}</span>${warn}</td>
      <td data-label="Telefon">${esc(r.phone||'-')}</td>
      <td data-label="Bisnes">${esc(r.business_type||'-')}<span class="small-muted">${esc(r.objective||'')}</span></td>
      <td data-label="Pakej">${esc(r.recommended_package||'-')}<span class="small-muted">${esc(r.budget||'')}</span></td>
      <td data-label="Status"><span class="status-pill ${statusClass(r.status)}">${esc(statusLabel(r.status))}</span></td>
      <td data-label="Tarikh">${dateShort(r.created_at)}</td>
      <td data-label="Action"><div class="table-actions"><button class="mini-btn primary" data-view-lead="${r.id}">View</button><button class="mini-btn" data-edit-lead="${r.id}">Edit</button><button class="mini-btn" data-status-lead="${r.id}" data-status="contacted">Contacted</button><button class="mini-btn" data-convert-lead="${r.id}">${bad&&isSuperAdmin()?'Force Prospect':'Prospect'}</button>${isSuperAdmin()?`<button class="mini-btn danger" data-delete-lead="${r.id}">Delete</button>`:''}</div></td>
    </tr>`}).join('');
  }
  async function openLeadModal(leadId){
    currentLead=leadsCache.find(l=>String(l.id)===String(leadId));
    const client=await getClient();
    if(!currentLead && client){
      try{
        const {data}=await client.from('leads').select('*').eq('id',leadId).maybeSingle();
        if(data) currentLead=data;
      }catch{}
    }
    if(!currentLead) return;
    const modal=qs('#leadModal'); if(!modal) return;
    qs('#leadModalTitle').textContent=currentLead.name||'Lead Detail';
    qs('#leadModalSub').textContent=`${currentLead.phone||'-'} • ${currentLead.business_type||'Bisnes'}`;
    const fields=[
      ['Nama',currentLead.name],['Telefon',currentLead.phone],['Jenis Bisnes',currentLead.business_type],['Objektif',currentLead.objective],['Budget',currentLead.budget],['Timeline',currentLead.timeline],['Pakej Cadangan',currentLead.recommended_package],['Lead Score',currentLead.lead_score],['Temperature',currentLead.lead_temperature],['Status',currentLead.status],['Page URL',currentLead.page_url],['User Agent',currentLead.user_agent],['Notes',currentLead.notes,'full']
    ];
    let answers=[];
    if(client){
      try{
        const {data,error}=await client.from('lead_answers').select('question,answer,question_key,answer_type,sort_order,created_at').eq('lead_id',currentLead.id).order('sort_order',{ascending:true}).order('created_at',{ascending:true});
        if(!error) answers=data||[];
      }catch{}
    }
    const mainHtml=fields.map(([k,v,full])=>`<div class="detail-item ${full?'full':''}"><span>${esc(k)}</span><strong>${esc(v||'-')}</strong></div>`).join('');
    const answerHtml=answers.length?`<div class="detail-item full"><span>Jawapan Aira</span><div class="answer-list">${answers.map(a=>`<div class="answer-item"><b>${esc(a.question||a.question_key||'Soalan')}</b><p>${esc(a.answer||'-')}</p></div>`).join('')}</div></div>`:`<div class="detail-item full"><span>Jawapan Aira</span><strong>Tiada jawapan detail untuk lead ini.</strong></div>`;
    qs('#leadDetailContent').innerHTML=mainHtml+answerHtml;
    modal.hidden=false;
  }
  function closeModal(){ const m=qs('#leadModal'); if(m) m.hidden=true; currentLead=null; }
  function openLeadEditModal(leadId){
    const lead = leadsCache.find(l=>String(l.id)===String(leadId)) || currentLead;
    if(!lead) return;
    currentLead = lead;
    setVal('#editLeadId', lead.id);
    setVal('#editLeadName', lead.name);
    setVal('#editLeadPhone', lead.phone);
    setVal('#editLeadEmail', lead.email);
    setVal('#editLeadCompany', lead.company);
    setVal('#editLeadBusiness', lead.business_type);
    setVal('#editLeadObjective', lead.objective);
    setVal('#editLeadBudget', lead.budget);
    setVal('#editLeadTimeline', lead.timeline);
    setVal('#editLeadPackage', lead.recommended_package);
    setVal('#editLeadScore', lead.lead_score);
    setVal('#editLeadTemperature', lead.lead_temperature);
    setVal('#editLeadDomain', lead.domain_status);
    setVal('#editLeadWebsite', lead.website_status || lead.hosting_status);
    setVal('#editLeadStatus', lead.status || 'new');
    setVal('#editLeadNotes', lead.notes);
    const modal=qs('#leadEditModal'); if(modal) modal.hidden=false;
  }
  function closeLeadEditModal(){ const m=qs('#leadEditModal'); if(m) m.hidden=true; }
  async function saveLeadEdit(e){
    e.preventDefault();
    const client=await getClient(); if(!client) return;
    const id=qs('#editLeadId')?.value;
    if(!id){ alert('Lead ID tidak dijumpai.'); return; }
    const payload={
      name:qs('#editLeadName')?.value.trim()||null,
      phone:qs('#editLeadPhone')?.value.trim()||null,
      email:qs('#editLeadEmail')?.value.trim()||null,
      company:qs('#editLeadCompany')?.value.trim()||null,
      business_type:qs('#editLeadBusiness')?.value.trim()||null,
      objective:qs('#editLeadObjective')?.value.trim()||null,
      budget:qs('#editLeadBudget')?.value.trim()||null,
      timeline:qs('#editLeadTimeline')?.value.trim()||null,
      recommended_package:qs('#editLeadPackage')?.value.trim()||null,
      lead_score:qs('#editLeadScore')?.value ? Number(qs('#editLeadScore').value) : null,
      lead_temperature:qs('#editLeadTemperature')?.value.trim()||null,
      domain_status:qs('#editLeadDomain')?.value.trim()||null,
      hosting_status:qs('#editLeadWebsite')?.value.trim()||null,
      status:qs('#editLeadStatus')?.value||'new',
      notes:qs('#editLeadNotes')?.value.trim()||null,
      updated_at:new Date().toISOString()
    };
    const {error}=await client.from('leads').update(payload).eq('id',id);
    if(error){ alert('Gagal save lead. Semak RLS atau column leads.'); return; }
    await addLog(client,'lead_edit',`Lead ${payload.name||id} dikemaskini`,'lead',id);
    closeLeadEditModal(); closeModal(); await loadLeadsPage();
  }
  async function deleteLead(leadId){
    if(!isSuperAdmin()){ alert('Hanya Super Admin boleh delete lead.'); return; }
    const lead=leadsCache.find(l=>String(l.id)===String(leadId)) || currentLead || {};
    if(!confirm(`Padam/archive lead ini?\n\n${lead.name||leadId}\n${lead.phone||''}`)) return;
    const client=await getClient(); if(!client) return;
    const s=getSession()||{};
    const {error}=await client.from('leads').update({status:'archived',deleted_at:new Date().toISOString(),deleted_by:s.staff_id||'SUPER_ADMIN',updated_at:new Date().toISOString()}).eq('id',leadId);
    if(error){ alert('Gagal archive lead. Run SQL Lead V1.3 dahulu.'); return; }
    await addLog(client,'lead_delete',`Lead ${lead.name||leadId} diarchive`,'lead',leadId);
    closeModal(); await loadLeadsPage();
  }
  async function updateLeadStatus(leadId,status){
    const client=await getClient(); if(!client) return;
    const {error}=await client.from('leads').update({status}).eq('id',leadId);
    if(error){ alert('Gagal update status lead.'); return; }
    await addLog(client,'lead_status',`Lead ${leadId} ditukar kepada ${status}`,'lead',leadId);
    await loadLeadsPage();
    if(currentLead && String(currentLead.id)===String(leadId)){ currentLead.status=status; openLeadModal(leadId); }
  }
  async function convertLeadToProspect(leadId){
    const client=await getClient(); if(!client) return;
    let lead=leadsCache.find(l=>String(l.id)===String(leadId)) || currentLead;
    if(!lead) return;
    try{
      const {data:fullLead}=await client.from('leads').select('*').eq('id', lead.id).maybeSingle();
      if(fullLead) lead=fullLead;
    }catch{}
    const validName=cleanLeadName(lead.name);
    const invalidLead = !validName || !String(lead.phone||'').trim();
    if(invalidLead){
      if(!isSuperAdmin()){
        alert('Lead ini tidak lengkap atau data test rosak. Sila semak nama dan telefon sebelum convert.');
        return;
      }
      const ok = confirm('⚠ Data lead kelihatan tidak normal. Force convert sebagai Prospect?');
      if(!ok) return;
    }
    let answers=[];
    try{
      const {data}=await client.from('lead_answers').select('question,answer,question_key,answer_type,sort_order,created_at').eq('lead_id', lead.id).order('sort_order',{ascending:true}).order('created_at',{ascending:true});
      answers=data||[];
    }catch{}
    try{
      const {data:existing}=await client.from('prospects').select('id').eq('lead_id', lead.id).maybeSingle();
      if(existing?.id){
        await client.from('leads').update({status:'converted', updated_at:new Date().toISOString()}).eq('id',lead.id);
        alert('Lead ini sudah wujud sebagai Prospect.');
        closeModal(); await loadLeadsPage(); return;
      }
    }catch{}
    const derivedDomain = firstAnswerLike(answers, ['domain']);
    const derivedWebsite = firstAnswerLike(answers, ['website sekarang','mempunyai website','website']);
    const derivedMaterial = firstAnswerLike(answers, ['bahan']);
    const derivedStyle = firstAnswerLike(answers, ['template','gaya']);
    const payload={
      lead_id:lead.id,
      name:validName || String(lead.name||'Tanpa nama').trim() || 'Tanpa nama',
      phone:lead.phone||'',
      email:lead.email||null,
      company:lead.company||null,
      business_type:lead.business_type||null,
      objective:lead.objective||firstAnswerLike(answers,['matlamat','objective']),
      budget:lead.budget||firstAnswerLike(answers,['bajet','budget']),
      timeline:lead.timeline||firstAnswerLike(answers,['bila','timeline','siap','launch']),
      recommended_package:lead.recommended_package||firstAnswerLike(answers,['pakej','package']),
      lead_score:lead.lead_score||null,
      lead_temperature:lead.lead_temperature||null,
      domain_status:lead.domain_status||derivedDomain||null,
      hosting_status:lead.hosting_status||derivedWebsite||null,
      notes:[lead.notes, lead.objective, lead.budget, lead.timeline, lead.recommended_package, invalidLead && '[System] Force converted by Super Admin: invalid/test lead data.', derivedWebsite && `Website: ${derivedWebsite}`, derivedDomain && `Domain: ${derivedDomain}`, derivedMaterial && `Bahan: ${derivedMaterial}`, derivedStyle && `Gaya: ${derivedStyle}`].filter(Boolean).join('\n'),
      prospect_status:'data_review',
      sales_stage:'data_review',
      assigned_staff:(getSession()||{}).staff_id||null
    };
    const {error}=await client.from('prospects').insert(payload);
    if(error){ alert('Gagal convert. Pastikan table prospects sudah wujud dan RLS tidak block.'); return; }
    await client.from('leads').update({status:'converted', updated_at:new Date().toISOString()}).eq('id',lead.id);
    await addLog(client,'convert_prospect',`Lead ${lead.name||lead.id} ditukar kepada prospect`,'lead',lead.id);
    alert('Lead berjaya convert kepada Prospect.'); closeModal(); await loadLeadsPage();
  }



  function canDeleteRecord(module, row){
    const st = String(row?.status || row?.sales_stage || row?.prospect_status || '').toLowerCase();
    if(module==='prospect'){
      return {ok:true, reason:'Prospect akan diarkibkan secara soft delete.'};
    }
    if(module==='quotation'){
      if(['accepted'].includes(normalizeQuotationStatus(row.status))) return {ok:false, reason:'Quotation accepted tidak boleh dipadam. Simpan sebagai rekod jualan.'};
      return {ok:true, reason:'Quotation akan diarkibkan secara soft delete.'};
    }
    if(module==='invoice'){
      const invSt=normalizeInvoiceStatus(row.status);
      if(['paid','partial_paid'].includes(invSt) || Number(row.amount_paid||0)>0) return {ok:false, reason:'Invoice yang sudah ada bayaran tidak boleh dipadam.'};
      return {ok:true, reason:'Invoice draft/sent tanpa bayaran akan diarkibkan.'};
    }
    if(module==='project'){
      const prSt=normalizeProjectStatus(row.status);
      if(['development','review','delivery','completed','cancelled'].includes(prSt)) return {ok:false, reason:'Project yang sudah bergerak/siap tidak boleh dipadam.'};
      return {ok:true, reason:'Project onboarding akan diarkibkan.'};
    }
    return {ok:false, reason:'Module tidak dikenali.'};
  }
  async function verifyDeletePassword(){
    const s=getSession()||{};
    if(!s.staff_id){ alert('Session admin tidak sah. Sila login semula.'); return false; }
    const password = prompt('Masukkan password admin untuk sahkan delete:');
    if(!password) return false;
    const client=await getClient(); if(!client){ alert('Supabase belum tersedia.'); return false; }
    const passwordHash=await sha256(password);
    const {data,error}=await client.from('staff_users').select('staff_id,password_hash,status,role').eq('staff_id',s.staff_id).maybeSingle();
    if(error || !data){ alert('Gagal semak password admin.'); return false; }
    if(data.status!=='active' || data.password_hash!==passwordHash){ alert('Password admin tidak sah. Delete dibatalkan.'); return false; }
    return true;
  }
  async function secureSoftDelete(module, id){
    const client=await getClient(); if(!client) return;
    const tableMap={prospect:'prospects',quotation:'quotations',invoice:'invoices',project:'projects'};
    const table=tableMap[module]; if(!table) return;
    const {data:row,error}=await client.from(table).select('*').eq('id',id).maybeSingle();
    if(error || !row){ alert('Rekod tidak dijumpai.'); return; }
    const rule=canDeleteRecord(module,row);
    if(!rule.ok){ alert(rule.reason); return; }
    const label = row.project_no || row.invoice_no || row.quotation_no || row.name || row.client_name || id;
    const typed = prompt(`WARNING: Anda akan memadam/arkibkan rekod:\n\n${label}\n\n${rule.reason}\n\nTaip DELETE untuk teruskan.`);
    if(String(typed||'').trim()!=='DELETE'){ alert('Delete dibatalkan.'); return; }
    const passOk=await verifyDeletePassword(); if(!passOk) return;
    const s=getSession()||{};
    const payload={deleted_at:new Date().toISOString(), deleted_by:s.staff_id||'system', is_deleted:true, updated_at:new Date().toISOString()};
    const {error:upErr}=await client.from(table).update(payload).eq('id',id);
    if(upErr){ alert(`Gagal delete: ${upErr.message}`); return; }
    try{ await client.from('audit_logs').insert({module,record_id:String(id),record_label:String(label),action:'soft_delete',staff_id:s.staff_id||'system',notes:`${module} archived via secure delete`}); }catch{}
    try{ await addLog(client,`${module}_delete`,`${module} ${label} diarkibkan` ,module,id); }catch{}
    alert('Rekod berjaya diarkibkan.');
    if(module==='prospect') loadProspectsPage();
    if(module==='quotation') loadQuotationsPage();
    if(module==='invoice') loadInvoicesPage();
    if(module==='project') loadProjectsPage();
  }

  async function loadProspectsPage(){
    const client=await getClient(); if(!client) return;
    const {data,error}=await client.from('prospects').select('*').order('created_at',{ascending:false}).limit(200);
    if(error){ const el=qs('#prospectsTableBody'); if(el) el.innerHTML='<tr><td colspan="7"><div class="empty-state">Gagal load prospects. Run SQL Prospect V1 dahulu.</div></td></tr>'; return; }
    prospectsCache=(data||[]).filter(r=>!isDeleted(r));
    renderProspectStats(prospectsCache);
    renderProspectsTable();
  }
  function renderProspectStats(rows){
    const active = rows.filter(r=>normalizeProspectStage(r.sales_stage||r.prospect_status)!=='lost' || true);
    const total=active.length;
    const by=(st)=>active.filter(r=>normalizeProspectStage(r.sales_stage||r.prospect_status)===st).length;
    const won=by('won');
    const rate=total ? Math.round((won/total)*100) : 0;
    const set=(id,val)=>{const el=qs(id); if(el) el.textContent=val;};
    set('#prospectCountTotal',total);
    set('#prospectCountReview',by('data_review'));
    set('#prospectCountNew',by('data_review'));
    set('#prospectCountProposal',by('proposal_sent'));
    set('#prospectCountNegotiation',by('negotiation'));
    set('#prospectCountWon',won);
    set('#prospectCountLost',by('lost'));
    set('#prospectConversionRate',rate+'%');
  }
  function renderProspectsTable(){
    const body=qs('#prospectsTableBody'); if(!body) return;
    const search=(qs('#prospectSearch')?.value||'').toLowerCase().trim();
    const filter=(qs('#prospectStageFilter')?.value||'').toLowerCase();
    let rows=prospectsCache.slice();
    if(filter) rows=rows.filter(r=>normalizeProspectStage(r.sales_stage||r.prospect_status)===filter);
    if(search) rows=rows.filter(r=>[r.name,r.phone,r.business_type,r.company,r.recommended_package,r.notes].join(' ').toLowerCase().includes(search));
    if(!rows.length){body.innerHTML='<tr><td colspan="7"><div class="empty-state">Tiada prospect untuk filter ini.</div></td></tr>';return;}
    body.innerHTML=rows.map(r=>`<tr>
      <td data-label="Nama"><strong>${esc(r.name||'Tanpa nama')}</strong><span class="small-muted">${esc(r.company||r.assigned_staff||'RH')}</span></td>
      <td data-label="Telefon">${esc(r.phone||'-')}<span class="small-muted">${esc(r.email||'')}</span></td>
      <td data-label="Bisnes">${esc(r.business_type||'-')}<span class="small-muted">${esc(r.objective||'')}</span></td>
      <td data-label="Pakej">${esc(r.recommended_package||'-')}<span class="small-muted">${esc(r.budget||'')}</span></td>
      <td data-label="Stage"><span class="status-pill ${statusClass(normalizeProspectStage(r.sales_stage||r.prospect_status))}">${esc(stageLabel(r.sales_stage||r.prospect_status))}</span></td>
      <td data-label="Tarikh">${dateShort(r.created_at)}</td>
      <td data-label="Action"><div class="table-actions"><button class="mini-btn primary" data-view-prospect="${r.id}">View</button><button class="mini-btn" data-edit-prospect="${r.id}">Edit</button><button class="mini-btn" data-stage-prospect="${r.id}" data-stage="proposal_sent">Proposal</button><button class="mini-btn" data-stage-prospect="${r.id}" data-stage="negotiation">Negotiation</button><button class="mini-btn" data-stage-prospect="${r.id}" data-stage="won">Won</button><button class="mini-btn danger" data-lost-prospect="${r.id}">Lost</button><button class="mini-btn danger" data-delete-prospect="${r.id}">Delete</button></div></td>
    </tr>`).join('');
  }

  let prospectDetailState = {tab:'overview', answers:[], logs:[]};
  function renderProspectDetailTab(){
    const el=qs('#prospectDetailContent'); if(!el || !currentProspect) return;
    const tab=prospectDetailState.tab || 'overview';
    qsa('[data-prospect-tab]').forEach(btn=>btn.classList.toggle('active', btn.dataset.prospectTab===tab));
    if(tab==='answers'){
      const answers=prospectDetailState.answers || [];
      el.className='detail-grid';
      el.innerHTML=answers.length?`<div class="detail-item full"><span>Jawapan Aira</span><div class="answer-list">${answers.map(a=>`<div class="answer-item"><b>${esc(a.question||a.question_key||'Soalan')}</b><p>${esc(a.answer||'-')}</p></div>`).join('')}</div></div>`:`<div class="detail-item full"><span>Jawapan Aira</span><strong>Tiada jawapan detail untuk prospect ini.</strong></div>`;
      return;
    }
    if(tab==='timeline'){
      const logs=prospectDetailState.logs || [];
      el.className='detail-grid';
      el.innerHTML=logs.length?`<div class="detail-item full"><span>Sales Timeline</span><div class="timeline-list">${logs.map(l=>`<div class="timeline-item"><b>${esc(stageLabel(l.new_stage||l.action||'Activity'))}</b><small>${esc(dateShort(l.created_at))}</small><p>${esc(l.notes||l.message||'Stage updated')}</p></div>`).join('')}</div></div>`:`<div class="detail-item full"><span>Sales Timeline</span><strong>Belum ada timeline.</strong></div>`;
      return;
    }
    if(tab==='notes'){
      el.className='detail-grid';
      el.innerHTML=`<div class="detail-item full"><span>Internal Notes</span><strong>${esc(currentProspect.notes||'Tiada nota.')}</strong></div><div class="detail-item"><span>Assigned Staff</span><strong>${esc(currentProspect.assigned_staff||'-')}</strong></div><div class="detail-item"><span>Follow Up Date</span><strong>${esc(currentProspect.follow_up_date||'-')}</strong></div><div class="detail-item full"><span>Lost Reason</span><strong>${esc(currentProspect.lost_reason||'-')}</strong></div>`;
      return;
    }
    const fields=[
      ['Nama',currentProspect.name],['Telefon',currentProspect.phone],['Email',currentProspect.email],['Syarikat',currentProspect.company],['Jenis Bisnes',currentProspect.business_type],['Objektif',currentProspect.objective],['Budget',currentProspect.budget],['Timeline',currentProspect.timeline],['Pakej Cadangan',currentProspect.recommended_package],['Lead Score',currentProspect.lead_score],['Temperature',currentProspect.lead_temperature],['Sales Stage',stageLabel(currentProspect.sales_stage)],['Assigned Staff',currentProspect.assigned_staff],['Follow Up Date',currentProspect.follow_up_date],['Domain',currentProspect.domain_status],['Hosting',currentProspect.hosting_status],['Lost Reason',currentProspect.lost_reason],['Notes',currentProspect.notes,'full']
    ];
    el.className='detail-grid';
    el.innerHTML=fields.map(([k,v,full])=>`<div class="detail-item ${full?'full':''}"><span>${esc(k)}</span><strong>${esc(v||'-')}</strong></div>`).join('');
  }
  async function loadProspectLogs(client, prospectId){
    try{
      const {data,error}=await client.from('prospect_stage_logs').select('old_stage,new_stage,notes,changed_by,created_at').eq('prospect_id',prospectId).order('created_at',{ascending:false}).limit(50);
      return error?[]:(data||[]);
    }catch{return [];}
  }
  async function logProspectStage(client, prospectId, oldStage, newStage, notes){
    const s=getSession()||{};
    try{await client.from('prospect_stage_logs').insert({prospect_id:prospectId,old_stage:oldStage||null,new_stage:newStage,notes:notes||`Stage changed to ${stageLabel(newStage)}`,changed_by:s.staff_id||'system'});}catch{}
  }
  async function openProspectModal(prospectId){
    currentProspect=prospectsCache.find(p=>String(p.id)===String(prospectId));
    const client=await getClient();
    if(!currentProspect && client){
      try{const {data}=await client.from('prospects').select('*').eq('id',prospectId).maybeSingle(); if(data) currentProspect=data;}catch{}
    }
    if(!currentProspect) return;
    currentProspect.sales_stage = normalizeProspectStage(currentProspect.sales_stage || currentProspect.prospect_status);
    const modal=qs('#prospectModal'); if(!modal) return;
    qs('#prospectModalTitle').textContent=currentProspect.name||'Prospect Detail';
    qs('#prospectModalSub').textContent=`${currentProspect.phone||'-'} • ${currentProspect.business_type||'Bisnes'} • ${stageLabel(currentProspect.sales_stage)}`;
    let answers=[];
    if(client && currentProspect.lead_id){
      try{const {data,error}=await client.from('lead_answers').select('question,answer,question_key,answer_type,sort_order,created_at').eq('lead_id',currentProspect.lead_id).order('sort_order',{ascending:true}).order('created_at',{ascending:true}); if(!error) answers=data||[];}catch{}
    }
    prospectDetailState={tab:'overview',answers,logs: client ? await loadProspectLogs(client,currentProspect.id) : []};
    renderProspectDetailTab();
    modal.hidden=false;
  }
  function closeProspectModal(){ const m=qs('#prospectModal'); if(m) m.hidden=true; currentProspect=null; }
  async function updateProspectStage(prospectId,stage,notes){
    const client=await getClient(); if(!client) return;
    stage=normalizeProspectStage(stage);
    const old=prospectsCache.find(p=>String(p.id)===String(prospectId)) || currentProspect || {};
    const oldStage=normalizeProspectStage(old.sales_stage||old.prospect_status);
    const payload={sales_stage:stage, prospect_status:stage, updated_at:new Date().toISOString()};
    if(stage==='proposal_sent') payload.proposal_sent_at=new Date().toISOString();
    if(stage==='won') payload.won_at=new Date().toISOString();
    if(stage==='lost') payload.lost_at=new Date().toISOString();
    if(stage==='lost' && notes) payload.lost_reason=notes;
    const {error}=await client.from('prospects').update(payload).eq('id',prospectId);
    if(error){ alert('Gagal update stage prospect.'); return; }
    await logProspectStage(client,prospectId,oldStage,stage,notes||`Moved from ${stageLabel(oldStage)} to ${stageLabel(stage)}`);
    await addLog(client,'prospect_stage',`Prospect ${prospectId} ditukar kepada ${stageLabel(stage)}`,'prospect',prospectId);
    await loadProspectsPage();
    if(currentProspect && String(currentProspect.id)===String(prospectId)){ currentProspect={...currentProspect,...payload}; openProspectModal(prospectId); }
  }
  function openLostReasonModal(prospectId){
    currentProspect=prospectsCache.find(p=>String(p.id)===String(prospectId)) || currentProspect;
    const m=qs('#lostReasonModal'); if(m) m.hidden=false;
  }
  function closeLostReasonModal(){ const m=qs('#lostReasonModal'); if(m) m.hidden=true; }
  async function saveLostReason(e){
    e.preventDefault();
    if(!currentProspect) return;
    const reason=qs('#lostReasonSelect')?.value || 'Lost';
    const note=qs('#lostReasonNotes')?.value.trim();
    const full=[reason,note].filter(Boolean).join(' - ');
    closeLostReasonModal();
    await updateProspectStage(currentProspect.id,'lost',full);
  }


  function setVal(id,val){ const el=qs(id); if(el) el.value=val||''; }
  function openProspectEditModal(prospectId){
    const p = prospectsCache.find(x=>String(x.id)===String(prospectId)) || currentProspect;
    if(!p) return;
    currentProspect = p;
    setVal('#editProspectId', p.id);
    setVal('#editProspectName', p.name);
    setVal('#editProspectPhone', p.phone);
    setVal('#editProspectEmail', p.email);
    setVal('#editProspectCompany', p.company);
    setVal('#editProspectBusiness', p.business_type);
    setVal('#editProspectObjective', p.objective);
    setVal('#editProspectBudget', p.budget);
    setVal('#editProspectTimeline', p.timeline);
    setVal('#editProspectPackage', p.recommended_package);
    setVal('#editProspectStage', normalizeProspectStage(p.sales_stage || p.prospect_status));
    setVal('#editProspectDomain', p.domain_status);
    setVal('#editProspectHosting', p.hosting_status);
    setVal('#editProspectAssignedStaff', p.assigned_staff);
    setVal('#editProspectFollowUp', p.follow_up_date ? String(p.follow_up_date).slice(0,10) : '');
    setVal('#editProspectNotes', p.notes);
    const modal=qs('#prospectEditModal'); if(modal) modal.hidden=false;
  }
  function closeProspectEditModal(){ const m=qs('#prospectEditModal'); if(m) m.hidden=true; }
  async function saveProspectEdit(e){
    e.preventDefault();
    const client=await getClient(); if(!client) return;
    const id=qs('#editProspectId')?.value;
    if(!id){ alert('Prospect ID tidak dijumpai.'); return; }
    const stage=normalizeProspectStage(qs('#editProspectStage')?.value || 'data_review');
    const payload={
      name:qs('#editProspectName')?.value.trim()||'Tanpa nama',
      phone:qs('#editProspectPhone')?.value.trim()||'',
      email:qs('#editProspectEmail')?.value.trim()||null,
      company:qs('#editProspectCompany')?.value.trim()||null,
      business_type:qs('#editProspectBusiness')?.value.trim()||null,
      objective:qs('#editProspectObjective')?.value.trim()||null,
      budget:qs('#editProspectBudget')?.value.trim()||null,
      timeline:qs('#editProspectTimeline')?.value.trim()||null,
      recommended_package:qs('#editProspectPackage')?.value||null,
      sales_stage:stage,
      prospect_status:stage,
      domain_status:qs('#editProspectDomain')?.value.trim()||null,
      hosting_status:qs('#editProspectHosting')?.value.trim()||null,
      assigned_staff:qs('#editProspectAssignedStaff')?.value.trim()||null,
      follow_up_date:qs('#editProspectFollowUp')?.value||null,
      notes:qs('#editProspectNotes')?.value.trim()||null,
      updated_at:new Date().toISOString()
    };
    const {error}=await client.from('prospects').update(payload).eq('id',id);
    if(error){ alert('Gagal save prospect. Semak RLS atau column prospects.'); return; }
    const oldStage = normalizeProspectStage((currentProspect||{}).sales_stage || (currentProspect||{}).prospect_status);
    if(oldStage !== stage) await logProspectStage(client,id,oldStage,stage,'Stage changed from edit form');
    await addLog(client,'prospect_edit',`Prospect ${payload.name} dikemaskini`,'prospect',id);
    closeProspectEditModal(); closeProspectModal(); await loadProspectsPage();
  }

  async function saveProspectForm(e){
    e.preventDefault();
    const client=await getClient(); if(!client) return;
    const payload={
      name:qs('#prospectName')?.value.trim()||'Tanpa nama',
      phone:qs('#prospectPhone')?.value.trim()||'',
      email:qs('#prospectEmail')?.value.trim()||null,
      company:qs('#prospectCompany')?.value.trim()||null,
      business_type:qs('#prospectBusiness')?.value.trim()||null,
      recommended_package:qs('#prospectPackage')?.value||null,
      notes:qs('#prospectNotes')?.value.trim()||null,
      prospect_status:'data_review',
      sales_stage:'data_review',
      assigned_staff:(getSession()||{}).staff_id||null
    };
    const {error}=await client.from('prospects').insert(payload);
    if(error){ alert('Gagal tambah prospect. Semak table prospects/RLS.'); return; }
    e.target.reset();
    qs('#manualProspectPanel')?.setAttribute('hidden','');
    await addLog(client,'prospect_create',`Prospect ${payload.name} ditambah manual`,'prospect','');
    await loadProspectsPage();
  }



  const PACKAGE_TEMPLATES = {
    'RH Basic': {price:799, items:[['Website basic / personal web',1,799]]},
    'RH Starter': {price:1299, items:[['Website starter untuk bisnes kecil',1,999],['SEO asas + setup halaman',1,200],['Basic lead capture',1,100]]},
    'RH Growth': {price:1999, items:[['Website service / company profile',1,1299],['AI chatbot Aira setup',1,400],['Blog / artikel module basic',1,200],['SEO asas + performance setup',1,100]]},
    'RH Ecosystem': {price:2999, items:[['Company profile website',1,1299],['Service / product listing structure',1,700],['Advanced AI chatbot Aira',1,500],['Blog CMS + SEO setup',1,300],['Basic dashboard / lead management',1,200]]},
    'Custom': {price:0, items:[['Custom website development',1,0]]}
  };
  function quotationStatusLabel(v){ const m={draft:'Draft',sent:'Sent',accepted:'Accepted',rejected:'Rejected',expired:'Expired'}; return m[String(v||'draft').toLowerCase()]||String(v||'Draft'); }
  function normalizeQuotationStatus(v){ const k=String(v||'draft').toLowerCase(); return ['draft','sent','accepted','rejected','expired'].includes(k)?k:'draft'; }
  function getPackageName(v){
    const s=String(v||'').toLowerCase();
    if(s.includes('ecosystem')) return 'RH Ecosystem';
    if(s.includes('growth')) return 'RH Growth';
    if(s.includes('starter')) return 'RH Starter';
    if(s.includes('basic')) return 'RH Basic';
    return v || 'RH Growth';
  }
  function packageTemplate(name){ return PACKAGE_TEMPLATES[getPackageName(name)] || PACKAGE_TEMPLATES['RH Growth']; }
  const PACKAGE_PUBLIC_DESCRIPTIONS = {
    'RH Basic': ['Website basic / personal web', 'Reka bentuk responsive untuk mobile dan desktop', 'Struktur halaman asas untuk bisnes', 'Setup borang/CTA lead asas', 'SEO asas dan konfigurasi teknikal permulaan'],
    'RH Starter': ['Website starter untuk bisnes kecil', 'Halaman penting bisnes dan servis', 'SEO asas + setup halaman', 'Basic lead capture', 'Struktur sedia untuk kempen promosi'],
    'RH Growth': ['Website service / company profile', 'AI chatbot Aira setup', 'Blog / artikel module basic', 'SEO asas + performance setup', 'Lead capture dan struktur conversion'],
    'RH Ecosystem': ['Company profile website', 'Service / product listing structure', 'Advanced AI chatbot Aira', 'Blog CMS + SEO setup', 'Basic dashboard / lead management'],
    'Custom': ['Skop custom berdasarkan keperluan projek', 'Fungsi dan harga tertakluk kepada pengesahan scope', 'Timeline akan disahkan selepas sesi discovery']
  };
  function packagePublicBullets(name){ return PACKAGE_PUBLIC_DESCRIPTIONS[getPackageName(name)] || PACKAGE_PUBLIC_DESCRIPTIONS['RH Growth']; }
  function packagePublicHtml(name){ return `<ul class="quote-package-list">${packagePublicBullets(name).map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`; }
  async function nextQuotationNo(client){
    const year=new Date().getFullYear();
    try{const {count}=await client.from('quotations').select('*',{count:'exact',head:true}); return `QT-${year}-${String((count||0)+1).padStart(4,'0')}`;}catch{return `QT-${year}-${String(Date.now()).slice(-4)}`;}
  }
  function quoteAmount(q){ return Number(q.grand_total ?? q.total_amount ?? 0); }
  function quoteClientNotes(q){
    // Client-facing quotation must never expose raw Aira answers, FAQ topics, internal notes or sales qualification data.
    const fallback='Quotation pembangunan website dan sistem digital berdasarkan pakej yang dipersetujui.';
    const raw=String(q?.client_notes || q?.quotation_notes || '').trim();
    if(!raw) return fallback;
    const looksInternal=/FAQ topics|Aira Answers|Apakah|Adakah|Budget anggaran|Nombor WhatsApp|Domain:|Hosting:|\[system\]|marked for review|invalid test name|semak data/i.test(raw);
    if(looksInternal) return fallback;
    const cleaned=raw.split(/\n+/).filter(line=>!/\s*(internal|system|staff|admin)\s*:/i.test(line) && !/\[system\]/i.test(line)).join(' ').trim();
    return cleaned || fallback;
  }
  function quoteValidUntil(q){
    if(q?.valid_until) return q.valid_until;
    if(q?.expiry_date) return q.expiry_date;
    const base=q?.created_at ? new Date(q.created_at) : new Date();
    if(Number.isNaN(base.getTime())) return null;
    base.setDate(base.getDate()+14);
    return base.toISOString().slice(0,10);
  }
  function quoteWatermark(q){
    const st=normalizeQuotationStatus(q?.status);
    if(st==='accepted') return '<div class="quote-watermark accepted">ACCEPTED</div>';
    if(st==='rejected') return '<div class="quote-watermark rejected">REJECTED</div>';
    return '';
  }
  function quoteActionsHtml(q){
    const st=normalizeQuotationStatus(q.status);
    const view=`<button class="mini-btn primary" data-view-quotation="${q.id}">View</button>`;
    const del=`<button class="mini-btn danger" data-delete-quotation="${q.id}">Delete</button>`;
    if(st==='accepted') return `${view}<span class="small-muted">Locked: accepted</span>${del}`;
    if(st==='rejected') return `${view}<span class="small-muted">Locked: rejected</span>${del}`;
    if(st==='sent') return `${view}<button class="mini-btn" data-quote-status="${q.id}" data-status="accepted">Accept</button><button class="mini-btn danger" data-quote-status="${q.id}" data-status="rejected">Reject</button>${del}`;
    return `${view}<button class="mini-btn" data-quote-status="${q.id}" data-status="sent">Sent</button><button class="mini-btn danger" data-quote-status="${q.id}" data-status="rejected">Reject</button>${del}`;
  }
  function syncQuotationModalActions(q){
    const st=normalizeQuotationStatus(q?.status);
    const sent=qs('#quoteSentBtn'), accepted=qs('#quoteAcceptedBtn'), rejected=qs('#quoteRejectedBtn'), genInvoice=qs('#generateInvoiceFromQuoteBtn');
    [sent,accepted,rejected].forEach(btn=>{ if(btn){ btn.hidden=false; btn.disabled=false; }});
    if(genInvoice) genInvoice.hidden = st !== 'accepted';
    if(st==='draft') { if(accepted) accepted.hidden=true; }
    if(st==='sent') { if(sent) sent.hidden=true; }
    if(st==='accepted' || st==='rejected' || st==='expired') [sent,accepted,rejected].forEach(btn=>{ if(btn) btn.hidden=true; });
  }
  async function loadQuotationsPage(){
    const client=await getClient(); if(!client) return;
    const {data,error}=await client.from('quotations').select('*').order('created_at',{ascending:false}).limit(200);
    if(error){ const el=qs('#quotationsTableBody'); if(el) el.innerHTML='<tr><td colspan="7"><div class="empty-state">Gagal load quotations. Run SQL Quotation V1 dahulu.</div></td></tr>'; return; }
    quotationsCache=(data||[]).filter(r=>!isDeleted(r));
    renderQuotationStats(quotationsCache);
    renderQuotationsTable();
  }
  function renderQuotationStats(rows){
    const set=(id,v)=>{const el=qs(id); if(el) el.textContent=v};
    const by=st=>rows.filter(r=>normalizeQuotationStatus(r.status)===st).length;
    set('#quoteCountTotal', rows.length);
    set('#quoteCountDraft', by('draft'));
    set('#quoteCountSent', by('sent'));
    set('#quoteCountAccepted', by('accepted'));
    set('#quoteCountRejected', by('rejected'));
    set('#quoteTotalValue', fmtRM(rows.reduce((a,b)=>a+quoteAmount(b),0)));
  }
  function renderQuotationsTable(){
    const body=qs('#quotationsTableBody'); if(!body) return;
    const search=(qs('#quotationSearch')?.value||'').toLowerCase().trim();
    const filter=(qs('#quotationStatusFilter')?.value||'').toLowerCase();
    let rows=quotationsCache.slice();
    if(filter) rows=rows.filter(r=>normalizeQuotationStatus(r.status)===filter);
    if(search) rows=rows.filter(r=>[r.quotation_no,r.client_name,r.phone,r.company,r.business_type].join(' ').toLowerCase().includes(search));
    if(!rows.length){ body.innerHTML='<tr><td colspan="7"><div class="empty-state">Tiada quotation untuk filter ini.</div></td></tr>'; return; }
    body.innerHTML=rows.map(q=>`<tr>
      <td data-label="No"><strong>${esc(q.quotation_no||'-')}</strong><span class="small-muted">${esc(q.package_name||'')}</span></td>
      <td data-label="Client"><strong>${esc(q.client_name||'Client')}</strong><span class="small-muted">${esc(q.phone||'-')}</span></td>
      <td data-label="Bisnes">${esc(q.business_type||'-')}<span class="small-muted">${esc(q.company||'')}</span></td>
      <td data-label="Amount"><strong>${fmtRM(quoteAmount(q))}</strong><span class="small-muted">Discount ${fmtRM(q.discount||0)}</span></td>
      <td data-label="Status"><span class="status-pill ${normalizeQuotationStatus(q.status)}">${quotationStatusLabel(q.status)}</span></td>
      <td data-label="Tarikh">${dateShort(q.created_at)}</td>
      <td data-label="Action"><div class="table-actions">${quoteActionsHtml(q)}</div></td>
    </tr>`).join('');
  }
  async function loadProspectsForQuotation(){
    const client=await getClient(); if(!client) return [];
    try{const {data}=await client.from('prospects').select('*').order('created_at',{ascending:false}).limit(200); return data||[];}catch{return prospectsCache||[];}
  }
  async function openQuotationCreateModal(prospectId){
    const modal=qs('#quotationCreateModal'); if(!modal) return;
    const prospects=await loadProspectsForQuotation();
    const select=qs('#quoteProspectSelect');
    if(select){
      select.innerHTML=prospects.map(p=>`<option value="${p.id}">${esc(p.name||'Prospect')} • ${esc(p.phone||'-')} • ${esc(p.business_type||'Bisnes')}</option>`).join('');
      if(prospectId) select.value=prospectId;
    }
    const exp=qs('#quoteExpiryDate'); if(exp){ const d=new Date(); d.setDate(d.getDate()+14); exp.value=d.toISOString().slice(0,10); }
    modal.hidden=false;
  }
  function closeQuotationCreateModal(){ const m=qs('#quotationCreateModal'); if(m) m.hidden=true; }
  async function createQuotationFromProspect(prospectId, opts={}){
    const client=await getClient(); if(!client) return null;
    let prospect=(prospectsCache||[]).find(p=>String(p.id)===String(prospectId)) || currentProspect;
    if(!prospect || String(prospect.id)!==String(prospectId)){
      const {data}=await client.from('prospects').select('*').eq('id',prospectId).maybeSingle(); prospect=data;
    }
    if(!prospect){ alert('Prospect tidak dijumpai.'); return null; }
    const pkg=getPackageName(opts.package_name || prospect.recommended_package || prospect.budget || 'RH Growth');
    const tpl=packageTemplate(pkg);
    const discount=Number(opts.discount||0), tax=Number(opts.tax||0);
    const items=tpl.items.map(([description,qty,unit_price],i)=>({description,qty,unit_price,amount:Number(qty)*Number(unit_price),sort_order:i+1}));
    const subtotal=items.reduce((a,b)=>a+Number(b.amount||0),0);
    const grand=Math.max(0, subtotal - discount + tax);
    const quotation_no=await nextQuotationNo(client);
    const defaultExpiry=(()=>{const d=new Date(); d.setDate(d.getDate()+14); return d.toISOString().slice(0,10);})();
    const expiryDate=opts.expiry_date||defaultExpiry;
    const payload={quotation_no,prospect_id:prospect.id,client_name:prospect.name||'Client',phone:prospect.phone||null,email:prospect.email||null,company:prospect.company||null,business_type:prospect.business_type||null,package_name:pkg,subtotal,discount,tax,grand_total:grand,total_amount:grand,status:'draft',notes:prospect.notes||null,client_notes:opts.notes||null,expiry_date:expiryDate,valid_until:expiryDate,created_by:(getSession()||{}).staff_id||'system'};
    const {data,error}=await client.from('quotations').insert(payload).select('*').single();
    if(error){ alert('Gagal generate quotation. Semak table quotations/RLS.'); return null; }
    const itemPayload=items.map(it=>({...it,quotation_id:data.id}));
    try{await client.from('quotation_items').insert(itemPayload);}catch{}
    await updateProspectStage(prospect.id,'proposal_sent',`Quotation ${quotation_no} generated`);
    await addLog(client,'quotation_create',`Quotation ${quotation_no} dijana untuk ${payload.client_name}`,'quotation',data.id);
    return data;
  }
  async function submitQuotationCreate(e){
    e.preventDefault();
    const prospectId=qs('#quoteProspectSelect')?.value;
    if(!prospectId){ alert('Pilih prospect dahulu.'); return; }
    const q=await createQuotationFromProspect(prospectId,{package_name:qs('#quotePackageSelect')?.value,discount:Number(qs('#quoteDiscount')?.value||0),tax:Number(qs('#quoteTax')?.value||0),expiry_date:qs('#quoteExpiryDate')?.value||null,notes:qs('#quoteNotes')?.value.trim()||null});
    if(q){ closeQuotationCreateModal(); await loadQuotationsPage(); openQuotationModal(q.id); }
  }
  async function openQuotationModal(id){
    const client=await getClient(); if(!client) return;
    let q=quotationsCache.find(x=>String(x.id)===String(id));
    if(!q){ const {data}=await client.from('quotations').select('*').eq('id',id).maybeSingle(); q=data; }
    if(!q) return;
    currentQuotation=q;
    let items=[]; try{const {data}=await client.from('quotation_items').select('*').eq('quotation_id',id).order('sort_order',{ascending:true}); items=data||[];}catch{}
    qs('#quotationModalTitle').textContent=q.quotation_no||'Quotation';
    qs('#quotationModalSub').textContent=`${q.client_name||'Client'} • ${fmtRM(quoteAmount(q))} • ${quotationStatusLabel(q.status)}`;
    renderQuotationPreview(q,items);
    syncQuotationModalActions(q);
    const m=qs('#quotationModal'); if(m) m.hidden=false;
  }
  function closeQuotationModal(){ const m=qs('#quotationModal'); if(m) m.hidden=true; currentQuotation=null; }
  function renderQuotationPreview(q,items){
    const el=qs('#quotationPreview'); if(!el) return;
    const validUntil=quoteValidUntil(q);
    el.innerHTML=`<div class="quote-document">${quoteWatermark(q)}<div class="quote-head"><div style="display:flex;gap:12px;align-items:center"><img src="../assets/rh-logo.png" alt="RH"><div><h2>Restu Harmoni Digital Solutions</h2><p>Website, AI Chatbot & Digital System</p></div></div><div class="quote-meta"><h2>${esc(q.quotation_no||'Quotation')}</h2><p>Status: ${quotationStatusLabel(q.status)}</p><p>Date: ${dateShort(q.created_at)}</p><p>Valid until: ${validUntil?dateShort(validUntil):'-'}</p></div></div>
      <div class="quote-grid"><div class="quote-box"><span>Bill To</span><strong>${esc(q.client_name||'Client')}</strong><p>${esc(q.company||q.business_type||'-')}<br>${esc(q.phone||'-')}${q.email?'<br>'+esc(q.email):''}</p></div><div class="quote-box"><span>Package</span><strong>${esc(q.package_name||'-')}</strong><p>${esc(quoteClientNotes(q))}</p>${packagePublicHtml(q.package_name)}</div></div>
      <table class="quote-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${(items||[]).map(i=>`<tr><td>${esc(i.description)}</td><td>${Number(i.qty||1)}</td><td>${fmtRM(i.unit_price||0)}</td><td>${fmtRM(i.amount||0)}</td></tr>`).join('')}</tbody></table>
      <div class="quote-total"><div><span>Subtotal</span><strong>${fmtRM(q.subtotal||0)}</strong></div><div><span>Discount</span><strong>${fmtRM(q.discount||0)}</strong></div><div><span>Tax/SST</span><strong>${fmtRM(q.tax||0)}</strong></div><div class="grand"><span>Grand Total</span><strong>${fmtRM(quoteAmount(q))}</strong></div></div>
      <div class="quote-signature-grid"><div><strong>Prepared By</strong><span>RH Admin<br>Restu Harmoni Digital Solutions</span><em></em></div><div><strong>Client Approval</strong><span>Name:<br>Date:</span><em></em></div></div>
      <div class="quote-footer"><strong>Restu Harmoni Digital Solutions</strong><br>Website • AI Chatbot • Digital System<br>services.restuharmoni.com<br><br>Quotation valid for 14 days from issue date. Prices are subject to final project scope confirmation.</div></div>`;
  }

  function printCurrentQuotationSingleSource(){
    const src=qs('#quotationPreview .quote-document');
    if(!src){ alert('Quotation preview belum tersedia.'); return; }
    const old=qs('#rhPrintRoot'); if(old) old.remove();
    const root=document.createElement('div');
    root.id='rhPrintRoot';
    root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="quotation-print-shell"></div>';
    const clone=src.cloneNode(true);
    root.querySelector('.quotation-print-shell').appendChild(clone);
    document.body.appendChild(root);
    document.body.classList.add('rh-printing-quotation');
    const cleanup=()=>{document.body.classList.remove('rh-printing-quotation'); root.remove(); window.removeEventListener('afterprint',cleanup);};
    window.addEventListener('afterprint',cleanup);
    setTimeout(()=>window.print(),80);
    setTimeout(()=>{ if(document.body.classList.contains('rh-printing-quotation')) cleanup(); },30000);
  }

  async function updateQuotationStatus(id,status){
    const client=await getClient(); if(!client) return;
    status=normalizeQuotationStatus(status);
    const qExisting=quotationsCache.find(x=>String(x.id)===String(id)) || currentQuotation;
    if(['accepted','rejected','expired'].includes(normalizeQuotationStatus(qExisting?.status))){ alert('Quotation ini sudah locked.'); return; }
    const payload={status,updated_at:new Date().toISOString()};
    if(status==='sent') payload.sent_at=new Date().toISOString();
    if(status==='accepted') payload.accepted_at=new Date().toISOString();
    if(status==='rejected') payload.rejected_at=new Date().toISOString();
    const {error}=await client.from('quotations').update(payload).eq('id',id);
    if(error){ alert('Gagal update status quotation.'); return; }
    const q=qExisting;
    if(q?.prospect_id){
      if(status==='sent') await updateProspectStage(q.prospect_id,'proposal_sent',`Quotation ${q.quotation_no||''} marked sent`);
      if(status==='accepted') await updateProspectStage(q.prospect_id,'won',`Quotation ${q.quotation_no||''} accepted`);
      if(status==='rejected') await updateProspectStage(q.prospect_id,'lost',`Quotation ${q.quotation_no||''} rejected`);
    }
    await addLog(client,'quotation_status',`Quotation ${id} ditukar kepada ${quotationStatusLabel(status)}`,'quotation',id);
    await loadQuotationsPage();
    if(currentQuotation && String(currentQuotation.id)===String(id)) openQuotationModal(id);
  }


  function normalizeInvoiceStatus(v){
    const k=String(v||'draft').toLowerCase();
    return ['draft','sent','partial_paid','paid','overdue','cancelled'].includes(k)?k:'draft';
  }
  function invoiceStatusLabel(v){
    const m={draft:'Draft',sent:'Sent',partial_paid:'Partial Paid',paid:'Paid',overdue:'Overdue',cancelled:'Cancelled'};
    return m[normalizeInvoiceStatus(v)] || 'Draft';
  }
  function invoiceAmount(inv){ return Number(inv?.grand_total ?? inv?.total_amount ?? 0); }
  function invoiceBalance(inv){
    const total=invoiceAmount(inv);
    const paid=Number(inv?.amount_paid||0);
    const deposit=invoiceDepositAmount(inv);
    if(paid<=0 && deposit>0){
      const afterDeposit = Number(inv?.balance_after_deposit ?? (total-deposit));
      return Math.max(0, afterDeposit);
    }
    return Math.max(0, total-paid);
  }
  function invoiceOriginalAmount(inv){ return Number(inv?.original_amount ?? inv?.subtotal ?? inv?.total_amount ?? inv?.grand_total ?? 0); }
  function invoiceDepositAmount(inv){ return Number(inv?.deposit_amount ?? 0); }
  function invoiceDepositBalance(inv){ return Math.max(0, invoiceAmount(inv)-invoiceDepositAmount(inv)); }
  function selectedInvoiceQuotationAmount(){
    const id=qs('#invoiceQuotationSelect')?.value;
    const q=invoiceAcceptedQuotesCache.find(x=>String(x.id)===String(id));
    return q ? quoteAmount(q) : 0;
  }
  function recalcInvoiceCreateTotals(){
    const original=selectedInvoiceQuotationAmount();
    const discount=Math.max(0, Number(qs('#invoiceDiscount')?.value||0));
    const net=Math.max(0, original-discount);
    const type=qs('#invoiceDepositType')?.value || 'percent';
    const val=Math.max(0, Number(qs('#invoiceDepositValue')?.value||0));
    const deposit= type==='fixed' ? Math.min(net,val) : Math.min(net, net*(val/100));
    const balance=Math.max(0, net-deposit);
    if(qs('#invoiceOriginalAmount')) qs('#invoiceOriginalAmount').value=original.toFixed(2);
    if(qs('#invoiceNetAmount')) qs('#invoiceNetAmount').value=net.toFixed(2);
    if(qs('#invoiceDepositAmount')) qs('#invoiceDepositAmount').value=deposit.toFixed(2);
    if(qs('#invoiceBalanceAfterDeposit')) qs('#invoiceBalanceAfterDeposit').value=balance.toFixed(2);
    updateInvoiceDepositLabel();
  }
  function addDaysISO(days){ const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
  function addDaysFromISO(dateISO, days){
    const d=dateISO ? new Date(dateISO+'T00:00:00') : new Date();
    d.setDate(d.getDate()+days);
    return d.toISOString().slice(0,10);
  }
  function updateInvoiceDepositLabel(){
    const type=qs('#invoiceDepositType')?.value || 'percent';
    const label=qs('#invoiceDepositValueLabel');
    if(!label) return;
    const input=qs('#invoiceDepositValue');
    const note='<small class="field-note">'+(type==='fixed'?'Jumlah deposit dalam RM.':'Tukar kepada RM jika pilih Fixed Amount.')+'</small>';
    label.childNodes[0].nodeValue = type==='fixed' ? 'Deposit Fixed Amount (RM)' : 'Deposit Percentage (%)';
    const old=label.querySelector('.field-note'); if(old) old.remove();
    label.insertAdjacentHTML('beforeend', note);
    if(input && type==='percent' && Number(input.value)>100) input.value=50;
  }
  async function loadInvoiceBankDetails(){
    const fallback='Maybank / Restu Harmoni Digital Solutions / XXXXXXXXXX';
    try{
      const client=await getClient(); if(!client) return fallback;
      const {data,error}=await client.from('system_settings').select('setting_value').eq('setting_key','invoice_bank_details').maybeSingle();
      if(!error && data?.setting_value) return data.setting_value;
    }catch{}
    try{return localStorage.getItem('rh_invoice_bank_details') || fallback;}catch{return fallback;}
  }
  async function nextInvoiceNo(client){
    const year=new Date().getFullYear();
    try{const {count}=await client.from('invoices').select('*',{count:'exact',head:true}); return `INV-${year}-${String((count||0)+1).padStart(4,'0')}`;}catch{return `INV-${year}-${String(Date.now()).slice(-4)}`;}
  }
  async function invoiceTimeline(client, invoiceId, action, note){
    const s=getSession()||{};
    try{ await client.from('invoice_timeline').insert({invoice_id:invoiceId, action, note, created_by:s.staff_id||'system'}); }catch{}
  }
  function invoiceActionsHtml(inv){
    const st=normalizeInvoiceStatus(inv.status);
    const view=`<button class="mini-btn primary" data-view-invoice="${inv.id}">View</button>`;
    const del=`<button class="mini-btn danger" data-delete-invoice="${inv.id}">Delete</button>`;
    if(st==='paid') return `${view}<span class="small-muted">Locked: paid</span>${del}`;
    if(st==='cancelled') return `${view}<span class="small-muted">Locked: cancelled</span>${del}`;
    if(st==='draft') return `${view}<button class="mini-btn" data-invoice-status="${inv.id}" data-status="sent">Sent</button><button class="mini-btn" data-pay-invoice="${inv.id}">Paid</button><button class="mini-btn danger" data-invoice-status="${inv.id}" data-status="cancelled">Cancel</button>${del}`;
    if(st==='sent' || st==='overdue' || st==='partial_paid') return `${view}<button class="mini-btn" data-pay-invoice="${inv.id}">Paid</button><button class="mini-btn danger" data-invoice-status="${inv.id}" data-status="cancelled">Cancel</button>${del}`;
    return view;
  }
  async function loadInvoicesPage(){
    const client=await getClient(); if(!client) return;
    const {data,error}=await client.from('invoices').select('*').order('created_at',{ascending:false}).limit(200);
    if(error){ const el=qs('#invoicesTableBody'); if(el) el.innerHTML='<tr><td colspan="7"><div class="empty-state">Gagal load invoices. Run SQL Invoice V1 dahulu.</div></td></tr>'; return; }
    invoicesCache=(data||[]).filter(r=>!isDeleted(r));
    renderInvoiceStats(invoicesCache);
    renderInvoicesTable();
  }
  function renderInvoiceStats(rows){
    const by=st=>rows.filter(r=>normalizeInvoiceStatus(r.status)===st).length;
    const total=rows.length;
    const outstanding=rows.filter(r=>['draft','sent','partial_paid','overdue'].includes(normalizeInvoiceStatus(r.status))).length;
    const paid=by('paid');
    const overdue=by('overdue');
    // V1.0.2: Revenue must be based on verified/recorded amount_paid, not only fully-paid invoice status.
    const totalInvoiceValue=rows.reduce((a,b)=>a+invoiceAmount(b),0);
    const revenue=rows.reduce((a,b)=>a+Number(b.amount_paid||0),0);
    const rate=totalInvoiceValue?Math.round((revenue/totalInvoiceValue)*100):0;
    const set=(id,val)=>{const el=qs(id); if(el) el.textContent=val;};
    set('#invoiceCountTotal', total); set('#invoiceCountOutstanding', outstanding); set('#invoiceCountPaid', paid); set('#invoiceCountOverdue', overdue); set('#invoiceRevenue', fmtRM(revenue)); set('#invoiceCollectionRate', `${rate}%`);
  }
  function renderInvoicesTable(){
    const body=qs('#invoicesTableBody'); if(!body) return;
    const search=(qs('#invoiceSearch')?.value||'').toLowerCase().trim();
    const filter=(qs('#invoiceStatusFilter')?.value||'').toLowerCase();
    let rows=invoicesCache.slice();
    if(filter) rows=rows.filter(r=>normalizeInvoiceStatus(r.status)===filter);
    if(search) rows=rows.filter(r=>[r.invoice_no,r.client_name,r.phone,r.company,r.business_type,r.quotation_no].join(' ').toLowerCase().includes(search));
    if(!rows.length){ body.innerHTML='<tr><td colspan="7"><div class="empty-state">Tiada invoice untuk filter ini.</div></td></tr>'; return; }
    body.innerHTML=rows.map(inv=>`<tr>
      <td data-label="No"><strong>${esc(inv.invoice_no||'-')}</strong><span class="small-muted">${esc(inv.package_name||'')}</span></td>
      <td data-label="Client"><strong>${esc(inv.client_name||'-')}</strong><span class="small-muted">${esc(inv.phone||'')}</span></td>
      <td data-label="Quotation">${esc(inv.quotation_no||'-')}</td>
      <td data-label="Amount"><strong>${fmtRM(invoiceAmount(inv))}</strong><span class="small-muted">Paid ${fmtRM(inv.amount_paid||0)}</span></td>
      <td data-label="Status"><span class="status-pill ${normalizeInvoiceStatus(inv.status)}">${invoiceStatusLabel(inv.status)}</span></td>
      <td data-label="Due">${dateShort(inv.due_date||inv.created_at)}</td>
      <td data-label="Action"><div class="table-actions">${invoiceActionsHtml(inv)}</div></td>
    </tr>`).join('');
  }
  async function loadAcceptedQuotationsForInvoice(){
    const client=await getClient(); if(!client) return [];
    const {data}=await client.from('quotations').select('*').eq('status','accepted').order('created_at',{ascending:false}).limit(200);
    invoiceAcceptedQuotesCache=data||[];
    return invoiceAcceptedQuotesCache;
  }
  async function openInvoiceCreateModal(quotationId){
    const modal=qs('#invoiceCreateModal'); if(!modal) return;
    const quotes=await loadAcceptedQuotationsForInvoice();
    const sel=qs('#invoiceQuotationSelect');
    if(sel){
      sel.innerHTML=quotes.length ? quotes.map(q=>`<option value="${q.id}">${esc(q.quotation_no)} — ${esc(q.client_name)} — ${fmtRM(quoteAmount(q))}</option>`).join('') : '<option value="">Tiada accepted quotation</option>';
      if(quotationId) sel.value=quotationId;
    }
    const today=new Date().toISOString().slice(0,10);
    if(qs('#invoiceIssueDate')) qs('#invoiceIssueDate').value=today;
    if(qs('#invoiceDueDate')) qs('#invoiceDueDate').value=addDaysFromISO(today,14);
    if(qs('#invoiceBankDetails')) qs('#invoiceBankDetails').value=await loadInvoiceBankDetails();
    updateInvoiceDepositLabel();
    recalcInvoiceCreateTotals();
    modal.hidden=false;
  }
  function closeInvoiceCreateModal(){ const m=qs('#invoiceCreateModal'); if(m) m.hidden=true; }
  async function createInvoiceFromQuotation(quotationId, opts={}){
    const client=await getClient(); if(!client) return null;
    if(!quotationId){ alert('Pilih quotation dahulu.'); return null; }
    const {data:q,error:qErr}=await client.from('quotations').select('*').eq('id',quotationId).maybeSingle();
    if(qErr || !q){ alert('Quotation tidak dijumpai.'); return null; }
    if(normalizeQuotationStatus(q.status)!=='accepted'){ alert('Hanya accepted quotation boleh dijadikan invoice.'); return null; }
    try{ const {data:existing}=await client.from('invoices').select('*').eq('quotation_id',quotationId).maybeSingle(); if(existing){ alert('Invoice untuk quotation ini sudah wujud.'); await loadInvoicesPage(); openInvoiceModal(existing.id); return existing; } }catch{}
    const invoice_no=await nextInvoiceNo(client);
    const originalAmount=quoteAmount(q);
    const discount=Math.max(0, Number(opts.discount||0));
    const tax=Number(q.tax||0);
    const netAmount=Math.max(0, originalAmount-discount+tax);
    const depositType=opts.deposit_type || 'percent';
    const depositValue=Math.max(0, Number(opts.deposit_value ?? 50));
    const depositAmount=depositType==='fixed' ? Math.min(netAmount,depositValue) : Math.min(netAmount, netAmount*(depositValue/100));
    const payload={
      invoice_no, quotation_id:q.id, prospect_id:q.prospect_id||null, quotation_no:q.quotation_no||null,
      client_name:q.client_name||'Client', phone:q.phone||null, email:q.email||null, company:q.company||null,
      business_type:q.business_type||null, package_name:q.package_name||null,
      original_amount:originalAmount, subtotal:originalAmount, discount, tax, net_amount:netAmount, grand_total:netAmount, total_amount:netAmount,
      deposit_type:depositType, deposit_value:depositValue, deposit_amount:depositAmount,
      amount_paid:0, balance_due:Math.max(0, netAmount-depositAmount), balance_after_deposit:Math.max(0, netAmount-depositAmount), status:'draft',
      issued_date:opts.issued_date || new Date().toISOString().slice(0,10), due_date:opts.due_date || addDaysFromISO(opts.issued_date || new Date().toISOString().slice(0,10),14),
      payment_terms:opts.payment_terms || '50% deposit, 50% before handover',
      bank_details:opts.bank_details || 'Maybank / Restu Harmoni Digital Solutions / XXXXXXXXXX',
      notes:opts.notes || null, created_by:(getSession()||{}).staff_id||'system'
    };
    let inv=null;
    try{
      const inserted=await supabaseRestInsert('invoices', payload);
      inv=inserted[0];
    }catch(err){
      console.error('[INVOICE GENERATE ERROR]', err, err.details || '');
      alert(`Gagal generate invoice: ${err.message}`);
      return null;
    }
    let qItems=[]; try{const {data}=await client.from('quotation_items').select('*').eq('quotation_id',q.id).order('sort_order',{ascending:true}); qItems=data||[];}catch{}
    const invItems=qItems.map(it=>({invoice_id:inv.id,quotation_item_id:it.id,description:it.description,qty:it.qty,unit_price:it.unit_price,amount:it.amount,sort_order:it.sort_order||0}));
    if(invItems.length) try{await supabaseRestInsert('invoice_items', invItems);}catch(err){console.warn('[INVOICE ITEMS INSERT WARNING]', err);}
    await invoiceTimeline(client, inv.id, 'Invoice Created', `Generated from quotation ${q.quotation_no||''}`);
    await addLog(client,'invoice_create',`Invoice ${invoice_no} dijana untuk ${payload.client_name}`,'invoice',inv.id);
    return inv;
  }
  async function submitInvoiceCreate(e){
    e.preventDefault();
    const quotationId=qs('#invoiceQuotationSelect')?.value;
    const inv=await createInvoiceFromQuotation(quotationId,{
      issued_date:qs('#invoiceIssueDate')?.value||null,
      due_date:qs('#invoiceDueDate')?.value||null,
      discount:Number(qs('#invoiceDiscount')?.value||0),
      deposit_type:qs('#invoiceDepositType')?.value||'percent',
      deposit_value:Number(qs('#invoiceDepositValue')?.value||0),
      payment_terms:qs('#invoicePaymentTerms')?.value||'',
      bank_details:qs('#invoiceBankDetails')?.value||'',
      notes:qs('#invoiceNotes')?.value.trim()||null
    });
    if(inv){ closeInvoiceCreateModal(); await loadInvoicesPage(); openInvoiceModal(inv.id); }
  }
  async function openInvoiceModal(id){
    const client=await getClient();
    if(!client){ alert('Supabase client belum tersedia. Refresh halaman dan cuba semula.'); return; }
    try{
      let inv=invoicesCache.find(x=>String(x.id)===String(id));
      if(!inv){
        const {data,error}=await client.from('invoices').select('*').eq('id',id).maybeSingle();
        if(error) throw new Error(`[VIEW INVOICE] ${error.message}`);
        inv=data;
      }
      if(!inv){ alert('Invoice tidak dijumpai.'); return; }
      currentInvoice=inv;
      let items=[], payments=[], timeline=[];
      const itemsRes=await client.from('invoice_items').select('*').eq('invoice_id',id).order('sort_order',{ascending:true});
      if(itemsRes.error) console.warn('[VIEW INVOICE ITEMS WARNING]', itemsRes.error);
      items=itemsRes.data||[];
      const paymentsRes=await client.from('invoice_payments').select('*').eq('invoice_id',id).order('created_at',{ascending:false});
      if(paymentsRes.error) console.warn('[VIEW INVOICE PAYMENTS WARNING]', paymentsRes.error);
      payments=paymentsRes.data||[];
      const timelineRes=await client.from('invoice_timeline').select('*').eq('invoice_id',id).order('created_at',{ascending:false});
      if(timelineRes.error) console.warn('[VIEW INVOICE TIMELINE WARNING]', timelineRes.error);
      timeline=timelineRes.data||[];
      qs('#invoiceModalTitle').textContent=inv.invoice_no||'Invoice';
      qs('#invoiceModalSub').textContent=`${inv.client_name||'Client'} • ${fmtRM(invoiceAmount(inv))} • ${invoiceStatusLabel(inv.status)}`;
      renderInvoicePreview(inv, items, payments, timeline);
      syncInvoiceModalActions(inv);
      const m=qs('#invoiceModal'); if(m) m.hidden=false;
    }catch(err){
      console.error('[VIEW INVOICE ERROR]', err);
      alert(`Gagal buka invoice: ${err.message||err}`);
    }
  }
  function closeInvoiceModal(){ const m=qs('#invoiceModal'); if(m) m.hidden=true; currentInvoice=null; }
  function invoiceWatermark(inv){
    const st=normalizeInvoiceStatus(inv?.status);
    if(st==='paid') return '<div class="quote-watermark accepted">PAID</div>';
    if(st==='cancelled') return '<div class="quote-watermark rejected">CANCELLED</div>';
    if(st==='overdue') return '<div class="quote-watermark rejected">OVERDUE</div>';
    return '';
  }


  function latestVerifiedPayment(payments=[]){
    const list=Array.isArray(payments)?payments:[];
    return list
      .filter(p=>String(p.status||'').toLowerCase()==='verified')
      .sort((a,b)=>new Date(b.payment_date||b.verified_at||b.created_at||0)-new Date(a.payment_date||a.verified_at||a.created_at||0))[0] || null;
  }

  function renderInvoicePreview(inv, items, payments=[], timeline=[]){
    const el=qs('#invoicePreview'); if(!el) return;
    const due=inv.due_date || addDaysISO(7);
    const rows=(items||[]).length ? items : [{description:inv.package_name||'Website development service',qty:1,unit_price:invoiceAmount(inv),amount:invoiceAmount(inv)}];
    const paid=Number(inv.amount_paid||0);
    const balance=invoiceBalance(inv);
    el.innerHTML=`<div class="quote-document single-source-template invoice-document">${invoiceWatermark(inv)}
      <div class="quote-head"><div style="display:flex;gap:12px;align-items:center"><img src="../assets/rh-logo.png" alt="RH"><div><h2>Restu Harmoni Digital Solutions</h2><p>Website, AI Chatbot & Digital System</p></div></div><div class="quote-meta"><h2>${esc(inv.invoice_no||'Invoice')}</h2><p>Status: ${invoiceStatusLabel(inv.status)}</p><p>Issue Date: ${dateShort(inv.issued_date||inv.created_at)}</p><p>Due Date: ${dateShort(due)}</p></div></div>
      <div class="quote-grid"><div class="quote-box"><span>Bill To</span><strong>${esc(inv.client_name||'-')}</strong><p>${esc(inv.business_type||'')}<br>${esc(inv.phone||'')}<br>${esc(inv.email||'')}</p></div><div class="quote-box"><span>Payment Info</span><strong>${esc(inv.payment_terms||'Payment terms as agreed')}</strong><p>${esc(inv.bank_details||'Maybank / Restu Harmoni Digital Solutions / XXXXXXXXXX')}</p></div></div>
      <div class="quote-grid"><div class="quote-box"><span>Deposit Required</span><strong>${fmtRM(invoiceDepositAmount(inv))}</strong><p>${esc(inv.deposit_type==='fixed'?'Fixed amount':((Number(inv.deposit_value||0))+'% deposit'))}<br>Project may start after deposit received.</p></div><div class="quote-box"><span>Balance After Deposit</span><strong>${fmtRM(invoiceDepositBalance(inv))}</strong><p>Balance is payable before final handover unless agreed otherwise.</p></div></div>
      <table class="quote-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rows.map(it=>`<tr><td>${esc(it.description)}</td><td>${Number(it.qty||1)}</td><td>${fmtRM(it.unit_price||0)}</td><td>${fmtRM(it.amount||0)}</td></tr>`).join('')}</tbody></table>
      <div class="quote-total"><div><span>Original Amount</span><strong>${fmtRM(invoiceOriginalAmount(inv))}</strong></div><div><span>Discount</span><strong>${fmtRM(inv.discount||0)}</strong></div><div><span>Tax/SST</span><strong>${fmtRM(inv.tax||0)}</strong></div><div class="grand"><span>Invoice Total</span><strong>${fmtRM(invoiceAmount(inv))}</strong></div><div><span>Deposit Required</span><strong>${fmtRM(invoiceDepositAmount(inv))}</strong></div><div><span>Paid</span><strong>${fmtRM(paid)}</strong></div><div class="grand"><span>Balance Due</span><strong>${fmtRM(balance)}</strong></div></div>
      ${paymentHistoryHtml(payments)}
      <div class="quote-signature-grid"><div><strong>Prepared By</strong><span>RH Admin<br>Restu Harmoni Digital Solutions</span><em></em></div><div><strong>Payment Confirmation</strong><span>Reference: ${esc((latestVerifiedPayment(payments)||{}).reference_no||'-')}<br>Date: ${esc(dateShort((latestVerifiedPayment(payments)||{}).payment_date||(latestVerifiedPayment(payments)||{}).created_at)||'-')}</span><em></em></div></div>
      <div class="invoice-timeline-print"><strong>Payment Timeline</strong>${timeline.length?timeline.slice(0,4).map(t=>`<p>${dateShort(t.created_at)} — ${esc(t.action||'Update')}: ${esc(t.note||'')}</p>`).join(''):'<p>Invoice generated. Awaiting payment.</p>'}</div>
      <div class="quote-footer"><strong>Restu Harmoni Digital Solutions</strong><br>Website • AI Chatbot • Digital System<br>services.restuharmoni.com<br><br>This invoice is computer generated by RH Admin. Please make payment before due date and send proof of payment for confirmation.</div>
    </div>`;
  }
  function syncInvoiceModalActions(inv){
    const st=normalizeInvoiceStatus(inv?.status);
    const sent=qs('#invoiceSentBtn'), paid=qs('#invoicePaidBtn'), overdue=qs('#invoiceOverdueBtn'), project=qs('#createProjectFromInvoiceBtn'), cancel=qs('#invoiceCancelBtn');
    [sent,paid,overdue,project,cancel].forEach(btn=>{if(btn){btn.hidden=false;btn.disabled=false;}});
    if(st==='draft'){ if(overdue) overdue.hidden=true; if(project) project.hidden=true; }
    if(st==='sent' || st==='partial_paid' || st==='overdue'){ if(sent) sent.hidden=true; }
    if(st==='sent' || st==='overdue'){ if(project) project.hidden=true; }
    if(st==='paid'){ [sent,paid,overdue,cancel].forEach(btn=>{if(btn) btn.hidden=true;}); if(project) project.hidden=false; }
    if(st==='cancelled'){ [sent,paid,overdue,project,cancel].forEach(btn=>{if(btn) btn.hidden=true;}); }
  }
  function printCurrentInvoice(){
    const src=qs('#invoicePreview .quote-document'); if(!src){ alert('Invoice preview belum tersedia.'); return; }
    qs('#rhPrintRoot')?.remove();
    const root=document.createElement('div'); root.id='rhPrintRoot'; root.innerHTML='<div class="quotation-print-shell"></div>';
    root.querySelector('.quotation-print-shell').appendChild(src.cloneNode(true));
    document.body.appendChild(root); document.body.classList.add('rh-printing-quotation');
    const cleanup=()=>{document.body.classList.remove('rh-printing-quotation'); root.remove(); window.removeEventListener('afterprint',cleanup);};
    window.addEventListener('afterprint',cleanup); window.print(); setTimeout(()=>{ if(document.body.classList.contains('rh-printing-quotation')) cleanup(); },30000);
  }
  async function updateInvoiceStatus(id,status){
    const client=await getClient(); if(!client) return;
    status=normalizeInvoiceStatus(status);
    const invExisting=invoicesCache.find(x=>String(x.id)===String(id)) || currentInvoice;
    if(['paid','cancelled'].includes(normalizeInvoiceStatus(invExisting?.status))){ alert('Invoice ini sudah locked.'); return; }
    const payload={status,updated_at:new Date().toISOString()};
    if(status==='sent') payload.sent_at=new Date().toISOString();
    if(status==='cancelled') payload.cancelled_at=new Date().toISOString();
    const {error}=await client.from('invoices').update(payload).eq('id',id);
    if(error){ alert('Gagal update invoice status.'); return; }
    await invoiceTimeline(client,id,`Invoice ${invoiceStatusLabel(status)}`,`Status changed to ${invoiceStatusLabel(status)}`);
    await addLog(client,'invoice_status',`Invoice ${id} ditukar kepada ${invoiceStatusLabel(status)}`,'invoice',id);
    await loadInvoicesPage(); if(currentInvoice && String(currentInvoice.id)===String(id)) openInvoiceModal(id);
  }
  async function uploadPaymentReceipt(client, invoiceNo){
    const input=qs('#paymentReceiptFile');
    const file=input && input.files && input.files[0] ? input.files[0] : null;
    if(!file) return {url: qs('#paymentProofUrl')?.value || null, path: null, mime: null};
    const allowed=['application/pdf','image/png','image/jpeg','image/webp'];
    if(!allowed.includes(file.type)) throw new Error('Format resit tidak dibenarkan. Sila upload PDF, JPG, PNG atau WEBP.');
    const safeInvoice=String(invoiceNo||'invoice').replace(/[^a-zA-Z0-9_-]/g,'-');
    const ext=(file.name.split('.').pop()||'bin').toLowerCase();
    const path=`${safeInvoice}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const {error}=await client.storage.from('payment-receipts').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
    if(error) throw new Error(`Upload receipt gagal: ${error.message}`);
    const {data:publicData}=client.storage.from('payment-receipts').getPublicUrl(path);
    return {url: publicData?.publicUrl || path, path, mime:file.type};
  }
  async function openReceiptFile(url,path){
    const client=await getClient();
    if(!client){ alert('Supabase client belum tersedia untuk buka resit.'); return; }
    let target=url||'';
    try{
      if(path){
        const {data,error}=await client.storage.from('payment-receipts').createSignedUrl(path,60*10);
        if(!error && data?.signedUrl) target=data.signedUrl;
      }
      if(!target && path){
        const {data}=client.storage.from('payment-receipts').getPublicUrl(path);
        target=data?.publicUrl || '';
      }
      if(!target){ alert('URL resit tidak dijumpai.'); return; }
      window.open(target,'_blank','noopener');
    }catch(err){
      console.error('[OPEN RECEIPT ERROR]', err);
      alert(`Gagal buka resit: ${err.message||err}`);
    }
  }
  function paymentHistoryHtml(payments){
    if(!payments || !payments.length) return '<div class="payment-history"><strong>Payment History</strong><p>Belum ada rekod bayaran.</p></div>';
    return `<div class="payment-history"><strong>Payment History</strong>${payments.map(p=>`<div class="payment-history-row"><span>${dateShort(p.payment_date||p.created_at)}</span><b>${fmtRM(p.amount||0)}</b><small>${esc(p.payment_type||'payment')} • ${esc(p.status||'verified')} • ${esc(p.payment_method||'')}</small>${p.reference_no?`<em>${esc(p.reference_no)}</em>`:''}${(p.proof_url||p.receipt_path)?`<button type="button" class="mini-btn receipt-btn" data-open-receipt data-url="${esc(p.proof_url||'')}" data-path="${esc(p.receipt_path||'')}">Receipt</button>`:''}</div>`).join('')}</div>`;
  }
  function openPaymentModal(id){
    const inv=invoicesCache.find(x=>String(x.id)===String(id)) || currentInvoice;
    if(!inv) return;
    currentInvoice=inv;
    if(qs('#paymentDate')) qs('#paymentDate').value=new Date().toISOString().slice(0,10);
    if(qs('#paymentAmount')) qs('#paymentAmount').value=(Number(inv.amount_paid||0)<=0 && invoiceDepositAmount(inv)>0 ? invoiceDepositAmount(inv) : invoiceBalance(inv)||invoiceAmount(inv)).toFixed(2);
    if(qs('#paymentType')) qs('#paymentType').value=Number(inv.amount_paid||0)<=0 ? 'deposit' : 'final';
    if(qs('#paymentProofUrl')) qs('#paymentProofUrl').value='';
    if(qs('#paymentReceiptFile')) qs('#paymentReceiptFile').value='';
    const m=qs('#paymentModal'); if(m) m.hidden=false;
  }
  function closePaymentModal(){ const m=qs('#paymentModal'); if(m) m.hidden=true; }
  async function savePayment(e){
    e.preventDefault(); const client=await getClient(); if(!client || !currentInvoice) return;
    const amount=Number(qs('#paymentAmount')?.value||0);
    if(!amount || amount<=0){ alert('Jumlah bayaran mesti lebih daripada RM0.'); return; }
    try{
      const receipt=await uploadPaymentReceipt(client,currentInvoice.invoice_no);
      const payload={
        invoice_id:currentInvoice.id,
        payment_date:qs('#paymentDate')?.value||new Date().toISOString().slice(0,10),
        amount,
        payment_type:qs('#paymentType')?.value||'payment',
        payment_method:qs('#paymentMethod')?.value||'bank_transfer',
        reference_no:qs('#paymentReference')?.value||null,
        proof_url:receipt.url||null,
        receipt_path:receipt.path||null,
        receipt_mime_type:receipt.mime||null,
        status:'verified',
        verified_by:(getSession()||{}).staff_id||'system',
        verified_at:new Date().toISOString(),
        notes:qs('#paymentNotes')?.value||null,
        created_by:(getSession()||{}).staff_id||'system'
      };
      const {error}=await client.from('invoice_payments').insert(payload);
      if(error) throw error;
      const wasPaid=Number(currentInvoice.amount_paid||0);
      const total=invoiceAmount(currentInvoice);
      const newPaid=Math.min(total, wasPaid+amount);
      const newBalance=Math.max(0,total-newPaid);
      const newStatus=newBalance<=0?'paid':'partial_paid';
      const upd={amount_paid:newPaid,balance_due:newBalance,status:newStatus,updated_at:new Date().toISOString()};
      if(newStatus==='paid') upd.paid_at=new Date().toISOString();
      if(newStatus==='partial_paid' && wasPaid<=0) upd.project_start_ready=true;
      const {error:updError}=await client.from('invoices').update(upd).eq('id',currentInvoice.id);
      if(updError) throw updError;
      await invoiceTimeline(client,currentInvoice.id,newStatus==='paid'?'Invoice Paid':'Partial Payment Verified',`${fmtRM(amount)} verified${payload.reference_no?' - '+payload.reference_no:''}`);
      if(wasPaid<=0 && newStatus==='partial_paid'){
        await invoiceTimeline(client,currentInvoice.id,'Project Start Ready','Deposit received. Project creation can be triggered from Project Module.');
      }
      await addLog(client,'invoice_payment',`Bayaran ${fmtRM(amount)} direkod dan disahkan untuk ${currentInvoice.invoice_no}`,'invoice',currentInvoice.id);
      closePaymentModal(); await loadInvoicesPage(); openInvoiceModal(currentInvoice.id);
    }catch(err){
      console.error('[PAYMENT SAVE ERROR]',err);
      alert(`Gagal simpan bayaran: ${err.message||err}`);
    }
  }



  function normalizeProjectStatus(st){ return String(st||'new_project').toLowerCase().replace(/\s+/g,'_'); }
  function projectStatusLabel(st){
    const map={new_project:'New Project',onboarding:'Onboarding',content_collection:'Content Collection',design:'Design',development:'Development',review:'Review',delivery:'Delivery',completed:'Completed',on_hold:'On Hold',cancelled:'Cancelled'};
    return map[normalizeProjectStatus(st)] || (st||'-');
  }
  function projectProgress(st){
    const map={new_project:0,onboarding:0,content_collection:20,design:35,development:60,review:80,delivery:92,completed:100,on_hold:50,cancelled:0};
    return map[normalizeProjectStatus(st)] ?? 0;
  }
  function clampProjectProgress(val){
    const n=Number(val||0);
    if(!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }
  function projectProgressFromRecord(p){
    if(!p) return 0;
    if(['completed'].includes(normalizeProjectStatus(p.status))) return 100;
    if(['cancelled'].includes(normalizeProjectStatus(p.status))) return 0;
    if(p.progress!==undefined && p.progress!==null) return clampProjectProgress(p.progress);
    return projectProgress(p.status);
  }
  function taskProgress(tasks=[]){
    const total=(tasks||[]).length;
    if(!total) return 0;
    const done=(tasks||[]).filter(t=>String(t.status||'').toLowerCase()==='done').length;
    return clampProjectProgress((done/total)*100);
  }
  function projectAmount(p){ return Number(p.project_value||p.total_amount||p.amount||0); }
  async function nextProjectNo(client){
    const year=new Date().getFullYear();
    try{ const {count}=await client.from('projects').select('*',{count:'exact',head:true}); return `PRJ-${year}-${String((count||0)+1).padStart(4,'0')}`; }catch{return `PRJ-${year}-${String(Date.now()).slice(-4)}`;}
  }
  async function projectTimeline(client, projectId, action, note){
    const s=getSession()||{};
    try{ await client.from('project_timeline').insert({project_id:projectId, action, note, created_by:s.staff_id||'system'}); }catch(err){ console.warn('[PROJECT TIMELINE WARNING]', err); }
  }
  function projectTaskTemplates(pkg,business){
    const base=[
      ['Client onboarding & kick-off','onboarding'],
      ['Collect website content, logo and brand assets','content_collection'],
      ['Prepare sitemap and page structure','content_collection'],
      ['Create homepage UI draft','design'],
      ['Develop website pages','development'],
      ['Setup lead form / Aira connection','development'],
      ['Mobile responsive QA','review'],
      ['SEO meta, OG image and sitemap check','review'],
      ['Client review and revision','review'],
      ['Final delivery / handover','delivery']
    ];
    const name=String(pkg||'').toLowerCase();
    if(name.includes('ecosystem') || name.includes('growth')) base.splice(6,0,['Setup dashboard / admin access','development'],['Blog / article CMS QA','review']);
    if(String(business||'').toLowerCase().includes('rental')) base.splice(5,0,['Setup service/product listing structure','development']);
    return base.map((t,i)=>({title:t[0],stage:t[1],status:'todo',sort_order:i+1}));
  }
  async function seedProjectTasks(client, project){
    const tasks=projectTaskTemplates(project.package_name, project.business_type).map(t=>({
      project_id:project.id,
      task_title:t.title,
      stage:t.stage,
      status:t.status,
      sort_order:t.sort_order,
      assigned_to:project.assigned_pm||'SUPER001',
      created_by:(getSession()||{}).staff_id||'system'
    }));
    try{ await client.from('project_tasks').insert(tasks); }catch(err){ console.warn('[PROJECT TASK SEED WARNING]', err); }
  }
  function departmentTemplates(project={}){
    const pm=project.assigned_pm||'SUPER001';
    return [
      {department_key:'pm', department_name:'Project Management', stage:'onboarding', owner:pm, sort_order:1, status:'active'},
      {department_key:'content', department_name:'Content Collection', stage:'content_collection', owner:'Content Team', sort_order:2, status:'pending'},
      {department_key:'design', department_name:'UI / Design', stage:'design', owner:'Design Team', sort_order:3, status:'pending'},
      {department_key:'development', department_name:'Development', stage:'development', owner:'Dev Team', sort_order:4, status:'pending'},
      {department_key:'seo', department_name:'SEO & Technical', stage:'review', owner:'SEO Team', sort_order:5, status:'pending'},
      {department_key:'qa', department_name:'QA Review', stage:'review', owner:'QA Team', sort_order:6, status:'pending'},
      {department_key:'delivery', department_name:'Delivery / Handover', stage:'delivery', owner:'Delivery Team', sort_order:7, status:'pending'}
    ];
  }
  function departmentStatusLabel(st){
    const map={pending:'Pending',active:'Active',in_progress:'In Progress',review:'Review',completed:'Completed',blocked:'Blocked'};
    return map[String(st||'pending').toLowerCase()] || (st||'Pending');
  }
  async function loadProjectDepartments(client, projectId){
    try{ const {data,error}=await client.from('project_departments').select('*').eq('project_id',projectId).order('sort_order',{ascending:true}); if(error) throw error; return data||[]; }
    catch(err){ console.warn('[PROJECT DEPARTMENTS LOAD WARNING]', err); return []; }
  }
  async function seedProjectDepartments(client, project){
    if(!project?.id) return [];
    const existing=await loadProjectDepartments(client, project.id);
    if(existing.length) return existing;
    const rows=departmentTemplates(project).map(d=>({
      project_id:project.id,
      department_key:d.department_key,
      department_name:d.department_name,
      stage:d.stage,
      owner_staff:d.owner,
      status:d.status,
      progress:0,
      sort_order:d.sort_order,
      created_by:(getSession()||{}).staff_id||'system'
    }));
    try{
      const {data,error}=await client.from('project_departments').insert(rows).select();
      if(error) throw error;
      return data||rows;
    }catch(err){ console.warn('[PROJECT DEPARTMENTS SEED WARNING]', err); return rows; }
  }
  function departmentProgressFromTasks(dept,tasks=[]){
    const stage=String(dept.stage||'').toLowerCase();
    let scoped=(tasks||[]).filter(t=>String(t.stage||'').toLowerCase()===stage);
    if(dept.department_key==='seo') scoped=(tasks||[]).filter(t=>/seo|meta|og|sitemap/i.test(t.task_title||''));
    if(dept.department_key==='qa') scoped=(tasks||[]).filter(t=>String(t.stage||'').toLowerCase()==='review' && !/seo|meta|og|sitemap/i.test(t.task_title||''));
    if(!scoped.length) return clampProjectProgress(dept.progress||0);
    const done=scoped.filter(t=>String(t.status||'').toLowerCase()==='done').length;
    return clampProjectProgress((done/scoped.length)*100);
  }
  async function syncProjectDepartmentsProgress(client, projectId, tasks){
    const departments=await loadProjectDepartments(client, projectId);
    for(const d of departments){
      const progress=departmentProgressFromTasks(d,tasks||[]);
      const nextStatus=progress>=100?'completed':(progress>0 && String(d.status).toLowerCase()==='pending'?'in_progress':d.status);
      try{ await client.from('project_departments').update({progress,status:nextStatus,updated_at:new Date().toISOString()}).eq('id',d.id); }catch{}
    }
  }
  async function updateProjectDepartmentStatus(departmentId,status){
    const client=await getClient(); if(!client) return;
    const next=String(status||'pending').toLowerCase();
    const {data:dept,error}=await client.from('project_departments').update({status:next,updated_at:new Date().toISOString()}).eq('id',departmentId).select().maybeSingle();
    if(error){ alert('Gagal update department.'); return; }
    if(dept){ await projectTimeline(client,dept.project_id,'Department Update',`${dept.department_name||dept.department_key} moved to ${departmentStatusLabel(next)}.`); }
    if(currentProject) openProjectModal(currentProject.id);
  }
  async function loadProjectReadyInvoices(){
    const client=await getClient(); if(!client) return [];
    const {data:projects}=await client.from('projects').select('invoice_id').not('invoice_id','is',null);
    const used=new Set((projects||[]).map(p=>String(p.invoice_id)));
    const {data,error}=await client.from('invoices').select('*').in('status',['partial_paid','paid']).order('created_at',{ascending:false}).limit(200);
    if(error){ console.error('[PROJECT READY INVOICES ERROR]', error); return []; }
    return (data||[]).filter(i=>!used.has(String(i.id)) && Number(i.amount_paid||0)>0);
  }
  async function createProjectFromInvoice(invoiceId){
    const client=await getClient(); if(!client) return null;
    if(!invoiceId){ alert('Pilih invoice dahulu.'); return null; }
    const {data:inv,error:invErr}=await client.from('invoices').select('*').eq('id',invoiceId).maybeSingle();
    if(invErr || !inv){ alert('Invoice tidak dijumpai.'); return null; }
    const invStatus=normalizeInvoiceStatus(inv.status);
    if(!['partial_paid','paid'].includes(invStatus) || Number(inv.amount_paid||0)<=0){
      alert('Project hanya boleh dijana selepas deposit/bayaran diterima.');
      return null;
    }
    try{
      const {data:existing}=await client.from('projects').select('*').eq('invoice_id',invoiceId).maybeSingle();
      if(existing){ alert('Project untuk invoice ini sudah wujud.'); await loadProjectsPage(); openProjectModal(existing.id); return existing; }
    }catch{}
    const project_no=await nextProjectNo(client);
    const start=new Date().toISOString().slice(0,10);
    const due=addDaysFromISO(start,14);
    const payload={
      project_no,
      invoice_id:inv.id,
      quotation_id:inv.quotation_id||null,
      prospect_id:inv.prospect_id||null,
      client_name:inv.client_name||'Client',
      phone:inv.phone||null,
      email:inv.email||null,
      company:inv.company||null,
      business_type:inv.business_type||null,
      package_name:inv.package_name||null,
      project_value:invoiceAmount(inv),
      amount_paid:Number(inv.amount_paid||0),
      balance_due:Number(inv.balance_due||0),
      status:'onboarding',
      progress:0,
      priority:Number(inv.balance_due||0)<=0?'high':'normal',
      assigned_pm:(getSession()||{}).staff_id||'SUPER001',
      assigned_team:'RH Delivery',
      start_date:start,
      due_date:due,
      source:'invoice',
      notes:`Generated from ${inv.invoice_no||'invoice'} after verified payment. Amount paid: ${fmtRM(inv.amount_paid||0)}. Balance: ${fmtRM(inv.balance_due||0)}.`,
      created_by:(getSession()||{}).staff_id||'system'
    };
    try{
      const {data:inserted,error}=await client.from('projects').insert(payload).select().single();
      if(error) throw error;
      const project=inserted;
      await seedProjectTasks(client, project);
      await seedProjectDepartments(client, project);
      await projectTimeline(client, project.id, 'Project Created', `Project generated from invoice ${inv.invoice_no||''}`);
      await projectTimeline(client, project.id, 'Onboarding', 'Default workflow started at Onboarding with 0% progress.');
      try{ await client.from('invoices').update({project_start_ready:true,project_started_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',inv.id); }catch{}
      await addLog(client,'project_created',`Project ${project_no} dijana dari ${inv.invoice_no}`,'project',project.id);
      await loadProjectsPage(); openProjectModal(project.id); return project;
    }catch(err){ console.error('[PROJECT CREATE ERROR]',err); alert(err.message || 'Gagal create project. Semak table projects/RLS.'); return null; }
  }
  function projectActionsHtml(p){
    const st=normalizeProjectStatus(p.status);
    const view=`<button class="mini-btn primary" data-view-project="${p.id}">View</button>`;
    const del=`<button class="mini-btn danger" data-delete-project="${p.id}">Delete</button>`;
    if(['completed','cancelled'].includes(st)) return `${view}<span class="small-muted">Locked: ${projectStatusLabel(st)}</span>${del}`;
    return `${view}<button class="mini-btn" data-project-stage="${p.id}" data-status="onboarding">Onboard</button><button class="mini-btn" data-project-stage="${p.id}" data-status="development">Dev</button><button class="mini-btn" data-project-stage="${p.id}" data-status="review">Review</button><button class="mini-btn" data-project-stage="${p.id}" data-status="delivery">Delivery</button><button class="mini-btn primary" data-project-stage="${p.id}" data-status="completed">Complete</button>${del}`;
  }
  async function loadProjectsPage(){
    const client=await getClient(); if(!client) return;
    const {data,error}=await client.from('projects').select('*').order('created_at',{ascending:false}).limit(200);
    if(error){ const el=qs('#projectsTableBody'); if(el) el.innerHTML='<tr><td colspan="7"><div class="empty-state">Gagal load projects. Run SQL Project V1.0 Full Build dahulu.</div></td></tr>'; console.error('[PROJECT LOAD ERROR]', error); return; }
    projectsCache=(data||[]).filter(r=>!isDeleted(r)); renderProjectStats(projectsCache); renderProjectsTable();
  }
  function renderProjectStats(rows){
    const by=st=>rows.filter(r=>normalizeProjectStatus(r.status)===st).length;
    const active=rows.filter(r=>!['completed','cancelled'].includes(normalizeProjectStatus(r.status))).length;
    const overdue=rows.filter(r=>r.due_date && new Date(r.due_date+'T23:59:59')<new Date() && !['completed','cancelled'].includes(normalizeProjectStatus(r.status))).length;
    const value=rows.reduce((a,b)=>a+projectAmount(b),0);
    const set=(id,val)=>{const el=qs(id); if(el) el.textContent=val;};
    set('#projectCountTotal', rows.length); set('#projectCountActive', active); set('#projectCountOnboarding', by('onboarding')+by('new_project')+by('content_collection')); set('#projectCountDevelopment', by('development')+by('design')); set('#projectCountReview', by('review')+by('delivery')); set('#projectCountCompleted', by('completed')); set('#projectCountOverdue', overdue); set('#projectValueTotal', fmtRM(value));
  }
  function renderProjectsTable(){
    const body=qs('#projectsTableBody'); if(!body) return;
    const search=(qs('#projectSearch')?.value||'').toLowerCase().trim();
    const filter=(qs('#projectStatusFilter')?.value||'').toLowerCase();
    let rows=projectsCache.slice();
    if(filter) rows=rows.filter(r=>normalizeProjectStatus(r.status)===filter);
    if(search) rows=rows.filter(r=>[r.project_no,r.client_name,r.phone,r.company,r.business_type,r.package_name,r.assigned_pm].join(' ').toLowerCase().includes(search));
    if(!rows.length){ body.innerHTML='<tr><td colspan="7"><div class="empty-state">Tiada project untuk filter ini.</div></td></tr>'; return; }
    body.innerHTML=rows.map(p=>`<tr>
      <td data-label="No"><strong>${esc(p.project_no||'-')}</strong><span class="small-muted">${esc(p.package_name||'')}</span></td>
      <td data-label="Client"><strong>${esc(p.client_name||'-')}</strong><span class="small-muted">${esc(p.phone||'')}</span></td>
      <td data-label="Bisnes">${esc(p.business_type||'-')}</td>
      <td data-label="Value"><strong>${fmtRM(projectAmount(p))}</strong><span class="small-muted">Paid ${fmtRM(p.amount_paid||0)} • Balance ${fmtRM(p.balance_due||0)}</span></td>
      <td data-label="Status"><span class="status-pill ${normalizeProjectStatus(p.status)}">${projectStatusLabel(p.status)}</span><span class="small-muted">${projectProgressFromRecord(p)}%</span></td>
      <td data-label="Due">${dateShort(p.due_date||p.created_at)}</td>
      <td data-label="Action"><div class="table-actions">${projectActionsHtml(p)}</div></td>
    </tr>`).join('');
  }
  async function openProjectCreateModal(){
    const modal=qs('#projectCreateModal'); if(!modal) return;
    const invs=await loadProjectReadyInvoices();
    const sel=qs('#projectInvoiceSelect');
    if(sel){
      sel.innerHTML=invs.length ? invs.map(i=>`<option value="${i.id}">${esc(i.invoice_no)} — ${esc(i.client_name)} — Paid ${fmtRM(i.amount_paid||0)} — Balance ${fmtRM(i.balance_due||0)}</option>`).join('') : '<option value="">Tiada invoice deposit/paid yang belum jadi project</option>';
    }
    modal.hidden=false;
  }
  function closeProjectCreateModal(){ const m=qs('#projectCreateModal'); if(m) m.hidden=true; }
  async function submitProjectCreate(e){ e.preventDefault(); const id=qs('#projectInvoiceSelect')?.value; if(!id){alert('Tiada invoice dipilih.'); return;} await createProjectFromInvoice(id); closeProjectCreateModal(); }
  async function loadProjectTasks(client, projectId){
    try{ const {data}=await client.from('project_tasks').select('*').eq('project_id',projectId).order('sort_order',{ascending:true}); return data||[]; }catch{return [];}
  }
  async function openProjectModal(id){
    const client=await getClient(); if(!client) return;
    let p=projectsCache.find(x=>String(x.id)===String(id));
    if(!p){ const {data}=await client.from('projects').select('*').eq('id',id).maybeSingle(); p=data; }
    if(!p) return;
    currentProject=p;
    const {data:timeline}=await client.from('project_timeline').select('*').eq('project_id',p.id).order('created_at',{ascending:false}).limit(50);
    const tasks=await loadProjectTasks(client,p.id);
    await seedProjectDepartments(client,p);
    await syncProjectDepartmentsProgress(client,p.id,tasks||[]);
    const departments=await loadProjectDepartments(client,p.id);
    qs('#projectModalTitle').textContent=p.project_no||'Project';
    qs('#projectModalSub').textContent=`${p.client_name||'-'} • ${p.business_type||'-'} • ${projectStatusLabel(p.status)}`;
    qs('#projectPreview').innerHTML=renderProjectDetail(p,timeline||[],tasks||[],departments||[]);
    syncProjectModalActions(p);
    qs('#projectModal').hidden=false;
  }
  function closeProjectModal(){ const m=qs('#projectModal'); if(m) m.hidden=true; currentProject=null; }
  function renderProjectDetail(p,timeline,tasks,departments=[]){
    const doneTasks=(tasks||[]).filter(t=>String(t.status).toLowerCase()==='done').length;
    const totalTasks=(tasks||[]).length;
    const liveProgress=taskProgress(tasks);
    const shownProgress=['completed'].includes(normalizeProjectStatus(p.status))?100:(totalTasks?liveProgress:projectProgressFromRecord(p));
    const fields=[['Client',p.client_name],['Phone',p.phone],['Email',p.email],['Company',p.company],['Business',p.business_type],['Package',p.package_name],['Project Value',fmtRM(projectAmount(p))],['Amount Paid',fmtRM(p.amount_paid||0)],['Balance',fmtRM(p.balance_due||0)],['Status',projectStatusLabel(p.status)],['Progress',shownProgress+'%'],['Tasks',`${doneTasks}/${totalTasks}`],['Priority',p.priority],['Project Manager',p.assigned_pm],['Start Date',dateShort(p.start_date)],['Due Date',dateShort(p.due_date)]];
    const timelineHtml=timeline.length?timeline.map(t=>`<div class="timeline-item"><strong>${esc(t.action||'Update')}</strong><span>${dateShort(t.created_at)}</span><p>${esc(t.note||'')}</p></div>`).join(''):'<div class="empty-state">Belum ada timeline.</div>';
    const departmentCards=(departments||[]).length?(departments||[]).map(d=>{const dp=departmentProgressFromTasks(d,tasks); const locked=['completed','cancelled'].includes(normalizeProjectStatus(p.status)); return `<div class="department-card"><div><span>${esc(d.department_name||d.department_key)}</span><strong>${departmentStatusLabel(d.status)}</strong><small>${esc(d.owner_staff||'-')} • ${projectStatusLabel(d.stage||'')}</small></div><div class="dept-progress"><span style="width:${dp}%"></span></div><small>${dp}%</small>${locked?'':`<div class="dept-actions"><button class="mini-btn" data-project-dept-status="${d.id}" data-status="in_progress">Start</button><button class="mini-btn" data-project-dept-status="${d.id}" data-status="review">Review</button><button class="mini-btn primary" data-project-dept-status="${d.id}" data-status="completed">Done</button><button class="mini-btn danger-action" data-project-dept-status="${d.id}" data-status="blocked">Block</button></div>`}</div>`}).join(''):'<div class="empty-state">Department belum dijana. Refresh atau create project baru.</div>';
    const departmentsHtml=`<div class="department-grid">${departmentCards}</div>`;
    const tasksHtml=tasks.length?`<div class="project-task-list">${tasks.map(t=>`<label class="project-task-row"><input type="checkbox" data-project-task="${t.id}" ${String(t.status).toLowerCase()==='done'?'checked':''}><span><b>${esc(t.task_title||'-')}</b><small>${projectStatusLabel(t.stage||'new_project')} • ${esc(t.assigned_to||'-')}</small></span></label>`).join('')}</div>`:'<div class="empty-state">Belum ada task. Task akan dijana semasa create project baru.</div>';
    return `<div class="project-progress"><span style="width:${shownProgress}%"></span></div><div class="project-progress-meta"><strong>Progress ${shownProgress}%</strong><span>${doneTasks}/${totalTasks} task siap</span></div><div class="detail-grid">${fields.map(([k,v])=>`<div class="detail-card"><span>${esc(k)}</span><strong>${esc(v||'-')}</strong></div>`).join('')}<div class="detail-card full"><span>Notes</span><strong>${esc(p.notes||'-')}</strong></div><div class="detail-card full"><span>Department & Production Engine</span>${departmentsHtml}</div><div class="detail-card full"><span>Project Tasks</span>${tasksHtml}</div><div class="detail-card full"><span>Project Timeline</span>${timelineHtml}</div></div>`;
  }
  function syncProjectModalActions(p){
    const st=normalizeProjectStatus(p?.status);
    const buttons=['#projectOnboardingBtn','#projectContentBtn','#projectDesignBtn','#projectDevBtn','#projectReviewBtn','#projectDeliveryBtn','#projectCompleteBtn','#projectHoldBtn','#projectCancelBtn'].map(qs);
    buttons.forEach(btn=>{if(btn){btn.hidden=false;btn.disabled=false;}});
    if(['completed','cancelled'].includes(st)) buttons.forEach(btn=>{if(btn) btn.hidden=true;});
  }
  async function updateProjectStatus(id,status){
    const client=await getClient(); if(!client) return;
    const p=projectsCache.find(x=>String(x.id)===String(id)) || currentProject;
    if(['completed','cancelled'].includes(normalizeProjectStatus(p?.status))){ alert('Project ini sudah locked.'); return; }
    const old=normalizeProjectStatus(p?.status);
    const next=normalizeProjectStatus(status);
    const tasks=await loadProjectTasks(client,id);
    const done=(tasks||[]).filter(t=>String(t.status||'').toLowerCase()==='done').length;
    const total=(tasks||[]).length;
    if(next==='completed' && total && done<total){
      alert(`Belum boleh Complete. Task siap ${done}/${total}. Selesaikan semua checklist dahulu.`);
      return;
    }
    const progress = next==='completed' ? 100 : (total ? taskProgress(tasks) : projectProgress(next));
    const payload={status:next,progress,updated_at:new Date().toISOString()};
    if(next==='completed') payload.completed_at=new Date().toISOString();
    const {error}=await client.from('projects').update(payload).eq('id',id);
    if(error){ alert('Gagal update project status.'); return; }
    await projectTimeline(client,id,projectStatusLabel(next),`Moved from ${projectStatusLabel(old)} to ${projectStatusLabel(next)}. Progress ${progress}%.`);
    await addLog(client,'project_status',`Project ${id} ditukar kepada ${projectStatusLabel(next)}`,'project',id);
    await loadProjectsPage(); if(currentProject && String(currentProject.id)===String(id)) openProjectModal(id);
  }
  async function updateProjectTask(taskId, checked){
    const client=await getClient(); if(!client) return;
    const {error}=await client.from('project_tasks').update({status:checked?'done':'todo',completed_at:checked?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('id',taskId);
    if(error){ alert('Gagal update task.'); return; }
    if(currentProject){
      const tasks=await loadProjectTasks(client,currentProject.id);
      const progress=taskProgress(tasks);
      await syncProjectDepartmentsProgress(client,currentProject.id,tasks);
      await client.from('projects').update({progress,updated_at:new Date().toISOString()}).eq('id',currentProject.id);
      await projectTimeline(client,currentProject.id, checked?'Task Completed':'Task Reopened', `Progress updated to ${progress}%.`);
      await loadProjectsPage();
      openProjectModal(currentProject.id);
    }
  }



  /* RH Admin Article Module V1.0 - Full Build */
  let articlesCache = [];
  let currentArticle = null;
  function slugifyArticle(s){
    return String(s||'').toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90) || ('artikel-'+Date.now());
  }
  function articleUrl(slug){ return location.origin + '/blog/' + encodeURIComponent(slug) + '.html'; }
  function articleStatusLabel(st){ const v=String(st||'draft').toLowerCase(); return ({draft:'Draft',published:'Published',archived:'Archived',deleted:'Deleted'})[v] || v; }
  function articleStatusClass(st){ return String(st||'draft').toLowerCase().replace(/[^a-z0-9_-]/g,''); }
  async function ensureArticleBucket(client){
    try{ await client.storage.getBucket('blog-images'); }catch{}
  }
  async function uploadArticleCover(client, file, slug){
    if(!file) return '';
    const allowed=['image/jpeg','image/png','image/webp','image/jpg'];
    if(!allowed.includes(file.type)) throw new Error('Cover image mesti JPG, PNG atau WEBP.');
    if(file.size > 5*1024*1024) throw new Error('Saiz cover image maksimum 5MB.');
    await ensureArticleBucket(client);
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'') || 'jpg';
    const path=`articles/${slug || 'article'}-${Date.now()}.${ext}`;
    const {error}=await client.storage.from('blog-images').upload(path,file,{cacheControl:'31536000',upsert:true,contentType:file.type});
    if(error) throw error;
    const {data}=client.storage.from('blog-images').getPublicUrl(path);
    return data?.publicUrl || '';
  }
  async function loadArticlesPage(){
    const client=await getClient(); if(!client) return;
    const body=qs('#articlesTableBody');
    if(body) body.innerHTML='<tr><td colspan="6"><div class="empty-state">Memuatkan artikel...</div></td></tr>';
    const {data,error}=await client.from('blog_posts').select('*').order('updated_at',{ascending:false});
    if(error){ if(body) body.innerHTML='<tr><td colspan="6"><div class="empty-state">Gagal load blog_posts. Jalankan SQL Article Module dahulu.</div></td></tr>'; return; }
    articlesCache=(data||[]).filter(r=>!isDeleted(r) && String(r.status||'').toLowerCase()!=='deleted');
    renderArticleStats(articlesCache); renderArticlesTable();
  }
  function renderArticleStats(rows){
    const by=st=>rows.filter(r=>String(r.status||'draft').toLowerCase()===st).length;
    const set=(id,val)=>{const el=qs(id); if(el) el.textContent=val;};
    set('#articleCountTotal', rows.length);
    set('#articleCountPublished', by('published'));
    set('#articleCountDraft', by('draft'));
    set('#articleCountArchived', by('archived'));
    set('#articleCountFeatured', rows.filter(r=>r.is_featured===true || r.featured===true).length);
    set('#articleCountViews', rows.reduce((a,b)=>a+Number(b.views||b.view_count||0),0));
  }
  function renderArticlesTable(){
    const body=qs('#articlesTableBody'); if(!body) return;
    const search=(qs('#articleSearch')?.value||'').toLowerCase().trim();
    const filter=(qs('#articleStatusFilter')?.value||'').toLowerCase();
    let rows=articlesCache.slice();
    if(filter) rows=rows.filter(r=>String(r.status||'draft').toLowerCase()===filter);
    if(search) rows=rows.filter(r=>[r.title,r.slug,r.category,r.focus_keyword,r.meta_description,r.seo_description].join(' ').toLowerCase().includes(search));
    if(!rows.length){ body.innerHTML='<tr><td colspan="6"><div class="empty-state">Tiada artikel untuk filter ini.</div></td></tr>'; return; }
    body.innerHTML=rows.map(a=>{
      const desc=a.meta_description||a.seo_description||a.excerpt||'';
      const featured=(a.is_featured===true||a.featured===true)?'<span class="small-muted">⭐ Featured</span>':'';
      const publicLink=a.slug?`<a class="mini-btn" target="_blank" rel="noopener" href="${articleUrl(a.slug)}">Public</a>`:'';
      return `<tr>
        <td data-label="Article"><strong>${esc(a.title||'Untitled')}</strong><span class="small-muted">/${esc(a.slug||'-')}</span>${featured}</td>
        <td data-label="Category">${esc(a.category||'General')}</td>
        <td data-label="SEO">${esc(a.focus_keyword||'-')}<span class="small-muted">${esc(desc).slice(0,90)}</span></td>
        <td data-label="Status"><span class="status-pill ${articleStatusClass(a.status)}">${esc(articleStatusLabel(a.status))}</span></td>
        <td data-label="Updated">${dateShort(a.updated_at||a.published_at||a.created_at)}</td>
        <td data-label="Actions"><div class="table-actions"><button class="mini-btn primary" data-edit-article="${a.id}">Edit</button>${publicLink}<button class="mini-btn" data-article-status="${a.id}" data-status="${String(a.status||'draft').toLowerCase()==='published'?'draft':'published'}">${String(a.status||'draft').toLowerCase()==='published'?'Unpublish':'Publish'}</button><button class="mini-btn danger" data-delete-article="${a.id}">Delete</button></div></td>
      </tr>`;
    }).join('');
  }
  function openArticleModal(id){
    currentArticle = id ? articlesCache.find(a=>String(a.id)===String(id)) : null;
    const modal=qs('#articleModal'); if(!modal) return;
    qs('#articleModalTitle').textContent=currentArticle?'Edit Article':'New Article';
    qs('#articleModalSub').textContent=currentArticle?`Update: ${currentArticle.slug||''}`:'Simpan draft atau publish terus.';
    const set=(id,val)=>{const el=qs(id); if(el) el.value=val||'';};
    set('#articleTitle', currentArticle?.title || '');
    set('#articleSlug', currentArticle?.slug || '');
    set('#articleCategory', currentArticle?.category || 'Website');
    set('#articleStatus', currentArticle?.status || 'draft');
    set('#articleFocusKeyword', currentArticle?.focus_keyword || '');
    set('#articleAuthor', currentArticle?.author || (getSession()?.full_name||'RH Admin'));
    set('#articleMetaTitle', currentArticle?.meta_title || currentArticle?.seo_title || '');
    set('#articleMetaDescription', currentArticle?.meta_description || currentArticle?.seo_description || currentArticle?.excerpt || '');
    set('#articleCoverImage', currentArticle?.cover_image || '');
    set('#articleContent', currentArticle?.content || '');
    const feat=qs('#articleFeatured'); if(feat) feat.checked=!!(currentArticle?.is_featured || currentArticle?.featured);
    const pub=qs('#articlePublishedAt'); if(pub){ const d=currentArticle?.published_at ? new Date(currentArticle.published_at) : null; pub.value=d && !isNaN(d) ? new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16) : ''; }
    const file=qs('#articleCoverFile'); if(file) file.value='';
    modal.hidden=false;
  }
  function closeArticleModal(){ const modal=qs('#articleModal'); if(modal) modal.hidden=true; currentArticle=null; }
  async function saveArticle(forceStatus){
    const client=await getClient(); if(!client) return;
    const title=String(qs('#articleTitle')?.value||'').trim();
    if(!title){ alert('Title artikel wajib diisi.'); return; }
    const slug=slugifyArticle(qs('#articleSlug')?.value || title);
    const status=forceStatus || String(qs('#articleStatus')?.value||'draft').toLowerCase();
    let cover=String(qs('#articleCoverImage')?.value||'').trim();
    const file=qs('#articleCoverFile')?.files?.[0];
    try{
      if(file) cover=await uploadArticleCover(client,file,slug);
      const now=new Date().toISOString();
      const publishedInput=qs('#articlePublishedAt')?.value;
      const publishedAt = status==='published' ? (publishedInput ? new Date(publishedInput).toISOString() : (currentArticle?.published_at || now)) : (publishedInput ? new Date(publishedInput).toISOString() : null);
      const metaDesc=String(qs('#articleMetaDescription')?.value||'').trim();
      const payload={
        title, slug,
        category:String(qs('#articleCategory')?.value||'Website').trim(),
        status,
        focus_keyword:String(qs('#articleFocusKeyword')?.value||'').trim(),
        author:String(qs('#articleAuthor')?.value||'RH Admin').trim(),
        meta_title:String(qs('#articleMetaTitle')?.value||'').trim() || title,
        seo_title:String(qs('#articleMetaTitle')?.value||'').trim() || title,
        meta_description:metaDesc,
        seo_description:metaDesc,
        excerpt:metaDesc,
        cover_image:cover,
        content:String(qs('#articleContent')?.value||'').trim(),
        is_featured:!!qs('#articleFeatured')?.checked,
        featured:!!qs('#articleFeatured')?.checked,
        published_at:publishedAt,
        updated_at:now
      };
      let res;
      if(currentArticle){ res=await client.from('blog_posts').update(payload).eq('id',currentArticle.id).select().maybeSingle(); }
      else{ payload.created_at=now; res=await client.from('blog_posts').insert(payload).select().maybeSingle(); }
      if(res.error) throw res.error;
      await addLog(client,currentArticle?'article_updated':'article_created',`${status==='published'?'Published':'Saved'} article: ${title}`,'article',res.data?.id||currentArticle?.id||'');
      closeArticleModal(); await loadArticlesPage();
    }catch(err){ console.error('[ARTICLE SAVE ERROR]',err); alert(err?.message || 'Gagal simpan artikel.'); }
  }
  async function changeArticleStatus(id,status){
    const client=await getClient(); if(!client) return;
    try{
      const payload={status,updated_at:new Date().toISOString()};
      if(status==='published') payload.published_at=new Date().toISOString();
      const {error}=await client.from('blog_posts').update(payload).eq('id',id);
      if(error) throw error;
      await loadArticlesPage();
    }catch(err){ alert(err?.message || 'Gagal update status artikel.'); }
  }
  async function deleteArticle(id){
    const row=articlesCache.find(a=>String(a.id)===String(id));
    if(!row) return;
    const typed=prompt(`Padam artikel: ${row.title}\n\nTaip DELETE untuk teruskan.`);
    if(typed!=='DELETE') return;
    const password=prompt('Masukkan password admin untuk delete artikel:');
    if(!password) return;
    const ok=await verifyAdminPassword(password);
    if(!ok){ alert('Password admin tidak sah.'); return; }
    const reason=prompt('Sebab pemadaman artikel:', 'Content cleanup / QA') || '';
    const client=await getClient(); if(!client) return;
    try{
      const s=getSession()||{};
      const {error}=await client.from('blog_posts').update({is_deleted:true,deleted_at:new Date().toISOString(),deleted_by:s.staff_id||'admin',delete_reason:reason,status:'deleted',updated_at:new Date().toISOString()}).eq('id',id);
      if(error) throw error;
      await addLog(client,'article_deleted',`Deleted article: ${row.title}`,'article',id);
      await loadArticlesPage();
    }catch(err){ alert(err?.message || 'Gagal delete artikel.'); }
  }
  async function verifyAdminPassword(password){
    try{
      const s=getSession()||{}; if(!s.staff_id) return false;
      const passwordHash=await sha256(password);
      const cfg=getSupabaseRestConfig();
      const url=`${cfg.url}/rest/v1/staff_users?select=staff_id,password_hash,status&staff_id=eq.${encodeURIComponent(s.staff_id)}&limit=1`;
      const res=await fetch(url,{headers:{apikey:cfg.anonKey,Authorization:`Bearer ${cfg.anonKey}`,Accept:'application/json'}});
      const rows=await res.json();
      const u=Array.isArray(rows)?rows[0]:null;
      return !!(u && u.status==='active' && u.password_hash===passwordHash);
    }catch{return false;}
  }

  function bind(){
    const form=qs('#loginForm'); if(form){ form.addEventListener('submit',(e)=>{e.preventDefault();e.stopPropagation();login(e);return false;}); form.setAttribute('onsubmit','return false'); }
    const loginBtn=qs('#loginButton') || qs('#loginForm button'); if(loginBtn){ loginBtn.setAttribute('type','button'); loginBtn.addEventListener('click',login); }
    const logout=qs('#logoutBtn'); if(logout) logout.onclick=()=>{clearSession();location.href='login.html'};
    const menu=qs('#menuBtn'); if(menu) menu.onclick=()=>qs('#sidebar').classList.toggle('open');
    const search=qs('#leadSearch'); if(search) search.oninput=renderLeadsTable;
    const filter=qs('#leadStatusFilter'); if(filter) filter.onchange=renderLeadsTable;
    const refresh=qs('#refreshLeadsBtn'); if(refresh) refresh.onclick=loadLeadsPage;
    qsa('[data-close-modal]').forEach(btn=>btn.onclick=closeModal);
    const contacted=qs('#markContactedBtn'); if(contacted) contacted.onclick=()=>currentLead&&updateLeadStatus(currentLead.id,'contacted');
    const qualified=qs('#markQualifiedBtn'); if(qualified) qualified.onclick=()=>currentLead&&updateLeadStatus(currentLead.id,'qualified');
    const convert=qs('#convertProspectBtn'); if(convert) convert.onclick=()=>currentLead&&convertLeadToProspect(currentLead.id);
    const editLead=qs('#editLeadBtn'); if(editLead) editLead.onclick=()=>currentLead&&openLeadEditModal(currentLead.id);
    const deleteLeadBtn=qs('#deleteLeadBtn'); if(deleteLeadBtn) deleteLeadBtn.onclick=()=>currentLead&&deleteLead(currentLead.id);
    const leadEditForm=qs('#leadEditForm'); if(leadEditForm) leadEditForm.addEventListener('submit',saveLeadEdit);
    qsa('[data-close-lead-edit]').forEach(btn=>btn.onclick=closeLeadEditModal);
    const pSearch=qs('#prospectSearch'); if(pSearch) pSearch.oninput=renderProspectsTable;
    const pFilter=qs('#prospectStageFilter'); if(pFilter) pFilter.onchange=renderProspectsTable;
    const pRefresh=qs('#refreshProspectsBtn'); if(pRefresh) pRefresh.onclick=loadProspectsPage;
    const addProspectBtn=qs('#addProspectBtn'); if(addProspectBtn) addProspectBtn.onclick=()=>{const p=qs('#manualProspectPanel'); if(p) p.hidden=!p.hidden;};
    const prospectForm=qs('#prospectForm'); if(prospectForm) prospectForm.addEventListener('submit',saveProspectForm);
    const pClose=qs('#closeProspectModal'); if(pClose) pClose.onclick=closeProspectModal;
    const pEditCurrent=qs('#editCurrentProspectBtn'); if(pEditCurrent) pEditCurrent.onclick=()=>currentProspect&&openProspectEditModal(currentProspect.id);
    const pEditClose=qs('#closeProspectEditModal'); if(pEditClose) pEditClose.onclick=closeProspectEditModal;
    const pEditCancel=qs('#cancelProspectEditBtn'); if(pEditCancel) pEditCancel.onclick=closeProspectEditModal;
    const pEditForm=qs('#prospectEditForm'); if(pEditForm) pEditForm.addEventListener('submit',saveProspectEdit);
    qsa('[data-prospect-tab]').forEach(btn=>btn.onclick=()=>{prospectDetailState.tab=btn.dataset.prospectTab; renderProspectDetailTab();});
    const markProposal=qs('#markProposalBtn'); if(markProposal) markProposal.onclick=()=>currentProspect&&createQuotationFromProspect(currentProspect.id).then(q=>{ if(q){ closeProspectModal(); location.href='quotations.html'; } });
    const markNegotiation=qs('#markNegotiationBtn'); if(markNegotiation) markNegotiation.onclick=()=>currentProspect&&updateProspectStage(currentProspect.id,'negotiation');
    const markWon=qs('#markWonBtn'); if(markWon) markWon.onclick=()=>currentProspect&&updateProspectStage(currentProspect.id,'won');
    const markLost=qs('#markLostBtn'); if(markLost) markLost.onclick=()=>currentProspect&&openLostReasonModal(currentProspect.id);
    const lostForm=qs('#lostReasonForm'); if(lostForm) lostForm.addEventListener('submit',saveLostReason);
    const lostClose=qs('#closeLostModal'); if(lostClose) lostClose.onclick=closeLostReasonModal;
    const lostCancel=qs('#cancelLostReasonBtn'); if(lostCancel) lostCancel.onclick=closeLostReasonModal;

    const qRefresh=qs('#refreshQuotationsBtn'); if(qRefresh) qRefresh.onclick=loadQuotationsPage;
    const qSearch=qs('#quotationSearch'); if(qSearch) qSearch.oninput=renderQuotationsTable;
    const qFilter=qs('#quotationStatusFilter'); if(qFilter) qFilter.onchange=renderQuotationsTable;
    const qNew=qs('#newQuotationBtn'); if(qNew) qNew.onclick=()=>openQuotationCreateModal();
    const qCreateForm=qs('#quotationCreateForm'); if(qCreateForm) qCreateForm.addEventListener('submit',submitQuotationCreate);
    const qCreateClose=qs('#closeQuoteCreateModal'); if(qCreateClose) qCreateClose.onclick=closeQuotationCreateModal;
    const qCreateCancel=qs('#cancelQuoteCreateBtn'); if(qCreateCancel) qCreateCancel.onclick=closeQuotationCreateModal;
    const qClose=qs('#closeQuotationModal'); if(qClose) qClose.onclick=closeQuotationModal;
    const qPrint=qs('#printQuotationBtn'); if(qPrint) qPrint.onclick=printCurrentQuotationSingleSource;
    const qSent=qs('#quoteSentBtn'); if(qSent) qSent.onclick=()=>currentQuotation&&updateQuotationStatus(currentQuotation.id,'sent');
    const qAccepted=qs('#quoteAcceptedBtn'); if(qAccepted) qAccepted.onclick=()=>currentQuotation&&updateQuotationStatus(currentQuotation.id,'accepted');
    const qRejected=qs('#quoteRejectedBtn'); if(qRejected) qRejected.onclick=()=>currentQuotation&&updateQuotationStatus(currentQuotation.id,'rejected');


    const invRefresh=qs('#refreshInvoicesBtn'); if(invRefresh) invRefresh.onclick=loadInvoicesPage;
    const invSearch=qs('#invoiceSearch'); if(invSearch) invSearch.oninput=renderInvoicesTable;
    const invFilter=qs('#invoiceStatusFilter'); if(invFilter) invFilter.onchange=renderInvoicesTable;
    const invNew=qs('#newInvoiceBtn'); if(invNew) invNew.onclick=()=>openInvoiceCreateModal();
    const invCreateForm=qs('#invoiceCreateForm'); if(invCreateForm) invCreateForm.addEventListener('submit',submitInvoiceCreate);
    ['#invoiceQuotationSelect','#invoiceDiscount','#invoiceDepositType','#invoiceDepositValue'].forEach(id=>{ const el=qs(id); if(el) el.addEventListener('input',recalcInvoiceCreateTotals); if(el) el.addEventListener('change',recalcInvoiceCreateTotals); });
    const invIssue=qs('#invoiceIssueDate'); if(invIssue) invIssue.addEventListener('change',()=>{ const due=qs('#invoiceDueDate'); if(due) due.value=addDaysFromISO(invIssue.value,14); });
    const invCreateClose=qs('#closeInvoiceCreateModal'); if(invCreateClose) invCreateClose.onclick=closeInvoiceCreateModal;
    const invCreateCancel=qs('#cancelInvoiceCreateBtn'); if(invCreateCancel) invCreateCancel.onclick=closeInvoiceCreateModal;
    const invClose=qs('#closeInvoiceModal'); if(invClose) invClose.onclick=closeInvoiceModal;
    const invPrint=qs('#printInvoiceBtn'); if(invPrint) invPrint.onclick=printCurrentInvoice;
    const invSent=qs('#invoiceSentBtn'); if(invSent) invSent.onclick=()=>currentInvoice&&updateInvoiceStatus(currentInvoice.id,'sent');
    const invPaid=qs('#invoicePaidBtn'); if(invPaid) invPaid.onclick=()=>currentInvoice&&openPaymentModal(currentInvoice.id);
    const invOverdue=qs('#invoiceOverdueBtn'); if(invOverdue) invOverdue.onclick=()=>currentInvoice&&updateInvoiceStatus(currentInvoice.id,'overdue');
    const invCancel=qs('#invoiceCancelBtn'); if(invCancel) invCancel.onclick=()=>currentInvoice&&updateInvoiceStatus(currentInvoice.id,'cancelled');
    const invProject=qs('#createProjectFromInvoiceBtn'); if(invProject) invProject.onclick=()=>currentInvoice&&createProjectFromInvoice(currentInvoice.id).then(p=>{ if(p){ location.href='projects.html'; }});
    const payForm=qs('#paymentForm'); if(payForm) payForm.addEventListener('submit',savePayment);
    const payClose=qs('#closePaymentModal'); if(payClose) payClose.onclick=closePaymentModal;
    const payCancel=qs('#cancelPaymentBtn'); if(payCancel) payCancel.onclick=closePaymentModal;
    const genInvQuote=qs('#generateInvoiceFromQuoteBtn'); if(genInvQuote) genInvQuote.onclick=()=>currentQuotation&&createInvoiceFromQuotation(currentQuotation.id).then(inv=>{ if(inv){ location.href='invoices.html'; }});


    const prRefresh=qs('#refreshProjectsBtn'); if(prRefresh) prRefresh.onclick=loadProjectsPage;
    const prSearch=qs('#projectSearch'); if(prSearch) prSearch.oninput=renderProjectsTable;
    const prFilter=qs('#projectStatusFilter'); if(prFilter) prFilter.onchange=renderProjectsTable;
    const prNew=qs('#newProjectBtn'); if(prNew) prNew.onclick=()=>openProjectCreateModal();
    const prCreateForm=qs('#projectCreateForm'); if(prCreateForm) prCreateForm.addEventListener('submit',submitProjectCreate);
    const prCreateClose=qs('#closeProjectCreateModal'); if(prCreateClose) prCreateClose.onclick=closeProjectCreateModal;
    const prCreateCancel=qs('#cancelProjectCreateBtn'); if(prCreateCancel) prCreateCancel.onclick=closeProjectCreateModal;
    const prClose=qs('#closeProjectModal'); if(prClose) prClose.onclick=closeProjectModal;
    const prOn=qs('#projectOnboardingBtn'); if(prOn) prOn.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'onboarding');
    const prContent=qs('#projectContentBtn'); if(prContent) prContent.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'content_collection');
    const prDesign=qs('#projectDesignBtn'); if(prDesign) prDesign.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'design');
    const prDev=qs('#projectDevBtn'); if(prDev) prDev.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'development');
    const prReview=qs('#projectReviewBtn'); if(prReview) prReview.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'review');
    const prDelivery=qs('#projectDeliveryBtn'); if(prDelivery) prDelivery.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'delivery');
    const prComplete=qs('#projectCompleteBtn'); if(prComplete) prComplete.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'completed');
    const prHold=qs('#projectHoldBtn'); if(prHold) prHold.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'on_hold');
    const prCancel=qs('#projectCancelBtn'); if(prCancel) prCancel.onclick=()=>currentProject&&updateProjectStatus(currentProject.id,'cancelled');

    document.addEventListener('click',e=>{
      const view=e.target.closest('[data-view-lead]'); if(view) openLeadModal(view.dataset.viewLead);
      const stat=e.target.closest('[data-status-lead]'); if(stat) updateLeadStatus(stat.dataset.statusLead, stat.dataset.status);
      const conv=e.target.closest('[data-convert-lead]'); if(conv) convertLeadToProspect(conv.dataset.convertLead);
      const ed=e.target.closest('[data-edit-lead]'); if(ed) openLeadEditModal(ed.dataset.editLead);
      const del=e.target.closest('[data-delete-lead]'); if(del) deleteLead(del.dataset.deleteLead);
      const pView=e.target.closest('[data-view-prospect]'); if(pView) openProspectModal(pView.dataset.viewProspect);
      const pEdit=e.target.closest('[data-edit-prospect]'); if(pEdit) openProspectEditModal(pEdit.dataset.editProspect);
      const pStage=e.target.closest('[data-stage-prospect]'); if(pStage){ if(pStage.dataset.stage==='proposal_sent') createQuotationFromProspect(pStage.dataset.stageProspect).then(()=>loadProspectsPage()); else updateProspectStage(pStage.dataset.stageProspect, pStage.dataset.stage); }
      const pLost=e.target.closest('[data-lost-prospect]'); if(pLost) openLostReasonModal(pLost.dataset.lostProspect);
      const pDel=e.target.closest('[data-delete-prospect]'); if(pDel) secureSoftDelete('prospect', pDel.dataset.deleteProspect);
      const qView=e.target.closest('[data-view-quotation]'); if(qView) openQuotationModal(qView.dataset.viewQuotation);
      const qStatus=e.target.closest('[data-quote-status]'); if(qStatus) updateQuotationStatus(qStatus.dataset.quoteStatus, qStatus.dataset.status);
      const qDel=e.target.closest('[data-delete-quotation]'); if(qDel) secureSoftDelete('quotation', qDel.dataset.deleteQuotation);
      const invView=e.target.closest('[data-view-invoice]'); if(invView) openInvoiceModal(invView.dataset.viewInvoice);
      const invStatus=e.target.closest('[data-invoice-status]'); if(invStatus) updateInvoiceStatus(invStatus.dataset.invoiceStatus, invStatus.dataset.status);
      const invPay=e.target.closest('[data-pay-invoice]'); if(invPay) openPaymentModal(invPay.dataset.payInvoice);
      const invDel=e.target.closest('[data-delete-invoice]'); if(invDel) secureSoftDelete('invoice', invDel.dataset.deleteInvoice);
      const receipt=e.target.closest('[data-open-receipt]'); if(receipt) openReceiptFile(receipt.dataset.url, receipt.dataset.path);
      const prView=e.target.closest('[data-view-project]'); if(prView) openProjectModal(prView.dataset.viewProject);
      const prStage=e.target.closest('[data-project-stage]'); if(prStage) updateProjectStatus(prStage.dataset.projectStage, prStage.dataset.status);
      const prEdit=e.target.closest('[data-edit-project]'); if(prEdit) openProjectModal(prEdit.dataset.editProject);
      const prDel=e.target.closest('[data-delete-project]'); if(prDel) secureSoftDelete('project', prDel.dataset.deleteProject);
      const prDept=e.target.closest('[data-project-dept-status]'); if(prDept) updateProjectDepartmentStatus(prDept.dataset.projectDeptStatus, prDept.dataset.status);
      const prTask=e.target.closest('[data-project-task]'); if(prTask) updateProjectTask(prTask.dataset.projectTask, prTask.checked);
    });
  }
  function init(){bind(); const s=protect(); if(!s) return; if(qs('#totalLeads')) loadDashboard(); if(qs('#leadsTableBody')) loadLeadsPage(); if(qs('#prospectsTableBody')) loadProspectsPage(); if(qs('#quotationsTableBody')) loadQuotationsPage(); if(qs('#invoicesTableBody')) loadInvoicesPage(); if(qs('#projectsTableBody')) loadProjectsPage(); if(qs('#articlesTableBody')) loadArticlesPage();}
  return {init};
})();
document.addEventListener('DOMContentLoaded', RHAdmin.init);
