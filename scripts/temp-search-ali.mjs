import sharp from 'sharp';
import { statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const destDir = join(ROOT, 'public', 'players', 'CAN');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function findAllTmResults(query) {
  const url = 'https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=' + encodeURIComponent(query);
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  const html = await resp.text();
  // Extract all player profile links with IDs
  const re = /\/profil\/spieler\/(\d+)/g;
  const ids = new Set();
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return [...ids].slice(0, 10);
}

async function getProfileInfo(tmId) {
  const profileUrl = `https://www.transfermarkt.com/x/profil/spieler/${tmId}`;
  const resp = await fetch(profileUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  const html = await resp.text();
  
  // Extract name from title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  
  // Extract birth date
  const birthMatch = html.match(/Date of birth.*?(\d{2}\/\d{2}\/\d{4}|\w+ \d+, \d{4})/s);
  const birth = birthMatch ? birthMatch[1] : '';
  
  // Extract nationality
  const natMatch = html.match(/Citizenship.*?<\/span>\s*([A-Za-z ]+)/s);
  const nat = natMatch ? natMatch[1].trim() : '';
  
  // Extract image
  const imgMatch = html.match(/data-src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/)
    || html.match(/src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/);
  const imgUrl = imgMatch ? imgMatch[1] : null;
  
  return { tmId, title, birth, nat, imgUrl };
}

async function downloadAndConvert(url, dest) {
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 500) throw new Error(`Too small: ${buf.length} bytes`);
  await sharp(buf).resize(300, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
  return statSync(dest).size;
}

async function main() {
  console.log('Searching for "Ali Ahmed" on Transfermarkt...');
  const ids = await findAllTmResults('Ali Ahmed');
  console.log(`Found ${ids.length} results: ${ids.join(', ')}`);
  
  console.log('\nChecking each profile:');
  for (const id of ids) {
    const info = await getProfileInfo(id);
    console.log(`  ID ${id}: ${info.title} | born: ${info.birth} | nat: ${info.nat} | img: ${info.imgUrl ? 'YES' : 'NO'}`);
  }
  
  // Also search with more specific terms
  console.log('\nSearching "Ali Ahmed Canada"...');
  const ids2 = await findAllTmResults('Ali Ahmed Canada');
  console.log(`Found ${ids2.length} results: ${ids2.join(', ')}`);
  
  console.log('\nSearching "Ali Ahmed Norwich"...');
  const ids3 = await findAllTmResults('Ali Ahmed Norwich');
  console.log(`Found ${ids3.length} results: ${ids3.join(', ')}`);
  for (const id of ids3) {
    if (!ids.includes(id)) {
      const info = await getProfileInfo(id);
      console.log(`  ID ${id}: ${info.title} | born: ${info.birth} | nat: ${info.nat} | img: ${info.imgUrl ? 'YES' : 'NO'}`);
    }
  }
}

main().catch(e => console.error(e));
