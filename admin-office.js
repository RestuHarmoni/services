(function(){
  const $=(id)=>document.getElementById(id);
  const today=new Date();
  const year=today.getFullYear();
  const money=(n)=>'RM '+Number(n||0).toLocaleString('ms-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
  const data={
    kpi:[
      ['Total Leads','128','12 new this month','kpi-good'],
      ['Customers','42','8 active accounts','kpi-good'],
      ['Quotation Sent','RM 18,450','6 waiting approval','kpi-warn'],
      ['Outstanding Invoice','RM 7,900','3 overdue follow-up','kpi-bad'],
      ['Paid This Month','RM 12,600','Revenue collected','kpi-good'],
      ['Active Projects','9','Website / AI / Automation','kpi-warn'],
      ['Pending Tasks','17','Operations queue','kpi-warn'],
      ['Support Tickets','4','2 require response','kpi-bad']
    ],
    leads:[
      ['Nur Aisyah','Homestay Website','Website Homestay','Warm','Today'],
      ['Encik Hafiz','Kontraktor Landing Page','Website Syarikat','New','Yesterday'],
      ['Puan Mira','AI WhatsApp Reply','Automation','Follow-up','08/06/2026'],
      ['Zul Auto','Car Rental Website','Website Kereta Sewa','Qualified','07/06/2026']
    ],
    quotations:[
      ['QT-'+year+'-0007','Nur Aisyah','Business Website Package',1299,'Sent'],
      ['QT-'+year+'-0006','Zul Auto','Car Rental Website + SEO',1899,'Pending'],
      ['QT-'+year+'-0005','Mira Enterprise','AI Content Setup',650,'Approved'],
      ['QT-'+year+'-0004','Hafiz Bina','Corporate Website',1599,'Draft']
    ],
    invoices:[
      ['INV-'+year+'-0005','Mira Enterprise',650,'Paid','Paid'],
      ['INV-'+year+'-0004','Zul Auto',1899,'Unpaid','Sent'],
      ['INV-'+year+'-0003','Hafiz Bina',1599,'Overdue','Overdue'],
      ['INV-'+year+'-0002','Kedai Seri',950,'Partial','Pending']
    ],
    projects:[
      ['Homestay Website','Nur Aisyah',65],
      ['Corporate Website','Hafiz Bina',35],
      ['AI Auto Reply','Mira Enterprise',80],
      ['Car Rental Portal','Zul Auto',42]
    ]
  };
  function badge(s){const key=String(s).toLowerCase();return `<span class="status ${key}">${s}</span>`}
  function renderDashboard(){
    if($('kpiGrid')) $('kpiGrid').innerHTML=data.kpi.map(x=>`<div class="kpi-card"><div class="kpi-label">${x[0]}</div><div class="kpi-value">${x[1]}</div><div class="kpi-note ${x[3]}">${x[2]}</div></div>`).join('');
    if($('recentLeads')) $('recentLeads').innerHTML=data.leads.map(x=>`<tr><td><div class="client-name">${x[0]}</div><div class="small-muted">${x[1]}</div></td><td>${x[2]}</td><td>${badge(x[3])}</td><td class="small-muted">${x[4]}</td></tr>`).join('');
    const qRows=data.quotations.map(x=>`<tr><td><strong>${x[0]}</strong><div class="small-muted">${x[2]}</div></td><td>${x[1]}</td><td class="amount right">${money(x[3])}</td><td>${badge(x[4])}</td></tr>`).join('');
    ['pendingQuotations','quotationTableFull'].forEach(id=>{if($(id)) $(id).innerHTML=qRows;});
    const iRows=data.invoices.map(x=>`<tr><td><strong>${x[0]}</strong><div class="small-muted">${x[1]}</div></td><td class="amount right">${money(x[2])}</td><td>${badge(x[4])}</td></tr>`).join('');
    ['outstandingInvoices','invoiceTableFull'].forEach(id=>{if($(id)) $(id).innerHTML=iRows;});
    const pRows=data.projects.map(x=>`<div class="progress-row"><div class="progress-meta"><span>${x[0]} <span class="small-muted">— ${x[1]}</span></span><span>${x[2]}%</span></div><div class="progress-track"><div class="progress-bar" style="width:${x[2]}%"></div></div></div>`).join('');
    ['projectProgress','projectProgressFull'].forEach(id=>{if($(id)) $(id).innerHTML=pRows;});
  }
  function showSection(name){
    document.querySelectorAll('[data-section]').forEach(el=>el.classList.toggle('hidden',el.dataset.section!==name));
    document.querySelectorAll('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===name));
    if($('pageTitle')) $('pageTitle').textContent=document.querySelector(`[data-nav="${name}"]`)?.dataset.title||'Dashboard';
    if(window.innerWidth<1100) $('officeSidebar')?.classList.remove('open');
  }
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-nav]');
    if(nav){e.preventDefault();showSection(nav.dataset.nav)}
    if(e.target.closest('[data-mobile-menu]')) $('officeSidebar')?.classList.toggle('open');
  });
  window.RH_OFFICE={renderDashboard,showSection,data};
  renderDashboard();
})();
