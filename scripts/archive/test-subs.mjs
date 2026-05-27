import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

const ROOT = 'D:/Personal/bracketMundial';
const TMP = join(ROOT, 'temp', 'espana-reel');

function run(cmd) {
  console.log(`  → ${cmd}`);
  return execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 120000 });
}

// List available subtitles first
const out = run(`python -m yt_dlp --list-subs --skip-download -o temp/espana-reel/list https://www.youtube.com/watch?v=zo6PCXVesEw`);
console.log(out.toString());

console.log('Done listing subs');
