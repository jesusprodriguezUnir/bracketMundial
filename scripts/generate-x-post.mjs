// Genera el contenido para un post en X (Twitter): una imagen optimizada de
// una vista de la app + un .txt con el texto del tweet (≤280 chars) y hashtags.
// Publicación manual — el script no llama a la API de X.
//
// Uso:
//   node scripts/generate-x-post.mjs <vista> [--text "..."] [--ratio 16:9|1:1]
//                                            [--lang es|en] [--theme dark|light]
//   node scripts/generate-x-post.mjs list
//
// Ejemplos:
//   node scripts/generate-x-post.mjs estadios --ratio 16:9
//   node scripts/generate-x-post.mjs knockout --text "Predice al campeón" --lang en

import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import sharp from 'sharp';
import {
  rootDir, DEV_URL, sleep, ensureDevServer,
  gotoView, resolveViewKey, VIEW_KEYS, VIEW_MAP,
  applyLocaleAndTheme, injectTextOverlay,
} from './lib/recording-utils.mjs';

const RATIOS = {
  '16:9': { width: 1600, height: 900 },
  '1:1':  { width: 1080, height: 1080 },
};

const APP_URL = 'https://bracketmundial.vercel.app';

// Texto base del tweet por vista (sin contar hashtags ni URL).
const TWEETS = {
  hero: {
    es: '⚽ Vive el Mundial 2026 partido a partido: cuenta atrás, noticias y tu bracket.',
    en: '⚽ Live World Cup 2026 match by match: countdown, news and your bracket.',
  },
  groups: {
    es: '📊 Sigue la fase de grupos del Mundial 2026 y edita los marcadores en vivo.',
    en: '📊 Follow the World Cup 2026 group stage and edit scores live.',
  },
  knockout: {
    es: '🏆 Arma tu bracket de eliminatorias del Mundial 2026 y predice al campeón.',
    en: '🏆 Build your World Cup 2026 knockout bracket and predict the champion.',
  },
  squads: {
    es: '👥 Explora las plantillas de las 48 selecciones del Mundial 2026.',
    en: '👥 Explore the squads of all 48 World Cup 2026 teams.',
  },
  calendar: {
    es: '📅 Los 104 partidos del Mundial 2026, con horarios y sedes.',
    en: '📅 All 104 World Cup 2026 matches with kickoff times and venues.',
  },
  stadiums: {
    es: '🏟️ Los 16 estadios del Mundial 2026 en EE.UU., México y Canadá.',
    en: '🏟️ The 16 stadiums of the World Cup 2026 across the USA, Mexico and Canada.',
  },
  coaches: {
    es: '🎯 Los entrenadores de las 48 selecciones del Mundial 2026.',
    en: '🎯 The coaches of all 48 World Cup 2026 teams.',
  },
  guide: {
    es: '📋 La guía oficial con los onces de cada selección del Mundial 2026.',
    en: '📋 The official guide with every World Cup 2026 team lineup.',
  },
  league: {
    es: '🤝 Crea una mini-liga y compite con tus amigos en el Mundial 2026.',
    en: '🤝 Create a mini-league and compete with friends at the World Cup 2026.',
  },
};

const HASHTAGS = {
  es: '#Mundial2026 #WorldCup2026 #FIFAWorldCup',
  en: '#WorldCup2026 #FIFAWorldCup #Football',
};

function parseArgs(argv) {
  const opts = { lang: 'es', theme: 'light', ratio: '16:9', text: null, view: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text') opts.text = argv[++i];
    else if (a === '--lang') opts.lang = argv[++i];
    else if (a === '--theme') opts.theme = argv[++i];
    else if (a === '--ratio') opts.ratio = argv[++i];
    else positional.push(a);
  }
  opts.view = positional[0] ?? null;
  return opts;
}

function listViews() {
  console.log('\n🐦 Vistas disponibles para post en X:\n');
  for (const key of VIEW_KEYS) {
    const v = VIEW_MAP[key];
    console.log(`   ${key.padEnd(10)} ${v.es} / ${v.en}`);
  }
  console.log('\nEjemplo: node scripts/generate-x-post.mjs estadios --ratio 16:9\n');
}

/** Recorta el tweet a 280 caracteres conservando palabras completas. */
function clampTweet(text) {
  if (text.length <= 280) return text;
  return text.slice(0, 277).replace(/\s+\S*$/, '') + '…';
}

async function generateXPost(opts) {
  const viewKey = resolveViewKey(opts.view);
  if (!viewKey) {
    console.error(`\n❌ Vista desconocida: "${opts.view}"`);
    listViews();
    process.exitCode = 1;
    return;
  }
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const ratio = RATIOS[opts.ratio] ? opts.ratio : '16:9';
  const dim = RATIOS[ratio];
  const outDir = join(rootDir, 'marketing', 'x');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log(`\n🐦 Post para X — vista "${viewKey}"`);
  console.log(`   Imagen: ${dim.width}×${dim.height} (${ratio}) · Idioma: ${lang}`);
  if (opts.text) console.log(`   Texto overlay: "${opts.text}"`);
  console.log('');

  let server, browser;
  try {
    console.log('🚀 Iniciando servidor dev...');
    server = await ensureDevServer();
    console.log('✅ Servidor listo\n');

    browser = await chromium.launch({ headless: true });
    const isPortrait = dim.height > dim.width;
    const ctx = await browser.newContext({
      viewport: { width: Math.floor(dim.width / 2), height: Math.floor(dim.height / 2) },
      deviceScaleFactor: 2,
      isMobile: isPortrait,
      hasTouch: isPortrait,
    });
    const page = await ctx.newPage();

    console.log('📱 Cargando app...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(1200);
    await applyLocaleAndTheme(page, { lang, theme: opts.theme });

    console.log(`🧭 Navegando a "${viewKey}"...`);
    await gotoView(page, viewKey);
    await sleep(1200);

    if (opts.text) {
      await injectTextOverlay(page, opts.text, { position: 'bottom' });
      await sleep(300);
    }

    const raw = await page.screenshot();
    const imgPath = join(outDir, `x-${viewKey}.png`);
    await sharp(raw)
      .resize(dim.width, dim.height, { fit: 'cover', position: 'top' })
      .png()
      .toFile(imgPath);
    console.log(`🖼️  Imagen: ${imgPath}`);

    // texto del tweet
    const base = TWEETS[viewKey]?.[lang] ?? '';
    const headline = opts.text ? `${opts.text} ` : '';
    const tweet = clampTweet(`${headline}${base}\n\n${APP_URL}\n${HASHTAGS[lang]}`);
    const txtPath = join(outDir, `x-${viewKey}.txt`);
    writeFileSync(txtPath, tweet, 'utf8');
    console.log(`📝 Texto del tweet: ${txtPath} (${tweet.length}/280 chars)`);
    console.log('\n✅ Post listo. Copia el texto y adjunta la imagen al publicar en X.\n');

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
  generateXPost(parseArgs(argv));
}
