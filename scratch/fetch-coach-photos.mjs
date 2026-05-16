/**
 * Descarga las fotos de entrenadores desde las URLs definidas en
 * src/data/coaches/index.ts y las guarda como public/coaches/{TEAM}.webp
 *
 * Uso:
 *   node scratch/fetch-coach-photos.mjs          # Salta las que ya existen
 *   node scratch/fetch-coach-photos.mjs --force  # Sobreescribe todas
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COACHES_FILE = join(ROOT, 'src', 'data', 'coaches', 'index.ts');
const DEST_DIR = join(ROOT, 'public', 'coaches');

const args = process.argv.slice(2);
const isForce = args.includes('--force');
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());

mkdirSync(DEST_DIR, { recursive: true });

// Extrae pares { teamCode, photoUrl } del fichero TS mediante regex
function parseCoaches(content) {
  const result = [];
  // Busca bloques: TEAMCODE: { ... photoUrl: '...' ... }
  // La clave de equipo es un identificador en mayúsculas al principio de línea
  const blockRegex = /^\s{2}([A-Z]{2,4}):\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gm;
  for (const blockMatch of content.matchAll(blockRegex)) {
    const teamCode = blockMatch[1];
    const block = blockMatch[2];
    const urlMatch = block.match(/photoUrl\s*:\s*['"]([^'"]+)['"]/);
    const nameMatch = block.match(/name\s*:\s*['"]([^'"]+)['"]/);
    if (urlMatch) {
      result.push({ teamCode, photoUrl: urlMatch[1], name: nameMatch ? nameMatch[1] : teamCode });
    }
  }
  return result;
}

const TSDB_API = 'https://www.thesportsdb.com/api/v1/json/3';

const HEADERS = {
  'User-Agent': 'BracketMundial/1.0 (https://bracketmundial.com; research/educational)',
};

/** Convierte URL thumb de Wikimedia a URL del archivo original */
function resolveWikimediaUrl(url) {
  const thumbRe = /^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/)thumb\/([0-9a-f]\/[0-9a-f]{2}\/)(.+?)\/\d+px-.+$/i;
  const m = url.match(thumbRe);
  if (m) return `${m[1]}${m[2]}${m[3]}`;
  return url;
}

async function searchTheSportsDB(name) {
  try {
    const url = `${TSDB_API}/searchplayers.php?p=${encodeURIComponent(name)}`;
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
    const json = await resp.json();
    const results = json.player;
    if (!Array.isArray(results) || results.length === 0) return null;
    const match = results.find(p => (p.strPlayer ?? '').toLowerCase() === name.toLowerCase()) ?? results[0];
    return match.strCutout || match.strThumb || null;
  } catch { return null; }
}

async function searchWikipedia(name) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const resp = await fetch(url, { headers: HEADERS });
    const json = await resp.json();
    const pages = json.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;
    return pages[pageId].thumbnail?.source || null;
  } catch { return null; }
}

async function downloadAndConvert(url, dest) {
  const finalUrl = resolveWikimediaUrl(url);
  const resp = await fetch(finalUrl, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  await sharp(buf)
    .resize(300, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest);
}

/** Intenta descargar de la URL guardada; si falla busca en TSDB y Wikipedia */
async function fetchCoachPhoto(photoUrl, coachName, dest) {
  // 1. Intentar URL almacenada
  try {
    await downloadAndConvert(photoUrl, dest);
    return { source: 'stored' };
  } catch (e1) {
    // 2. Buscar en TheSportsDB
    const tsdbUrl = await searchTheSportsDB(coachName);
    if (tsdbUrl) {
      try {
        await downloadAndConvert(tsdbUrl, dest);
        return { source: 'tsdb', url: tsdbUrl };
      } catch {}
    }
    // 3. Buscar en Wikipedia
    const wikiUrl = await searchWikipedia(coachName);
    if (wikiUrl) {
      try {
        await downloadAndConvert(wikiUrl, dest);
        return { source: 'wikipedia', url: wikiUrl };
      } catch {}
    }
    throw new Error(`No image found (stored: ${e1.message})`);
  }
}

const content = readFileSync(COACHES_FILE, 'utf-8');
const coaches = parseCoaches(content);

console.log(`📋 ${coaches.length} entrenadores encontrados en coaches/index.ts\n`);

const filtered = teamFilter.length > 0
  ? coaches.filter(c => teamFilter.includes(c.teamCode))
  : coaches;

const stats = { found: 0, skipped: 0, errors: 0, noUrl: 0 };

for (const { teamCode, photoUrl, name } of filtered) {
  const dest = join(DEST_DIR, `${teamCode}.webp`);

  if (existsSync(dest) && !isForce) {
    console.log(`⏭  ${teamCode} — ya existe`);
    stats.skipped++;
    continue;
  }

  try {
    process.stdout.write(`⬇  ${teamCode} (${name}) `);
    const result = await fetchCoachPhoto(photoUrl, name, dest);
    console.log(`✓ [${result.source}]`);
    if (result.url) {
      console.log(`   → URL: ${result.url}`);
    }
    stats.found++;
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    stats.errors++;
  }

  // Pausa para no saturar los servidores (Wikimedia tiene rate-limit estricto)
  await new Promise(r => setTimeout(r, 1200));
}

console.log(`
✅ Descargadas:   ${stats.found}
⏭  Ya existían:  ${stats.skipped}
❌ Errores:       ${stats.errors}
`);
