(function(){
  const SESSION_KEY='rh_admin_session_v1';
  const qs=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  let rows=[];
  const roles=['SUPER_ADMIN','ADMIN','SALES','FINANCE','PROJECT_MANAGER','CONTENT','SUPPORT','VIEWER'];
  function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'{}')}catch{return{}}}
  async function client(){return window.RHGetSupabaseClient ? await window.RHGetSupabaseClient() : null}
  async function sha256(text){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}
  function canManage(){return ['SUPER_ADMIN','ADMIN'].includes(String(session().role||'').toUpperCase())}
  function isSuper(){return String(session().role||'').toUpperCase()==='SUPER_ADMIN'}
  function pill(status){return `<span class="status-pill ${status==='active'?'closed':'lost'}">${esc(status||'-')}</span>`}
  function fmtDate(v){if(!v)return '-';try{return new Date(v).toLocaleString('ms-MY',{dateStyle:'medium',timeStyle:'short'})}catch{return v}}
  function openModal(mode,row){
    if(!canManage()){alert('Akses terhad. Hanya ADMIN / SUPER_ADMIN boleh urus staff.');return}
    const m=qs('#staffModal'); if(!m)return;
    qs('#staffModalTitle').textContent=mode==='edit'?'Edit Staff':'Add Staff';
    qs('#staffModalSub').textContent=mode==='edit'?(row.staff_id||'Edit'):'Create Staff ID baru';
    qs('#staffRowId').value=row?.id||'';
    qs('#staffFormId').value=row?.staff_id||''; qs('#staffFormId').disabled=mode==='edit';
    qs('#staffFullName').value=row?.full_name||'';
    qs('#staffEmail').value=row?.email||'';
    qs('#staffPhone').value=row?.phone||'';
    qs('#staffRole').value=row?.role||'SALES';
    qs('#staffDepartment').value=row?.department||'';
    qs('#staffStatus').value=row?.status||'active';
    qs('#staffPassword').value='';
    qs('#staffNotes').value=row?.notes||'';
    m.hidden=false;
  }
  function closeModal(){const m=qs('#staffModal'); if(m)m.hidden=true}
  async function log(action,message,id){try{const c=await client(); await c.from('audit_logs').insert({module:'staff',record_id:String(id||''),record_label:'staff_users',action,staff_id:session().staff_id||'system',notes:message});}catch{}}
  async function requirePassword(label){
    const s=session(); if(!s.staff_id){alert('Session tidak sah.');return false}
    const pass=prompt(`Masukkan password admin untuk ${label}:`); if(!pass)return false;
    const c=await client(); const {data,error}=await c.from('staff_users').select('password_hash,status').eq('staff_id',s.staff_id).maybeSingle();
    if(error||!data||data.status!=='active'){alert('Admin tidak sah.');return false}
    if(await sha256(pass)!==data.password_hash){alert('Password salah.');return false}
    return true;
  }
  async function load(){
    const c=await client(); if(!c)return;
    const body=qs('#staffTableBody'); if(body)body.innerHTML='<tr><td colspan="6">Loading staff...</td></tr>';
    const {data,error}=await c.from('staff_users').select('*').order('created_at',{ascending:false});
    if(error){ if(body)body.innerHTML=`<tr><td colspan="6">Gagal load staff: ${esc(error.message)}</td></tr>`; return; }
    rows=(data||[]).filter(r=>!r.is_deleted);
    render();
  }
  function render(){
    const total=rows.length, active=rows.filter(r=>r.status==='active').length, suspended=rows.filter(r=>r.status==='suspended').length, admins=rows.filter(r=>['SUPER_ADMIN','ADMIN'].includes(r.role)).length;
    const set=(id,v)=>{const e=qs(id); if(e)e.textContent=v}; set('#staffTotal',total); set('#staffActive',active); set('#staffSuspended',suspended); set('#staffAdmins',admins);
    const search=String(qs('#staffSearch')?.value||'').toLowerCase(); const role=qs('#staffRoleFilter')?.value||'all'; const status=qs('#staffStatusFilter')?.value||'all';
    const list=rows.filter(r=>{
      const hay=[r.staff_id,r.full_name,r.email,r.role,r.department,r.phone].join(' ').toLowerCase();
      return (!search||hay.includes(search)) && (role==='all'||r.role===role) && (status==='all'||r.status===status);
    });
    const body=qs('#staffTableBody'); if(!body)return;
    if(!list.length){body.innerHTML='<tr><td colspan="6"><div class="empty-state">Tiada staff untuk filter ini.</div></td></tr>';return;}
    body.innerHTML=list.map(r=>`<tr>
      <td data-label="Staff"><strong>${esc(r.staff_id)}</strong><span class="small-muted">${esc(r.full_name||'-')} ${r.email?'• '+esc(r.email):''}</span></td>
      <td data-label="Role"><strong>${esc(r.role||'-')}</strong></td>
      <td data-label="Department">${esc(r.department||'-')}</td>
      <td data-label="Status">${pill(r.status)}</td>
      <td data-label="Last Login">${esc(fmtDate(r.last_login))}</td>
      <td data-label="Action"><div class="table-actions">
        <button class="mini-btn primary" data-staff-edit="${esc(r.id)}">Edit</button>
        <button class="mini-btn" data-staff-reset="${esc(r.id)}">Reset</button>
        ${r.status==='active'?`<button class="mini-btn" data-staff-status="${esc(r.id)}" data-status="suspended">Suspend</button>`:`<button class="mini-btn" data-staff-status="${esc(r.id)}" data-status="active">Activate</button>`}
        <button class="mini-btn danger" data-staff-delete="${esc(r.id)}">Delete</button>
      </div></td>
    </tr>`).join('');
  }
  async function save(e){
    e.preventDefault(); if(!canManage()){alert('Akses terhad.');return}
    const c=await client(); const id=qs('#staffRowId').value; const pwd=qs('#staffPassword').value;
    const payload={
      full_name:qs('#staffFullName').value.trim(), email:qs('#staffEmail').value.trim()||null, phone:qs('#staffPhone').value.trim()||null,
      role:qs('#staffRole').value, department:qs('#staffDepartment').value.trim()||null, status:qs('#staffStatus').value, notes:qs('#staffNotes').value.trim()||null, updated_at:new Date().toISOString()
    };
    if(payload.role==='SUPER_ADMIN' && !isSuper()){alert('Hanya SUPER_ADMIN boleh set role SUPER_ADMIN.');return}
    if(pwd) payload.password_hash=await sha256(pwd);
    if(id){
      if(!await requirePassword('sahkan edit staff'))return;
      const {error}=await c.from('staff_users').update(payload).eq('id',id); if(error){alert(error.message);return} await log('update',`Staff updated: ${payload.full_name}`,id);
    }else{
      const staffId=qs('#staffFormId').value.trim().toUpperCase(); if(!staffId){alert('Staff ID wajib.');return} if(!pwd){alert('Password wajib untuk staff baru.');return}
      payload.staff_id=staffId; payload.created_by=session().staff_id||'system';
      const {error}=await c.from('staff_users').insert(payload); if(error){alert(error.message);return} await log('create',`Staff created: ${staffId}`,staffId);
    }
    closeModal(); await load();
  }
  async function updateStatus(id,status){
    const r=rows.find(x=>x.id===id); if(!r)return;
    if(r.role==='SUPER_ADMIN' && !isSuper()){alert('Hanya SUPER_ADMIN boleh ubah SUPER_ADMIN.');return}
    if(!await requirePassword(`${status==='active'?'activate':'suspend'} staff ${r.staff_id}`))return;
    const c=await client(); const {error}=await c.from('staff_users').update({status,updated_at:new Date().toISOString()}).eq('id',id); if(error){alert(error.message);return}
    await log('status',`${r.staff_id} -> ${status}`,id); await load();
  }
  async function resetPassword(id){
    const r=rows.find(x=>x.id===id); if(!r)return;
    if(r.role==='SUPER_ADMIN' && !isSuper()){alert('Hanya SUPER_ADMIN boleh reset SUPER_ADMIN.');return}
    const p=prompt(`Password baru untuk ${r.staff_id}:`); if(!p)return; if(p.length<6){alert('Password minimum 6 aksara.');return}
    if(!await requirePassword('reset password staff'))return;
    const c=await client(); const {error}=await c.from('staff_users').update({password_hash:await sha256(p),updated_at:new Date().toISOString()}).eq('id',id); if(error){alert(error.message);return}
    await log('reset_password',`Password reset for ${r.staff_id}`,id); alert('Password staff berjaya direset.');
  }
  async function remove(id){
    const r=rows.find(x=>x.id===id); if(!r)return;
    if(r.staff_id===session().staff_id){alert('Tidak boleh delete akaun sendiri.');return}
    if(r.role==='SUPER_ADMIN' && !isSuper()){alert('Hanya SUPER_ADMIN boleh delete SUPER_ADMIN.');return}
    const word=prompt(`WARNING: ${r.staff_id} akan diarkibkan secara soft delete. Taip DELETE untuk teruskan.`); if(word!=='DELETE')return;
    const reason=prompt('Sebab delete/arkib staff:')||'No reason';
    if(!await requirePassword('delete staff'))return;
    const c=await client(); const {error}=await c.from('staff_users').update({is_deleted:true,deleted_at:new Date().toISOString(),deleted_by:session().staff_id||'system',delete_reason:reason,status:'suspended',updated_at:new Date().toISOString()}).eq('id',id);
    if(error){alert(error.message);return} await log('soft_delete',`${r.staff_id} archived. Reason: ${reason}`,id); await load();
  }
  function bind(){
    if(!qs('#staffTableBody'))return;
    qs('#addStaffBtn')?.addEventListener('click',()=>openModal('add',{})); qs('#refreshStaffBtn')?.addEventListener('click',load);
    qs('#staffModalClose')?.addEventListener('click',closeModal); qs('#staffCancelBtn')?.addEventListener('click',closeModal); qs('#staffForm')?.addEventListener('submit',save);
    ['#staffSearch','#staffRoleFilter','#staffStatusFilter'].forEach(id=>qs(id)?.addEventListener('input',render)); ['#staffRoleFilter','#staffStatusFilter'].forEach(id=>qs(id)?.addEventListener('change',render));
    document.addEventListener('click',e=>{
      const edit=e.target.closest('[data-staff-edit]'); if(edit){const r=rows.find(x=>x.id===edit.dataset.staffEdit); if(r)openModal('edit',r)}
      const st=e.target.closest('[data-staff-status]'); if(st)updateStatus(st.dataset.staffStatus,st.dataset.status);
      const reset=e.target.closest('[data-staff-reset]'); if(reset)resetPassword(reset.dataset.staffReset);
      const del=e.target.closest('[data-staff-delete]'); if(del)remove(del.dataset.staffDelete);
    });
    load();
  }
  document.addEventListener('DOMContentLoaded',bind);
})();
