import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STADIUMS = [
  { id: 'toronto', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-toronto-stadium.jpg' },
  { id: 'vancouver', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-vancouver-stadium.jpg' },
  { id: 'azteca', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-azteca-mexico-city.jpg' },
  { id: 'akron', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-guadalajara.jpg' },
  { id: 'bbva', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-estadio-monterrey.jpg' },
  { id: 'mercedes-benz', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-atlanta-stadium.jpg' },
  { id: 'gillette', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-boston-stadium.jpg' },
  { id: 'att-stadium', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-dallas-stadium.jpg' },
  { id: 'nrg', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-houston-stadium.jpg' },
  { id: 'arrowhead', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-kansas-city-stadium.jpg' },
  { id: 'sofi', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-los-angeles-stadium.jpg' },
  { id: 'hard-rock', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-miami-stadium.jpg' },
  { id: 'metlife', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-new-york-new-jersey-stadium.jpg' },
  { id: 'lincoln-financial', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-philadelphia-stadium.jpg' },
  { id: 'levis', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-san-francisco-stadium.jpg' },
  { id: 'lumen-field', url: 'https://cdn.worldcupsuites.com/wp-content/themes/responsive/includes/custom-ui/world_cup/images-git-lfs/world-cup-venue-seattle-stadium.jpg' }
];

const dir = path.join(__dirname, '..', 'public', 'assets', 'stadiums');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const force = process.argv.includes('--force');

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed with status ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function download() {
  for (const st of STADIUMS) {
    const out = path.join(dir, `${st.id}.webp`);
    if (fs.existsSync(out) && !force) {
      console.log(`Skipping ${st.id} (ya existe)`);
      continue;
    }
    try {
      console.log(`Downloading ${st.id}...`);
      const buf = await fetchBuffer(st.url);
      await sharp(buf)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out);
      const kb = (fs.statSync(out).size / 1024).toFixed(0);
      console.log(`  -> ${st.id}.webp (${kb} KB)`);
    } catch (e) {
      console.error(`Error downloading ${st.id}:`, e.message);
    }
  }
}

download().then(() => console.log('Done'));
