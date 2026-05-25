// Graba un reel vertical 9:16 (1080×1920) de UNA vista concreta de la app,
// con texto opcional quemado en el video. Salida lista para Instagram Reels.
//
// Uso:
//   node scripts/record-reel.mjs <vista> [--text "..."] [--lang es|en]
//                                        [--theme dark|light] [--duration N]
//                                        [--team <name>] [--end-text "..."]
//   node scripts/record-reel.mjs list
//
// Ejemplos:
//   node scripts/record-reel.mjs grupos --text "Sigue el Mundial 2026"
//   node scripts/record-reel.mjs estadios --lang en --theme dark
//   node scripts/record-reel.mjs equipos --team España --text "Convocatoria" --end-text "Promo final"

import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, convertToMp4, smoothScroll,
  gotoView, resolveViewKey, VIEW_KEYS, VIEW_MAP,
  applyLocaleAndTheme, injectTextOverlay, removeTextOverlay,
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
  const opts = { lang: 'es', theme: 'light', duration: 20, text: null, view: null, team: null, endText: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text') opts.text = (argv[++i] || '').replace(/\\n/g, '\n');
    else if (a === '--lang') opts.lang = argv[++i];
    else if (a === '--theme') opts.theme = argv[++i];
    else if (a === '--duration') opts.duration = parseInt(argv[++i], 10) || 20;
    else if (a === '--team') opts.team = argv[++i];
    else if (a === '--end-text') opts.endText = (argv[++i] || '').replace(/\\n/g, '\n');
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

async function clickTeamCard(page, teamName) {
  const found = await page.evaluate((name) => {
    const cards = document.querySelectorAll('.team-card');
    for (const card of cards) {
      const el = card.querySelector('.team-name');
      if (el?.textContent?.trim() === name) {
        card.click();
        return true;
      }
    }
    return false;
  }, teamName);
  if (!found) console.warn(`⚠️  No se encontró tarjeta para "${teamName}"`);
  await sleep(1500);
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

    // ── recording: multi-phase when a team is selected on squads view ──
    if (opts.team && viewKey === 'squads') {

      // Phase 1: grid overview with announcement text
      console.log('🎬 Fase 1: Vista general de equipos');
      if (opts.text) {
        await injectTextOverlay(page, opts.text, { position: 'bottom' });
      }
      await sleep(1800);
      await smoothScroll(page, 350, 2200);
      await sleep(600);

      // Phase 2: click team, show squad detail
      console.log(`🎬 Fase 2: Plantilla de ${opts.team}`);
      await removeTextOverlay(page);
      await sleep(300);
      await clickTeamCard(page, opts.team);

      const squadOverlay = opts.team + ' · 26 jugadores\nUna ilusión compartida 🇪🇸';
      await injectTextOverlay(page, squadOverlay, { position: 'bottom' });

      await sleep(1200);
      const t2 = Math.max(4000, opts.duration * 480);
      await smoothScroll(page, 700, t2 * 0.35);
      await sleep(800);
      await smoothScroll(page, 500, t2 * 0.30);
      await sleep(800);
      await smoothScroll(page, -500, t2 * 0.25);
      await sleep(600);

      // Phase 3: end promo
      if (opts.endText) {
        console.log('🎬 Fase 3: Promoción final');
        await removeTextOverlay(page);
        await sleep(300);
        await injectTextOverlay(page, opts.endText, { position: 'bottom' });
        await sleep(4500);
      }

    } else {
      // ── original single-view scroll ──
      if (opts.text) {
        await injectTextOverlay(page, opts.text, { position: 'bottom' });
      }

      console.log('🎬 Grabando recorrido...\n');
      const half = Math.max(2, Math.floor(opts.duration / 2));
      await sleep(1200);
      await smoothScroll(page, 700, half * 1000 * 0.55);
      await sleep(900);
      await smoothScroll(page, 500, half * 1000 * 0.4);
      await sleep(900);
      await smoothScroll(page, -900, half * 1000 * 0.5);
      await sleep(1500);
    }

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
    let caption;
    if (opts.team === 'España' || (opts.team || '').toUpperCase() === 'ESP') {
      caption = `¡Ya es oficial! 🚨 Tenemos la convocatoria de la Selección Española. Polémica servida en 3, 2, 1... 🇪🇸🏆\n\n¿Nos da el nivel con estos jugadores para volver a levantar la Copa del Mundo o nos volvemos antes de tiempo? Es hora de dejar de discutir con los amigos y demostrar lo que sabes.\n\nEntra en 🌐 bracketmundial.com (tienes el enlace directo en mi bio 🔗) y empieza a jugar:\n✅ Arma tu propio cuadro de eliminatorias hacia la final totalmente gratis.\n✅ Reta a tus amigos a ver quién tiene mejor ojo.\n✅ Guarda tus pronósticos y demuestra quién es el verdadero rey de las predicciones.\n\n👇 ¡El debate está abajo! Ponme en comentarios en qué ronda crees que cae España. ¡Os leo!\n\n#SeleccionEspañola #Convocatoria #LaRoja #Mundial2026 #BracketMundial #Futbol #Pronosticos #España #FiebreMundialista`;
    } else {
      const base = CAPTIONS[viewKey]?.[lang] ?? '';
      caption = `${opts.text ? opts.text + '\n\n' : ''}${base}\n\n${HASHTAGS[lang]}`;
    }
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
