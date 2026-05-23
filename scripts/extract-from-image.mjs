// Recorta caras de jugadores/entrenador a partir de una imagen (lineup, post de
// IG, captura, etc.) usando bboxes que provee Claude visualmente.
//
// Uso:
//   node scripts/extract-from-image.mjs --team SWE --image path/to/img.png --spec path/to/spec.json
//   node scripts/extract-from-image.mjs --team SWE --image path/to/img.png --spec-inline '{"items":[...]}'
//
// spec.json esperado:
// {
//   "items": [
//     { "type": "player", "number": 9,  "bbox": [0.20, 0.18, 0.22, 0.28], "label": "ISAK" },
//     { "type": "player", "number": 17, "bbox": [0.42, 0.18, 0.22, 0.28], "label": "GYÖKERES" },
//     { "type": "coach",                 "bbox": [0.40, 0.85, 0.20, 0.13], "label": "Coach" }
//   ]
// }
//
// bbox son proporciones [x, y, w, h] en 0..1 sobre la imagen original.
// El script expande cada bbox un 15% (configurable con --pad) para dar margen a
// estimaciones imprecisas, recorta con sharp y guarda como webp 300px.

import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const PUBLIC_COACHES = join(ROOT, 'public', 'coaches');
const PLAYER_MANIFEST = join(ROOT, 'src', 'data', 'player-photos.ts');
const COACH_MANIFEST = join(ROOT, 'src', 'data', 'coach-photos.ts');

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (name) => {
    const eq = a.find(x => x.startsWith(`--${name}=`));
    if (eq) return eq.slice(name.length + 3);
    const i = a.indexOf(`--${name}`);
    return i >= 0 ? a[i + 1] : null;
  };
  return {
    team: get('team')?.toUpperCase() ?? null,
    image: get('image'),
    spec: get('spec'),
    specInline: get('spec-inline'),
    pad: get('pad') ? Number(get('pad')) : 0.15,
    force: a.includes('--force'),
    dryRun: a.includes('--dry-run'),
  };
}

const args = parseArgs();
if (!args.team) die('Falta --team <CODE>');
if (!args.image) die('Falta --image <path>');
if (!args.spec && !args.specInline) die('Falta --spec <path> o --spec-inline <json>');
if (!existsSync(args.image)) die(`Imagen no existe: ${args.image}`);

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

const spec = args.specInline
  ? JSON.parse(args.specInline)
  : JSON.parse(readFileSync(args.spec, 'utf8'));

if (!Array.isArray(spec.items) || spec.items.length === 0) die('spec.items vacío');

// Lee dimensiones reales y prepara directorios
const meta = await sharp(args.image).metadata();
const W = meta.width, H = meta.height;
console.log(`📷 Imagen: ${args.image} (${W}×${H})`);
console.log(`📦 Items: ${spec.items.length} · pad=${(args.pad * 100).toFixed(0)}%`);

const teamPlayersDir = join(PUBLIC_PLAYERS, args.team);
mkdirSync(teamPlayersDir, { recursive: true });
mkdirSync(PUBLIC_COACHES, { recursive: true });

const results = [];
for (const it of spec.items) {
  if (!Array.isArray(it.bbox) || it.bbox.length !== 4) {
    console.warn(`  ⚠ saltando item sin bbox válido: ${JSON.stringify(it)}`);
    continue;
  }
  const [bx, by, bw, bh] = it.bbox;
  // expandir bbox con pad, clamp a [0..1]
  const cx = bx + bw / 2, cy = by + bh / 2;
  const nw = Math.min(1, bw * (1 + args.pad));
  const nh = Math.min(1, bh * (1 + args.pad));
  const x = Math.max(0, cx - nw / 2);
  const y = Math.max(0, cy - nh / 2);
  const w = Math.min(1 - x, nw);
  const h = Math.min(1 - y, nh);

  const left = Math.round(x * W);
  const top = Math.round(y * H);
  const width = Math.round(w * W);
  const height = Math.round(h * H);

  let dest;
  if (it.type === 'player') {
    if (typeof it.number !== 'number') {
      console.warn(`  ⚠ player sin number: ${JSON.stringify(it)} — saltando`);
      continue;
    }
    dest = join(teamPlayersDir, `${it.number}.webp`);
  } else if (it.type === 'coach') {
    dest = join(PUBLIC_COACHES, `${args.team}.webp`);
  } else {
    console.warn(`  ⚠ type desconocido: ${it.type} — saltando`);
    continue;
  }

  if (!args.force && existsSync(dest)) {
    console.log(`  ⏭ existe (usa --force): ${shortPath(dest)}`);
    continue;
  }

  const label = it.label ?? (it.type === 'coach' ? 'Coach' : `#${it.number}`);
  console.log(`  ✂ ${label.padEnd(20)} bbox→ left=${left} top=${top} w=${width} h=${height} → ${shortPath(dest)}`);

  if (args.dryRun) {
    results.push({ ok: true, dest, dryRun: true });
    continue;
  }

  try {
    await sharp(args.image)
      .extract({ left, top, width, height })
      .resize(300, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(dest);
    results.push({ ok: true, dest });
  } catch (err) {
    console.error(`    ✖ falló: ${err.message}`);
    results.push({ ok: false, dest, error: err.message });
  }
}

const ok = results.filter(r => r.ok).length;
const fail = results.filter(r => !r.ok).length;
console.log(`\n✅ Recortados: ${ok}${fail ? ` · ❌ Fallos: ${fail}` : ''}`);

if (args.dryRun) {
  console.log('🔍 --dry-run: no se escribió ningún archivo ni manifiesto.');
  process.exit(0);
}

// regenerar manifiestos (mismo formato que fetch-squad-assets.mjs)
const playerCount = regeneratePlayerManifest();
const coachCount = regenerateCoachManifest();
console.log(`🗂  Manifiestos regenerados: ${playerCount} jugadores · ${coachCount} entrenadores.`);

function regeneratePlayerManifest() {
  const keys = [];
  if (existsSync(PUBLIC_PLAYERS)) {
    for (const entry of readdirSync(PUBLIC_PLAYERS, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      for (const file of readdirSync(join(PUBLIC_PLAYERS, entry.name))) {
        if (file.endsWith('.webp')) keys.push(`'${entry.name}-${basename(file, '.webp')}'`);
      }
    }
  }
  keys.sort();
  writeFileSync(
    PLAYER_MANIFEST,
    `// AUTOGENERADO por scripts/fetch-squad-assets.mjs — no editar a mano\n` +
    `export const PLAYER_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    keys.map(k => `  ${k},`).join('\n') + '\n]);\n',
  );
  return keys.length;
}

function regenerateCoachManifest() {
  const keys = [];
  if (existsSync(PUBLIC_COACHES)) {
    for (const file of readdirSync(PUBLIC_COACHES)) {
      if (file.endsWith('.webp')) keys.push(`'${basename(file, '.webp')}'`);
    }
  }
  keys.sort();
  writeFileSync(
    COACH_MANIFEST,
    `// AUTOGENERADO por scripts/fetch-squad-assets.mjs — no editar a mano\n` +
    `export const COACH_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    keys.map(k => `  ${k},`).join('\n') + '\n]);\n',
  );
  return keys.length;
}

function shortPath(p) {
  return p.replace(ROOT + '\\', '').replace(ROOT + '/', '');
}
