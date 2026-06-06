(function(){
  const BLOG_IMAGE_BUCKET='blog-images';
  let client=null;
  let posts=[];
  let selectedCoverFile=null;
  const $=id=>document.getElementById(id);

  function slugify(text){return String(text||'').toLowerCase().trim().replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
  function nowLocal(){const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16);}
  function escapeHtml(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function setCoverPreview(url){
    const preview=$('postCoverPreview');
    if(preview) preview.style.backgroundImage=url?`url('${String(url).replace(/'/g,"%27")}')`:'';
    const status=$('postCoverStatus');
    if(status) status.textContent=url?'Gambar cover tersedia.':'Belum ada gambar dipilih.';
  }
  function setCoverStatus(msg){const status=$('postCoverStatus'); if(status) status.textContent=msg||'';}

  async function init(){
    if(!window.RH_ADMIN_AUTH) return;
    try{const auth=await window.RH_ADMIN_AUTH.requireAdmin(); if(!auth) return; client=auth.client; bind(); await refreshPosts();}
    catch(err){console.error(err); const tb=$('postsTbody'); if(tb) tb.innerHTML='<tr><td colspan="5">Blog CMS belum aktif. Sila run SUPABASE_BLOG_CMS_V1.sql di Supabase.</td></tr>';}
  }
  function bind(){
    const title=$('postTitle'); if(title) title.addEventListener('input',()=>{if(!$('postSlug').dataset.manual){$('postSlug').value=slugify(title.value)}});
    if($('postSlug')) $('postSlug').addEventListener('input',()=>{$('postSlug').dataset.manual='1'; $('postSlug').value=slugify($('postSlug').value);});
    if($('postCoverFile')) $('postCoverFile').addEventListener('change',onCoverFileChange);
    if($('newPostBtn')) $('newPostBtn').onclick=newPost;
    if($('cancelPostBtn')) $('cancelPostBtn').onclick=()=>toggleEditor(false);
    if($('savePostBtn')) $('savePostBtn').onclick=savePost;
    if($('deletePostBtn')) $('deletePostBtn').onclick=deletePost;
  }
  function onCoverFileChange(e){
    const file=e.target.files&&e.target.files[0];
    selectedCoverFile=null;
    if(!file){setCoverPreview($('postCover')?.value||'');return;}
    if(!file.type.startsWith('image/')){alert('Sila pilih fail gambar sahaja.'); e.target.value=''; return;}
    if(file.size>5*1024*1024){alert('Saiz gambar maksimum 5MB. Sila compress gambar dahulu.'); e.target.value=''; return;}
    selectedCoverFile=file;
    setCoverPreview(URL.createObjectURL(file));
    setCoverStatus('Gambar dipilih. Ia akan diupload bila klik Simpan Artikel.');
  }
  function toggleEditor(show){const el=$('blogEditor'); if(el) el.classList.toggle('hidden',!show);}
  function resetCoverInput(){selectedCoverFile=null; if($('postCoverFile')) $('postCoverFile').value=''; if($('postCover')) $('postCover').value=''; setCoverPreview('');}
  function newPost(){
    ['postId','postTitle','postSlug','postCover','postMetaTitle','postMetaDesc','postKeywords','postContent'].forEach(id=>{if($(id)) $(id).value=''});
    resetCoverInput();
    $('postCategory').value='SEO'; $('postStatus').value='draft'; $('postPublishedAt').value=nowLocal(); $('postSlug').dataset.manual='';
    $('editorTitle').textContent='Artikel Baru'; $('deletePostBtn').classList.add('hidden'); $('previewPostBtn').classList.add('hidden'); toggleEditor(true); $('postTitle').focus();
  }
  function editPost(id){
    const p=posts.find(x=>x.id===id); if(!p)return; toggleEditor(true);
    selectedCoverFile=null; if($('postCoverFile')) $('postCoverFile').value='';
    $('editorTitle').textContent='Edit Artikel'; $('postId').value=p.id; $('postTitle').value=p.title||''; $('postSlug').value=p.slug||''; $('postSlug').dataset.manual='1'; $('postCategory').value=p.category||'SEO'; $('postCover').value=p.cover_image||''; setCoverPreview(p.cover_image||''); $('postMetaTitle').value=p.meta_title||''; $('postMetaDesc').value=p.meta_description||''; $('postKeywords').value=Array.isArray(p.keywords)?p.keywords.join(', '):(p.keywords||''); $('postContent').value=p.content||''; $('postStatus').value=p.status||'draft';
    if(p.published_at){const d=new Date(p.published_at); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); $('postPublishedAt').value=d.toISOString().slice(0,16);} else $('postPublishedAt').value=nowLocal();
    $('deletePostBtn').classList.remove('hidden'); $('previewPostBtn').classList.remove('hidden'); $('previewPostBtn').href='article.html?slug='+encodeURIComponent(p.slug||'');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  async function refreshPosts(){
    if(!client) return;
    const {data,error}=await client.from('blog_posts').select('*').order('created_at',{ascending:false});
    if(error){console.warn(error); const tb=$('postsTbody'); if(tb) tb.innerHTML='<tr><td colspan="5">Tidak dapat baca artikel. Pastikan SUPABASE_BLOG_CMS_V1.sql sudah dijalankan.</td></tr>'; updateStats([]); return;}
    posts=data||[]; renderPosts(); updateStats(posts);
  }
  function updateStats(list){
    const pub=list.filter(p=>p.status==='published').length, draft=list.filter(p=>p.status!=='published').length;
    ['statPublished','blogPublished'].forEach(id=>{if($(id)) $(id).textContent=pub}); ['statDraft','blogDraft'].forEach(id=>{if($(id)) $(id).textContent=draft}); if($('blogTotal')) $('blogTotal').textContent=list.length; if($('statTemplates') && window.templates) $('statTemplates').textContent=Object.keys(window.templates||{}).length;
  }
  function renderPosts(){
    const tb=$('postsTbody'); if(!tb)return;
    if(!posts.length){tb.innerHTML='<tr><td colspan="5" class="muted">Belum ada artikel. Klik + Artikel Baru.</td></tr>';return;}
    tb.innerHTML=posts.map(p=>`<tr><td><strong>${escapeHtml(p.title)}</strong><div class="muted">${escapeHtml((p.meta_description||'').slice(0,100))}</div></td><td><span class="badge ${p.status==='published'?'publish':'draft'}">${p.status==='published'?'Published':'Draft'}</span></td><td>${escapeHtml(p.category||'SEO')}</td><td><code>${escapeHtml(p.slug)}</code></td><td><div class="actions" style="margin:0"><button class="btn soft" data-edit="${p.id}">Edit</button><a class="btn soft" href="article.html?slug=${encodeURIComponent(p.slug)}" target="_blank">View</a></div></td></tr>`).join('');
    tb.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editPost(b.dataset.edit));
  }
  async function uploadCoverIfNeeded(slug){
    if(!selectedCoverFile) return $('postCover')?.value.trim()||'';
    const ext=(selectedCoverFile.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const safeSlug=slugify(slug)||'artikel';
    const path=`articles/${safeSlug}-${Date.now()}.${ext}`;
    setCoverStatus('Sedang upload gambar ke blog...');
    const {error}=await client.storage.from(BLOG_IMAGE_BUCKET).upload(path,selectedCoverFile,{cacheControl:'3600',upsert:false,contentType:selectedCoverFile.type});
    if(error){
      throw new Error('Gagal upload gambar. Pastikan bucket Supabase Storage bernama blog-images sudah dibuat dan policy storage sudah aktif. Detail: '+error.message);
    }
    const {data}=client.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(path);
    const publicUrl=data&&data.publicUrl?data.publicUrl:'';
    if($('postCover')) $('postCover').value=publicUrl;
    selectedCoverFile=null; if($('postCoverFile')) $('postCoverFile').value='';
    setCoverPreview(publicUrl); setCoverStatus('Gambar berjaya diupload.');
    return publicUrl;
  }
  async function savePost(){
    if(!client)return;
    const title=$('postTitle').value.trim(); let slug=slugify($('postSlug').value||title);
    if(!title||!slug){alert('Tajuk dan slug wajib diisi.');return;}
    const saveBtn=$('savePostBtn'); const oldText=saveBtn?saveBtn.textContent:''; if(saveBtn){saveBtn.disabled=true; saveBtn.textContent='Menyimpan...';}
    try{
      const keywords=$('postKeywords').value.split(',').map(x=>x.trim()).filter(Boolean);
      const coverUrl=await uploadCoverIfNeeded(slug);
      const payload={title,slug,category:$('postCategory').value.trim()||'SEO',cover_image:coverUrl,meta_title:$('postMetaTitle').value.trim()||title,meta_description:$('postMetaDesc').value.trim(),keywords,content:$('postContent').value.trim(),status:$('postStatus').value,published_at:$('postPublishedAt').value?new Date($('postPublishedAt').value).toISOString():new Date().toISOString(),updated_at:new Date().toISOString()};
      const id=$('postId').value;
      let res;
      if(id) res=await client.from('blog_posts').update(payload).eq('id',id).select().single();
      else res=await client.from('blog_posts').insert(payload).select().single();
      if(res.error){alert('Gagal simpan artikel: '+res.error.message);return;}
      alert('Artikel berjaya disimpan.'); await refreshPosts(); editPost(res.data.id);
    }catch(err){console.error(err); alert(err.message||'Gagal simpan artikel.');}
    finally{if(saveBtn){saveBtn.disabled=false; saveBtn.textContent=oldText||'Simpan Artikel';}}
  }
  async function deletePost(){
    const id=$('postId').value; if(!id||!confirm('Delete artikel ini?'))return;
    const {error}=await client.from('blog_posts').delete().eq('id',id); if(error){alert('Gagal delete: '+error.message);return;} toggleEditor(false); await refreshPosts();
  }
  window.RH_BLOG_ADMIN={refreshPosts,newPost};
  document.addEventListener('DOMContentLoaded',init);
})();
