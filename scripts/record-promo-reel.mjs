// Graba un reel promocional 9:16 (1080×1920) con el thumbnail del video
// de IShowSpeed + overlay de bracketmundial.com. Sin servidor dev.
//
// Uso:
//   node scripts/record-promo-reel.mjs [--duration N] [--lang es|en]
//
// Ejemplo:
//   node scripts/record-promo-reel.mjs --duration 30

import { chromium } from 'playwright';
import { exec } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const REEL = { width: 1080, height: 1920 };

function parseArgs(argv) {
  const opts = { lang: 'es', duration: 30 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lang') opts.lang = argv[++i];
    else if (a === '--duration') opts.duration = parseInt(argv[++i], 10) || 30;
  }
  return opts;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function convertToMp4(rawWebmPath, outMp4Path) {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -i "${rawWebmPath}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${outMp4Path}"`;
    exec(cmd, (err) => {
      if (err) reject(new Error(`ffmpeg falló: ${err.message}`));
      else resolve(outMp4Path);
    });
  });
}

async function recordPromoReel(opts) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const htmlPath = join(rootDir, 'scripts', 'promo-reel.html');
  if (!existsSync(htmlPath)) {
    console.error(`❌ No se encuentra: ${htmlPath}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n🎬 Reel Promocional — IShowSpeed × BracketMundial`);
  console.log(`   Resolución: ${REEL.width}×${REEL.height} (9:16)`);
  console.log(`   HTML: ${htmlPath}`);
  console.log(`   Duración: ~${opts.duration}s\n`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: Math.floor(REEL.width / 2.5), height: Math.floor(REEL.height / 2.5) },
      deviceScaleFactor: 2.5,
      recordVideo: { dir: outDir, size: { width: REEL.width, height: REEL.height } },
    });
    const page = await ctx.newPage();

    console.log('📄 Abriendo página promocional...');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    const title = await page.title();
    console.log(`   Página cargada: ${title}`);

    // Esperar a que las animaciones iniciales arranquen
    console.log('⏳ Esperando animaciones...');
    await sleep(2000);

    // Grabar el resto del tiempo (ya pasaron ~4s)
    const remainingMs = Math.max(1000, opts.duration * 1000 - 4000);
    console.log(`🎬 Grabando ~${Math.round(remainingMs / 1000)}s...`);

    await sleep(remainingMs);

    // Finalizar grabación
    const rawPath = await page.video().path();
    await ctx.close();

    const outMp4 = join(outDir, `reel-promo-ishowspeed-${lang}.mp4`);
    console.log(`\n🎞️  WebM crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264…');
    await convertToMp4(rawPath, outMp4);
    console.log(`✅ Video final: ${outMp4}`);
    try { unlinkSync(rawPath); } catch {}

    // Caption sugerido
    const captionPath = join(outDir, `reel-promo-ishowspeed-${lang}.caption.txt`);
    const caption = lang === 'en'
      ? `🔥 IShowSpeed - World Cup (Champions) is the anthem of the 2026 FIFA World Cup!\n\n🏆 Who's taking it home? Make your prediction at bracketmundial.com\n\n⬆️ Free bracket simulator\n⬆️ No signup required\n⬆️ Challenge your friends\n\n#WorldCup2026 #IShowSpeed #WorldCupChampions #FIFAWorldCup #BracketMundial #Football #Soccer #Predictions`
      : `🔥 IShowSpeed lanzó "World Cup (Champions)", el himno del Mundial 2026!\n\n🏆 ¿Quién levanta la copa? Predícelo en bracketmundial.com\n\n⬆️ Simulador de bracket gratis\n⬆️ Sin registro\n⬆️ Reta a tus amigos\n\n#Mundial2026 #IShowSpeed #WorldCupChampions #FIFAWorldCup #BracketMundial #Futbol #Pronosticos`;
    writeFileSync(captionPath, caption, 'utf8');
    console.log(`📝 Caption sugerido: ${captionPath}`);
    console.log('\n✅ Reel promocional listo.\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

recordPromoReel(parseArgs(process.argv.slice(2)));
