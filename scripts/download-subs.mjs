import { execSync } from 'child_process';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

const ROOT = 'D:/Personal/bracketMundial';
const TMP = join(ROOT, 'temp', 'espana-reel');

function run(cmd) {
  console.log(`  → ${cmd}`);
  return execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 120000 });
}

// Download auto-subs in Spanish (SRT)
run(`python -m yt_dlp --skip-download --write-auto-subs --sub-langs es --sub-format srt -o ${TMP}/subs https://www.youtube.com/watch?v=zo6PCXVesEw`);

// Check what files were created
const files = run(`dir /b ${TMP}`).toString().trim().split('\r\n');
console.log('Files in temp:', files);
