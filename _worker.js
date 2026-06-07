const SITE_ORIGIN = 'https://services.restuharmoni.com';
const SUPABASE_URL = 'https://xyiqrjiozrxcqhifyfzw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SKmoaAwiMvWEzW8OIF4OMA_WusAmQiE';

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

async function supabaseSelect(query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json'
    }
  });
  if (!response.ok) throw new Error(`Supabase REST error ${response.status}`);
  return response.json();
}

async function getPost(slug) {
  const select = 'id,title,slug,category,cover_image,meta_title,meta_description,keywords,content,status,published_at,updated_at';
  const query = `blog_posts?select=${encodeURIComponent(select)}&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`;
  const data = await supabaseSelect(query);
  return Array.isArray(data) ? data[0] : null;
}

async function getPublishedPosts() {
  const select = 'title,slug,meta_description,updated_at,published_at';
  const query = `blog_posts?select=${encodeURIComponent(select)}&status=eq.published&order=published_at.desc`;
  const data = await supabaseSelect(query);
  return Array.isArray(data) ? data : [];
}

function renderArticle(post) {
  const title = post.meta_title || post.title || 'Artikel Restu Harmoni';
  const description = post.meta_description || stripHtml(post.content).slice(0, 160) || 'Panduan website, SEO dan pemasaran digital untuk bisnes kecil Malaysia.';
  const slug = post.slug || '';
  const url = `${SITE_ORIGIN}/blog/${encodeURIComponent(slug)}.html`;
  const image = String(post.cover_image || `${SITE_ORIGIN}/assets/rh-logo.png`).trim();
  const category = post.category || 'SEO';
  const published = post.published_at || new Date().toISOString();
  const updated = post.updated_at || published;
  const body = String(post.content || '')
    .split(/\n{2,}/)
    .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: published,
    dateModified: updated,
    author: { '@type': 'Organization', name: 'Restu Harmoni Digital Solutions' },
    publisher: { '@type': 'Organization', name: 'Restu Harmoni Digital Solutions', logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/assets/rh-logo.png` } },
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
<style>:root{--bg:#f8fafc;--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--blue:#2563eb;--dark:#0f172a;--gold:#d97706}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,Arial,sans-serif;background:linear-gradient(180deg,#eff6ff,#fff 34%,#f8fafc);color:var(--text)}.container{width:min(920px,92%);margin:auto}.nav{background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}.nav .inner{height:74px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none;font-weight:950}.brand img{width:42px;height:42px;object-fit:contain}.links{display:flex;gap:14px;align-items:center}.links a{font-weight:850;text-decoration:none;color:var(--text)}.cta{background:var(--dark);color:#fff!important;border-radius:999px;padding:11px 16px}.article{padding:56px 0 74px}.badge{display:inline-flex;border-radius:999px;background:#dbeafe;color:#1d4ed8;padding:7px 12px;font-weight:950;font-size:13px}h1{font-size:clamp(34px,6vw,62px);line-height:.97;letter-spacing:-.06em;margin:18px 0 16px}.desc{font-size:18px;color:var(--muted);line-height:1.65}.cover{margin:28px 0;border-radius:30px;overflow:hidden;border:1px solid var(--line);background:#dbeafe;box-shadow:0 24px 70px rgba(15,23,42,.12)}.cover img{width:100%;display:block;aspect-ratio:1200/630;object-fit:cover}.content{background:#fff;border:1px solid var(--line);border-radius:30px;padding:clamp(22px,4vw,42px);box-shadow:0 18px 60px rgba(15,23,42,.07)}.content p{font-size:18px;line-height:1.85;margin:0 0 18px}.meta{color:var(--muted);font-size:14px;margin-bottom:18px}.cta-box{margin-top:28px;background:#0f172a;color:#fff;border-radius:28px;padding:26px;display:flex;align-items:center;justify-content:space-between;gap:18px}.cta-box a{background:#f59e0b;color:#111827;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:950;white-space:nowrap}footer{border-top:1px solid var(--line);background:#fff;color:var(--muted);padding:26px 0}@media(max-width:720px){.links a:not(.cta){display:none}.nav .inner{height:66px}.article{padding:38px 0 56px}.cta-box{display:block}.cta-box a{display:inline-flex;margin-top:14px}.content p{font-size:17px}}</style>
</head>
<body>
<nav class="nav"><div class="container inner"><a class="brand" href="../index.html"><img src="../assets/rh-logo.png" alt="Restu Harmoni"><span>RESTU HARMONI<br><small>Digital Solutions</small></span></a><div class="links"><a href="../index.html#services">Servis</a><a href="../index.html#pricing">Harga</a><a href="../blog.html">Blog</a><a class="cta" href="../index.html#aira-popup">Hubungi</a></div></div></nav>
<main class="article"><div class="container"><span class="badge">${esc(category)}</span><h1>${esc(post.title || title)}</h1><p class="desc">${esc(description)}</p><div class="cover"><img src="${esc(image)}" alt="${esc(post.title || title)}"></div><article class="content"><div class="meta">Diterbitkan oleh Restu Harmoni Digital Solutions</div>${body || `<p>${esc(description)}</p>`}<div class="cta-box"><div><h2>Nak website untuk bisnes anda?</h2><p>Restu Harmoni bantu bina website yang kemas, mobile friendly dan mudah pelanggan hubungi melalui WhatsApp.</p></div><a href="../index.html#aira-popup">Mula Dengan Aira</a></div></article></div></main>
<footer><div class="container">© ${new Date().getFullYear()} Restu Harmoni Digital Solutions • <a href="../blog.html">Blog</a></div></footer>
</body>
</html>`;
}

function renderSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const staticUrls = ['/', '/blog.html', '/portfolio.html', '/services/website-aircond-malaysia.html', '/services/website-homestay-malaysia.html', '/services/website-kereta-sewa-malaysia.html', '/services/website-kontraktor-malaysia.html', '/services/website-syarikat-malaysia.html'];
  const rows = staticUrls.map(u => `  <url><loc>${SITE_ORIGIN}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : '0.9'}</priority></url>`)
    .concat(posts.map(p => `  <url><loc>${SITE_ORIGIN}/blog/${esc(p.slug)}.html</loc><lastmod>${String(p.updated_at || p.published_at || today).slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/article.html' && url.searchParams.get('slug')) {
      return Response.redirect(`${url.origin}/blog/${encodeURIComponent(url.searchParams.get('slug'))}.html`, 301);
    }

    if (url.pathname === '/sitemap.xml') {
      try {
        const posts = await getPublishedPosts();
        return new Response(renderSitemap(posts), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
      } catch (error) {
        return env.ASSETS.fetch(request);
      }
    }

    const slug = normalizeSlug(url.pathname);
    if (slug) {
      try {
        const post = await getPost(slug);
        if (post) {
          return new Response(renderArticle(post), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=120' } });
        }
      } catch (error) {
        // Fall through to static assets so deploy remains safe if Supabase is temporarily unavailable.
      }
    }

    return env.ASSETS.fetch(request);
  }
};
