/* RH Services Cloudflare Pages Worker
   Purpose:
   - Serve dynamic blog detail URL: /blog/{slug}.html
   - Inject OG meta tags before Facebook / WhatsApp crawler reads the page
   - Read Supabase config from env first, then from supabase-config.js asset
*/

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeSlug(pathname) {
  const match = pathname.match(/^\/blog\/([^/?#]+)$/);
  if (!match) return '';
  const raw = decodeURIComponent(match[1] || '').trim();
  if (!raw || raw === 'index.html') return '';
  return raw.replace(/\.html$/i, '').replace(/[^a-z0-9-]/gi, '').toLowerCase();
}

async function getSupabaseConfig(request, env) {
  if (env && env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    return { url: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY };
  }

  // Fallback: read browser config file from deployed assets.
  // This lets beta/live use their own supabase-config.js without editing this worker again.
  try {
    const assetUrl = new URL('/supabase-config.js', request.url);
    const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
    if (!res.ok) return null;
    const js = await res.text();
    const urlMatch = js.match(/url\s*:\s*["']([^"']+)["']/i) || js.match(/SUPABASE_URL\s*=\s*["']([^"']+)["']/i);
    const keyMatch = js.match(/anonKey\s*:\s*["']([^"']+)["']/i) || js.match(/SUPABASE_ANON_KEY\s*=\s*["']([^"']+)["']/i);
    if (urlMatch && keyMatch) return { url: urlMatch[1], anonKey: keyMatch[1] };
  } catch (error) {
    // Keep site safe if config asset cannot be read.
  }

  return null;
}

async function supabaseSelect(config, query) {
  if (!config || !config.url || !config.anonKey) throw new Error('Supabase config missing');
  const response = await fetch(`${config.url}/rest/v1/${query}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      Accept: 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Supabase REST error ${response.status}`);
  return response.json();
}

async function getPost(config, slug) {
  const select = 'id,title,slug,category,cover_image,meta_title,meta_description,content,status,published_at,updated_at';
  const query = `blog_posts?select=${encodeURIComponent(select)}&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`;
  const data = await supabaseSelect(config, query);
  return Array.isArray(data) ? data[0] : null;
}

async function getPublishedPosts(config) {
  const select = 'title,slug,meta_description,updated_at,published_at';
  const query = `blog_posts?select=${encodeURIComponent(select)}&status=eq.published&order=published_at.desc`;
  const data = await supabaseSelect(config, query);
  return Array.isArray(data) ? data : [];
}

function formatArticleContent(content) {
  return String(content || '')
    .split(/\n{2,}/)
    .map(p => {
      const clean = p.trim();
      if (!clean) return '';
      if (clean.startsWith('## ')) return `<h2>${esc(clean.slice(3))}</h2>`;
      if (/^<\/?[a-z][\s\S]*>/i.test(clean)) return clean;
      return `<p>${esc(clean).replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

function estimateReadMinutes(content) {
  const words = String(content || '').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 180));
}

function tocHtml(content) {
  let i = 0;
  const rows = String(content || '')
    .split(/\n{2,}/)
    .map(x => x.trim())
    .filter(x => x.startsWith('## '))
    .slice(0, 8)
    .map(x => {
      i += 1;
      const title = x.slice(3);
      const id = `section-${i}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)}`;
      return `<a href="#${esc(id)}">${esc(title)}</a>`;
    });
  return rows.length ? rows.join('') : '<p class="small">Teruskan membaca artikel ini dan klik Aira jika mahu cadangan pakej website untuk bisnes anda.</p>';
}

function renderArticle(post, siteOrigin) {
  const title = post.meta_title || post.title || 'Artikel Restu Harmoni';
  const description = post.meta_description || stripHtml(post.content).slice(0, 160) || 'Panduan website, SEO dan pemasaran digital untuk bisnes kecil Malaysia.';
  const slug = post.slug || '';
  const url = `${siteOrigin}/blog/${encodeURIComponent(slug)}.html`;
  const image = String(post.cover_image || `${siteOrigin}/assets/rh-logo.png`).trim();
  const category = post.category || 'SEO';
  const published = post.published_at || new Date().toISOString();
  const updated = post.updated_at || published;
  const body = formatArticleContent(post.content) || `<p>${esc(description)}</p>`;
  const readMins = estimateReadMinutes(post.content || description);
  const publishedDate = new Date(published).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: published,
    dateModified: updated,
    author: { '@type': 'Organization', name: 'Restu Harmoni Digital Solutions' },
    publisher: { '@type': 'Organization', name: 'Restu Harmoni Digital Solutions', logo: { '@type': 'ImageObject', url: `${siteOrigin}/assets/rh-logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };

  return `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Restu Harmoni Digital Solutions">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:secure_url" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<style>:root{--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--blue:#2563eb;--gold:#d99a1e;--dark:#0f172a}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,system-ui,Arial,sans-serif;background:linear-gradient(180deg,#eff6ff,#fff 35%,#f8fafc);color:var(--text);overflow-x:hidden}.bgfx{position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(circle at 12% 20%,rgba(37,99,235,.14),transparent 28%),radial-gradient(circle at 90% 16%,rgba(217,154,30,.14),transparent 22%),linear-gradient(rgba(37,99,235,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.035) 1px,transparent 1px);background-size:auto,auto,58px 58px,58px 58px}.bgfx:before,.bgfx:after{content:"";position:absolute;width:390px;height:390px;border-radius:999px;filter:blur(62px);opacity:.35;animation:floatGlow 17s ease-in-out infinite alternate}.bgfx:before{left:-110px;top:260px;background:rgba(37,99,235,.26)}.bgfx:after{right:-140px;top:440px;background:rgba(217,154,30,.22);animation-duration:21s}@keyframes floatGlow{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(46px,-34px,0) scale(1.08)}}.container{width:min(1120px,92%);margin:auto}.nav{background:rgba(255,255,255,.88);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:30}.nav .inner{height:72px;display:flex;justify-content:space-between;align-items:center;gap:16px}.brand{display:flex;gap:10px;align-items:center;text-decoration:none;color:var(--text);font-weight:950;line-height:1.1}.brand img{width:42px}.btn{background:#0f172a;color:#fff;text-decoration:none;border-radius:999px;padding:11px 16px;font-weight:950;display:inline-flex;align-items:center;justify-content:center}.article-shell{display:grid;grid-template-columns:minmax(0,760px) 300px;gap:30px;align-items:start;padding-bottom:70px}.hero{padding:54px 0 24px}.badge{display:inline-flex;background:#dbeafe;color:#1d4ed8;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:950}.hero h1{font-size:clamp(36px,6vw,68px);line-height:.96;letter-spacing:-.07em;margin:18px 0}.desc{font-size:19px;line-height:1.7;color:#334155}.meta{color:var(--muted);font-size:14px;font-weight:750;display:flex;gap:12px;flex-wrap:wrap}.sharebar{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 0}.sharebar a{border:0;border-radius:999px;padding:11px 15px;font-weight:950;text-decoration:none;background:#2563eb;color:#fff;font-size:14px}.sharebar .wa{background:#16a34a}.cover{width:100%;aspect-ratio:1200/630;border-radius:32px;background:#dbeafe;margin:18px 0 28px;box-shadow:0 24px 76px rgba(15,23,42,.12);overflow:hidden;border:1px solid var(--line);display:grid;place-items:center}.cover img{width:100%;height:100%;object-fit:cover;display:block}.content{background:rgba(255,255,255,.94);border:1px solid var(--line);border-radius:32px;padding:clamp(24px,4vw,46px);box-shadow:0 20px 66px rgba(15,23,42,.07);font-size:18px;line-height:1.88}.content p{margin:0 0 19px}.content h2{font-size:32px;letter-spacing:-.045em;margin:36px 0 14px;line-height:1.08}.toc{position:sticky;top:96px;display:grid;gap:16px}.toc-card,.help-card{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:26px;padding:20px;box-shadow:0 16px 54px rgba(15,23,42,.06)}.toc h3,.help-card h3{margin:0 0 14px;font-size:20px;letter-spacing:-.035em}.toc a{display:block;text-decoration:none;color:#334155;font-weight:850;border-top:1px solid #eef2f7;padding:10px 0;line-height:1.25}.small{color:var(--muted);font-size:13px;line-height:1.65}.cta-box{margin:30px 0;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;border-radius:30px;padding:28px;display:flex;justify-content:space-between;gap:18px;align-items:center;box-shadow:0 18px 60px rgba(15,23,42,.16)}.cta-box p{color:#dbeafe}.cta-box a{background:#fbbf24;color:#111827;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:950;white-space:nowrap}footer{border-top:1px solid var(--line);background:#fff;color:var(--muted);padding:26px 0}@media(max-width:980px){.article-shell{grid-template-columns:1fr}.toc{position:static}.cta-box{display:block}.cta-box a{display:inline-flex;margin-top:14px}.nav .inner{height:auto;padding:12px 0}}@media(max-width:650px){.content{font-size:16.5px}.cover{border-radius:22px}.hero{padding:38px 0 20px}.brand span{font-size:14px}.btn{padding:10px 13px}.bgfx:before,.bgfx:after{width:300px;height:300px}}</style>
</head>
<body><div class="bgfx"></div>
<nav class="nav"><div class="container inner"><a class="brand" href="/"><img src="/assets/rh-logo.png" alt="Restu Harmoni"><span>RESTU HARMONI<br><small>Digital Solutions</small></span></a><a class="btn" href="/blog.html">← Blog</a></div></nav>
<main class="container"><section class="hero"><span class="badge">${esc(category)}</span><h1>${esc(post.title || title)}</h1><p class="desc">${esc(description)}</p><div class="meta"><span>${esc(publishedDate)}</span><span>•</span><span>${readMins} min baca</span><span>•</span><span>Restu Harmoni Digital Solutions</span></div><div class="sharebar"><a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">Share Facebook</a><a class="wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent((post.title || title) + ' ' + url)}">WhatsApp</a></div></section><div class="cover"><img src="${esc(image)}" alt="${esc(post.title || title)}"></div><div class="article-shell"><div><article class="content">${body}</article><section class="cta-box"><div><h2>Nak website untuk bisnes anda?</h2><p>Aira boleh cadangkan pakej website berdasarkan jenis bisnes, bajet dan objektif anda.</p></div><a href="/#aira-popup">Tanya Aira</a></section></div><aside class="toc"><div class="toc-card"><h3>Isi Kandungan</h3>${tocHtml(post.content)}</div><div class="help-card"><h3>Perlu bantuan?</h3><p class="small">Klik Aira untuk semak pakej website yang sesuai dengan bisnes anda.</p><a class="btn" href="/#aira-popup">Buka Aira</a></div></aside></div></main>
<footer><div class="container">© ${new Date().getFullYear()} Restu Harmoni Digital Solutions • <a href="/blog.html">Blog</a></div></footer>
</body>
</html>`;
}

function renderSitemap(posts, siteOrigin) {
  const today = new Date().toISOString().slice(0, 10);
  const staticUrls = ['/', '/blog.html', '/services/website-aircond-malaysia.html', '/services/website-homestay-malaysia.html', '/services/website-kereta-sewa-malaysia.html', '/services/website-kontraktor-malaysia.html', '/services/website-syarikat-malaysia.html'];
  const rows = staticUrls.map(u => `  <url><loc>${siteOrigin}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : '0.9'}</priority></url>`)
    .concat(posts.map(p => `  <url><loc>${siteOrigin}/blog/${esc(p.slug)}.html</loc><lastmod>${String(p.updated_at || p.published_at || today).slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const siteOrigin = url.origin;

    if (url.pathname === '/article.html' && url.searchParams.get('slug')) {
      return Response.redirect(`${siteOrigin}/blog/${encodeURIComponent(url.searchParams.get('slug'))}.html`, 301);
    }

    const config = await getSupabaseConfig(request, env);

    if (url.pathname === '/sitemap.xml' && config) {
      try {
        const posts = await getPublishedPosts(config);
        return new Response(renderSitemap(posts, siteOrigin), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
      } catch (error) {
        return env.ASSETS.fetch(request);
      }
    }

    const slug = normalizeSlug(url.pathname);
    if (slug && config) {
      try {
        const post = await getPost(config, slug);
        if (post) {
          return new Response(renderArticle(post, siteOrigin), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=120' } });
        }
      } catch (error) {
        // Fall through to static assets so deploy remains safe if Supabase is temporarily unavailable.
      }
    }

    return env.ASSETS.fetch(request);
  }
};
