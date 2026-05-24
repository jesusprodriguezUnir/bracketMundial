// Creates an Instagram Reel: Puyol header (2010) → Waka Waka → Dai Dai (2026)
// with subtitles and a final CTA promoting bracketmundial.com.
// Waka Waka music plays from second 0, under Puyol's video.
//
// Usage: node scripts/create-shakira-reel.mjs

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'temp', 'shakira-reel');
const OUT = join(ROOT, 'recordings');
const SYS_FONT = 'C:/Windows/Fonts/impact.ttf';

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

const FONT = join(TMP, 'impact.ttf');
if (!existsSync(FONT)) copyFileSync(SYS_FONT, FONT);

const REEL = join(OUT, 'reel-shakira-promo.mp4');
const CAPTION = join(OUT, 'reel-shakira-promo.caption.txt');

function run(cmd) {
  console.log(`\n  → ${cmd.slice(0, 300)}...`);
  execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 300000 });
}

function tmpfile(content) {
  const f = join(TMP, `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.txt`);
  writeFileSync(f, content, 'utf8');
  return f;
}

function q(s) { return '"' + s + '"'; }

function rel(abs) {
  return abs.replace(ROOT + '\\', '').replace(/\\/g, '/');
}

function dt(txtFile, extra) {
  const rp = rel(txtFile);
  const fp = rel(FONT);
  return 'drawtext=textfile=' + rp + ':fontfile=' + fp + ':' + extra;
}

async function main() {
  console.log('🎬 Creating Shakira Instagram Reel\n');

  // Step 1 — Puyol (0-5s, video from Puyol, audio from Waka Waka) ────
  console.log('=== 1/4: Puyol header (5s, Waka Waka audio underneath) ===');
  const vf1 = ['scale=-1:1920:flags=lanczos', 'crop=1080:1920'].join(',');
  run(
    `ffmpeg -y -ss 0 -i ${q(join(TMP, 'puyol_raw.mp4'))} ` +
    `-ss 0 -i ${q(join(TMP, 'ww_raw3.mp4'))} -t 5 ` +
    `-map 0:v -map 1:a -shortest -vf ${q(vf1)} ` +
    `-c:a aac -b:a 128k -preset fast -crf 22 ${q(join(TMP, 'puyol.mp4'))}`
  );

  // Step 2 — Waka Waka (5-20s, 15s from 1:00, with text) ─────────────
  console.log('\n=== 2/4: Waka Waka (15s, 1:00-1:15, with text) ===');
  const s2 = tmpfile('Un nuevo Mundial, el mismo ritmo.\n\u00bfQui\u00e9n se llevar\u00e1 la copa?');
  const en2 = 'gte(t\\,0)*lte(t\\,15)';
  const vf2 = [
    'scale=-1:1920:flags=lanczos',
    'crop=1080:1920',
    'drawbox=x=0:y=ih*2/3:w=iw:h=ih/3:color=#1a1933:t=fill:enable=' + en2,
    dt(s2, 'fontsize=34:fontcolor=white:x=(w-text_w)/2:y=1320:enable=' + en2 +
         ':borderw=2:bordercolor=black'),
  ].join(',');
  run(`ffmpeg -y -ss 0 -i ${q(join(TMP, 'ww_raw3.mp4'))} -t 15 -vf ${q(vf2)} -c:a aac -b:a 128k -preset fast -crf 22 ${q(join(TMP, 'ww3.mp4'))}`);

  // Step 3 — Dai Dai clip 1 (20-28s, Messi) ─────────────────────────
  console.log('\n=== 3/4: Dai Dai clip 1 (8s, Messi, 0:27-0:35) ===');
  const s3 = tmpfile('De la nostalgia del 2010 a la emoci\u00f3n del 2026.\n\u00a1Haz tu jugada!');
  const en3 = 'gte(t\\,0)*lte(t\\,8)';
  const vf3 = [
    'scale=-1:1920:flags=lanczos',
    'crop=1080:1920',
    'drawbox=x=0:y=ih*2/3:w=iw:h=ih/3:color=#1a1933:t=fill:enable=' + en3,
    dt(s3, 'fontsize=34:fontcolor=white:x=(w-text_w)/2:y=1320:enable=' + en3 +
         ':borderw=2:bordercolor=black'),
  ].join(',');
  run(`ffmpeg -y -ss 3 -i ${q(join(TMP, 'dd_raw1.mp4'))} -t 8 -vf ${q(vf3)} -c:a aac -b:a 128k -preset fast -crf 22 ${q(join(TMP, 'dd1.mp4'))}`);

  // Step 4 — Dai Dai clip 2 (28-36s, text 0-5s → CTA 5-8s) ──────────
  console.log('\n=== 4/4: Dai Dai clip 2 (8s, CTA at 5-8s, 0:55-1:03) ===');
  const enPre = 'gte(t\\,0)*lte(t\\,5)';
  const enCTA = 'gte(t\\,5)*lte(t\\,8)';
  const s4pre = tmpfile('El bal\u00f3n vuelve a rodar.\n\u00bfTienes claro tu cuadro hacia la final?');
  const ct1 = tmpfile('Vive el Mundial antes que nadie.');
  const ct2 = tmpfile('Arma tus predicciones ahora en');
  const ct3 = tmpfile('bracketmundial.com');
  const vf4 = [
    'scale=-1:1920:flags=lanczos',
    'crop=1080:1920',
    'drawbox=x=0:y=ih*2/3:w=iw:h=ih/3:color=#1a1933:t=fill:enable=' + enPre,
    dt(s4pre, 'fontsize=34:fontcolor=white:x=(w-text_w)/2:y=1320:enable=' + enPre +
         ':borderw=2:bordercolor=black'),
    'drawbox=x=0:y=ih*2/3:w=iw:h=ih/3:color=#e8612c:t=fill:enable=' + enCTA,
    dt(ct1, 'fontsize=32:fontcolor=white:x=(w-text_w)/2:y=1310:enable=' + enCTA),
    dt(ct2, 'fontsize=32:fontcolor=white:x=(w-text_w)/2:y=1370:enable=' + enCTA),
    dt(ct3, 'fontsize=40:fontcolor=#1a1933:x=(w-text_w)/2:y=1430:enable=' + enCTA),
  ].join(',');
  run(`ffmpeg -y -ss 2 -i ${q(join(TMP, 'dd_raw2.mp4'))} -t 8 -vf ${q(vf4)} -c:a aac -b:a 128k -preset fast -crf 22 ${q(join(TMP, 'dd2.mp4'))}`);

  // Step 5 — Concat ─────────────────────────────────
  console.log('\n=== 5/5: Concatenate all 4 clips ===');
  const concatFilter = [
    '[0:v]setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0]',
    '[1:v]setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1]',
    '[2:v]setpts=PTS-STARTPTS[v2];[2:a]asetpts=PTS-STARTPTS[a2]',
    '[3:v]setpts=PTS-STARTPTS[v3];[3:a]asetpts=PTS-STARTPTS[a3]',
    '[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[outv][outa]',
  ].join(';');
  run(
    `ffmpeg -y ` +
    `-i ${q(join(TMP, 'puyol.mp4'))} ` +
    `-i ${q(join(TMP, 'ww3.mp4'))} ` +
    `-i ${q(join(TMP, 'dd1.mp4'))} ` +
    `-i ${q(join(TMP, 'dd2.mp4'))} ` +
    `-filter_complex ${q(concatFilter)} ` +
    `-map "[outv]" -map "[outa]" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(REEL)}`
  );

  // Caption ─────────────────────────────────────────
  writeFileSync(CAPTION,
`🎬 Del cabezazo de Puyol (2010) a Dai Dai (2026).

Vive el Mundial antes que nadie. Arma tus predicciones ahora en bracketmundial.com. 🏆

#Puyol #España #WakaWaka #Shakira #DaiDai #BurnaBoy #Mundial2026 #WorldCup2026 #BracketMundial #Futbol #Predictor`, 'utf8');
  console.log(`\n📝 Caption: ${CAPTION}`);

  // Verify ──────────────────────────────────────────
  console.log('\n=== Verification ===');
  const info = execSync(
    `ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 ${q(REEL)}`,
    { cwd: ROOT, shell: 'cmd.exe', timeout: 30000 }
  ).toString().trim();
  console.log(info);
  console.log(`\n✅ Final reel: ${REEL}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exitCode = 1;
});
