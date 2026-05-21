import sharp from 'sharp';
import { statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const destDir = join(ROOT, 'public', 'players', 'QAT');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function findAllTmResults(query) {
  const url = 'https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=' + encodeURIComponent(query);
  const resp = await fetch(url, { headers: { 'User-Agent': UA } });
  const html = await resp.text();
  const re = /\/profil\/spieler\/(\d+)/g;
  const ids = new Set();
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return [...ids].slice(0, 5);
}

async function getProfileInfo(tmId) {
  const profileUrl = `https://www.transfermarkt.com/x/profil/spieler/${tmId}`;
  const resp = await fetch(profileUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  const html = await resp.text();
  
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const imgMatch = html.match(/data-src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/)
    || html.match(/src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/);
  const imgUrl = imgMatch ? imgMatch[1] : null;
  
  return { tmId, title, imgUrl };
}

const missingPlayers = [
  { number: 2, name: 'Pedro Miguel', queries: ['Pedro Miguel Qatar', 'Ro-Ro Qatar'] },
  { number: 14, name: 'Hommam Al-Amin', queries: ['Homam Ahmed', 'Hommam Al-Amin'] },
  { number: 16, name: 'Al Hashemi Al Hussein', queries: ['Al Hashemi Al Hussein', 'Al-Hashmi Al-Hussain'] },
  { number: 17, name: 'Ahmed Al Janhi', queries: ['Ahmed Al-Janahi', 'Ahmed Al Janhi'] },
  { number: 22, name: 'Mahmoud Abunada', queries: ['Mahmoud Abunada'] },
  { number: 25, name: 'Youssef Abdelrisaq', queries: ['Yusuf Abdurisag', 'Youssef Abdelrisaq'] }
];

async function main() {
  for (const p of missingPlayers) {
    console.log(`\nSearching for ${p.name} (#${p.number})...`);
    let found = false;
    for (const query of p.queries) {
      if (found) break;
      const ids = await findAllTmResults(query);
      for (const id of ids) {
        const info = await getProfileInfo(id);
        if (info.imgUrl && info.title.toLowerCase().includes('qatar') || info.title.toLowerCase().includes('al')) {
          console.log(`  -> Found ID ${id}: ${info.title}`);
          console.log(`     Image: ${info.imgUrl}`);
          // break here, we just want to see the options first. We will download in the next step.
          found = true;
          break;
        } else {
            console.log(`  -> ID ${id}: ${info.title} (No suitable image or match)`);
        }
      }
    }
  }
}

main().catch(e => console.error(e));
