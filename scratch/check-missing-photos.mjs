import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const SQUADS_DIR = join(ROOT, 'src', 'data', 'squads');
const PUBLIC_PLAYERS = join(ROOT, 'public', 'players');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'player-photos.ts');

function parsePlayers(content) {
  const entries = [];
  // Updated regex to handle escaped quotes like N\'Golo
  // We look for name: followed by a quote, then any chars (including escaped ones) until the closing quote
  const regex = /\{\s*number:\s*(\d+),\s*name:\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  for (const m of content.matchAll(regex)) {
    entries.push({ 
      number: parseInt(m[1], 10), 
      name: m[3].replace(/\\/g, '') // Remove escape backslashes
    });
  }
  return entries;
}

// Read actual files in public/players as ground truth
const actualPhotos = new Set();
if (existsSync(PUBLIC_PLAYERS)) {
  for (const teamDir of readdirSync(PUBLIC_PLAYERS)) {
    const fullTeamDir = join(PUBLIC_PLAYERS, teamDir);
    try {
      if (readdirSync(fullTeamDir).length > 0) {
        for (const file of readdirSync(fullTeamDir)) {
          if (file.endsWith('.webp')) {
            actualPhotos.add(`${teamDir}-${basename(file, '.webp')}`);
          }
        }
      }
    } catch (e) {}
  }
}

const squadFiles = readdirSync(SQUADS_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const report = {};
let totalPlayers = 0;

for (const file of squadFiles) {
  const teamCode = basename(file, '.ts').toUpperCase();
  const content = readFileSync(join(SQUADS_DIR, file), 'utf-8');
  const players = parsePlayers(content);
  totalPlayers += players.length;
  
  const missing = players.filter(p => !actualPhotos.has(`${teamCode}-${p.number}`));
  if (missing.length > 0) {
    report[teamCode] = missing;
  }
}

console.log('--- REPORTE DETALLADO DE FOTOS FALTANTES ---');
const teams = Object.keys(report).sort();
const totalMissing = Object.values(report).reduce((acc, curr) => acc + curr.length, 0);

if (teams.length === 0) {
  console.log('¡Todas las fotos están completas!');
} else {
  console.log(`Progreso total: ${totalPlayers - totalMissing}/${totalPlayers} (${(( (totalPlayers - totalMissing) / totalPlayers) * 100).toFixed(1)}%)`);
  
  teams.forEach(team => {
    const missing = report[team];
    const teamTotal = missing.length + (totalPlayers / squadFiles.length); // Rough estimate per team if we don't count them all
    // Let's just show count
    console.log(`\n[${team}] ${missing.length} faltantes:`);
    console.log(`  ${missing.map(p => `#${p.number} ${p.name}`).join(', ')}`);
  });
  
  console.log(`\nTotal de jugadores sin foto: ${totalMissing}`);
}
