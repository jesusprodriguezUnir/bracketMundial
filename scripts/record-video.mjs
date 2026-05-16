import { chromium } from 'playwright';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const PLATFORMS = {
  instagram: { width: 1080, height: 1920, name: 'Instagram/TikTok' },
  tiktok: { width: 1080, height: 1920, name: 'TikTok' },
  facebook: { width: 1080, height: 1080, name: 'Facebook' },
  twitter: { width: 1920, height: 1080, name: 'Twitter/X' },
};

const DEFAULT_PLATFORM = 'instagram';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

async function startDevServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'dev'], {
      cwd: rootDir,
      shell: true,
      stdio: 'pipe',
    });

    proc.stdout.on('data', () => {});
    proc.stderr.on('data', () => {});

    setTimeout(() => resolve(proc), 3000);
  });
}

async function recordDemo(platform = DEFAULT_PLATFORM, durationSec = 30) {
  const config = PLATFORMS[platform] || PLATFORMS[DEFAULT_PLATFORM];
  const { width, height } = config;
  const outputDir = join(rootDir, 'recordings');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🎬 Grabando Video Demo para ${config.name}`);
  console.log(`   Resolución: ${width}x${height}`);
  console.log(`   Duración Objetivo: ~${durationSec}s\n`);

  let server;
  let browser;

  try {
    console.log('🚀 Iniciando servidor de desarrollo...');
    server = await startDevServer();

    const serverReady = await waitForServer('http://localhost:5173');
    if (!serverReady) throw new Error('El servidor no inició a tiempo');

    console.log('✅ Servidor listo\n');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      recordVideo: {
        dir: outputDir,
        size: { width, height }
      }
    });

    const page = await context.newPage();
    console.log('📱 Cargando la app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Esperar a que la página se pinte completamente
    await sleep(2000);

    // Helper de smooth scroll
    async function smoothScroll(pixels, duration) {
      const steps = 30;
      const stepDelay = duration / steps;
      const stepPixels = pixels / steps;
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, stepPixels);
        await sleep(stepDelay);
      }
    }

    console.log('🎬 Iniciando interacciones automáticas...\n');

    // Localizar todas las tabs de la página
    const tabsLocator = page.locator('.phase-tab');
    const tabCount = await tabsLocator.count();
    
    // Distribuir el tiempo estimado entre las pestañas disponibles
    const totalTimeMs = durationSec * 1000;
    const timePerTab = tabCount > 0 ? Math.max(3000, totalTimeMs / tabCount) : 5000;

    // Scroll inicial en la home (Hero)
    console.log('   ✓ Sección: Inicio');
    await smoothScroll(600, 1000);
    await sleep(timePerTab / 3);
    await smoothScroll(-600, 800);
    await sleep(500);

    // Navegar por cada tab
    for (let i = 0; i < tabCount; i++) {
      const tab = tabsLocator.nth(i);
      const text = await tab.textContent();
      
      // Saltar si la tab es invisible o inactiva temporalmente (aunque Playwright autoespera)
      if (await tab.isVisible()) {
        console.log(`   ✓ Navegando a: ${text?.trim()}`);
        await tab.click();
        await sleep(800); // Dar tiempo al render y animaciones
        
        // Simular exploración de la pestaña
        await smoothScroll(800, 1500);
        await sleep(timePerTab / 2);
        
        // Volver arriba para la próxima tab
        await smoothScroll(-800, 1000);
        await sleep(timePerTab / 4);
      }
    }

    // Esperar al final para que quede bien grabado el último frame
    await sleep(1500);

    // Obtener la ruta del video webm grabado
    const videoPath = await page.video().path();
    
    // Cerrar el contexto vuelca el buffer del video a disco
    await context.close();
    
    const finalVideo = join(outputDir, `demo-${platform}.mp4`);
    console.log(`\n🎞️  Video nativo generado por Playwright: ${videoPath}`);
    console.log(`🎬 Convirtiendo a formato listo para redes (${finalVideo})...`);

    await new Promise((resolve) => {
      // Usar ffmpeg para convertir el webm a mp4 (h264)
      const cmd = `ffmpeg -y -i "${videoPath}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${finalVideo}"`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error ejecutando ffmpeg. ¿Está instalado en el sistema?', error.message);
        } else {
          console.log(`✅ Video final MP4 guardado con éxito: ${finalVideo}`);
          // Limpiar archivo crudo webm
          try { unlinkSync(videoPath); } catch (e) {}
        }
        resolve(true);
      });
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
    if (server) {
      server.kill();
      console.log('🛑 Servidor dev detenido\n');
    }
  }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'list') {
  console.log('\n📹 Plataformas disponibles:');
  Object.entries(PLATFORMS).forEach(([key, cfg]) => {
    console.log(`   ${key}: ${cfg.name} (${cfg.width}x${cfg.height})`);
  });
  console.log('');
} else {
  const platform = command || DEFAULT_PLATFORM;
  const duration = parseInt(args[1]) || 30; // 30s por defecto
  recordDemo(platform, duration);
}