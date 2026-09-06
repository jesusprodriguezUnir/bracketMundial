#!/usr/bin/env node
/**
 * Build previews from content/previews/{lang}/*.md → src/data/previews/seed.ts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const LANGUAGES = ['es', 'en'];
const PREVIEWS_BASE_DIR = join(process.cwd(), 'content', 'previews');
const OUT_FILE = join(process.cwd(), 'src', 'data', 'previews', 'seed.ts');

// All valid match IDs in the tournament
const VALID_MATCH_IDS = new Set([
  // League phase matches M1..M144 (UEFA Champions League 2026/27)
  ...Array.from({ length: 144 }, (_, i) => `M${i + 1}`),
  // Knockout
  ...Array.from({ length: 16 }, (_, i) => `R32-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 8 }, (_, i) => `R16-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 4 }, (_, i) => `QF-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 2 }, (_, i) => `SF-${String(i + 1).padStart(2, '0')}`),
  'TP-01',
  'FIN-01',
]);

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const metaText = m[1];
  const body = m[2].trimStart();
  const meta = {};
  for (const line of metaText.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body };
}

function mdToHtml(md) {
  let html = md.trim();
  if (!html) return '';

  // Lists (simple, per line)
  const lines = html.split('\n');
  let inList = false;
  const outLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        outLines.push('<ul>');
        inList = true;
      }
      const item = escapeHtml(trimmed.slice(2));
      outLines.push(`<li>${inlineMd(item)}</li>`);
    } else {
      if (inList) {
        outLines.push('</ul>');
        inList = false;
      }
      if (trimmed.startsWith('### ')) {
        const heading = escapeHtml(trimmed.slice(4));
        outLines.push(`<h4>${inlineMd(heading)}</h4>`);
      } else if (trimmed.startsWith('## ')) {
        const heading = escapeHtml(trimmed.slice(3));
        outLines.push(`<h3>${inlineMd(heading)}</h3>`);
      } else if (trimmed.length > 0) {
        outLines.push(`<p>${inlineMd(escapeHtml(trimmed))}</p>`);
      }
    }
  }
  if (inList) outLines.push('</ul>');
  return outLines.join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMd(text) {
  // Bold
  let s = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return s;
}

function extractSections(body) {
  const previewMatch = body.match(/##\s*Previa\s*\n([\s\S]*?)(?=##\s*Crónica|$)/i);
  const chronicleMatch = body.match(/##\s*Crónica\s*\n([\s\S]*)/i);
  const previewText = previewMatch ? previewMatch[1].trim() : '';
  const chronicleMd = chronicleMatch ? chronicleMatch[1].trim() : '';
  return { previewText, chronicleHtml: mdToHtml(chronicleMd) };
}

function run() {
  const allPreviews = {}; // Record<string, Record<string, any>>
  let errors = 0;
  let compiledCount = 0;

  for (const lang of LANGUAGES) {
    const langDir = join(PREVIEWS_BASE_DIR, lang);
    let files = [];
    try {
      files = readdirSync(langDir).filter(f => extname(f) === '.md' && f !== '_template.md');
    } catch (e) {
      console.warn(`⚠ Carpeta de idioma no encontrada: ${langDir}`);
      continue;
    }

    for (const file of files) {
      const filePath = join(langDir, file);
      const raw = readFileSync(filePath, 'utf-8');
      const { meta, body } = parseFrontmatter(raw);
      const matchId = meta.matchId?.trim();

      if (!matchId) {
        console.error(`✗ ${file} (${lang}): falta matchId en el frontmatter`);
        errors++;
        continue;
      }

      if (!VALID_MATCH_IDS.has(matchId)) {
        console.error(`✗ ${file} (${lang}): matchId "${matchId}" no es un ID válido del torneo`);
        errors++;
        continue;
      }

      const expectedName = `${matchId}.md`;
      if (basename(file) !== expectedName) {
        console.warn(`⚠ ${file} (${lang}): el nombre de archivo no coincide con matchId (${expectedName})`);
      }

      const { previewText, chronicleHtml } = extractSections(body);

      if (!previewText) {
        console.warn(`⚠ ${file} (${lang}): no tiene sección "## Previa"`);
      }

      if (!allPreviews[matchId]) {
        allPreviews[matchId] = {};
      }

      allPreviews[matchId][lang] = {
        matchId,
        title: meta.title || undefined,
        author: meta.author || undefined,
        publishedAt: meta.publishedAt || undefined,
        previewText,
        chronicleHtml: chronicleHtml || undefined,
      };
      compiledCount++;
    }
  }

  if (errors > 0) {
    console.error(`\nAbortado: ${errors} error(es) en los archivos Markdown.`);
    process.exit(1);
  }

  const sortedMatchIds = Object.keys(allPreviews).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  // Build TypeScript seed file
  const entries = sortedMatchIds.map(matchId => {
    const langs = allPreviews[matchId];
    const lines = [`    "${matchId}": {`];
    for (const lang of LANGUAGES) {
      const p = langs[lang];
      if (p) {
        lines.push(`      "${lang}": {`);
        lines.push(`        matchId: "${p.matchId}",`);
        if (p.title) lines.push(`        title: ${JSON.stringify(p.title)},`);
        if (p.author) lines.push(`        author: ${JSON.stringify(p.author)},`);
        if (p.publishedAt) lines.push(`        publishedAt: ${JSON.stringify(p.publishedAt)},`);
        lines.push(`        previewText: ${JSON.stringify(p.previewText)},`);
        if (p.chronicleHtml) lines.push(`        chronicleHtml: ${JSON.stringify(p.chronicleHtml)},`);
        lines.push(`      },`);
      }
    }
    lines.push(`    }`);
    return lines.join('\n');
  });

  const seedContent = `// AUTO-GENERATED by scripts/build-previews.mjs
// Do not edit manually. Regenerate with: npm run previews:build
import type { Preview } from './index';

export const PREVIEWS: Record<string, { es?: Preview; en?: Preview }> = {
${entries.join(',\n')}
};
`;

  mkdirSync(join(process.cwd(), 'src', 'data', 'previews'), { recursive: true });
  writeFileSync(OUT_FILE, seedContent, 'utf-8');

  console.log(`✓ ${compiledCount} previas/crónicas compiladas en total.`);
}

run();
