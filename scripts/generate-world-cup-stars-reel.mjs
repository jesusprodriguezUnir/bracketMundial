// Generates the World Cup Stars Instagram Reel — HIGH QUALITY
// Usage: node scripts/generate-world-cup-stars-reel.mjs

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'temp', 'wc-stars-reel');
const OUT = join(ROOT, 'recordings');

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

const W = 1080, H = 1920;
const FPS = 25;

function run(cmd, label) {
  if (label) console.log(`\n=== ${label} ===`);
  const short = cmd.length > 140 ? cmd.slice(0, 137) + '...' : cmd;
  console.log(`  → ${short}`);
  try {
    execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 600000, stdio: 'pipe' });
  } catch (e) {
    console.error('FFmpeg error. Checking if partial output was created...');
    throw e;
  }
}

function tmpfile(content, ext = 'txt') {
  const f = join(TMP, `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`);
  writeFileSync(f, content, 'utf8');
  return f;
}

function q(s) { return '"' + s.replace(/"/g, '') + '"'; }
function rel(abs) { return abs.replace(ROOT + '\\', '').replace(/\\/g, '/'); }

function getPhotoDimensions(photoPath) {
  const info = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${q(photoPath)}`,
    { shell: 'cmd.exe', timeout: 10000 }
  ).toString().trim();
  const [w, h] = info.split(',').map(Number);
  return { w, h };
}

async function buildScenePhoto(photo, duration, out, textContent) {
  // Get actual photo dimensions for optimal scaling
  const dim = getPhotoDimensions(photo);
  console.log(`  📐 Photo: ${dim.w}×${dim.h}`);

  // Scale to fill height, then crop to width
  // Use lanczos for sharpest downscale, then scale up
  const scaleH = H;
  const scaleW = Math.round(dim.w * (H / dim.h));
  const cropX = Math.max(0, Math.round((scaleW - W) / 2));
  const totalFrames = Math.round(duration * FPS);

  // Step 1: Create dark background
  const bg = join(TMP, `bg_${Date.now()}.mp4`);
  run(
    `ffmpeg -y -f lavfi -i color=c=0x0d0d1a:s=${W}x${H}:d=${duration}:r=${FPS} ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p ${q(bg)}`,
    'Dark background'
  );

  // Step 2: Scale photo with lanczos + Ken Burns zoompan + CAS sharpening
  const kbScale = join(TMP, `kb_scale_${Date.now()}.mp4`);
  const zoomStart = 1.0;
  const zoomEnd = 1.2;
  const zoomStep = (zoomEnd - zoomStart) / totalFrames;

  run(
    `ffmpeg -y -loop 1 -i ${q(photo)} -t ${duration} ` +
    `-vf "scale=${scaleW}:${scaleH}:flags=lanczos,` +
    `crop=${W}:${H}:${cropX}:0,` +
    `cas=0.8,` +
    `zoompan=z='min(zoom+${zoomStep},${zoomEnd})':d=${totalFrames}:s=${W}x${H}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',` +
    `unsharp=5:5:0.8:3:3:0.4" ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(kbScale)}`,
    'Ken Burns + sharpen'
  );

  // Step 3: Overlay on dark background
  const kbBg = join(TMP, `kb_bg_${Date.now()}.mp4`);
  run(
    `ffmpeg -y -i ${q(bg)} -i ${q(kbScale)} ` +
    `-filter_complex "overlay=0:0:eof_action=pass" ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(kbBg)}`,
    'Overlay on bg'
  );

  // Step 4: Add vignette + text with shadow
  const sFile = tmpfile(textContent);
  const outFile = out;

  // Vignette for cinematic look + text shadow + main text
  const vignetteFilter = `vignette=PI/4:mode=forward`;
  const shadowText = `drawtext=textfile=${rel(sFile)}:fontfile=${rel(join(TMP, 'impact.ttf'))}:fontsize=48:fontcolor=black@0.6:x=(w-text_w)/2+3:y=1363:enable='between(t,0,${duration})'`;
  const mainText = `drawtext=textfile=${rel(sFile)}:fontfile=${rel(join(TMP, 'impact.ttf'))}:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=1360:enable='between(t,0,${duration})':borderw=2:bordercolor=black@0.8`;

  run(
    `ffmpeg -y -i ${q(kbBg)} ` +
    `-vf "${vignetteFilter},${shadowText},${mainText}" ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(outFile)}`,
    'Vignette + text'
  );

  // Cleanup
  try { unlinkSync(bg); } catch {}
  try { unlinkSync(kbScale); } catch {}
  try { unlinkSync(kbBg); } catch {}
  try { unlinkSync(sFile); } catch {}
}

async function buildSceneClip(clip, duration, out, textContent) {
  const sFile = tmpfile(textContent);

  const shadowText = `drawtext=textfile=${rel(sFile)}:fontfile=${rel(join(TMP, 'impact.ttf'))}:fontsize=48:fontcolor=black@0.6:x=(w-text_w)/2+3:y=1363:enable='between(t,0,${duration})'`;
  const mainText = `drawtext=textfile=${rel(sFile)}:fontfile=${rel(join(TMP, 'impact.ttf'))}:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=1360:enable='between(t,0,${duration})':borderw=2:bordercolor=black@0.8`;

  run(
    `ffmpeg -y -ss 0 -i ${q(clip)} -t ${duration} ` +
    `-vf "scale=${W}:${H}:flags=lanczos,crop=${W}:${H},` +
    `vignette=PI/4:mode=forward,` +
    `drawbox=x=0:y=ih*0.72:w=iw:h=ih*0.28:color=0xe8612c@0.95:t=fill,` +
    `${shadowText},${mainText}" ` +
    `-c:v libx264 -preset medium -crf 16 -c:a aac -b:a 192k -r ${FPS} ${q(out)}`,
    'Clip + text'
  );

  try { unlinkSync(sFile); } catch {}
}

async function main() {
  console.log('🎬 World Cup Stars Instagram Reel — HIGH QUALITY\n');

  // Ensure font exists
  const FONT = join(TMP, 'impact.ttf');
  if (!existsSync(FONT)) copyFileSync('C:/Windows/Fonts/arial.ttf', FONT);

  const INTRO = join(ROOT, 'recordings', 'clips', '00_intro.mp4');
  const OUTRO = join(ROOT, 'recordings', 'clips', '06_outro.mp4');
  const AUDIO = join(ROOT, 'recordings', 'dai_dai_audio.mp3');

  const scenes = [
    { photo: 'mbappe y olise.jpg',       clip: null,                      text: 'Francia\nMbappé & Olise',       kbDur: 3.5, clipDur: 1.5 },
    { photo: 'belingham y kane.jpg',      clip: '03_ronaldo_free_kick.mp4', text: 'Inglaterra\nKane & Bellingham', kbDur: 2.5, clipDur: 2.0 },
    { photo: 'lamineypedri.jpg',          clip: null,                      text: 'España\nLamine & Pedri',        kbDur: 3.5, clipDur: 1.5 },
    { photo: 'vitinha y nuno.jpg',        clip: null,                      text: 'Portugal\nVitinha & Nuno',       kbDur: 3.5, clipDur: 1.5 },
    { photo: 'modric.jpg',               clip: '04_modric_running.mp4',    text: 'Croacia\nModric',              kbDur: 2.5, clipDur: 2.0 },
    { photo: 'musiala.jpg',               clip: null,                      text: 'Alemania\nMusiala',             kbDur: 3.5, clipDur: 1.5 },
    { photo: 'messiyjulian.jpg',          clip: '01_messi_goal.mp4',        text: 'Argentina\nMessi & Julián',      kbDur: 2.5, clipDur: 2.0 },
    { photo: 'viniciusyraphinha.jpg',     clip: '05_neymar_skills.mp4',     text: 'Brasil\nVinícius & Raphinha',    kbDur: 2.5, clipDur: 2.0 },
    { photo: 'valverde.jpg',              clip: '02_messi_cup.mp4',         text: 'Uruguay\nValverde',             kbDur: 2.5, clipDur: 2.0 },
  ].map(s => ({
    ...s,
    photo: join(ROOT, 'recordings', s.photo),
    clip: s.clip ? join(ROOT, 'recordings', 'clips', s.clip) : null,
  }));

  const INTRO_DUR = 3;
  const OUTRO_DUR = 7;

  // Process intro
  console.log(`\n[t=0] INTRO (${INTRO_DUR}s)`);
  const introOut = join(TMP, 'scene_intro.mp4');
  run(
    `ffmpeg -y -i ${q(INTRO)} -t ${INTRO_DUR} ` +
    `-vf "scale=${W}:${H}:flags=lanczos,crop=${W}:${H}" ` +
    `-c:v libx264 -preset medium -crf 16 -c:a aac -b:a 192k -r ${FPS} ${q(introOut)}`,
    'Intro'
  );

  // Process each country scene
  const sceneFiles = [];
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const kbOut = join(TMP, `scene_${i}_kb.mp4`);
    const clipOut = join(TMP, `scene_${i}_clip.mp4`);
    const sceneOut = join(TMP, `scene_${i}.mp4`);

    console.log(`\n[Scene ${i + 1}] ${s.text.split('\n')[0]} - KB:${s.kbDur}s + Clip:${s.clipDur}s`);

    await buildScenePhoto(s.photo, s.kbDur, kbOut, s.text);

    if (s.clip) {
      await buildSceneClip(s.clip, s.clipDur, clipOut, s.text);

      // Concatenate KB + clip
      const concatList = tmpfile(
        `file '${kbOut.replace(/\\/g, '/')}'\nfile '${clipOut.replace(/\\/g, '/')}'\n`, 'txt'
      );
      run(
        `ffmpeg -y -f concat -safe 0 -i ${q(concatList)} ` +
        `-c:v libx264 -preset medium -crf 16 -c:a aac -b:a 192k ${q(sceneOut)}`,
        `Concat KB+Clip scene ${i + 1}`
      );
      sceneFiles.push(sceneOut);
    } else {
      sceneFiles.push(kbOut);
    }
  }

  // Process outro
  console.log('\n[OUTRO]');
  const outroOut = join(TMP, 'scene_outro.mp4');
  run(
    `ffmpeg -y -i ${q(OUTRO)} -t ${OUTRO_DUR} ` +
    `-vf "scale=${W}:${H}:flags=lanczos,crop=${W}:${H}" ` +
    `-c:v libx264 -preset medium -crf 16 -c:a aac -b:a 192k -r ${FPS} ${q(outroOut)}`,
    'Outro'
  );

  // Concatenate all video segments
  const concatList = join(TMP, 'video_concat_list.txt');
  let listContent = `file '${introOut.replace(/\\/g, '/')}'\n`;
  for (const f of sceneFiles) {
    listContent += `file '${f.replace(/\\/g, '/')}'\n`;
  }
  listContent += `file '${outroOut.replace(/\\/g, '/')}'\n`;
  writeFileSync(concatList, listContent, 'utf8');

  const videoOnly = join(TMP, 'video_concat.mp4');
  console.log('\n=== Concatenating all segments ===');
  run(
    `ffmpeg -y -f concat -safe 0 -i ${q(concatList)} ` +
    `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(videoOnly)}`,
    'Concatenate video'
  );

  // Get video duration
  const videoDur = execSync(
    `ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${q(videoOnly)}`,
    { shell: 'cmd.exe', timeout: 30000 }
  ).toString().trim();

  const totalDur = parseFloat(videoDur);
  console.log(`\n✅ Video duration: ${totalDur}s`);

  // Trim audio
  const audioTrim = join(TMP, 'dai_dai_trim.mp3');
  run(
    `ffmpeg -y -i ${q(AUDIO)} -t ${(totalDur + 1).toFixed(0)} ` +
    `-acodec libmp3lame -ab 192k ${q(audioTrim)}`,
    'Trim Dai Dai audio'
  );

  // Final mix — use 2-pass for maximum quality
  const REEL_OUT = join(OUT, 'reel-world-cup-stars.mp4');
  const CAPTION_OUT = join(OUT, 'reel-world-cup-stars.caption.txt');

  console.log('\n=== Final mix (high quality) ===');
  run(
    `ffmpeg -y -i ${q(videoOnly)} -i ${q(audioTrim)} ` +
    `-map 0:v -map 1:a ` +
    `-c:v libx264 -preset medium -crf 16 -profile:v high -level 4.1 ` +
    `-pix_fmt yuv420p -r ${FPS} ` +
    `-c:a aac -b:a 192k -ar 48000 ` +
    `-movflags +faststart ` +
    `-shortest ${q(REEL_OUT)}`,
    'Final reel (high quality)'
  );

  // Caption
  const caption = `🏆 El Mundial 2026 se decide en bracketmundial.com

Elige a tus jugadores franquicia, arma tu bracket y demuestra quién sabe más de fútbol.

#Mundial2026 #WorldCup2026 #FIFAWorldCup #QuinielaMundial #FiebreMundialista #Brasil #Argentina #España #Francia #Inglaterra #Alemania #Portugal #Croacia #Uruguay`;
  writeFileSync(CAPTION_OUT, caption, 'utf8');

  // Verify
  const info = execSync(
    `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,bit_rate,width,height -of default=noprint_wrappers=1 ${q(REEL_OUT)}`,
    { shell: 'cmd.exe', timeout: 30000 }
  ).toString().trim();

  console.log(`\n📝 Caption: ${CAPTION_OUT}`);
  console.log(`\n📊 Output info:\n${info}`);
  console.log(`\n✅ Done! Final reel: ${REEL_OUT}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
