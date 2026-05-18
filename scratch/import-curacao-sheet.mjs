import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const source = resolve('C:/Users/jesus/AppData/Roaming/Code/User/workspaceStorage/vscode-chat-images/image-1779133784099.png');
const outDir = resolve('public/players/CUW');

// Aproximacion del grid Panini en la imagen adjunta.
const cardX = [24, 248, 472, 695];
const cardY = [43, 335, 619, 902];
const cardW = 222;
const cardH = 266;

// Extraemos un recorte cuadrado del retrato dentro de cada ficha.
const portrait = {
  left: 24,
  top: 11,
  size: 171,
};

const slots = [
  { n: 23, row: 0, col: 1 },
  { n: 24, row: 0, col: 2 },
  { n: 21, row: 0, col: 3 },
  { n: 3, row: 1, col: 0 },
  { n: 5, row: 1, col: 1 },
  { n: 4, row: 1, col: 2 },
  { n: 8, row: 1, col: 3 },
  { n: 12, row: 2, col: 0 },
  { n: 6, row: 2, col: 1 },
  { n: 10, row: 2, col: 2 },
  { n: 11, row: 2, col: 3 },
  { n: 26, row: 3, col: 0 },
  { n: 22, row: 3, col: 1 },
  { n: 17, row: 3, col: 2 },
  { n: 25, row: 3, col: 3 },
];

mkdirSync(outDir, { recursive: true });

for (const slot of slots) {
  const left = cardX[slot.col] + portrait.left;
  const top = cardY[slot.row] + portrait.top;

  await sharp(source)
    .extract({
      left,
      top,
      width: portrait.size,
      height: portrait.size,
    })
    .resize(300, 300, { fit: 'cover' })
    .webp({ quality: 88 })
    .toFile(resolve(outDir, `${slot.n}.webp`));

  console.log(`CUW #${slot.n} -> ${resolve(outDir, `${slot.n}.webp`)}`);
}

console.log('Recortes Curazao completados.');
