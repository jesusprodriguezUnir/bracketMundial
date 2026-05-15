import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');
const assetsDir = join(publicDir, 'assets');

mkdirSync(iconsDir, { recursive: true });

const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'));

// Fondo color brand (paper del tema Panini) para que el icono no sea transparente
const BG = { r: 236, g: 223, b: 192, alpha: 1 };

async function iconWithBg(svgBuffer, size) {
  const bg = await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  }).png().toBuffer();

  const icon = await sharp(svgBuffer)
    .resize(Math.round(size * 0.75), Math.round(size * 0.75), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(bg)
    .composite([{ input: icon, gravity: 'centre' }])
    .png()
    .toBuffer();
}

// Iconos PWA
for (const size of [192, 512]) {
  const buf = await iconWithBg(faviconSvg, size);
  await sharp(buf).toFile(join(iconsDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Maskable: relleno completo hasta los bordes (safe zone = 80% centro)
const maskableBuf = await sharp({
  create: { width: 512, height: 512, channels: 4, background: BG },
})
  .png()
  .toBuffer();
const maskableIcon = await sharp(faviconSvg)
  .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await sharp(maskableBuf)
  .composite([{ input: maskableIcon, gravity: 'centre' }])
  .png()
  .toFile(join(iconsDir, 'icon-512-maskable.png'));
console.log('✓ icon-512-maskable.png');

// Apple touch icon (180×180)
const appleBuf = await iconWithBg(faviconSvg, 180);
await sharp(appleBuf).toFile(join(publicDir, 'apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');

// OG image: SVG → PNG 1200×630
const ogSvg = join(assetsDir, 'og-image.svg');
try {
  await sharp(ogSvg)
    .resize(1200, 630, { fit: 'contain', background: { r: 26, g: 25, b: 51, alpha: 1 } })
    .png()
    .toFile(join(assetsDir, 'og-image.png'));
  console.log('✓ og-image.png');
} catch {
  console.warn('⚠ og-image.svg no pudo convertirse — genera og-image.png manualmente');
}
