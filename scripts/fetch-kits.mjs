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
let TEAM_COLORS = {};
try {
  const content = readFileSync(COLORS_FILE, 'utf8');
  const matches = content.matchAll(/([A-Z]{3}):\s*\[\s*'#([A-Fa-f0-9]+)',\s*'#([A-Fa-f0-9]+)'\s*\]/g);
  for (const m of matches) {
    TEAM_COLORS[m[1]] = [`#${m[2]}`, `#${m[3]}`];
  }
} catch {
  // Fallback colores básicos
  TEAM_COLORS = {
    ARG: ['#75AADB', '#FFFFFF'],
    BRA: ['#009B3A', '#FEDF00'],
    ESP: ['#AA151B', '#F1BF00'],
    MEX: ['#006847', '#CE1126'],
    USA: ['#002868', '#BF0A30']
  };
}

const args = process.argv.slice(2);
const teamFilter = args.filter(a => !a.startsWith('--')).map(t => t.toUpperCase());
const isForce = args.includes('--force');

// ── Generador Dinámico de Camisetas Premium con Escudo Integrado ─────────────
function generateKitSvg(teamCode, primary, accent, isAway = false, crestBase64 = '') {
  const bodyColor = isAway 
    ? (primary.toLowerCase() === '#ffffff' ? '#f4f4f6' : '#ffffff') 
    : primary;
  const stripeColor = isAway ? primary : accent;
  const ink = '#1a1933';

  // Añadir escudo oficial en el pecho izquierdo (del espectador a la derecha)
  const crestImage = crestBase64 
    ? `<image href="${crestBase64}" x="53" y="31" width="9" height="9" />`
    : '';

  // Rayas retro verticales en el pecho (estilo Panini clásico)
  let chestDesign = '';
  if (teamCode === 'ARG' && !isAway) {
    // Rayas albicelestes para Argentina
    chestDesign = `
      <rect x="38" y="22" width="6" height="63" fill="${accent}" />
      <rect x="56" y="22" width="6" height="63" fill="${accent}" />
      <rect x="47" y="26" width="6" height="59" fill="${primary}" />
    `;
  } else if (teamCode === 'CRO' && !isAway) {
    // Cuadros croatas tradicionales
    chestDesign = `
      <rect x="35" y="22" width="6" height="6" fill="${accent}" />
      <rect x="47" y="22" width="6" height="6" fill="${accent}" />
      <rect x="59" y="22" width="6" height="6" fill="${accent}" />
      <rect x="41" y="28" width="6" height="6" fill="${accent}" />
      <rect x="53" y="28" width="6" height="6" fill="${accent}" />
      <rect x="35" y="34" width="6" height="6" fill="${accent}" />
      <rect x="47" y="34" width="6" height="6" fill="${accent}" />
      <rect x="59" y="34" width="6" height="6" fill="${accent}" />
    `;
  } else {
    // 3 rayas de hombro deportivas retro
    chestDesign = `
      <path d="M 30,20 L 22,34 M 27,20 L 19,34 M 24,20 L 16,34" stroke="${stripeColor}" stroke-width="1.8" />
      <path d="M 70,20 L 78,34 M 73,20 L 81,34 M 76,20 L 84,34" stroke="${stripeColor}" stroke-width="1.8" />
      
      <!-- Detalle de costura de hombro -->
      <path d="M 30,20 L 34,35" stroke="${ink}" stroke-width="1" stroke-dasharray="1.5,1.5" />
      <path d="M 70,20 L 66,35" stroke="${ink}" stroke-width="1" stroke-dasharray="1.5,1.5" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="240" height="320">
      <!-- Filtro de textura de papel impreso leve para realismo retro -->
      <defs>
        <radialGradient id="grad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.08" />
        </radialGradient>
      </defs>

      <g transform="translate(0, 5)">
        <!-- Camiseta Body y Mangas -->
        <path d="M 32,15 L 68,15 L 82,36 L 70,42 L 66,35 L 66,85 L 34,85 L 34,35 L 30,42 L 18,36 Z" 
              fill="${bodyColor}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round" />
        
        <!-- Diseños del pecho -->
        ${chestDesign}
        
        <!-- Cuello Premium en V -->
        <path d="M 40,15 L 50,27 L 60,15" fill="none" stroke="${stripeColor}" stroke-width="3" stroke-linejoin="round" />
        <path d="M 40,15 C 40,15 50,23 60,15 Z" fill="${isAway ? '#f4f4f6' : bodyColor}" stroke="${ink}" stroke-width="2.5" />
        
        <!-- Dobladillo de las mangas -->
        <path d="M 18,36 L 30,42" stroke="${stripeColor}" stroke-width="3" />
        <path d="M 82,36 L 70,42" stroke="${stripeColor}" stroke-width="3" />

        <!-- Escudo oficial integrado en el pecho izquierdo -->
        ${crestImage}
        
        <!-- Sombra y Degradado retro -->
        <path d="M 32,15 L 68,15 L 82,36 L 70,42 L 66,35 L 66,85 L 34,85 L 34,35 L 30,42 L 18,36 Z" 
              fill="url(#grad)" mix-blend-mode="multiply" />
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
  console.log(`👕 Generando camisetas premium con escudo integrado para ${squadFiles.length} selecciones...`);

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
