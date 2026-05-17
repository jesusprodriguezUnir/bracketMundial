import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const PLAYER_MANIFEST = join(ROOT, 'src', 'data', 'player-photos.ts');

const args = process.argv.slice(2);
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
const isForce = args.includes('--force');

// Throttle más largo para evitar 429
const THROTTLE_MS = 4000;
let lastReq = 0;
async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

// Reintento con backoff exponencial
async function fetchWithRetry(url, retries = 3, baseDelay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'bracketMundial/1.0 (research; non-commercial)' }
      });
      if (resp.status === 429) {
        const wait = baseDelay * Math.pow(2, i);
        console.log(`    ⏳ Rate limited, esperando ${wait/1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!resp.ok) return null;
      return resp;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
  return null;
}

// Parsear squad
function parseSquadFile(content) {
  const players = [];
  const re = /\{\s*number:\s*(\d+),\s*name:\s*['"]([^'"]+)['"],\s*position:\s*['"]([^'"]+)['"],\s*age:\s*(\d+),\s*club:\s*['"]([^'"]+)['"]/g;
  for (const m of content.matchAll(re)) {
    players.push({ number: +m[1], name: m[2], position: m[3], club: m[5] });
  }
  return players;
}

// Descargar y procesar imagen
async function downloadAndProcess(url, dest) {
  const resp = await fetchWithRetry(url);
  if (!resp) throw new Error('Sin respuesta');
  const buf = Buffer.from(await resp.arrayBuffer());
  await sharp(buf).resize(300, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
}

// Buscar en Wikipedia usando search API
async function searchWikipedia(playerName, club) {
  // Limpiar nombre del jugador
  const cleanName = playerName.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const nameParts = cleanName.split(' ');
  const lastName = nameParts[nameParts.length - 1]; // El apellido es通常是 el último
  
  // Buscar por nombre completo y por apellido
  const searches = [
    playerName,
    lastName + ' footballer',
    lastName + ' ' + (club || 'footballer'),
  ];
  
  for (const query of searches) {
    await throttle();
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;
    
    const resp = await fetchWithRetry(searchUrl);
    if (!resp) continue;
    const [suggestions] = await resp.json();
    
    if (!suggestions || suggestions.length === 0) continue;
    
    // Buscar match
    for (const title of suggestions) {
      const cleanTitle = title.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      // Verificar que el título contenga al menos parte del nombre (apellido o nombre)
      const hasMatch = nameParts.some(part => part.length > 2 && cleanTitle.includes(part));
      if (hasMatch) {
        console.log(`    🔍 Wiki: "${title}"`);
        
        // Obtener imagen
        await throttle();
        const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
        const pageResp = await fetchWithRetry(pageUrl);
        if (!pageResp) continue;
        const json = await pageResp.json();
        const page = Object.values(json.query?.pages || {})[0];
        if (!page || page.missing !== undefined) continue;
        
        if (page.thumbnail?.source) {
          return page.thumbnail.source;
        }
      }
    }
  }
  
  return null;
}

// Buscar en página del club
async function searchClubSite(playerName, club) {
  if (!club) return null;
  await throttle();
  
  // Mapeo de clubs a URLs de squad
  const clubUrls = {
    'Rennes': 'https://www.staderennais.com/en/first-team',
    'Montpellier': 'https://www.mhsc.fr/equipe/pro',
    'Lyon': 'https://www.ol.fr/fr/equipes/equipe-pro',
    'PSG': 'https://www.psg.fr/equipes/equipe-premiere',
    'Marseille': 'https://www.om.fr/fr/equipe/equipe-pro',
    'Al Ahly': 'https://www.alahlysc.com/team/first-team',
    ' Zamalek': 'https://www.zamalek.sc/team/first-team',
    'Al Hilal': 'https://www.alhilal.com/team/first-team',
    'Al Nassr': 'https://www.alnassr.sa/teams/first-team',
  };

  // Por ahora intentamos buscar con el nombre del club + jugador en Google
  // Pero es muy complejo, mejor usamos Wikipedia con search más amplio
  return null;
}

// Generar manifest
function generatePlayerManifest() {
  const keys = [];
  if (existsSync(PUBLIC_PLAYERS)) {
    for (const entry of readdirSync(PUBLIC_PLAYERS, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      for (const file of readdirSync(join(PUBLIC_PLAYERS, entry.name))) {
        if (file.endsWith('.webp')) keys.push(`'${entry.name}-${basename(file, '.webp')}'`);
      }
    }
  }
  keys.sort();
  writeFileSync(
    PLAYER_MANIFEST,
    `// AUTOGENERADO por scripts/fetch-squad-assets.mjs — no editar a mano\n` +
    `export const PLAYER_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    keys.map(k => `  ${k},`).join('\n') + '\n]);\n',
  );
  return keys.length;
}

async function run() {
  const squadFiles = readdirSync(SQUADS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .filter(f => teamFilter.length === 0 || teamFilter.includes(basename(f, '.ts').toUpperCase()));

  mkdirSync(PUBLIC_PLAYERS, { recursive: true });

  const stats = { found: 0, skipped: 0, notFound: 0, errors: 0 };

  for (const f of squadFiles) {
    const code = basename(f, '.ts').toUpperCase();
    const content = readFileSync(join(SQUADS_DIR, f), 'utf8');
    const players = parseSquadFile(content);

    // Ver qué falta
    const dir = join(PUBLIC_PLAYERS, code);
    const have = existsSync(dir)
      ? new Set(readdirSync(dir).filter(x => x.endsWith('.webp')).map(x => +basename(x, '.webp')))
      : new Set();
    const missing = players.filter(p => !have.has(p.number));

    if (missing.length === 0) {
      console.log(`\n✅ ${code}: sin fotos faltantes`);
      continue;
    }

    console.log(`\n📥 ${code}: ${missing.length} jugadores sin foto`);
    mkdirSync(dir, { recursive: true });

    for (const p of missing) {
      const dest = join(PUBLIC_PLAYERS, code, `${p.number}.webp`);
      if (existsSync(dest) && !isForce) { stats.skipped++; continue; }

      console.log(`  📷 #${p.number} ${p.name} (${p.club})...`);
      
      try {
        let url = null;
        
        // 1. Buscar en Wikipedia por nombre completo del jugador
        url = await searchWikipedia(p.name, p.club);

        if (!url) {
          // 2. Si tiene club y es conocido, buscar en el club
          const clubUrl = await searchClubSite(p.name, p.club);
          if (clubUrl) url = clubUrl;
        }

        if (!url) {
          stats.notFound++;
          console.log(`    ❌ no encontrado`);
          continue;
        }

        await downloadAndProcess(url, dest);
        stats.found++;
        console.log(`    ✅ OK`);
      } catch (err) {
        stats.errors++;
        console.log(`    ❌ ${err.message}`);
      }
    }
  }

  const total = generatePlayerManifest();
  console.log(`\n📸 player-photos.ts: ${total} entradas`);
  console.log(`\n✅ ${stats.found} descargadas · ⏭ ${stats.skipped} saltadas · ❌ ${stats.notFound} no encontradas · ⚠ ${stats.errors} errores`);
}

run().catch(err => { console.error(err); process.exit(1); });