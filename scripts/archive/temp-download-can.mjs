import sharp from 'sharp';
import { statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const destDir = join(ROOT, 'public', 'players', 'CAN');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Step 1: find TM IDs via search
async function findTmId(name) {
  const url = 'https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=' + encodeURIComponent(name);
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  const html = await resp.text();
  const linkMatch = html.match(/\/([a-z-]+)\/profil\/spieler\/(\d+)/);
  return linkMatch ? linkMatch[2] : null;
}

// Step 2: get actual portrait URL from profile page
async function getImageUrl(tmId) {
  const profileUrl = `https://www.transfermarkt.com/x/profil/spieler/${tmId}`;
  const resp = await fetch(profileUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  const html = await resp.text();
  const m = html.match(/data-src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/)
    || html.match(/src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/)
    || html.match(/(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"'\s]+)/);
  return m ? m[1] : null;
}

// Step 3: download and convert
async function downloadAndConvert(url, dest) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 500) throw new Error(`Too small: ${buf.length} bytes`);
  await sharp(buf).resize(300, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
  return statSync(dest).size;
}

const players = [
  { name: 'Niko Sigur', number: 15 },
  { name: 'Ali Ahmed', number: 20 }
];

async function main() {
  let success = 0;
  for (const p of players) {
    console.log(`\n${p.name} (#${p.number}):`);
    const tmId = await findTmId(p.name);
    console.log(`  TM ID: ${tmId || 'NOT FOUND'}`);
    if (!tmId) { console.log('  ✗ Skipped'); continue; }

    const imgUrl = await getImageUrl(tmId);
    console.log(`  Image URL: ${imgUrl || 'NOT FOUND'}`);
    if (!imgUrl) { console.log('  ✗ No image'); continue; }

    const dest = join(destDir, `${p.number}.webp`);
    try {
      const size = await downloadAndConvert(imgUrl, dest);
      console.log(`  ✓ Saved ${dest} (${size} bytes)`);
      success++;
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }
  }

  console.log(`\n=== ${success}/${players.length} downloaded ===`);
  if (success > 0) {
    console.log('Regenerating manifest...');
    const { execSync } = await import('node:child_process');
    execSync('npm run photos -- CAN --type player', { cwd: ROOT, stdio: 'inherit' });
  }
}

main().catch(e => console.error(e));
