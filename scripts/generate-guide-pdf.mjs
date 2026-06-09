// Genera el PDF completo de la Guía del Mundial 2026
// SIN servidor Vite — renderiza HTML estático + Playwright
//
// Uso:
//   npm run guide:pdf [--lang es|en] [--mode auto|user] [--output RUTA]

import { generateGuideData } from '../src/lib/guide-service.ts';
import { renderGuideHtml } from './lib/guide-html-renderer.ts';
import { generatePdfFromHtml } from './lib/guide-pdf-generator.ts';
import { join, isAbsolute, dirname } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function parseArgs(argv) {
  const opts = { lang: 'es', mode: 'auto', output: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lang') opts.lang = argv[++i];
    else if (argv[i] === '--mode') opts.mode = argv[++i];
    else if (argv[i] === '--output') opts.output = argv[++i];
  }
  return opts;
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
  return p;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const lang = opts.lang === 'en' ? 'en' : 'es';
  const mode = opts.mode === 'user' ? 'user' : 'auto';

  const baseDir = ensureDir(join(rootDir, 'marketing', 'guide'));
  const defaultFilename = lang === 'en' ? 'world-cup-2026-guide-en.pdf' : 'guia-mundial-2026-es.pdf';
  const outputPath = opts.output
    ? (isAbsolute(opts.output) ? opts.output : join(rootDir, opts.output))
    : join(baseDir, defaultFilename);

  if (opts.output) ensureDir(join(outputPath, '..'));

  console.log('\n📖 Generador de Guía del Mundial 2026 en PDF');
  console.log(`   Idioma: ${lang.toUpperCase()}`);
  console.log(`   Modo: ${mode.toUpperCase()}`);
  console.log(`   Destino: ${outputPath}\n`);

  // 1. Generar datos (todo en Node, sin navegador)
  console.log('📊 Generando datos...');
  const data = generateGuideData(mode);
  console.log(`   ✅ ${data.teams.length} equipos, ${data.groupMatches.length} partidos de grupo, ${data.knockoutMatches.length} eliminatorias`);

  // 2. Renderizar HTML estático
  console.log('🖌 Renderizando HTML...');
  const html = renderGuideHtml(data, lang, rootDir);
  const htmlPath = outputPath.replace(/\.pdf$/i, '.html');
  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`   ✅ HTML guardado: ${htmlPath} (${(html.length / 1024).toFixed(0)} KB)`);

  // 3. Generar PDF con Playwright (sin servidor)
  console.log('🌐 Abriendo navegador headless...');
  await generatePdfFromHtml(html, outputPath);

  console.log(`\n🎉 ¡Guía generada con éxito!`);
  console.log(`   Ruta: ${outputPath}\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exitCode = 1;
});
