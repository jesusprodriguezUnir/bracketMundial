import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_CRESTS = join(ROOT, 'public', 'assets', 'crests');

// Mapeo canónico de códigos FIFA a títulos oficiales de páginas en Wikipedia
const TEAM_WIKI_PAGES = {
  MEX: 'Mexico national football team',
  RSA: 'South Africa national soccer team',
  KOR: 'South Korea national football team',
  CZE: 'Czech Republic national football team',
  CAN: "Canada men's national soccer team",
  SUI: 'Switzerland national football team',
  QAT: 'Qatar national football team',
  BIH: 'Bosnia and Herzegovina national football team',
  BRA: 'Brazil national football team',
  MAR: 'Morocco national football team',
  SCO: 'Scotland national football team',
  HAI: 'Haiti national football team',
  USA: "United States men's national soccer team",
  PAR: 'Paraguay national football team',
  AUS: "Australia men's national soccer team",
  TUR: 'Turkey national football team',
  GER: 'Germany national football team',
  CUW: 'Curaçao national football team',
  CIV: 'Ivory Coast national football team',
  ECU: 'Ecuador national football team',
  NED: 'Netherlands national football team',
  JPN: 'Japan national football team',
  TUN: 'Tunisia national football team',
  SWE: 'Sweden national football team',
  BEL: 'Belgium national football team',
  EGY: 'Egypt national football team',
  IRN: 'Iran national football team',
  NZL: "New Zealand men's national football team",
  ESP: 'Spain national football team',
  URU: 'Uruguay national football team',
  KSA: 'Saudi Arabia national football team',
  CPV: 'Cape Verde national football team',
  FRA: 'France national football team',
  SEN: 'Senegal national football team',
  NOR: 'Norway national football team',
  IRQ: 'Iraq national football team',
  ARG: 'Argentina national football team',
  AUT: 'Austria national football team',
  ALG: 'Algeria national football team',
  JOR: 'Jordan national football team',
  POR: 'Portugal national football team',
  COL: 'Colombia national football team',
  UZB: 'Uzbekistan national football team',
  COD: 'DR Congo national football team',
  ENG: 'England national football team',
  CRO: 'Croatia national football team',
  GHA: 'Ghana national football team',
  PAN: 'Panama national football team'
};

// Mapeo curado de ficheros de escudo en Wikipedia (100% correctos y verificados)
const CURATED_CREST_FILES = {
  ARG: 'Afa gold logo24.svg',
  ESP: 'Spain national football team crest.svg',
  MEX: 'Mexico national football team crest.svg',
  BRA: 'Brazilian Football Confederation logo.svg',
  GER: 'DFBEagle.svg',
  FRA: 'France national football team seal.svg',
  ENG: 'England national football team crest.svg',
  USA: 'United States Soccer Federation logo.svg',
  CAN: 'Canadian Soccer Association logo.svg',
  SUI: 'Swiss Football Association logo.svg',
  QAT: 'Qatar Football Association logo.svg',
  BIH: 'Football Association of Bosnia and Herzegovina logo.svg',
  MAR: 'Royal Moroccan Football Federation logo.svg',
  SCO: 'Scottish Football Association logo.svg',
  HAI: 'Haitian Football Federation logo.png',
  PAR: 'Paraguayan Football Association logo.svg',
  AUS: 'Australia national soccer team crest.svg',
  TUR: 'Turkish Football Federation logo.svg',
  CUW: 'Curaçao Football Federation logo.png',
  CIV: 'Cote Divoire Enblem.png',
  ECU: 'Ecuadorian Football Federation logo 2020.svg',
  NED: 'Royal Netherlands Football Association logo.svg',
  JPN: 'Japan Football Association crest.svg',
  TUN: 'Tunisian Football Federation logo.svg',
  SWE: 'Swedish Football Association crest.svg',
  BEL: 'Royal Belgian Football Association logo.svg',
  EGY: 'Egyptian Football Association logo.svg',
  IRN: 'Iran Football Federation logo.svg',
  NZL: 'New Zealand Football logo.svg',
  URU: 'Asociación Uruguaya de Fútbol logo.svg',
  KSA: 'Saudi Arabia Football Federation logo.svg',
  CPV: 'Cape Verdean Football Federation logo.svg',
  SEN: 'Senegalese Football Federation logo.svg',
  NOR: 'Norges Fotballforbund logo.svg',
  IRQ: 'Iraq Football Association logo.png',
  AUT: 'Austrian Football Association logo.svg',
  ALG: 'Algerian Football Federation logo.svg',
  JOR: 'Jordan Football Association logo.svg',
  POR: 'Portuguese Football Federation logo.svg',
  COL: 'Colombian Football Federation logo.svg',
  UZB: 'Uzbekistan Football Association logo.svg',
  COD: 'Congolese Association Football Federation logo.png',
  CRO: 'Croatian Football Federation logo.svg',
  GHA: 'Ghana Football Association logo.svg',
  PAN: 'Panamanian Football Federation logo.svg',
  RSA: 'South African Football Association logo.svg',
  KOR: 'Korea Football Association logo.svg',
  CZE: 'Football Association of the Czech Republic logo.svg'
};

const args = process.argv.slice(2);
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
const isForce = args.includes('--force');

// User-Agent obligatorio para cumplir políticas de API de Wikipedia y evitar rate limiting
const HEADERS = {
  'User-Agent': 'BracketMundialBot/1.0 (https://bracketmundial.com; admin@bracketmundial.com) generic-fetcher'
};

const THROTTLE_MS = 1500;
let lastReq = 0;
async function throttle() {
  const elapsed = Date.now() - lastReq;
  if (elapsed < THROTTLE_MS) await new Promise(r => setTimeout(r, THROTTLE_MS - elapsed));
  lastReq = Date.now();
}

// ── Wikipedia Resolvers ──────────────────────────────────────────────────────
async function fetchWikiImageUrl(fileName) {
  await throttle();
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + fileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
    const json = await resp.json();
    const page = Object.values(json.query.pages)[0];
    return page?.imageinfo?.[0]?.url ?? null;
  } catch { return null; }
}

async function parseWikiInfoboxBadge(pageTitle) {
  await throttle();
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&format=json&origin=*`;
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return null;
    const json = await resp.json();
    const page = Object.values(json.query.pages)[0];
    const content = page?.revisions?.[0]?.['*'];
    if (!content) return null;
    
    // Buscar Badge, Logo o image_file en el Infobox
    const match = content.match(/\|\s*(Badge|Logo|image_file|logo|image)\s*=\s*([^|\n]+)/i);
    if (!match) return null;
    
    return match[2].trim().replace(/<!--.*-->/, '').trim();
  } catch { return null; }
}

async function downloadAndProcess(url, dest) {
  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  
  // Procesar y estandarizar en un archivo PNG transparente de alta calidad
  await sharp(buf)
    .resize(200, 200, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality: 95 })
    .toFile(dest);
}

// ── main ──────────────────────────────────────────────────────────────────────
async function run() {
  const squadFiles = readdirSync(SQUADS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => basename(f, '.ts').toUpperCase())
    .filter(t => teamFilter.length === 0 || teamFilter.includes(t));

  mkdirSync(PUBLIC_CRESTS, { recursive: true });
  console.log(`🔍 Iniciando descarga de escudos oficiales para ${squadFiles.length} selecciones...`);

  const stats = { found: 0, skipped: 0, notFound: 0, errors: 0 };

  for (const teamCode of squadFiles) {
    const dest = join(PUBLIC_CRESTS, `${teamCode}.png`);
    
    if (existsSync(dest) && !isForce) {
      stats.skipped++;
      continue;
    }

    const curatedFileName = CURATED_CREST_FILES[teamCode];
    const wikiPageTitle = TEAM_WIKI_PAGES[teamCode];

    console.log(`▶ Procesando escudo oficial para ${teamCode}...`);

    try {
      let imageUrl = null;

      // 1. Intentar con el archivo pre-verificado curado
      if (curatedFileName) {
        imageUrl = await fetchWikiImageUrl(curatedFileName);
      }

      // 2. Fallback: Parsear dinámicamente el infobox de la página de Wikipedia
      if (!imageUrl && wikiPageTitle) {
        console.log(`  ℹ Probando fallback infobox parser para: ${wikiPageTitle}`);
        const parsedFileName = await parseWikiInfoboxBadge(wikiPageTitle);
        if (parsedFileName) {
          imageUrl = await fetchWikiImageUrl(parsedFileName);
        }
      }

      if (!imageUrl) {
        stats.notFound++;
        console.log(`  ❌ Escudo oficial no encontrado en Wikipedia para ${teamCode}`);
        continue;
      }

      console.log(`  🔗 Descargando desde: ${imageUrl}`);
      await downloadAndProcess(imageUrl, dest);
      stats.found++;
      console.log(`  ✓ Escudo oficial descargado y guardado en PNG transparente`);
    } catch (err) {
      stats.errors++;
      console.error(`  ✗ Error procesando escudo de ${teamCode}: ${err.message}`);
    }
  }

  console.log(`\n📊 RESUMEN: ${stats.found} escudos descargados · ${stats.skipped} saltados · ${stats.notFound} no encontrados · ${stats.errors} errores`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
