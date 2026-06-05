#!/usr/bin/env node
/**
 * test-api-squad.mjs
 * Prueba: obtener squad de España desde API-Football,
 * comparar con datos locales, y descargar fotos de la API.
 *
 * Uso: node scripts/test-api-squad.mjs [--download-photos]
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── .env loader ───────────────────────────────────────────────────────────────
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
const API_KEY = process.env.API_FOOTBALL_KEY ?? ENV.API_FOOTBALL_KEY;
if (!API_KEY) {
  console.error('❌ Falta API_FOOTBALL_KEY en .env');
  process.exit(1);
}

const downloadPhotos = process.argv.includes('--download-photos');

// ── API-Football helpers ──────────────────────────────────────────────────────
const API_BASE = 'https://v3.football.api-sports.io';
const THROTTLE_MS = 6500; // ~10 req/min limit
let lastReq = 0;

async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

async function apiGet(endpoint) {
  await throttle();
  const url = `${API_BASE}${endpoint}`;
  console.log(`  📡 GET ${endpoint}`);
  const resp = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${endpoint}`);
  const json = await resp.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API errors: ${JSON.stringify(json.errors)}`);
  }
  return json;
}

// ── Step 1: Find Spain's team ID ──────────────────────────────────────────────
console.log('\n🔍 Paso 1: Buscar team ID de España en API-Football...');
const teamsResp = await apiGet('/teams?league=1&season=2026');
const allTeams = teamsResp.response;

console.log(`\n📋 Equipos encontrados en la World Cup 2026: ${allTeams.length}`);

// Try to find Spain
const spainEntry = allTeams.find(t =>
  t.team.name.toLowerCase().includes('spain') ||
  t.team.code === 'ESP' ||
  t.team.name.toLowerCase().includes('españa')
);

if (!spainEntry) {
  console.log('\n⚠️  No se encontró "Spain" directamente. Mostrando todos los equipos:');
  for (const t of allTeams) {
    console.log(`  ${t.team.id} | ${t.team.code ?? '???'} | ${t.team.name}`);
  }

  // Export full team ID map for future use
  const teamMap = {};
  for (const t of allTeams) {
    if (t.team.code) teamMap[t.team.code] = t.team.id;
  }
  const mapPath = join(ROOT, 'docs', 'api-football-team-ids.json');
  mkdirSync(join(ROOT, 'docs'), { recursive: true });
  writeFileSync(mapPath, JSON.stringify(teamMap, null, 2));
  console.log(`\n📁 Mapa de IDs guardado en docs/api-football-team-ids.json`);

  // Try alternative: search by name
  console.log('\n🔍 Buscando "Spain" directamente...');
  const searchResp = await apiGet('/teams?name=Spain');
  if (searchResp.response.length > 0) {
    const team = searchResp.response[0].team;
    console.log(`  ✅ Encontrado: ${team.id} | ${team.name}`);
    await fetchSquad(team.id, team.name);
  } else {
    console.error('❌ No se pudo encontrar España en la API');
    process.exit(1);
  }
} else {
  console.log(`  ✅ España: ID=${spainEntry.team.id} | ${spainEntry.team.name}`);

  // Export full team ID map
  const teamMap = {};
  for (const t of allTeams) {
    if (t.team.code) teamMap[t.team.code] = t.team.id;
  }
  const mapPath = join(ROOT, 'docs', 'api-football-team-ids.json');
  mkdirSync(join(ROOT, 'docs'), { recursive: true });
  writeFileSync(mapPath, JSON.stringify(teamMap, null, 2));
  console.log(`📁 Mapa completo de IDs guardado en docs/api-football-team-ids.json`);

  await fetchSquad(spainEntry.team.id, spainEntry.team.name);
}

// ── Step 2: Fetch squad & compare ─────────────────────────────────────────────
async function fetchSquad(teamId, teamName) {
  console.log(`\n🔍 Paso 2: Obtener squad de ${teamName} (ID: ${teamId})...`);
  const squadResp = await apiGet(`/players/squads?team=${teamId}`);

  if (!squadResp.response || squadResp.response.length === 0) {
    console.error('❌ No se encontró squad');
    return;
  }

  const apiPlayers = squadResp.response[0].players;
  console.log(`\n📋 Jugadores desde API-Football: ${apiPlayers.length}`);
  console.log('─'.repeat(90));
  console.log(`${'#'.padStart(3)} | ${'Nombre'.padEnd(25)} | ${'Posición'.padEnd(12)} | ${'Edad'.padStart(4)} | Foto URL`);
  console.log('─'.repeat(90));

  const posMap = {
    'Goalkeeper': 'GK',
    'Defender': 'DF',
    'Midfielder': 'MF',
    'Attacker': 'FW',
    'Forward': 'FW',
  };

  const apiPlayersMapped = apiPlayers.map(p => ({
    id: p.id,
    number: p.number,
    name: p.name,
    position: posMap[p.position] ?? p.position,
    age: p.age,
    photo: p.photo,
  }));

  for (const p of apiPlayersMapped.sort((a, b) => (a.number ?? 99) - (b.number ?? 99))) {
    const num = p.number != null ? String(p.number).padStart(3) : '  ?';
    console.log(`${num} | ${p.name.padEnd(25)} | ${(p.position ?? '?').padEnd(12)} | ${String(p.age ?? '?').padStart(4)} | ${p.photo ?? '—'}`);
  }

  // ── Compare with local data ───────────────────────────────────────────────
  console.log('\n\n📊 Paso 3: Comparación con datos locales (esp.ts)...');
  const localPath = join(ROOT, 'src', 'data', 'squads', 'esp.ts');
  const localContent = readFileSync(localPath, 'utf8');

  // Parse local squad
  const re = /number:\s*(\d+),\s*name:\s*(['"])(.*?)\2,\s*position:\s*(['"])(.*?)\4,\s*age:\s*(\d+),\s*club:\s*(['"])(.*?)\7/g;
  const localPlayers = [];
  for (const m of localContent.matchAll(re)) {
    localPlayers.push({
      number: +m[1],
      name: m[3],
      position: m[5],
      age: +m[6],
      club: m[8],
    });
  }

  console.log(`\n  Local: ${localPlayers.length} jugadores`);
  console.log(`  API:   ${apiPlayersMapped.length} jugadores`);
  console.log('');

  // Normalize for comparison
  function normalize(s) {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }

  // Match by number
  const matched = [];
  const onlyLocal = [];
  const onlyApi = [];

  for (const local of localPlayers) {
    const apiMatch = apiPlayersMapped.find(a => a.number === local.number);
    if (apiMatch) {
      matched.push({ local, api: apiMatch });
    } else {
      onlyLocal.push(local);
    }
  }

  for (const api of apiPlayersMapped) {
    if (!localPlayers.find(l => l.number === api.number)) {
      onlyApi.push(api);
    }
  }

  // Show differences
  if (matched.length > 0) {
    console.log('  ┌─ Jugadores coincidentes (por dorsal):');
    let diffs = 0;
    for (const { local, api } of matched) {
      const nameDiff = normalize(local.name) !== normalize(api.name);
      const posDiff = local.position !== api.position;
      const ageDiff = local.age !== api.age;
      const hasDiff = nameDiff || posDiff || ageDiff;
      if (hasDiff) diffs++;

      const nameStr = nameDiff
        ? `  ⚠ nombre: "${local.name}" → "${api.name}"`
        : '';
      const posStr = posDiff
        ? `  ⚠ posición: ${local.position} → ${api.position}`
        : '';
      const ageStr = ageDiff
        ? `  ⚠ edad: ${local.age} → ${api.age}`
        : '';

      if (hasDiff) {
        console.log(`  │ #${String(local.number).padStart(2)} ${local.name}${nameStr}${posStr}${ageStr}`);
      }
    }
    if (diffs === 0) {
      console.log('  │ ✅ Todos los campos coinciden (nombre, posición, edad)');
    } else {
      console.log(`  │ ⚠ ${diffs} jugadores con diferencias`);
    }
    console.log('  └');
  }

  if (onlyLocal.length > 0) {
    console.log('\n  ❌ Solo en local (no en API):');
    for (const p of onlyLocal) console.log(`    #${p.number} ${p.name}`);
  }

  if (onlyApi.length > 0) {
    console.log('\n  ➕ Solo en API (no en local):');
    for (const p of onlyApi) console.log(`    #${p.number ?? '?'} ${p.name}`);
  }

  // ── Step 4: Download API photos ─────────────────────────────────────────────
  if (downloadPhotos) {
    console.log('\n\n📸 Paso 4: Descargando fotos de API-Football...');
    const apiPhotosDir = join(ROOT, 'public', 'players', 'ESP_api_test');
    mkdirSync(apiPhotosDir, { recursive: true });

    let downloaded = 0, skipped = 0, errors = 0;

    for (const p of apiPlayersMapped) {
      if (!p.photo || p.number == null) { skipped++; continue; }
      const dest = join(apiPhotosDir, `${p.number}.webp`);

      try {
        const resp = await fetch(p.photo);
        if (!resp.ok) { errors++; console.log(`  ✗ #${p.number} ${p.name}: HTTP ${resp.status}`); continue; }
        const buf = Buffer.from(await resp.arrayBuffer());
        await sharp(buf)
          .resize(300, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(dest);
        downloaded++;
        console.log(`  ✓ #${p.number} ${p.name}`);
      } catch (err) {
        errors++;
        console.error(`  ✗ #${p.number} ${p.name}: ${err.message}`);
      }
    }

    console.log(`\n  📁 Fotos guardadas en public/players/ESP_api_test/`);
    console.log(`  ✅ ${downloaded} descargadas · ⏭ ${skipped} sin foto · ❌ ${errors} errores`);
    console.log(`\n  💡 Compara visualmente con public/players/ESP/ para ver la diferencia de calidad`);
  } else {
    console.log('\n💡 Ejecuta con --download-photos para descargar las fotos de la API y compararlas');
  }

  // ── Generate report ─────────────────────────────────────────────────────────
  console.log('\n\n📝 Generando reporte...');
  const reportPath = join(ROOT, 'docs', 'esp-api-comparison.md');
  mkdirSync(join(ROOT, 'docs'), { recursive: true });

  let md = `# Comparación ESP: Local vs API-Football\n\n`;
  md += `> Generado el ${new Date().toLocaleString('es-ES')}\n\n`;
  md += `## Squad desde API-Football\n\n`;
  md += `| # | Nombre | Posición | Edad | Foto |\n`;
  md += `|---|--------|----------|------|------|\n`;
  for (const p of apiPlayersMapped.sort((a, b) => (a.number ?? 99) - (b.number ?? 99))) {
    md += `| ${p.number ?? '?'} | ${p.name} | ${p.position} | ${p.age ?? '?'} | ${p.photo ? '✅' : '❌'} |\n`;
  }

  md += `\n## Squad local (esp.ts)\n\n`;
  md += `| # | Nombre | Posición | Edad | Club |\n`;
  md += `|---|--------|----------|------|------|\n`;
  for (const p of localPlayers.sort((a, b) => a.number - b.number)) {
    md += `| ${p.number} | ${p.name} | ${p.position} | ${p.age} | ${p.club} |\n`;
  }

  if (matched.length > 0) {
    const diffs = matched.filter(({ local, api }) => {
      return normalize(local.name) !== normalize(api.name) ||
             local.position !== api.position ||
             local.age !== api.age;
    });
    if (diffs.length > 0) {
      md += `\n## Diferencias detectadas\n\n`;
      md += `| # | Campo | Local | API |\n`;
      md += `|---|-------|-------|-----|\n`;
      for (const { local, api } of diffs) {
        if (normalize(local.name) !== normalize(api.name))
          md += `| ${local.number} | nombre | ${local.name} | ${api.name} |\n`;
        if (local.position !== api.position)
          md += `| ${local.number} | posición | ${local.position} | ${api.position} |\n`;
        if (local.age !== api.age)
          md += `| ${local.number} | edad | ${local.age} | ${api.age} |\n`;
      }
    }
  }

  writeFileSync(reportPath, md);
  console.log(`✅ Reporte guardado en docs/esp-api-comparison.md`);
}
