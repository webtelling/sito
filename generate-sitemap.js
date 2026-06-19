/*
 * Genera sitemap.xml automaticamente a ogni deploy su Netlify.
 *
 * Per ogni pagina HTML (nella root e in /blog) include nella sitemap solo
 * quelle che hanno un <link rel="canonical">, saltando:
 *   - le pagine con <meta name="robots" content="noindex"> (es. privacy)
 *   - le pagine senza canonical (es. le proposte private)
 *
 * Non serve aggiornare nulla a mano: basta aggiungere un nuovo articolo
 * con il suo canonical e finira' in sitemap al deploy successivo.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIRS = ['.', 'blog']; // cartelle in cui cercare le pagine HTML

function htmlFiles() {
  const files = [];
  for (const dir of DIRS) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) continue;
    for (const name of fs.readdirSync(full)) {
      if (name.endsWith('.html')) files.push(path.join(full, name));
    }
  }
  return files;
}

function priorityFor(loc) {
  const url = new URL(loc);
  const p = url.pathname;
  if (p === '/') return '1.0';
  if (p === '/blog/') return '0.7';
  if (p.startsWith('/blog/')) return '0.6'; // singoli articoli
  return '0.8';
}

const urls = [];
for (const file of htmlFiles()) {
  const html = fs.readFileSync(file, 'utf8');

  // salta le pagine noindex
  if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) continue;

  // estrai il canonical (qualsiasi ordine di attributi)
  let m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (!m) m = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (!m) continue; // nessun canonical: pagina privata, salta

  const loc = m[1];
  const lastmod = fs.statSync(file).mtime.toISOString().slice(0, 10);
  urls.push({ loc, lastmod, priority: priorityFor(loc) });
}

// home in cima, poi ordine alfabetico per URL
urls.sort((a, b) => {
  if (a.priority === '1.0') return -1;
  if (b.priority === '1.0') return 1;
  return a.loc.localeCompare(b.loc);
});

const body = urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml generata con ${urls.length} pagine.`);
