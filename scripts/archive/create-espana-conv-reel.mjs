// Creates an Instagram Reel from Spain's World Cup 2026 squad announcement video.
// Extracts the most engaging ~45s: people reacting → kid with Spain shirt → King Felipe →
// full squad list → bracketmundial CTA.
//
// Source: https://www.youtube.com/watch?v=zo6PCXVesEw
// Usage: node scripts/create-espana-conv-reel.mjs

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'temp', 'espana-conv-reel');
const OUT = join(ROOT, 'recordings');

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

// Font
const SYS_FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf';
const FONT_BOLD = join(TMP, 'arialbd.ttf');
if (!existsSync(FONT_BOLD)) copyFileSync(SYS_FONT_BOLD, FONT_BOLD);

const REEL = join(OUT, 'reel-espana-convocatoria-v3.mp4');
const CAPTION = join(OUT, 'reel-espana-convocatoria-v3.caption.txt');
const PREVIEW = join(OUT, 'reel-espana-convocatoria-v3-preview.jpg');

// Colors (bracketmundial Panini palette)
const ORANGE = '#e8612c';
const DARK = '#1a1933';
const WHITE = '#ffffff';
const BLACK = '#000000';
const RED_ESP = '#c60b1e';     // Bandera de España rojo
const YELLOW_ESP = '#ffc400';  // Bandera de España amarillo

function rel(abs) {
  return abs.replace(ROOT + '\\', '').replace(/\\/g, '/');
}

const FONT_REL = rel(FONT_BOLD);

function run(cmd) {
  console.log(`  → ${cmd.slice(0, 220)}...`);
  execSync(cmd, { cwd: ROOT, shell: 'cmd.exe', timeout: 600000 });
}

function q(s) { return '"' + s.replace(/\\/g, '/') + '"'; }

// ═══════════════════════════════════════════════════════════════
// Timeline plan (source video is 3:09 = 189s, 1920×1080 landscape)
//
// Clip A0: 130–140s (10s) — people naming players (surgeon, soldier, outdoors)
// Clip A:  140–150s (10s) — more people reacting (bakery, taxi, cooking)
// Clip B:  153–158s ( 5s) — kid with Spain shirt (emotional)
// Clip C:  159–166s ( 7s) — King Felipe VI announcing at Las Rozas
// Clip D:  166–176s (10s) — Squad list appearing (fit-to-width, no crop)
// CTA:    generated ( 5s) — bracketmundial.com call to action
// Total:            ~47s
//
// Clips A0–C: center-crop to 1080×1920 vertical + lower-third overlay.
// Clip D: fit full landscape frame into 1080×1920 with dark padding
//         (no cropping, so all player names remain visible).
// ═══════════════════════════════════════════════════════════════

async function main() {
  const VIDEO = join(TMP, 'source.webm');

  // ──────────────────────────────────────────────────────
  // 1. Download source (skip if exists)
  // ──────────────────────────────────────────────────────
  console.log('🎬 Creating España Convocatoria Reel (~47s)\n');
  console.log('=== 1/8: Source video ===');
  if (!existsSync(VIDEO)) {
    console.log('  Downloading from YouTube...');
    run(
      `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" ` +
      `-o "${join(TMP, 'source.%(ext)s').replace(/\\/g, '/')}" ` +
      `"https://www.youtube.com/watch?v=zo6PCXVesEw"`
    );
  } else {
    console.log(`  Already downloaded: ${VIDEO}`);
  }

  // ──────────────────────────────────────────────────────
  // 2. Clip A0: People naming players (130–140s, 10s)
  // ──────────────────────────────────────────────────────
  console.log('\n=== 2/8: Clip A0 — People naming players (10s) ===');
  const CLIP_A0 = join(TMP, 'clip_a0.mp4');
  run(
    `ffmpeg -y -ss 130 -i ${q(VIDEO)} -t 10 ` +
    `-vf "scale=3413:-1:flags=lanczos,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,setsar=1,` +
    `drawbox=x=0:y=1500:w=1080:h=420:color=${DARK}@0.80:t=fill,` +
    `drawbox=x=0:y=1500:w=1080:h=4:color=${ORANGE}:t=fill,` +
    `drawtext=text='¿QUIENES VAN':fontsize=46:fontcolor=${YELLOW_ESP}:x=(w-text_w)/2:y=1560:borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='AL MUNDIAL?':fontsize=42:fontcolor=${WHITE}:x=(w-text_w)/2:y=1640:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='bracketmundial.com':fontsize=16:fontcolor=${WHITE}@0.5:x=1080-tw-15:y=1920-th-12:fontfile=${FONT_REL}" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP_A0)}`
  );

  // ──────────────────────────────────────────────────────
  // 3. Clip A: People of Spain reacting (140–150s, 10s)
  // ──────────────────────────────────────────────────────
  console.log('\n=== 3/8: Clip A — People reacting (10s) ===');
  const CLIP_A = join(TMP, 'clip_a.mp4');
  run(
    `ffmpeg -y -ss 140 -i ${q(VIDEO)} -t 10 ` +
    `-vf "scale=3413:-1:flags=lanczos,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,setsar=1,` +
    `drawbox=x=0:y=1500:w=1080:h=420:color=${DARK}@0.80:t=fill,` +
    `drawbox=x=0:y=1500:w=1080:h=4:color=${ORANGE}:t=fill,` +
    `drawtext=text='CONVOCATORIA':fontsize=46:fontcolor=${YELLOW_ESP}:x=(w-text_w)/2:y=1560:borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='ESPAÑA MUNDIAL 2026':fontsize=38:fontcolor=${WHITE}:x=(w-text_w)/2:y=1640:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='bracketmundial.com':fontsize=16:fontcolor=${WHITE}@0.5:x=1080-tw-15:y=1920-th-12:fontfile=${FONT_REL}" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP_A)}`
  );

  // ──────────────────────────────────────────────────────
  // 4. Clip B: Kid with Spain shirt (153–158s, 5s)
  // ──────────────────────────────────────────────────────
  console.log('\n=== 4/8: Clip B — Kid with Spain shirt (5s) ===');
  const CLIP_B = join(TMP, 'clip_b.mp4');
  run(
    `ffmpeg -y -ss 153 -i ${q(VIDEO)} -t 5 ` +
    `-vf "scale=3413:-1:flags=lanczos,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,setsar=1,` +
    `drawbox=x=0:y=1500:w=1080:h=420:color=${DARK}@0.80:t=fill,` +
    `drawbox=x=0:y=1500:w=1080:h=4:color=${RED_ESP}:t=fill,` +
    `drawtext=text='TODO UN PAIS':fontsize=46:fontcolor=${WHITE}:x=(w-text_w)/2:y=1560:borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='PENDIENTE DEL MUNDIAL':fontsize=38:fontcolor=${YELLOW_ESP}:x=(w-text_w)/2:y=1640:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='bracketmundial.com':fontsize=16:fontcolor=${WHITE}@0.5:x=1080-tw-15:y=1920-th-12:fontfile=${FONT_REL}" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP_B)}`
  );

  // ──────────────────────────────────────────────────────
  // 5. Clip C: King Felipe VI announcing (159–166s, 7s)
  // ──────────────────────────────────────────────────────
  console.log('\n=== 5/8: Clip C — Felipe VI announcing (7s) ===');
  const CLIP_C = join(TMP, 'clip_c.mp4');
  run(
    `ffmpeg -y -ss 159 -i ${q(VIDEO)} -t 7 ` +
    `-vf "scale=3413:-1:flags=lanczos,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,setsar=1,` +
    `drawbox=x=0:y=1500:w=1080:h=420:color=${DARK}@0.80:t=fill,` +
    `drawbox=x=0:y=1500:w=1080:h=4:color=${ORANGE}:t=fill,` +
    `drawtext=text='ESTOS SON':fontsize=46:fontcolor=${WHITE}:x=(w-text_w)/2:y=1560:borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='LOS CONVOCADOS':fontsize=44:fontcolor=${ORANGE}:x=(w-text_w)/2:y=1640:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='bracketmundial.com':fontsize=16:fontcolor=${WHITE}@0.5:x=1080-tw-15:y=1920-th-12:fontfile=${FONT_REL}" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP_C)}`
  );

  // ──────────────────────────────────────────────────────
  // 6. Clip D: Squad list appearing (166–176s, 10s)
  //    FIT the full landscape frame so ALL names are visible.
  //    Scale to 1080 wide → ~607 tall, pad top/bottom with DARK.
  // ──────────────────────────────────────────────────────
  console.log('\n=== 6/8: Clip D — Squad list (10s, fit-to-width) ===');
  const CLIP_D = join(TMP, 'clip_d.mp4');
  run(
    `ffmpeg -y -ss 166 -i ${q(VIDEO)} -t 10 ` +
    `-vf "scale=1080:-2:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${DARK},setsar=1,` +
    `drawtext=text='CONVOCADOS ESPAÑA':fontsize=40:fontcolor=${YELLOW_ESP}:x=(w-text_w)/2:y=80:borderw=3:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='MUNDIAL 2026':fontsize=34:fontcolor=${WHITE}:x=(w-text_w)/2:y=140:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='bracketmundial.com':fontsize=16:fontcolor=${WHITE}@0.5:x=1080-tw-15:y=1920-th-12:fontfile=${FONT_REL}" ` +
    `-c:v libx264 -preset fast -crf 22 -c:a aac -b:a 128k ${q(CLIP_D)}`
  );

  // ──────────────────────────────────────────────────────
  // 7. CTA scene: bracketmundial.com (5s, generated)
  // ──────────────────────────────────────────────────────
  console.log('\n=== 7/8: CTA scene — bracketmundial.com (5s) ===');
  const CTA_VIDEO = join(TMP, 'cta_video.mp4');
  const CTA = join(TMP, 'cta.mp4');

  // Generate CTA frame (solid background with text)
  run(
    `ffmpeg -y -f lavfi ` +
    `-i "color=c=${DARK}:s=1080x1920:d=5,format=yuv420p,setsar=1,` +
    `drawbox=x=0:y=0:w=1080:h=6:color=${ORANGE}:t=fill,` +
    `drawbox=x=0:y=1914:w=1080:h=6:color=${ORANGE}:t=fill,` +
    `drawbox=x=80:y=400:w=920:h=2:color=${ORANGE}@0.3:t=fill,` +
    `drawbox=x=80:y=800:w=920:h=2:color=${ORANGE}@0.3:t=fill,` +
    `drawtext=text='ESPAÑA':fontsize=56:fontcolor=${RED_ESP}:x=(w-text_w)/2:y=440:fontfile=${FONT_REL},` +
    `drawtext=text='MUNDIAL 2026':fontsize=48:fontcolor=${YELLOW_ESP}:x=(w-text_w)/2:y=540:fontfile=${FONT_REL},` +
    `drawtext=text='¿Nos da para ganar':fontsize=36:fontcolor=${WHITE}:x=(w-text_w)/2:y=680:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawtext=text='la segunda estrella?':fontsize=36:fontcolor=${ORANGE}:x=(w-text_w)/2:y=740:borderw=2:bordercolor=${BLACK}:fontfile=${FONT_REL},` +
    `drawbox=x=120:y=880:w=840:h=80:color=${ORANGE}:t=fill,` +
    `drawtext=text='bracketmundial.com':fontsize=38:fontcolor=${DARK}:x=(w-text_w)/2:y=893:fontfile=${FONT_REL},` +
    `drawtext=text='Arma tu bracket GRATIS':fontsize=28:fontcolor=${WHITE}:x=(w-text_w)/2:y=1010:fontfile=${FONT_REL},` +
    `drawtext=text='Link en la Bio':fontsize=20:fontcolor=${WHITE}@0.6:x=(w-text_w)/2:y=1080:fontfile=${FONT_REL}" ` +
    `-t 5 -c:v libx264 -preset fast -crf 18 ${q(CTA_VIDEO)}`
  );

  // Add silent audio to CTA
  run(
    `ffmpeg -y -i ${q(CTA_VIDEO)} -f lavfi -i anullsrc=r=48000:cl=stereo ` +
    `-t 5 -c:v copy -c:a aac -b:a 128k -shortest ${q(CTA)}`
  );

  // ──────────────────────────────────────────────────────
  // 8. Concatenate all clips
  // ──────────────────────────────────────────────────────
  console.log('\n=== 8/8: Concatenating all scenes (~47s total) ===');

  // Write concat demuxer file
  const CONCAT_FILE = join(TMP, 'concat.txt');
  writeFileSync(CONCAT_FILE, [
    `file '${CLIP_A0.replace(/\\/g, '/')}'`,
    `file '${CLIP_A.replace(/\\/g, '/')}'`,
    `file '${CLIP_B.replace(/\\/g, '/')}'`,
    `file '${CLIP_C.replace(/\\/g, '/')}'`,
    `file '${CLIP_D.replace(/\\/g, '/')}'`,
    `file '${CTA.replace(/\\/g, '/')}'`,
  ].join('\n'), 'utf8');

  run(
    `ffmpeg -y -f concat -safe 0 -i ${q(CONCAT_FILE)} ` +
    `-c:v libx264 -preset fast -crf 20 -c:a aac -b:a 128k ${q(REEL)}`
  );

  // Preview frame (from squad list section)
  console.log('\n=== Generating preview ===');
  run(`ffmpeg -y -ss 28 -i ${q(REEL)} -vframes 1 -update 1 ${q(PREVIEW)}`);

  // Caption
  writeFileSync(CAPTION,
`🇪🇸 ¡YA ESTÁN LOS 26 DE ESPAÑA! 🇪🇸

El Rey Felipe VI anuncia la lista de convocados de La Roja para el Mundial 2026 🏆

PORTEROS: Unai Simón · David Raya · Joan García
DEFENSAS: Cucurella · Grimaldo · Cubarsí · Laporte · Pubill · Eric García · Marcos Llorente · Porro
CENTROCAMPISTAS: Pedri · Fabián · Zubimendi · Gavi · Rodrigo · Álex Baena · Merino
DELANTEROS: Oyarzabal · Olmo · Nico · Yeremy Pino · Ferran · Borja Iglesias · Víctor Muñoz · Lamine Yamal

¿Hay sorpresas? ¿Nos da para la segunda estrella? ⭐⭐

👉 Arma tu bracket GRATIS en bracketmundial.com y demuestra si sabes más que el seleccionador. Link en la bio 🔗

#Mundial2026 #WorldCup2026 #LaRoja #España #Convocatoria #FIFAWorldCup #Seleccion #LamineYamal #Pedri #Gavi #BracketMundial #FelipeVI #Futbol`, 'utf8');
  console.log(`\n📝 Caption: ${CAPTION}`);

  // Verify
  console.log('\n=== Verification ===');
  const info = execSync(
    `ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=width,height,codec_name -of default=noprint_wrappers=1 ${q(REEL)}`,
    { cwd: ROOT, shell: 'cmd.exe', timeout: 30000 }
  ).toString().trim();
  console.log(info);
  console.log(`\n✅ Final reel: ${REEL}`);
  console.log(`🖼️ Preview: ${PREVIEW}`);
  console.log(`📝 Caption: ${CAPTION}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exitCode = 1;
});
