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
    es: '⚽ Vive cada partido: cuenta atrás, noticias de última hora y simulador interactivo.',
    en: '⚽ Live every match: live countdown, breaking news and interactive simulator.',
  },
  groups: {
    es: '📊 Clasificación general en vivo: sigue posiciones, puntos y diferencia de goles.',
    en: '📊 Live standings table: track points, goal difference and qualified spots.',
  },
  matchday: {
    es: '⚽ Toda la jornada al detalle: horarios, enfrentamientos y predicciones en directo.',
    en: '⚽ Full matchday breakdown: fixtures, kickoff times and live score predictions.',
  },
  knockout: {
    es: '🏆 Arma tu bracket de eliminatorias y predice al campeón.',
    en: '🏆 Build your knockout bracket and predict the champion.',
  },
  squads: {
    es: '👥 Explora plantillas oficiales, dorsales y alineaciones de cada equipo.',
    en: '👥 Explore official squads, shirt numbers and team lineups.',
  },
  calendar: {
    es: '📅 Calendario completo de partidos con horarios locales y sedes.',
    en: '📅 Full match schedule with local kickoff times and venues.',
  },
  stadiums: {
    es: '🏟️ Todos los estadios y sedes del torneo al detalle.',
    en: '🏟️ Complete stadium and venue guide.',
  },
  coaches: {
    es: '🎯 Los directores técnicos y estrategas que definirán el campeonato.',
    en: '🎯 The head coaches and tactical masterminds leading every team.',
  },
  guide: {
    es: '📋 Guía táctica con onces probables y estrellas a seguir.',
    en: '📋 Tactical guide with probable lineups and key stars.',
  },
  league: {
    es: '🤝 Crea una mini-liga privada y reta a tus amigos a acertar los marcadores.',
    en: '🤝 Create a private mini-league and challenge friends in the prediction pool.',
  },
};

const HASHTAGS = {
  es: '#ChampionsLeague #UCL #Mundial2026 #WorldCup2026 #Futbol #Porra #BracketNights',
  en: '#ChampionsLeague #UCL #WorldCup2026 #Football #Soccer #Predictions #BracketNights',
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
