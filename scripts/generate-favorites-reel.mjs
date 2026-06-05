// Generates a 60s Instagram Reel — 6 World Cup 2026 Favorites
// Usage: node scripts/generate-favorites-reel.mjs

import { execSync, spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, copyFileSync } from 'fs';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'temp', 'favorites-reel');
const RAW = join(TMP, 'raw');
const SCENES = join(TMP, 'scenes');
const OUT = join(ROOT, 'recordings');
const FONT = join(TMP, 'reel-font.ttf');

[RAW, SCENES, OUT].forEach(d => mkdirSync(d, { recursive: true }));

const W = 1080, H = 1920, FPS = 25;

const PLAYERS = [
  {
    id: 'lamine', name: 'Lamine Yamal',
    country: 'ESPAÑA', label: 'ESPAÑA · Lamine Yamal',
    text: 'La nueva joya… puede romperlo TODO',
    url: 'https://www.youtube.com/watch?v=bsegKjpJliI',
    ytStart: '0:05', dur: 8,
  },
  {
    id: 'mbappe', name: 'Mbappé',
    country: 'FRANCIA', label: 'FRANCIA · Mbappé',
    text: 'Velocidad + gol = candidato Nº1',
    url: 'https://www.youtube.com/watch?v=IOIOM8SuBiA',
    ytStart: '0:02', dur: 6,
  },
  {
    id: 'kane', name: 'Harry Kane',
    country: 'INGLATERRA', label: 'INGLATERRA · Kane',
    text: 'El killer silencioso… siempre aparece',
    url: 'https://www.youtube.com/watch?v=ehsX6ITJjUM',
    ytStart: '8:15', dur: 6,
  },
  {
    id: 'vinicius', name: 'Vinícius Jr',
    country: 'BRASIL', label: 'BRASIL · Vinícius Jr',
    text: 'Desborde puro. Peligro constante.',
    url: 'https://www.youtube.com/watch?v=j1KvzvmR4YU',
    ytStart: '0:15', dur: 7,
  },
  {
    id: 'ronaldo', name: 'Cristiano Ronaldo',
    country: 'PORTUGAL', label: 'PORTUGAL · Cristiano',
    text: '¿Último Mundial… o historia otra vez?',
    url: 'https://www.youtube.com/watch?v=739gFc2zg78',
    ytStart: '0:26', dur: 7,
  },
  {
    id: 'messi', name: 'Leo Messi',
    country: 'ARGENTINA', label: 'ARGENTINA · Messi',
    text: 'La leyenda viva… ¿último baile?',
    url: 'https://www.youtube.com/watch?v=gbkgbbKZ1CA',
    ytStart: '1:43', dur: 7,
  },
];

// Lamine needs extra: 5s for intro transition + 8s for his segment + 1s buffer = 14s
PLAYERS[0].downloadExtra = 9; // extra beyond dur for intro transition

const MUSIC = join(ROOT, 'recordings', 'music.mp3');

// ─── Helpers ───

function run(cmd, label) {
  if (label) console.log(`\n=== ${label} ===`);
  const short = cmd.length > 140 ? cmd.slice(0, 137) + '...' : cmd;
  console.log(`  → ${short}`);
  try {
    execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 600000, stdio: 'pipe' });
  } catch (e) {
    const stderr = e.stderr?.toString().slice(0, 400) || '';
    console.error(`  ⚠️  FFmpeg stderr: ${stderr}`);
  }
}

function q(s) { return '"' + s.replace(/"/g, '') + '"'; }

function rel(abs) { return abs.replace(ROOT + '\\', '').replace(/\\/g, '/'); }

function tmpfile(content, ext = 'txt') {
  const f = join(TMP, `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`);
  writeFileSync(f, content, 'utf8');
  return f;
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ensureFont() {
  if (!existsSync(FONT)) {
    const candidates = [
      'C:/Windows/Fonts/arial.ttf',
      'C:/Windows/Fonts/impact.ttf',
      'C:/Windows/Fonts/ARIALBD.TTF',
      '/System/Library/Fonts/Helvetica.ttc',
    ];
    for (const f of candidates) {
      if (existsSync(f)) {
        copyFileSync(f, FONT);
        console.log(`  📦 Font: ${f}`);
        return;
      }
    }
  }
}

// ─── Download YouTube clip ───

function downloadClip(id, url, start, duration) {
  const outRaw = join(RAW, `${id}.raw.mp4`);
  if (existsSync(outRaw)) {
    console.log(`  ✅ ${id} already downloaded`);
    return outRaw;
  }

  const tryDownload = (extra) => {
    const dur = duration + extra;
    const endSec = timeToSec(start) + dur;
    const endStr = fmtTime(endSec);
    const section = `*${start}-${endStr}`;
    run(
      `yt-dlp --download-sections "${section}" -f "best[height<=360]" -o "${RAW}\\${id}.%%(ext)s" --no-part --no-mtime "${url}"`,
      `Download ${id} (${start} → ${fmtTime(endSec)})`
    );
  };

  try {
    tryDownload(1);
  } catch {
    console.log(`  ⚠️  yt-dlp section failed, trying full download for ${id}...`);
    try {
      run(
        `yt-dlp -f "best[height<=360]" -o "${RAW}\\${id}.%%(ext)s" --no-part "${url}"`,
        `Download ${id} (full)`
      );
    } catch (e2) {
      console.error(`  ❌ Failed to download ${id}: ${e2.message}`);
      return null;
    }
  }

  // Find the downloaded file (any extension)
  const files = readdirSync(RAW).filter(f => f.startsWith(id) && f !== `${id}.raw.mp4`);
  if (files.length === 0) {
    console.error(`  ❌ No downloaded file found for ${id}`);
    return null;
  }

  // Rename to raw.mp4
  const dlFile = join(RAW, files[0]);
  try {
    execSync(`move /Y "${dlFile}" "${outRaw}"`, { shell: 'cmd.exe', stdio: 'pipe' });
  } catch {
    unlinkSync(outRaw);
    copyFileSync(dlFile, outRaw);
    unlinkSync(dlFile);
  }
  return outRaw;
}

function timeToSec(t) {
  const parts = t.split(':');
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  return parseInt(parts[0]);
}

// ─── Process a clip: crop to 9:16 + text overlay ───

function buildClipScene(input, output, duration, labelText, subtitle, {
  boxColor = '0xe8612c',
  textY = 1400,
  subY = 1480,
} = {}) {
  if (!existsSync(input) || !input) {
    console.error(`  ❌ Input missing: ${input}`);
    return false;
  }

  const sFile = tmpfile(labelText);
  const sSubFile = subtitle ? tmpfile(subtitle) : null;

  const shadowLabel = subtitle
    ? `drawtext=textfile=${rel(sFile)}:fontfile=${rel(FONT)}:fontsize=42:fontcolor=black@0.5:x=(w-text_w)/2+2:y=${textY + 2}:enable='between(t,0,${duration})'`
    : '';
  const mainLabel = `drawtext=textfile=${rel(sFile)}:fontfile=${rel(FONT)}:fontsize=42:fontcolor=#fff8e7:x=(w-text_w)/2:y=${textY}:enable='between(t,0,${duration})':borderw=2:bordercolor=black@0.7`;

  let shadowSub = '', mainSub = '';
  if (sSubFile) {
    shadowSub = `drawtext=textfile=${rel(sSubFile)}:fontfile=${rel(FONT)}:fontsize=32:fontcolor=black@0.5:x=(w-text_w)/2+2:y=${subY + 2}:enable='between(t,0,${duration})'`;
    mainSub = `drawtext=textfile=${rel(sSubFile)}:fontfile=${rel(FONT)}:fontsize=32:fontcolor=#fff8e7:x=(w-text_w)/2:y=${subY}:enable='between(t,0,${duration})':borderw=1:bordercolor=black@0.6`;
  }

  // Build filter complex
  let filters = `scale=${W}:${H}:flags=lanczos,crop=${W}:${H}`;
  filters += `,drawbox=x=0:y=${H * 0.72}:w=${W}:h=${H * 0.28}:color=${boxColor}@0.95:t=fill`;
  filters += `,vignette=PI/4:mode=forward`;
  if (shadowLabel) filters += `,${shadowLabel}`;
  filters += `,${mainLabel}`;
  if (shadowSub) filters += `,${shadowSub}`;
  if (mainSub) filters += `,${mainSub}`;

  run(
    `ffmpeg -y -ss 0 -i ${q(input)} -t ${duration} ` +
    `-vf "${filters}" ` +
    `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(output)}`,
    `Scene (${Math.round(duration)}s)`
  );

  try { unlinkSync(sFile); } catch {}
  if (sSubFile) try { unlinkSync(sSubFile); } catch {}
  return existsSync(output);
}

// ─── Create quick-cut montage ───

function buildQuickCutScene(clips, output, duration, totalCuts, text) {
  const parts = [];
  const cutDur = duration / totalCuts;

  clips.forEach((clip, i) => {
    if (!clip || !existsSync(clip)) return;
    const part = join(SCENES, `qc_${i}.mp4`);
    run(
      `ffmpeg -y -ss 0 -i ${q(clip)} -t ${cutDur} ` +
      `-vf "scale=${W}:${H}:flags=lanczos,crop=${W}:${H}" ` +
      `-c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r ${FPS} ${q(part)}`,
      `Quick cut ${i + 1}/${totalCuts}`
    );
    parts.push(part);
  });

  if (parts.length === 0) return false;

  const listFile = tmpfile(parts.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
  const concat = join(SCENES, 'qc_concat.mp4');
  run(
    `ffmpeg -y -f concat -safe 0 -i ${q(listFile)} -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(concat)}`,
    'Concat quick cuts'
  );

  // Add text overlay
  const dur = parts.length * cutDur;
  const sFile = tmpfile(text);
  run(
    `ffmpeg -y -i ${q(concat)} ` +
    `-vf "drawbox=x=0:y=${H * 0.72}:w=${W}:h=${H * 0.28}:color=0xe8612c@0.95:t=fill,` +
    `drawtext=textfile=${rel(sFile)}:fontfile=${rel(FONT)}:fontsize=44:fontcolor=#fff8e7:x=(w-text_w)/2:y=1440:enable='between(t,0,${dur})':borderw=2:bordercolor=black@0.7" ` +
    `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(output)}`,
    'Quick cuts + text'
  );

  // Cleanup
  try { unlinkSync(sFile); } catch {}
  try { unlinkSync(listFile); } catch {}
  try { unlinkSync(concat); } catch {}
  parts.forEach(p => { try { unlinkSync(p); } catch {} });

  return existsSync(output);
}

// ─── Capture CTA screenshot via Playwright ───

async function captureCTAScreenshot() {
  const screenshot = join(TMP, 'cta_screenshot.png');
  if (existsSync(screenshot)) return screenshot;

  console.log('\n=== Capturing CTA screenshot ===');
  let server;
  try {
    const { ensureDevServer, gotoView, applyLocaleAndTheme } = await import('./lib/recording-utils.mjs');
    server = await ensureDevServer();

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(2000);
    await applyLocaleAndTheme(page, { lang: 'es', theme: 'light' });
    await gotoView(page, 'knockout');
    await sleep(1500);

    await page.screenshot({ path: screenshot, fullPage: false });
    console.log(`  ✅ Screenshot: ${screenshot}`);

    await ctx.close();
    await browser.close();
  } catch (err) {
    console.error(`  ⚠️  Playwright screenshot failed: ${err.message}`);
    console.log(`  ℹ️  Falling back to generated CTA`);
    return null;
  } finally {
    if (server) {
      try { server.kill(); } catch {}
    }
  }
  return existsSync(screenshot) ? screenshot : null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Create CTA scene ───

function buildCTAScene(screenshot, output, duration) {
  if (screenshot && existsSync(screenshot)) {
    // Use screenshot with Ken Burns + text
    const bg = join(TMP, 'cta_bg.mp4');
    run(
      `ffmpeg -y -f lavfi -i color=c=0x0d0d1a:s=${W}x${H}:d=${duration}:r=${FPS} ` +
      `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p ${q(bg)}`,
      'CTA background'
    );

    const totalFrames = Math.round(duration * FPS);
    const zoomStep = (1.15 - 1.0) / totalFrames;
    const kbOut = join(TMP, 'cta_kb.mp4');
    run(
      `ffmpeg -y -loop 1 -i ${q(screenshot)} -t ${duration} ` +
      `-vf "scale=${W}:-1:flags=lanczos,crop=${W}:${H}:0:0,` +
      `zoompan=z='min(zoom+${zoomStep},1.15)':d=${totalFrames}:s=${W}x${H}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'" ` +
      `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(kbOut)}`,
      'CTA Ken Burns'
    );

    const overlay = join(TMP, 'cta_overlay.mp4');
    run(
      `ffmpeg -y -i ${q(bg)} -i ${q(kbOut)} ` +
      `-filter_complex "overlay=0:0:eof_action=pass" ` +
      `-c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r ${FPS} ${q(overlay)}`,
      'CTA overlay'
    );

    // Add text + orange gradient overlay
    run(
      `ffmpeg -y -i ${q(overlay)} ` +
      `-vf "drawbox=x=0:y=${H * 0.7}:w=${W}:h=${H * 0.3}:color=0xe8612c@0.92:t=fill,` +
      `drawtext=text='HAZ TU PREDICCIÓN GRATIS':fontfile=${rel(FONT)}:fontsize=48:fontcolor=#fff8e7:x=(w-text_w)/2:y=1420:enable='between(t,0,${duration})':borderw=2:bordercolor=black@0.7,` +
      `drawtext=text='🔥  bracketmundial.com  🔥':fontfile=${rel(FONT)}:fontsize=36:fontcolor=#1a1933:x=(w-text_w)/2:y=1510:enable='between(t,0,${duration})':borderw=1:bordercolor=black@0.4" ` +
      `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(output)}`,
      'CTA with text'
    );

    try { unlinkSync(bg); } catch {}
    try { unlinkSync(kbOut); } catch {}
    try { unlinkSync(overlay); } catch {}
  } else {
    // Fallback: text-only on gradient background
    run(
      `ffmpeg -y -f lavfi -i color=c=0x0d0d1a:s=${W}x${H}:d=${duration}:r=${FPS} ` +
      `-vf "drawbox=x=0:y=0:w=${W}:h=${H}:color=0xe8612c@0.15:t=fill,` +
      `drawtext=text='HAZ TU PREDICCIÓN GRATIS':fontfile=${rel(FONT)}:fontsize=54:fontcolor=#fff8e7:x=(w-text_w)/2:y=820:borderw=3:bordercolor=black@0.8,` +
      `drawtext=text='🔥  bracketmundial.com  🔥':fontfile=${rel(FONT)}:fontsize=42:fontcolor=#e8612c:x=(w-text_w)/2:y=920:borderw=2:bordercolor=black@0.7" ` +
      `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(output)}`,
      'CTA fallback (text only)'
    );
  }
  return existsSync(output);
}

// ─── Main ───

async function main() {
  console.log('🎬 World Cup 2026 Favorites Reel — 60s\n');
  ensureFont();

  // ─── 1. Download all clips ───
  console.log('\n═══ DOWNLOADING CLIPS ═══');
  const clipPaths = {};
  for (const p of PLAYERS) {
    const extraDur = p.downloadExtra || 1;
    const path = downloadClip(p.id, p.url, p.ytStart, p.dur + extraDur);
    clipPaths[p.id] = path;
    if (!path) console.warn(`  ⚠️  No clip for ${p.id}, will use placeholder`);
  }

  // ─── 2. Build segments ───
  console.log('\n═══ BUILDING SCENES ═══');

  const scenes = [];

  // Seg 1: Intro (0-3s) — quick cuts of all 6
  console.log('\n--- [0-3s] INTRO: Quick cuts ---');
  const introOut = join(SCENES, '00_intro.mp4');
  const validClips = PLAYERS.map(p => clipPaths[p.id]).filter(Boolean);
  if (validClips.length >= 3) {
    buildQuickCutScene(validClips, introOut, 3, Math.min(6, validClips.length), '¿Quién va a ganar el Mundial?');
    scenes.push(introOut);
  }

  // Seg 2: Transition (3-8s) — Lamine clip with intro text
  console.log('\n--- [3-8s] TRANSITION ---');
  const transOut = join(SCENES, '01_transition.mp4');
  if (clipPaths.lamine) {
    // Take first 5s of Lamine raw clip
    const transClip = join(TMP, 'trans_lamine_cut.mp4');
    run(
      `ffmpeg -y -ss 0 -i ${q(clipPaths.lamine)} -t 5 ` +
      `-c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(transClip)}`,
      'Extract 5s for transition'
    );
    buildClipScene(transClip, transOut, 5, 'Estos son los grandes favoritos 👀', '', { textY: 1500 });
    scenes.push(transOut);
    try { unlinkSync(transClip); } catch {}
  }

  // Segs 3-8: Player segments
  const playerSegStart = [8, 16, 22, 28, 35, 42]; // start times
  PLAYERS.forEach((p, i) => {
    const startTime = playerSegStart[i];
    const segLabel = `[${fmtTime(startTime)}-${fmtTime(startTime + p.dur)}s] ${p.name}`;
    // Check if Lamine and using same clip as transition, need to offset
    let clipInput = clipPaths[p.id];
    let offset = 0;
    if (p.id === 'lamine' && clipPaths.lamine) {
      offset = 5; // Skip the first 5s used for transition
    }
    const segOut = join(SCENES, `seg_${String(i + 2).padStart(2, '0')}_${p.id}.mp4`);

    if (clipInput) {
      const trimmed = join(TMP, `${p.id}_trimmed.mp4`);
      run(
        `ffmpeg -y -ss ${offset} -i ${q(clipInput)} -t ${p.dur} ` +
        `-c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(trimmed)}`,
        `Trim ${p.id} segment (offset ${offset}s)`
      );
      buildClipScene(trimmed, segOut, p.dur, p.label, p.text);
      try { unlinkSync(trimmed); } catch {}
    } else {
      // Fallback: generate placeholder
      console.log(`  ℹ️  Using placeholder for ${p.id}`);
      run(
        `ffmpeg -y -f lavfi -i color=c=0x1a1933:s=${W}x${H}:d=${p.dur}:r=${FPS} ` +
        `-vf "drawbox=x=0:y=${H * 0.72}:w=${W}:h=${H * 0.28}:color=0xe8612c:t=fill,` +
        `drawtext=text='${p.label.replace(/'/g, "'\\\\\\''")}':fontfile=${rel(FONT)}:fontsize=42:fontcolor=#fff8e7:x=(w-text_w)/2:y=1400:borderw=2:bordercolor=black@0.7" ` +
        `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(segOut)}`,
        `Placeholder ${p.id}`
      );
    }
    console.log(`  ✅ Seg: ${segLabel}`);
    scenes.push(segOut);
  });

  // Seg 9: Montage (49-57s) — quick cuts with "6 estrellas. 1 trofeo."
  console.log('\n--- [49-57s] MONTAGE ---');
  const montageOut = join(SCENES, '08_montage.mp4');
  if (validClips.length >= 3) {
    buildQuickCutScene(validClips, montageOut, 8, Math.min(6, validClips.length), '6 estrellas. 1 trofeo.');
    scenes.push(montageOut);
  }

  // Seg 10: CTA (57-60s)
  console.log('\n--- [57-60s] CTA ---');
  const ctaOut = join(SCENES, '09_cta.mp4');
  if (!existsSync(ctaOut)) {
    const ctaScreenshot = await captureCTAScreenshot();
    buildCTAScene(ctaScreenshot, ctaOut, 3);
  }
  if (existsSync(ctaOut)) scenes.push(ctaOut);

  // ─── 3. Concat all scenes ───
  console.log('\n═══ CONCATENATING ALL SEGMENTS ═══');
  const validScenes = scenes.filter(f => f && existsSync(f));
  if (validScenes.length === 0) {
    throw new Error('No scenes were generated!');
  }

  const concatList = tmpfile(validScenes.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const videoOut = join(TMP, 'video_concat.mp4');
  run(
    `ffmpeg -y -f concat -safe 0 -i ${q(concatList)} ` +
    `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} ${q(videoOut)}`,
    'Concat video'
  );

  // Verify duration
  let totalSec = 0;
  try {
    const dur = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 ${q(videoOut)}`,
      { shell: 'cmd.exe', timeout: 15000 }
    ).toString().trim();
    totalSec = parseFloat(dur) || 0;
    console.log(`\n  ✅ Video duration: ${totalSec.toFixed(1)}s`);
  } catch {}

  // ─── 4. Audio mix ───
  console.log('\n═══ AUDIO MIX ═══');
  const audioTrim = join(TMP, 'audio_trim.mp3');
  const audioSrc = existsSync(MUSIC) ? MUSIC : null;

  if (audioSrc) {
    const audioDur = totalSec > 0 ? totalSec + 0.5 : 62;
    run(
      `ffmpeg -y -i ${q(audioSrc)} -ss 5 -t ${audioDur.toFixed(0)} ` +
      `-acodec libmp3lame -ab 192k ${q(audioTrim)}`,
      'Trim audio'
    );
  }

  // ─── 5. Final mix ───
  console.log('\n═══ FINAL MIX ═══');
  const REEL_OUT = join(OUT, 'reel-favorites-60s.mp4');

  if (audioSrc && existsSync(audioTrim)) {
    run(
      `ffmpeg -y -i ${q(videoOut)} -i ${q(audioTrim)} ` +
      `-map 0:v -map 1:a ` +
      `-c:v libx264 -preset medium -crf 18 -profile:v high -level 4.1 ` +
      `-pix_fmt yuv420p -r ${FPS} ` +
      `-c:a aac -b:a 192k -ar 48000 ` +
      `-movflags +faststart ` +
      `-shortest ${q(REEL_OUT)}`,
      'Final reel'
    );
  } else {
    // No audio
    run(
      `ffmpeg -y -i ${q(videoOut)} ` +
      `-c:v libx264 -preset medium -crf 18 -profile:v high -level 4.1 ` +
      `-pix_fmt yuv420p -r ${FPS} ` +
      `-movflags +faststart ${q(REEL_OUT)}`,
      'Final reel (no audio)'
    );
  }

  // ─── 6. Verify & caption ───
  console.log('\n═══ VERIFY ═══');
  let info = '';
  try {
    info = execSync(
      `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,bit_rate,width,height -of default=noprint_wrappers=1 ${q(REEL_OUT)}`,
      { shell: 'cmd.exe', timeout: 15000 }
    ).toString().trim();
  } catch {}

  const CAPTION_OUT = join(OUT, 'reel-favorites-60s.caption.txt');
  const caption = `🏆 ¿QUIÉN GANA EL MUNDIAL 2026?

🇪🇸 Lamine Yamal — La nueva joya
🇫🇷 Mbappé — Velocidad + gol
🏴 Kane — El killer silencioso
🇧🇷 Vinícius Jr — Desborde puro
🇵🇹 Cristiano — ¿Último mundial?
🇦🇷 Messi — La leyenda viva

6 estrellas. 1 trofeo. 🏆

🔥 Haz tu predicción GRATIS en bracketmundial.com
Crea tu bracket, compite con amigos y demuestra quién sabe más.

#Mundial2026 #WorldCup2026 #FIFAWorldCup #LamineYamal #Mbappe #HarryKane #ViniciusJr #CristianoRonaldo #Messi #Futbol #BracketMundial #Quiniela #FiebreMundialista`;
  writeFileSync(CAPTION_OUT, caption, 'utf8');

  console.log(`\n📊 Output info:\n${info}`);
  console.log(`\n📝 Caption: ${CAPTION_OUT}`);
  console.log(`\n✅ Done! Final reel: ${REEL_OUT}`);

  // Cleanup temp
  try { unlinkSync(concatList); } catch {}
  try { unlinkSync(videoOut); } catch {}
  try { unlinkSync(audioTrim); } catch {}
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
