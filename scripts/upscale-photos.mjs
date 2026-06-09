// Upscale existing player and coach photos for premium PDF quality
// Uses Sharp with Lanczos filter for high-quality upscaling

import { existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const PLAYERS_DIR = join(rootDir, 'public', 'players');
const COACHES_DIR = join(rootDir, 'public', 'coaches');
const UPSCALED_PLAYERS_DIR = join(rootDir, 'public', 'players-upscaled');
const UPSCALED_COACHES_DIR = join(rootDir, 'public', 'coaches-upscaled');

// Upscale factors for different use cases
const UPSCALE_FACTORS = {
  pdf: 3,      // 3x for PDF (from ~50px to ~150px effective)
  preview: 2,  // 2x for screen preview
};

const WEBP_OPTIONS = {
  quality: 95,
  lossless: false,
  effort: 6,
  smartSubsample: true,
};

async function upscaleImage(inputPath, outputPath, factor) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const newWidth = Math.round(metadata.width * factor);
    const newHeight = Math.round(metadata.height * factor);

    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .webp(WEBP_OPTIONS)
      .toFile(outputPath);

    return { success: true, width: newWidth, height: newHeight };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function processDirectory(inputDir, outputDir, factor, label) {
  if (!existsSync(inputDir)) {
    console.log(`⚠️  ${label} directory not found: ${inputDir}`);
    return { processed: 0, failed: 0 };
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const teams = readdirSync(inputDir).filter(f => statSync(join(inputDir, f)).isDirectory());
  let totalProcessed = 0;
  let totalFailed = 0;

  for (const team of teams) {
    const teamInputDir = join(inputDir, team);
    const teamOutputDir = join(outputDir, team);

    if (!existsSync(teamOutputDir)) {
      mkdirSync(teamOutputDir, { recursive: true });
    }

    const files = readdirSync(teamInputDir).filter(f => 
      ['.webp', '.png', '.jpg', '.jpeg'].includes(extname(f).toLowerCase())
    );

    for (const file of files) {
      const inputPath = join(teamInputDir, file);
      const outputPath = join(teamOutputDir, file.replace(/\.(webp|png|jpg|jpeg)$/i, '.webp'));

      const result = await upscaleImage(inputPath, outputPath, factor);
      if (result.success) {
        totalProcessed++;
      } else {
        totalFailed++;
        console.error(`   ❌ ${team}/${file}: ${result.error}`);
      }
    }

    if (files.length > 0) {
      console.log(`   ✅ ${team}: ${files.length} imágenes`);
    }
  }

  return { processed: totalProcessed, failed: totalFailed };
}

async function processCoaches(inputDir, outputDir, factor) {
  if (!existsSync(inputDir)) {
    console.log(`⚠️  Coaches directory not found: ${inputDir}`);
    return { processed: 0, failed: 0 };
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const files = readdirSync(inputDir).filter(f => 
    ['.webp', '.png', '.jpg', '.jpeg'].includes(extname(f).toLowerCase())
  );

  let totalProcessed = 0;
  let totalFailed = 0;

  for (const file of files) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file.replace(/\.(webp|png|jpg|jpeg)$/i, '.webp'));

    const result = await upscaleImage(inputPath, outputPath, factor);
    if (result.success) {
      totalProcessed++;
    } else {
      totalFailed++;
      console.error(`   ❌ ${file}: ${result.error}`);
    }
  }

  console.log(`   ✅ Entrenadores: ${totalProcessed} imágenes`);
  return { processed: totalProcessed, failed: totalFailed };
}

async function main() {
  console.log('\n🖼️  UPSCALE FOTOS PARA PDF PREMIUM');
  console.log('===================================\n');

  const factor = UPSCALE_FACTORS.pdf;
  console.log(`Factor de upscale: ${factor}x (Lanczos3, WebP 95% quality)\n`);

  // Process players
  console.log('📸 Procesando fotos de jugadores...');
  const playersResult = await processDirectory(
    PLAYERS_DIR,
    UPSCALED_PLAYERS_DIR,
    factor,
    'Jugadores'
  );

  // Process coaches
  console.log('\n👨‍🏫 Procesando fotos de entrenadores...');
  const coachesResult = await processCoaches(
    COACHES_DIR,
    UPSCALED_COACHES_DIR,
    factor
  );

  console.log('\n📊 RESUMEN');
  console.log('==========');
  console.log(`Jugadores: ${playersResult.processed} procesadas, ${playersResult.failed} fallidas`);
  console.log(`Entrenadores: ${coachesResult.processed} procesadas, ${coachesResult.failed} fallidas`);
  console.log(`\n📁 Salida:`);
  console.log(`   Jugadores: ${UPSCALED_PLAYERS_DIR}`);
  console.log(`   Entrenadores: ${UPSCALED_COACHES_DIR}`);
  console.log('\n✨ Listo para generar PDF premium\n');
}

main().catch(console.error);