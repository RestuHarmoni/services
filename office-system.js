(() => {
  const VERSION = 'v12.2-sales-workflow-fix';
  const LOGO = 'assets/rh-logo.png';
  const STORE_KEY = 'rh_office_suite_data_v1';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const seed = {
    customers: [],
    quotations: [],
    invoices: [], payments: [], projects: [], documents: []
  };
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(n){ return 'RM' + (Number(n)||0).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function load(){ try { return {...seed, ...(JSON.parse(localStorage.getItem(STORE_KEY)||'{}'))}; } catch(e){ return structuredClone(seed); } }
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(db)); renderAll(); }
  let db = load();
  let officeLeads = [];
  let officeAnswers = {};
  let selectedOfficeLeadId = null;

  function nextNo(prefix, arr, field){
    const year = new Date().getFullYear();
    const nums = arr.map(x => String(x[field]||'').match(/-(\d{4})$/)).filter(Boolean).map(m=>+m[1]);
    return `${prefix}-${year}-${String((Math.max(0,...nums)+1)).padStart(4,'0')}`;
  }
  function total(items){ return (items||[]).reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0); }
  function statusClass(s){ return /paid|active|approved|completed/i.test(s)?'status-paid':/sent|partial|in progress/i.test(s)?'status-pending':/unpaid|overdue/i.test(s)?'status-new':'status-draft'; }
  function pill(s){ return `<span class="status-pill ${statusClass(s)}">${s||'Draft'}</span>`; }
  function esc(v){ return String(v ?? '').replace(/[&<>'\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[m])); }
  async function getClient(){
    try {
      if (typeof window.RHGetSupabaseClient === 'function') return await window.RHGetSupabaseClient();
      return null;
    } catch(e){ return null; }
  }
  function leadDate(x){ return x?.created_at ? new Date(x.created_at).toLocaleString('ms-MY') : '-'; }
  function normalizeLeadStage(x){ return x?.sales_stage || (String(x?.status||'').toUpperCase()==='WON' ? 'won' : 'new'); }
  function tempClass(x){ return String(x?.lead_temperature || 'WARM').toUpperCase(); }
  function leadDisplayName(x){ return x?.name || x?.full_name || 'Tanpa nama'; }
  function answerCount(id){ return (officeAnswers[id] || []).length; }

  function addOfficeStyles(){
    const css = `
    .embedded-office-frame iframe{width:100%;height:calc(100vh - 230px);min-height:720px;border:0}.pipeline-board{display:grid;grid-template-columns:repeat(5,minmax(180px,1fr));gap:12px;overflow:auto}.pipeline-col{background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;padding:12px;min-height:150px}.pipeline-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px;margin-bottom:10px;box-shadow:0 10px 28px rgba(15,23,42,.05)}.rh-logo-mark{width:44px;height:44px;border-radius:14px;object-fit:contain;background:#fff;padding:5px;border:1px solid rgba(200,155,60,.38);box-shadow:0 12px 28px rgba(15,23,42,.18)}
    .office-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.office-form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.office-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.office-mini{font-size:12px;color:#64748b}.lead-inbox-grid{display:grid;grid-template-columns:minmax(260px,380px) 1fr;gap:14px}.lead-inbox-list{display:grid;gap:10px;max-height:680px;overflow:auto}.lead-inbox-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:14px;cursor:pointer}.lead-inbox-card.active{border-color:#c89b3c;box-shadow:0 12px 30px rgba(200,155,60,.12)}.lead-detail-box{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:18px}.qa-mini{border:1px solid #e5e7eb;border-radius:14px;padding:10px;margin-top:8px;background:#f8fafc}.qa-mini b{display:block;font-size:11px;text-transform:uppercase;color:#64748b;margin-bottom:4px}.office-line-items{display:grid;gap:8px;margin-top:10px}.office-line-row{display:grid;grid-template-columns:1fr 90px 130px 44px;gap:8px;align-items:center}.office-line-row button{min-height:48px}.doc-preview{background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:26px;box-shadow:0 18px 55px rgba(15,23,42,.08)}.doc-head{display:flex;justify-content:space-between;gap:18px;border-bottom:3px solid #0f172a;padding-bottom:18px;margin-bottom:22px}.doc-brand{display:flex;gap:12px;align-items:center}.doc-brand img{width:62px;height:62px;object-fit:contain}.doc-title{text-align:right}.doc-title h2{font-size:34px;color:#c89b3c}.doc-total{font-size:24px;font-weight:950;color:#0f172a}.danger-lite{background:#fff1f2!important;color:#be123c!important;border:1px solid #fecdd3!important}@media(max-width:760px){.office-form-grid,.office-form-grid.three,.office-line-row{grid-template-columns:1fr}.doc-head{display:block}.doc-title{text-align:left;margin-top:12px}}`;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  }

  function patchLogo(){
    const dot = $('.brand-dot');
    if (dot) dot.outerHTML = `<img class="rh-logo-mark" src="${LOGO}" alt="Restu Harmoni Logo">`;
    const ribbon = $('.office-ribbon div'); if (ribbon) ribbon.textContent = `RH Services Admin • ${VERSION}`;
  }

  function replaceSections(){
    const sections = {
      dashboard: dashboardHTML(), leads: leadsHTML(), customers: customersHTML(), quotations: quotationsHTML(), invoices: invoicesHTML(), payments: paymentsHTML(), projects: projectsHTML(), documents: documentsHTML(), reports: reportsHTML()
    };
    Object.entries(sections).forEach(([id, html]) => { const el = $(`#tab-${id}`); if (el) el.innerHTML = html; });
  }

  function dashboardHTML(){return `<div class="office-hero"><div class="office-hero-grid"><div><div class="eyebrow" style="color:#f7d37a">Sales Command Center</div><h1>RH Services Sales Dashboard</h1><p class="muted">Workspace jualan Restu Harmoni: lead daripada Aira, prospect, quotation dan projek menang dalam satu aliran kerja yang kemas.</p><div class="actions"><button class="btn gold" data-tab="leads">Open Leads</button><button class="btn soft" data-tab="customers">Open Prospects</button><button class="btn soft" data-tab="quotations">Quotation Pipeline</button></div></div><div class="office-status"><div class="label">System Status</div><p><b>AIRA & Lead Management kekal live.</b><br><span>Dashboard ini disusun semula untuk sales workflow RH. Invoice, payment dan delivery penuh kekal sebagai fasa Office RH.</span></p></div></div></div><div class="office-kpis"><div class="office-card"><div class="label">New Leads</div><div class="value" id="dashLeads">0</div><div class="trend">Aira / Website Form</div></div><div class="office-card"><div class="label">Prospects</div><div class="value" id="dashProspects">0</div><div class="trend">Lead yang layak diikuti</div></div><div class="office-card"><div class="label">Quotation Pipeline</div><div class="value" id="dashQt">RM0</div><div class="trend">Draft + Sent + Approved</div></div><div class="office-card"><div class="label">Negotiation</div><div class="value" id="dashOutstanding">RM0</div><div class="trend">Nilai follow-up aktif</div></div><div class="office-card"><div class="label">Won Projects</div><div class="value" id="dashProjects">0</div><div class="trend">Ready handover Office RH</div></div></div><div class="office-grid"><div class="editor-card" style="margin-top:0"><h2>Sales Workflow</h2><div class="pipeline-board"><div class="pipeline-col"><h3>Lead</h3><div class="pipeline-card"><b>Aira Lead Capture</b><span class="status-pill status-paid">Live</span><p class="office-mini">Lead baru daripada website.</p><div class="actions"><button class="btn ghost" data-tab="leads">Open</button></div></div></div><div class="pipeline-col"><h3>Prospect</h3><div class="pipeline-card"><b>Sales Workspace</b><span class="status-pill status-new">Ready</span><p class="office-mini">Lead yang layak untuk follow-up.</p><div class="actions"><button class="btn ghost" data-tab="customers">Open</button></div></div></div><div class="pipeline-col"><h3>Quotation</h3><div class="pipeline-card"><b>Generate Quote</b><span class="status-pill status-pending">Active</span><p class="office-mini">Sediakan quotation pakej RH.</p><div class="actions"><button class="btn ghost" data-tab="quotations">Open</button></div></div></div><div class="pipeline-col"><h3>Negotiation</h3><div class="pipeline-card"><b>Follow Up</b><span class="status-pill status-pending">Sales</span><p class="office-mini">Pantau lead yang sedang bincang harga/skop.</p><div class="actions"><button class="btn ghost" data-tab="quotations">Open</button></div></div></div><div class="pipeline-col"><h3>Won Project</h3><div class="pipeline-card"><b>Create Project</b><span class="status-pill status-new">Office RH</span><p class="office-mini">Selepas bayaran, handover ke Office RH.</p><div class="actions"><button class="btn ghost" data-tab="projects">Open</button></div></div></div></div></div><div class="editor-card" style="margin-top:0"><h2>Quick Actions</h2><div class="office-module-grid" style="grid-template-columns:1fr"><div class="module-card"><h3>Lead Inbox</h3><p>Semak lead Aira dan website tanpa keluar dari admin.</p><div class="actions"><button class="btn dark" data-tab="leads">Open Leads</button></div></div><div class="module-card"><h3>Prospect File</h3><p>Simpan maklumat follow-up sebelum client jadi customer sebenar.</p><div class="actions"><button class="btn dark" data-tab="customers">Open Prospects</button></div></div><div class="module-card"><h3>Create Quotation</h3><p>Masukkan pakej RH, item servis, preview dan print/PDF.</p><div class="actions"><button class="btn dark" data-tab="quotations">New Quotation</button></div></div></div></div></div>`}
  function leadsHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Sales CRM</div><h1>Lead Inbox</h1><p class="muted">Semua lead Aira dipaparkan terus dalam admin. Tiada iframe, tiada isi semula data.</p></div><div class="actions"><button class="btn gold" id="refreshLeads">Refresh Leads</button><a class="btn soft" href="admin-leads.html" target="_blank">Full Lead Workspace</a></div></div><div class="lead-inbox-grid"><div class="editor-card" style="margin-top:0"><h2>New Leads</h2><div id="leadInboxNotice" class="office-mini">Memuatkan lead...</div><div id="leadInboxList" class="lead-inbox-list"></div></div><div class="lead-detail-box" id="leadInboxDetail"><h2>Lead Detail</h2><p class="muted">Pilih lead untuk lihat jawapan Aira dan convert ke Prospect.</p></div></div>`}

  function customersHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Sales CRM</div><h1>Prospects</h1><p class="muted">Prospect sepatutnya datang daripada Lead Inbox. Manual entry hanya untuk walk-in/referral.</p></div><button class="btn gold" data-tab="leads">Buka Lead Inbox</button></div><div class="editor-card"><h2>Prospect Register</h2><p class="muted">Semua prospect yang telah convert daripada Aira atau ditambah manual.</p><div class="table-wrap"><table class="office-table"><thead><tr><th>Code</th><th>Prospect / Company</th><th>Contact</th><th>Package</th><th>Status</th><th>Action</th></tr></thead><tbody id="customersTbody"></tbody></table></div></div><details class="editor-card"><summary style="cursor:pointer;font-weight:900">+ Tambah Prospect Manual</summary><div style="margin-top:14px"><div class="office-form-grid"><div><label>Nama</label><input id="custName" placeholder="Nama prospect"></div><div><label>Syarikat</label><input id="custCompany" placeholder="Nama syarikat"></div><div><label>Telefon / WhatsApp</label><input id="custPhone"></div><div><label>Email</label><input id="custEmail"></div></div><label>Alamat / Notes</label><textarea id="custAddress"></textarea><div class="office-actions"><button class="btn gold" id="addProspect">Save Prospect</button><button class="btn ghost" data-tab="quotations">Create Quotation</button></div></div></details>`}

  function quotationsHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Sales</div><h1>Quotations</h1><p class="muted">Buat quotation daripada prospect, simpan draft, preview dan lanjut ke follow-up.</p></div><button class="btn gold" id="newQuotationBtn">+ New Quotation</button></div><div class="office-grid"><div class="editor-card" style="margin-top:0"><h2>Quotation Form</h2><div class="office-form-grid"><div><label>Prospect</label><select id="qtProspect"></select></div><div><label>Valid Until</label><input id="qtValid" type="date"></div></div><label>Title</label><input id="qtTitle" value="Business Website Package"><label>Items</label><div class="office-line-items" id="qtItems"></div><div class="office-actions"><button class="btn ghost" id="addQtItem">+ Add Item</button><button class="btn gold" id="saveQuotation">Save Quotation</button><button class="btn dark" id="previewQuotation">Preview / Print</button></div></div><div class="editor-card" style="margin-top:0"><h2>Quotation Pipeline</h2><div class="pipeline-board" id="quotationKanban"></div></div></div><div class="editor-card"><h2>Quotation Register</h2><div class="table-wrap"><table class="office-table"><thead><tr><th>No</th><th>Prospect</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody id="quotationsTbody"></tbody></table></div></div><div id="quotationPreviewWrap" class="editor-card"></div>`}
  function invoicesHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Finance</div><h1>Negotiation</h1><p class="muted">Ruang pantau quotation yang perlu follow-up sebelum client setuju.</p></div><button class="btn gold" id="newInvoiceBtn">Mark Follow-up</button></div><div class="office-kpis"><div class="office-card"><div class="label">Unpaid</div><div class="value" id="kpiUnpaid">RM0</div></div><div class="office-card"><div class="label">Paid</div><div class="value" id="kpiPaid">RM0</div></div><div class="office-card"><div class="label">Draft</div><div class="value" id="kpiDraftInv">0</div></div><div class="office-card"><div class="label">Negotiation</div><div class="value" id="kpiInvCount">0</div></div></div><div class="editor-card"><h2>Negotiation Register</h2><div class="table-wrap"><table class="office-table"><thead><tr><th>Invoice</th><th>Prospect</th><th>Due</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody id="invoicesTbody"></tbody></table></div></div><div id="invoicePreviewWrap" class="editor-card"></div>`}
  function paymentsHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Finance</div><h1>Won Deals</h1><p class="muted">Ruang sementara untuk rekod deal menang sebelum dipindahkan ke Office RH.</p></div></div><div class="editor-card"><h2>Record Won Deal</h2><div class="office-form-grid three"><div><label>Invoice</label><select id="payInvoice"></select></div><div><label>Amount</label><input id="payAmount" type="number" step="0.01"></div><div><label>Payment Date</label><input id="payDate" type="date"></div></div><div class="office-form-grid"><div><label>Method</label><select id="payMethod"><option>Bank Transfer</option><option>DuitNow</option><option>Cash</option><option>Other</option></select></div><div><label>Reference No</label><input id="payRef"></div></div><div class="office-actions"><button class="btn gold" id="savePayment">Save Won Deal</button></div></div><div class="editor-card"><h2>Won Deal Records</h2><div class="table-wrap"><table class="office-table"><thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody id="paymentsTbody"></tbody></table></div></div>`}
  function projectsHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Operations</div><h1>Won Projects</h1><p class="muted">Deal yang telah menang dan sedia dihantar ke Office RH untuk delivery.</p></div></div><div class="editor-card"><h2>Create Won Project</h2><div class="office-form-grid"><div><label>Prospect</label><select id="prProspect"></select></div><div><label>Service Type</label><select id="prType"><option>Website</option><option>AI / Aira</option><option>Automation</option><option>Custom System</option></select></div><div><label>Project Name</label><input id="prName"></div><div><label>Status</label><select id="prStatus"><option>Planning</option><option>In Progress</option><option>Review</option><option>Completed</option><option>On Hold</option></select></div></div><div class="office-actions"><button class="btn gold" id="saveProject">Save Won Project</button></div></div><div class="editor-card"><h2>Won Project Register</h2><div class="table-wrap"><table class="office-table"><thead><tr><th>Project No</th><th>Project</th><th>Prospect</th><th>Type</th><th>Status</th></tr></thead><tbody id="projectsTbody"></tbody></table></div></div>`}
  function documentsHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Filing System</div><h1>Filing</h1><p class="muted">Filing quotation dan dokumen sales. Dokumen operasi penuh boleh dipindahkan ke Office RH.</p></div></div><div class="office-module-grid"><div class="module-card"><h3>Quotations</h3><p id="docQtCount">0 documents</p></div><div class="module-card"><h3>Negotiation</h3><p id="docInvCount">0 documents</p></div><div class="module-card"><h3>Won Deals</h3><p id="docPayCount">0 records</p></div></div><div class="editor-card"><h2>Recommended Filing</h2><pre style="white-space:pre-wrap;background:#0f172a;color:#e5e7eb;border-radius:18px;padding:18px;overflow:auto">/customers/CUS-2026-0001/\n  profile.json\n  quotations/QT-2026-0001.pdf\n  invoices/INV-2026-0001.pdf\n  payments/receipt.jpg\n  projects/PRJ-2026-0001/</pre></div>`}
  function reportsHTML(){return `<div class="section-head office-section"><div><div class="eyebrow">Business Intelligence</div><h1>Reports</h1><p class="muted">Ringkasan sales, lead conversion, quotation value dan won project progress.</p></div></div><div class="office-kpis"><div class="office-card"><div class="label">Prospects</div><div class="value" id="repProspects">0</div></div><div class="office-card"><div class="label">Quotation Value</div><div class="value" id="repQtValue">RM0</div></div><div class="office-card"><div class="label">Negotiation Value</div><div class="value" id="repInvValue">RM0</div></div><div class="office-card"><div class="label">Projects</div><div class="value" id="repProjects">0</div></div></div>`}

  function bindEvents(){
    document.addEventListener('click', e => {
      const id = e.target.id;
      if(id==='refreshLeads') refreshOfficeLeads(); if(id==='addProspect') addProspect(); if(id==='addQtItem') addQtItem(); if(id==='saveQuotation') saveQuotation(); if(id==='previewQuotation') previewQuotation(); if(id==='newQuotationBtn') resetQuotation(); if(id==='savePayment') savePayment(); if(id==='saveProject') saveProject(); if(id==='newInvoiceBtn') createManualInvoice();
      if(e.target.matches('[data-delete-customer]')) { db.customers.splice(+e.target.dataset.deleteCustomer,1); save(); }
      if(e.target.matches('[data-select-lead]')) { selectedOfficeLeadId=e.target.dataset.selectLead; renderLeadInbox(); }
      if(e.target.matches('[data-convert-lead]')) convertLeadToProspect(e.target.dataset.convertLead);
      if(e.target.matches('[data-view-qt]')) viewQuotation(+e.target.dataset.viewQt);
      if(e.target.matches('[data-convert-qt]')) convertQuotation(+e.target.dataset.convertQt);
      if(e.target.matches('[data-view-inv]')) viewInvoice(+e.target.dataset.viewInv);
      if(e.target.matches('[data-mark-paid]')) markPaid(+e.target.dataset.markPaid);
      if(e.target.matches('[data-remove-line]')) { e.target.closest('.office-line-row')?.remove(); }
    });
  }

  async function refreshOfficeLeads(){
    const notice=$('#leadInboxNotice');
    if(notice) notice.textContent='Memuatkan lead daripada Supabase...';
    const client=await getClient();
    if(!client){
      officeLeads=[]; officeAnswers={};
      if(notice) notice.textContent='Supabase client tidak tersedia. Gunakan Full Lead Workspace.';
      renderLeadInbox(); renderAll();
      return;
    }
    const {data,error}=await client.from('leads').select('*').order('created_at',{ascending:false});
    if(error){
      officeLeads=[]; officeAnswers={};
      if(notice) notice.textContent='Lead gagal dibaca: '+error.message;
      renderLeadInbox(); renderAll();
      return;
    }
    officeLeads=(data||[]).map(x=>({...x, sales_stage: normalizeLeadStage(x)}));
    const ids=officeLeads.map(x=>x.id).filter(Boolean);
    officeAnswers={};
    if(ids.length){
      const ans=await client.from('lead_answers').select('*').in('lead_id',ids).order('sort_order',{ascending:true});
      if(!ans.error){
        (ans.data||[]).forEach(a=>{ (officeAnswers[a.lead_id]||(officeAnswers[a.lead_id]=[])).push(a); });
      }
    }
    if(!selectedOfficeLeadId && officeLeads[0]) selectedOfficeLeadId=officeLeads[0].id;
    if(notice) notice.textContent=`Connected. ${officeLeads.length} lead dibaca.`;
    renderLeadInbox(); renderAll();
  }
  function renderLeadInbox(){
    const list=$('#leadInboxList'), detail=$('#leadInboxDetail');
    if(!list || !detail) return;
    const newLeads=officeLeads.filter(x=>!['prospect','quotation','negotiation','won','lost'].includes(normalizeLeadStage(x)));
    list.innerHTML = newLeads.map(x=>{
      const active=String(x.id)===String(selectedOfficeLeadId)?' active':'';
      return `<article class="lead-inbox-card${active}" data-select-lead="${esc(x.id)}"><div style="display:flex;justify-content:space-between;gap:10px"><div><b>${esc(leadDisplayName(x))}</b><div class="office-mini">${esc(x.phone||'-')} · ${esc(x.business_type||'-')}</div></div><span class="status-pill ${statusClass(x.lead_temperature||'Warm')}">${esc(x.lead_score||0)}/100 ${esc(x.lead_temperature||'WARM')}</span></div><p class="office-mini"><b>${esc(x.recommended_package||'-')}</b><br>${esc(x.budget||'-')} · ${esc(leadDate(x))}</p><div class="office-actions"><button class="btn ghost" data-select-lead="${esc(x.id)}">View</button><button class="btn gold" data-convert-lead="${esc(x.id)}">Convert To Prospect</button></div></article>`;
    }).join('') || '<div class="office-empty">Tiada lead baru. Lead yang sudah convert ada di Prospects.</div>';
    const lead=officeLeads.find(x=>String(x.id)===String(selectedOfficeLeadId)) || newLeads[0];
    if(!lead){ detail.innerHTML='<h2>Lead Detail</h2><p class="muted">Tiada lead untuk dipaparkan.</p>'; return; }
    const answers=officeAnswers[lead.id]||[];
    detail.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div class="eyebrow">Lead Detail</div><h2>${esc(leadDisplayName(lead))}</h2><p class="muted">${esc(lead.phone||'-')} · ${esc(lead.business_type||'-')} · ${esc(leadDate(lead))}</p></div><button class="btn gold" data-convert-lead="${esc(lead.id)}">Convert To Prospect</button></div><div class="office-kpis" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:12px"><div class="office-card"><div class="label">Package</div><div class="value" style="font-size:18px">${esc(lead.recommended_package||'-')}</div></div><div class="office-card"><div class="label">Budget</div><div class="value" style="font-size:18px">${esc(lead.budget||'-')}</div></div><div class="office-card"><div class="label">Score</div><div class="value" style="font-size:18px">${esc(lead.lead_score||0)}/100</div></div></div><div class="editor-card"><h2>Aira Answers</h2>${answers.length?answers.map(a=>`<div class="qa-mini"><b>${esc(a.question||a.question_key||'Question')}</b>${esc(a.answer||'-')}</div>`).join(''):'<p class="muted">Jawapan detail belum ada. Semak Full Lead Workspace jika lead lama.</p>'}</div>`;
  }
  async function convertLeadToProspect(id){
    const lead=officeLeads.find(x=>String(x.id)===String(id));
    if(!lead) return alert('Lead tidak ditemui.');
    const exists=db.customers.some(c=>String(c.leadId||'')===String(id));
    if(!exists){
      db.customers.unshift({
        code: nextNo('PRO', db.customers, 'code'),
        leadId: lead.id,
        name: leadDisplayName(lead),
        company: lead.company || lead.business_name || lead.business_type || '',
        phone: lead.phone || '',
        email: lead.email || '',
        address: [lead.objective, lead.budget, lead.timeline].filter(Boolean).join(' | '),
        package: lead.recommended_package || 'RH Starter',
        score: lead.lead_score || '',
        temperature: lead.lead_temperature || '',
        status:'Prospect',
        created: today()
      });
    }
    const client=await getClient();
    if(client && lead.id){
      try{ await client.from('leads').update({sales_stage:'prospect', status:'PROSPECT', last_activity_at:new Date().toISOString()}).eq('id',lead.id); }catch(e){}
    }
    save();
    await refreshOfficeLeads();
    alert('Lead telah convert ke Prospect File.');
    setTab('customers');
  }
  function addProspect(){ const c={code:nextNo('CUS',db.customers,'code'),name:$('#custName')?.value||'Unnamed Prospect',company:$('#custCompany')?.value||'',phone:$('#custPhone')?.value||'',email:$('#custEmail')?.value||'',address:$('#custAddress')?.value||'',package:'Manual',score:'',temperature:'',status:'Prospect',created:today()}; db.customers.push(c); save(); ['custName','custCompany','custPhone','custEmail','custAddress'].forEach(id=>{const x=$('#'+id); if(x)x.value='';}); }
  function addQtItem(desc='', qty=1, price=0){ const box=$('#qtItems'); if(!box)return; const row=document.createElement('div'); row.className='office-line-row'; row.innerHTML=`<input class="qt-desc" placeholder="Description" value="${desc}"><input class="qt-qty" type="number" min="1" value="${qty}"><input class="qt-price" type="number" step="0.01" value="${price}"><button class="btn ghost danger-lite" data-remove-line="1">×</button>`; box.appendChild(row); }
  function resetQuotation(){ $('#qtTitle').value='Business Website Package'; $('#qtValid').value=today(); $('#qtItems').innerHTML=''; addQtItem('Business Website Package',1,1299); addQtItem('AI Assisted Content Setup',1,300); }
  function collectQtItems(){ return $$('.office-line-row', $('#qtItems')).map(r=>({desc:$('.qt-desc',r).value, qty:Number($('.qt-qty',r).value||1), price:Number($('.qt-price',r).value||0)})).filter(i=>i.desc); }
  function saveQuotation(){ const q={no:nextNo('QT',db.quotations,'no'),customer:$('#qtProspect').value||'Walk-in Prospect',title:$('#qtTitle').value||'Quotation',validUntil:$('#qtValid').value||today(),status:'Draft',items:collectQtItems(),notes:''}; db.quotations.push(q); save(); viewQuotation(db.quotations.length-1); }
  function convertQuotation(i){ const q=db.quotations[i]; if(!q)return; q.status='Approved'; const inv={no:nextNo('INV',db.invoices,'no'),quotationNo:q.no,customer:q.customer,title:q.title,dueDate:new Date(Date.now()+7*864e5).toISOString().slice(0,10),status:'Unpaid',items:q.items}; db.invoices.push(inv); save(); alert(`Invoice ${inv.no} generated from ${q.no}`); }
  function createManualInvoice(){ if(!db.quotations.length){ alert('Create quotation first.'); return; } convertQuotation(db.quotations.length-1); }
  function savePayment(){ const no=$('#payInvoice').value; const inv=db.invoices.find(x=>x.no===no); const p={date:$('#payDate').value||today(),invoiceNo:no,amount:Number($('#payAmount').value||0),method:$('#payMethod').value,ref:$('#payRef').value}; db.payments.push(p); if(inv){ const paid=db.payments.filter(x=>x.invoiceNo===no).reduce((s,x)=>s+Number(x.amount||0),0); inv.status = paid >= total(inv.items) ? 'Paid' : 'Partial'; } save(); }
  function markPaid(i){ const inv=db.invoices[i]; if(!inv)return; db.payments.push({date:today(),invoiceNo:inv.no,amount:total(inv.items),method:'Manual Mark Paid',ref:'ADMIN'}); inv.status='Paid'; save(); }
  function saveProject(){ const pr={no:nextNo('PRJ',db.projects,'no'),customer:$('#prProspect').value||'',name:$('#prName').value||'Untitled Project',type:$('#prType').value,status:$('#prStatus').value,created:today()}; db.projects.push(pr); save(); }

  function docHTML(type, d){ const isInv=type==='INVOICE'; const amount=total(d.items); return `<div class="doc-preview"><div class="doc-head"><div class="doc-brand"><img src="${LOGO}" alt="Restu Harmoni Logo"><div><h2>RESTU HARMONI</h2><div class="office-mini">Digital Solutions • Website • AI • Automation</div></div></div><div class="doc-title"><h2>${type}</h2><strong>${d.no}</strong><br><span class="office-mini">Date: ${today()}</span></div></div><div class="office-form-grid"><div><h3>Prepared For</h3><p>${d.customer||'-'}<br><span class="office-mini">Prospect record from RH Services Sales Workspace</span></p></div><div><h3>${isInv?'Payment':'Quotation'} Details</h3><p>Status: ${d.status}<br>${isInv?'Due Date':'Valid Until'}: ${d.dueDate||d.validUntil||'-'}</p></div></div><div class="table-wrap"><table class="office-table"><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${(d.items||[]).map(i=>`<tr><td>${i.desc}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.qty*i.price)}</td></tr>`).join('')}</tbody></table></div><p class="doc-total">Total: ${money(amount)}</p><div class="office-actions"><button class="btn dark" onclick="window.print()">Print / Save PDF</button></div></div>`; }
  function viewQuotation(i){ const q=db.quotations[i]; const w=$('#quotationPreviewWrap'); if(w&&q) w.innerHTML=`<h2>Quotation Preview</h2>${docHTML('QUOTATION',q)}`; }
  function previewQuotation(){ const q={no:'PREVIEW',customer:$('#qtProspect').value,title:$('#qtTitle').value,validUntil:$('#qtValid').value,status:'Preview',items:collectQtItems()}; $('#quotationPreviewWrap').innerHTML=`<h2>Quotation Preview</h2>${docHTML('QUOTATION',q)}`; }
  function viewInvoice(i){ const inv=db.invoices[i]; const w=$('#invoicePreviewWrap'); if(w&&inv) w.innerHTML=`<h2>Invoice Preview</h2>${docHTML('INVOICE',inv)}`; }

  function renderAll(){
    const opts = db.customers.map(c=>`<option value="${c.name}">${c.code} — ${c.name}${c.company?' / '+c.company:''}</option>`).join('');
    ['qtProspect','prProspect'].forEach(id=>{ const el=$('#'+id); if(el) el.innerHTML=opts || '<option>Walk-in Prospect</option>'; });
    const pay=$('#payInvoice'); if(pay) pay.innerHTML=db.invoices.map(i=>`<option value="${i.no}">${i.no} — ${i.customer} — ${money(total(i.items))}</option>`).join('');
    const ct=$('#customersTbody'); if(ct) ct.innerHTML=db.customers.map((c,i)=>`<tr><td>${c.code}</td><td><b>${c.name}</b><br><span class="office-mini">${c.company||'-'}</span></td><td>${c.phone||'-'}<br><span class="office-mini">${c.email||''}</span></td><td>${esc(c.package||'-')}<br><span class="office-mini">${esc(c.score||'')} ${esc(c.temperature||'')}</span></td><td>${pill(c.status)}</td><td><button class="btn ghost danger-lite" data-delete-customer="${i}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No prospect yet. Convert lead daripada Lead Inbox.</td></tr>';
    const qt=$('#quotationsTbody'); if(qt) qt.innerHTML=db.quotations.map((q,i)=>`<tr><td>${q.no}</td><td>${q.customer}</td><td>${money(total(q.items))}</td><td>${pill(q.status)}</td><td><button class="btn ghost" data-view-qt="${i}">View</button> <button class="btn gold" data-convert-qt="${i}">Follow Up</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No quotation yet.</td></tr>';
    const kb=$('#quotationKanban'); if(kb){ const stages=['Draft','Sent','Viewed','Approved','Invoice']; kb.innerHTML=stages.map(st=>`<div class="pipeline-col"><h3>${st}</h3>${db.quotations.map((q,i)=>({q,i})).filter(x=> st==='Invoice' ? db.invoices.some(inv=>inv.quotationNo===x.q.no) : x.q.status===st).map(x=>`<div class="pipeline-card"><b>${x.q.no}</b><div>${x.q.customer}</div><div class="office-mini">${money(total(x.q.items))}</div><div class="actions"><button class="btn ghost" data-view-qt="${x.i}">View</button>${st!=='Invoice'?` <button class="btn gold" data-convert-qt="${x.i}">Invoice</button>`:''}</div></div>`).join('') || '<div class="office-mini">Empty</div>'}</div>`).join(''); }
    const it=$('#invoicesTbody'); if(it) it.innerHTML=db.invoices.map((inv,i)=>`<tr><td>${inv.no}</td><td>${inv.customer}</td><td>${inv.dueDate}</td><td>${money(total(inv.items))}</td><td>${pill(inv.status)}</td><td><button class="btn ghost" data-view-inv="${i}">View</button> <button class="btn gold" data-mark-paid="${i}">Paid</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No invoice yet. Convert quotation first.</td></tr>';
    const pt=$('#paymentsTbody'); if(pt) pt.innerHTML=db.payments.map(p=>`<tr><td>${p.date}</td><td>${p.invoiceNo}</td><td>${money(p.amount)}</td><td>${p.method}</td><td>${p.ref||'-'}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No payment yet.</td></tr>';
    const pr=$('#projectsTbody'); if(pr) pr.innerHTML=db.projects.map(p=>`<tr><td>${p.no}</td><td>${p.name}</td><td>${p.customer}</td><td>${p.type}</td><td>${pill(p.status)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No project yet.</td></tr>';
    const unpaid=db.invoices.filter(i=>i.status!=='Paid').reduce((s,i)=>s+total(i.items),0), paid=db.invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+total(i.items),0);
    setText('kpiUnpaid',money(unpaid)); setText('kpiPaid',money(paid)); setText('kpiDraftInv',db.invoices.filter(i=>i.status==='Draft').length); setText('kpiInvCount',db.invoices.length); setText('docQtCount',`${db.quotations.length} documents`); setText('docInvCount',`${db.invoices.length} documents`); setText('docPayCount',`${db.payments.length} records`); setText('repProspects',db.customers.length); setText('repQtValue',money(db.quotations.reduce((s,q)=>s+total(q.items),0))); setText('repInvValue',money(db.invoices.reduce((s,i)=>s+total(i.items),0))); setText('repProjects',db.projects.length); setText('dashLeads', officeLeads.filter(x=>!['prospect','quotation','negotiation','won','lost'].includes(normalizeLeadStage(x))).length); setText('dashProspects',db.customers.length); setText('dashQt',money(db.quotations.reduce((s,q)=>s+total(q.items),0))); setText('dashOutstanding',money(unpaid)); setText('dashProjects',db.projects.length);
  }
  function setText(id,val){ const el=$('#'+id); if(el) el.textContent=val; }
  function setTab(tab){ const side=document.querySelector(`.side button[data-tab="${tab}"]`); if(side){ side.click(); return; } document.querySelectorAll('.side button[data-tab]').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); document.querySelectorAll('main.panel > section[id^="tab-"]').forEach(el=>{ el.style.display=(el.id==='tab-'+tab?'block':'none'); }); }

  document.addEventListener('DOMContentLoaded', () => { addOfficeStyles(); patchLogo(); replaceSections(); bindEvents(); renderAll(); resetQuotation(); const pd=$('#payDate'); if(pd)pd.value=today(); refreshOfficeLeads(); });
})();
