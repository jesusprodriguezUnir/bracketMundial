// Graba un reel vertical 9:16 (1080×1920) de UNA vista concreta de la app,
// con texto opcional quemado en el video. Salida lista para Instagram Reels.
//
// Uso:
//   node scripts/record-reel.mjs <vista> [--text "..."] [--lang es|en]
//                                        [--theme dark|light] [--duration N]
//   node scripts/record-reel.mjs list
//
// Ejemplos:
//   node scripts/record-reel.mjs grupos --text "Sigue el Mundial 2026"
//   node scripts/record-reel.mjs estadios --lang en --theme dark

import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, convertToMp4, smoothScroll,
  gotoView, resolveViewKey, VIEW_KEYS, VIEW_MAP,
  applyLocaleAndTheme, injectTextOverlay,
} from './lib/recording-utils.mjs';

const REEL = { width: 1080, height: 1920 }; // 9:16 Instagram Reel

// Captions sugeridos por vista (ES / EN).
const CAPTIONS = {
  hero: {
    es: '⚽ Vive el Mundial 2026 partido a partido. Cuenta atrás, noticias y mucho más.',
    en: '⚽ Live World Cup 2026 match by match. Countdown, news and more.',
  },
  groups: {
    es: '📊 Edita marcadores y sigue la fase de grupos del Mundial 2026 en tiempo real.',
    en: '📊 Edit scores and follow the World Cup 2026 group stage in real time.',
  },
  knockout: {
    es: '🏆 Arma tu bracket de eliminatorias y predice al campeón del Mundial 2026.',
    en: '🏆 Build your knockout bracket and predict the World Cup 2026 champion.',
  },
  squads: {
    es: '👥 Explora las plantillas de las 48 selecciones del Mundial 2026.',
    en: '👥 Explore the squads of all 48 teams at the World Cup 2026.',
  },
  calendar: {
    es: '📅 Los 104 partidos del Mundial 2026 con horarios y sedes.',
    en: '📅 All 104 World Cup 2026 matches with kickoff times and venues.',
  },
  stadiums: {
    es: '🏟️ Conoce los 16 estadios del Mundial 2026 en EE.UU., México y Canadá.',
    en: '🏟️ Discover the 16 stadiums of the World Cup 2026 across the USA, Mexico and Canada.',
  },
  coaches: {
    es: '🎯 Los entrenadores de las 48 selecciones del Mundial 2026.',
    en: '🎯 The coaches of all 48 teams at the World Cup 2026.',
  },
  guide: {
    es: '📋 La guía oficial con los onces de cada selección del Mundial 2026.',
    en: '📋 The official guide with the lineups of every World Cup 2026 team.',
  },
  league: {
    es: '🤝 Crea una mini-liga y compite con tus amigos en el Mundial 2026.',
    en: '🤝 Create a mini-league and compete with your friends at the World Cup 2026.',
  },
};

const HASHTAGS = {
  es: '#Mundial2026 #WorldCup2026 #FIFAWorldCup #Futbol #Quiniela',
  en: '#WorldCup2026 #FIFAWorldCup #Football #Soccer #Bracket',
};

function parseArgs(argv) {
  const opts = { lang: 'es', theme: 'light', duration: 20, text: null, view: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text') opts.text = argv[++i];
    else if (a === '--lang') opts.lang = argv[++i];
    else if (a === '--theme') opts.theme = argv[++i];
    else if (a === '--duration') opts.duration = parseInt(argv[++i], 10) || 20;
    else positional.push(a);
  }
  opts.view = positional[0] ?? null;
  return opts;
}

function listViews() {
  console.log('\n📹 Vistas grabables para reel:\n');
  for (const key of VIEW_KEYS) {
    const v = VIEW_MAP[key];
    console.log(`   ${key.padEnd(10)} ${v.es} / ${v.en}`);
  }
  console.log('\nEjemplo: node scripts/record-reel.mjs grupos --text "Mundial 2026"\n');
}

async function recordReel(opts) {
  const viewKey = resolveViewKey(opts.view);
  if (!viewKey) {
    console.error(`\n❌ Vista desconocida: "${opts.view}"`);
    listViews();
    process.exitCode = 1;
    return;
  }

  const lang = opts.lang === 'en' ? 'en' : 'es';
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log(`\n🎬 Reel de Instagram — vista "${viewKey}"`);
  console.log(`   Resolución: ${REEL.width}×${REEL.height} (9:16)`);
  console.log(`   Idioma: ${lang} · Tema: ${opts.theme} · Duración: ~${opts.duration}s`);
  if (opts.text) console.log(`   Texto: "${opts.text}"`);
  console.log('');

  let server, browser;
  try {
    console.log('🚀 Iniciando servidor dev...');
    server = await ensureDevServer();
    console.log('✅ Servidor listo\n');

    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: Math.floor(REEL.width / 2.5), height: Math.floor(REEL.height / 2.5) },
      deviceScaleFactor: 2.5,
      recordVideo: { dir: outDir, size: { width: REEL.width, height: REEL.height } },
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();

    console.log('📱 Cargando app...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(1500);

    // idioma + tema
    await applyLocaleAndTheme(page, { lang, theme: opts.theme });

    // navegar a la vista pedida
    console.log(`🧭 Navegando a "${viewKey}"...`);
    await gotoView(page, viewKey);
    await sleep(800);

    // texto quemado
    if (opts.text) {
      await injectTextOverlay(page, opts.text, { position: 'bottom' });
    }

    // recorrido enfocado de la vista
    console.log('🎬 Grabando recorrido...\n');
    const half = Math.max(2, Math.floor(opts.duration / 2));
    await sleep(1200);
    await smoothScroll(page, 700, half * 1000 * 0.55);
    await sleep(900);
    await smoothScroll(page, 500, half * 1000 * 0.4);
    await sleep(900);
    await smoothScroll(page, -900, half * 1000 * 0.5);
    await sleep(1500);

    // finalizar
    const rawPath = await page.video().path();
    await ctx.close();

    const outMp4 = join(outDir, `reel-${viewKey}-${lang}.mp4`);
    console.log(`\n🎞️  WebM crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264…');
    await convertToMp4(rawPath, outMp4);
    console.log(`✅ Video final: ${outMp4}`);
    try { unlinkSync(rawPath); } catch {}

    // caption
    const captionPath = join(outDir, `reel-${viewKey}-${lang}.caption.txt`);
    const base = CAPTIONS[viewKey]?.[lang] ?? '';
    const caption = `${opts.text ? opts.text + '\n\n' : ''}${base}\n\n${HASHTAGS[lang]}`;
    writeFileSync(captionPath, caption, 'utf8');
    console.log(`📝 Caption sugerido: ${captionPath}`);
    console.log('\n✅ Reel listo para publicar en Instagram.\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor detenido\n'); }
  }
}

// ── CLI ──
const argv = process.argv.slice(2);
if (argv[0] === 'list' || argv.length === 0) {
  listViews();
} else {
  recordReel(parseArgs(argv));
}
