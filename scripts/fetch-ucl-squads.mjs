#!/usr/bin/env node
/**
 * scripts/fetch-ucl-squads.mjs
 *
 * Ingesta de plantillas, fotos, entrenadores y escudos para los 36 clubes
 * de la UEFA Champions League 2026/27 directamente desde la web oficial de UEFA.com.
 *
 * USO:
 *   node scripts/fetch-ucl-squads.mjs [CLUB...] [opciones]
 *
 * EJEMPLOS:
 *   node scripts/fetch-ucl-squads.mjs                  # Procesa los 36 clubes (data + fotos + escudos)
 *   node scripts/fetch-ucl-squads.mjs RMA BAR          # Solo Real Madrid y Barcelona
 *   node scripts/fetch-ucl-squads.mjs --data           # Solo actualiza archivos .ts de squads y coaches
 *   node scripts/fetch-ucl-squads.mjs --photos         # Solo descarga fotos de jugadores y técnicos
 *   node scripts/fetch-ucl-squads.mjs --crests         # Solo descarga escudos oficiales desde UEFA CDN
 *   node scripts/fetch-ucl-squads.mjs --report         # Genera reporte docs/missing-assets.md sin descargar
 *   node scripts/fetch-ucl-squads.mjs --force          # Fuerza re-descarga de fotos existentes
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const COACHES_FILE = join(ROOT, 'src', 'data', 'coaches', 'index.ts');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const PUBLIC_COACHES = join(ROOT, 'public', 'coaches');
const PUBLIC_CRESTS = join(ROOT, 'public', 'assets', 'crests');
const PLAYER_MANIFEST = join(ROOT, 'src', 'data', 'player-photos.ts');
const COACH_MANIFEST = join(ROOT, 'src', 'data', 'coach-photos.ts');
const SQUADS_INDEX = join(ROOT, 'src', 'data', 'squads', 'index.ts');
const DOCS_DIR = join(ROOT, 'docs');
const MISSING_REPORT = join(DOCS_DIR, 'missing-assets.md');

// ── Diccionario Maestro de los 36 Clubes UCL en UEFA.com ─────────────────────
export const UEFA_CLUBS = {
  BVB: { id: 52758, slug: 'b-dortmund', name: 'Borussia Dortmund', country: 'Alemania', flag: '🇩🇪' },
  BAY: { id: 50037, slug: 'bayern-munchen', name: 'FC Bayern München', country: 'Alemania', flag: '🇩🇪' },
  VFB: { id: 50107, slug: 'stuttgart', name: 'VfB Stuttgart', country: 'Alemania', flag: '🇩🇪' },
  ARS: { id: 52280, slug: 'arsenal', name: 'Arsenal FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  AVL: { id: 52683, slug: 'aston-villa', name: 'Aston Villa FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  LIV: { id: 7889, slug: 'liverpool', name: 'Liverpool FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  MCI: { id: 52919, slug: 'man-city', name: 'Manchester City FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  MUN: { id: 52682, slug: 'man-utd', name: 'Manchester United FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  ATL: { id: 50124, slug: 'atleti', name: 'Club Atlético de Madrid', country: 'España', flag: '🇪🇸' },
  BAR: { id: 50080, slug: 'barcelona', name: 'FC Barcelona', country: 'España', flag: '🇪🇸' },
  RMA: { id: 50051, slug: 'real-madrid', name: 'Real Madrid CF', country: 'España', flag: '🇪🇸' },
  BET: { id: 52265, slug: 'real-betis', name: 'Real Betis Balompié', country: 'España', flag: '🇪🇸' },
  VIL: { id: 70691, slug: 'villarreal', name: 'Villarreal CF', country: 'España', flag: '🇪🇸' },
  ROM: { id: 50137, slug: 'roma', name: 'AS Roma', country: 'Italia', flag: '🇮🇹' },
  INT: { id: 50138, slug: 'inter', name: 'FC Internazionale Milano', country: 'Italia', flag: '🇮🇹' },
  NAP: { id: 50136, slug: 'napoli', name: 'SSC Napoli', country: 'Italia', flag: '🇮🇹' },
  SPO: { id: 50149, slug: 'sporting-cp', name: 'Sporting Clube de Portugal', country: 'Portugal', flag: '🇵🇹' },
  FCP: { id: 50064, slug: 'porto', name: 'FC Porto', country: 'Portugal', flag: '🇵🇹' },
  LIL: { id: 75797, slug: 'lille', name: 'Lille OSC', country: 'Francia', flag: '🇫🇷' },
  PSG: { id: 52747, slug: 'paris', name: 'Paris Saint-Germain FC', country: 'Francia', flag: '🇫🇷' },
  RCL: { id: 52277, slug: 'lens', name: 'Racing Club de Lens', country: 'Francia', flag: '🇫🇷' },
  GAL: { id: 50067, slug: 'galatasaray', name: 'Galatasaray SK', country: 'Turquía', flag: '🇹🇷' },
  FEN: { id: 52692, slug: 'fenerbahce', name: 'Fenerbahçe SK', country: 'Turquía', flag: '🇹🇷' },
  PSV: { id: 50062, slug: 'psv', name: 'PSV Eindhoven', country: 'Países Bajos', flag: '🇳🇱' },
  FEY: { id: 52749, slug: 'feyenoord', name: 'Feyenoord Rotterdam', country: 'Países Bajos', flag: '🇳🇱' },
  RBL: { id: 2603790, slug: 'leipzig', name: 'RB Leipzig', country: 'Alemania', flag: '🇩🇪' },
  BRU: { id: 50043, slug: 'club-brugge', name: 'Club Brugge KV', country: 'Bélgica', flag: '🇧🇪' },
  SLP: { id: 52498, slug: 'slavia-praha', name: 'SK Slavia Praha', country: 'República Checa', flag: '🇨🇿' },
  SHK: { id: 52707, slug: 'shakhtar', name: 'FK Shakhtar Donetsk', country: 'Ucrania', flag: '🇺🇦' },
  AEK: { id: 50129, slug: 'aek-athens', name: 'PAE AEK', country: 'Grecia', flag: '🇬🇷' },
  LSK: { id: 63405, slug: 'lask', name: 'LASK Linz', country: 'Austria', flag: '🇦🇹' },
  VIK: { id: 52319, slug: 'viking', name: 'Viking FK', country: 'Noruega', flag: '🇳🇴' },
  BOD: { id: 59333, slug: 'bodo-glimt', name: 'FK Bodø/Glimt', country: 'Noruega', flag: '🇳🇴' },
  COM: { id: 79946, slug: 'como', name: 'Como 1907', country: 'Italia', flag: '🇮🇹' },
  SLO: { id: 52797, slug: 's-bratislava', name: 'ŠK Slovan Bratislava', country: 'Eslovaquia', flag: '🇸🇰' },
  SAB: { id: 2609356, slug: 'sabah', name: 'Sabah FK', country: 'Azerbaiyán', flag: '🇦🇿' },
};

// ── Parseo de Argumentos CLI ──────────────────────────────────────────────────
const rawArgs = process.argv.slice(2);
const flagData = rawArgs.includes('--data');
const flagPhotos = rawArgs.includes('--photos');
const flagCrests = rawArgs.includes('--crests');
const isReport = rawArgs.includes('--report');
const isForce = rawArgs.includes('--force');
const playerFilterRaw = rawArgs.find(a => a.startsWith('--player='))?.split('=')[1]
  ?? (rawArgs.includes('--player') ? rawArgs[rawArgs.indexOf('--player') + 1] : null);
const playerFilter = playerFilterRaw ? parseInt(playerFilterRaw, 10) : null;

const selectedTeams = rawArgs
  .filter(a => !a.startsWith('--'))
  .map(t => t.toUpperCase())
  .filter(t => UEFA_CLUBS[t]);

const teamsToProcess = selectedTeams.length > 0 ? selectedTeams : Object.keys(UEFA_CLUBS);

// Si no se especifica ninguna flag de acción concreta, se ejecutan todas las tareas
const doAll = !flagData && !flagPhotos && !flagCrests && !isReport;
const doData = doAll || flagData;
const doPhotos = doAll || flagPhotos;
const doCrests = doAll || flagCrests;

// ── Throttle & HTTP Helper ────────────────────────────────────────────────────
const THROTTLE_MS = 120;
let lastReq = 0;
async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// ── Fetch & Parseo de Plantilla desde UEFA.com ─────────────────────────────────
async function fetchClubSquadFromUefa(code) {
  const club = UEFA_CLUBS[code];
  if (!club) throw new Error(`Club desconocido: ${code}`);

  const url = `https://es.uefa.com/uefachampionsleague/clubs/${club.id}--${club.slug}/squad/`;
  await throttle();

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} al obtener ${url}`);
  const html = await res.text();

  const sections = html.split(/<h2 class="squadlist--role"[^>]*>/i);
  const players = [];
  let coach = null;

  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const headingEnd = sec.indexOf('</h2>');
    if (headingEnd === -1) continue;
    const roleName = sec.slice(0, headingEnd).trim();
    const content = sec.slice(headingEnd + 5);

    // Entrenador
    if (/coach|entrenador/i.test(roleName)) {
      const nameMatch = content.match(/<span slot="primary"[^>]*>([\s\S]*?)<\/span>/i);
      const countryMatch = content.match(/<div slot="secondary"[^>]*>([\s\S]*?)<\/div>/i);
      const avatarMatch = content.match(/<pk-avatar[^>]+src="([^"]+)"/i);
      const coachIdMatch = avatarMatch ? avatarMatch[1].match(/\/(\d+)\.jpg/) : null;

      if (nameMatch) {
        coach = {
          name: decodeHtmlEntities(nameMatch[1].trim()),
          nationality: countryMatch ? countryMatch[1].trim() : club.country,
          photoUrl: avatarMatch ? avatarMatch[1] : undefined,
          uefaId: coachIdMatch ? coachIdMatch[1] : undefined,
        };
      }
      continue;
    }

    let pos = 'MF';
    if (/goalkeeper|portero/i.test(roleName)) pos = 'GK';
    else if (/defender|defensa/i.test(roleName)) pos = 'DF';
    else if (/midfielder|centrocampista/i.test(roleName)) pos = 'MF';
    else if (/forward|delantero/i.test(roleName)) pos = 'FW';

    const rowRegex = /<pk-table-row class="row--squadlist">([\s\S]*?)<\/pk-table-row>/gi;
    let rm;
    while ((rm = rowRegex.exec(content)) !== null) {
      const row = rm[1];

      const numMatch = row.match(/itemprop="numberedPosition">\s*(\d+)\s*<\/span>/i);
      if (!numMatch) continue;
      const number = parseInt(numMatch[1], 10);

      const linkMatch = row.match(/<a href="([^"]*\/players\/(\d+)--([^/"]+)\/?)" title="([^"]+)">/i);
      const avatarMatch = row.match(/<pk-avatar[^>]+src="([^"]+)"/i);
      const ageMatch = row.match(/column-key="age"[^>]*>\s*(\d+)\s*<\/pk-table-cell>/i);
      const natMatch = row.match(/column-key="nationality"[^>]*>\s*([A-Za-z]+)\s*<\/pk-table-cell>/i);

      let name = linkMatch ? linkMatch[4].trim() : '';
      if (!name) {
        const nameFallback = row.match(/itemprop="name"[^>]*>([\s\S]*?)<\/span>/i);
        name = nameFallback ? nameFallback[1].trim() : '';
      }
      name = decodeHtmlEntities(name);

      const uefaId = linkMatch ? linkMatch[2] : (avatarMatch ? avatarMatch[1].match(/\/(\d+)\.jpg/)?.[1] : undefined);
      const age = ageMatch ? parseInt(ageMatch[1], 10) : 25;
      const nationality = natMatch ? natMatch[1].trim() : '';
      const photoUrl = avatarMatch ? avatarMatch[1] : undefined;

      players.push({
        number,
        name,
        position: pos,
        age,
        club: club.name,
        nationality,
        uefaId,
        photoUrl,
      });
    }
  }

  // Ordenar jugadores: Porteros, Defensas, Centrocampistas, Delanteros, y por dorsal
  const posWeight = { GK: 0, DF: 1, MF: 2, FW: 3 };
  players.sort((a, b) => {
    if (posWeight[a.position] !== posWeight[b.position]) {
      return posWeight[a.position] - posWeight[b.position];
    }
    return a.number - b.number;
  });

  return { players, coach, club };
}

// ── Generación de Lineup Inicial ───────────────────────────────────────────────
function generateSmartLineup(players) {
  const gks = players.filter(p => p.position === 'GK');
  const dfs = players.filter(p => p.position === 'DF');
  const mfs = players.filter(p => p.position === 'MF');
  const fws = players.filter(p => p.position === 'FW');

  // Elegir 1 GK, 4 DF, 3 MF, 3 FW (o 4-2-3-1 si hay menos delanteros)
  let formation = '4-3-3';
  let chosen = [];

  if (gks.length > 0) chosen.push(gks[0].number);
  chosen.push(...dfs.slice(0, 4).map(p => p.number));

  if (fws.length >= 3 && mfs.length >= 3) {
    formation = '4-3-3';
    chosen.push(...mfs.slice(0, 3).map(p => p.number));
    chosen.push(...fws.slice(0, 3).map(p => p.number));
  } else {
    formation = '4-2-3-1';
    chosen.push(...mfs.slice(0, 5).map(p => p.number));
    if (fws.length > 0) chosen.push(fws[0].number);
  }

  // Si faltan para 11, rellenar con los dorsales disponibles
  if (chosen.length < 11) {
    for (const p of players) {
      if (!chosen.includes(p.number)) chosen.push(p.number);
      if (chosen.length === 11) break;
    }
  }

  return { formation, startingXI: chosen.slice(0, 11) };
}

// ── Escritura del Archivo src/data/squads/{club}.ts ───────────────────────────
function writeSquadModule(code, players, lineup) {
  mkdirSync(SQUADS_DIR, { recursive: true });
  const filePath = join(SQUADS_DIR, `${code.toLowerCase()}.ts`);

  const posHeaders = {
    GK: '// Porteros',
    DF: '// Defensores',
    MF: '// Centrocampistas',
    FW: '// Delanteros',
  };

  let currentPos = '';
  const playerLines = [];

  for (const p of players) {
    if (p.position !== currentPos) {
      currentPos = p.position;
      playerLines.push(`  ${posHeaders[currentPos]}`);
    }
    const safeName = p.name.replace(/'/g, "\\'");
    const safeClub = p.club.replace(/'/g, "\\'");
    const photoProp = p.photoUrl ? `, photoUrl: '${p.photoUrl}'` : '';
    playerLines.push(
      `  { number: ${p.number}, name: '${safeName}', position: '${p.position}', age: ${p.age}, club: '${safeClub}'${photoProp} },`
    );
  }

  const content = `import type { Player, Lineup } from './index';

export const squad: Player[] = [
${playerLines.join('\n')}
];

export const lineup: Lineup = {
  formation: '${lineup.formation}',
  startingXI: [${lineup.startingXI.join(', ')}],
};
`;

  writeFileSync(filePath, content, 'utf8');
}

// ── Actualización de src/data/squads/index.ts ──────────────────────────────────
function updateSquadsIndex() {
  const squadFiles = readdirSync(SQUADS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => basename(f, '.ts').toUpperCase())
    .sort();

  const imports = squadFiles.map(code => 
    `import { squad as ${code}, lineup as ${code}_LINEUP } from './${code.toLowerCase()}';`
  ).join('\n');

  const squadsRecord = squadFiles.map(code => `  ${code},`).join('\n');
  const lineupsRecord = squadFiles.map(code => `  ${code}: ${code}_LINEUP,`).join('\n');

  const content = `export interface Player {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  club: string;
  captain?: boolean;
  thesportsdbId?: string;
  photoUrl?: string;
  bio?: string | { es: string; en: string };
  caps?: number;
  goals?: number;
  special?: string;
}

export interface Lineup {
  formation: string; // e.g. '4-3-3'
  startingXI: number[]; // Player numbers
}

${imports}

export const SQUADS: Record<string, Player[]> = {
${squadsRecord}
};

export const LINEUPS: Record<string, Lineup> = {
${lineupsRecord}
};

export const getSquad = (teamId: string): Player[] => SQUADS[teamId] ?? [];
export const getLineup = (teamId: string): Lineup | null => LINEUPS[teamId] ?? null;
export const OFFICIAL_SQUADS: string[] = Object.keys(SQUADS);
export const isOfficialSquad = (teamId: string): boolean => OFFICIAL_SQUADS.includes(teamId);
`;

  writeFileSync(SQUADS_INDEX, content, 'utf8');
}

// ── Actualización de src/data/coaches/index.ts ─────────────────────────────────
function updateCoachesModule(newCoachesMap) {
  const mergedCoaches = {};

  if (existsSync(COACHES_FILE)) {
    const existing = readFileSync(COACHES_FILE, 'utf8');
    // Parse each team entry: "  TEAM: {\n    name: '...'"
    const blockRe = /^\s*([A-Z0-9]{2,4}):\s*\{([\s\S]*?)\n\s*\},?/gm;
    let m;
    while ((m = blockRe.exec(existing)) !== null) {
      const code = m[1];
      const block = m[2];
      const name = block.match(/name:\s*(['"])(.*?)\1/)?.[2] ?? '';
      const born = block.match(/born:\s*(['"])(.*?)\1/)?.[2] ?? '1975-01-01';
      const nationality = block.match(/nationality:\s*(['"])(.*?)\1/)?.[2] ?? '';
      const photoUrl = block.match(/photoUrl:\s*(['"])(.*?)\1/)?.[2];
      const bioEs = block.match(/es:\s*(['"])(.*?)\1/)?.[2] ?? '';
      const bioEn = block.match(/en:\s*(['"])(.*?)\1/)?.[2] ?? '';
      mergedCoaches[code] = { name, born, nationality, photoUrl, bio: { es: bioEs, en: bioEn } };
    }
  }

  // Merge new coaches
  for (const [code, coach] of Object.entries(newCoachesMap)) {
    mergedCoaches[code] = {
      name: coach.name,
      born: '1975-01-01',
      nationality: coach.nationality || UEFA_CLUBS[code]?.country || '',
      photoUrl: coach.photoUrl,
      bio: {
        es: `Director técnico de ${coach.clubName}. Compitiendo en la UEFA Champions League 2026/27.`,
        en: `Head coach of ${coach.clubName}. Competing in the UEFA Champions League 2026/27.`,
      },
    };
  }

  const lines = [
    `// Coach data for teams and clubs.`,
    `// Indexed by team code (uppercase, same key as SQUADS/LINEUPS).`,
    ``,
    `export interface Coach {`,
    `  name: string;`,
    `  born: string;        // YYYY-MM-DD — age is computed at runtime`,
    `  nationality: string;`,
    `  photoUrl?: string;`,
    `  bio: { es: string; en: string };`,
    `}`,
    ``,
    `export const COACHES: Record<string, Coach> = {`,
  ];

  for (const code of Object.keys(mergedCoaches).sort()) {
    const coach = mergedCoaches[code];
    const safeName = coach.name.replace(/'/g, "\\'");
    const safeNat = coach.nationality.replace(/'/g, "\\'");
    const safeEs = coach.bio.es.replace(/'/g, "\\'");
    const safeEn = coach.bio.en.replace(/'/g, "\\'");
    const photoProp = coach.photoUrl ? `\n    photoUrl: '${coach.photoUrl}',` : '';
    lines.push(`  ${code}: {`);
    lines.push(`    name: '${safeName}',`);
    lines.push(`    born: '${coach.born}',`);
    lines.push(`    nationality: '${safeNat}',${photoProp}`);
    lines.push(`    bio: {`);
    lines.push(`      es: '${safeEs}',`);
    lines.push(`      en: '${safeEn}',`);
    lines.push(`    },`);
    lines.push(`  },`);
  }

  lines.push(`};`);
  lines.push(``);
  lines.push(`export const getCoach = (teamId: string): Coach | null => COACHES[teamId] ?? null;`);
  lines.push(``);

  writeFileSync(COACHES_FILE, lines.join('\n'), 'utf8');
}

// ── Descarga de Imagen y Optimización Sharp ────────────────────────────────────
async function downloadAndOptimize(url, dest) {
  if (existsSync(dest) && !isForce) return false;
  await throttle();

  const candidateUrls = [url];
  // Si es foto oficial de UEFA con año de temporada, probar temporadas anteriores si 2027 da 404
  const yearMatch = url.match(/\/(\d{4})\/324x324\//);
  if (yearMatch) {
    const currentYear = parseInt(yearMatch[1], 10);
    for (let y = currentYear - 1; y >= 2015; y--) {
      candidateUrls.push(url.replace(`/${currentYear}/324x324/`, `/${y}/324x324/`));
    }
  }

  let buffer = null;
  for (const u of candidateUrls) {
    try {
      const resp = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
      });
      if (resp.ok) {
        buffer = Buffer.from(await resp.arrayBuffer());
        break;
      }
    } catch {
      // Probar siguiente candidato
    }
  }

  if (!buffer) {
    throw new Error(`HTTP 404 o no encontrada en ninguna temporada para: ${url}`);
  }

  await sharp(buffer)
    .resize(300, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest);

  return true;
}

// ── Carga de Plantilla Local Existente ──────────────────────────────────────────
function loadSquadFromLocal(code) {
  const squadPath = join(SQUADS_DIR, `${code.toLowerCase()}.ts`);
  if (!existsSync(squadPath)) return null;
  const content = readFileSync(squadPath, 'utf8');
  const players = [];

  const re = /\{\s*number:\s*(\d+),\s*name:\s*'([^']*)',\s*position:\s*'([^']*)',\s*age:\s*(\d+),\s*club:\s*'([^']*)'(?:,\s*photoUrl:\s*'([^']*)')?\s*\}/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    players.push({
      number: parseInt(m[1], 10),
      name: m[2],
      position: m[3],
      age: parseInt(m[4], 10),
      club: m[5],
      photoUrl: m[6],
    });
  }

  let coach = null;
  if (existsSync(COACHES_FILE)) {
    const cContent = readFileSync(COACHES_FILE, 'utf8');
    const codeIdx = cContent.indexOf(`  ${code}: {`);
    if (codeIdx !== -1) {
      const slice = cContent.slice(codeIdx, codeIdx + 600);
      const nameMatch = slice.match(/name:\s*'([^']*)'/);
      const photoMatch = slice.match(/photoUrl:\s*'([^']*)'/);
      if (nameMatch) {
        coach = {
          name: nameMatch[1],
          photoUrl: photoMatch ? photoMatch[1] : undefined,
          clubName: UEFA_CLUBS[code]?.name || code,
        };
      }
    }
  }

  return { players, coach, club: UEFA_CLUBS[code] };
}

// ── Regeneración de Manifiestos ────────────────────────────────────────────────
function generateManifests() {
  // Jugadores
  const playerKeys = [];
  if (existsSync(PUBLIC_PLAYERS)) {
    for (const dir of readdirSync(PUBLIC_PLAYERS, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const teamDir = join(PUBLIC_PLAYERS, dir.name);
      for (const file of readdirSync(teamDir)) {
        if (file.endsWith('.webp')) {
          playerKeys.push(`'${dir.name}-${basename(file, '.webp')}'`);
        }
      }
    }
  }
  playerKeys.sort();
  writeFileSync(
    PLAYER_MANIFEST,
    `// AUTOGENERADO por scripts/fetch-ucl-squads.mjs — no editar a mano\n` +
    `export const PLAYER_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    playerKeys.map(k => `  ${k},`).join('\n') + '\n]);\n',
  );

  // Entrenadores
  const coachKeys = [];
  if (existsSync(PUBLIC_COACHES)) {
    for (const file of readdirSync(PUBLIC_COACHES)) {
      if (file.endsWith('.webp')) {
        coachKeys.push(`'${basename(file, '.webp')}'`);
      }
    }
  }
  coachKeys.sort();
  writeFileSync(
    COACH_MANIFEST,
    `// AUTOGENERADO por scripts/fetch-ucl-squads.mjs — no editar a mano\n` +
    `export const COACH_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    coachKeys.map(k => `  ${k},`).join('\n') + '\n]);\n',
  );

  return { playersCount: playerKeys.length, coachesCount: coachKeys.length };
}

// ── Modo Reporte: docs/missing-assets.md ───────────────────────────────────────
function runReport() {
  mkdirSync(DOCS_DIR, { recursive: true });
  const rows = [];
  let totalPlayers = 0;
  let totalPhotos = 0;
  let totalCoaches = 0;

  for (const [code, club] of Object.entries(UEFA_CLUBS)) {
    const squadPath = join(SQUADS_DIR, `${code.toLowerCase()}.ts`);
    let defCount = 0;
    const playerNums = [];

    if (existsSync(squadPath)) {
      const content = readFileSync(squadPath, 'utf8');
      const re = /number:\s*(\d+)/g;
      let m;
      while ((m = re.exec(content)) !== null) {
        playerNums.push(parseInt(m[1], 10));
      }
      defCount = playerNums.length;
    }

    const teamPlayerDir = join(PUBLIC_PLAYERS, code);
    const havePhotos = existsSync(teamPlayerDir)
      ? new Set(readdirSync(teamPlayerDir).filter(f => f.endsWith('.webp')).map(f => parseInt(basename(f, '.webp'), 10)))
      : new Set();

    const missingNums = playerNums.filter(n => !havePhotos.has(n));
    const coachOk = existsSync(join(PUBLIC_COACHES, `${code}.webp`));
    const crestOk = existsSync(join(PUBLIC_CRESTS, `${code}.png`)) || existsSync(join(PUBLIC_CRESTS, `${code}.svg`));

    totalPlayers += defCount;
    totalPhotos += havePhotos.size;
    if (coachOk) totalCoaches++;

    rows.push({
      code,
      name: club.name,
      defCount,
      haveCount: havePhotos.size,
      missingNums,
      coachOk,
      crestOk,
    });
  }

  const lines = [
    `# Reporte de Activos: UEFA Champions League 2026/27`,
    ``,
    `*Generado automáticamente el ${new Date().toISOString().slice(0, 10)}.*`,
    ``,
    `| Métricas Globales | Total |`,
    `| --- | --- |`,
    `| Clubes | ${Object.keys(UEFA_CLUBS).length} |`,
    `| Jugadores en plantilla | ${totalPlayers} |`,
    `| Fotos de jugadores locales | ${totalPhotos} (${totalPlayers > 0 ? Math.round((totalPhotos / totalPlayers) * 100) : 0}%) |`,
    `| Entrenadores con foto local | ${totalCoaches} / ${Object.keys(UEFA_CLUBS).length} |`,
    ``,
    `---`,
    ``,
    `## Desglose por Club`,
    ``,
    `| Club | Nombre | Jugadores | Con Foto | Faltan | DT | Escudo |`,
    `| --- | --- | --- | --- | --- | --- | --- |`,
  ];

  for (const r of rows) {
    const missingStr = r.missingNums.length > 0 ? `#${r.missingNums.slice(0, 5).join(', #')}${r.missingNums.length > 5 ? '…' : ''}` : '✅';
    lines.push(
      `| **${r.code}** | ${r.name} | ${r.defCount} | ${r.haveCount} | ${missingStr} | ${r.coachOk ? '✅' : '❌'} | ${r.crestOk ? '✅' : '❌'} |`
    );
  }

  writeFileSync(MISSING_REPORT, lines.join('\n'), 'utf8');
  console.log(`\n📄 Reporte generado en: docs/missing-assets.md`);
  console.log(`   Jugadores: ${totalPhotos}/${totalPlayers} fotos | DTs: ${totalCoaches}/${Object.keys(UEFA_CLUBS).length}`);
}

// ── Ejecución Principal ───────────────────────────────────────────────────────
async function main() {
  console.log(`=======================================================`);
  console.log(`🏆 Ingesta UEFA Champions League 2026/27 (UEFA.com)`);
  console.log(`=======================================================`);
  console.log(`Equipos seleccionados: ${teamsToProcess.length} (${teamsToProcess.join(', ')})`);
  console.log(`Modos activos: ${doData ? '[DATA] ' : ''}${doPhotos ? '[PHOTOS] ' : ''}${doCrests ? '[CRESTS] ' : ''}${isReport ? '[REPORT]' : ''}`);

  if (isReport && !doData && !doPhotos && !doCrests) {
    runReport();
    return;
  }

  mkdirSync(PUBLIC_PLAYERS, { recursive: true });
  mkdirSync(PUBLIC_COACHES, { recursive: true });
  mkdirSync(PUBLIC_CRESTS, { recursive: true });

  const allCoaches = {};

  for (const code of teamsToProcess) {
    console.log(`\n⏳ Procesando [${code}] ${UEFA_CLUBS[code].name}...`);

    let squadData = null;
    if (!doData) {
      squadData = loadSquadFromLocal(code);
    }
    if (!squadData) {
      try {
        squadData = await fetchClubSquadFromUefa(code);
      } catch (err) {
        console.error(`❌ Error al consultar UEFA.com para ${code}: ${err.message}`);
        squadData = loadSquadFromLocal(code);
        if (!squadData) continue;
      }
    }

    const { players, coach, club } = squadData;
    console.log(`   ✅ Obtenidos ${players.length} jugadores. DT: ${coach ? coach.name : 'No especificado'}`);

    // 1. Guardar datos (.ts)
    if (doData) {
      const lineup = generateSmartLineup(players);
      writeSquadModule(code, players, lineup);
      console.log(`   📁 Módulo guardado en src/data/squads/${code.toLowerCase()}.ts`);

      if (coach) {
        allCoaches[code] = { ...coach, clubName: club.name };
      }
    }

    // 2. Descargar fotos
    if (doPhotos) {
      const teamPlayersDir = join(PUBLIC_PLAYERS, code);
      mkdirSync(teamPlayersDir, { recursive: true });

      let downloadedCount = 0;
      for (const p of players) {
        if (playerFilter !== null && p.number !== playerFilter) continue;
        if (!p.photoUrl) continue;
        const dest = join(teamPlayersDir, `${p.number}.webp`);
        try {
          const ok = await downloadAndOptimize(p.photoUrl, dest);
          if (ok) downloadedCount++;
        } catch (err) {
          // Ignorar fallo de descarga puntual
        }
      }

      if (downloadedCount > 0) {
        console.log(`   📸 Descargadas ${downloadedCount} fotos nuevas de jugadores.`);
      }

      // Foto de entrenador (solo si no se filtró por jugador específico)
      if (playerFilter === null && coach && coach.photoUrl) {
        const destCoach = join(PUBLIC_COACHES, `${code}.webp`);
        try {
          const ok = await downloadAndOptimize(coach.photoUrl, destCoach);
          if (ok) console.log(`   👔 Foto de entrenador guardada.`);
        } catch (err) {
          // Ignorar fallo puntual
        }
      }
    }

    // 3. Descargar escudo oficial desde UEFA CDN
    if (doCrests) {
      const crestDest = join(PUBLIC_CRESTS, `${code}.png`);
      if (!existsSync(crestDest) || isForce) {
        const crestUrl = `https://img.uefa.com/imgml/TP/teams/logos/240x240/${club.id}.png`;
        try {
          await throttle();
          const r = await fetch(crestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (r.ok) {
            const buf = Buffer.from(await r.arrayBuffer());
            writeFileSync(crestDest, buf);
            console.log(`   🛡️ Escudo oficial guardado en public/assets/crests/${code}.png`);
          }
        } catch {
          // Fallback silencioso
        }
      }
    }
  }

  // Actualizar registros centrales
  if (doData) {
    updateSquadsIndex();
    console.log(`\n📋 Actualizado registro central en src/data/squads/index.ts`);

    if (Object.keys(allCoaches).length > 0) {
      updateCoachesModule(allCoaches);
      console.log(`📋 Actualizado registro central en src/data/coaches/index.ts`);
    }
  }

  // Regenerar manifiestos de fotos
  if (doPhotos) {
    const { playersCount, coachesCount } = generateManifests();
    console.log(`\n📦 Manifiestos actualizados:`);
    console.log(`   - ${playersCount} fotos en src/data/player-photos.ts`);
    console.log(`   - ${coachesCount} fotos en src/data/coach-photos.ts`);
  }

  // Generar reporte final
  runReport();
  console.log(`\n✨ Proceso de Champions League finalizado con éxito.`);
}

import { resolve } from 'node:path';

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
