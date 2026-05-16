import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

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

async function recordDemo(platform = DEFAULT_PLATFORM, durationSec = 20) {
  const config = PLATFORMS[platform] || PLATFORMS[DEFAULT_PLATFORM];
  const { width, height } = config;
  const outputDir = join(rootDir, 'recordings');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🎬 Recording Demo for ${config.name}`);
  console.log(`   Resolution: ${width}x${height}`);
  console.log(`   Duration: ${durationSec}s\n`);

  let server;
  let browser;

  try {
    console.log('🚀 Starting dev server...');
    server = await startDevServer();

    const serverReady = await waitForServer('http://localhost:5173');
    if (!serverReady) throw new Error('Server failed to start');

    console.log('✅ Server ready\n');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(2000);

    console.log('📱 Loading app...');

    const frames = [];
    const tabs = ['GRUPOS', 'PLANTILLAS', 'CALENDARIO', 'OCTAVOS', 'CUARTOS', 'SEMIS', 'FINAL', 'ESTADIOS', 'TV'];

    const stepDuration = Math.floor((durationSec * 1000) / tabs.length);

    console.log('🎬 Recording frames:\n');

    await page.screenshot({ path: join(outputDir, 'frame-00-home.png'), fullPage: true });
    console.log('   ✓ Home');

    for (let i = 0; i < tabs.length; i++) {
      const tabName = tabs[i].toLowerCase();

      try {
        const tabBtn = page.locator(`.phase-tab`).filter({ hasText: new RegExp(tabName, 'i') }).first();
        if (await tabBtn.isVisible({ timeout: 2000 })) {
          await tabBtn.click();
          await sleep(stepDuration - 200);
          const frameNum = String(i + 1).padStart(2, '0');
          await page.screenshot({ path: join(outputDir, `frame-${frameNum}-${tabName}.png`), fullPage: true });
          console.log(`   ✓ ${tabs[i]}`);
        }
      } catch (e) {
        console.log(`   ✗ ${tabs[i]} (not found)`);
      }
    }

    console.log('\n✅ Recording complete!\n');
    console.log(`📁 Frames saved to: ${outputDir}`);
    console.log('\n📝 To create video, install ffmpeg and run:');
    console.log(`   ffmpeg -framerate 2 -i "frame-%02d-*.png" -c:v libx264 -pix_fmt yuv420p demo.mp4\n`);

    const manifest = {
      platform,
      resolution: { width, height },
      frames: frames.length,
      timestamp: new Date().toISOString(),
      frameDir: outputDir,
    };

    writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`📋 Manifest: ${join(outputDir, 'manifest.json')}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
    if (server) {
      server.kill();
      console.log('\n🛑 Server stopped');
    }
  }
}

async function createVideoFromFrames(framesDir) {
  const { exec } = await import('child_process');

  return new Promise((resolve) => {
    exec(`ffmpeg -framerate 2 -i "${framesDir}/frame-%02d-*.png" -c:v libx264 -pix_fmt yuv420p "${join(framesDir, 'demo.mp4')}"`, (error) => {
      if (error) {
        console.log('ffmpeg not available, skipping video creation');
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'generate') {
  const platform = args[1] || DEFAULT_PLATFORM;
  generateFromFrames(platform);
} else if (command === 'list') {
  console.log('\n📹 Plataformas disponibles:');
  Object.entries(PLATFORMS).forEach(([key, cfg]) => {
    console.log(`   ${key}: ${cfg.name} (${cfg.width}x${cfg.height})`);
  });
  console.log('');
} else {
  const platform = command || DEFAULT_PLATFORM;
  const duration = parseInt(args[1]) || 20;
  recordDemo(platform, duration);
}

async function generateFromFrames(platform) {
  const config = PLATFORMS[platform] || PLATFORMS[DEFAULT_PLATFORM];
  const { width, height } = config;
  const outputFile = join(rootDir, `recordings`, `demo-${platform}.mp4`);

  console.log(`\n🎬 Generando video para ${config.name}`);
  console.log(`   Resolution: ${width}x${height}\n`);

  const { exec } = await import('child_process');

  return new Promise((resolve) => {
    const cmd = `ffmpeg -framerate 2 -i "${join(rootDir, 'recordings', 'frame-%02d.png')}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black" -c:v libx264 -pix_fmt yuv420p -y "${outputFile}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error:', error.message);
        resolve(false);
      } else {
        console.log(`✅ Video guardado: ${outputFile}\n`);
        resolve(true);
      }
    });
  });
}