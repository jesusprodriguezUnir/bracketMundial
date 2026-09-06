#!/usr/bin/env node
/**
 * scripts/fetch-ucl-stadiums.mjs
 *
 * Obtiene, reporta, exporta y descarga fotos de los estadios oficiales
 * y capacidades de todos los clubes de la UEFA Champions League 2026/27.
 *
 * USO:
 *   node scripts/fetch-ucl-stadiums.mjs [CLUB...] [opciones]
 *
 * OPCIONES:
 *   --report        Genera reporte detallado en docs/ucl-stadiums-report.md y consola
 *   --json          Exporta los datos a src/data/ucl-stadiums.json
 *   --photos        Descarga y optimiza las fotos de los estadios en public/assets/stadiums/{clubId}.webp
 *   --force         Fuerza la re-descarga de fotos aunque ya existan
 *   --sort=capacity Ordena por capacidad (descendente por defecto) o por nombre
 *
 * EJEMPLOS:
 *   node scripts/fetch-ucl-stadiums.mjs --report
 *   node scripts/fetch-ucl-stadiums.mjs --photos
 *   node scripts/fetch-ucl-stadiums.mjs RMA BAR --photos --force
 */

import { existsSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs');
const REPORT_FILE = join(DOCS_DIR, 'ucl-stadiums-report.md');
const JSON_OUTPUT = join(ROOT, 'src', 'data', 'ucl-stadiums.json');
const STADIUMS_DIR = join(ROOT, 'public', 'assets', 'stadiums');

export const UCL_STADIUM_ARTICLES = {
  BAR: { title: 'Camp_Nou', name: 'Spotify Camp Nou' },
  BVB: { title: 'Westfalenstadion', name: 'Signal Iduna Park' },
  RMA: { title: 'Santiago_Bernabéu_Stadium', name: 'Estadio Santiago Bernabéu' },
  INT: { title: 'San_Siro', name: 'Stadio San Siro' },
  BAY: { title: 'Allianz_Arena', name: 'Allianz Arena' },
  MUN: { title: 'Old_Trafford', name: 'Old Trafford' },
  ROM: { title: 'Stadio_Olimpico', name: 'Stadio Olimpico' },
  ATL: { title: 'Metropolitano_Stadium', name: 'Riyadh Air Metropolitano' },
  LIV: { title: 'Anfield', name: 'Anfield' },
  BET: { title: 'Benito_Villamarín_Stadium', name: 'Estadio Benito Villamarín' },
  ARS: { title: 'Emirates_Stadium', name: 'Emirates Stadium' },
  VFB: { title: 'MHPArena', name: 'MHPArena' },
  NAP: { title: 'Stadio_Diego_Armando_Maradona', name: 'Stadio Diego Armando Maradona' },
  MCI: { title: 'City_of_Manchester_Stadium', name: 'Etihad Stadium' },
  GAL: { title: 'Rams_Park', name: 'RAMS Park' },
  SHK: { title: 'Volksparkstadion', name: 'Volksparkstadion' },
  FEY: { title: 'De_Kuip', name: 'Stadion Feijenoord (De Kuip)' },
  LIL: { title: 'Stade_Pierre-Mauroy', name: 'Decathlon Arena Pierre-Mauroy' },
  SPO: { title: 'Estádio_José_Alvalade', name: 'Estádio José Alvalade' },
  FCP: { title: 'Estádio_do_Dragão', name: 'Estádio do Dragão' },
  PSG: { title: 'Parc_des_Princes', name: 'Parc des Princes' },
  FEN: { title: 'Şükrü_Saracoğlu_Stadium', name: 'Ülker Stadyumu Şükrü Saracoğlu' },
  RBL: { title: 'Red_Bull_Arena_(Leipzig)', name: 'Red Bull Arena' },
  AVL: { title: 'Villa_Park', name: 'Villa Park' },
  RCL: { title: 'Stade_Bollaert-Delelis', name: 'Stade Bollaert-Delelis' },
  PSV: { title: 'Philips_Stadion', name: 'Philips Stadion' },
  AEK: { title: 'Agia_Sophia_Stadium', name: 'OPAP Arena (Agia Sophia)' },
  BRU: { title: 'Jan_Breydel_Stadium', name: 'Jan Breydelstadion' },
  VIL: { title: 'Estadio_de_la_Cerámica', name: 'Estadio de la Cerámica' },
  SLO: { title: 'Tehelné_pole', name: 'Tehelné pole' },
  SLP: { title: 'Fortuna_Arena', name: 'Fortuna Arena' },
  LSK: { title: 'Raiffeisen_Arena_(Linz)', name: 'Raiffeisen Arena' },
  VIK: { title: 'Viking_Stadion', name: 'SR-Bank Arena' },
  COM: { title: 'Stadio_Giuseppe_Sinigaglia', name: 'Stadio Giuseppe Sinigaglia' },
  SAB: { title: 'Bank_Respublika_Arena', name: 'Bank Respublika Arena' },
  BOD: { title: 'Aspmyra_Stadion', name: 'Aspmyra Stadion' },
};

// Cargar dinámicamente datos de clubes
async function getClubsData() {
  const clubsModule = await import('../src/data/ucl-clubs.ts');
  return clubsModule.UCL_CLUBS_DATA;
}

const args = process.argv.slice(2);
const isReport = args.includes('--report');
const isJson = args.includes('--json');
const isPhotos = args.includes('--photos');
const isForce = args.includes('--force');
const filterClubs = args
  .filter(a => !a.startsWith('--'))
  .map(c => c.toUpperCase());

function cleanThumbUrl(url) {
  if (!url) return null;
  const clean = url.split('?')[0];
  if (clean.includes('/thumb/')) {
    return clean.replace(/\/\d+px-/, '/800px-');
  }
  return clean;
}

async function fetchImageUrl(articleTitle, fallbackQuery) {
  const botHeader = { 'User-Agent': 'BracketMundialBot/1.0 (https://bracketmundial.com; bot@bracketmundial.com)' };

  // 1. Intentar REST API summary en Wikipedia EN
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`;
    const res = await fetch(url, { headers: botHeader });
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail?.source) return cleanThumbUrl(data.thumbnail.source);
      if (data.originalimage?.source) return cleanThumbUrl(data.originalimage.source);
    }
  } catch {}

  // 2. Intentar REST API summary en Wikipedia ES
  try {
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`;
    const res = await fetch(url, { headers: botHeader });
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail?.source) return cleanThumbUrl(data.thumbnail.source);
      if (data.originalimage?.source) return cleanThumbUrl(data.originalimage.source);
    }
  } catch {}

  // 3. Fallback: Búsqueda con generator=search en Wikipedia EN
  try {
    const query = fallbackQuery || articleTitle.replace(/_/g, ' ');
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=800`;
    const res = await fetch(searchUrl, { headers: botHeader });
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const firstPage = Object.values(pages)[0];
        if (firstPage?.thumbnail?.source) return cleanThumbUrl(firstPage.thumbnail.source);
      }
    }
  } catch {}

  // 4. Fallback: Búsqueda en Wikipedia ES
  try {
    const query = fallbackQuery || articleTitle.replace(/_/g, ' ');
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=800`;
    const res = await fetch(searchUrl, { headers: botHeader });
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const firstPage = Object.values(pages)[0];
        if (firstPage?.thumbnail?.source) return cleanThumbUrl(firstPage.thumbnail.source);
      }
    }
  } catch {}

  return null;
}

async function downloadWithRetry(imgUrl, maxRetries = 3) {
  const browserHeaders = {
    'User-Agent': 'BracketMundialBot/1.0 (https://bracketmundial.com; bot@bracketmundial.com)',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  };

  const urlsToTry = [imgUrl];
  if (imgUrl.includes('/800px-')) {
    urlsToTry.push(imgUrl.replace(/\/800px-/, '/400px-'));
    urlsToTry.push(imgUrl.replace(/\/800px-/, '/320px-'));
    urlsToTry.push(imgUrl.replace(/\/thumb\//, '/').replace(/\/[^/]+$/, ''));
  }

  for (const url of urlsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, { headers: browserHeaders });
        if (res.ok) return res;
        if (res.status === 429 && attempt < maxRetries) {
          console.log(`    ⏳ Rate limit (429), reintentando en ${attempt * 2}s...`);
          await new Promise(r => setTimeout(r, attempt * 2000));
          continue;
        }
      } catch {}
    }
  }
  throw new Error(`No se pudo descargar de ${imgUrl}`);
}

async function downloadAndOptimizePhoto(clubId, stadiumName) {
  const outPath = join(STADIUMS_DIR, `${clubId}.webp`);
  if (existsSync(outPath) && !isForce) {
    console.log(`  ✓ ${clubId}: ya existe (${stadiumName})`);
    return true;
  }

  const article = UCL_STADIUM_ARTICLES[clubId] || { title: stadiumName.replace(/\s+/g, '_'), name: stadiumName };
  console.log(`  ⬇️  Descargando foto para ${clubId} (${stadiumName})...`);

  const imgUrl = await fetchImageUrl(article.title, article.name || stadiumName);
  if (!imgUrl) {
    console.warn(`  ⚠️  No se encontró imagen en Wikipedia para ${clubId} (${stadiumName})`);
    return false;
  }

  try {
    const res = await downloadWithRetry(imgUrl);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await sharp(buffer, { failOnError: false })
      .resize({ width: 1280, height: 720, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    const kb = (statSync(outPath).size / 1024).toFixed(0);
    console.log(`  ✅ Guardado: public/assets/stadiums/${clubId}.webp (${kb} KB)`);
    return true;
  } catch (err) {
    console.error(`  ❌ Error al procesar imagen de ${clubId}:`, err.message);
    return false;
  }
}

async function run() {
  const clubsData = await getClubsData();
  const clubIds = Object.keys(clubsData);

  const selectedIds = filterClubs.length > 0
    ? clubIds.filter(id => filterClubs.includes(id))
    : clubIds;

  if (selectedIds.length === 0) {
    console.warn('⚠️ No se encontraron clubes que coincidan con el filtro indicado.');
    return;
  }

  const stadiumsList = selectedIds.map(id => {
    const club = clubsData[id];
    return {
      clubId: club.id,
      clubName: club.name,
      shortName: club.shortName,
      city: club.city,
      country: club.country,
      stadiumName: club.stadium?.name || 'Por confirmar',
      capacity: club.stadium?.capacity || 0,
      image: `/assets/stadiums/${club.id}.webp`,
      colors: club.colors,
    };
  });

  // Ordenar por capacidad descendente
  stadiumsList.sort((a, b) => b.capacity - a.capacity);

  // Modo Descarga de Fotos
  if (isPhotos) {
    console.log('\n=============================================================');
    console.log('📸  DESCARGANDO FOTOS DE ESTADIOS DE CHAMPIONS LEAGUE');
    console.log('=============================================================');
    if (!existsSync(STADIUMS_DIR)) {
      mkdirSync(STADIUMS_DIR, { recursive: true });
    }

    let successCount = 0;
    for (const s of stadiumsList) {
      const ok = await downloadAndOptimizePhoto(s.clubId, s.stadiumName);
      if (ok) successCount++;
      // Pequeña pausa para respetar rate limits de Wikipedia
      await new Promise(r => setTimeout(r, 120));
    }
    console.log(`\n🎉 Fotos procesadas: ${successCount}/${stadiumsList.length} en public/assets/stadiums/`);
  }

  const totalCapacity = stadiumsList.reduce((acc, s) => acc + s.capacity, 0);
  const avgCapacity = Math.round(totalCapacity / (stadiumsList.length || 1));
  const largest = stadiumsList[0];
  const smallest = stadiumsList[stadiumsList.length - 1];

  if (!isPhotos || isReport) {
    console.log('\n=============================================================');
    console.log('🏟️  ESTADIOS Y CAPACIDADES - UEFA CHAMPIONS LEAGUE 2026/27');
    console.log('=============================================================');
    console.log(`Clubes analizados : ${stadiumsList.length}`);
    console.log(`Aforo total       : ${totalCapacity.toLocaleString('es-ES')} espectadores`);
    console.log(`Aforo promedio    : ${avgCapacity.toLocaleString('es-ES')} espectadores`);
    if (largest) console.log(`Mayor capacidad   : ${largest.stadiumName} (${largest.clubName}) - ${largest.capacity.toLocaleString('es-ES')}`);
    if (smallest) console.log(`Menor capacidad   : ${smallest.stadiumName} (${smallest.clubName}) - ${smallest.capacity.toLocaleString('es-ES')}`);
    console.log('-------------------------------------------------------------\n');

    console.table(
      stadiumsList.map((s, idx) => ({
        '#': idx + 1,
        Club: s.shortName,
        Estadio: s.stadiumName,
        Capacidad: s.capacity.toLocaleString('es-ES'),
        Ciudad: s.city,
        País: s.country,
      }))
    );
  }

  // Exportar JSON si fue solicitado o por defecto si no es solo reporte
  if (isJson || (!isReport && !isPhotos)) {
    writeFileSync(JSON_OUTPUT, JSON.stringify(stadiumsList, null, 2), 'utf8');
    console.log(`\n💾 Archivo JSON generado en: src/data/ucl-stadiums.json`);
  }

  // Generar reporte Markdown si se solicitó
  if (isReport) {
    if (!existsSync(DOCS_DIR)) {
      mkdirSync(DOCS_DIR, { recursive: true });
    }

    let md = `# Reporte de Estadios y Capacidades — UEFA Champions League 2026/27\n\n`;
    md += `> Generado automáticamente el **${new Date().toISOString().split('T')[0]}** por \`scripts/fetch-ucl-stadiums.mjs\`.\n\n`;
    md += `## Resumen Global\n\n`;
    md += `- **Clubes participantes**: ${stadiumsList.length}\n`;
    md += `- **Capacidad total acumulada**: ${totalCapacity.toLocaleString('es-ES')} espectadores\n`;
    md += `- **Capacidad promedio por estadio**: ${avgCapacity.toLocaleString('es-ES')} espectadores\n`;
    if (largest) md += `- **Estadio con mayor aforo**: **${largest.stadiumName}** (${largest.clubName}) con **${largest.capacity.toLocaleString('es-ES')}** espectadores\n`;
    if (smallest) md += `- **Estadio con menor aforo**: **${smallest.stadiumName}** (${smallest.clubName}) con **${smallest.capacity.toLocaleString('es-ES')}** espectadores\n\n`;

    md += `## Listado Completo Ordenado por Capacidad\n\n`;
    md += `| # | Club | Estadio | Capacidad | Ciudad | País | Foto |\n`;
    md += `|---|---|---|---|---|---|---|\n`;

    stadiumsList.forEach((s, idx) => {
      const hasPhoto = existsSync(join(STADIUMS_DIR, `${s.clubId}.webp`)) ? '✓ Sí' : '—';
      md += `| ${idx + 1} | **${s.clubName}** (${s.clubId}) | ${s.stadiumName} | ${s.capacity.toLocaleString('es-ES')} | ${s.city} | ${s.country} | ${hasPhoto} |\n`;
    });

    writeFileSync(REPORT_FILE, md, 'utf8');
    console.log(`📄 Reporte Markdown guardado en: docs/ucl-stadiums-report.md\n`);
  }
}

run().catch(err => {
  console.error('❌ Error al procesar estadios:', err);
  process.exit(1);
});
