// Creates an Instagram Reel: Spain World Cup 2026 squad announcement reaction
// 3 scenes, 15s total, with bracketmundial branding.
//
// Usage: node scripts/create-espana-reel.mjs

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'temp', 'espana-reel-v2');
const OUT = join(ROOT, 'recordings');

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

// Fonts
const SYS_FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf';
const FONT_BOLD = join(TMP, 'arialbd.ttf');
if (!existsSync(FONT_BOLD)) copyFileSync(SYS_FONT_BOLD, FONT_BOLD);

const REEL = join(OUT, 'reel-espana-convocatoria.mp4');
const CAPTION = join(OUT, 'reel-espana-convocatoria.caption.txt');
const PREVIEW = join(OUT, 'reel-espana-convocatoria-preview.jpg');

// Colors
const ORANGE = '#e8612c';
const DARK = '#1a1933';
const WHITE = '#ffffff';
const BLACK = '#000000';

const FONT_REL = rel(FONT_BOLD);

function rel(abs) {
  return abs.replace(ROOT + '\\', '').replace(/\\/g, '/');
}

function run(cmd) {
  console.log(`  → ${cmd.slice(0, 200)}...`);
  execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 300000 });
}

function q(s) { return '"' + s.replace(/\\/g, '/') + '"'; }

function buildFilter(content, isChain = false) {
  const f = join(TMP, '_filter.txt');
  writeFileSync(f, content, 'utf8');
  const lines = readFileSync(f, 'utf8').replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(l => l);

  if (isChain) {
    // For concat chains: each line is a separate filter chain, join with ;
    return lines.join(';');
  }

  // For single-input filters: join with commas, attach output labels to previous
  const result = [];
  for (const line of lines) {
    if (line.startsWith('[') && line.endsWith(']')) {
      if (result.length > 0) {
        result[result.length - 1] = result[result.length - 1] + line;
      } else {
        result.push(line);
      }
    } else {
      if (result.length > 0) {
        result[result.length - 1] = result[result.length - 1] + ',' + line;
      } else {
        result.push(line);
      }
    }
  }
  return result.join(';');
}

async function main() {
  console.log('🎬 Creating España Convocatoria Reel (15s, 3 scenes)\n');

  // Step 1 — Use already downloaded video
  console.log('=== 1/5: Using downloaded video ===');
  const VIDEO_PATH = join(TMP, 'video_raw.webm');
  if (!existsSync(VIDEO_PATH)) {
    console.log('  Video not found, downloading...');
    run(
      `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" ` +
      `-o "${join(TMP, 'video_raw.%(ext)s').replace(/\\/g, '/')}" ` +
      `"https://www.youtube.com/watch?v=zo6PCXVesEw"`
    );
  }
  console.log(`  Using: ${VIDEO_PATH}`);

  // Step 2 — Extract clip 1: King Felipe speaking (4s from ~1:45)
  console.log('\n=== 2/5: Extracting King Felipe clip (4s) ===');
  const CLIP1 = join(TMP, 'clip1_felipe.mp4');
  run(
    `ffmpeg -y -ss 105 -i ${q(VIDEO_PATH)} -t 4 ` +
    `-vf "scale=-1:1920:flags=lanczos,crop=1080:1920" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP1)}`
  );

  // Step 3 — Scene 1: "¡YA ESTÁ AQUÍ LA LISTA!"
  console.log('\n=== 3/5: Building Scene 1 — ¡YA ESTÁ AQUÍ LA LISTA! ===');
  const SCENE1 = join(TMP, 'scene1.mp4');
  const vf1 = buildFilter(`
[0:v]scale=-1:1920:flags=lanczos,crop=1080:1920
drawbox=x=0:y=1150:w=1080:h=770:color=${DARK}@0.85:t=fill:enable='gte(t,0)*lte(t,4)'
drawbox=x=0:y=1150:w=1080:h=4:color=${ORANGE}:t=fill:enable='gte(t,0)*lte(t,4)'
drawtext=text='¡YA ESTA AQUI LA LISTA!':fontsize=44:fontcolor=${WHITE}:x=(w-text_w)/2:y=1250:enable='gte(t,0)*lte(t,4)':borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL}
drawtext=text='¿HAY SORPRESAS?':fontsize=38:fontcolor=${ORANGE}:x=(w-text_w)/2:y=1360:enable='gte(t,0)*lte(t,4)':borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL}
drawtext=text='bracketmundial.com':fontsize=18:fontcolor=${WHITE}@0.6:x=1080-tw-15:y=1920-th-15:enable='gte(t,0)*lte(t,4)':fontfile=${FONT_REL}
[outv]
`);
  console.log(`  Filter: ${vf1.slice(0, 100)}...`);
  run(`ffmpeg -y -i ${q(CLIP1)} -filter_complex ${q(vf1)} -map "[outv]" -c:a copy ${q(SCENE1)}`);

  // Step 4 — Scene 2: Player montage + debate
  console.log('\n=== 4/5: Building Scene 2 — ¿Nos da para ganar? ===');
  const CLIP2 = join(TMP, 'clip2_players.mp4');
  run(
    `ffmpeg -y -ss 110 -i ${q(VIDEO_PATH)} -t 5 ` +
    `-vf "scale=-1:1920:flags=lanczos,crop=1080:1920" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP2)}`
  );

  const SCENE2 = join(TMP, 'scene2.mp4');
  const vf2 = buildFilter(`
[0:v]scale=-1:1920:flags=lanczos,crop=1080:1920
drawbox=x=0:y=1150:w=1080:h=770:color=${DARK}@0.85:t=fill:enable='gte(t,0)*lte(t,5)'
drawbox=x=0:y=1150:w=1080:h=4:color=${ORANGE}:t=fill:enable='gte(t,0)*lte(t,5)'
drawtext=text='¿Nos da para ganar':fontsize=44:fontcolor=${WHITE}:x=(w-text_w)/2:y=1250:enable='gte(t,0)*lte(t,5)':borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL}
drawtext=text='la segunda estrella?':fontsize=38:fontcolor=${ORANGE}:x=(w-text_w)/2:y=1360:enable='gte(t,0)*lte(t,5)':borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL}
drawtext=text='bracketmundial.com':fontsize=18:fontcolor=${WHITE}@0.6:x=1080-tw-15:y=1920-th-15:enable='gte(t,0)*lte(t,5)':fontfile=${FONT_REL}
[outv]
`);
  run(`ffmpeg -y -i ${q(CLIP2)} -filter_complex ${q(vf2)} -map "[outv]" -c:a copy ${q(SCENE2)}`);

  // Step 5 — Scene 3: CTA bracketmundial (solid background)
  console.log('\n=== 5/5: Building Scene 3 — CTA bracketmundial ===');
  const SCENE3 = join(TMP, 'scene3.mp4');
  const vf3 = buildFilter(`
color=c=${DARK}:s=1080x1920:d=6
drawbox=x=0:y=0:w=1080:h=8:color=${ORANGE}:t=fill
drawbox=x=0:y=1912:w=1080:h=8:color=${ORANGE}:t=fill
drawbox=x=80:y=180:w=920:h=2:color=${ORANGE}@0.3:t=fill
drawbox=x=80:y=500:w=920:h=2:color=${ORANGE}@0.3:t=fill
drawbox=x=80:y=900:w=920:h=2:color=${ORANGE}@0.3:t=fill
drawtext=text='MUNDIAL 2026':fontsize=36:fontcolor=${ORANGE}:x=(w-text_w)/2:y=220:fontfile=${FONT_REL}
drawtext=text='DEMUÉSTRALO':fontsize=52:fontcolor=${WHITE}:x=(w-text_w)/2:y=340:borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL}
drawtext=text='Arma tu bracket GRATIS':fontsize=34:fontcolor=${ORANGE}:x=(w-text_w)/2:y=460:fontfile=${FONT_REL}
drawbox=x=120:y=580:w=840:h=90:color=${ORANGE}:t=fill
drawtext=text='bracketmundial.com':fontsize=40:fontcolor=${DARK}:x=(w-text_w)/2:y=595:fontfile=${FONT_REL}
drawtext=text='Link en la Bio':fontsize=22:fontcolor=${WHITE}@0.6:x=(w-text_w)/2:y=720:fontfile=${FONT_REL}
[outv]
`);
  run(`ffmpeg -y -filter_complex ${q(vf3)} -f lavfi -i anullsrc=r=48000:cl=stereo -map "[outv]" -map 1:a -t 6 -c:a aac -b:a 128k ${q(SCENE3)}`);

  // Step 6 — Concatenate
  console.log('\n=== 6/6: Concatenating all scenes ===');
  const concatVf = buildFilter(`
[0:v]setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0]
[1:v]setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1]
[2:v]setpts=PTS-STARTPTS[v2]
[v0][a0][v1][a1][v2]concat=n=3:v=1:a=2[outv][outa]
`, true);
  run(
    `ffmpeg -y ` +
    `-i ${q(SCENE1)} ` +
    `-i ${q(SCENE2)} ` +
    `-i ${q(SCENE3)} ` +
    `-filter_complex ${q(concatVf)} ` +
    `-map "[outv]" -map "[outa]" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 128k ${q(REEL)}`
  );

  // Preview frame
  console.log('\n=== Generating preview ===');
  run(`ffmpeg -y -ss 2 -i ${q(REEL)} -vframes 1 -update 1 ${q(PREVIEW)}`);

  // Caption
  writeFileSync(CAPTION,
` ¡YA ESTÁ AQUÍ LA LISTA! El Rey Felipe VI anuncia los 26 convocados de España para el Mundial 2026.

¿Hay sorpresas? ¿Nos da para ganar la segunda estrella? 🇸

Yo ya he cerrado el camino de España. Entra en bracketmundial.com, arma tu cuadro de eliminatorias GRATIS y demuestra si sabes más de fútbol que el seleccionador.

 Crea tu bracket y compite con tus amigos en el Mundial 2026.

#Mundial2026 #WorldCup2026 #FIFAWorldCup #Futbol #Quiniela`, 'utf8');
  console.log(`\n Caption: ${CAPTION}`);

  // Verify
  console.log('\n=== Verification ===');
  const info = execSync(
    `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=width,height -of default=noprint_wrappers=1 ${q(REEL)}`,
    { cwd: ROOT, shell: 'cmd.exe', timeout: 30000 }
  ).toString().trim();
  console.log(info);
  console.log(`\n✅ Final reel: ${REEL}`);
  console.log(`️ Preview: ${PREVIEW}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exitCode = 1;
});
