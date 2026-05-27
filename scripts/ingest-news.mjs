/**
 * ingest-news.mjs
 *
 * Ingesta multi-fuente de noticias por equipo del Mundial 2026 y upsert a Supabase
 * (tabla `team_news`). Cascada de fuentes con dedupe por URL canonicalizada:
 *
 *   1. GNews API           (GNEWS_DATA_KEY)        — descripciones, imágenes
 *   2. NewsAPI.org         (NEWSAPI_KEY)           — fallback, free dev tier
 *   3. Google News RSS     (sin key)               — fallback amplio
 *   4. RSS oficiales       (sin key)               — FIFA / AS / Marca / BBC / Goal
 *
 * Si no hay credenciales de Supabase, escribe `news-feed.json` local (modo dev offline).
 *
 * Uso:
 *   node scripts/ingest-news.mjs                  # ingesta los 48 equipos
 *   node scripts/ingest-news.mjs ARG MEX          # solo equipos indicados
 *   node scripts/ingest-news.mjs --dry-run        # no upsertea, solo log
 *   node scripts/ingest-news.mjs --force          # ignora el skip inteligente
 *   node scripts/ingest-news.mjs --json-only      # nunca toca Supabase, escribe JSON
 */

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NEWS_PER_TEAM = 5;
const FETCH_TIMEOUT_MS = 15_000;
const SKIP_IF_FRESHER_THAN_MS = 60 * 60 * 1000; // 1 h — el cron corre cada 3 h
const TTL_DAYS = 30;

// ─── .env parser ──────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const ENV = loadEnv();
const GNEWS_KEY = process.env.GNEWS_DATA_KEY ?? ENV.GNEWS_DATA_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY ?? ENV.NEWSAPI_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ENV.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ENV.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ENV.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? ENV.SUPABASE_SERVICE_KEY;

// ─── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const jsonOnly = args.includes('--json-only');
const teamFilter = args.filter(a => !a.startsWith('-')).map(t => t.toUpperCase());

const useSupabase = !jsonOnly && SUPABASE_URL && SUPABASE_SERVICE_KEY;

// ─── 48 equipos ──────────────────────────────────────────────────────────────
const TEAMS = [
  { id: 'MEX', es: 'Selección México', en: 'Mexico national football team', shortEs: 'México', shortEn: 'Mexico' },
  { id: 'RSA', es: 'Selección Sudáfrica', en: 'South Africa national football team', shortEs: 'Sudáfrica', shortEn: 'South Africa' },
  { id: 'KOR', es: 'Selección Corea del Sur', en: 'South Korea national football team', shortEs: 'Corea del Sur', shortEn: 'South Korea' },
  { id: 'CZE', es: 'Selección República Checa', en: 'Czech Republic national football team', shortEs: 'República Checa', shortEn: 'Czech Republic' },
  { id: 'CAN', es: 'Selección Canadá', en: 'Canada national football team', shortEs: 'Canadá', shortEn: 'Canada' },
  { id: 'SUI', es: 'Selección Suiza', en: 'Switzerland national football team', shortEs: 'Suiza', shortEn: 'Switzerland' },
  { id: 'QAT', es: 'Selección Catar', en: 'Qatar national football team', shortEs: 'Catar', shortEn: 'Qatar' },
  { id: 'BIH', es: 'Selección Bosnia Herzegovina', en: 'Bosnia and Herzegovina national football team', shortEs: 'Bosnia', shortEn: 'Bosnia' },
  { id: 'BRA', es: 'Selección Brasil', en: 'Brazil national football team', shortEs: 'Brasil', shortEn: 'Brazil' },
  { id: 'MAR', es: 'Selección Marruecos', en: 'Morocco national football team', shortEs: 'Marruecos', shortEn: 'Morocco' },
  { id: 'SCO', es: 'Selección Escocia', en: 'Scotland national football team', shortEs: 'Escocia', shortEn: 'Scotland' },
  { id: 'HAI', es: 'Selección Haití', en: 'Haiti national football team', shortEs: 'Haití', shortEn: 'Haiti' },
  { id: 'USA', es: 'Selección Estados Unidos', en: 'United States national soccer team', shortEs: 'Estados Unidos', shortEn: 'USMNT' },
  { id: 'PAR', es: 'Selección Paraguay', en: 'Paraguay national football team', shortEs: 'Paraguay', shortEn: 'Paraguay' },
  { id: 'AUS', es: 'Selección Australia', en: 'Australia national football team Socceroos', shortEs: 'Australia', shortEn: 'Socceroos' },
  { id: 'TUR', es: 'Selección Turquía', en: 'Turkey national football team', shortEs: 'Turquía', shortEn: 'Turkey' },
  { id: 'GER', es: 'Selección Alemania', en: 'Germany national football team', shortEs: 'Alemania', shortEn: 'Germany' },
  { id: 'CUW', es: 'Selección Curazao', en: 'Curaçao national football team', shortEs: 'Curazao', shortEn: 'Curaçao' },
  { id: 'CIV', es: 'Selección Costa de Marfil', en: 'Ivory Coast national football team', shortEs: 'Costa de Marfil', shortEn: 'Ivory Coast' },
  { id: 'ECU', es: 'Selección Ecuador', en: 'Ecuador national football team', shortEs: 'Ecuador', shortEn: 'Ecuador' },
  { id: 'NED', es: 'Selección Países Bajos', en: 'Netherlands national football team', shortEs: 'Países Bajos', shortEn: 'Netherlands' },
  { id: 'JPN', es: 'Selección Japón', en: 'Japan national football team', shortEs: 'Japón', shortEn: 'Japan' },
  { id: 'TUN', es: 'Selección Túnez', en: 'Tunisia national football team', shortEs: 'Túnez', shortEn: 'Tunisia' },
  { id: 'SWE', es: 'Selección Suecia', en: 'Sweden national football team', shortEs: 'Suecia', shortEn: 'Sweden' },
  { id: 'BEL', es: 'Selección Bélgica', en: 'Belgium national football team', shortEs: 'Bélgica', shortEn: 'Belgium' },
  { id: 'EGY', es: 'Selección Egipto', en: 'Egypt national football team', shortEs: 'Egipto', shortEn: 'Egypt' },
  { id: 'IRN', es: 'Selección Irán', en: 'Iran national football team', shortEs: 'Irán', shortEn: 'Iran' },
  { id: 'NZL', es: 'Selección Nueva Zelanda', en: 'New Zealand national football team', shortEs: 'Nueva Zelanda', shortEn: 'New Zealand' },
  { id: 'ESP', es: 'Selección España', en: 'Spain national football team', shortEs: 'España', shortEn: 'Spain' },
  { id: 'URU', es: 'Selección Uruguay', en: 'Uruguay national football team', shortEs: 'Uruguay', shortEn: 'Uruguay' },
  { id: 'KSA', es: 'Selección Arabia Saudita', en: 'Saudi Arabia national football team', shortEs: 'Arabia Saudita', shortEn: 'Saudi Arabia' },
  { id: 'CPV', es: 'Selección Cabo Verde', en: 'Cape Verde national football team', shortEs: 'Cabo Verde', shortEn: 'Cape Verde' },
  { id: 'FRA', es: 'Selección Francia', en: 'France national football team', shortEs: 'Francia', shortEn: 'France' },
  { id: 'SEN', es: 'Selección Senegal', en: 'Senegal national football team', shortEs: 'Senegal', shortEn: 'Senegal' },
  { id: 'NOR', es: 'Selección Noruega', en: 'Norway national football team', shortEs: 'Noruega', shortEn: 'Norway' },
  { id: 'IRQ', es: 'Selección Irak', en: 'Iraq national football team', shortEs: 'Irak', shortEn: 'Iraq' },
  { id: 'ARG', es: 'Selección Argentina', en: 'Argentina national football team', shortEs: 'Argentina', shortEn: 'Argentina' },
  { id: 'AUT', es: 'Selección Austria', en: 'Austria national football team', shortEs: 'Austria', shortEn: 'Austria' },
  { id: 'ALG', es: 'Selección Argelia', en: 'Algeria national football team', shortEs: 'Argelia', shortEn: 'Algeria' },
  { id: 'JOR', es: 'Selección Jordania', en: 'Jordan national football team', shortEs: 'Jordania', shortEn: 'Jordan' },
  { id: 'POR', es: 'Selección Portugal', en: 'Portugal national football team', shortEs: 'Portugal', shortEn: 'Portugal' },
  { id: 'COL', es: 'Selección Colombia', en: 'Colombia national football team', shortEs: 'Colombia', shortEn: 'Colombia' },
  { id: 'UZB', es: 'Selección Uzbekistán', en: 'Uzbekistan national football team', shortEs: 'Uzbekistán', shortEn: 'Uzbekistan' },
  { id: 'COD', es: 'Selección RD Congo', en: 'DR Congo national football team', shortEs: 'RD Congo', shortEn: 'DR Congo' },
  { id: 'ENG', es: 'Selección Inglaterra', en: 'England national football team', shortEs: 'Inglaterra', shortEn: 'England' },
  { id: 'CRO', es: 'Selección Croacia', en: 'Croatia national football team', shortEs: 'Croacia', shortEn: 'Croatia' },
  { id: 'GHA', es: 'Selección Ghana', en: 'Ghana national football team', shortEs: 'Ghana', shortEn: 'Ghana' },
  { id: 'PAN', es: 'Selección Panamá', en: 'Panama national football team', shortEs: 'Panamá', shortEn: 'Panama' },
];

// ─── RSS oficiales (top global) ──────────────────────────────────────────────
// Se consultan UNA vez por ejecución y se filtran por keyword para cada equipo,
// evitando hacer N peticiones por feed (cae bien en rate limits).
const OFFICIAL_RSS = [
  { url: 'https://www.fifa.com/fifaplus/api/rss/news', source: 'FIFA', locale: 'en' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Sport', locale: 'en' },
  { url: 'https://e00-marca.uecdn.es/rss/futbol/seleccion.xml', source: 'Marca', locale: 'es' },
];

const WHITELIST = [
  'fifa.com', 'uefa.com', 'conmebol.com',
  'espn.com', 'espn.co.uk', 'espndeportes.espn.com',
  'marca.com', 'sport.es', 'mundodeportivo.com',
  'bbc.com', 'bbc.co.uk',
  'reuters.com', 'apnews.com',
  'theguardian.com', 'skysports.com',
  'goal.com', 'lequipe.fr',
  'olympics.com', 'cbssports.com', 'theathletic.com',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decodeEntities(m[1].trim()) : '';
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function stripCDATA(str) {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function parseDateISO(raw) {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function splitTitleSource(raw) {
  const idx = raw.lastIndexOf(' - ');
  if (idx === -1) return { title: raw, source: '' };
  return { title: raw.slice(0, idx).trim(), source: raw.slice(idx + 3).trim() };
}

function isWhitelisted(source) {
  const s = (source || '').toLowerCase();
  return WHITELIST.some(w => s.includes(w));
}

/** Canonicaliza URL para dedupe: quita query params de tracking. */
function canonicalUrl(url) {
  try {
    const u = new URL(url);
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'oc', 'CMP'];
    for (const k of drop) u.searchParams.delete(k);
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}

/** Detector de idioma robusto: cuenta tokens + caracteres específicos. */
function detectLocale(text) {
  if (!text) return 'en';
  const t = text.toLowerCase();
  let es = 0, en = 0;
  // Caracteres exclusivos del español
  if (/[áéíóúñ¿¡]/.test(t)) es += 3;
  // Tokens en
  for (const w of ['the ', ' and ', ' of ', ' to ', ' is ', ' will ', 'world cup', 'against', 'goalkeeper', 'striker']) {
    if (t.includes(w)) en++;
  }
  // Tokens es
  for (const w of [' que ', ' del ', ' los ', ' las ', ' para ', ' por ', ' con ', 'selección', 'seleccion', 'mundial', 'fútbol', 'futbol', 'según', 'tras ', 'partido']) {
    if (t.includes(w)) es++;
  }
  return es > en ? 'es' : 'en';
}

async function fetchWithRetry(url, opts = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        ...opts,
        headers: { 'User-Agent': 'bracketMundial-news/2.0', ...(opts.headers || {}) },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (resp.ok) return resp;
      if (resp.status === 429 || resp.status >= 500) {
        if (attempt < retries) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
      }
      return resp; // 4xx no recuperables, devuelve para que el caller decida
    } catch (err) {
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error('unreachable');
}

// ─── Fuente: GNews API ───────────────────────────────────────────────────────
async function fetchGNews(query, lang, max) {
  if (!GNEWS_KEY) return [];
  const params = new URLSearchParams({ q: query, lang, max: String(max), sortby: 'publishedAt', apikey: GNEWS_KEY });
  try {
    const resp = await fetchWithRetry(`https://gnews.io/api/v4/search?${params}`);
    if (!resp.ok) {
      console.warn(`    ⚠ GNews HTTP ${resp.status}`);
      return [];
    }
    const json = await resp.json();
    if (json.errors) {
      console.warn(`    ⚠ GNews: ${json.errors.join(', ')}`);
      return [];
    }
    return (json.articles || []).map(a => ({
      title: a.title || '',
      description: a.description || '',
      url: a.url || '',
      image: a.image || '',
      source: a.source?.name || 'GNews',
      sourceUrl: a.source?.url || '',
      publishedAt: a.publishedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn(`    ⚠ GNews fetch failed: ${err.message}`);
    return [];
  }
}

// ─── Fuente: NewsAPI.org ─────────────────────────────────────────────────────
async function fetchNewsAPI(query, lang, max) {
  if (!NEWSAPI_KEY) return [];
  const params = new URLSearchParams({
    q: query, language: lang, pageSize: String(max),
    sortBy: 'publishedAt', apiKey: NEWSAPI_KEY,
  });
  try {
    const resp = await fetchWithRetry(`https://newsapi.org/v2/everything?${params}`);
    if (!resp.ok) {
      console.warn(`    ⚠ NewsAPI HTTP ${resp.status}`);
      return [];
    }
    const json = await resp.json();
    if (json.status !== 'ok') {
      console.warn(`    ⚠ NewsAPI: ${json.message || 'unknown error'}`);
      return [];
    }
    return (json.articles || []).map(a => ({
      title: a.title || '',
      description: a.description || '',
      url: a.url || '',
      image: a.urlToImage || '',
      source: a.source?.name || 'NewsAPI',
      sourceUrl: '',
      publishedAt: a.publishedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn(`    ⚠ NewsAPI fetch failed: ${err.message}`);
    return [];
  }
}

// ─── Fuente: Google News RSS ─────────────────────────────────────────────────
async function fetchGoogleNews(query, hl, gl, ceid) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:14d')}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  try {
    const resp = await fetchWithRetry(url);
    if (!resp.ok) return [];
    const xml = await resp.text();
    const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => m[1]);
      return blocks.map(b => {
        const rawTitle = stripCDATA(extractTag(b, 'title'));
        const { title, source: titleSource } = splitTitleSource(rawTitle);
        const link = stripCDATA(extractTag(b, 'link') || extractAttr(b, 'link', 'href'));
        const pubDate = extractTag(b, 'pubDate');
        const sourceTag = stripCDATA(extractTag(b, 'source'));
        return {
          title, description: '',
          url: link, image: '',
          source: sourceTag || titleSource || 'Google News',
          sourceUrl: '',
          publishedAt: parseDateISO(pubDate),
        };
      }).filter(i => i.title && i.url);
    } catch (err) {
      console.warn(`    ⚠ Google News RSS failed: ${err.message}`);
      return [];
    }
  }
  
  // ─── Fuente: RSS oficiales (un fetch global, filtrado por equipo) ────────────
  async function fetchAllOfficialRSS() {
    const all = [];
    for (const feed of OFFICIAL_RSS) {
      try {
        const resp = await fetchWithRetry(feed.url);
        if (!resp.ok) {
          console.warn(`    ⚠ ${feed.source} HTTP ${resp.status}`);
          continue;
        }
        const xml = await resp.text();
        const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => m[1]);
        for (const b of blocks) {
          const title = stripCDATA(extractTag(b, 'title'));
          const description = stripCDATA(extractTag(b, 'description')).replace(/<[^>]+>/g, '').slice(0, 280);
          const link = stripCDATA(extractTag(b, 'link'));
          const pubDate = extractTag(b, 'pubDate') || extractTag(b, 'dc:date');
        if (!title || !link) continue;
        all.push({
          title, description,
          url: link, image: '',
          source: feed.source, sourceUrl: feed.url,
          publishedAt: parseDateISO(pubDate),
          _feedLocale: feed.locale,
        });
      }
    } catch (err) {
      console.warn(`    ⚠ ${feed.source} failed: ${err.message}`);
    }
    await sleep(150);
  }
  console.log(`📡 Pre-cargados ${all.length} items de ${OFFICIAL_RSS.length} RSS oficiales.`);
  return all;
}

function filterOfficialForTeam(officialPool, team) {
  // Busca menciones del país en title+description, sin distinguir mayúsculas/acentos.
  const haystacks = [team.es, team.shortEs, team.en, team.shortEn]
    .map(s => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''));
  return officialPool.filter(item => {
    const txt = (item.title + ' ' + item.description).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return haystacks.some(h => h.length > 3 && txt.includes(h));
  });
}

// ─── Orquestación por equipo ─────────────────────────────────────────────────
async function gatherForTeam(team, officialPool) {
  const collected = []; // todos los items, todas las fuentes
  const esQuery = `${team.es} Mundial 2026`;
  const enQuery = `${team.en} "World Cup 2026"`;

  // 1. GNews — una sola query combinada ES|EN
  if (GNEWS_KEY) {
    const combined = `(${team.es} Mundial 2026) OR (${team.en} "World Cup 2026")`;
    collected.push(...await fetchGNews(combined, 'en', NEWS_PER_TEAM * 2));
    await sleep(300);
  }

  // 2. NewsAPI — ES y EN por separado (mejor calidad de filtro por idioma)
  if (NEWSAPI_KEY) {
    collected.push(...await fetchNewsAPI(esQuery, 'es', NEWS_PER_TEAM));
    await sleep(300);
    collected.push(...await fetchNewsAPI(enQuery, 'en', NEWS_PER_TEAM));
    await sleep(300);
  }

  // 3. Google News RSS — siempre, gratis
  collected.push(...await fetchGoogleNews(esQuery, 'es', 'ES', 'ES:es'));
  await sleep(300);
  collected.push(...await fetchGoogleNews(enQuery, 'en-US', 'US', 'US:en'));
  await sleep(300);

  // 4. RSS oficiales — filtra del pool pre-cargado, no hace fetch nuevo
  for (const item of filterOfficialForTeam(officialPool, team)) {
    collected.push({ ...item, _localeHint: item._feedLocale });
  }

  // ─── Dedupe por URL canonicalizada ─────────────────────────────────────
  const seen = new Map();
  for (const item of collected) {
    if (!item.url) continue;
    const cu = canonicalUrl(item.url);
    if (!seen.has(cu)) seen.set(cu, { ...item, url: cu });
  }
  const unique = [...seen.values()];

  // ─── Clasifica por idioma ──────────────────────────────────────────────
  const byLocale = { es: [], en: [] };
  for (const item of unique) {
    const loc = item._localeHint || detectLocale(`${item.title} ${item.description}`);
    delete item._localeHint;
    byLocale[loc].push(item);
  }

  // ─── Prioriza whitelist y trunca ───────────────────────────────────────
  const finalize = arr => {
    const preferred = arr.filter(i => isWhitelisted(i.source));
    const rest = arr.filter(i => !isWhitelisted(i.source));
    return [...preferred, ...rest]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, NEWS_PER_TEAM);
  };

  return { es: finalize(byLocale.es), en: finalize(byLocale.en) };
}

// ─── Sinks ───────────────────────────────────────────────────────────────────
async function upsertToSupabase(sb, team, news) {
  const rows = [];
  for (const locale of ['es', 'en']) {
    for (const item of news[locale]) {
      rows.push({
        team_id: team.id,
        locale,
        url: item.url,
        title: item.title.slice(0, 500),
        description: item.description?.slice(0, 1000) || null,
        image: item.image || null,
        source: item.source,
        source_url: item.sourceUrl || null,
        published_at: item.publishedAt,
        fetched_at: new Date().toISOString(),
      });
    }
  }
  if (rows.length === 0) return 0;
  const { error } = await sb.from('team_news').upsert(rows, { onConflict: 'team_id,locale,url' });
  if (error) {
    console.error(`    ❌ Supabase upsert ${team.id}: ${error.message}`);
    return 0;
  }
  return rows.length;
}

async function shouldSkipTeam(sb, teamId) {
  if (force) return false;
  const { data } = await sb
    .from('team_news')
    .select('fetched_at')
    .eq('team_id', teamId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return false;
  const age = Date.now() - new Date(data.fetched_at).getTime();
  return age < SKIP_IF_FRESHER_THAN_MS;
}

async function cleanupTTL(sb) {
  const cutoff = new Date(Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await sb.from('team_news').delete({ count: 'exact' }).lt('published_at', cutoff);
  if (error) console.warn(`  ⚠ TTL cleanup: ${error.message}`);
  else console.log(`🧹 TTL: borrados ${count ?? 0} items con published_at < ${cutoff.slice(0, 10)}`);
}

async function pruneOldNewsForTeam(sb, teamId) {
  for (const locale of ['es', 'en']) {
    const { data, error } = await sb
      .from('team_news')
      .select('url')
      .eq('team_id', teamId)
      .eq('locale', locale)
      .order('published_at', { ascending: false })
      .order('fetched_at', { ascending: false });

    if (error) {
      console.warn(`  ⚠ Error al buscar noticias para prunear en ${teamId}:${locale}: ${error.message}`);
      continue;
    }

    if (data && data.length > 5) {
      const urlsToDelete = data.slice(5).map(row => row.url);
      const { error: delErr } = await sb
        .from('team_news')
        .delete()
        .eq('team_id', teamId)
        .eq('locale', locale)
        .in('url', urlsToDelete);

      if (delErr) {
        console.warn(`  ⚠ Error al prunear noticias antiguas de ${teamId}:${locale}: ${delErr.message}`);
      } else {
        console.log(`  🧹 Pruned ${urlsToDelete.length} noticias antiguas en ${teamId}:${locale}`);
      }
    }
  }
}

function writeLocalJson(items) {
  const feed = { updatedAt: new Date().toISOString().slice(0, 10), items };
  const out = join(ROOT, 'news-feed.json');
  writeFileSync(out, JSON.stringify(feed, null, 2) + '\n', 'utf8');
  console.log(`💾 news-feed.json escrito en ${out}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const teams = teamFilter.length > 0 ? TEAMS.filter(t => teamFilter.includes(t.id)) : TEAMS;

  console.log('📰 Ingest News — Mundial 2026');
  console.log(`   Equipos: ${teams.length}${teamFilter.length ? ` (filtrados: ${teamFilter.join(',')})` : ''}`);
  console.log(`   Fuentes: GNews=${GNEWS_KEY ? 'ON' : 'off'} NewsAPI=${NEWSAPI_KEY ? 'ON' : 'off'} RSS=ON OficialesRSS=${OFFICIAL_RSS.length}`);
  console.log(`   Sink:    ${useSupabase ? 'Supabase (' + SUPABASE_URL + ')' : 'JSON local'}${dryRun ? ' [DRY-RUN]' : ''}`);

  const sb = useSupabase ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;
  const officialPool = await fetchAllOfficialRSS();

  let totalUpserts = 0, processed = 0, skipped = 0;
  const localItems = {}; // para modo JSON

  for (const team of teams) {
    // Skip inteligente: si Supabase tiene datos < 1h, no llamamos a APIs
    if (sb && await shouldSkipTeam(sb, team.id)) {
      skipped++;
      console.log(`  ${team.id} — skip (datos < 1h)`);
      continue;
    }

    process.stdout.write(`  ${team.id} ...`);
    const news = await gatherForTeam(team, officialPool);
    const esCount = news.es.length, enCount = news.en.length;
    const esImg = news.es.filter(i => i.image).length;
    const enImg = news.en.filter(i => i.image).length;
    console.log(` es:${esCount}(${esImg}📷) en:${enCount}(${enImg}📷)`);

    if (dryRun) { processed++; continue; }

    if (sb) {
      totalUpserts += await upsertToSupabase(sb, team, news);
      await pruneOldNewsForTeam(sb, team.id);
    } else {
      localItems[team.id] = {
        es: news.es.map(i => ({ ...i, date: i.publishedAt.slice(0, 10) })),
        en: news.en.map(i => ({ ...i, date: i.publishedAt.slice(0, 10) })),
      };
    }
    processed++;
  }

  console.log(`\n📊 Resumen: ${processed} procesados, ${skipped} skipped, ${totalUpserts} filas upserted`);

  if (sb && !dryRun) await cleanupTTL(sb);
  if (!sb && !dryRun) writeLocalJson(localItems);

  console.log('✅ Ingest completado.');
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
