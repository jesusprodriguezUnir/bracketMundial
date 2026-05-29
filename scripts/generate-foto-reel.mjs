// Generates a short Instagram Reel from FotoInstagram.png
// Usage: node scripts/generate-foto-reel.mjs

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, unlinkSync, copyFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'temp', 'foto-reel');
const OUT = join(ROOT, 'recordings');

mkdirSync(TMP, { recursive: true });

const W = 1080, H = 1920, FPS = 30;

function run(cmd, label) {
  if (label) console.log(`\n=== ${label} ===`);
  const short = cmd.length > 140 ? cmd.slice(0, 137) + '...' : cmd;
  console.log(`  → ${short}`);
  try {
    execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 300000, stdio: 'pipe' });
  } catch (e) {
    console.error('FFmpeg error:', e.stderr?.toString().slice(0, 500));
    throw e;
  }
}

function q(s) { return '"' + s.replace(/"/g, '') + '"'; }
function rel(abs) { return abs.replace(ROOT + '\\', '').replace(/\\/g, '/'); }

async function main() {
  console.log('🎬 FotoInstagram Reel\n');

  const FONT = join(TMP, 'arial.ttf');
  if (!existsSync(FONT)) copyFileSync('C:/Windows/Fonts/arial.ttf', FONT);

  const PHOTO = join(ROOT, 'recordings', 'FotoInstagram.png');
  const AUDIO = join(ROOT, 'recordings', 'dai_dai_audio.mp3');
  const REEL_OUT = join(OUT, 'reel-foto-instagram.mp4');

  const DURATION = 10; // seconds
  const totalFrames = DURATION * FPS;

  // Photo is 1024x1024. For 1080x1920 vertical:
  // Scale to fill width (1080), height becomes 1080 — then it's centered on dark bg
  // OR scale to fill height (1920), crop width — but that cuts too much of a square
  // Best approach: scale to fill width, put on dark background, Ken Burns zoom

  // Step 1: Dark background
  const bg = join(TMP, 'bg.mp4');
  run(
    `ffmpeg -y -f lavfi -i color=c=0x0a0a14:s=${W}x${H}:d=${DURATION}:r=${FPS} ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p ${q(bg)}`,
    'Dark background'
  );

  // Step 2: Ken Burns on photo (zoom 1.0 → 1.15, slow drift)
  const kbOut = join(TMP, 'kb.mp4');
  const zoomStep = (1.15 - 1.0) / totalFrames;
  run(
    `ffmpeg -y -loop 1 -i ${q(PHOTO)} -t ${DURATION} ` +
    `-vf "scale=${W}:-1:flags=lanczos,` +
    `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x0a0a14,` +
    `cas=0.6,` +
    `zoompan=z='min(zoom+${zoomStep},1.15)':d=${totalFrames}:s=${W}x${H}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',` +
    `unsharp=5:5:0.6:3:3:0.3" ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(kbOut)}`,
    'Ken Burns zoom'
  );

  // Step 3: Overlay on background
  const overlay = join(TMP, 'overlay.mp4');
  run(
    `ffmpeg -y -i ${q(bg)} -i ${q(kbOut)} ` +
    `-filter_complex "overlay=0:0:eof_action=pass" ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(overlay)}`,
    'Overlay'
  );

  // Step 4: Vignette + text
  const textShadow = `drawtext=text='MUNDIAL 2026':fontfile=${rel(FONT)}:fontsize=64:fontcolor=black@0.5:x=(w-text_w)/2+3:y=1583:enable='between(t,0.5,${DURATION})'`;
  const textMain = `drawtext=text='MUNDIAL 2026':fontfile=${rel(FONT)}:fontsize=64:fontcolor=white:x=(w-text_w)/2:y=1580:enable='between(t,0.5,${DURATION})':borderw=2:bordercolor=black@0.8`;
  const textUrl = `drawtext=text='bracketmundial.com':fontfile=${rel(FONT)}:fontsize=36:fontcolor=white@0.9:x=(w-text_w)/2:y=1660:enable='between(t,1,${DURATION})':borderw=1:bordercolor=black@0.6`;

  const withText = join(TMP, 'with_text.mp4');
  run(
    `ffmpeg -y -i ${q(overlay)} ` +
    `-vf "vignette=PI/5:mode=forward,${textShadow},${textMain},${textUrl}" ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(withText)}`,
    'Vignette + text'
  );

  // Step 5: Trim audio and mix
  const audioTrim = join(TMP, 'audio_trim.mp3');
  run(
    `ffmpeg -y -i ${q(AUDIO)} -ss 2 -t ${DURATION + 1} ` +
    `-acodec libmp3lame -ab 192k ${q(audioTrim)}`,
    'Trim audio'
  );

  console.log('\n=== Final mix ===');
  run(
    `ffmpeg -y -i ${q(withText)} -i ${q(audioTrim)} ` +
    `-map 0:v -map 1:a ` +
    `-c:v libx264 -preset medium -crf 16 -profile:v high -level 4.1 ` +
    `-pix_fmt yuv420p -r ${FPS} ` +
    `-c:a aac -b:a 192k -ar 48000 ` +
    `-movflags +faststart ` +
    `-shortest ${q(REEL_OUT)}`,
    'Final reel'
  );

  // Verify
  const info = execSync(
    `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,bit_rate,width,height -of default=noprint_wrappers=1 ${q(REEL_OUT)}`,
    { shell: 'cmd.exe', timeout: 30000 }
  ).toString().trim();

  console.log(`\n📊 Output:\n${info}`);
  console.log(`\n✅ Done! ${REEL_OUT}`);

  // Cleanup
  for (const f of [bg, kbOut, overlay, withText, audioTrim]) {
    try { unlinkSync(f); } catch {}
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
