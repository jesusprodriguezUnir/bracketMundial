/**
 * bracketMundial — Playwright asset generator
 * Genera screenshots reales + video para Play Store desde bracketmundial.com
 *
 * Uso:
 *   npm install playwright
 *   npx playwright install chromium
 *   node playwright-assets.mjs
 *
 * Salida en ./playwright-output/ :
 *   phone/       8 × 1080×1920  (capturas de teléfono)
 *   tablet7/     8 × 1200×1920  (tablet 7")
 *   tablet10/    8 × 1440×2560  (tablet 10")
 *   video/       walkthrough.webm  (grabación completa)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://bracketmundial.com';
const OUT = path.join(__dirname, 'playwright-output');

// ── Configuraciones de dispositivo ───────────────────────────────────────────
// viewport × deviceScaleFactor = píxeles físicos del screenshot
const DEVICES = {
  phone:    { viewport: { width: 360,  height: 640  }, deviceScaleFactor: 3, dir: 'phone'    }, // → 1080×1920
  tablet7:  { viewport: { width: 600,  height: 960  }, deviceScaleFactor: 2, dir: 'tablet7'  }, // → 1200×1920
  tablet10: { viewport: { width: 360,  height: 640  }, deviceScaleFactor: 4, dir: 'tablet10' }, // → 1440×2560
};

// ── Secciones a capturar ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    name:  '01_grupos',
    action: async (page) => {
      // Vista inicial — solo esperamos a que cargue
      await page.waitForSelector('groups-view, .group-table, [data-view="groups"]', { timeout: 8000 }).catch(() => {});
    },
  },
  {
    name:  '02_bracket',
    action: async (page) => {
      await clickNav(page, ['bracket', 'eliminatorio', 'knockout', 'tree']);
      await page.waitForSelector('bracket-knockout, .bracket-tree, [data-view="bracket"]', { timeout: 8000 }).catch(() => {});
    },
  },
  {
    name:  '03_calendario',
    action: async (page) => {
      // Calendario está en el bottom sheet "más" en móvil
      await clickNav(page, ['calendario', 'calendar', 'partidos', 'schedule']);
      await page.waitForSelector('calendar-view, .calendar, [data-view="calendar"]', { timeout: 8000 }).catch(() => {});
    },
  },
  {
    name:  '04_equipos',
    action: async (page) => {
      await clickNav(page, ['equipos', 'squads', 'jugadores', 'players', 'plantilla']);
      await page.waitForSelector('squads-view, .squads, [data-view="squads"]', { timeout: 8000 }).catch(() => {});
    },
  },
  {
    name:  '05_estadios',
    action: async (page) => {
      // Estadios también está en el bottom sheet "más" en móvil
      await clickNav(page, ['estadios', 'stadiums', 'venues']);
      await page.waitForSelector('stadiums-view, .stadiums, [data-view="stadiums"]', { timeout: 8000 }).catch(() => {});
    },
  },
  {
    name:  '06_partido',
    action: async (page) => {
      // Volver a grupos y abrir el primer partido
      await clickNav(page, ['grupos', 'groups', 'group']);
      await page.waitForTimeout(1500);
      const match = page.locator('.match-card, .fixture-row, match-card, [data-match]').first();
      if (await match.isVisible().catch(() => false)) {
        await match.click({ timeout: 5000 });
        await page.waitForSelector('match-modal, .match-modal, [role="dialog"]', { timeout: 5000 }).catch(() => {});
      }
    },
  },
  {
    name:  '07_noticias',
    action: async (page) => {
      await clickNav(page, ['noticias', 'news']);
      await page.waitForSelector('.news, news-view, [data-view="news"]', { timeout: 6000 }).catch(() => {});
    },
  },
  {
    name:  '08_exportar',
    action: async (page) => {
      const expBtn = page.locator('[aria-label*="export" i], [title*="export" i], .export-btn')
        .or(page.locator('button').filter({ hasText: /export|exportar/i }))
        .first();
      if (await expBtn.isVisible().catch(() => false)) {
        await expBtn.click({ timeout: 5000 });
      }
      await page.waitForTimeout(800);
    },
  },
];

// ── Helper: clic en tab de navegación por texto parcial ──────────────────────
// Usa page.locator() que sí filtra visibilidad y penetra Shadow DOM abierto.
// Si el tab está en el bottom sheet "más" (calendario, estadios, entrenadores),
// primero abre el sheet antes de intentar el clic.
async function clickNav(page, candidates) {
  // 1. Buscar elemento visible directamente (bottom-nav o phase-tabs en desktop)
  for (const text of candidates) {
    const matches = page
      .locator('button, a, [role="tab"], [role="menuitem"]')
      .filter({ hasText: new RegExp(text, 'i') });
    const count = await matches.count();
    for (let i = 0; i < count; i++) {
      const el = matches.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 5000 });
        await page.waitForTimeout(600);
        return;
      }
    }
  }

  // 2. No encontrado visible → intentar abrir el bottom sheet "más"
  //    (en móvil, calendario / estadios / entrenadores están ahí)
  const moreBtn = page.locator('[aria-haspopup="menu"]').first();
  if (await moreBtn.isVisible().catch(() => false)) {
    await moreBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);

    // Reintentar en el sheet ya abierto
    for (const text of candidates) {
      const matches = page
        .locator('[role="menuitem"], .more-sheet-item, button, a')
        .filter({ hasText: new RegExp(text, 'i') });
      const count = await matches.count();
      for (let i = 0; i < count; i++) {
        const el = matches.nth(i);
        if (await el.isVisible().catch(() => false)) {
          await el.click({ timeout: 5000 });
          await page.waitForTimeout(600);
          return;
        }
      }
    }
  }

  console.warn(`  [clickNav] No se encontró botón visible para: ${candidates.join(', ')}`);
}

// ── Captura screenshots para un dispositivo ──────────────────────────────────
async function captureDevice(browser, deviceKey) {
  const cfg = DEVICES[deviceKey];
  const outDir = path.join(OUT, cfg.dir);
  fs.mkdirSync(outDir, { recursive: true });

  const ctx = await browser.newContext({
    viewport: cfg.viewport,
    deviceScaleFactor: cfg.deviceScaleFactor,
    locale: 'es-ES',
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();

  const px = `${cfg.viewport.width * cfg.deviceScaleFactor}×${cfg.viewport.height * cfg.deviceScaleFactor}`;
  console.log(`\n📱 ${deviceKey.toUpperCase()} (${px})`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000); // dar tiempo al PWA

  for (const section of SECTIONS) {
    try {
      await section.action(page);
      await page.waitForTimeout(800);

      const file = path.join(outDir, `${section.name}.png`);
      await page.screenshot({ path: file, fullPage: false });

      const stat = fs.statSync(file);
      console.log(`  ✓ ${section.name}.png  (${Math.round(stat.size / 1024)} KB)`);
    } catch (e) {
      console.warn(`  ⚠ ${section.name}: ${e.message.split('\n')[0]}`);
    }
  }

  await ctx.close();
}

// ── Grabación de video ────────────────────────────────────────────────────────
async function recordVideo(browser) {
  const videoDir = path.join(OUT, 'video');
  fs.mkdirSync(videoDir, { recursive: true });

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: 'es-ES',
    colorScheme: 'dark',
    recordVideo: {
      dir: videoDir,
      size: { width: 390, height: 844 },
    },
  });

  const page = await ctx.newPage();
  console.log('\n🎬 Grabando video...');

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const navSections = [
    { candidates: ['grupos', 'groups'], wait: 3000 },
    { candidates: ['bracket', 'eliminatorio', 'knockout'], wait: 3000 },
    { candidates: ['calendario', 'calendar', 'schedule'], wait: 2500 },
    { candidates: ['equipos', 'squads', 'jugadores'], wait: 3000 },
    { candidates: ['estadios', 'stadiums'], wait: 2500 },
  ];

  for (const s of navSections) {
    try {
      await clickNav(page, s.candidates);
      await page.waitForTimeout(s.wait);
      // scroll suave para mostrar contenido
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await page.waitForTimeout(1200);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await page.waitForTimeout(800);
    } catch {}
  }

  // Abrir un partido
  try {
    await clickNav(page, ['grupos', 'groups']);
    await page.waitForTimeout(1500);
    const match = page.locator('.match-card, [data-match], match-card').first();
    if (await match.isVisible().catch(() => false)) {
      await match.click({ timeout: 5000 });
      await page.waitForTimeout(2500);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch {}

  await ctx.close(); // finaliza el video

  // Renombrar el webm generado
  const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const src = path.join(videoDir, files[0]);
    const dst = path.join(videoDir, 'bracketmundial_walkthrough.webm');
    fs.renameSync(src, dst);
    const size = Math.round(fs.statSync(dst).size / (1024 * 1024) * 10) / 10;
    console.log(`  ✓ bracketmundial_walkthrough.webm  (${size} MB)`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`🚀 bracketMundial — Playwright Asset Generator`);
  console.log(`   URL: ${BASE_URL}`);
  console.log(`   Destino: ${OUT}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    await captureDevice(browser, 'phone');
    await captureDevice(browser, 'tablet7');
    await captureDevice(browser, 'tablet10');
    await recordVideo(browser);
  } finally {
    await browser.close();
  }

  console.log('\n✅ Listo. Assets en:', OUT);
  console.log('   phone/       → subir en "Capturas de teléfono"');
  console.log('   tablet7/     → subir en "Capturas tablet 7\""');
  console.log('   tablet10/    → subir en "Capturas tablet 10\""');
  console.log('   video/       → subir a YouTube y pegar URL en "Vídeo promocional"');
}

main().catch(err => { console.error(err); process.exit(1); });
