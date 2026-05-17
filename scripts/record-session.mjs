import { chromium } from 'playwright';
import { spawn, exec, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outDir = join(rootDir, 'recordings');
const shotsDir = join(outDir, 'session-screenshots');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function detectScreenSize() {
  try {
    const out = execSync(
      'powershell -Command "Get-WmiObject Win32_VideoController | Format-List CurrentHorizontalResolution, CurrentVerticalResolution"',
      { encoding: 'utf8', timeout: 5000, shell: true }
    );
    const w = parseInt(out.match(/CurrentHorizontalResolution\s*:\s*(\d+)/)?.[1], 10);
    const h = parseInt(out.match(/CurrentVerticalResolution\s*:\s*(\d+)/)?.[1], 10);
    if (w > 0 && h > 0) return { width: w, height: h };
  } catch {}
  return { width: 1920, height: 1080 };
}

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

function startDevServer() {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['run', 'dev'], {
      cwd: rootDir, shell: true, stdio: 'pipe',
    });
    proc.stdout.on('data', () => {});
    proc.stderr.on('data', () => {});
    setTimeout(() => resolve(proc), 4000);
  });
}

async function recordSession() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  if (!existsSync(shotsDir)) mkdirSync(shotsDir, { recursive: true });

  let server;
  let browser;

  try {
    console.log('🚀 Iniciando servidor dev...');
    server = await startDevServer();
    if (!await waitForServer('http://localhost:5173'))
      throw new Error('Servidor no inició');
    console.log('✅ Servidor listo\n');

    console.log('🖥️  Detectando resolución de pantalla...');
    const { width, height } = await detectScreenSize();
    const label = `${width}x${height}`;

    browser = await chromium.launch({ headless: false, args: [`--window-size=${width},${height}`, '--start-fullscreen'] });
    const ctx = await browser.newContext({
      viewport: { width, height },
      recordVideo: { dir: outDir, size: { width, height } },
    });
    const page = await ctx.newPage();

    console.log(`🖥️  Cargando app (${label})...`);
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(1500);

    let lastView = '';
    let screenshotCount = 0;
    let viewsSeen = new Set();

    const watcher = setInterval(async () => {
      try {
        const currentView = await page.evaluate(() => {
          const phaseTab = document.querySelector('.phase-tab.active');
          if (phaseTab) return phaseTab.textContent?.trim() || '';
          const navLabel = document.querySelector('.bottom-nav-btn.active .nav-label');
          if (navLabel) return navLabel.textContent?.trim() || '';
          return '';
        });
        if (currentView && currentView !== lastView) {
          lastView = currentView;
          const firstTime = !viewsSeen.has(currentView);
          viewsSeen.add(currentView);
          if (firstTime) {
            screenshotCount++;
            const ts = Date.now();
            const safe = currentView.replace(/[^a-zA-Z0-9]/g, '_');
            await page.screenshot({
              path: join(shotsDir, `${String(screenshotCount).padStart(2, '0')}_${safe}_${ts}.png`),
              fullPage: true,
            });
            console.log(`   📸 Screenshot ${screenshotCount}: ${currentView}`);
          }
        }
      } catch {}
    }, 1500);

    console.log('\n🎬 Grabando sesión interactiva');
    console.log(`   Resolución: ${label} (pantalla completa nativa)`);
    console.log('   Screenshots se guardan en: recordings/session-screenshots/');
    console.log('\n👉 Navega por la app libremente.');
    console.log('   Presiona Enter en esta terminal cuando termines.\n');

    await new Promise(resolve => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question('', () => { rl.close(); resolve(); });
    });

    clearInterval(watcher);

    await page.screenshot({
      path: join(shotsDir, 'final_session_end.png'),
      fullPage: true,
    });
    console.log('   📸 Screenshot final');

    const rawPath = await page.video().path();
    await ctx.close();
    await browser.close();

    const outMp4 = join(outDir, `session-${label}.mp4`);
    console.log(`\n🎞️  WebM crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264…');

    await new Promise(resolve => {
      const cmd = `ffmpeg -y -i "${rawPath}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${outMp4}"`;
      exec(cmd, (err) => {
        if (err) console.error('❌ ffmpeg falló:', err.message);
        else {
          console.log(`✅ Video final: ${outMp4}`);
          try { unlinkSync(rawPath); } catch {}
        }
        resolve();
      });
    });

    console.log('\n✅ Grabación completada');
    console.log(`   📹 Video: ${outMp4}`);
    console.log(`   🖼️  Screenshots: ${shotsDir} (${screenshotCount} capturas)\n`);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    if (browser) await browser.close();
    if (server) { server.kill(); console.log('🛑 Servidor detenido\n'); }
  }
}

recordSession();
