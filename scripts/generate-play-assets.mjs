// Genera todos los assets gráficos que pide la ficha de Google Play Store
// para bracketMundial. Salida en marketing/google-play/.
//
// Uso:
//   node scripts/generate-play-assets.mjs [--lang es|en] [--only TIPO]
//   TIPO ∈ phone | tablet | promo | graphic | icon
//
// Requisitos: ffmpeg en el PATH (para el video promocional).

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import sharp from 'sharp';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, smoothScroll,
  gotoView, applyLocaleAndTheme,
} from './lib/recording-utils.mjs';

// Vistas que se muestran en las capturas (orden de la ficha).
const SHOT_VIEWS = ['hero', 'groups', 'knockout', 'squads', 'calendar', 'stadiums'];

// Dispositivos de captura. Google Play: capturas 16:9 o 9:16, lado 320–3840 px.
const DEVICES = {
  phone:    { width: 1080, height: 1920, dir: 'phone' },
  'tablet-7':  { width: 1200, height: 1920, dir: 'tablet-7' },
  'tablet-10': { width: 1600, height: 2560, dir: 'tablet-10' },
};

const APP_NAME = 'Bracket Mundial 2026';
const CLAIM = {
  es: 'Tu bracket del Mundial 2026',
  en: 'Your World Cup 2026 bracket',
};

function parseArgs(argv) {
  const opts = { lang: 'es', only: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang') opts.lang = argv[++i];
    else if (argv[i] === '--only') opts.only = argv[++i];
  }
  return opts;
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
  return p;
}

/** Capturas de un dispositivo: una PNG por vista, dimensiones exactas con sharp. */
async function captureDevice(browser, device, lang, baseDir) {
  const outDir = ensureDir(join(baseDir, device.dir));
  const isPortrait = device.height > device.width;
  const scale = 2;
  const ctx = await browser.newContext({
    viewport: {
      width: Math.floor(device.width / scale),
      height: Math.floor(device.height / scale),
    },
    deviceScaleFactor: scale,
    isMobile: isPortrait,
    hasTouch: isPortrait,
  });
  const page = await ctx.newPage();
  await page.goto(DEV_URL, { waitUntil: 'networkidle' });
  await sleep(1200);
  await applyLocaleAndTheme(page, { lang, theme: 'light' });

  let n = 0;
  for (const view of SHOT_VIEWS) {
    n++;
    await gotoView(page, view);
    await sleep(1000);
    const raw = await page.screenshot();
    const outPath = join(outDir, `${String(n).padStart(2, '0')}_${view}.png`);
    // sharp garantiza las dimensiones EXACTAS que exige Play Store.
    await sharp(raw)
      .resize(device.width, device.height, { fit: 'cover', position: 'top' })
      .png()
      .toFile(outPath);
    console.log(`   📸 ${device.dir}/${String(n).padStart(2, '0')}_${view}.png`);
  }
  await ctx.close();
}

/** Feature graphic 1024×500 — página HTML estilo Panini renderizada por Playwright. */
async function buildFeatureGraphic(browser, lang, baseDir) {
  const ctx = await browser.newContext({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const html = `<!doctype html><html><head><style>
    @import url('https://fonts.googleapis.com/css2?family=Bowlby+One&family=Space+Mono&display=swap');
    html,body{margin:0;width:1024px;height:500px;overflow:hidden}
    .wrap{width:100%;height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:18px;
      background:#ecdfc0;
      background-image:radial-gradient(#1a193322 1px,transparent 1px);
      background-size:14px 14px;}
    .badge{font-family:'Bowlby One',sans-serif;font-size:74px;color:#e8612c;
      -webkit-text-stroke:3px #1a1933;text-shadow:6px 6px 0 #1a1933;
      text-align:center;line-height:1.05;letter-spacing:1px}
    .claim{font-family:'Space Mono',monospace;font-size:26px;font-weight:700;
      color:#1a1933;background:#f2c14e;border:3px solid #1a1933;
      box-shadow:5px 5px 0 #1a1933;padding:8px 20px}
  </style></head><body>
    <div class="wrap">
      <div class="badge">${APP_NAME.toUpperCase()}</div>
      <div class="claim">${CLAIM[lang].toUpperCase()}</div>
    </div>
  </body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await sleep(1500); // espera carga de fuentes
  const raw = await page.screenshot();
  const outPath = join(baseDir, 'feature-graphic.png');
  await sharp(raw).resize(1024, 500, { fit: 'cover' }).png().toFile(outPath);
  console.log(`   🎨 feature-graphic.png (1024×500)`);
  await ctx.close();
}

/** Icono 512×512 — redimensiona el icono PWA existente. */
async function buildIcon(baseDir) {
  const src = join(rootDir, 'public', 'icons', 'icon-512.png');
  const outPath = join(baseDir, 'icon-512.png');
  if (existsSync(src)) {
    await sharp(src).resize(512, 512, { fit: 'cover' }).png().toFile(outPath);
    console.log('   🔷 icon-512.png (512×512) — desde public/icons/icon-512.png');
  } else {
    console.warn('   ⚠️  No se encontró public/icons/icon-512.png — icono omitido');
  }
}

/** Video promocional 1080p — reutiliza record-video.mjs (plataforma twitter = 1920×1080). */
function buildPromoVideo(baseDir) {
  return new Promise((resolve) => {
    console.log('   🎬 Generando video promocional (1920×1080, ~30s)...');
    const proc = spawn('node', ['scripts/record-video.mjs', 'twitter', '30'], {
      cwd: rootDir, shell: true, stdio: 'inherit',
    });
    proc.on('close', () => {
      const src = join(rootDir, 'recordings', 'demo-twitter.mp4');
      const promoDir = ensureDir(join(baseDir, 'promo'));
      const dest = join(promoDir, 'promo-1080p.mp4');
      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log(`   ✅ promo/promo-1080p.mp4`);
      } else {
        console.warn('   ⚠️  No se generó el video promocional');
      }
      resolve();
    });
  });
}

async function generate(opts) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const baseDir = ensureDir(join(rootDir, 'marketing', 'google-play'));
  const only = opts.only;

  console.log('\n📦 Generando assets para Google Play Store');
  console.log(`   Idioma: ${lang} · Destino: marketing/google-play/`);
  if (only) console.log(`   Solo: ${only}`);
  console.log('');

  let server, browser;
  try {
    // El video promocional arranca su propio dev server; capturas/graphic comparten uno.
    const needBrowser = !only || ['phone', 'tablet', 'graphic', 'icon'].includes(only);
    const needServer = !only || ['phone', 'tablet', 'graphic'].includes(only);

    if (needServer) {
      console.log('🚀 Iniciando servidor dev...');
      server = await ensureDevServer();
      console.log('✅ Servidor listo\n');
    }
    if (needBrowser) browser = await chromium.launch({ headless: true });

    // 1) Capturas de teléfono
    if (!only || only === 'phone') {
      console.log('📱 Capturas de teléfono (1080×1920)...');
      await captureDevice(browser, DEVICES.phone, lang, baseDir);
    }

    // 2) Capturas de tablet 7" y 10"
    if (!only || only === 'tablet') {
      console.log('📱 Capturas de tablet 7" (1200×1920)...');
      await captureDevice(browser, DEVICES['tablet-7'], lang, baseDir);
      console.log('📱 Capturas de tablet 10" (1600×2560)...');
      await captureDevice(browser, DEVICES['tablet-10'], lang, baseDir);
    }

    // 3) Feature graphic
    if (!only || only === 'graphic') {
      console.log('🎨 Feature graphic (1024×500)...');
      await buildFeatureGraphic(browser, lang, baseDir);
    }

    // 4) Icono
    if (!only || only === 'icon') {
      console.log('🔷 Icono (512×512)...');
      await buildIcon(baseDir);
    }

    // cerrar navegador/servidor antes del video (usa los suyos propios)
    if (browser) { await browser.close(); browser = null; }
    if (server) { server.kill(); server = null; console.log('🛑 Servidor detenido\n'); }

    // 5) Video promocional
    if (!only || only === 'promo') {
      await buildPromoVideo(baseDir);
    }

    console.log(`\n✅ Assets generados en marketing/google-play/`);
    console.log('   Súbelos en Play Console → Presencia en Store → Recursos gráficos.');
    console.log('   (El video va a YouTube; en la ficha se pega el enlace.)\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor detenido\n'); }
  }
}

generate(parseArgs(process.argv.slice(2)));
