import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_CRESTS = join(ROOT, 'public', 'assets', 'crests');
const PUBLIC_KITS = join(ROOT, 'public', 'assets', 'kits');

// Cargar los colores estáticos de los equipos
const COLORS_FILE = join(ROOT, 'src', 'data', 'team-colors.ts');
const UCL_CLUBS_FILE = join(ROOT, 'src', 'data', 'ucl-clubs.ts');
let TEAM_COLORS = {};

try {
  const content = readFileSync(COLORS_FILE, 'utf8');
  const matches = content.matchAll(/([A-Z]{3}):\s*\[\s*'#([A-Fa-f0-9]+)',\s*'#([A-Fa-f0-9]+)'\s*\]/g);
  for (const m of matches) {
    TEAM_COLORS[m[1]] = [`#${m[2]}`, `#${m[3]}`];
  }
} catch (err) {
  console.warn('Advertencia al leer team-colors.ts:', err.message);
}

try {
  if (existsSync(UCL_CLUBS_FILE)) {
    const content = readFileSync(UCL_CLUBS_FILE, 'utf8');
    const matches = content.matchAll(/([A-Z0-9]{3}):\s*\{[\s\S]*?colors:\s*\[\s*'#([A-Fa-f0-9]+)',\s*'#([A-Fa-f0-9]+)'\s*\]/g);
    for (const m of matches) {
      TEAM_COLORS[m[1]] = [`#${m[2]}`, `#${m[3]}`];
    }
  }
} catch (err) {
  console.warn('Advertencia al leer ucl-clubs.ts:', err.message);
}

// Colores específicos para equipaciones suplentes (Away) icónicas
const CUSTOM_AWAY_COLORS = {
  RMA: ['#121624', '#EEB111'], // Real Madrid: Navy / Gold
  BAR: ['#141416', '#A50044'], // Barcelona: Black / Blaugrana
  BAY: ['#1B2028', '#D4AF37'], // Bayern: Anthracite / Gold
  ARS: ['#101418', '#00F5D4'], // Arsenal: Black / Lynx Mint
  MCI: ['#18233C', '#E2FD52'], // Man City: Navy / Neon Yellow
  LIV: ['#192429', '#00A398'], // Liverpool: Deep Teal / White
  MUN: ['#16233B', '#DA291C'], // Man United: Navy / Red
  BVB: ['#181818', '#FDE100'], // Dortmund: Stealth Black / Yellow
  ATL: ['#1A2238', '#E63946'], // Atletico: Navy / Crimson
  INT: ['#FFFFFF', '#001489'], // Inter: White / Nerazzurro
  PSG: ['#FFFFFF', '#004170'], // PSG: White / Hechter Red-Navy
  ROM: ['#FFFFFF', '#8E1F2F'], // Roma: White / Imperial Red
  NAP: ['#1A202C', '#12A0D7'], // Napoli: Slate / Sky Blue
  SPO: ['#121820', '#008057'], // Sporting: Dark Graphite / Emerald
  FCP: ['#F4F4F6', '#003876'], // Porto: White / Blue
  VIL: ['#1E293B', '#F5E200'], // Villarreal: Navy / Yellow
  BET: ['#1A2E26', '#008A4B'], // Betis: Deep Pine / Green
  GAL: ['#111111', '#FDB912'], // Galatasaray: Black / Amber
  FEN: ['#FFFFFF', '#00205B'], // Fenerbahce: White / Navy
  PSV: ['#161A22', '#FF0000'], // PSV: Charcoal / Red
  FEY: ['#1A2634', '#EE1C25'], // Feyenoord: Dark Sapphire / Red
  RBL: ['#141824', '#DD013F'], // Leipzig: Midnight Blue / Red
  BRU: ['#FFFFFF', '#0047AB'], // Brugge: Crisp White / Blue
  SHK: ['#181818', '#F26722'], // Shakhtar: Matte Black / Flame Orange
  VFB: ['#181818', '#E32219'], // Stuttgart: Black / Red
  AVL: ['#FFFFFF', '#670E36'], // Aston Villa: White / Claret
  LIL: ['#FFFFFF', '#E01E2B'], // Lille: White / Red
  RCL: ['#141820', '#FDD000'], // Lens: Slate / Yellow
  SLP: ['#182030', '#ED1B24'], // Slavia Praha: Midnight Blue / Red
  AEK: ['#181818', '#FED100'], // AEK: Jet Black / Gold
  LSK: ['#EE1C25', '#FFFFFF'], // LASK: Red / White
  VIK: ['#FFFFFF', '#002855'], // Viking: White / Dark Navy
  BOD: ['#1A1A1A', '#FFE500'], // Bodo: Black / Electric Yellow
  COM: ['#FFFFFF', '#003399'], // Como: White / Royal Blue
  SLO: ['#182030', '#6CBEEF'], // Slovan: Navy / Sky Blue
  SAB: ['#F4F4F6', '#003366'], // Sabah: Ice White / Navy
};

const args = process.argv.slice(2);
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
const isForce = args.includes('--force');

// ── Generador Dinámico de Camisetas Premium con Escudo Integrado ─────────────
function generateKitSvg(teamCode, primary, accent, isAway = false, crestBase64 = '') {
  let bodyColor = primary;
  let stripeColor = accent;

  if (isAway) {
    if (CUSTOM_AWAY_COLORS[teamCode]) {
      [bodyColor, stripeColor] = CUSTOM_AWAY_COLORS[teamCode];
    } else {
      const isLight = primary.toLowerCase() === '#ffffff' || primary.toLowerCase() === '#fff';
      bodyColor = isLight ? '#1a1933' : '#f8f9fa';
      stripeColor = isLight ? '#f8f9fa' : primary;
    }
  }

  const ink = '#1a1933';

  // Añadir escudo oficial en el pecho izquierdo (espectador a la derecha)
  const crestImage = crestBase64 
    ? `<image href="${crestBase64}" x="52" y="30" width="11" height="11" preserveAspectRatio="xMidYMid meet" />`
    : '';

  // Diseños del torso
  let torsoDesign = '';
  let sleeveOverlay = '';

  const verticalStripedTeams = ['ARG', 'BAR', 'ATL', 'INT', 'BET', 'BRU', 'FEN', 'PSV', 'SHK', 'RCL'];

  if (verticalStripedTeams.includes(teamCode) && !isAway) {
    torsoDesign = `
      <g clip-path="url(#torso-clip)">
        <rect x="34" y="15" width="6.4" height="70" fill="${stripeColor}" />
        <rect x="40.4" y="15" width="6.4" height="70" fill="${bodyColor}" />
        <rect x="46.8" y="15" width="6.4" height="70" fill="${stripeColor}" />
        <rect x="53.2" y="15" width="6.4" height="70" fill="${bodyColor}" />
        <rect x="59.6" y="15" width="6.4" height="70" fill="${stripeColor}" />
      </g>
    `;
  } else if (teamCode === 'SPO' && !isAway) {
    // Franjas horizontales (Sporting CP)
    torsoDesign = `
      <g clip-path="url(#torso-clip)">
        <rect x="34" y="22" width="32" height="7" fill="${stripeColor}" />
        <rect x="34" y="36" width="32" height="7" fill="${stripeColor}" />
        <rect x="34" y="50" width="32" height="7" fill="${stripeColor}" />
        <rect x="34" y="64" width="32" height="7" fill="${stripeColor}" />
        <rect x="34" y="78" width="32" height="7" fill="${stripeColor}" />
      </g>
    `;
  } else if (teamCode === 'PSG') {
    // Franja Hechter icónica (PSG)
    const bandColor = '#DA291C';
    const borderPin = isAway ? '#004170' : '#FFFFFF';
    torsoDesign = `
      <g clip-path="url(#torso-clip)">
        <rect x="45" y="15" width="10" height="70" fill="${bandColor}" />
        <rect x="43.5" y="15" width="1.5" height="70" fill="${borderPin}" />
        <rect x="55" y="15" width="1.5" height="70" fill="${borderPin}" />
      </g>
    `;
  } else if (['FEY', 'SLP', 'GAL'].includes(teamCode) && !isAway) {
    // Mitad y mitad (Feyenoord, Slavia, Galatasaray)
    torsoDesign = `
      <g clip-path="url(#torso-clip)">
        <rect x="34" y="15" width="16" height="70" fill="${bodyColor}" />
        <rect x="50" y="15" width="16" height="70" fill="${stripeColor}" />
      </g>
    `;
    sleeveOverlay = `
      <path d="M 32,15 L 18,36 L 30,42 L 34,35 Z" fill="${stripeColor}" stroke="${ink}" stroke-width="2.5" />
    `;
  } else if (['ARS', 'AVL'].includes(teamCode) && !isAway) {
    // Mangas contrastadas (Arsenal / Aston Villa)
    sleeveOverlay = `
      <path d="M 32,15 L 18,36 L 30,42 L 34,35 Z" fill="${stripeColor}" stroke="${ink}" stroke-width="2.5" />
      <path d="M 68,15 L 82,36 L 70,42 L 66,35 Z" fill="${stripeColor}" stroke="${ink}" stroke-width="2.5" />
    `;
  } else if (teamCode === 'CRO' && !isAway) {
    // Cuadros croatas
    torsoDesign = `
      <g clip-path="url(#torso-clip)">
        <rect x="35" y="22" width="6" height="6" fill="${stripeColor}" />
        <rect x="47" y="22" width="6" height="6" fill="${stripeColor}" />
        <rect x="59" y="22" width="6" height="6" fill="${stripeColor}" />
        <rect x="41" y="28" width="6" height="6" fill="${stripeColor}" />
        <rect x="53" y="28" width="6" height="6" fill="${stripeColor}" />
        <rect x="35" y="34" width="6" height="6" fill="${stripeColor}" />
        <rect x="47" y="34" width="6" height="6" fill="${stripeColor}" />
        <rect x="59" y="34" width="6" height="6" fill="${stripeColor}" />
      </g>
    `;
  }

  // Rayas retro en hombros (estilo clásico)
  const shoulderStripes = `
    <path d="M 30,20 L 22,34 M 27,20 L 19,34 M 24,20 L 16,34" stroke="${stripeColor}" stroke-width="1.8" />
    <path d="M 70,20 L 78,34 M 73,20 L 81,34 M 76,20 L 84,34" stroke="${stripeColor}" stroke-width="1.8" />
    <path d="M 30,20 L 34,35" stroke="${ink}" stroke-width="1" stroke-dasharray="1.5,1.5" />
    <path d="M 70,20 L 66,35" stroke="${ink}" stroke-width="1" stroke-dasharray="1.5,1.5" />
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="240" height="320">
      <defs>
        <clipPath id="torso-clip">
          <rect x="34" y="15" width="32" height="70" />
        </clipPath>
        <radialGradient id="grad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.10" />
        </radialGradient>
      </defs>

      <g transform="translate(0, 5)">
        <!-- Camiseta Base (Cuerpo y Mangas) -->
        <path d="M 32,15 L 68,15 L 82,36 L 70,42 L 66,35 L 66,85 L 34,85 L 34,35 L 30,42 L 18,36 Z" 
              fill="${bodyColor}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round" />
        
        <!-- Diseños especiales de mangas -->
        ${sleeveOverlay}

        <!-- Diseños de torso / patrones -->
        ${torsoDesign}

        <!-- 3 Rayas de hombros -->
        ${shoulderStripes}
        
        <!-- Cuello Premium en V -->
        <path d="M 40,15 L 50,27 L 60,15" fill="none" stroke="${stripeColor}" stroke-width="3" stroke-linejoin="round" />
        <path d="M 40,15 C 40,15 50,23 60,15 Z" fill="${bodyColor}" stroke="${ink}" stroke-width="2.5" />
        
        <!-- Dobladillo de las mangas -->
        <path d="M 18,36 L 30,42" stroke="${stripeColor}" stroke-width="3" />
        <path d="M 82,36 L 70,42" stroke="${stripeColor}" stroke-width="3" />

        <!-- Escudo oficial integrado en el pecho izquierdo -->
        ${crestImage}
        
        <!-- Sombra y Degradado retro para volumen -->
        <path d="M 32,15 L 68,15 L 82,36 L 70,42 L 66,35 L 66,85 L 34,85 L 34,35 L 30,42 L 18,36 Z" 
              fill="url(#grad)" mix-blend-mode="multiply" pointer-events="none" />
      </g>
    </svg>
  `;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function run() {
  const squadFiles = readdirSync(SQUADS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => basename(f, '.ts').toUpperCase())
    .filter(t => teamFilter.length === 0 || teamFilter.includes(t));

  mkdirSync(PUBLIC_KITS, { recursive: true });
  console.log(`👕 Generando camisetas premium con escudo integrado para ${squadFiles.length} equipos...`);

  const stats = { generated: 0, skipped: 0, errors: 0 };

  for (const teamCode of squadFiles) {
    const colors = TEAM_COLORS[teamCode] ?? ['#FFFFFF', '#1A1933'];
    const [primary, accent] = colors;

    // Buscar si el escudo oficial PNG del equipo existe para base64-encodearlo
    const crestPath = join(PUBLIC_CRESTS, `${teamCode}.png`);
    let crestBase64 = '';
    if (existsSync(crestPath)) {
      crestBase64 = `data:image/png;base64,${readFileSync(crestPath, 'base64')}`;
    }

    console.log(`▶ Procesando equipaciones home/away para ${teamCode}...`);

    // 1. Equipación Local (Home)
    const homeDest = join(PUBLIC_KITS, `${teamCode}_home.png`);
    if (existsSync(homeDest) && !isForce) {
      stats.skipped++;
    } else {
      try {
        const svg = generateKitSvg(teamCode, primary, accent, false, crestBase64);
        await sharp(Buffer.from(svg))
          .resize(240, 320)
          .png()
          .toFile(homeDest);
        stats.generated++;
        console.log(`  ✓ Camiseta local (Home) generada e inyectada con escudo`);
      } catch (err) {
        stats.errors++;
        console.error(`  ✗ Error equipación local: ${err.message}`);
      }
    }

    // 2. Equipación Visitante (Away)
    const awayDest = join(PUBLIC_KITS, `${teamCode}_away.png`);
    if (existsSync(awayDest) && !isForce) {
      stats.skipped++;
    } else {
      try {
        const svg = generateKitSvg(teamCode, primary, accent, true, crestBase64);
        await sharp(Buffer.from(svg))
          .resize(240, 320)
          .png()
          .toFile(awayDest);
        stats.generated++;
        console.log(`  ✓ Camiseta visitante (Away) generada e inyectada con escudo`);
      } catch (err) {
        stats.errors++;
        console.error(`  ✗ Error equipación visitante: ${err.message}`);
      }
    }
  }

  console.log(`\n📊 RESUMEN: ${stats.generated} camisetas premium generadas vectorialmente · ${stats.skipped} saltadas · ${stats.errors} errores`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
