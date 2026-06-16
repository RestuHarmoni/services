/* RH Services v1.3 Subscription & Renewal Engine
   New isolated module. Does not modify locked sales/project engines. */
const RHSubscriptions = (() => {
  const SESSION_KEY = 'rh_admin_session_v1';
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => [...document.querySelectorAll(s)];
  let subscriptionsCache = [];
  let invoicesCache = [];
  let projectsCache = [];
  let currentSubscription = null;

  const fmtRM = (n) => new Intl.NumberFormat('ms-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(Number(n||0));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const todayISO = () => new Date().toISOString().slice(0,10);
  const dateShort = (d) => d ? new Date(d).toLocaleDateString('ms-MY',{day:'2-digit',month:'short',year:'numeric'}) : '-';
  const getSession = () => { try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null} };
  async function getClient(){ if(window.RHGetSupabaseClient) return await window.RHGetSupabaseClient(); return window.supabaseClient || null; }
  function protect(){
    const s=getSession();
    if(!s){ location.href='login.html'; return null; }
    const badge=qs('#staffBadge'); if(badge) badge.textContent = `${s.full_name||s.staff_id} • ${s.role||'staff'}`;
    return s;
  }
  function bindBase(){
    const menu=qs('#menuBtn'); if(menu) menu.onclick=()=>qs('#sidebar')?.classList.toggle('open');
    const logout=qs('#logoutBtn'); if(logout) logout.onclick=()=>{localStorage.removeItem(SESSION_KEY); location.href='login.html';};
  }
  function addMonthsISO(dateISO, months){
    const d = dateISO ? new Date(dateISO+'T00:00:00') : new Date();
    const day = d.getDate();
    d.setMonth(d.getMonth()+months);
    if(d.getDate() < day) d.setDate(0);
    return d.toISOString().slice(0,10);
  }
  function addDaysISO(dateISO, days){ const d=new Date((dateISO||todayISO())+'T00:00:00'); d.setDate(d.getDate()+Number(days||0)); return d.toISOString().slice(0,10); }
  function cycleMonths(cycle){ return cycle==='yearly'?12:(cycle==='six_months'?6:1); }
  function cycleLabel(cycle){ return ({monthly:'Monthly',six_months:'6 Months',yearly:'Yearly'})[cycle] || 'Monthly'; }
  function planMonthlyAmount(plan){ const p=String(plan||'').toLowerCase(); if(p.includes('pro')) return 199; if(p.includes('business')) return 149; return 129; }
  function defaultCycleAmount(monthly, cycle){
    if(cycle==='six_months') return monthly===129?699:monthly*6;
    if(cycle==='yearly') return monthly===129?1299:monthly*12;
    return monthly;
  }
  function defaultDiscount(monthly, cycle, amount){ return Math.max(0,(monthly*cycleMonths(cycle))-Number(amount||0)); }
  function normalizeStatus(st){ return String(st||'active').toLowerCase().replace(/\s+/g,'_'); }
  function displayStatus(sub){
    const base=normalizeStatus(sub.status);
    if(['suspended','cancelled'].includes(base)) return base;
    const next=sub.next_billing_date || sub.current_period_end;
    if(!next) return base;
    const now=new Date(todayISO()+'T00:00:00');
    const due=new Date(next+'T00:00:00');
    const diff=Math.ceil((due-now)/(1000*60*60*24));
    if(diff < -30) return 'expired';
    if(diff < 0) return 'overdue';
    if(diff <= 30) return 'due_soon';
    return base;
  }
  function statusLabel(st){ return ({active:'Active',due_soon:'Due Soon',overdue:'Overdue',expired:'Expired',suspended:'Suspended',cancelled:'Cancelled',draft:'Draft',sent:'Sent',paid:'Paid'})[normalizeStatus(st)] || st || '-'; }
  function subscriptionNoFromCount(count){ return `SUB-${new Date().getFullYear()}-${String(Number(count||0)+1).padStart(4,'0')}`; }
  async function nextSubscriptionNo(client){ try{ const {count}=await client.from('subscriptions').select('*',{count:'exact',head:true}); return subscriptionNoFromCount(count); }catch{return `SUB-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;} }
  async function nextRenewalInvoiceNo(client){ try{ const {count}=await client.from('subscription_invoices').select('*',{count:'exact',head:true}); return `MNT-${new Date().getFullYear()}-${String(Number(count||0)+1).padStart(4,'0')}`; }catch{return `MNT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;} }

  async function loadSubscriptionsPage(){
    const client=await getClient(); if(!client) return;
    try{
      const [subs, invs, projects] = await Promise.all([
        client.from('subscriptions').select('*').order('created_at',{ascending:false}).limit(300),
        client.from('subscription_invoices').select('*').order('created_at',{ascending:false}).limit(300),
        client.from('projects').select('*').order('created_at',{ascending:false}).limit(300)
      ]);
      if(subs.error) throw subs.error;
      subscriptionsCache=(subs.data||[]).filter(x=>!x.is_deleted);
      invoicesCache=(invs.data||[]).filter(x=>!x.is_deleted);
      projectsCache=(projects.data||[]).filter(x=>!x.is_deleted);
      renderStats(); renderSubscriptionsTable(); renderSubscriptionInvoicesTable();
    }catch(err){
      console.error('[SUBSCRIPTIONS LOAD ERROR]',err);
      const msg='Gagal load subscriptions. Run SQL migration Subscription & Renewal Engine dahulu.';
      if(qs('#subscriptionsTableBody')) qs('#subscriptionsTableBody').innerHTML=`<tr><td colspan="7"><div class="empty-state">${msg}</div></td></tr>`;
      if(qs('#subscriptionInvoicesTableBody')) qs('#subscriptionInvoicesTableBody').innerHTML=`<tr><td colspan="7"><div class="empty-state">${msg}</div></td></tr>`;
    }
  }
  function renderStats(){
    const active=subscriptionsCache.filter(s=>displayStatus(s)==='active').length;
    const due=subscriptionsCache.filter(s=>displayStatus(s)==='due_soon').length;
    const overdue=subscriptionsCache.filter(s=>['overdue','expired'].includes(displayStatus(s))).length;
    const suspended=subscriptionsCache.filter(s=>displayStatus(s)==='suspended').length;
    const mrr=subscriptionsCache.filter(s=>!['suspended','cancelled'].includes(normalizeStatus(s.status))).reduce((sum,s)=>sum+Number(s.monthly_amount||0),0);
    const paid=invoicesCache.filter(i=>normalizeStatus(i.status)==='paid').reduce((sum,i)=>sum+Number(i.amount||0),0);
    qs('#subCountActive').textContent=active; qs('#subCountDueSoon').textContent=due; qs('#subCountOverdue').textContent=overdue; qs('#subCountSuspended').textContent=suspended; qs('#subMRR').textContent=fmtRM(mrr); qs('#subRenewalRevenue').textContent=fmtRM(paid);
  }
  function renderSubscriptionsTable(){
    const body=qs('#subscriptionsTableBody'); if(!body) return;
    const q=String(qs('#subscriptionSearch')?.value||'').toLowerCase();
    const f=String(qs('#subscriptionStatusFilter')?.value||'');
    let rows=subscriptionsCache.slice();
    if(q) rows=rows.filter(s=>[s.subscription_no,s.client_name,s.phone,s.package_name,s.plan_name].some(v=>String(v||'').toLowerCase().includes(q)));
    if(f) rows=rows.filter(s=>displayStatus(s)===f);
    if(!rows.length){ body.innerHTML='<tr><td colspan="7"><div class="empty-state">Tiada subscription untuk filter ini.</div></td></tr>'; return; }
    body.innerHTML=rows.map(s=>{
      const st=displayStatus(s);
      return `<tr><td><strong>${esc(s.subscription_no||'-')}</strong><span class="small-muted">${esc(s.project_no||'')}</span></td><td><strong>${esc(s.client_name||'-')}</strong><span class="small-muted">${esc(s.phone||'')}</span></td><td>${esc(s.plan_name||s.package_name||'-')}<span class="small-muted">${esc(s.package_name||'')}</span></td><td><strong>${fmtRM(s.cycle_amount||0)}</strong><span class="small-muted">${cycleLabel(s.billing_cycle)} • Discount ${fmtRM(s.discount_amount||0)}</span></td><td>${dateShort(s.next_billing_date||s.current_period_end)}</td><td><span class="status-pill ${st}">${statusLabel(st)}</span></td><td><div class="table-actions"><button class="mini-btn primary" data-view-subscription="${s.id}">View</button><button class="mini-btn" data-renew-subscription="${s.id}">Renew Invoice</button></div></td></tr>`;
    }).join('');
  }
  function renderSubscriptionInvoicesTable(){
    const body=qs('#subscriptionInvoicesTableBody'); if(!body) return;
    const rows=invoicesCache.slice().sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
    if(!rows.length){ body.innerHTML='<tr><td colspan="7"><div class="empty-state">Belum ada renewal invoice.</div></td></tr>'; return; }
    body.innerHTML=rows.map(i=>{
      const st=normalizeStatus(i.status);
      return `<tr><td><strong>${esc(i.invoice_no||'-')}</strong><span class="small-muted">${esc(i.billing_cycle||'')}</span></td><td>${esc(i.client_name||'-')}</td><td>${dateShort(i.period_start)} → ${dateShort(i.period_end)}</td><td><strong>${fmtRM(i.amount||0)}</strong></td><td>${dateShort(i.due_date)}</td><td><span class="status-pill ${st}">${statusLabel(st)}</span></td><td><div class="table-actions">${st==='paid'?`<span class="small-muted">Paid ${dateShort(i.paid_at)}</span>`:`<button class="mini-btn primary" data-mark-sub-invoice-paid="${i.id}">Mark Paid</button>`}</div></td></tr>`;
    }).join('');
  }

  async function openSubscriptionCreateModal(){
    const modal=qs('#subscriptionCreateModal'); if(!modal) return;
    const used=new Set(subscriptionsCache.map(s=>String(s.project_id)));
    const completed=projectsCache.filter(p=>normalizeStatus(p.status)==='completed' && !used.has(String(p.id)));
    const sel=qs('#subscriptionProjectSelect');
    if(sel) sel.innerHTML=completed.length ? completed.map(p=>`<option value="${p.id}">${esc(p.project_no||'PRJ')} — ${esc(p.client_name||'-')} — ${esc(p.package_name||'-')}</option>`).join('') : '<option value="">Tiada completed project yang belum ada subscription</option>';
    qs('#subscriptionStartDate').value=todayISO();
    updateSubscriptionPricing();
    modal.hidden=false;
  }
  function closeSubscriptionCreateModal(){ const m=qs('#subscriptionCreateModal'); if(m) m.hidden=true; }
  function updateSubscriptionPricing(){
    const plan=qs('#subscriptionPlanSelect'); const cycle=qs('#subscriptionCycleSelect')?.value || 'monthly';
    const opt=plan?.selectedOptions?.[0]; const monthly=Number(opt?.dataset?.monthly || planMonthlyAmount(plan?.value));
    const amount=defaultCycleAmount(monthly, cycle);
    qs('#subscriptionCycleAmount').value=amount;
    qs('#subscriptionDiscount').value=defaultDiscount(monthly, cycle, amount);
  }
  async function submitSubscriptionCreate(e){
    e.preventDefault();
    const client=await getClient(); if(!client) return;
    const projectId=qs('#subscriptionProjectSelect')?.value; if(!projectId){ alert('Tiada project dipilih.'); return; }
    const project=projectsCache.find(p=>String(p.id)===String(projectId)); if(!project){ alert('Project tidak dijumpai.'); return; }
    const plan=qs('#subscriptionPlanSelect')?.value || 'RH Basic Maintenance';
    const cycle=qs('#subscriptionCycleSelect')?.value || 'monthly';
    const monthly=planMonthlyAmount(plan);
    const start=qs('#subscriptionStartDate')?.value || todayISO();
    const end=addMonthsISO(start, cycleMonths(cycle));
    const payload={
      subscription_no:await nextSubscriptionNo(client),
      project_id:project.id,
      project_no:project.project_no||null,
      invoice_id:project.invoice_id||null,
      client_name:project.client_name||'Client',
      phone:project.phone||null,
      email:project.email||null,
      company:project.company||null,
      business_type:project.business_type||null,
      package_name:project.package_name||null,
      plan_name:plan,
      billing_cycle:cycle,
      monthly_amount:monthly,
      cycle_amount:Number(qs('#subscriptionCycleAmount')?.value||0),
      discount_amount:Number(qs('#subscriptionDiscount')?.value||0),
      status:'active',
      start_date:start,
      current_period_start:start,
      current_period_end:end,
      next_billing_date:end,
      notes:qs('#subscriptionNotes')?.value||'Maintenance subscription created after project completion.',
      created_by:(getSession()||{}).staff_id||'system'
    };
    const {data,error}=await client.from('subscriptions').insert(payload).select().single();
    if(error){ alert('Gagal create subscription: '+error.message); return; }
    closeSubscriptionCreateModal(); await loadSubscriptionsPage(); openSubscriptionModal(data.id);
  }
  async function syncCompletedProjects(){
    const client=await getClient(); if(!client) return;
    const used=new Set(subscriptionsCache.map(s=>String(s.project_id)));
    const completed=projectsCache.filter(p=>normalizeStatus(p.status)==='completed' && !used.has(String(p.id)));
    if(!completed.length){ alert('Tiada completed project baru untuk disync.'); return; }
    if(!confirm(`Create subscription untuk ${completed.length} completed project?`)) return;
    const rows=[];
    let baseCount=0;
    try{ const {count}=await client.from('subscriptions').select('*',{count:'exact',head:true}); baseCount=Number(count||0); }catch{}
    let seq=baseCount;
    for(const p of completed){
      const plan = String(p.package_name||'').toLowerCase().includes('pro') ? 'RH Pro Maintenance' : (String(p.package_name||'').toLowerCase().includes('business') ? 'RH Business Maintenance' : 'RH Basic Maintenance');
      const monthly=planMonthlyAmount(plan); const cycle='monthly'; const start=todayISO(); const end=addMonthsISO(start,1);
      seq += 1;
      rows.push({subscription_no:subscriptionNoFromCount(seq-1), project_id:p.id, project_no:p.project_no||null, invoice_id:p.invoice_id||null, client_name:p.client_name||'Client', phone:p.phone||null, email:p.email||null, company:p.company||null, business_type:p.business_type||null, package_name:p.package_name||null, plan_name:plan, billing_cycle:cycle, monthly_amount:monthly, cycle_amount:monthly, discount_amount:0, status:'active', start_date:start, current_period_start:start, current_period_end:end, next_billing_date:end, notes:'Auto synced from completed project. Default monthly maintenance plan.', created_by:(getSession()||{}).staff_id||'system'});
    }
    const {error}=await client.from('subscriptions').insert(rows);
    if(error){ alert('Sync gagal: '+error.message); return; }
    await loadSubscriptionsPage(); alert('Completed projects berjaya disync ke subscriptions.');
  }
  async function openSubscriptionModal(id){
    const client=await getClient(); if(!client) return;
    let sub=subscriptionsCache.find(s=>String(s.id)===String(id));
    if(!sub){ const {data}=await client.from('subscriptions').select('*').eq('id',id).maybeSingle(); sub=data; }
    if(!sub) return;
    currentSubscription=sub;
    const invs=invoicesCache.filter(i=>String(i.subscription_id)===String(sub.id));
    qs('#subscriptionModalTitle').textContent=sub.subscription_no||'Subscription';
    qs('#subscriptionModalSub').textContent=`${sub.client_name||'-'} • ${statusLabel(displayStatus(sub))}`;
    qs('#subscriptionPreview').innerHTML=renderSubscriptionDetail(sub,invs);
    syncSubscriptionActions(sub);
    qs('#subscriptionModal').hidden=false;
  }
  function closeSubscriptionModal(){ const m=qs('#subscriptionModal'); if(m) m.hidden=true; currentSubscription=null; }
  function renderSubscriptionDetail(s,invs=[]){
    const st=displayStatus(s);
    const fields=[['Client',s.client_name],['Phone',s.phone],['Email',s.email],['Project',s.project_no],['Package',s.package_name],['Plan',s.plan_name],['Monthly Amount',fmtRM(s.monthly_amount||0)],['Billing Cycle',cycleLabel(s.billing_cycle)],['Cycle Amount',fmtRM(s.cycle_amount||0)],['Discount',fmtRM(s.discount_amount||0)],['Status',statusLabel(st)],['Start Date',dateShort(s.start_date)],['Current Period',`${dateShort(s.current_period_start)} → ${dateShort(s.current_period_end)}`],['Next Billing',dateShort(s.next_billing_date)],['Suspended At',dateShort(s.suspended_at)],['Cancelled At',dateShort(s.cancelled_at)]];
    const invHtml=invs.length?`<div class="renewal-list">${invs.map(i=>`<div class="renewal-item"><div><strong>${esc(i.invoice_no||'-')} • ${fmtRM(i.amount||0)}</strong><span>${dateShort(i.period_start)} → ${dateShort(i.period_end)} • Due ${dateShort(i.due_date)} • ${statusLabel(i.status)}</span></div><div class="table-actions">${normalizeStatus(i.status)==='paid'?'<span class="status-pill paid">Paid</span>':`<button class="mini-btn primary" data-mark-sub-invoice-paid="${i.id}">Mark Paid</button>`}</div></div>`).join('')}</div>`:'<div class="empty-state">Belum ada renewal invoice.</div>';
    return `<div class="subscription-summary-grid">${fields.map(([k,v])=>`<div class="subscription-status-card"><span>${esc(k)}</span><strong>${esc(v||'-')}</strong></div>`).join('')}<div class="subscription-status-card full"><span>Notes</span><strong>${esc(s.notes||'-')}</strong></div><div class="subscription-status-card full"><span>Renewal Invoices</span>${invHtml}</div></div>`;
  }
  function syncSubscriptionActions(sub){
    const st=normalizeStatus(sub.status);
    qs('#freezeSubscriptionBtn').hidden = ['suspended','cancelled'].includes(st);
    qs('#unfreezeSubscriptionBtn').hidden = st!=='suspended';
    qs('#cancelSubscriptionBtn').hidden = st==='cancelled';
    qs('#generateRenewalInvoiceBtn').hidden = st==='cancelled';
  }
  async function generateRenewalInvoice(id){
    const client=await getClient(); if(!client) return;
    const sub=subscriptionsCache.find(s=>String(s.id)===String(id)) || currentSubscription;
    if(!sub){ alert('Subscription tidak dijumpai.'); return; }
    if(normalizeStatus(sub.status)==='cancelled'){ alert('Subscription sudah cancelled.'); return; }
    const open=invoicesCache.find(i=>String(i.subscription_id)===String(sub.id) && !['paid','cancelled'].includes(normalizeStatus(i.status)));
    if(open && !confirm(`Invoice ${open.invoice_no} masih belum paid. Create invoice baru juga?`)) return;
    const start=sub.next_billing_date || sub.current_period_end || todayISO();
    const end=addMonthsISO(start, cycleMonths(sub.billing_cycle));
    const payload={
      subscription_id:sub.id,
      invoice_no:await nextRenewalInvoiceNo(client),
      client_name:sub.client_name,
      phone:sub.phone||null,
      email:sub.email||null,
      company:sub.company||null,
      plan_name:sub.plan_name,
      billing_cycle:sub.billing_cycle,
      period_start:start,
      period_end:end,
      amount:Number(sub.cycle_amount||0),
      status:'sent',
      due_date:addDaysISO(todayISO(),7),
      created_by:(getSession()||{}).staff_id||'system'
    };
    const {data,error}=await client.from('subscription_invoices').insert(payload).select().single();
    if(error){ alert('Gagal generate renewal invoice: '+error.message); return; }
    await createRenewalReminders(client, data, sub);
    await loadSubscriptionsPage(); if(currentSubscription) openSubscriptionModal(currentSubscription.id);
  }
  async function createRenewalReminders(client, inv, sub){
    const days=[30,14,7];
    const rows=days.map(d=>({subscription_id:sub.id, subscription_invoice_id:inv.id, reminder_type:`${d}_days_before`, reminder_date:addDaysISO(inv.due_date,-d), status:'pending', notes:`Reminder ${d} hari sebelum due date ${inv.invoice_no}`}));
    try{ await client.from('renewal_reminders').insert(rows); }catch(err){ console.warn('[RENEWAL REMINDER WARNING]',err); }
  }
  function openPaymentModal(id){
    const inv=invoicesCache.find(i=>String(i.id)===String(id)); if(!inv) return;
    qs('#subscriptionInvoiceId').value=inv.id;
    qs('#subscriptionPaymentSub').textContent=`${inv.invoice_no} • ${inv.client_name} • ${fmtRM(inv.amount||0)}`;
    qs('#subscriptionPaymentReference').value='';
    qs('#subscriptionPaymentModal').hidden=false;
  }
  function closePaymentModal(){ const m=qs('#subscriptionPaymentModal'); if(m) m.hidden=true; }
  async function submitPayment(e){
    e.preventDefault();
    const client=await getClient(); if(!client) return;
    const id=qs('#subscriptionInvoiceId')?.value;
    const inv=invoicesCache.find(i=>String(i.id)===String(id)); if(!inv){ alert('Invoice tidak dijumpai.'); return; }
    const sub=subscriptionsCache.find(s=>String(s.id)===String(inv.subscription_id)); if(!sub){ alert('Subscription tidak dijumpai.'); return; }
    const paidAt=new Date().toISOString();
    const {error:invErr}=await client.from('subscription_invoices').update({status:'paid',paid_at:paidAt,payment_method:qs('#subscriptionPaymentMethod')?.value||'Bank Transfer',payment_reference:qs('#subscriptionPaymentReference')?.value||null,updated_at:paidAt}).eq('id',inv.id);
    if(invErr){ alert('Gagal mark paid: '+invErr.message); return; }
    const nextStart=inv.period_start || sub.next_billing_date || todayISO();
    const nextEnd=inv.period_end || addMonthsISO(nextStart,cycleMonths(sub.billing_cycle));
    const {error:subErr}=await client.from('subscriptions').update({status:'active',current_period_start:nextStart,current_period_end:nextEnd,next_billing_date:nextEnd,suspended_at:null,updated_at:paidAt}).eq('id',sub.id);
    if(subErr){ alert('Payment masuk, tetapi subscription gagal update: '+subErr.message); }
    closePaymentModal(); await loadSubscriptionsPage(); if(currentSubscription) openSubscriptionModal(sub.id);
  }
  async function setSubscriptionStatus(status){
    if(!currentSubscription) return;
    const client=await getClient(); if(!client) return;
    const now=new Date().toISOString();
    const payload={status,updated_at:now};
    if(status==='suspended') payload.suspended_at=now;
    if(status==='active') payload.suspended_at=null;
    if(status==='cancelled') payload.cancelled_at=now;
    const {error}=await client.from('subscriptions').update(payload).eq('id',currentSubscription.id);
    if(error){ alert('Gagal update status: '+error.message); return; }
    await loadSubscriptionsPage(); openSubscriptionModal(currentSubscription.id);
  }

  function bind(){
    bindBase();
    qs('#refreshSubscriptionsBtn')?.addEventListener('click',loadSubscriptionsPage);
    qs('#subscriptionSearch')?.addEventListener('input',renderSubscriptionsTable);
    qs('#subscriptionStatusFilter')?.addEventListener('change',renderSubscriptionsTable);
    qs('#newSubscriptionBtn')?.addEventListener('click',openSubscriptionCreateModal);
    qs('#syncCompletedProjectsBtn')?.addEventListener('click',syncCompletedProjects);
    qs('#closeSubscriptionCreateModal')?.addEventListener('click',closeSubscriptionCreateModal);
    qs('#cancelSubscriptionCreateBtn')?.addEventListener('click',closeSubscriptionCreateModal);
    qs('#subscriptionCreateForm')?.addEventListener('submit',submitSubscriptionCreate);
    qs('#subscriptionPlanSelect')?.addEventListener('change',updateSubscriptionPricing);
    qs('#subscriptionCycleSelect')?.addEventListener('change',updateSubscriptionPricing);
    qs('#closeSubscriptionModal')?.addEventListener('click',closeSubscriptionModal);
    qs('#generateRenewalInvoiceBtn')?.addEventListener('click',()=>currentSubscription&&generateRenewalInvoice(currentSubscription.id));
    qs('#freezeSubscriptionBtn')?.addEventListener('click',()=>confirm('Freeze subscription ini? Client masih boleh dilihat, tetapi maintenance/support dianggap suspended.')&&setSubscriptionStatus('suspended'));
    qs('#unfreezeSubscriptionBtn')?.addEventListener('click',()=>setSubscriptionStatus('active'));
    qs('#cancelSubscriptionBtn')?.addEventListener('click',()=>confirm('Cancel subscription ini?')&&setSubscriptionStatus('cancelled'));
    qs('#closeSubscriptionPaymentModal')?.addEventListener('click',closePaymentModal);
    qs('#cancelSubscriptionPaymentBtn')?.addEventListener('click',closePaymentModal);
    qs('#subscriptionPaymentForm')?.addEventListener('submit',submitPayment);
    document.addEventListener('click',e=>{
      const view=e.target.closest('[data-view-subscription]'); if(view) openSubscriptionModal(view.dataset.viewSubscription);
      const renew=e.target.closest('[data-renew-subscription]'); if(renew) generateRenewalInvoice(renew.dataset.renewSubscription);
      const paid=e.target.closest('[data-mark-sub-invoice-paid]'); if(paid) openPaymentModal(paid.dataset.markSubInvoicePaid);
    });
  }
  function init(){ bind(); if(!protect()) return; loadSubscriptionsPage(); }
  return {init};
})();
document.addEventListener('DOMContentLoaded', RHSubscriptions.init);
