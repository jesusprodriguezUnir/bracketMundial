import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

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

async function download() {
  for (const st of STADIUMS) {
    const p = path.join(dir, `${st.id}.jpg`);
    if (fs.existsSync(p)) {
      console.log(`Skipping ${st.id}`);
      continue;
    }
    console.log(`Downloading ${st.id}...`);
    await new Promise((resolve, reject) => {
      https.get(st.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed with status ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(p);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', err => {
        fs.unlink(p, () => reject(err));
      });
    }).catch(e => console.error(`Error downloading ${st.id}:`, e));
  }
}

download().then(() => console.log('Done'));
