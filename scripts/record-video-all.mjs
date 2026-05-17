import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'twitter'];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
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

async function recordForPlatform(platform, durationSec) {
  const outDir = join(rootDir, 'recordings');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  return new Promise((resolve) => {
    const proc = spawn('node', ['scripts/record-video.mjs', platform, String(durationSec)], {
      cwd: rootDir,
      shell: true,
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function recordAll(durationSec = 30) {
  console.log(`\n🎬 Grabando video para TODAS las plataformas (~${durationSec}s c/u)\n`);

  let server;
  try {
    console.log('🚀 Iniciando servidor dev...');
    server = await startDevServer();
    if (!await waitForServer('http://localhost:5173')) {
      throw new Error('Servidor no inició');
    }
    console.log('✅ Servidor listo\n');

    const results = {};
    for (const platform of PLATFORMS) {
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`▶ ${platform.toUpperCase()}`);
      console.log('─'.repeat(50));
      const ok = await recordForPlatform(platform, durationSec);
      results[platform] = ok ? '✅' : '❌';
      await sleep(500);
    }

    console.log(`\n${'═'.repeat(50)}`);
    console.log('📊 RESULTADOS');
    console.log('═'.repeat(50));
    for (const [platform, status] of Object.entries(results)) {
      console.log(`   ${status} ${platform}`);
    }
    console.log('');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    if (server) { server.kill(); console.log('🛑 Servidor detenido\n'); }
  }
}

const args = process.argv.slice(2);
recordAll(parseInt(args[0]) || 30);
