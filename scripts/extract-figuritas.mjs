/**
 * extract-figuritas.mjs
 * Extrae figuritas de jugadores del álbum PDF "TODAS LAS FIGURITAS EN PDF.pdf"
 * y las convierte a webp en public/players/{TEAM}/{number}.webp
 *
 * Modos:
 *   node scripts/extract-figuritas.mjs           → extrae JPEGs a tmp/figuritas/
 *   node scripts/extract-figuritas.mjs --apply   → aplica mapping.json → public/players/
 *   node scripts/extract-figuritas.mjs --crop-test FILE.jpg  → muestra resultado de recorte
 *
 * Sin dependencias nuevas: solo node:fs, node:zlib, node:path y sharp (ya instalado).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PDF_PATH = join(ROOT, 'docs', 'TODAS LAS FIGURITAS EN PDF.pdf');
const TMP_DIR = join(ROOT, 'tmp', 'figuritas');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const PLAYER_MANIFEST = join(ROOT, 'src', 'data', 'player-photos.ts');
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const MISSING_REPORT = join(ROOT, 'docs', 'missing-assets.md');
const PDF_REPORT = join(ROOT, 'docs', 'pdf-extraction-report.md');

// ── args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const MODE_APPLY = args.includes('--apply');
const CROP_TEST = args.find(a => a.startsWith('--crop-test'));
const CROP_RATIO = 0.78; // mantener solo el 78% superior (excluye banner de nombre)

// ── crop-test: muestra resultado del recorte en una figurita de muestra ──────
if (CROP_TEST) {
  const file = args[args.indexOf('--crop-test') + 1];
  if (!file) { console.error('--crop-test requiere ruta al JPEG'); process.exit(1); }
  const meta = await sharp(file).metadata();
  const cropH = Math.floor(meta.height * CROP_RATIO);
  await sharp(file)
    .extract({ left: 0, top: 0, width: meta.width, height: cropH })
    .resize(300, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(file.replace(/\.\w+$/, '_crop.webp'));
  console.log(`Recorte guardado: ${file.replace(/\.\w+$/, '_crop.webp')} (${meta.width}×${cropH}→300px)`);
  process.exit(0);
}

// ── PDF object index ─────────────────────────────────────────────────────────
console.log('Cargando PDF...');
const pdfBuf = readFileSync(PDF_PATH);
const pdfStr = pdfBuf.latin1Slice ? pdfBuf.latin1Slice(0) : pdfBuf.toString('latin1');

function buildObjectIndex() {
  const idx = {};
  const re = /\b(\d+)\s+0\s+obj\b/g;
  let m;
  while ((m = re.exec(pdfStr))) {
    idx[m[1]] = m.index;
  }
  return idx;
}

const OBJ = buildObjectIndex();
console.log(`Objetos indexados: ${Object.keys(OBJ).length}`);

function getObjSlice(n) {
  const start = OBJ[n];
  if (start == null) return null;
  const endObj = pdfStr.indexOf('endobj', start);
  return pdfStr.slice(start, endObj > 0 ? endObj + 6 : start + 8000);
}

function getStream(n) {
  const start = OBJ[n];
  if (start == null) return null;
  const stIdx = pdfStr.indexOf('stream', start);
  if (stIdx < 0) return null;
  let p = stIdx + 6;
  if (pdfBuf[p] === 13) p++; // CR
  if (pdfBuf[p] === 10) p++; // LF
  const enIdx = pdfStr.indexOf('endstream', p);
  if (enIdx < 0) return null;
  return { dict: pdfStr.slice(start, stIdx), raw: pdfBuf.subarray(p, enIdx) };
}

function inflate(raw) {
  try { return inflateSync(raw).toString('latin1'); } catch { return null; }
}

// ── page enumeration ─────────────────────────────────────────────────────────
function findPages() {
  const pages = [];
  // Match page objects: look for /Type /Page (not /Pages)
  const re = /\b(\d+)\s+0\s+obj\b[\s\S]{0,200}?\/Type\s*\/Page(?!s)/g;
  let m;
  while ((m = re.exec(pdfStr))) {
    pages.push(+m[1]);
  }
  return pages;
}

// ── resolve indirect reference N 0 R → string value ──────────────────────────
function resolveRef(n) {
  return getObjSlice(n) ?? '';
}

// ── parse /XObject dict from /Resources ──────────────────────────────────────
// Returns { ImName: objNum, ... }
function parseXObjects(resourcesText) {
  const xobjMatch = resourcesText.match(/\/XObject\s*<<([\s\S]*?)>>/);
  if (!xobjMatch) return {};
  const inner = xobjMatch[1];
  const map = {};
  const re = /\/(\w+)\s+(\d+)\s+0\s+R/g;
  let m;
  while ((m = re.exec(inner))) map[m[1]] = +m[2];
  return map;
}

// ── parse /Contents (single or array) ────────────────────────────────────────
function getContentStream(pageDict) {
  // Array: /Contents [N 0 R M 0 R ...]
  const arrM = pageDict.match(/\/Contents\s*\[([\s\S]*?)\]/);
  if (arrM) {
    const nums = [...arrM[1].matchAll(/(\d+)\s+0\s+R/g)].map(m => +m[1]);
    const parts = nums.map(n => { const s = getStream(n); return s ? inflate(s.raw) : null; });
    return parts.filter(Boolean).join('\n');
  }
  // Single: /Contents N 0 R
  const singleM = pageDict.match(/\/Contents\s+(\d+)\s+0\s+R/);
  if (singleM) {
    const s = getStream(+singleM[1]);
    return s ? inflate(s.raw) : null;
  }
  return null;
}

// ── CTM math (2D affine concatenation) ───────────────────────────────────────
function concatCTM(c, n) {
  return {
    a: c.a * n.a + c.b * n.c,
    b: c.a * n.b + c.b * n.d,
    c: c.c * n.a + c.d * n.c,
    d: c.c * n.b + c.d * n.d,
    e: c.e * n.a + c.f * n.c + n.e,
    f: c.e * n.b + c.f * n.d + n.f,
  };
}
const ID_CTM = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

// ── content stream parser ─────────────────────────────────────────────────────
// Returns: [{name, x, y, w, h}] — one entry per /ImXX Do, in order
function parsePlacements(cs) {
  const placements = [];
  const ctmStack = [];
  let ctm = { ...ID_CTM };
  const ops = []; // operand stack (numbers + /Name strings)

  // Tokenize: numbers, /Names, string literals, operators
  const tok = /(-?\d*\.?\d+(?:e[+-]?\d+)?)|(\/([\w]+))|(BT|ET|q|Q|cm|Do|Tf|Tj|TJ|Td|BDC|BMC|EMC|MP|DP|re|W|W\*|n|f|F|S|s|b|B|h|l|m|c|v|y|g|G|rg|RG|k|K|cs|CS|sc|SC|scn|SCN|gs|ri|i|j|J|w|d|M|sh|BI|ID|EI|d0|d1|T\*|Tc|Tw|Tz|TL|Tr|Ts)/g;
  let m;
  while ((m = tok.exec(cs))) {
    if (m[1] !== undefined) {
      ops.push(+m[1]);
    } else if (m[2] !== undefined) {
      ops.push(m[2]); // '/Name'
    } else if (m[4] !== undefined) {
      const op = m[4];
      if (op === 'q') {
        ctmStack.push({ ...ctm });
      } else if (op === 'Q') {
        if (ctmStack.length) ctm = ctmStack.pop();
      } else if (op === 'cm') {
        if (ops.length >= 6) {
          const [a, b, c, d, e, f] = ops.splice(ops.length - 6);
          ctm = concatCTM(ctm, { a, b, c, d, e, f });
        }
      } else if (op === 'Do') {
        const nameToken = ops.findLast(t => typeof t === 'string' && t.startsWith('/'));
        if (nameToken) {
          const name = nameToken.slice(1);
          // w,h from CTM (axis-aligned: a=width, d=height; e,f = lower-left corner)
          const w = Math.abs(ctm.a);
          const h = Math.abs(ctm.d);
          const x = ctm.e;
          const y = ctm.f;
          placements.push({ name, x, y, w, h });
        }
      }
      ops.length = 0;
    }
  }
  return placements;
}

// ── image object decoder ──────────────────────────────────────────────────────
function getImageInfo(objNum) {
  const s = getObjSlice(objNum);
  if (!s) return null;
  if (!/\/Subtype\s*\/Image/.test(s)) return null;
  const wm = s.match(/\/Width\s+(\d+)/);
  const hm = s.match(/\/Height\s+(\d+)/);
  const isDCT = /\/DCTDecode/.test(s);
  if (!isDCT || !wm || !hm) return null;
  return { width: +wm[1], height: +hm[1], isDCT };
}

// ── extract JPEG bytes for an image object ───────────────────────────────────
function extractJpeg(objNum) {
  const s = getStream(objNum);
  if (!s) return null;
  return s.raw; // raw bytes ARE the JPEG (DCTDecode = raw JPEG)
}

// ── etapa 1: extracción ───────────────────────────────────────────────────────
async function extract() {
  mkdirSync(TMP_DIR, { recursive: true });

  const pages = findPages();
  console.log(`Páginas encontradas: ${pages.length}`);

  // Collect all image placements across all pages
  // pagePlacements: [{pageIdx, pageObjNum, name, x, y, w, h}]
  const pagePlacements = [];
  const pageXObjects = []; // [{pageIdx, xobj: {ImName:objNum}}]

  for (let pi = 0; pi < pages.length; pi++) {
    const pn = pages[pi];
    const pageDict = getObjSlice(pn);
    if (!pageDict) continue;

    // Resolve /Resources (may be indirect)
    let resourcesText = pageDict;
    const resIndirect = pageDict.match(/\/Resources\s+(\d+)\s+0\s+R/);
    if (resIndirect) {
      resourcesText = resolveRef(+resIndirect[1]);
    }

    const xobj = parseXObjects(resourcesText);
    pageXObjects.push({ pageIdx: pi, xobj });

    const cs = getContentStream(pageDict);
    if (!cs) continue;

    const placements = parsePlacements(cs);
    for (const pl of placements) {
      pagePlacements.push({ pageIdx: pi + 1, pageObjNum: pn, ...pl });
    }
  }

  console.log(`Total placements: ${pagePlacements.length}`);

  // Build: ImName → objNum for each page
  // We need to map placements back to image objects
  // Build a global name→set of (pageIdx, objNum) map
  const nameToObj = new Map(); // 'Im14' → Set<objNum>
  for (const { pageIdx, xobj } of pageXObjects) {
    for (const [name, objNum] of Object.entries(xobj)) {
      if (!nameToObj.has(name)) nameToObj.set(name, new Set());
      nameToObj.get(name).add(objNum);
    }
  }

  // For placements, resolve name → objNum (use first page where it appears)
  // Also build page-specific mapping
  const pageObjMaps = new Map(); // pageIdx → {ImName: objNum}
  for (const { pageIdx, xobj } of pageXObjects) {
    pageObjMaps.set(pageIdx, xobj);
  }

  // Deduplicate: track which objNums have been written
  const written = new Set();
  const index = [];

  // Sort placements per page in reading order: descending y (top→bottom in PDF coords), then ascending x
  // Group by pageIdx
  const byPage = new Map();
  for (const pl of pagePlacements) {
    if (!byPage.has(pl.pageIdx)) byPage.set(pl.pageIdx, []);
    byPage.get(pl.pageIdx).push(pl);
  }

  let fileCount = 0;
  for (const [pageIdx, pls] of [...byPage.entries()].sort((a, b) => a[0] - b[0])) {
    // Sort reading order
    const sorted = pls.slice().sort((a, b) => {
      const rowDiff = Math.round((b.y - a.y) / 20); // cluster rows by 20pt tolerance
      if (rowDiff !== 0) return rowDiff;
      return a.x - b.x;
    });

    for (let pos = 0; pos < sorted.length; pos++) {
      const pl = sorted[pos];
      // Resolve objNum for this placement on this page
      const xobj = pageObjMaps.get(pageIdx - 1) ?? pageObjMaps.get(pageIdx) ?? {};
      const objNum = xobj[pl.name];
      if (objNum == null) continue;

      const info = getImageInfo(objNum);
      if (!info) continue;

      // Filter: only player-sticker-sized images (≈385×511px ±30%)
      const wOk = info.width >= 250 && info.width <= 600;
      const hOk = info.height >= 350 && info.height <= 750;
      if (!wOk || !hOk) continue;

      // Skip duplicates (same objNum already extracted)
      if (written.has(objNum)) {
        // Still add to index as another placement reference
        const existing = index.find(e => e.objId === objNum);
        if (existing) {
          index.push({
            page: pageIdx, pos, objId: objNum,
            width: info.width, height: info.height,
            file: existing.file, // same file
          });
        }
        continue;
      }

      written.add(objNum);
      const filename = `p${String(pageIdx).padStart(3, '0')}_${String(pos).padStart(2, '0')}.jpg`;
      const dest = join(TMP_DIR, filename);

      const jpegBytes = extractJpeg(objNum);
      if (!jpegBytes || jpegBytes.length < 1000) continue;

      // Convert latin1 buffer → proper Buffer (the raw bytes are binary, already a Buffer subarray)
      try {
        // jpegBytes is already a Buffer slice — validate it's a JPEG (FFD8)
        if (jpegBytes[0] !== 0xFF || jpegBytes[1] !== 0xD8) {
          console.warn(`  obj${objNum}: no empieza con FFD8, omitiendo`);
          continue;
        }
        writeFileSync(dest, jpegBytes);
        fileCount++;
        index.push({ page: pageIdx, pos, objId: objNum, width: info.width, height: info.height, file: filename });
      } catch (e) {
        console.warn(`  Error escribiendo ${filename}: ${e.message}`);
      }
    }
  }

  console.log(`\nFiguritas extraídas: ${fileCount} (${written.size} únicas) → ${TMP_DIR}`);

  // Write index.json
  writeFileSync(join(TMP_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf8');
  console.log(`index.json escrito con ${index.length} entradas`);

  // Compute refresh-candidates (existing photos of low quality)
  await computeRefreshCandidates();

  console.log('\n✅ Etapa 1 completa. Siguiente: identificar visualmente y construir mapping.json');
  console.log(`   Ver muestras en: ${TMP_DIR}`);
  console.log(`   Luego: node scripts/extract-figuritas.mjs --apply`);
}

async function computeRefreshCandidates() {
  const candidates = [];
  if (!existsSync(PUBLIC_PLAYERS)) return;
  for (const teamDir of readdirSync(PUBLIC_PLAYERS)) {
    const teamPath = join(PUBLIC_PLAYERS, teamDir);
    if (!statSync(teamPath).isDirectory()) continue;
    for (const file of readdirSync(teamPath)) {
      if (!file.endsWith('.webp')) continue;
      const fp = join(teamPath, file);
      const size = statSync(fp).size;
      try {
        const meta = await sharp(fp).metadata();
        if ((meta.width ?? 999) < 200 || size < 6000) {
          const number = parseInt(file, 10);
          candidates.push({ team: teamDir, number, file: `${teamDir}/${file}`, width: meta.width, bytes: size });
        }
      } catch { /* skip corrupt */ }
    }
  }
  writeFileSync(join(TMP_DIR, 'refresh-candidates.json'), JSON.stringify(candidates, null, 2), 'utf8');
  console.log(`refresh-candidates.json: ${candidates.length} fotos de baja calidad`);
}

// ── etapa 3: apply mapping ────────────────────────────────────────────────────
async function apply() {
  const mappingPath = join(TMP_DIR, 'mapping.json');
  if (!existsSync(mappingPath)) {
    console.error(`No existe ${mappingPath}. Construirlo primero (Etapa 2 de identificación visual).`);
    process.exit(1);
  }

  const mapping = JSON.parse(readFileSync(mappingPath, 'utf8'));
  const candidates = existsSync(join(TMP_DIR, 'refresh-candidates.json'))
    ? JSON.parse(readFileSync(join(TMP_DIR, 'refresh-candidates.json'), 'utf8'))
    : [];
  const refreshSet = new Set(candidates.map(c => `${c.team}/${c.number}`));

  const written = [];
  const skipped = [];

  for (const entry of mapping) {
    if (entry.confidence !== 'high') { skipped.push({ ...entry, reason: 'low-confidence' }); continue; }
    const { team, number, file } = entry;
    const srcPath = join(TMP_DIR, file);
    if (!existsSync(srcPath)) { skipped.push({ ...entry, reason: 'source-not-found' }); continue; }

    const destDir = join(PUBLIC_PLAYERS, team);
    const destPath = join(destDir, `${number}.webp`);
    const isMissing = !existsSync(destPath);
    const isCandidate = refreshSet.has(`${team}/${number}`);

    if (!isMissing && !isCandidate) {
      skipped.push({ ...entry, reason: 'exists-ok-quality' });
      continue;
    }

    mkdirSync(destDir, { recursive: true });
    try {
      const meta = await sharp(srcPath).metadata();
      const cropH = Math.floor(meta.height * CROP_RATIO);
      await sharp(srcPath)
        .extract({ left: 0, top: 0, width: meta.width, height: cropH })
        .resize(300, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destPath);
      written.push({ team, number, file, reason: isMissing ? 'missing' : 'refresh' });
      console.log(`  ✓ ${team}/${number}.webp (${isMissing ? 'nuevo' : 'refrescado'})`);
    } catch (e) {
      skipped.push({ ...entry, reason: `sharp-error: ${e.message}` });
    }
  }

  console.log(`\nEscritas: ${written.length} | Omitidas: ${skipped.length}`);

  // Regenerate player-photos.ts manifest
  regenerateManifest();

  // Write report
  writeReport(written, skipped, mapping);

  console.log('\n✅ Etapa 3 completa. Ejecutar: npm run assets:report');
}

// ── regenerate player-photos.ts ───────────────────────────────────────────────
function regenerateManifest() {
  if (!existsSync(PUBLIC_PLAYERS)) return;
  const keys = [];
  for (const teamDir of readdirSync(PUBLIC_PLAYERS).sort()) {
    const teamPath = join(PUBLIC_PLAYERS, teamDir);
    if (!statSync(teamPath).isDirectory()) continue;
    for (const file of readdirSync(teamPath).sort()) {
      if (file.endsWith('.webp')) {
        keys.push(`${teamDir}/${file.replace('.webp', '')}`);
      }
    }
  }
  const content = `// AUTO-GENERATED — no editar a mano. Regenerar con scripts/extract-figuritas.mjs --apply
export const PLAYER_PHOTOS: ReadonlySet<string> = new Set([
${keys.map(k => `  '${k}',`).join('\n')}
]);
`;
  writeFileSync(PLAYER_MANIFEST, content, 'utf8');
  console.log(`player-photos.ts regenerado: ${keys.length} entradas`);
}

// ── write PDF extraction report ───────────────────────────────────────────────
function writeReport(written, skipped, allMapping) {
  const absent = allMapping.filter(e => e.confidence !== 'high');
  const lines = [
    `# Reporte de extracción PDF — Mundial 2026`,
    ``,
    `> Generado el ${new Date().toLocaleDateString('es-ES')} con \`extract-figuritas.mjs --apply\``,
    ``,
    `**Escritas:** ${written.length} | **Omitidas:** ${skipped.length} | **Fuente:** TODAS LAS FIGURITAS EN PDF.pdf`,
    ``,
    `## Fotos escritas`,
    ``,
    `| Equipo | # | Motivo |`,
    `|--------|---|--------|`,
    ...written.map(e => `| ${e.team} | ${e.number} | ${e.reason} |`),
    ``,
    `## Omitidas (para revisión manual)`,
    ``,
    `| Equipo | # | Jugador | Motivo |`,
    `|--------|---|---------|--------|`,
    ...skipped.map(e => `| ${e.team ?? ''} | ${e.number ?? ''} | ${e.name ?? ''} | ${e.reason} |`),
    ``,
    `## Notas`,
    ``,
    `- Figuritas no encontradas en el álbum o con baja confianza siguen mostrando iniciales.`,
    `- Para añadir más: editar \`tmp/figuritas/mapping.json\` y re-ejecutar \`--apply\`.`,
  ];
  writeFileSync(PDF_REPORT, lines.join('\n'), 'utf8');
  console.log(`Reporte: ${PDF_REPORT}`);
}

// ── main ──────────────────────────────────────────────────────────────────────
if (MODE_APPLY) {
  await apply();
} else {
  await extract();
}
