import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const PUBLIC_COACHES = join(ROOT, 'public', 'coaches');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'player-photos.ts');
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const THROTTLE_MS = 2000; // Un poco más rápido pero con cuidado

let lastReq = 0;
async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

// Argumentos: node script.mjs [TEAM] [--type player|coach] [--force]
const args = process.argv.slice(2);
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
const isForce = args.includes('--force');
const assetType = args.find(a => a.startsWith('--type='))?.split('=')[1] || (args.includes('--type') ? args[args.indexOf('--type') + 1] : 'player');

function parseSquadFile(content) {
  const players = [];
  // Regex para jugadores
  const playerRegex = /\{\s*number:\s*(\d+),\s*name:\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  for (const m of content.matchAll(playerRegex)) {
    players.push({ number: parseInt(m[1], 10), name: m[3].replace(/\\/g, '') });
  }
  
  // Regex para entrenador (si existe). Soporta coach: '...' o coach = '...'
  const coachMatch = content.match(/coach\s*[:=]\s*(['"])((?:\\.|(?!\1).)*)\1/);
  const coach = coachMatch ? coachMatch[2].replace(/\\/g, '') : null;

  return { players, coach };
}

async function downloadAndProcess(url, dest) {
  const imgResp = await fetch(url);
  if (!imgResp.ok) throw new Error(`IMG HTTP ${imgResp.status}`);
  const imgBuf = Buffer.from(await imgResp.arrayBuffer());

  await sharp(imgBuf)
    .resize(300, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest);
}

async function searchTheSportsDB(name) {
  const searchUrl = `${API_BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
  const searchResp = await fetch(searchUrl);
  if (!searchResp.ok) return null;
  const json = await searchResp.json();
  const results = json.player;
  if (!Array.isArray(results) || results.length === 0) return null;
  
  const match = results.find(p => (p.strPlayer ?? '').toLowerCase() === name.toLowerCase()) ?? results[0];
  return match.strCutout || match.strThumb || null;
}

async function searchWikipedia(name) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const resp = await fetch(searchUrl);
    const json = await resp.json();
    const pages = json.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;
    return pages[pageId].thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function getImageUrl(name) {
  // Intentar TheSportsDB
  let url = await searchTheSportsDB(name);
  
  // Fallback a Wikipedia
  if (!url) {
    url = await searchWikipedia(name);
  }

  return url;
}

function generateManifest() {
  const keys = [];
  if (existsSync(PUBLIC_PLAYERS)) {
    for (const entry of readdirSync(PUBLIC_PLAYERS, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const teamDir = join(PUBLIC_PLAYERS, entry.name);
      for (const file of readdirSync(teamDir)) {
        if (file.endsWith('.webp')) {
          keys.push(`'${entry.name}-${basename(file, '.webp')}'`);
        }
      }
    }
  }
  keys.sort();
  const body = keys.map(k => `  ${k},`).join('\n');
  writeFileSync(
    MANIFEST_PATH,
    `// AUTOGENERADO por scripts/fetch-player-photos.mjs — no editar a mano\nexport const PLAYER_PHOTOS: ReadonlySet<string> = new Set<string>([\n${body}\n]);\n`,
  );
  return keys.length;
}

async function run() {
  const squadFiles = readdirSync(SQUADS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .filter(f => teamFilter.length === 0 || teamFilter.includes(basename(f, '.ts').toUpperCase()));

  const stats = { found: 0, skipped: 0, notFound: 0, errors: 0 };
  
  mkdirSync(PUBLIC_PLAYERS, { recursive: true });
  mkdirSync(PUBLIC_COACHES, { recursive: true });

  for (const file of squadFiles) {
    const teamCode = basename(file, '.ts').toUpperCase();
    const content = readFileSync(join(SQUADS_DIR, file), 'utf-8');
    const { players, coach } = parseSquadFile(content);

    if (assetType === 'player') {
      mkdirSync(join(PUBLIC_PLAYERS, teamCode), { recursive: true });
      for (const { number, name } of players) {
        const dest = join(PUBLIC_PLAYERS, teamCode, `${number}.webp`);
        if (existsSync(dest) && !isForce) {
          stats.skipped++;
          continue;
        }

        await throttle();
        try {
          const url = await getImageUrl(name);
          if (!url) {
            stats.notFound++;
            continue;
          }
          await downloadAndProcess(url, dest);
          stats.found++;
          console.log(`✓ ${teamCode}-${number} ${name}`);
        } catch (err) {
          stats.errors++;
          console.error(`✗ ${teamCode}-${number} ${name}: ${err.message}`);
        }
      }
    } else if (assetType === 'coach') {
      if (!coach) {
        console.log(`ℹ ${teamCode}: Sin entrenador configurado en el archivo.`);
        continue;
      }
      const dest = join(PUBLIC_COACHES, `${teamCode}.webp`);
      if (existsSync(dest) && !isForce) {
        stats.skipped++;
        continue;
      }

      await throttle();
      try {
        const url = await getImageUrl(coach);
        if (!url) {
          stats.notFound++;
          console.log(`? ${teamCode} Coach: ${coach} (No encontrado)`);
          continue;
        }
        await downloadAndProcess(url, dest);
        stats.found++;
        console.log(`✓ ${teamCode} Coach: ${coach}`);
      } catch (err) {
        stats.errors++;
        console.error(`✗ ${teamCode} Coach: ${coach}: ${err.message}`);
      }
    }
  }

  if (assetType === 'player') {
    const total = generateManifest();
    console.log(`\n📸 Manifiesto actualizado: ${total} fotos.`);
  }
  
  console.log(`\n✅ ${stats.found} descargadas · ⏭ ${stats.skipped} saltadas · ❌ ${stats.notFound} no encontradas · ⚠ ${stats.errors} errores`);
}

run();
