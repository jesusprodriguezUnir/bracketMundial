#!/usr/bin/env node
/**
 * scripts/fetch-predicted11-lineups.mjs
 *
 * Ingesta de alineaciones probables para los 36 clubes de la UEFA Champions League 2026/27
 * directamente desde Predicted11 (https://www.predicted11.com/es/champions).
 *
 * USO:
 *   node scripts/fetch-predicted11-lineups.mjs [CLUB...] [opciones]
 *
 * EJEMPLOS:
 *   node scripts/fetch-predicted11-lineups.mjs RMA              # Actualiza alineación del Real Madrid
 *   node scripts/fetch-predicted11-lineups.mjs RMA BAR MCI      # Varios clubes seleccionados
 *   node scripts/fetch-predicted11-lineups.mjs --all            # Procesa los 36 clubes
 *   node scripts/fetch-predicted11-lineups.mjs RMA --dry-run    # Muestra el 11 sin modificar archivos
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');

export const UCL_PREDICTED11_CLUBS = {
  RMA: { code: 'RMA', ffId: 15, slug: 'real-madrid', name: 'Real Madrid' },
  BAR: { code: 'BAR', ffId: 3, slug: 'barcelona', name: 'Barcelona' },
  ATL: { code: 'ATL', ffId: 2, slug: 'atletico', name: 'Atlético' },
  BET: { code: 'BET', ffId: 4, slug: 'betis', name: 'Betis' },
  VIL: { code: 'VIL', ffId: 22, slug: 'villarreal', name: 'Villarreal' },
  ARS: { code: 'ARS', ffId: 500, slug: 'arsenal', name: 'Arsenal' },
  AVL: { code: 'AVL', ffId: 621, slug: 'aston-villa', name: 'Aston Villa' },
  LIV: { code: 'LIV', ffId: 563, slug: 'liverpool', name: 'Liverpool' },
  MCI: { code: 'MCI', ffId: 516, slug: 'manchester-city', name: 'Man City' },
  MUN: { code: 'MUN', ffId: 517, slug: 'manchester-united', name: 'Man United' },
  BAY: { code: 'BAY', ffId: 503, slug: 'bayern-munich', name: 'Bayern' },
  BVB: { code: 'BVB', ffId: 539, slug: 'borussia-dortmund', name: 'B. Dortmund' },
  VFB: { code: 'VFB', ffId: 766, slug: 'stuttgart', name: 'Stuttgart' },
  RBL: { code: 'RBL', ffId: 576, slug: 'leipzig', name: 'RB Leipzig' },
  INT: { code: 'INT', ffId: 599, slug: 'inter', name: 'Inter' },
  NAP: { code: 'NAP', ffId: 531, slug: 'napoles', name: 'Napoli' },
  ROM: { code: 'ROM', ffId: 523, slug: 'roma', name: 'Roma' },
  COM: { code: 'COM', ffId: 763, slug: 'como', name: 'Como' },
  PSG: { code: 'PSG', ffId: 520, slug: 'paris-saint-germain', name: 'PSG' },
  LIL: { code: 'LIL', ffId: 628, slug: 'lille', name: 'Lille' },
  RCL: { code: 'RCL', ffId: 732, slug: 'lens', name: 'Lens' },
  PSV: { code: 'PSV', ffId: 521, slug: 'psv', name: 'PSV' },
  FEY: { code: 'FEY', ffId: 575, slug: 'feyenoord', name: 'Feyenoord' },
  FCP: { code: 'FCP', ffId: 522, slug: 'porto', name: 'Porto' },
  SPO: { code: 'SPO', ffId: 535, slug: 'sporting-cp', name: 'Sporting CP' },
  GAL: { code: 'GAL', ffId: 509, slug: 'galatasaray', name: 'Galatasaray' },
  FEN: { code: 'FEN', ffId: 681, slug: 'fenerbahce', name: 'Fenerbahçe' },
  BRU: { code: 'BRU', ffId: 536, slug: 'brujas', name: 'Brujas' },
  SLP: { code: 'SLP', ffId: 618, slug: 'slavia-praga', name: 'Slavia Praga' },
  SHK: { code: 'SHK', ffId: 524, slug: 'shakhtar-donetsk', name: 'Shakhtar' },
  AEK: { code: 'AEK', ffId: 611, slug: 'aek-atenas', name: 'AEK' },
  LSK: { code: 'LSK', ffId: 736, slug: 'lask', name: 'LASK' },
  VIK: { code: 'VIK', ffId: 825, slug: 'viking', name: 'Viking' },
  BOD: { code: 'BOD', ffId: 773, slug: 'bodo-glimt', name: 'Bodø/Glimt' },
  SLO: { code: 'SLO', ffId: 765, slug: 'slovan-bratislava', name: 'Slo. Bratislava' },
  SAB: { code: 'SAB', ffId: 826, slug: 'sabah', name: 'Sabah' },
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Realiza una petición HTTP con reintentos y timeout.
 */
async function fetchHtml(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extrae los jugadores titulares del campo en Predicted11.
 */
function extractLineupFromHtml(html) {
  const players = [];

  // Buscar elementos player-on-field dentro del campo
  const playerRegex = /<div[^>]*class="[^"]*player-on-field[^"]*"[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let match;

  while ((match = playerRegex.exec(html)) !== null) {
    const style = match[1];
    const innerHtml = match[2];

    const altMatch = innerHtml.match(/alt="([^"]*)"/i);
    const nameMatch = innerHtml.match(/<div class="player-on-field-name">([^<]*)<\/div>/i);
    const idMatch = match[0].match(/data-id="(\d+)"/i);

    const fullName = altMatch ? altMatch[1].trim() : '';
    const shortName = nameMatch ? nameMatch[1].trim() : fullName;
    const ffId = idMatch ? idMatch[1] : '';

    // Extraer coordenadas top/left
    const topMatch = style.match(/top:\s*([\d.]+)%/i);
    const leftMatch = style.match(/left:\s*([\d.]+)%/i);
    const top = topMatch ? parseFloat(topMatch[1]) : 50;
    const left = leftMatch ? parseFloat(leftMatch[1]) : 50;

    if (fullName || shortName) {
      players.push({
        fullName,
        shortName,
        ffId,
        top,
        left,
      });
    }
  }

  if (players.length === 11) {
    // 1. Identificar portero: jugador con mayor top (más cercano a la portería propia)
    const sortedByTop = [...players].sort((a, b) => b.top - a.top);
    const gk = sortedByTop[0];
    const field = sortedByTop.slice(1);

    // 2. Clasificar por líneas naturales en campo:
    // Defensas: top >= 53%
    // Centrocampistas: 33% <= top < 53%
    // Delanteros: top < 33%
    let defenders = field.filter(p => p.top >= 53);
    let midfielders = field.filter(p => p.top >= 33 && p.top < 53);
    let forwards = field.filter(p => p.top < 33);

    // Si la detección automática por umbrales no suma 10 o es anómala, usar partición por formación
    if (defenders.length < 3 || defenders.length > 5 || (defenders.length + midfielders.length + forwards.length !== 10)) {
      let counts = [4, 3, 3];
      const tacticMatch = html.match(/<option[^>]*value="([^"]*)"[^>]*selected[^>]*>([^<]*)<\/option>/i);
      if (tacticMatch && /\d-\d/.test(tacticMatch[1])) {
        const parts = tacticMatch[1].split('-').map(n => parseInt(n, 10));
        if (parts.reduce((a, b) => a + b, 0) === 10) {
          counts = parts;
        }
      }
      defenders = field.slice(0, counts[0]);
      midfielders = field.slice(counts[0], counts[0] + (counts[1] || 3));
      forwards = field.slice(counts[0] + (counts[1] || 3));
    }

    // 3. ORDENAR CADA LÍNEA ESTRICTAMENTE DE IZQUIERDA A DERECHA (left creciente):
    // Esto garantiza que:
    // - En la defensa: Lateral Izquierdo (menor left) -> Centrales -> Lateral Derecho (mayor left).
    // - En el mediocampo: Interior Izquierdo -> Medios -> Interior Derecho.
    // - En la delantera: Extremo Izquierdo -> Delantero Centro -> Extremo Derecho.
    defenders.sort((a, b) => a.left - b.left);
    midfielders.sort((a, b) => a.left - b.left);
    forwards.sort((a, b) => a.left - b.left);

    const formation = `${defenders.length}-${midfielders.length}-${forwards.length}`;
    const orderedPlayers = [gk, ...defenders, ...midfielders, ...forwards];

    return { formation, players: orderedPlayers };
  }

  // Fallback si no son 11 jugadores
  players.sort((a, b) => b.top - a.top);
  return { formation: '4-3-3', players };
}

/**
 * Mapea los jugadores extraídos con la plantilla local en TypeScript.
 */
function mapPlayersToSquad(predictedPlayers, squadContent) {
  // Extraer jugadores del archivo .ts: { number: X, name: 'Y', ... }
  const squadPlayers = [];
  const squadRegex = /\{\s*number:\s*(\d+),\s*name:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = squadRegex.exec(squadContent)) !== null) {
    squadPlayers.push({
      number: parseInt(m[1], 10),
      name: m[2],
      normalized: normalize(m[2]),
    });
  }

  const matchedNumbers = [];
  const unmatched = [];

  for (const p of predictedPlayers) {
    const normFull = normalize(p.fullName);
    const normShort = normalize(p.shortName);
    const lastName = normFull.split(/\s+/).at(-1) || normFull;

    let found = squadPlayers.find(sp => sp.normalized === normFull);
    if (!found) {
      found = squadPlayers.find(sp => sp.normalized === normShort);
    }
    if (!found) {
      found = squadPlayers.find(sp => sp.normalized.includes(lastName) || lastName.includes(sp.normalized));
    }
    if (!found) {
      // Coincidencia por palabra clave del apellido
      found = squadPlayers.find(sp => {
        const parts = sp.normalized.split(/\s+/);
        return parts.some(part => part.length >= 4 && (normFull.includes(part) || normShort.includes(part)));
      });
    }

    if (found && !matchedNumbers.includes(found.number)) {
      matchedNumbers.push(found.number);
    } else {
      unmatched.push(p);
    }
  }

  return {
    matchedNumbers,
    unmatched,
    totalSquad: squadPlayers.length,
  };
}

/**
 * Actualiza el bloque lineup en el archivo de squad .ts.
 */
function updateSquadFile(filePath, formation, startingXI) {
  let content = readFileSync(filePath, 'utf8');

  // Buscar bloque export const lineup: Lineup = { ... }
  const lineupRegex = /export const lineup:\s*Lineup\s*=\s*\{[\s\S]*?\};/m;
  const newLineup = `export const lineup: Lineup = {\n  formation: '${formation}',\n  startingXI: [${startingXI.join(', ')}],\n};`;

  if (lineupRegex.test(content)) {
    content = content.replace(lineupRegex, newLineup);
    writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// ── Ejecución Principal ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isAll = args.includes('--all');
  const selectedClubCodes = args
    .filter(a => !a.startsWith('--'))
    .map(a => a.toUpperCase());

  console.log('\n⚽ ========================================================');
  console.log('   PREDICTED11 - ALINEACIONES PROBABLES UCL 2026/27');
  console.log('========================================================\n');

  let targetClubs = Object.values(UCL_PREDICTED11_CLUBS);
  if (!isAll && selectedClubCodes.length > 0) {
    targetClubs = targetClubs.filter(c => selectedClubCodes.includes(c.code));
  }

  if (targetClubs.length === 0) {
    console.log('Uso: node scripts/fetch-predicted11-lineups.mjs [CLUB...] [--all] [--dry-run]');
    console.log('Ejemplo: node scripts/fetch-predicted11-lineups.mjs RMA BAR --dry-run');
    process.exit(0);
  }

  console.log(`Clubes a procesar (${targetClubs.length}): ${targetClubs.map(c => c.code).join(', ')}`);
  if (isDryRun) console.log('Modo: DRY-RUN (no se realizarán cambios en disco)\n');

  const report = [];

  for (const club of targetClubs) {
    const clubFile = join(SQUADS_DIR, `${club.code.toLowerCase()}.ts`);
    if (!existsSync(clubFile)) {
      console.warn(`⚠️  Archivo de plantilla no encontrado: ${clubFile}`);
      continue;
    }

    const squadContent = readFileSync(clubFile, 'utf8');
    const url = `https://www.predicted11.com/es/champions/equipo/${club.slug}`;

    process.stdout.write(`\n🔍 Obteniendo alineación de ${club.name} (${club.code})... `);

    try {
      const html = await fetchHtml(url);
      const { formation, players } = extractLineupFromHtml(html);

      if (players.length === 0) {
        console.log(`❌ Sin alineación detectada en ${url}`);
        continue;
      }

      const { matchedNumbers, unmatched } = mapPlayersToSquad(players, squadContent);

      console.log(`✅ [${formation}] ${matchedNumbers.length}/11 titulares identificados`);
      console.log(`   Titulares: ${players.map(p => p.shortName || p.fullName).join(', ')}`);
      console.log(`   Dorsales asignados: [${matchedNumbers.join(', ')}]`);

      if (unmatched.length > 0) {
        console.log(`   ⚠️  No asignados automáticamente: ${unmatched.map(u => u.fullName).join(', ')}`);
      }

      if (!isDryRun && matchedNumbers.length >= 7) {
        // Completar a 11 si fuera necesario con los primeros del squad existente
        let finalXI = [...matchedNumbers];
        if (finalXI.length < 11) {
          const currentLineupMatch = squadContent.match(/startingXI:\s*\[([\d,\s]+)\]/);
          if (currentLineupMatch) {
            const currentNums = currentLineupMatch[1].split(',').map(n => parseInt(n.trim(), 10));
            for (const n of currentNums) {
              if (finalXI.length < 11 && !finalXI.includes(n)) finalXI.push(n);
            }
          }
        }

        const ok = updateSquadFile(clubFile, formation, finalXI);
        if (ok) {
          console.log(`   💾 Plantilla ${club.code}.ts actualizada correctamente.`);
        }
      }

      report.push({
        code: club.code,
        name: club.name,
        formation,
        titulares: players.map(p => p.shortName).join(', '),
        dorsales: matchedNumbers,
      });

      // Pausa respetuosa para no saturar el servidor
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`❌ Error al procesar ${club.code}: ${err.message}`);
    }
  }

  console.log('\n========================================================');
  console.log(`Proceso completado. ${report.length} equipos procesados.`);
  console.log('========================================================\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
