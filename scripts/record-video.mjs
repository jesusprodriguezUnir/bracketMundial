import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, convertToMp4, smoothScroll, gotoView,
} from './lib/recording-utils.mjs';

const PLATFORMS = {
  instagram: { width: 1080, height: 1920, name: 'Instagram/TikTok' },
  tiktok:    { width: 1080, height: 1920, name: 'TikTok' },
  facebook:  { width: 1080, height: 1080, name: 'Facebook' },
  twitter:   { width: 1920, height: 1080, name: 'Twitter/X' },
};

const DEFAULT_PLATFORM = 'instagram';

// ── core ──

async function recordDemo(platform = DEFAULT_PLATFORM, durationSec = 30) {
  const cfg = PLATFORMS[platform] ?? PLATFORMS[DEFAULT_PLATFORM];
  const { width, height } = cfg;
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log(`\n🎬 Grabando para ${cfg.name}`);
  console.log(`   Resolución: ${width}×${height}`);
  console.log(`   Duración: ~${durationSec}s\n`);

  let server;
  let browser;

  try {
    // ── arrancar servidor ──
    console.log('🚀 Iniciando servidor dev...');
    server = await ensureDevServer();
    console.log('✅ Servidor listo\n');

    // ── lanzar navegador ──
    browser = await chromium.launch({ headless: true });
    const isMobileAspect = width < height;
    const ctx = await browser.newContext({
      viewport: isMobileAspect ? { width: Math.floor(width/2.5), height: Math.floor(height/2.5) } : { width, height },
      deviceScaleFactor: isMobileAspect ? 2.5 : 2,
      recordVideo: { dir: outDir, size: { width, height } },
      isMobile: isMobileAspect,
      hasTouch: isMobileAspect,
    });
    const page = await ctx.newPage();

    console.log('📱 Cargando app...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(2500);

    console.log('🎬 Iniciando secuencia…\n');

    // ── CRONOGRAMA 30s ──────────────────────────────────
    // Distribución: 7 secciones, ~3.5-4.5s cada una + colchón

    // 1) INICIO / HERO  (0s → 5s)
    console.log('   (1/7) Inicio');
    await sleep(500);
    await smoothScroll(page, 350, 1800);
    await sleep(1000);
    await smoothScroll(page, -350, 1000);
    await sleep(200);

    // 2) GRUPOS  (5s → 9.5s)
    console.log('   (2/7) Grupos');
    await gotoView(page, 'groups');
    await smoothScroll(page, 600, 2000);
    await sleep(400);
    await smoothScroll(page, -300, 1000);
    await sleep(500);

    // 3) CRUCES / KNOCKOUT  (9.5s → 14s)
    console.log('   (3/7) Cruces');
    await gotoView(page, 'knockout');
    await smoothScroll(page, 500, 1500);
    await sleep(600);
    await smoothScroll(page, -500, 1200);
    await sleep(400);

    // 4) EQUIPOS / SQUADS  (14s → 18.5s)
    console.log('   (4/7) Equipos');
    await gotoView(page, 'squads');
    await smoothScroll(page, 600, 2000);
    await sleep(400);
    await smoothScroll(page, -600, 1200);
    await sleep(500);

    // 5) CALENDARIO  (18.5s → 22s)
    console.log('   (5/7) Calendario');
    await gotoView(page, 'calendar');
    await smoothScroll(page, 500, 1500);
    await sleep(500);

    // 6) ESTADIOS  (22s → 25.5s)
    console.log('   (6/7) Estadios');
    await gotoView(page, 'stadiums');
    await smoothScroll(page, 400, 1200);
    await sleep(800);

    // 7) ENTRENADORES  (25.5s → 28.5s)
    console.log('   (7/7) Entrenadores');
    await gotoView(page, 'coaches');
    await smoothScroll(page, 400, 1200);
    await sleep(800);

    // Cierre: volver a Inicio  (28.5s → 30s)
    await gotoView(page, 'hero');
    await sleep(2000);

    // ── finalizar grabación ──
    const rawPath = await page.video().path();
    await ctx.close();

    const outMp4 = join(outDir, `demo-${platform}.mp4`);
    console.log(`\n🎞️  Webm crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264…');

    try {
      await convertToMp4(rawPath, outMp4);
      console.log(`✅ Video final: ${outMp4}`);
      try { unlinkSync(rawPath); } catch {}
    } catch (err) {
      console.error('❌', err.message);
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor detenido\n'); }
  }
}

// ── CLI ──
const args = process.argv.slice(2);
if (args[0] === 'list') {
  console.log('\n📹 Plataformas:');
  Object.entries(PLATFORMS).forEach(([k, c]) =>
    console.log(`   ${k}: ${c.name} (${c.width}×${c.height})`));
  console.log('');
} else {
  recordDemo(args[0] || DEFAULT_PLATFORM, parseInt(args[1]) || 30);
}
