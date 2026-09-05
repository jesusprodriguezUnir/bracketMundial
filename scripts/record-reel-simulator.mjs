// Graba un reel vertical 9:16 (1080×1920) enfocado en el nuevo Simulador de Champions League 2026/27.
// Muestra: Jornadas con cuotas 1X2 -> Simulación en 1 click -> Tabla de 36 clubes -> Cuadro de eliminatorias -> Campeón.
//
// Salida:
//   - recordings/reel-simulador-ucl.mp4
//   - recordings/reel-simulador-ucl.caption.txt
//
// Uso:
//   node scripts/record-reel-simulator.mjs

import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import {
  rootDir, DEV_URL, sleep, ensureDevServer, convertToMp4, smoothScroll,
  gotoView, applyLocaleAndTheme, injectTextOverlay, removeTextOverlay,
} from './lib/recording-utils.mjs';

const REEL = { width: 1080, height: 1920 };

const CAPTION = `¿QUIÉN GANA LA NUEVA CHAMPIONS? 🏆⚽ ¡Ya está disponible el NUEVO SIMULADOR 2026/27 con probabilidades reales! 🔥

Actualizamos la app con el formato oficial de 36 clubes y un motor estadístico completo:

📊 Cuotas 1X2 de casas de apuestas: cada uno de los 144 partidos de la fase liga tiene sus probabilidades calculadas.
⚡ Simulación realista en 1-click: simula jornada a jornada o todo el torneo de golpe.
📋 Tabla con desempates oficiales UEFA: puntos, diferencia de goles, goles a favor y fuera de casa al instante.
⚔️ Cuadro de Play-offs y Eliminatorias: descubre quién entra al Top 8 directo, quién sufre en los play-offs (puestos 9 al 24) y quién levanta la Orejona.
🤝 Mini-Ligas privadas: crea una liga con tus amigos y compite por ver quién sabe más de fútbol.

👉 Pruébalo GRATIS ahora mismo desde el enlace en nuestra bio 🔗

👇 DEBATE EN COMENTARIOS:
¿Qué 8 equipos crees que clasifican directo a Octavos sin pasar por los play-offs? ¡Te leemos! 💬👀

#ChampionsLeague #UCL #UCL2027 #PorraChampions #SimuladorUCL #Futbol #RealMadrid #FCBarcelona #ManCity #Bayern #Arsenal #Inter #Atleti #Quiniela #BracketNights #FutbolEuropeo`;

async function recordSimulatorReel() {
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log('\n🎬 ========================================================');
  console.log('   GRABANDO REEL DE INSTAGRAM: SIMULADOR CHAMPIONS LEAGUE');
  console.log(`   Resolución: ${REEL.width}×${REEL.height} (9:16 vertical)`);
  console.log('========================================================\n');

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

    console.log('📱 Cargando aplicación...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(1500);

    // Configurar idioma español y tema claro retro
    console.log('⚙️ Configurando tema claro e idioma español...');
    await applyLocaleAndTheme(page, { lang: 'es', theme: 'light' });

    // Limpiar estado para empezar con pronósticos vacíos
    console.log('🧹 Reseteando pronósticos del torneo...');
    await page.evaluate(async () => {
      const storeModule = await import('/src/store/tournament-store.ts');
      storeModule.useTournamentStore.getState().resetTournament();
    });
    await sleep(800);

    // ── FASE 1: JORNADAS Y CUOTAS 1X2 ──
    console.log('🎬 Fase 1: Vista de Jornadas con cuotas...');
    await gotoView(page, 'matchday');
    await sleep(600);

    await injectTextOverlay(page, '🏆 SIMULADOR UCL 2026/27\n144 Partidos · Cuotas Reales 1X2', { position: 'bottom' });
    await sleep(2200);

    // Scroll suave para mostrar partidos de la Jornada 1
    await smoothScroll(page, 320, 1800);
    await sleep(800);
    await smoothScroll(page, -320, 1000);
    await sleep(500);

    // ── FASE 2: SIMULACIÓN EN 1 CLICK ──
    console.log('🎬 Fase 2: Simulación instantánea de todas las jornadas...');
    await removeTextOverlay(page);
    await sleep(250);

    await injectTextOverlay(page, '⚡ 1-CLICK: TODAS LAS JORNADAS\nSimulación con cuotas y goleadores', { position: 'bottom' });
    await sleep(1000);

    // Disparar click en "Simular todas"
    const clickedSimulate = await page.evaluate(() => {
      const matchdayEl = document.querySelector('app-root')
        ?.shadowRoot?.querySelector('mobile-app')
        ?.shadowRoot?.querySelector('matchday-view')
        ?? document.querySelector('app-root')
        ?.shadowRoot?.querySelector('bracket-view')
        ?.shadowRoot?.querySelector('matchday-view');

      const simAllBtn = matchdayEl?.shadowRoot?.querySelector('.action-btn.primary-action');
      if (simAllBtn) {
        simAllBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedSimulate) {
      // Fallback directo al store
      console.log('   Invocando autoSimulateGroups desde el store...');
      await page.evaluate(async () => {
        const storeModule = await import('/src/store/tournament-store.ts');
        storeModule.useTournamentStore.getState().autoSimulateGroups();
      });
    }

    await sleep(1500); // dejar que se aprecie el toast y los resultados generados

    // Scroll para ver marcadores asignados
    await smoothScroll(page, 400, 2200);
    await sleep(600);
    await smoothScroll(page, -400, 1200);
    await sleep(500);

    // ── FASE 3: TABLA DE 36 CLUBES CON DESEMPATES ──
    console.log('🎬 Fase 3: Tabla general de 36 clubes...');
    await removeTextOverlay(page);
    await sleep(250);

    await injectTextOverlay(page, '📊 CLASIFICACIÓN DE 36 CLUBES\nTop 8 Directo · Puestos 9-24 Play-offs', { position: 'bottom' });
    await gotoView(page, 'groups');
    await sleep(1200);

    // Scroll por la tabla
    await smoothScroll(page, 550, 2500);
    await sleep(800);
    await smoothScroll(page, -550, 1400);
    await sleep(500);

    // ── FASE 4: EL BRACKET DE ELIMINATORIAS Y CAMPEÓN ──
    console.log('🎬 Fase 4: Cruces de eliminatorias y coronación del campeón...');
    await removeTextOverlay(page);
    await sleep(250);

    await injectTextOverlay(page, '⚔️ PLAY-OFFS Y ELIMINATORIAS\nDe los play-offs a la Gran Final', { position: 'bottom' });
    await gotoView(page, 'knockout');
    await sleep(1200);

    // Simular el bracket
    await page.evaluate(async () => {
      const storeModule = await import('/src/store/tournament-store.ts');
      storeModule.useTournamentStore.getState().autoSimulateKnockout();
    });
    await sleep(1800);

    await smoothScroll(page, 300, 1500);
    await sleep(600);

    // ── FASE 5: LLAMADO A LA ACCIÓN (CTA) ──
    console.log('🎬 Fase 5: Call to action final...');
    await removeTextOverlay(page);
    await sleep(250);

    await injectTextOverlay(page, '⚽ HAZ TU PRONÓSTICO GRATIS\nLink directo en la bio 🔗', { position: 'bottom' });
    await sleep(3500);

    await removeTextOverlay(page);
    await sleep(300);

    // Finalizar grabación de video
    const rawPath = await page.video().path();
    await ctx.close();

    const outMp4 = join(outDir, 'reel-simulador-ucl.mp4');
    console.log(`\n🎞️  Video WebM crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264 vertical...');
    await convertToMp4(rawPath, outMp4);
    console.log(`✅ Video final: ${outMp4}`);
    try { unlinkSync(rawPath); } catch {}

    // Escribir caption de publicación
    const captionPath = join(outDir, 'reel-simulador-ucl.caption.txt');
    writeFileSync(captionPath, CAPTION, 'utf8');
    console.log(`📝 Caption de Instagram: ${captionPath}`);

    console.log('\n🎉 ¡REEL DE INSTAGRAM COMPLETADO CON ÉXITO!\n');

  } catch (err) {
    console.error('\n❌ Error durante la grabación del reel:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor dev detenido\n'); }
  }
}

recordSimulatorReel();
