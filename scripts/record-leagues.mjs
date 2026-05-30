import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, createWriteStream } from 'fs';
import https from 'https';
import { exec } from 'child_process';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, smoothScroll,
  gotoView, applyLocaleAndTheme, injectTextOverlay, removeTextOverlay,
} from './lib/recording-utils.mjs';

const VIEWPORT = { width: 432, height: 768 };
const VIDEO_SIZE = { width: 1080, height: 1920 };

function downloadAudio(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Código de estado fallido al descargar audio: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      unlinkSync(dest);
      reject(err);
    });
  });
}

async function recordLeagues() {
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const audioPath = join(outDir, 'music.mp3');
  try {
    if (!existsSync(audioPath)) {
      console.log('🎵 Descargando música de fondo libre de derechos (SoundHelix)...');
      await downloadAudio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', audioPath);
      console.log('✅ Música descargada exitosamente.');
    } else {
      console.log('🎵 Música de fondo local encontrada.');
    }
  } catch (err) {
    console.warn('⚠️  No se pudo descargar la música de fondo, se grabará sin sonido:', err.message);
  }

  console.log(`\n🎬 Grabando video optimizado de la sección Ligas`);
  console.log(`   Resolución: ${VIDEO_SIZE.width}×${VIDEO_SIZE.height} (Vertical 9:16)`);
  console.log('');

  let server, browser;
  try {
    console.log('🚀 Iniciando servidor dev...');
    server = await ensureDevServer();
    console.log('✅ Servidor listo\n');

    console.log('🌐 Iniciando navegador Chromium...');
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2.5,
      recordVideo: { dir: outDir, size: VIDEO_SIZE },
    });
    const startTime = Date.now();
    const page = await ctx.newPage();

    console.log('📱 Cargando la aplicación...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(1500);

    // Configurar español y tema claro para el estilo Panini retro
    console.log('⚙️  Configurando idioma (ES) y tema (LIGHT)...');
    await applyLocaleAndTheme(page, { lang: 'es', theme: 'light' });

    // Ajustar zoom para óptima visualización en grabación
    console.log('🔍 Ajustando nivel de escala...');
    await page.evaluate(() => {
      document.body.style.zoom = '0.90';
    });
    await sleep(500);

    // Resetear/limpiar estado de ligas
    console.log('🧹 Limpiando base de datos local de ligas anteriores...');
    await page.evaluate(async () => {
      const storeModule = await import('/src/store/leagues-store.ts');
      storeModule.useLeaguesStore.setState({ leagues: [], activeLeagueId: null });
    });
    await sleep(1000);

    // Navegar directamente a la pestaña de Ligas
    console.log('🧭 Posicionando en sección Ligas...');
    await gotoView(page, 'league');
    await sleep(800);

    const demoStartTime = Date.now();
    const setupDuration = (demoStartTime - startTime) / 1000;
    console.log(`⏱️  El setup tomó ${setupDuration.toFixed(2)}s.`);
    console.log('🎬 Iniciando secuencia de grabación optimizada…\n');

    // ── Escena 1: Introducción a Mini-Ligas (0s -> 2.5s) ──
    console.log('   📺 Escena 1: Introducción a Mini-Ligas');
    await injectTextOverlay(page, '📊 MINI LIGAS EN BRACKETMUNDIAL\nCrea ligas personalizadas para competir con amigos o familiares en el Mundial.', { position: 'bottom' });
    await sleep(2500);

    // ── Escena 2: Rellenar formulario y crear liga (2.5s -> 6.5s) ──
    console.log('   📺 Escena 2: Creación de la Liga');
    await removeTextOverlay(page);
    await sleep(200);
    await injectTextOverlay(page, '＋ CREACIÓN INSTANTÁNEA\nIngresa el nombre de la liga y tu apodo de jugador para iniciar.', { position: 'bottom' });
    await sleep(800);

    console.log('      👉 Rellenando nombre de la liga...');
    await page.locator('.lg-v2-create-inline input').nth(0).fill('Liga de Campeones 2026');
    await sleep(600);

    console.log('      👉 Rellenando apodo del creador...');
    await page.locator('.lg-v2-create-inline input').nth(1).fill('Jesús');
    await sleep(600);

    await removeTextOverlay(page);
    await sleep(200);

    console.log('      👉 Click en "Crear liga"');
    await page.locator('.lg-v2-create-inline button').filter({ hasText: 'Crear' }).click();
    await sleep(2200); // Esperar la transición a la vista de detalle de la liga

    // ── Escena 3: Edición Contextual y Predicciones (6.5s -> 14.5s) ──
    console.log('   📺 Escena 3: Edición Contextual de Pronósticos');
    await injectTextOverlay(page, '🔗 PRONÓSTICOS INDEPENDIENTES\nPresiona editar para rellenar tus predicciones de partidos en esta liga.', { position: 'bottom' });
    await sleep(2200);
    await removeTextOverlay(page);
    await sleep(200);

    console.log('      👉 Click en "Editar mi predicción en esta liga"');
    await page.locator('.lg-v2-edit-prediction-row button').click();
    await sleep(1800); // Redirige a la pestaña de Grupos bajo el contexto de liga

    await injectTextOverlay(page, '🎲 BRACKET EXCLUSIVO DE LIGA\nUsa la simulación o pronostica manualmente todo el torneo para la liga.', { position: 'bottom' });
    await sleep(1200);
    await removeTextOverlay(page);
    await sleep(200);

    console.log('      👉 Click en "Simular Grupos"');
    await page.locator('.group-actions button.btn-primary').click();
    await sleep(1800);

    // Desplazamiento para ver tablas
    await smoothScroll(page, 400, 600);
    await sleep(800);
    await smoothScroll(page, -400, 400);
    await sleep(400);

    // Ir a Cruces
    console.log('      👉 Navegando a Cruces...');
    await gotoView(page, 'knockout');
    await sleep(400);

    console.log('      👉 Click en "Simular Resto del Torneo"');
    // En la vista móvil, el botón es .mob-header-action con "🎲 SIMULAR RESTO" (en mayúsculas por el css/traducción, o en el texto del HTML). 
    // .locator('button.mob-header-action') sirve.
    await page.locator('button.mob-header-action').first().click();
    await sleep(1800);

    // Desplazar el bracket verticalmente
    console.log('      👉 Desplazamiento vertical del bracket...');
    await smoothScroll(page, 500, 600);
    await sleep(600);
    await smoothScroll(page, -500, 600);
    await sleep(1000);

    // ── Escena 4: Configurar Premios Extra en el Bracket (14.5s -> 20.0s) ──
    console.log('   📺 Escena 4: Configuración de Premios Especiales');
    await injectTextOverlay(page, '🏅 PREMIOS ESPECIALES\nElige de antemano a tu Máximo Goleador y MVP para obtener puntos extra.', { position: 'bottom' });
    await sleep(1500);
    await removeTextOverlay(page);
    await sleep(200);

    // Seleccionar Máximo Goleador
    console.log('      👉 Seleccionando Máximo Goleador (Mbappé)...');
    await page.locator('.awards-grid .award-card').nth(0).locator('button.award-btn').click();
    await sleep(600);
    await page.locator('input[type="search"]').fill('Mbappe');
    await sleep(800);
    await page.locator('div.awards-search-grid button').first().click();
    await sleep(1000);

    // Seleccionar MVP
    console.log('      👉 Seleccionando MVP (Yamal)...');
    await page.locator('.awards-grid .award-card').nth(1).locator('button.award-btn').click();
    await sleep(600);
    await page.locator('input[type="search"]').fill('Yamal');
    await sleep(800);
    await page.locator('div.awards-search-grid button').first().click();
    await sleep(1200);

    // ── Escena 5: Retorno a la Liga y Simulación/Proyección (20.0s -> 26.0s) ──
    console.log('   📺 Escena 5: Regreso a la Liga y Proyecciones');
    await gotoView(page, 'league');
    await sleep(800);

    // Re-entrar al detalle de la liga desde la lista
    console.log('      👉 Click en la liga desde la lista...');
    await page.locator('.lg-v2-card').first().click();
    await sleep(800);

    await injectTextOverlay(page, '📈 PROYECCIONES Y SIMULACIONES\nActiva la Simulación matemática para proyectar clasificaciones al instante.', { position: 'bottom' });
    await sleep(1800);
    await removeTextOverlay(page);
    await sleep(200);

    console.log('      👉 Seleccionando Modo Simulación...');
    await page.locator('.lg-league-chip-btn').nth(1).click();
    await sleep(1000);

    console.log('      👉 Click en "Simular Todo"');
    await page.locator('.lg-simulate-world-btn').filter({ hasText: 'Simular' }).click();
    await sleep(1500);

    // Scroll vertical suave para ver la tabla simulada
    await smoothScroll(page, 200, 500);
    await sleep(800);
    await smoothScroll(page, -200, 300);
    await sleep(400);

    // ── Escena 6: Outro (26.0s -> 28.5s) ──
    console.log('   📺 Escena 6: Outro Promocional');
    await injectTextOverlay(page, '🏆 LIGAS DE BRACKETMUNDIAL\nCrea tu cuenta y juega gratis hoy mismo en:\nbracketmundial.com', { position: 'bottom' });
    await sleep(2500);

    // Quitar overlay final
    await removeTextOverlay(page);
    await sleep(200);

    // Finalizar grabación
    const rawPath = await page.video().path();
    await ctx.close();
    await browser.close();

    const outMp4 = join(outDir, 'leagues-tutorial.mp4');
    console.log(`\n🎞️  WebM crudo: ${rawPath}`);

    // Calcular tiempos de recorte: quitar 10s del inicio (tras el setup) y 10s del final
    const demoTotalDuration = (Date.now() - demoStartTime) / 1000;
    const startTrim = (setupDuration + 10).toFixed(2);
    const trimDuration = (demoTotalDuration - 10 - 10).toFixed(2);

    console.log(`⏱️  Duración de la demo: ${demoTotalDuration.toFixed(2)}s.`);
    console.log(`🎬 Recortando primeros 10s (inicio final en ${startTrim}s) y últimos 10s (duración resultante de ${trimDuration}s)...`);

    let cmd;
    if (existsSync(audioPath)) {
      console.log('🎬 Mezclando con música de fondo SoundHelix...');
      cmd = `ffmpeg -y -i "${rawPath}" -i "${audioPath}" -ss ${startTrim} -t ${trimDuration} -map 0:v -map 1:a -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -shortest "${outMp4}"`;
    } else {
      console.log('🎬 Procesando video sin sonido (no se encontró pista)...');
      cmd = `ffmpeg -y -i "${rawPath}" -ss ${startTrim} -t ${trimDuration} -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${outMp4}"`;
    }

    console.log(`💻 Ejecutando comando ffmpeg: ${cmd}`);
    await new Promise((resolve, reject) => {
      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`\n✅ Video tutorial optimizado con sonido y recortes guardado en: ${outMp4}\n`);
    try { unlinkSync(rawPath); } catch {}

  } catch (err) {
    console.error('\n❌ Error en la grabación:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor dev detenido\n'); }
  }
}

recordLeagues();
