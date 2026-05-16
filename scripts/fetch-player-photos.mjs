import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'player-photos.ts');
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const THROTTLE_MS = 3000;

let lastReq = 0;
async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

function parsePlayers(content) {
  const entries = [];
  // Soporta comillas simples o dobles y escapes como N\'Golo
  const regex = /\{\s*number:\s*(\d+),\s*name:\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  for (const m of content.matchAll(regex)) {
    entries.push({ 
      number: parseInt(m[1], 10), 
      name: m[3].replace(/\\/g, '') 
    });
  }
  return entries;
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

const filter = process.argv.slice(2).map(t => t.toLowerCase());
const squadFiles = readdirSync(SQUADS_DIR)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .filter(f => filter.length === 0 || filter.includes(basename(f, '.ts').toLowerCase()));

const stats = { found: 0, skipped: 0, notFound: 0, errors: 0 };
const missing = {};

for (const file of squadFiles) {
  const teamCode = basename(file, '.ts').toUpperCase();
  const content = readFileSync(join(SQUADS_DIR, file), 'utf-8');
  const players = parsePlayers(content);
  if (players.length === 0) continue;

  mkdirSync(join(PUBLIC_PLAYERS, teamCode), { recursive: true });

  for (const { number, name } of players) {
    const dest = join(PUBLIC_PLAYERS, teamCode, `${number}.webp`);

    if (existsSync(dest)) {
      stats.skipped++;
      continue;
    }

    await throttle();

    try {
      const searchUrl = `${API_BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
      const searchResp = await fetch(searchUrl);
      if (!searchResp.ok) throw new Error(`API HTTP ${searchResp.status}`);
      const searchJson = await searchResp.json();
      const results = searchJson.player;

      if (!Array.isArray(results) || results.length === 0) {
        stats.notFound++;
        (missing[teamCode] ??= []).push(name);
        continue;
      }

      const match =
        results.find(p => (p.strPlayer ?? '').toLowerCase() === name.toLowerCase()) ??
        results[0];
      const imgUrl = match.strCutout || match.strThumb;

      if (!imgUrl) {
        stats.notFound++;
        (missing[teamCode] ??= []).push(name);
        continue;
      }

      const imgResp = await fetch(imgUrl);
      if (!imgResp.ok) throw new Error(`IMG HTTP ${imgResp.status}`);
      const imgBuf = Buffer.from(await imgResp.arrayBuffer());

      await sharp(imgBuf)
        .resize(300, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(dest);

      stats.found++;
      process.stdout.write(`✓ ${teamCode}-${number} ${name}\n`);
    } catch (err) {
      stats.errors++;
      (missing[teamCode] ??= []).push(`${name} (${err.message})`);
      process.stderr.write(`✗ ${teamCode}-${number} ${name}: ${err.message}\n`);
    }
  }
}

const total = generateManifest();
console.log(`\n📸 Manifiesto actualizado: ${total} fotos en src/data/player-photos.ts`);
console.log(
  `\n✅ ${stats.found} descargadas · ⏭ ${stats.skipped} saltadas · ❌ ${stats.notFound} sin foto · ⚠ ${stats.errors} errores`,
);

if (Object.keys(missing).length > 0) {
  console.log('\nJugadores sin foto por selección:');
  for (const [team, names] of Object.entries(missing).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`  ${team}: ${names.join(', ')}`);
  }
}
