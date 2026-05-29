// Genera el PDF completo de la Guía del Mundial 2026
// a partir del componente unificado e imprimible de la app.
//
// Uso:
//   node scripts/generate-guide-pdf.mjs [--lang es|en] [--mode auto|user] [--output RUTA]
//

import { chromium } from 'playwright';
import { join, isAbsolute } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  rootDir, DEV_URL, sleep, ensureDevServer,
  gotoView, applyLocaleAndTheme,
} from './lib/recording-utils.mjs';

function parseArgs(argv) {
  const opts = { lang: 'es', mode: 'auto', output: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang') {
      opts.lang = argv[++i];
    } else if (argv[i] === '--mode') {
      opts.mode = argv[++i];
    } else if (argv[i] === '--output') {
      opts.output = argv[++i];
    }
  }
  return opts;
}

function ensureDir(p) {
  if (!existsSync(p)) {
    mkdirSync(p, { recursive: true });
  }
  return p;
}

async function generate(opts) {
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const mode = opts.mode === 'user' ? 'user' : 'auto';
  
  const baseDir = ensureDir(join(rootDir, 'marketing', 'guide'));
  
  const defaultFilename = lang === 'en'
    ? 'world-cup-2026-guide-en.pdf'
    : 'guia-mundial-2026-es.pdf';
    
  let outputPath = opts.output;
  if (outputPath) {
    if (!isAbsolute(outputPath)) {
      outputPath = join(rootDir, outputPath);
    }
    ensureDir(join(outputPath, '..'));
  } else {
    outputPath = join(baseDir, defaultFilename);
  }

  console.log('\n📖 Generador de Guía del Mundial 2026 en PDF');
  console.log(`   Idioma: ${lang.toUpperCase()}`);
  console.log(`   Modo de Datos: ${mode.toUpperCase()} (${mode === 'auto' ? 'Simulado IA' : 'Predicciones de Usuario'})`);
  console.log(`   Destino: ${outputPath}\n`);

  let server, browser;
  try {
    console.log('🚀 Iniciando servidor dev...');
    server = await ensureDevServer();
    console.log('✅ Servidor listo\n');

    console.log('🌐 Iniciando navegador headless...');
    browser = await chromium.launch({ headless: true });
    
    // Crear contexto de navegador (con pantalla de alta resolución para capturas nítidas)
    const ctx = await browser.newContext({
      viewport: { width: 1200, height: 1600 },
      deviceScaleFactor: 2,
    });
    
    const page = await ctx.newPage();
    
    console.log('🔗 Navegando a la aplicación...');
    await page.goto(DEV_URL, { waitUntil: 'networkidle' });
    await sleep(1500);

    console.log(`🌍 Aplicando idioma (${lang.toUpperCase()}) y tema claro...`);
    await applyLocaleAndTheme(page, { lang, theme: 'light' });
    
    console.log('📄 Cargando la vista de la guía imprimible...');
    await gotoView(page, 'guide-print');
    await sleep(2500); // Dar tiempo para renderizado inicial del componente

    console.log(`⚙️ Configurando modo de datos a "${mode}"...`);
    const success = await page.evaluate((m) => {
      const el = document.querySelector('app-root')
        ?.shadowRoot?.querySelector('bracket-view')
        ?.shadowRoot?.querySelector('guide-print-view');
      if (el) {
        // TypeScript compilation preserves methods as js properties
        el._mode = m;
        el._regenerate();
        el.requestUpdate();
        return true;
      }
      return false;
    }, mode);

    if (!success) {
      throw new Error('No se pudo encontrar el componente <guide-print-view> en el DOM.');
    }

    console.log('⏳ Esperando a que se carguen todas las imágenes y fuentes...');
    await sleep(4000); // Esperar descarga de banderas y fotos locales

    console.log('📸 Capturando y ensamblando el documento en PDF...');
    console.log('   (Esto tardará unos segundos mientras se procesan las páginas)');

    // Iniciar escucha del evento de descarga en Playwright
    const downloadPromise = page.waitForEvent('download', { timeout: 120000 });

    // Hacer click en el botón de PDF a nivel DOM
    await page.evaluate(() => {
      const el = document.querySelector('app-root')
        ?.shadowRoot?.querySelector('bracket-view')
        ?.shadowRoot?.querySelector('guide-print-view');
      const pdfBtn = el?.shadowRoot?.querySelector('.pdf-btn');
      if (pdfBtn) {
        pdfBtn.click();
      } else {
        throw new Error('Botón de descarga de PDF no encontrado en <guide-print-view>');
      }
    });

    const download = await downloadPromise;
    
    console.log('💾 Guardando archivo PDF...');
    await download.saveAs(outputPath);

    console.log(`\n🎉 ¡Guía generada con éxito!`);
    console.log(`   Ruta: ${outputPath}\n`);

  } catch (err) {
    console.error('\n❌ Error al generar la guía:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill();
      console.log('🛑 Servidor dev detenido\n');
    }
  }
}

generate(parseArgs(process.argv.slice(2)));
