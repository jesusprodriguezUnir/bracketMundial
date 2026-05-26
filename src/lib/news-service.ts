// Servicio de noticias del Mundial 2026.
//
// FLUJO:
// 1. Un cron de GitHub Actions ejecuta scripts/ingest-news.mjs cada 3 h.
//    Combina GNews + NewsAPI + Google News RSS + RSS oficiales y upsertea
//    en la tabla `team_news` de Supabase.
// 2. El cliente (este servicio) consulta la vista `team_news_top` (top 5 por
//    equipo+locale, ordenado por publicación) y la cachea en localStorage 1 h.
// 3. Si Supabase no está configurado o el fetch falla, cae al seed bundleado
//    (NEWS_SEED) — fallback offline garantizado.

import { getSupabase, isSupabaseConfigured } from './supabase-client';
import { NEWS_SEED } from '../data/news/seed';

export interface NewsItem {
  title: string;
  description?: string;
  url: string;
  image?: string;
  source: string;
  sourceUrl?: string;
  date: string; // YYYY-MM-DD
}

type LocalizedItems = { es: NewsItem[]; en: NewsItem[] };
type FeedMap = Record<string, LocalizedItems>;

interface CacheEntry {
  items: FeedMap;
  ts: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 h — el feed se refresca cada 3 h en CI
const CACHE_KEY = 'news:feed:v3';  // v3 invalida cachés del antiguo feed JSON

let _inFlight: Promise<FeedMap> | null = null;

function _seedAsMap(): FeedMap {
  return NEWS_SEED.items as FeedMap;
}

function _fromCache(): FeedMap | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.items;
  } catch {
    return null;
  }
}

function _toCache(items: FeedMap): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ items, ts: Date.now() } satisfies CacheEntry));
  } catch { /* quota full, ignorar */ }
}

/** Consulta la vista `team_news_top` y la convierte al shape esperado por la UI. */
async function _fetchFromSupabase(): Promise<FeedMap> {
  const sb = getSupabase();
  if (!sb) throw new Error('supabase-not-configured');

  const { data, error } = await sb
    .from('team_news_top')
    .select('team_id, locale, url, title, description, image, source, source_url, published_at');

  if (error) throw error;
  if (!data) return {};

  const out: FeedMap = {};
  for (const row of data as Array<{
    team_id: string; locale: 'es' | 'en';
    url: string; title: string; description: string | null; image: string | null;
    source: string; source_url: string | null; published_at: string;
  }>) {
    const bucket = out[row.team_id] ??= { es: [], en: [] };
    bucket[row.locale].push({
      title: row.title,
      description: row.description ?? undefined,
      url: row.url,
      image: row.image ?? undefined,
      source: row.source,
      sourceUrl: row.source_url ?? undefined,
      date: row.published_at.slice(0, 10),
    });
  }
  // La vista ya ordena por published_at desc, pero garantizamos shape.
  for (const id of Object.keys(out)) {
    out[id].es.sort((a, b) => b.date.localeCompare(a.date));
    out[id].en.sort((a, b) => b.date.localeCompare(a.date));
  }
  return out;
}

async function _loadFeed(): Promise<FeedMap> {
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      if (!isSupabaseConfigured) return _seedAsMap();
      const items = await _fetchFromSupabase();
      // Si la consulta vuelve vacía (BD recién creada, sin ingestas todavía),
      // usamos el seed para no mostrar vacío en la UI.
      const hasContent = Object.values(items).some(b => b.es.length || b.en.length);
      const final = hasContent ? items : _seedAsMap();
      _toCache(final);
      return final;
    } catch (err) {
      console.warn('[news] fallback a seed:', (err as Error).message);
      return _seedAsMap();
    } finally {
      _inFlight = null;
    }
  })();

  return _inFlight;
}

/** Devuelve noticias para `teamId` en el `locale` indicado. Cacheado 1 h. */
export async function getTeamNews(teamId: string, locale: 'es' | 'en'): Promise<NewsItem[]> {
  const cached = _fromCache();
  const feed = cached ?? await _loadFeed();
  return feed[teamId]?.[locale] ?? [];
}

/** Limpia la caché local. Útil tras un refresh manual del feed. */
export function clearNewsCache(): void {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignorar */ }
}
