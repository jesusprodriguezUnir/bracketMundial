import { writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function generatePdfFromHtml(
  html: string,
  outputPath: string,
): Promise<void> {
  const tempPath = join(__dirname, '..', '..', 'marketing', 'guide', 'temp-guide.html');

  writeFileSync(tempPath, html, 'utf-8');

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--allow-file-access-from-files', '--disable-web-security'],
    });

    const ctx = await browser.newContext({
      viewport: { width: 1200, height: 1600 },
      deviceScaleFactor: 2,
    });

    const page = await ctx.newPage();
    page.on('pageerror', err => console.log('  PAGE ERROR:', err.message));

    await page.goto('file:///' + tempPath.replace(/\\/g, '/'), {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Wait for Google Fonts to load
    await page.evaluate(() => document.fonts.ready);
    // Extra wait for images and fonts to render
    await page.waitForTimeout(3000);

    console.log('  Generando PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      scale: 1,
      margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' },
    });

    console.log(`  PDF guardado: ${outputPath}`);
  } finally {
    if (browser) await browser.close();
    try { unlinkSync(tempPath); } catch { /* ignore */ }
  }
}
