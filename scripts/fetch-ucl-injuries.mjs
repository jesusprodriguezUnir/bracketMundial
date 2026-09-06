#!/usr/bin/env node
/**
 * scripts/fetch-ucl-injuries.mjs
 *
 * Ingesta de partes médicos (lesionados, dudas, disponibles), jugadores sancionados
 * y noticias médicas de la Champions League desde el ecosistema Predicted11 / FútbolFantasy.
 *
 * USO:
 *   node scripts/fetch-ucl-injuries.mjs [opciones]
 *
 * EJEMPLOS:
 *   node scripts/fetch-ucl-injuries.mjs              # Actualiza src/data/player-status.json
 *   node scripts/fetch-ucl-injuries.mjs --dry-run    # Muestra los partes detectados sin guardar
 *   node scripts/fetch-ucl-injuries.mjs --report     # Imprime tabla resumen por club
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_JSON = join(ROOT, 'src', 'data', 'player-status.json');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const CLUB_NAME_MAP = {
  'arsenal': 'ARS',
  'aston villa': 'AVL',
  'atletico': 'ATL',
  'atlético': 'ATL',
  'barcelona': 'BAR',
  'bayern': 'BAY',
  'bayern munich': 'BAY',
  'betis': 'BET',
  'b. dortmund': 'BVB',
  'borussia dortmund': 'BVB',
  'dortmund': 'BVB',
  'bodo/glimt': 'BOD',
  'bodø/glimt': 'BOD',
  'brujas': 'BRU',
  'como': 'COM',
  'fenerbahce': 'FEN',
  'fenerbahçe': 'FEN',
  'feyenoord': 'FEY',
  'galatasaray': 'GAL',
  'inter': 'INT',
  'lask': 'LSK',
  'lens': 'RCL',
  'lille': 'LIL',
  'liverpool': 'LIV',
  'man city': 'MCI',
  'manchester city': 'MCI',
  'man united': 'MUN',
  'manchester united': 'MUN',
  'napoli': 'NAP',
  'napoles': 'NAP',
  'nápoles': 'NAP',
  'porto': 'FCP',
  'psg': 'PSG',
  'paris saint-germain': 'PSG',
  'psv': 'PSV',
  'rb leipzig': 'RBL',
  'leipzig': 'RBL',
  'real madrid': 'RMA',
  'roma': 'ROM',
  'sabah': 'SAB',
  'shakhtar': 'SHK',
  'shakhtar donetsk': 'SHK',
  'slavia praga': 'SLP',
  'slo. bratislava': 'SLO',
  'slovan bratislava': 'SLO',
  'sporting cp': 'SPO',
  'stuttgart': 'VFB',
  'viking': 'VIK',
  'villarreal': 'VIL',
  'aek': 'AEK',
  'aek atenas': 'AEK',
};

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

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

function resolveClubCode(clubRawName) {
  const norm = normalize(clubRawName);
  if (CLUB_NAME_MAP[norm]) return CLUB_NAME_MAP[norm];
  for (const [key, code] of Object.entries(CLUB_NAME_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return code;
    }
  }
  return null;
}

/**
 * Parsea los bloques de lesionados desde el HTML de FutbolFantasy.
 */
function parseInjuries(html) {
  const conditions = [];

  // Cada equipo tiene un <section class="mod lesionados ...">
  const sectionRegex = /<section[^>]*class="[^"]*mod lesionados[^"]*"[^>]*>([\s\S]*?)<\/section>/gi;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const sectionContent = sectionMatch[1];

    const titleMatch = sectionContent.match(/<header[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/header>/i);
    if (!titleMatch) continue;

    // Extraer nombre del club limpiando tags como <img>
    const clubRaw = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    const teamId = resolveClubCode(clubRaw);
    if (!teamId) continue;

    // Buscar cada elemento de jugador
    const elementRegex = /<div[^>]*class="[^"]*elemento lesionado[^"]*"[^>]*>([\s\S]*?)(?=(?:<div[^>]*class="[^"]*elemento lesionado[^"]*"|$))/gi;
    let elementMatch;

    while ((elementMatch = elementRegex.exec(sectionContent)) !== null) {
      const elHtml = elementMatch[1];

      // Nombre del jugador
      const playerMatch = elHtml.match(/<a[^>]*class="[^"]*jugador[^"]*"[^>]*>([^<]+)<\/a>/i);
      if (!playerMatch) continue;
      const playerName = playerMatch[1].trim();

      // Diagnóstico / lesión
      const lesionMatch = elHtml.match(/<span class="lesion">([^<]+)<\/span>/i);
      const diagnosis = lesionMatch ? lesionMatch[1].trim() : 'Molestias físicas';

      // Duración / fecha
      const durationMatch = elHtml.match(/Desde\s*([^(<]+)/i);
      const duration = durationMatch ? `Desde ${durationMatch[1].trim()}` : undefined;

      // Probabilidad
      const probMatch = elHtml.match(/<span class="prob-[^"]*">([^<]+)<\/span>/i);
      const probability = probMatch ? probMatch[1].trim() : undefined;

      // Gravedad / Estado
      let status = 'injured';
      if (elHtml.includes('gravedad-2') || elHtml.includes('disponible_box_min')) {
        status = 'available';
      } else if (elHtml.includes('gravedad-1') || elHtml.includes('duda_box_min')) {
        status = 'doubt';
      }

      // Noticia asociada si existe
      let newsUrl;
      let newsTitle;
      const newsMatch = elHtml.match(/<a[^>]*href="([^"]*noticias[^"]*)"[^>]*>/i);
      if (newsMatch) {
        newsUrl = newsMatch[1];
        const titleAttrMatch = elHtml.match(/title="([^"]*)"/i);
        newsTitle = titleAttrMatch ? titleAttrMatch[1] : undefined;
      }

      const id = `${normalize(playerName).replace(/\s+/g, '-')}-${teamId.toLowerCase()}`;

      conditions.push({
        id,
        playerName,
        normalizedName: normalize(playerName),
        teamId,
        status,
        diagnosis,
        duration,
        probability,
        newsUrl,
        newsTitle,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  return conditions;
}

/**
 * Parsea los sancionados desde /champions/sancionados.
 */
function parseSuspensions(html) {
  const suspensions = [];
  const sectionRegex = /<section[^>]*class="[^"]*mod lesionados[^"]*"[^>]*>([\s\S]*?)<\/section>/gi;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const sectionContent = sectionMatch[1];
    const titleMatch = sectionContent.match(/<header[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/header>/i);
    if (!titleMatch) continue;

    const clubRaw = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    const teamId = resolveClubCode(clubRaw);
    if (!teamId) continue;

    const elementRegex = /<div[^>]*class="[^"]*elemento lesionado[^"]*"[^>]*>([\s\S]*?)(?=(?:<div[^>]*class="[^"]*elemento lesionado[^"]*"|$))/gi;
    let elementMatch;

    while ((elementMatch = elementRegex.exec(sectionContent)) !== null) {
      const elHtml = elementMatch[1];
      const playerMatch = elHtml.match(/<a[^>]*class="[^"]*jugador[^"]*"[^>]*>([^<]+)<\/a>/i);
      if (!playerMatch) continue;
      const playerName = playerMatch[1].trim();

      const lesionMatch = elHtml.match(/<span class="lesion">([^<]+)<\/span>/i);
      const diagnosis = lesionMatch ? lesionMatch[1].trim() : 'Sanción disciplinaria';

      const id = `${normalize(playerName).replace(/\s+/g, '-')}-${teamId.toLowerCase()}`;

      suspensions.push({
        id,
        playerName,
        normalizedName: normalize(playerName),
        teamId,
        status: 'suspended',
        diagnosis,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  return suspensions;
}

/**
 * Cruza con las plantillas locales para asignar playerNumber exacto.
 */
function attachPlayerNumbers(conditions) {
  for (const cond of conditions) {
    const squadFile = join(SQUADS_DIR, `${cond.teamId.toLowerCase()}.ts`);
    if (!existsSync(squadFile)) continue;

    const content = readFileSync(squadFile, 'utf8');
    const squadRegex = /\{\s*number:\s*(\d+),\s*name:\s*['"]([^'"]+)['"]/g;
    let m;
    const lastName = cond.normalizedName.split(/\s+/).at(-1);

    while ((m = squadRegex.exec(content)) !== null) {
      const num = parseInt(m[1], 10);
      const name = m[2];
      const normName = normalize(name);

      if (normName === cond.normalizedName || normName.includes(lastName) || cond.normalizedName.includes(normName)) {
        cond.playerNumber = num;
        break;
      }
    }
  }
}

// ── Ejecución Principal ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('\n🏥 ========================================================');
  console.log('   ESTADO DE JUGADORES UCL 2026/27 (LESIONADOS / SANCIONADOS)');
  console.log('========================================================\n');

  console.log('📡 Descargando partes médicos de Champions League...');
  let injuryHtml = '';
  try {
    injuryHtml = await fetchHtml('https://www.futbolfantasy.com/champions/lesionados');
  } catch (err) {
    console.error('❌ Error al consultar /champions/lesionados:', err.message);
  }

  console.log('📡 Descargando jugadores sancionados...');
  let suspensionHtml = '';
  try {
    suspensionHtml = await fetchHtml('https://www.futbolfantasy.com/champions/sancionados');
  } catch (err) {
    console.warn('⚠️ No se pudo consultar /champions/sancionados:', err.message);
  }

  const injuries = injuryHtml ? parseInjuries(injuryHtml) : [];
  const suspensions = suspensionHtml ? parseSuspensions(suspensionHtml) : [];

  // Combinar evitando duplicados
  const combined = [...injuries];
  for (const s of suspensions) {
    const existingIdx = combined.findIndex(c => c.id === s.id);
    if (existingIdx >= 0) {
      combined[existingIdx].status = 'suspended';
      combined[existingIdx].diagnosis = s.diagnosis;
    } else {
      combined.push(s);
    }
  }

  attachPlayerNumbers(combined);

  console.log(`\n📋 Registros encontrados: ${combined.length}`);
  const byStatus = { injured: 0, doubt: 0, suspended: 0, available: 0 };
  combined.forEach(c => byStatus[c.status] = (byStatus[c.status] || 0) + 1);
  console.log(`   - 🚑 Bajas médicas: ${byStatus.injured}`);
  console.log(`   - ⚠️  Dudas: ${byStatus.doubt}`);
  console.log(`   - 🟥 Sancionados: ${byStatus.suspended}`);
  console.log(`   - 🟢 Disponibles recientes: ${byStatus.available}\n`);

  console.log('Detalle de jugadores:');
  for (const c of combined) {
    const icon = c.status === 'injured' ? '🚑' : c.status === 'doubt' ? '⚠️ ' : c.status === 'suspended' ? '🟥' : '🟢';
    console.log(`  ${icon} [${c.teamId}] ${c.playerName} (#${c.playerNumber || '?'}) - ${c.diagnosis} (${c.probability || c.duration || ''})`);
  }

  if (!isDryRun && combined.length > 0) {
    const outputData = {
      updatedAt: new Date().toISOString(),
      matchday: 1,
      competition: 'UCL',
      conditions: combined,
    };
    writeFileSync(OUTPUT_JSON, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`\n💾 Archivo guardado con éxito: ${OUTPUT_JSON}`);
  }

  console.log('\n========================================================\n');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
