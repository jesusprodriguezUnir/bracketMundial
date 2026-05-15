import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_PLAYERS = 'public/players';
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

const missing = [
  { team: 'MEX', number: 13, name: 'Carlos Acevedo' },
  { team: 'MEX', number: 14, name: 'Erik Lira' },
  { team: 'MEX', number: 25, name: 'Gilberto Mora' },
  { team: 'MEX', number: 17, name: 'Armando González' },
  { team: 'RSA', number: 16, name: 'Ricardo Goss' },
  { team: 'RSA', number: 13, name: 'Samukele Kabini' },
  { team: 'RSA', number: 5,  name: 'Nkosinathi Sibisi' },
  { team: 'RSA', number: 18, name: 'Sphephelo Sithole' },
  { team: 'RSA', number: 20, name: 'Jayden Adams' },
  { team: 'RSA', number: 21, name: 'Sipho Mbule' },
  { team: 'RSA', number: 23, name: 'Iqraam Rayners' },
  { team: 'RSA', number: 24, name: 'Evidence Makgopa' },
  { team: 'RSA', number: 25, name: 'Shandre Campbell' },
  { team: 'RSA', number: 26, name: 'Mohau Nkota' },
];

async function run() {
  for (const { team, number, name } of missing) {
    const dest = join(PUBLIC_PLAYERS, team, `${number}.webp`);
    if (existsSync(dest)) continue;

    console.log(`Searching for ${name} (${team})...`);
    try {
      const searchUrl = `${API_BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
      const searchResp = await fetch(searchUrl);
      if (searchResp.status === 429) {
        console.log('Rate limited, waiting 10s...');
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      const searchJson = await searchResp.json();
      const match = searchJson.player?.find(p => p.strPlayer.toLowerCase() === name.toLowerCase()) || searchJson.player?.[0];
      
      if (!match?.strCutout && !match?.strThumb) {
        console.log(`No photo for ${name}`);
        continue;
      }

      const imgUrl = match.strCutout || match.strThumb;
      const imgResp = await fetch(imgUrl);
      const imgBuf = Buffer.from(await imgResp.arrayBuffer());

      mkdirSync(join(PUBLIC_PLAYERS, team), { recursive: true });
      await sharp(imgBuf)
        .resize(300, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(dest);
      
      console.log(`✓ Saved ${dest}`);
      await new Promise(r => setTimeout(r, 3000)); // 3s delay
    } catch (e) {
      console.error(`Error with ${name}: ${e.message}`);
    }
  }
}

run();
