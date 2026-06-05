#!/usr/bin/env node
/**
 * scripts/fetch-guardian-squads.mjs
 *
 * Sincroniza datos y fotos de jugadores del Mundial 2026 con la guía del Guardian:
 * https://www.theguardian.com/football/ng-interactive/2026/jun/04/world-cup-2026-complete-player-guide
 *
 * USO:
 *   node scripts/fetch-guardian-squads.mjs [TEAM...] [--data] [--photos] [--dry-run]
 *
 *   TEAM      Códigos FIFA (ARG, ESP…). Sin args = 48 equipos.
 *   --data    Solo reescribe src/data/squads/<team>.ts (sin fotos)
 *   --photos  Solo descarga fotos (sin tocar los .ts)
 *   Sin flags Ambas fases (datos + fotos)
 *   --dry-run Imprime resumen sin escribir nada
 *
 * FUENTE:
 *   JSON maestro : interactive.guim.co.uk/docsdata/<GUARDIAN_MASTER_ID>.json
 *   JSON equipo  : interactive.guim.co.uk/docsdata/<spreadsheet>.json
 *   Fotos        : media.guim.co.uk/<hash>/<crop>/500.jpg  (URL directa)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT            = join(__dirname, '..');
const SQUADS_DIR      = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_PLAYERS  = join(ROOT, 'public', 'players');
const PLAYER_MANIFEST = join(ROOT, 'src', 'data', 'player-photos.ts');

// ── Guardian API ──────────────────────────────────────────────────────────────
// ID del JSON maestro (48 equipos). Si el Guardian publica un nuevo atom,
// actualizar aquí o pasar GUARDIAN_MASTER_ID=<nuevo-id> como env.
const GUARDIAN_MASTER_ID = process.env.GUARDIAN_MASTER_ID
  ?? '1_ZAfmUkTZ4BvDgvhEGaEruakfu4aWIIjjzXaMAiT1yc';
const GUARDIAN_BASE = 'https://interactive.guim.co.uk/docsdata';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Mapeo nombre Guardian (en inglés) → código FIFA ──────────────────────────
const GUARDIAN_TO_FIFA = {
  // Grupo A
  'mexico': 'MEX', 'south africa': 'RSA',
  'south korea': 'KOR', 'korea republic': 'KOR', 'korea': 'KOR',
  'czechia': 'CZE', 'czech republic': 'CZE',
  // Grupo B
  'canada': 'CAN', 'switzerland': 'SUI', 'qatar': 'QAT',
  'bosnia and herzegovina': 'BIH', 'bosnia': 'BIH', 'bosnia-herzegovina': 'BIH',
  // Grupo C
  'brazil': 'BRA', 'brasil': 'BRA', 'morocco': 'MAR', 'scotland': 'SCO', 'haiti': 'HAI',
  // Grupo D
  'united states': 'USA', 'usa': 'USA', 'united states of america': 'USA',
  'paraguay': 'PAR', 'australia': 'AUS',
  'turkey': 'TUR', 'türkiye': 'TUR', 'turkiye': 'TUR',
  // Grupo E
  'germany': 'GER', 'curaçao': 'CUW', 'curacao': 'CUW',
  "ivory coast": 'CIV', "côte d'ivoire": 'CIV', 'cote divoire': 'CIV',
  'ecuador': 'ECU',
  // Grupo F
  'netherlands': 'NED', 'holland': 'NED', 'japan': 'JPN', 'tunisia': 'TUN', 'sweden': 'SWE',
  // Grupo G
  'belgium': 'BEL', 'egypt': 'EGY', 'iran': 'IRN', 'new zealand': 'NZL',
  // Grupo H
  'spain': 'ESP', 'uruguay': 'URU', 'saudi arabia': 'KSA',
  'cape verde': 'CPV', 'cabo verde': 'CPV',
  // Grupo I
  'france': 'FRA', 'senegal': 'SEN', 'norway': 'NOR', 'iraq': 'IRQ',
  // Grupo J
  'argentina': 'ARG', 'austria': 'AUT', 'algeria': 'ALG', 'jordan': 'JOR',
  // Grupo K
  'portugal': 'POR', 'colombia': 'COL', 'uzbekistan': 'UZB',
  'dr congo': 'COD', 'democratic republic of congo': 'COD',
  'dr of congo': 'COD', 'congo dr': 'COD', 'the democratic republic of the congo': 'COD',
  // Grupo L
  'england': 'ENG', 'croatia': 'CRO', 'ghana': 'GHA', 'panama': 'PAN',
};

// ── Posiciones ────────────────────────────────────────────────────────────────
const POS_MAP = {
  goalkeeper: 'GK', defender: 'DF', midfielder: 'MF', forward: 'FW',
  gk: 'GK', df: 'DF', mf: 'MF', fw: 'FW',
};
const POS_LABEL = { GK: '// Porteros', DF: '// Defensores', MF: '// Volantes', FW: '// Delanteros' };
const POS_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };

// ── CLI ───────────────────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const teamFilter  = new Set(args.filter(a => !a.startsWith('--') && /^[A-Z]{2,3}$/.test(a)));
const flagBioOnly = args.includes('--bio-only');
const flagData    = args.includes('--data');
const flagPhotos  = args.includes('--photos');
const dryRun      = args.includes('--dry-run');
const doData      = flagData  || flagBioOnly || (!flagData && !flagPhotos);
const doPhotos    = flagPhotos || (!flagData && !flagPhotos && !flagBioOnly);

if (doPhotos && !doData && !dryRun) {
  console.warn('⚠ --photos sin --data: los dorsales en disco usarán los del Guardian pero los squads .ts no se actualizarán. Considera ejecutar sin flags para hacer ambas fases juntas.');
}

// ── Throttle ──────────────────────────────────────────────────────────────────
let lastReq = 0;
async function throttle(ms = 350) {
  const elapsed = Date.now() - lastReq;
  if (elapsed < ms) await new Promise(r => setTimeout(r, ms - elapsed));
  lastReq = Date.now();
}

// ── Normalización de nombres + similitud (copiado de fetch-squad-assets.mjs) ─
function normalizeStr(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
function nameSimilarity(a, b) {
  const na = normalizeStr(a), nb = normalizeStr(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return maxLen === 0 ? 1 : 1 - levenshtein(na, nb) / maxLen;
}

// ── Descarga + sharp (copiado de fetch-squad-assets.mjs) ─────────────────────
async function downloadAndProcess(url, dest) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  await sharp(buf).resize(300, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
}

// ── Manifiesto de fotos (copiado de fetch-squad-assets.mjs) ──────────────────
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

/** Extrae el valor de un campo string con comillas simples o dobles (JSON), manejando escapes. */
function extractStr(text, field) {
  // Try single quotes first (existing format)
  let re = new RegExp(`${field}:\\s*'((?:[^'\\\\]|\\\\.)*)'`);
  let m = re.exec(text);
  if (m) return m[1].replace(/\\'/g, "'");

  // Try double quotes (JSON.stringify format)
  re = new RegExp(`${field}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  m = re.exec(text);
  if (m) {
    try {
      return JSON.parse(`"${m[1]}"`);
    } catch {
      return m[1].replace(/\\"/g, '"');
    }
  }
  return null;
}

function parseExistingSquad(filePath) {
  if (!existsSync(filePath)) {
    return { coachName: null, players: [], lineup: { formation: '4-3-3', startingXI: [] } };
  }
  const content = readFileSync(filePath, 'utf8');

  // Entrenador (solo en algunos archivos: `export const coach = '...'`)
  const coachM = content.match(/export const coach\s*=\s*'((?:[^'\\]|\\.)*)'/);
  const coachName = coachM ? coachM[1].replace(/\\'/g, "'") : null;

  // Jugadores: extraer el bloque del array de squad
  const players = [];
  const squadM = content.match(/export const squad[^=]*=\s*\[([\s\S]*?)\];/);
  if (squadM) {
    for (const m of squadM[1].matchAll(/\{([^}]+)\}/g)) {
      const o       = m[1];
      const number  = +(/number:\s*(\d+)/.exec(o)?.[1] ?? '0');
      const name    = extractStr(o, 'name');
      const position = /position:\s*'(\w+)'/.exec(o)?.[1] ?? 'FW';
      const age     = +(/age:\s*(\d+)/.exec(o)?.[1] ?? '0');
      const club    = extractStr(o, 'club') ?? '';
      const captain = /captain:\s*true/.test(o) ? true : undefined;
      const thesportsdbId = extractStr(o, 'thesportsdbId') ?? undefined;
      const photoUrl = extractStr(o, 'photoUrl') ?? undefined;
      const bio     = extractStr(o, 'bio') ?? undefined;
      const caps    = /caps:\s*(\d+)/.exec(o) ? +(/caps:\s*(\d+)/.exec(o)[1]) : undefined;
      const goals   = /goals:\s*(\d+)/.exec(o) ? +(/goals:\s*(\d+)/.exec(o)[1]) : undefined;
      const special = extractStr(o, 'special') ?? undefined;
      if (name) players.push({ number, name, position, age, club, captain, thesportsdbId, photoUrl, bio, caps, goals, special });
    }
  }

  // Lineup
  const formM = content.match(/formation:\s*'([^']+)'/);
  const xiM   = content.match(/startingXI:\s*\[([^\]]+)\]/);
  const formation  = formM?.[1] ?? '4-3-3';
  const startingXI = xiM ? xiM[1].split(',').map(s => +s.trim()).filter(n => n > 0) : [];

  return { coachName, players, lineup: { formation, startingXI } };
}

// ── Calculadora de edad (ref: 2026-06-11) ─────────────────────────────────────
function calcAge(dob) {
  if (!dob) return 0;
  const ref = new Date('2026-06-11');
  const d   = new Date(String(dob).trim());
  if (isNaN(d.getTime())) return 0;
  let age = ref.getFullYear() - d.getFullYear();
  const mo = ref.getMonth() - d.getMonth();
  if (mo < 0 || (mo === 0 && ref.getDate() < d.getDate())) age--;
  return age;
}

// ── Escape para strings dentro del .ts emitido ────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function emitSquadTs(code, players, lineup, coachName) {
  const sorted = [...players].sort(
    (a, b) => (POS_ORDER[a.position] ?? 3) - (POS_ORDER[b.position] ?? 3) || a.number - b.number,
  );

  let out = `import type { Player } from './index';\n\n`;
  if (coachName) out += `export const coach = '${esc(coachName)}';\n`;
  out += `export const squad: Player[] = [\n`;

  let lastPos = '';
  for (const p of sorted) {
    if (p.position !== lastPos) {
      out += `  ${POS_LABEL[p.position] ?? `// ${p.position}`}\n`;
      lastPos = p.position;
    }
    out += `  { number: ${p.number}, name: '${esc(p.name)}', position: '${p.position}', age: ${p.age}, club: '${esc(p.club)}'`;
    if (p.captain)         out += `, captain: true`;
    if (p.thesportsdbId)   out += `, thesportsdbId: '${esc(p.thesportsdbId)}'`;
    if (p.photoUrl)        out += `, photoUrl: '${esc(p.photoUrl)}'`;
    if (p.bio)             out += `, bio: ${JSON.stringify(p.bio)}`;
    if (p.caps !== undefined) out += `, caps: ${p.caps}`;
    if (p.goals !== undefined) out += `, goals: ${p.goals}`;
    if (p.special)         out += `, special: ${JSON.stringify(p.special)}`;
    out += ` },\n`;
  }
  out += `];\n\nexport const lineup = {\n  formation: '${esc(lineup.formation)}',\n  startingXI: [${lineup.startingXI.join(', ')}]\n};\n`;
  return out;
}

// ── Reconciliar startingXI con los nuevos dorsales ────────────────────────────
function reconcileLineup(currentXI, currentPlayers, newPlayers) {
  const msgs = [];
  const newXI = [];
  const used  = new Set();

  for (const d of currentXI) {
    const cur = currentPlayers.find(p => p.number === d);
    if (!cur) { msgs.push(`  ⚠ XI: dorsal ${d} no existe en squad actual`); continue; }

    let best = null, bestSim = 0;
    for (const np of newPlayers) {
      const sim = nameSimilarity(cur.name, np.name);
      if (sim > bestSim) { bestSim = sim; best = np; }
    }

    if (best && bestSim >= 0.6 && !used.has(best.number)) {
      newXI.push(best.number);
      used.add(best.number);
      if (best.number !== d) msgs.push(`  ↩ XI: ${cur.name} ${d}→${best.number}`);
    } else if (best && bestSim >= 0.6) {
      msgs.push(`  ⚠ XI: ${cur.name} dorsal ${best.number} ya ocupado`);
    } else {
      msgs.push(`  ❌ XI: ${cur.name} (${d}) no está en plantilla Guardian — eliminado del XI`);
    }
  }
  return { newXI, msgs };
}

// ── Guardian helpers ──────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} — ${url}`);
  return resp.json();
}

async function fetchMaster() {
  console.log('🌐 Descargando índice del Guardian...');
  const json = await fetchJSON(`${GUARDIAN_BASE}/${GUARDIAN_MASTER_ID}.json`);
  return json.sheets?.Teams ?? [];
}

async function fetchTeamPlayers(spreadsheetId) {
  await throttle(350);
  const json = await fetchJSON(`${GUARDIAN_BASE}/${spreadsheetId}.json`);
  return json.sheets?.Players ?? [];
}

/** Extrae el ID del sheet (maneja tanto IDs sueltos como URLs de Google Sheets). */
function extractSheetId(val) {
  if (!val) return '';
  const m = String(val).match(/\/d\/([A-Za-z0-9_-]{20,})/);
  return m ? m[1] : String(val).trim();
}

// ── Procesar un equipo ────────────────────────────────────────────────────────
async function processTeam(code, rawPlayers) {
  const filePath = join(SQUADS_DIR, `${code.toLowerCase()}.ts`);
  const existing = parseExistingSquad(filePath);

  // Normalizar campos del Guardian
  const gPlayers = rawPlayers
    .filter(p => String(p.name ?? '').trim())
    .map(p => {
      const bioRaw = String(p.bio ?? '').trim();
      const bio = bioRaw ? bioRaw.replace(/<[^>]+>/g, '').trim() : undefined;
      const capsVal = p.caps !== undefined && p.caps !== '' ? +p.caps : undefined;
      const goalsVal = p['goals for country'] !== undefined && p['goals for country'] !== '' ? +p['goals for country'] : undefined;
      const specialVal = String(p['special player? (eg. key player, promising talent, etc) OPTIONAL'] ?? p.special ?? '').trim();
      return {
        number:     +p.number || 0,
        name:       String(p.name ?? '').trim(),
        position:   POS_MAP[String(p.position ?? '').toLowerCase()] ?? 'FW',
        age:        calcAge(p['date of birth'] ?? p.dob),
        club:       String(p.club ?? '').trim(),
        grid_image: String(p.grid_image ?? p['grid image'] ?? '').trim(),
        bio,
        caps:       isNaN(capsVal) ? undefined : capsVal,
        goals:      isNaN(goalsVal) ? undefined : goalsVal,
        special:    specialVal || undefined,
      };
    })
    .filter(p => p.number > 0 && p.name.length > 0);

  if (gPlayers.length < 5) {
    console.log(`  ⚠ ${code}: solo ${gPlayers.length} jugadores en el Guardian — omitido`);
    return { skipped: true };
  }

  let mergedPlayers;
  let newLineup;
  let addedCount = 0;
  let removedCount = 0;

  if (flagBioOnly) {
    // Usar existing.players como base
    mergedPlayers = existing.players.map(ep => {
      let best = null, bestSim = 0;
      for (const gp of gPlayers) {
        const sim = nameSimilarity(ep.name, gp.name);
        if (sim > bestSim) { bestSim = sim; best = gp; }
      }
      const gp = bestSim >= 0.6 ? best : null;
      return {
        number:        ep.number,
        name:          ep.name,
        position:      ep.position,
        age:           ep.age,
        club:          ep.club,
        captain:       ep.captain,
        thesportsdbId: ep.thesportsdbId,
        photoUrl:      ep.photoUrl,
        bio:           gp ? (gp.bio ?? ep.bio) : ep.bio,
        caps:          gp ? (gp.caps !== undefined ? gp.caps : ep.caps) : ep.caps,
        goals:         gp ? (gp.goals !== undefined ? gp.goals : ep.goals) : ep.goals,
        special:       gp ? (gp.special ?? ep.special) : ep.special,
      };
    });
    newLineup = existing.lineup;
    console.log(`📋 ${code} (bio-only) — Squad base: ${existing.players.length} jugadores.`);
  } else {
    // Merge: trasladar captain/thesportsdbId/photoUrl del squad existente cuando coincide el nombre
    mergedPlayers = gPlayers.map(gp => {
      let best = null, bestSim = 0;
      for (const ep of existing.players) {
        const sim = nameSimilarity(gp.name, ep.name);
        if (sim > bestSim) { bestSim = sim; best = ep; }
      }
      const ep = bestSim >= 0.6 ? best : null;
      return {
        number:        gp.number,
        name:          gp.name,
        position:      gp.position,
        age:           gp.age > 0 ? gp.age : (ep?.age ?? 0),
        club:          gp.club || (ep?.club ?? ''),
        captain:       ep?.captain,
        thesportsdbId: ep?.thesportsdbId,
        photoUrl:      ep?.photoUrl,
        bio:           gp.bio ?? ep?.bio,
        caps:          gp.caps !== undefined ? gp.caps : ep?.caps,
        goals:         gp.goals !== undefined ? gp.goals : ep?.goals,
        special:       gp.special ?? ep?.special,
      };
    });

    // Reconciliar XI con los nuevos dorsales
    const { newXI, msgs: xiMsgs } = reconcileLineup(
      existing.lineup.startingXI, existing.players, mergedPlayers,
    );
    newLineup = { formation: existing.lineup.formation, startingXI: newXI };

    // Estadísticas de cambio (por nombre, no por dorsal)
    const trulyNew = mergedPlayers.filter(gp => {
      let best = 0;
      for (const ep of existing.players) {
        const s = nameSimilarity(gp.name, ep.name);
        if (s > best) best = s;
      }
      return best < 0.6;
    });
    const trulyRemoved = existing.players.filter(ep => {
      let best = 0;
      for (const gp of mergedPlayers) {
        const s = nameSimilarity(ep.name, gp.name);
        if (s > best) best = s;
      }
      return best < 0.6;
    });
    addedCount = trulyNew.length;
    removedCount = trulyRemoved.length;
    const numberChanged = mergedPlayers.filter(gp => {
      const ep = existing.players.find(p => nameSimilarity(p.name, gp.name) >= 0.6);
      return ep && ep.number !== gp.number;
    });

    const captain    = mergedPlayers.find(p => p.captain);
    const hadCaptain = existing.players.some(p => p.captain);

    console.log(`📋 ${code} — Guardian: ${gPlayers.length} jugadores`);
    if (trulyNew.length)     console.log(`  ✚ Nuevos (${trulyNew.length}): ${trulyNew.slice(0,5).map(p=>`${p.name} #${p.number}`).join(', ')}${trulyNew.length>5?'…':''}`);
    if (trulyRemoved.length) console.log(`  ✖ Eliminados (${trulyRemoved.length}): ${trulyRemoved.slice(0,5).map(p=>`${p.name} #${p.number}`).join(', ')}${trulyRemoved.length>5?'…':''}`);
    if (numberChanged.length) {
      const changes = numberChanged.slice(0,5).map(gp => {
        const ep = existing.players.find(p => nameSimilarity(p.name, gp.name) >= 0.6);
        return `${gp.name.split(' ').pop()} ${ep?.number}→${gp.number}`;
      });
      console.log(`  ↔ Dorsales cambiados (${numberChanged.length}): ${changes.join(', ')}${numberChanged.length>5?'…':''}`);
    }
    if (hadCaptain && !captain)    console.log(`  ⚠ Capitán no encontrado en la nueva plantilla`);
    for (const msg of xiMsgs)      console.log(msg);
  }

  // ── Fase de datos ──────────────────────────────────────────────────────────
  if (doData) {
    if (!dryRun) {
      writeFileSync(filePath, emitSquadTs(code, mergedPlayers, newLineup, existing.coachName), 'utf8');
      console.log(`  ✅ Datos escritos → src/data/squads/${code.toLowerCase()}.ts`);
    } else {
      console.log(`  [dry-run] escribiría src/data/squads/${code.toLowerCase()}.ts`);
    }
  }

  // ── Fase de fotos ──────────────────────────────────────────────────────────
  let photoOk = 0, photoKept = 0, photoFail = 0;
  if (doPhotos) {
    const dir = join(PUBLIC_PLAYERS, code);
    if (!dryRun) mkdirSync(dir, { recursive: true });

    for (const gp of gPlayers) {
      if (!gp.grid_image) { photoFail++; continue; }
      const dest = join(dir, `${gp.number}.webp`);
      if (dryRun) { photoOk++; continue; }

      await throttle(300);
      try {
        await downloadAndProcess(gp.grid_image, dest);
        photoOk++;
      } catch (e) {
        if (existsSync(dest)) { photoKept++; }
        else { photoFail++; console.log(`    ⚠ ${gp.name} #${gp.number}: ${e.message}`); }
      }
    }

    const tag = dryRun ? '[dry-run] descargaría' : '📸';
    const summary = [`${photoOk} descargadas`];
    if (photoKept) summary.push(`${photoKept} conservadas`);
    if (photoFail) summary.push(`❌ ${photoFail} fallidas`);
    console.log(`  ${tag} ${summary.join(', ')}`);
  }

  return { ok: true, count: gPlayers.length, added: addedCount, removed: removedCount };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🌍 fetch-guardian-squads  doData=${doData}  doPhotos=${doPhotos}  dryRun=${dryRun}`);
  if (teamFilter.size) console.log(`   Equipos filtrados: ${[...teamFilter].join(', ')}`);
  if (dryRun) console.log('   ⚡ DRY-RUN activo — no se escribirá ningún archivo\n');

  const masterTeams = await fetchMaster();
  if (!masterTeams.length) {
    console.error('❌ Sin datos en el JSON maestro del Guardian');
    process.exit(1);
  }
  console.log(`✓ Índice: ${masterTeams.length} equipos\n`);

  // Resolver cola de equipos
  const queue = [];
  const unmapped = [];
  for (const t of masterTeams) {
    const guardianName = String(t.Team ?? t.team ?? '').trim();
    const code = GUARDIAN_TO_FIFA[guardianName.toLowerCase()];
    if (!code) { unmapped.push(guardianName); continue; }
    if (teamFilter.size && !teamFilter.has(code)) continue;
    const spreadsheet = extractSheetId(t.spreadsheet);
    if (!spreadsheet) { console.warn(`  ⚠ ${code}: sin spreadsheet ID`); continue; }
    queue.push({ code, spreadsheet });
  }
  if (unmapped.length) console.warn(`⚠ Sin mapeo FIFA: ${unmapped.join(', ')}`);

  if (!queue.length) {
    console.error('❌ Ningún equipo a procesar. Verifica los códigos FIFA.');
    process.exit(1);
  }
  console.log(`Equipos en cola (${queue.length}): ${queue.map(t => t.code).join(', ')}\n`);

  let totalOk = 0, totalSkipped = 0;
  for (const { code, spreadsheet } of queue) {
    console.log(`\n── ${code} ${'─'.repeat(Math.max(1, 40 - code.length))}`);
    try {
      const players = await fetchTeamPlayers(spreadsheet);
      const result  = await processTeam(code, players);
      if (result.ok) totalOk++;
      else totalSkipped++;
    } catch (e) {
      console.error(`  ❌ Error procesando ${code}: ${e.message}`);
      totalSkipped++;
    }
  }

  // Regenerar manifiesto al final (una pasada completa sobre disco)
  if (doPhotos && !dryRun) {
    const total = generatePlayerManifest();
    console.log(`\n✅ Manifiesto regenerado: ${total} fotos en src/data/player-photos.ts`);
  }

  console.log(`\n🏁 Completado: ${totalOk} equipos OK, ${totalSkipped} omitidos${dryRun ? ' (dry-run — sin cambios en disco)' : ''}`);
}

run().catch(e => { console.error(e); process.exit(1); });
