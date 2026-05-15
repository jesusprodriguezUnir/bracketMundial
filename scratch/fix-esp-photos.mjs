import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const DEST_DIR = 'public/players/ESP';

async function fetchOne(name, number) {
  const searchUrl = `${API_BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
  const searchResp = await fetch(searchUrl);
  const searchJson = await searchResp.json();
  const match = searchJson.player?.[0];
  if (!match) {
    console.log(`Not found: ${name}`);
    return;
  }
  const imgUrl = match.strCutout || match.strThumb;
  if (!imgUrl) {
    console.log(`No image for: ${name}`);
    return;
  }
  const imgResp = await fetch(imgUrl);
  const imgBuf = Buffer.from(await imgResp.arrayBuffer());
  await sharp(imgBuf)
    .resize(300, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(DEST_DIR, `${number}.webp`));
  console.log(`Fetched: ${name} as ${number}.webp`);
}

async function main() {
  await fetchOne('Rodri', 16);
  await fetchOne('Grimaldo', 3);
}

main();
