import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, convertToMp4, smoothScroll,
  gotoView, applyLocaleAndTheme, injectTextOverlay, removeTextOverlay,
} from './lib/recording-utils.mjs';

const VIEWPORT = { width: 1920, height: 1080 };

async function recordSimulation() {
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log(`\n🎬 Grabando video optimizado de Simulación y Premios`);
  console.log(`   Resolución: ${VIEWPORT.width}×${VIEWPORT.height} (Horizontal 16:9)`);
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
      deviceScaleFactor: 2,
      recordVideo: { dir: outDir, size: VIEWPORT },
    });
    const startTime = Date.now();
    const page = await ctx.newPage();

    console.log('📱 Cargando la aplicación...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(1500);

    // Configurar español y tema claro
    console.log('⚙️  Configurando idioma (ES) y tema (LIGHT)...');
    await applyLocaleAndTheme(page, { lang: 'es', theme: 'light' });

    // Resetear estado
    console.log('🧹 Limpiando estado de torneos anteriores...');
    await page.evaluate(async () => {
      const storeModule = await import('/src/store/tournament-store.ts');
      storeModule.useTournamentStore.getState().resetTournament();
    });
    await sleep(1000);

    // Navegar directamente a la pestaña de Grupos antes de empezar la demo
    console.log('🧭 Posicionando en sección Grupos...');
    await gotoView(page, 'groups');
    await sleep(800);

    const demoStartTime = Date.now();
    const trimStartSeconds = Math.max(0, ((demoStartTime - startTime - 200) / 1000)).toFixed(2);
    console.log(`⏱️  El setup tomó ${((demoStartTime - startTime) / 1000).toFixed(2)}s. Se recortará a ${trimStartSeconds}s.`);
    console.log('🎬 Iniciando secuencia de grabación optimizada…\n');

    // ── 1. GRUPOS COMPONENT (0s -> 1.5s) ──
    console.log('   📺 Escena 1: Fase de Grupos Pendiente');
    await injectTextOverlay(page, '📊 FASE DE GRUPOS\nTodos los partidos comienzan pendientes, esperando tus pronósticos.', { position: 'bottom' });
    await sleep(1500);

    // ── 2. SIMULAR GRUPOS (1.5s -> 4.1s) ──
    console.log('   📺 Escena 2: Simulación Inteligente');
    await removeTextOverlay(page);
    await sleep(200);
    await injectTextOverlay(page, '🎲 SIMULACIÓN COMPLETA\nResultados realistas según nivel de equipos y cuotas reales de apuestas.', { position: 'bottom' });
    await sleep(1000);
    
    console.log('      👉 Click en "SIMULAR GRUPOS"');
    const btnSimulateGroups = page.locator('.group-actions button.btn-primary');
    await btnSimulateGroups.click();
    await sleep(1800);

    // ── 3. MOSTRAR CLASIFICACIÓN (4.1s -> 6.5s) ──
    console.log('   📺 Escena 3: Posiciones y Mejores Terceros');
    await removeTextOverlay(page);
    await sleep(200);
    await injectTextOverlay(page, '📈 TABLAS Y MEJORES TERCEROS\nEl sistema calcula al instante los clasificados a dieciseisavos (1/16).', { position: 'bottom' });
    // Scroll vertical suave para ver la clasificación y mejores terceros abajo
    await smoothScroll(page, 550, 800);
    await sleep(500);
    await smoothScroll(page, -350, 500);
    await sleep(400);

    // ── 4. NAVEGAR A CRUCES (6.5s -> 9.0s) ──
    console.log('   📺 Escena 4: El Bracket Directo');
    await removeTextOverlay(page);
    await sleep(200);
    await gotoView(page, 'knockout');
    await sleep(300);
    await injectTextOverlay(page, '🌳 BRACKET AUTOMÁTICO\nLos clasificados se colocan solos en la ronda de 1/16 de la llave.', { position: 'bottom' });
    await sleep(1500);

    // ── 5. SIMULAR ELIMINATORIAS (9.0s -> 11.8s) ──
    console.log('   📺 Escena 5: Simular Fase Final');
    await removeTextOverlay(page);
    await sleep(200);
    await injectTextOverlay(page, '⚡ SIMULAR RESTO DEL TORNEO\nCruces directos y prórrogas/penaltis simulados hasta la gran final.', { position: 'bottom' });
    await sleep(800);

    console.log('      👉 Click en "SIMULAR RESTO"');
    const btnSimulateRest = page.locator('.bracket-actions-btns button.btn');
    await btnSimulateRest.click();
    await sleep(1800);

    // ── 6. MOSTRAR CAMPEÓN Y BRACKET (11.8s -> 15.0s) ──
    console.log('   📺 Escena 6: Campeón y Recorrido del Bracket');
    await removeTextOverlay(page);
    await sleep(200);
    await injectTextOverlay(page, '👑 CAMPEÓN DEFINIDO\nEl trofeo central y todo el bracket se autocompletan en segundos.', { position: 'bottom' });
    
    // Desplazar el bracket horizontalmente
    console.log('      👉 Desplazamiento horizontal al centro');
    await page.evaluate(() => {
      const scrollEl = document.querySelector('app-root')
        ?.shadowRoot?.querySelector('bracket-view')
        ?.shadowRoot?.querySelector('bracket-knockout')
        ?.shadowRoot?.querySelector('.bracket-scroll');
      if (scrollEl) {
        scrollEl.scrollTo({ left: 350, behavior: 'smooth' });
      }
    });
    await sleep(800);

    console.log('      👉 Desplazamiento horizontal a la derecha');
    await page.evaluate(() => {
      const scrollEl = document.querySelector('app-root')
        ?.shadowRoot?.querySelector('bracket-view')
        ?.shadowRoot?.querySelector('bracket-knockout')
        ?.shadowRoot?.querySelector('.bracket-scroll');
      if (scrollEl) {
        scrollEl.scrollTo({ left: 800, behavior: 'smooth' });
      }
    });
    await sleep(800);

    console.log('      👉 Volviendo al centro');
    await page.evaluate(() => {
      const scrollEl = document.querySelector('app-root')
        ?.shadowRoot?.querySelector('bracket-view')
        ?.shadowRoot?.querySelector('bracket-knockout')
        ?.shadowRoot?.querySelector('.bracket-scroll');
      if (scrollEl) {
        scrollEl.scrollTo({ left: 350, behavior: 'smooth' });
      }
    });
    await sleep(400);

    // ── 7. SELECCIÓN DE PREMIOS (15.0s -> 22.0s) ──
    console.log('   📺 Escena 7: Elección de Premios Individuales');
    await removeTextOverlay(page);
    await sleep(200);
    
    // Scroll vertical suave para revelar bien el panel de premios arriba del bracket
    console.log('      👉 Scroll hacia abajo para ver premios');
    await smoothScroll(page, 180, 500);
    await sleep(300);

    await injectTextOverlay(page, '🏅 PREMIOS INDIVIDUALES\nCompleta tu pronóstico eligiendo al Máximo Goleador y al MVP.', { position: 'bottom' });
    await sleep(1500);
    await removeTextOverlay(page);
    await sleep(200);

    // ── Seleccionar Máximo Goleador ──
    console.log('      👉 Seleccionando Máximo Goleador (Mbappé)...');
    await page.locator('.awards-grid .award-card').nth(0).locator('button.award-btn').click();
    await sleep(400);
    await page.locator('.awards-search-input').fill('Mbappe');
    await sleep(400);
    await page.locator('.search-player-item').first().click();
    await sleep(500);

    // ── Seleccionar MVP ──
    console.log('      👉 Seleccionando MVP (Yamal)...');
    await page.locator('.awards-grid .award-card').nth(1).locator('button.award-btn').click();
    await sleep(400);
    await page.locator('.awards-search-input').fill('Yamal');
    await sleep(400);
    await page.locator('.search-player-item').first().click();
    await sleep(600);

    // ── 8. OUTRO Y CIERRE (22.0s -> 24.3s) ──
    console.log('   📺 Escena 8: Promoción Final');
    await injectTextOverlay(page, '⚽ JUEGA GRATIS EN:\nbracketmundial.com', { position: 'bottom' });
    await sleep(2000);

    // Quitar overlay final
    await removeTextOverlay(page);
    await sleep(300);

    // Finalizar grabación
    const rawPath = await page.video().path();
    await ctx.close();

    const outMp4 = join(outDir, 'simulacion-tutorial.mp4');
    console.log(`\n🎞️  WebM crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264 con ffmpeg…');
    await convertToMp4(rawPath, outMp4, trimStartSeconds);
    console.log(`\n✅ Video optimizado listo en: ${outMp4}\n`);
    try { unlinkSync(rawPath); } catch {}

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor detenido\n'); }
  }
}

recordSimulation();
