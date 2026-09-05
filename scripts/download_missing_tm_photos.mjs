#!/usr/bin/env node
/**
 * scripts/download_missing_tm_photos.mjs
 *
 * Descarga fotos de jugadores faltantes buscando en Transfermarkt y optimizándolas a WebP (300px).
 *
 * USO:
 *   node scripts/download_missing_tm_photos.mjs             # Procesa todos los clubes UCL con fotos faltantes
 *   node scripts/download_missing_tm_photos.mjs LIV BVB     # Solo clubes indicados
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SQUADS_DIR = path.join(ROOT, 'src', 'data', 'squads');
const PUBLIC_PLAYERS = path.join(ROOT, 'public', 'players');
const PUBLIC_COACHES = path.join(ROOT, 'public', 'coaches');
const PLAYER_MANIFEST = path.join(ROOT, 'src', 'data', 'player-photos.ts');
const COACH_MANIFEST = path.join(ROOT, 'src', 'data', 'coach-photos.ts');

const UCL_CLUBS = [
  'BVB', 'BAY', 'VFB', 'ARS', 'AVL', 'LIV', 'MCI', 'MUN', 'ATL', 'BAR',
  'RMA', 'BET', 'VIL', 'ROM', 'INT', 'NAP', 'SPO', 'FCP', 'LIL', 'PSG',
  'RCL', 'GAL', 'FEN', 'PSV', 'FEY', 'RBL', 'BRU', 'SLP', 'SHK', 'AEK',
  'LSK', 'VIK', 'BOD', 'COM', 'SLO', 'SAB'
];

const rawArgs = process.argv.slice(2).filter(a => !a.startsWith('--')).map(a => a.toUpperCase());
const targetClubs = rawArgs.length > 0 ? rawArgs.filter(c => UCL_CLUBS.includes(c)) : UCL_CLUBS;

function fetchTM(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.transfermarkt.es',
      port: 443,
      path: '/schnellsuche/ergebnis/schnellsuche?query=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const regex = /<img[^>]+src="([^"]+portrait\/(?:small|medium|header|big)\/[^"]+)"[^>]*title="([^"]+)"/g;
        let match;
        const results = [];
        while ((match = regex.exec(data)) !== null) {
          results.push({ name: match[2], img: match[1] });
        }
        resolve(results);
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('TM Timeout'));
    });
    req.end();
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function isNameMatch(searchName, resultName) {
  const n1 = normalize(searchName);
  const n2 = normalize(resultName);
  if (n1 === n2) return true;

  const parts1 = searchName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const parts2 = resultName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  if (parts1.length === 0 || parts2.length === 0) return false;

  const lastName1 = parts1[parts1.length - 1];
  const lastName2 = parts2[parts2.length - 1];

  if (lastName1.length >= 3 && lastName1 === lastName2) {
    if (parts1.length === 1 || parts2.length === 1) return true;
    return parts1.some(p => p.length >= 3 && parts2.includes(p));
  }

  const all1In2 = parts1.every(p => parts2.includes(p));
  const all2In1 = parts2.every(p => parts1.includes(p));
  return all1In2 || all2In1;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

function generateManifests() {
  const playerKeys = [];
  if (fs.existsSync(PUBLIC_PLAYERS)) {
    for (const dir of fs.readdirSync(PUBLIC_PLAYERS, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const teamDir = path.join(PUBLIC_PLAYERS, dir.name);
      for (const file of fs.readdirSync(teamDir)) {
        if (file.endsWith('.webp')) {
          playerKeys.push(`'${dir.name}-${path.basename(file, '.webp')}'`);
        }
      }
    }
  }
  playerKeys.sort();
  fs.writeFileSync(
    PLAYER_MANIFEST,
    `// AUTOGENERADO por scripts/download_missing_tm_photos.mjs — no editar a mano\n` +
    `export const PLAYER_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    playerKeys.map(k => `  ${k},`).join('\n') + '\n]);\n'
  );

  const coachKeys = [];
  if (fs.existsSync(PUBLIC_COACHES)) {
    for (const file of fs.readdirSync(PUBLIC_COACHES)) {
      if (file.endsWith('.webp')) {
        coachKeys.push(`'${path.basename(file, '.webp')}'`);
      }
    }
  }
  coachKeys.sort();
  fs.writeFileSync(
    COACH_MANIFEST,
    `// AUTOGENERADO por scripts/download_missing_tm_photos.mjs — no editar a mano\n` +
    `export const COACH_PHOTOS: ReadonlySet<string> = new Set<string>([\n` +
    coachKeys.map(k => `  ${k},`).join('\n') + '\n]);\n'
  );

  return { playersCount: playerKeys.length, coachesCount: coachKeys.length };
}

async function main() {
  console.log(`=======================================================`);
  console.log(`🔍 Búsqueda y Descarga de Fotos Faltantes (Transfermarkt)`);
  console.log(`=======================================================`);
  console.log(`Clubes objetivo: ${targetClubs.length} (${targetClubs.join(', ')})`);

  const missingPlayers = [];

  for (const club of targetClubs) {
    const squadPath = path.join(SQUADS_DIR, `${club.toLowerCase()}.ts`);
    if (!fs.existsSync(squadPath)) continue;

    const content = fs.readFileSync(squadPath, 'utf8');
    const re = /\{\s*number:\s*(\d+),\s*name:\s*'((?:\\['"]|[^'])*)'/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const num = parseInt(m[1], 10);
      const name = m[2].replace(/\\'/g, "'");
      const photoPath = path.join(PUBLIC_PLAYERS, club, `${num}.webp`);
      if (!fs.existsSync(photoPath)) {
        missingPlayers.push({ club, number: num, name });
      }
    }
  }

  console.log(`\nFotos pendientes encontradas: ${missingPlayers.length}`);
  if (missingPlayers.length === 0) {
    console.log('✅ No hay fotos faltantes para los clubes seleccionados.');
    return;
  }

  let downloaded = 0;
  let notFound = 0;

  for (let i = 0; i < missingPlayers.length; i++) {
    const p = missingPlayers[i];
    const progress = `[${i + 1}/${missingPlayers.length}]`;
    process.stdout.write(`${progress} ${p.club} #${p.number} ${p.name}... `);

    try {
      const searchVariations = [
        p.name,
        p.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        p.name.replace(/['’]/g, ''),
        p.name.replace(/['’]/g, ' ')
      ];

      // Si tiene más de dos palabras, probar las dos primeras o última
      const parts = p.name.split(' ');
      if (parts.length > 2) {
        searchVariations.push(`${parts[0]} ${parts[parts.length - 1]}`);
        searchVariations.push(`${parts[0]} ${parts[1]}`);
      }
      if (parts.length === 2 && parts[0].length > 3) {
        searchVariations.push(parts[0]);
      }

      let valid = [];
      for (const q of [...new Set(searchVariations)]) {
        if (!q.trim()) continue;
        const results = await fetchTM(q);
        const nonDefault = results.filter(r => !r.img.includes('default.jpg') && !r.img.includes('default.png') && r.img.includes('portrait/'));
        const matched = nonDefault.filter(r => isNameMatch(p.name, r.name));
        if (matched.length > 0) {
          valid = matched;
          break;
        }
      }

      if (valid.length === 0) {
        console.log(`❌ Sin foto coincidente en TM`);
        notFound++;
        await delay(400);
        continue;
      }

      let match = valid.find(r => normalize(r.name) === normalize(p.name)) || valid[0];

      // Probar resoluciones: big -> header -> medium
      const baseImg = match.img;
      const candidates = [
        baseImg.replace(/\/(small|medium|header)\//, '/big/'),
        baseImg.replace(/\/(small|medium|big)\//, '/header/'),
        baseImg.replace(/\/(small|header|big)\//, '/medium/'),
        baseImg
      ];

      let imgBuffer = null;
      for (const candUrl of candidates) {
        try {
          imgBuffer = await fetchBuffer(candUrl);
          if (imgBuffer && imgBuffer.length > 500) break;
        } catch {
          // Probar siguiente tamaño
        }
      }

      if (!imgBuffer) {
        console.log(`❌ Error al descargar imagen`);
        notFound++;
        await delay(500);
        continue;
      }

      const teamDir = path.join(PUBLIC_PLAYERS, p.club);
      if (!fs.existsSync(teamDir)) fs.mkdirSync(teamDir, { recursive: true });
      const dest = path.join(teamDir, `${p.number}.webp`);

      await sharp(imgBuffer)
        .resize(300, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(dest);

      console.log(`✅ Guardada (${match.name})`);
      downloaded++;
    } catch (err) {
      console.log(`⚠️ Error: ${err.message}`);
      notFound++;
    }

    await delay(700);
  }

  console.log(`\n=======================================================`);
  console.log(`Resumen: Descargadas: ${downloaded} | No encontradas: ${notFound}`);
  console.log(`=======================================================`);

  const { playersCount } = generateManifests();
  console.log(`📦 Manifiesto actualizado: ${playersCount} fotos en ${PLAYER_MANIFEST}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
