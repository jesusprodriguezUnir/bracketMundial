import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const dest = join(ROOT, 'public', 'players', 'CAN', '20.webp');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function downloadCorrectAli() {
  const profileUrl = 'https://www.transfermarkt.com/x/profil/spieler/995642';
  const resp = await fetch(profileUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  const html = await resp.text();
  const imgMatch = html.match(/data-src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/)
    || html.match(/src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/);
  
  if (imgMatch) {
    const imgUrl = imgMatch[1];
    const imgResp = await fetch(imgUrl, { headers: { 'User-Agent': UA } });
    const buf = Buffer.from(await imgResp.arrayBuffer());
    await sharp(buf).resize(300, null, { withoutEnlargement: true }).webp({ quality: 90 }).toFile(dest);
    console.log('Corrected Ali Ahmed #20 for Canada!');
  } else {
    console.log('Could not find image url for Ali Ahmed');
  }
}

downloadCorrectAli().catch(console.error);
