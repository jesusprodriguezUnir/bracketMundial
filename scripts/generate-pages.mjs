// Genera las páginas estáticas SEO (ES + EN), el sitemap con hreflang
// recíprocos y robots.txt. Ejecutar bajo `tsx` (importa datos .ts).
//
//   tsx scripts/generate-pages.mjs

import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTournamentData } from './lib/seo-data.mjs';
import { buildAllPages } from './lib/seo-content.mjs';
import { renderPage } from './lib/seo-template.mjs';
import { SITE_URL } from './lib/seo-i18n.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const TODAY = new Date().toISOString().slice(0, 10);

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeAbsoluteUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const u = new URL(raw);
  u.hash = '';
  u.search = '';
  return u.toString();
}

function ensureCanonicalSitemapEntries(entries) {
  const byLoc = new Map();
  for (const entry of entries) {
    const loc = normalizeAbsoluteUrl(entry.loc);
    const altEs = normalizeAbsoluteUrl(entry.altEs);
    const altEn = normalizeAbsoluteUrl(entry.altEn);

    if (!loc.startsWith(`${SITE_URL}/`)) {
      throw new Error(`Sitemap URL fuera de dominio canónico: ${loc}`);
    }

    if (!altEs.startsWith(`${SITE_URL}/`) || !altEn.startsWith(`${SITE_URL}/`)) {
      throw new Error(`Hreflang fuera de dominio canónico en: ${loc}`);
    }

    byLoc.set(loc, {
      ...entry,
      loc,
      altEs,
      altEn,
    });
  }

  return Array.from(byLoc.values()).sort((a, b) => a.loc.localeCompare(b.loc));
}

// Carpetas generadas (se limpian en cada build para evitar páginas huérfanas).
const MANAGED_DIRS = ['grupos', 'calendario', 'estadios', 'plantillas', 'seleccion', 'en', 'porra-mundial-2026', 'plantilla-imprimir', 'simulador-eliminatorias', 'mundial-para-clase'];

function cleanManaged() {
  for (const d of MANAGED_DIRS) {
    const p = join(publicDir, d);
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  }
}

function writePage(page) {
  // '/grupos/grupo-a/' -> public/grupos/grupo-a/index.html
  const rel = page.path.replace(/^\/+|\/+$/g, '');
  const dir = rel ? join(publicDir, rel) : publicDir;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), renderPage(page), 'utf8');
}

function buildSitemap(pages) {
  // Home ES (index.html) emparejada con /en/
  const entries = [
    {
      loc: `${SITE_URL}/`,
      altEs: `${SITE_URL}/`,
      altEn: `${SITE_URL}/en/`,
      priority: '1.0',
      changefreq: 'daily',
    },
  ];

  for (const p of pages) {
    let priority = '0.7';
    let changefreq = 'weekly';
    if (p.path === '/en/') {
      priority = '1.0';
      changefreq = 'daily';
    } else if (/\/(grupos|groups|plantillas|squads)\/$/.test(p.path)) {
      priority = '0.9';
      changefreq = 'weekly';
    } else if (/\/(calendario|schedule)\/$/.test(p.path)) {
      priority = '0.9';
      changefreq = 'daily';
    } else if (/\/(estadios|stadiums)\/$/.test(p.path)) {
      priority = '0.8';
      changefreq = 'monthly';
    } else if (/grupo-|group-|seleccion|team/.test(p.path)) {
      priority = '0.8';
      changefreq = 'weekly';
    }
    entries.push({
      loc: `${SITE_URL}${p.path}`,
      altEs: p.altEs,
      altEn: p.altEn,
      priority,
      changefreq,
    });
  }

  const canonicalEntries = ensureCanonicalSitemapEntries(entries);

  const urls = canonicalEntries
    .map(
      (e) => `  <url>
    <loc>${xmlEscape(e.loc)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${xmlEscape(e.altEs)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(e.altEn)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(e.altEs)}" />
  </url>`,
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  if (!sitemap.includes('<urlset') || canonicalEntries.length === 0) {
    throw new Error('Sitemap inválido: sin urlset o sin URLs canónicas.');
  }

  return sitemap;
}

async function main() {
  const data = await loadTournamentData();
  const pages = buildAllPages(data);

  cleanManaged();
  for (const page of pages) writePage(page);

  writeFileSync(join(publicDir, 'sitemap.xml'), buildSitemap(pages), 'utf8');
  writeFileSync(
    join(publicDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    'utf8',
  );

  console.log(`Generadas ${pages.length} páginas estáticas + sitemap (${pages.length + 1} URLs) + robots.txt`);
}

main().catch((e) => {
  console.error('generate-pages FAIL:', e);
  process.exit(1);
});
