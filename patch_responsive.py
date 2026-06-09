from pathlib import Path
root=Path('/mnt/data/patch890')
admin=root/'admin.html'
s=admin.read_text()
version='v8.9.1-responsive-admin'
# replace version strings
import re
s=re.sub(r'v8\.9\.0-office-functional', version, s)
s=re.sub(r'v8\.8\.0 \| Restu Harmoni', 'v8.9.1 | Restu Harmoni', s)
s=re.sub(r'RH Office Suite v8\.9\.0-office-functional', f'RH Office Suite {version}', s)
# add mobile menu button and overlay if not present
s=s.replace('<div class="top-actions">', '<button class="mobile-menu-toggle" type="button" aria-label="Buka menu admin" aria-expanded="false">☰ Menu</button><div class="top-actions">', 1)
s=s.replace('<div class="wrap">', '<div class="admin-scrim" aria-hidden="true"></div>\n<div class="wrap">', 1)
# Add labels to office tables for mobile cards? skip harder. CSS scroll acceptable.
css = r'''

/* RH Office Suite v8.9.1 — Responsive Office Fit Patch */
html,body{max-width:100%;overflow-x:hidden}.rh-logo-mark{width:42px;height:42px;object-fit:contain;border-radius:12px;background:#fff;padding:4px}.panel,.editor-card,.module-card,.office-card,.office-hero,.office-status{min-width:0}.wrap,.office-ribbon,.top .inner{max-width:100%}.table-wrap{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.office-table,.blog-table{width:100%}.office-table td,.office-table th{white-space:normal}.office-table td:last-child{white-space:nowrap}.side{max-height:calc(100vh - 112px);overflow:auto}.mobile-menu-toggle{display:none;border:1px solid rgba(200,155,60,.35);background:rgba(255,255,255,.08);color:#fff;border-radius:14px;padding:11px 14px;font-weight:950;min-height:44px}.admin-scrim{display:none}.office-actions,.office-form-actions{display:flex;gap:10px;flex-wrap:wrap}.office-line-row{display:grid;grid-template-columns:minmax(0,1fr) 90px 130px 48px;gap:10px;align-items:end}.doc-preview{max-width:100%;overflow:hidden}.doc-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.doc-brand{display:flex;gap:12px;align-items:center}.doc-brand img{width:54px;height:54px;object-fit:contain}.doc-title{text-align:right}.doc-total{text-align:right;font-size:22px;font-weight:950;color:#0f172a}.office-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.office-mini{font-size:12px;color:#64748b}.danger-lite{background:#fee2e2!important;color:#991b1b!important;border-color:#fecaca!important}
@media(max-width:1200px){.wrap{grid-template-columns:260px minmax(0,1fr);gap:14px}.office-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.office-module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.office-hero-grid,.office-grid{grid-template-columns:1fr}.top .inner,.wrap,.office-ribbon{width:96%}}
@media(max-width:900px){body{background:#f6f8fc}.top{position:sticky;top:0}.top .inner{width:100%;padding:10px 12px;display:grid;grid-template-columns:1fr auto;align-items:center}.brand-admin{min-width:0}.brand-admin span{font-size:14px}.brand-admin small{font-size:11px}.rh-logo-mark{width:38px;height:38px}.mobile-menu-toggle{display:inline-flex;align-items:center;justify-content:center;grid-column:2}.top-actions{grid-column:1/-1;display:grid!important;grid-template-columns:1fr 1fr;gap:8px;width:100%;margin-top:8px}.top-actions .btn,.top-actions button{font-size:12px;min-height:40px;padding:9px 10px}.office-ribbon{width:calc(100% - 24px);margin:10px 12px 0;padding:11px 13px;border-radius:16px;font-size:13px}.office-ribbon span{display:block;margin-top:4px;font-size:11px}.wrap{display:block;width:100%;margin:12px 0 72px;padding:0 12px}.side{position:fixed!important;left:0;top:0;bottom:0;width:min(86vw,340px);max-height:none;z-index:80;border-radius:0 22px 22px 0;transform:translateX(-105%);transition:transform .22s ease;display:block!important;overflow-y:auto;padding:18px;background:linear-gradient(180deg,#07111f,#111827)!important}.side.open{transform:translateX(0)}.side-title{display:block!important;margin:18px 8px 8px}.side button,.side a{width:100%!important;min-width:0!important;white-space:normal!important;margin:4px 0!important;background:rgba(255,255,255,.04)!important;color:#e5edf8!important}.side button.active,.side a.active{background:linear-gradient(135deg,rgba(200,155,60,.25),rgba(255,255,255,.08))!important}.admin-scrim{display:block;position:fixed;inset:0;background:rgba(2,6,23,.48);z-index:70;opacity:0;pointer-events:none;transition:opacity .2s ease}.admin-scrim.show{opacity:1;pointer-events:auto}.panel{padding:14px!important;border-radius:20px!important;min-height:auto;width:100%;overflow:visible}.mobile-admin-tip{display:block;background:#fff7df;color:#765018;border:1px solid #f3d790;border-radius:16px;padding:11px 12px;margin-bottom:12px;font-size:13px}.office-hero{padding:18px;border-radius:20px}.office-hero h1{font-size:26px}.office-kpis,.office-module-grid,.office-form-grid{grid-template-columns:1fr!important;gap:10px}.office-card,.module-card,.editor-card{border-radius:18px;padding:14px}.office-card .value{font-size:26px}.section-head,.section-head.office-section{display:block}.section-head .btn,.section-head button,.section-head a{width:100%;margin-top:8px}.actions{display:grid;grid-template-columns:1fr;gap:8px}.actions .btn,.actions button,.actions a{width:100%}.office-line-row{grid-template-columns:1fr;gap:8px;border:1px solid #e5e7eb;border-radius:16px;padding:10px;background:#fff}.doc-head{display:block}.doc-title{text-align:left;margin-top:12px}.doc-brand img{width:46px;height:46px}.doc-total{text-align:left}.table-wrap{border:1px solid #e5e7eb;border-radius:16px;background:#fff;overflow-x:auto}.office-table{min-width:680px}.blog-table{min-width:680px}.quick-mobile{display:none!important}}
@media(max-width:540px){.top .inner{padding:9px 10px}.top-actions{grid-template-columns:1fr}.top-actions .btn:nth-child(n+3),.top-actions button{display:none}.office-ribbon{width:calc(100% - 20px);margin-left:10px;margin-right:10px}.wrap{padding:0 10px}.panel{padding:12px!important;border-radius:18px!important}.office-hero h1{font-size:24px}.office-card .value{font-size:24px}input,textarea,select{min-height:44px;padding:12px;font-size:16px}.btn,button.primary{min-height:42px;padding:11px 13px}.office-table{min-width:620px}.aira-admin-shell,.review-admin-shell{grid-template-columns:1fr!important}.aira-form-grid,.grid,.grid-3{grid-template-columns:1fr!important}.aira-phone{max-width:100%;height:520px}.mobile-menu-toggle{padding:10px 12px}}
@media print{.top,.side,.office-ribbon,.mobile-menu-toggle,.admin-scrim,.actions,.office-actions{display:none!important}.wrap{display:block;width:100%;margin:0;padding:0}.panel{box-shadow:none;border:0;padding:0!important}.doc-preview{box-shadow:none;border:0}}
'''
s=s.replace('</style>', css+'\n</style>',1)
# add JS before </body>
js = r'''
<script>
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    const side=document.querySelector('.side');
    const toggle=document.querySelector('.mobile-menu-toggle');
    const scrim=document.querySelector('.admin-scrim');
    if(!side||!toggle||!scrim) return;
    function close(){ side.classList.remove('open'); scrim.classList.remove('show'); toggle.setAttribute('aria-expanded','false'); }
    function open(){ side.classList.add('open'); scrim.classList.add('show'); toggle.setAttribute('aria-expanded','true'); }
    toggle.addEventListener('click',()=> side.classList.contains('open') ? close() : open());
    scrim.addEventListener('click',close);
    side.addEventListener('click',e=>{ if(e.target.closest('button,a')) close(); });
    window.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
  });
})();
</script>
'''
s=s.replace('</body>', js+'\n</body>',1)
admin.write_text(s)
# update version.js and sw.js simply
for fname in ['version.js','sw.js']:
    p=root/fname
    if p.exists():
        txt=p.read_text()
        txt=re.sub(r'v8\.9\.0-office-functional|v8\.8\.0-exclusive-admin|v8\.7\.2-admin-hard-redirect|v8\.7\.1-admin-unified', version, txt)
        # also replace cache names containing old v patterns loosely
        txt=txt.replace('8.9.0-office-functional','8.9.1-responsive-admin')
        p.write_text(txt)
# Update script src query params already done via admin replacement.
