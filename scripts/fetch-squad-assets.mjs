import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const COACHES_FILE = join(ROOT, 'src', 'data', 'coaches', 'index.ts');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const PUBLIC_COACHES = join(ROOT, 'public', 'coaches');
const PLAYER_MANIFEST = join(ROOT, 'src', 'data', 'player-photos.ts');
const COACH_MANIFEST = join(ROOT, 'src', 'data', 'coach-photos.ts');
const DOCS_DIR = join(ROOT, 'docs');
const MISSING_REPORT = join(DOCS_DIR, 'missing-assets.md');
const DISCREPANCIES_REPORT = join(DOCS_DIR, 'data-discrepancies.md');

// ── .env simple parser ────────────────────────────────────────────────────────
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
const API_FOOTBALL_KEY = ENV.API_FOOTBALL_KEY;
const FOOTBALL_DATA_KEY = ENV.FOOTBALL_DATA_KEY; // reservado para verify-data extendido

// ── args ──────────────────────────────────────────────────────────────────────
// Uso: node script.mjs [TEAM...] [--type player|coach|all] [--force] [--report] [--verify-data]
const args = process.argv.slice(2);
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
const isForce = args.includes('--force');
const isReport = args.includes('--report');
const isVerifyData = args.includes('--verify-data');
const assetTypeArg = args.find(a => a.startsWith('--type='))?.split('=')[1]
  ?? (args.includes('--type') ? args[args.indexOf('--type') + 1] : 'all');

// ── throttle ──────────────────────────────────────────────────────────────────
const THROTTLE_MS = 1500;
let lastReq = 0;
async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

// ── name normalization + Levenshtein similarity ────────────────────────────────
function normalizeStr(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function nameSimilarity(a, b) {
  const na = normalizeStr(a), nb = normalizeStr(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return maxLen === 0 ? 1 : 1 - levenshtein(na, nb) / maxLen;
}

// ── squad parser ──────────────────────────────────────────────────────────────
function parseSquadFile(content) {
  const players = [];
  const re = /number:\s*(\d+),\s*name:\s*(['"])(.*?)\2/g;
  for (const m of content.matchAll(re)) players.push({ number: +m[1], name: m[3] });
  return players;
}

// ── coaches parser (reads src/data/coaches/index.ts) ─────────────────────────
function parseCoaches() {
  const content = readFileSync(COACHES_FILE, 'utf8');
  const coaches = {};
  // Match each team block: "  MEX: {\n    name: 'Javier Aguirre',"
  const teamRe = /^  ([A-Z]{2,3}):\s*\{/gm;
  const nameRe = /name:\s*(['"])([^'"]+)\1/;
  let m;
  while ((m = teamRe.exec(content)) !== null) {
    const slice = content.slice(m.index, m.index + 400);
    const nm = nameRe.exec(slice);
    if (nm) coaches[m[1]] = nm[2];
  }
  return coaches;
}

// ── image download + sharp ────────────────────────────────────────────────────
async function downloadAndProcess(url, dest) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  await sharp(buf).resize(300, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
}

// ── source 1: API-Football (RapidAPI) ─────────────────────────────────────────
// Rate limit: 100 req/day en plan free. Usar por equipos, no masivamente.
async function searchApiFootball(name) {
  if (!API_FOOTBALL_KEY) return null;
  await throttle();
  try {
    const url = `https://api-football-v1.p.rapidapi.com/v3/players?search=${encodeURIComponent(name)}`;
    const resp = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_FOOTBALL_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
      },
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    const results = json.response;
    if (!Array.isArray(results) || results.length === 0) return null;
    const best = results.sort(
      (a, b) => nameSimilarity(b.player.name, name) - nameSimilarity(a.player.name, name),
    )[0];
    if (nameSimilarity(best.player.name, name) < 0.6) return null;
    return { photoUrl: best.player.photo ?? null, data: best };
  } catch { return null; }
}

// ── source 2: TheSportsDB (free) ──────────────────────────────────────────────
async function searchTheSportsDB(name) {
  await throttle();
  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    const results = json.player;
    if (!Array.isArray(results) || results.length === 0) return null;
    const best = results.sort(
      (a, b) => nameSimilarity(b.strPlayer ?? '', name) - nameSimilarity(a.strPlayer ?? '', name),
    )[0];
    if (nameSimilarity(best.strPlayer ?? '', name) < 0.6) return null;
    return best.strCutout || best.strThumb || null;
  } catch { return null; }
}

// ── source 3: Wikipedia pageimages (free) ─────────────────────────────────────
async function searchWikipedia(name) {
  await throttle();
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const resp = await fetch(url);
    const json = await resp.json();
    const page = Object.values(json.query.pages)[0];
    if (!page || page.missing !== undefined) return null;
    return page.thumbnail?.source ?? null;
  } catch { return null; }
}

// ── resolver principal ────────────────────────────────────────────────────────
let _warnedApiFootball = false;
let _warnedFootballData = false;

async function resolvePhotoUrl(name) {
  // 1. API-Football (mejor cobertura, key requerida)
  if (API_FOOTBALL_KEY) {
    const res = await searchApiFootball(name);
    if (res?.photoUrl) return res.photoUrl;
  } else if (!_warnedApiFootball) {
    console.log('  ℹ API-Football omitida (añade API_FOOTBALL_KEY en .env)');
    _warnedApiFootball = true;
  }

  if (FOOTBALL_DATA_KEY && !_warnedFootballData) {
    // football-data.org: requiere mapeo team-ID; se usa en --verify-data extendido
    console.log('  ℹ football-data.org disponible pero no usado en modo foto (ver --verify-data)');
    _warnedFootballData = true;
  }

  // 2. TheSportsDB (free)
  const tsdb = await searchTheSportsDB(name);
  if (tsdb) return tsdb;

  // 3. Wikipedia (last resort)
  return await searchWikipedia(name);
}

// ── manifests ─────────────────────────────────────────────────────────────────
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

function generateCoachManifest() {
  const keys = [];
  if (existsSync(PUBLIC_COACHES)) {
    for (const file of readdirSync(PUBLIC_COACHES)) {
      if (file.endsWith('.webp')) keys.push(`'${basename(file, '.webp')}'`);
    }
  }
  keys.sort();
  writeFileSync(
    COACH_MANIFEST,
    `// AUTOGENERADO por scripts/fetch-squad-assets.mjs — no editar a mano\n` +
    `export const COACH_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    keys.map(k => `  ${k},`).join('\n') + '\n]);\n',
  );
  return keys.length;
}

// ── --report mode (solo lectura, genera docs/missing-assets.md) ───────────────
function runReport() {
  mkdirSync(DOCS_DIR, { recursive: true });
  const squadFiles = readdirSync(SQUADS_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  const coaches = parseCoaches();
  const rows = [];
  let totalDef = 0, totalHave = 0;

  for (const f of squadFiles) {
    const code = basename(f, '.ts').toUpperCase();
    const players = parseSquadFile(readFileSync(join(SQUADS_DIR, f), 'utf8'));
    const dir = join(PUBLIC_PLAYERS, code);
    const have = existsSync(dir)
      ? new Set(readdirSync(dir).filter(x => x.endsWith('.webp')).map(x => +basename(x, '.webp')))
      : new Set();
    const missing = players.filter(p => !have.has(p.number));
    totalDef += players.length;
    totalHave += players.length - missing.length;
    const coachOk = existsSync(join(PUBLIC_COACHES, code + '.webp'));
    rows.push({ code, def: players.length, have: players.length - missing.length, missing, coachOk, coachName: coaches[code] ?? '—' });
  }

  rows.sort((a, b) => b.missing.length - a.missing.length);
  const coachMissing = rows.filter(r => !r.coachOk);
  const playerMissingRows = rows.filter(r => r.missing.length > 0);
  const totalMissing = totalDef - totalHave;

  // Consola
  const date = new Date().toLocaleDateString('es-ES');
  console.log(`\n📊 ACTIVOS FALTANTES — ${date}`);
  console.log(`Jugadores: ${totalHave}/${totalDef} con foto · ❌ ${totalMissing} faltan en ${playerMissingRows.length} equipos`);
  console.log(`Entrenadores sin foto local: ${coachMissing.length > 0 ? coachMissing.map(r => r.code).join(', ') : 'ninguno'}\n`);
  if (playerMissingRows.length > 0) {
    console.log('  Equipo | Def | Foto | Faltan | Coach');
    for (const r of playerMissingRows)
      console.log(`  ${r.code.padEnd(4)} | ${String(r.def).padStart(3)} | ${String(r.have).padStart(4)} | ${String(r.missing.length).padStart(6)} | ${r.coachOk ? 'OK' : 'FALTA'}`);
  }

  // Markdown
  let md = `# Activos faltantes — Mundial 2026\n\n`;
  md += `> Generado el ${date} con \`node scripts/fetch-squad-assets.mjs --report\`\n\n`;
  md += `**Jugadores:** ${totalMissing} fotos faltantes en ${playerMissingRows.length} equipos (${totalHave}/${totalDef} cubiertos)  \n`;
  md += `**Entrenadores:** ${coachMissing.length} sin foto local\n\n`;
  md += `> Para descargar fotos de un equipo: \`npm run photos -- JOR\`  \n`;
  md += `> Para entrenadores: \`npm run photos -- JOR --type coach\`\n\n`;

  if (coachMissing.length > 0) {
    md += `## Entrenadores sin foto local\n\n`;
    md += `| Equipo | Entrenador |\n|--------|------------|\n`;
    for (const r of coachMissing) md += `| ${r.code} | ${r.coachName} |\n`;
    md += '\n';
  }

  md += `## Resumen por equipo\n\n`;
  md += `| Equipo | Definidos | Con foto | Faltan | Coach local |\n`;
  md += `|--------|-----------|----------|--------|-------------|\n`;
  for (const r of rows) {
    const pFlag = r.missing.length > 0 ? `❌ ${r.missing.length}` : '✅ 0';
    const cFlag = r.coachOk ? '✅' : '❌';
    md += `| ${r.code} | ${r.def} | ${r.have} | ${pFlag} | ${cFlag} |\n`;
  }
  md += '\n';

  for (const r of playerMissingRows) {
    md += `### ${r.code} — faltan ${r.missing.length} foto${r.missing.length > 1 ? 's' : ''}\n\n`;
    for (const p of [...r.missing].sort((a, b) => a.number - b.number))
      md += `- \`#${p.number}\` ${p.name}\n`;
    md += '\n';
  }

  writeFileSync(MISSING_REPORT, md);
  console.log(`\n✅ Reporte guardado en docs/missing-assets.md`);
}

// ── --verify-data mode ────────────────────────────────────────────────────────
// Compara nombres de jugadores/entrenadores contra API-Football.
// No modifica ningún archivo de datos; genera docs/data-discrepancies.md.
async function runVerifyData(squadFiles, coaches) {
  if (!API_FOOTBALL_KEY) {
    console.error('⚠  --verify-data requiere API_FOOTBALL_KEY en .env');
    console.error('   Plan free de RapidAPI: https://rapidapi.com/api-sports/api/api-football');
    process.exit(1);
  }
  mkdirSync(DOCS_DIR, { recursive: true });
  const discrepancies = [];
  const date = new Date().toLocaleDateString('es-ES');

  for (const f of squadFiles) {
    const code = basename(f, '.ts').toUpperCase();
    const players = parseSquadFile(readFileSync(join(SQUADS_DIR, f), 'utf8'));
    console.log(`🔍 ${code} (${players.length} jugadores)...`);

    for (const { number, name } of players) {
      const res = await searchApiFootball(name);
      if (!res?.data) {
        discrepancies.push({ team: code, num: number, field: 'no encontrado en API', local: name, api: '—' });
        continue;
      }
      const apiName = res.data.player.name ?? '';
      const sim = nameSimilarity(name, apiName);
      if (sim < 0.75) {
        discrepancies.push({ team: code, num: number, field: 'nombre', local: name, api: apiName });
      }
      const apiClub = res.data.statistics?.[0]?.team?.name ?? '';
      // Solo reportar club si hay discrepancia clara (no comparamos con el local por falta de parseo)
      if (apiClub) discrepancies.push({ team: code, num: number, field: 'club (API)', local: '—', api: apiClub });
    }

    const coachName = coaches[code];
    if (coachName) {
      const res = await searchApiFootball(coachName);
      if (!res?.data) {
        discrepancies.push({ team: code, num: 0, field: 'entrenador no encontrado', local: coachName, api: '—' });
      }
    }
  }

  let md = `# Discrepancias de datos — Mundial 2026\n\n`;
  md += `> Generado el ${date} · Fuente: API-Football\n\n`;
  md += `> ⚠ Revisar manualmente. Este archivo **no modifica** ningún squad ni coach.\n\n`;

  const nonClub = discrepancies.filter(d => !d.field.startsWith('club'));
  const clubData = discrepancies.filter(d => d.field.startsWith('club'));

  if (nonClub.length === 0) {
    md += '_Sin discrepancias de nombres encontradas._\n\n';
  } else {
    md += `## Nombres con baja similitud o no encontrados (${nonClub.length})\n\n`;
    md += `| Equipo | # | Campo | Nombre local | Nombre API |\n`;
    md += `|--------|---|-------|--------------|------------|\n`;
    for (const d of nonClub)
      md += `| ${d.team} | ${d.num || 'coach'} | ${d.field} | ${d.local} | ${d.api} |\n`;
    md += '\n';
  }

  if (clubData.length > 0) {
    md += `## Clubs según API-Football (${clubData.length} jugadores con datos)\n\n`;
    md += `> Útil para actualizar el campo \`club\` en los archivos de squad.\n\n`;
    md += `| Equipo | # | Jugador (local) | Club (API) |\n`;
    md += `|--------|---|-----------------|------------|\n`;
    // Cruzar con non-club para tener el nombre local
    for (const d of clubData) {
      const player = nonClub.find(x => x.team === d.team && x.num === d.num);
      md += `| ${d.team} | ${d.num} | ${player?.local ?? '—'} | ${d.api} |\n`;
    }
    md += '\n';
  }

  writeFileSync(DISCREPANCIES_REPORT, md);
  console.log(`\n✅ docs/data-discrepancies.md (${nonClub.length} discrepancias de nombre)`);
}

// ── main ──────────────────────────────────────────────────────────────────────
async function run() {
  const squadFiles = readdirSync(SQUADS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .filter(f => teamFilter.length === 0 || teamFilter.includes(basename(f, '.ts').toUpperCase()));

  if (isReport) { runReport(); return; }

  const coaches = parseCoaches();

  if (isVerifyData) { await runVerifyData(squadFiles, coaches); return; }

  mkdirSync(PUBLIC_PLAYERS, { recursive: true });
  mkdirSync(PUBLIC_COACHES, { recursive: true });

  if (!API_FOOTBALL_KEY) console.log('ℹ API-Football omitida (añade API_FOOTBALL_KEY en .env para mejor cobertura)');
  if (!FOOTBALL_DATA_KEY) console.log('ℹ football-data.org disponible cuando añadas FOOTBALL_DATA_KEY en .env');

  const doPlayer = assetTypeArg === 'player' || assetTypeArg === 'all';
  const doCoach  = assetTypeArg === 'coach'  || assetTypeArg === 'all';
  const stats = { found: 0, skipped: 0, notFound: 0, errors: 0 };

  for (const f of squadFiles) {
    const code = basename(f, '.ts').toUpperCase();
    const content = readFileSync(join(SQUADS_DIR, f), 'utf8');
    const players = parseSquadFile(content);

    if (doPlayer) {
      console.log(`\n▶ ${code} jugadores (${players.length})`);
      mkdirSync(join(PUBLIC_PLAYERS, code), { recursive: true });
      for (const { number, name } of players) {
        const dest = join(PUBLIC_PLAYERS, code, `${number}.webp`);
        if (existsSync(dest) && !isForce) { stats.skipped++; continue; }
        try {
          const url = await resolvePhotoUrl(name);
          if (!url) { stats.notFound++; console.log(`  ? #${number} ${name}`); continue; }
          await downloadAndProcess(url, dest);
          stats.found++;
          console.log(`  ✓ #${number} ${name}`);
        } catch (err) {
          stats.errors++;
          console.error(`  ✗ #${number} ${name}: ${err.message}`);
        }
      }
    }

    if (doCoach) {
      const coachName = coaches[code];
      if (!coachName) { console.log(`\n  ℹ ${code}: sin entrenador en coaches/index.ts`); continue; }
      console.log(`\n▶ ${code} coach: ${coachName}`);
      const dest = join(PUBLIC_COACHES, `${code}.webp`);
      if (existsSync(dest) && !isForce) { stats.skipped++; continue; }
      try {
        const url = await resolvePhotoUrl(coachName);
        if (!url) { stats.notFound++; console.log(`  ? coach no encontrado`); continue; }
        await downloadAndProcess(url, dest);
        stats.found++;
        console.log(`  ✓ coach OK`);
      } catch (err) {
        stats.errors++;
        console.error(`  ✗ coach: ${err.message}`);
      }
    }
  }

  if (doPlayer) { const t = generatePlayerManifest(); console.log(`\n📸 player-photos.ts: ${t} entradas`); }
  if (doCoach)  { const t = generateCoachManifest();  console.log(`📸 coach-photos.ts:  ${t} entradas`); }
  console.log(`\n✅ ${stats.found} descargadas · ⏭ ${stats.skipped} saltadas · ❌ ${stats.notFound} no encontradas · ⚠ ${stats.errors} errores`);
}

run().catch(err => { console.error(err); process.exit(1); });
