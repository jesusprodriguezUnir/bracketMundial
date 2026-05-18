import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');
const assetsDir = join(publicDir, 'assets');
const fontsDir = join(__dirname, 'fonts');

mkdirSync(iconsDir, { recursive: true });

const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'));

// Fondo azul marino de marca (coherente con theme-color #1a1933)
const BG = { r: 26, g: 25, b: 51, alpha: 1 };

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

// iOS splash / launch image (1242×2688, iPhone 15 Pro Max portrait)
const splashBg = await sharp({
  create: { width: 1242, height: 2688, channels: 4, background: BG },
}).png().toBuffer();

const splashIcon = await sharp(faviconSvg)
  .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(splashBg)
  .composite([{ input: splashIcon, gravity: 'centre' }])
  .png()
  .toFile(join(publicDir, 'apple-launch.png'));
console.log('✓ apple-launch.png (1242×2688)');

// ── OG image: og-image.svg → og-image-v2.png 1200×630 ──
// Intenta descargar y embeber Bowlby One para fidelidad tipográfica.
async function getBowlbyOneBase64() {
  const cached = join(fontsDir, 'bowlby-one.woff2');
  if (existsSync(cached)) {
    console.log('  → usando Bowlby One cacheado');
    return readFileSync(cached).toString('base64');
  }
  try {
    mkdirSync(fontsDir, { recursive: true });
    const cssUrl = 'https://fonts.googleapis.com/css2?family=Bowlby+One&display=swap';
    const cssRes = await fetch(cssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
    });
    const css = await cssRes.text();
    const urlMatch = css.match(/url\(([^)]+\.woff2)\)/);
    if (!urlMatch) throw new Error('No se encontró URL woff2 en la respuesta de Google Fonts');
    const fontRes = await fetch(urlMatch[1]);
    const fontBuf = Buffer.from(await fontRes.arrayBuffer());
    writeFileSync(cached, fontBuf);
    console.log('  → Bowlby One descargado y cacheado');
    return fontBuf.toString('base64');
  } catch (e) {
    console.warn(`  ⚠ Bowlby One no disponible (${e.message}); el texto usará fuente de sistema`);
    return null;
  }
}

const ogSvgPath = join(assetsDir, 'og-image.svg');
try {
  const fontB64 = await getBowlbyOneBase64();
  let ogSvgContent = readFileSync(ogSvgPath, 'utf8');

  if (fontB64) {
    // Inyectar @font-face en el primer <defs> del SVG
    ogSvgContent = ogSvgContent.replace(
      '<defs>',
      `<defs><style>@font-face{font-family:'Bowlby One';src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:400;font-style:normal;}</style>`,
    );
  }

  await sharp(Buffer.from(ogSvgContent))
    .resize(1200, 630, { fit: 'contain', background: { r: 26, g: 25, b: 51, alpha: 1 } })
    .png()
    .toFile(join(assetsDir, 'og-image-v2.png'));
  console.log('✓ og-image-v2.png');
} catch (e) {
  console.warn(`⚠ og-image-v2.png no pudo generarse: ${e.message}`);
}
