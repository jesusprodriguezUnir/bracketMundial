#!/usr/bin/env node
/**
 * Build previews from content/previews/*.md → src/data/previews/seed.ts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const PREVIEWS_DIR = join(process.cwd(), 'content', 'previews');
const OUT_FILE = join(process.cwd(), 'src', 'data', 'previews', 'seed.ts');

// All valid match IDs in the tournament
const VALID_MATCH_IDS = new Set([
  // Group matches M1..M72
  ...Array.from({ length: 72 }, (_, i) => `M${i + 1}`),
  // Round of 32
  ...Array.from({ length: 16 }, (_, i) => `R32-${String(i + 1).padStart(2, '0')}`),
  // Round of 16
  ...Array.from({ length: 8 }, (_, i) => `R16-${String(i + 1).padStart(2, '0')}`),
  // Quarter-finals
  ...Array.from({ length: 4 }, (_, i) => `QF-${String(i + 1).padStart(2, '0')}`),
  // Semi-finals
  ...Array.from({ length: 2 }, (_, i) => `SF-${String(i + 1).padStart(2, '0')}`),
  // Third place and final
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
      if (trimmed.length > 0) {
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
  let files;
  try {
    files = readdirSync(PREVIEWS_DIR).filter(f => extname(f) === '.md' && f !== '_template.md');
  } catch (e) {
    console.error(`No se encontró la carpeta ${PREVIEWS_DIR}`);
    process.exit(1);
  }

  const previews = [];
  let errors = 0;

  for (const file of files) {
    const filePath = join(PREVIEWS_DIR, file);
    const raw = readFileSync(filePath, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const matchId = meta.matchId?.trim();

    if (!matchId) {
      console.error(`✗ ${file}: falta matchId en el frontmatter`);
      errors++;
      continue;
    }

    if (!VALID_MATCH_IDS.has(matchId)) {
      console.error(`✗ ${file}: matchId "${matchId}" no es un ID válido del torneo`);
      errors++;
      continue;
    }

    const expectedName = `${matchId}.md`;
    if (basename(file) !== expectedName) {
      console.warn(`⚠ ${file}: el nombre de archivo no coincide con matchId (${expectedName})`);
    }

    const { previewText, chronicleHtml } = extractSections(body);

    if (!previewText) {
      console.warn(`⚠ ${file}: no tiene sección "## Previa"`);
    }

    previews.push({
      matchId,
      title: meta.title || undefined,
      author: meta.author || undefined,
      publishedAt: meta.publishedAt || undefined,
      previewText,
      chronicleHtml: chronicleHtml || undefined,
    });
  }

  if (errors > 0) {
    console.error(`\nAbortado: ${errors} error(es) en los archivos Markdown.`);
    process.exit(1);
  }

  previews.sort((a, b) => a.matchId.localeCompare(b.matchId));

  // Build TypeScript seed file
  const entries = previews.map(p => {
    const lines = [`    "${p.matchId}": {`];
    lines.push(`      matchId: "${p.matchId}",`);
    if (p.title) lines.push(`      title: ${JSON.stringify(p.title)},`);
    if (p.author) lines.push(`      author: ${JSON.stringify(p.author)},`);
    if (p.publishedAt) lines.push(`      publishedAt: ${JSON.stringify(p.publishedAt)},`);
    lines.push(`      previewText: ${JSON.stringify(p.previewText)},`);
    if (p.chronicleHtml) lines.push(`      chronicleHtml: ${JSON.stringify(p.chronicleHtml)},`);
    lines.push(`    }`);
    return lines.join('\n');
  });

  const totalMatches = VALID_MATCH_IDS.size;
  const compiled = previews.length;

  const seedContent = `// AUTO-GENERATED by scripts/build-previews.mjs
// Do not edit manually. Regenerate with: npm run previews:build
import type { Preview } from './index';

export const PREVIEWS: Record<string, Preview> = {
${entries.join(',\n')}
};
`;

  mkdirSync(join(process.cwd(), 'src', 'data', 'previews'), { recursive: true });
  writeFileSync(OUT_FILE, seedContent, 'utf-8');

  console.log(`✓ ${compiled} preview${compiled === 1 ? '' : 's'} compilada${compiled === 1 ? '' : 's'}, ${totalMatches - compiled} partido${totalMatches - compiled === 1 ? '' : 's'} sin previa`);
}

run();
