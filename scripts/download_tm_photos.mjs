import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import https from 'https';

const tmPlayers = [
  { "name": "Alban Lafont", "img": "https://img.a.transfermarkt.technology/portrait/medium/357117-1756042679.png?lm=1" },
  { "name": "Yahia Fofana", "img": "https://img.a.transfermarkt.technology/portrait/medium/418651-1759315646.jpg?lm=1" },
  { "name": "Mohamed Koné", "img": "https://img.a.transfermarkt.technology/portrait/medium/911985-1715878431.jpg?lm=1" },
  { "name": "Badra Ali Sangaré", "img": "https://img.a.transfermarkt.technology/portrait/medium/182313-1715340908.png?lm=1" },
  { "name": "Ousmane Diomande", "img": "https://img.a.transfermarkt.technology/portrait/medium/974982-1759778940.jpg?lm=1" },
  { "name": "Odilon Kossounou", "img": "https://img.a.transfermarkt.technology/portrait/medium/644771-1730183693.jpg?lm=1" },
  { "name": "Evan Ndicka", "img": "https://img.a.transfermarkt.technology/portrait/medium/371149-1757605149.jpg?lm=1" },
  { "name": "Wilfried Singo", "img": "https://img.a.transfermarkt.technology/portrait/medium/648779-1737490058.jpg?lm=1" },
  { "name": "Emmanuel Agbadou", "img": "https://img.a.transfermarkt.technology/portrait/medium/683895-1770396716.jpg?lm=1" },
  { "name": "Cédric Kipré", "img": "https://img.a.transfermarkt.technology/portrait/medium/364827-1723832143.png?lm=1" },
  { "name": "Willy Boly", "img": "https://img.a.transfermarkt.technology/portrait/medium/142310-1663057112.jpg?lm=1" },
  { "name": "Jean-Philippe Gbamin", "img": "https://img.a.transfermarkt.technology/portrait/medium/182894-1705317996.png?lm=1" },
  { "name": "Clément Akpa", "img": "https://img.a.transfermarkt.technology/portrait/medium/806793-1709202392.jpg?lm=1" },
  { "name": "Junior Diaz", "img": "https://img.a.transfermarkt.technology/portrait/medium/1009596-1693565221.png?lm=1" },
  { "name": "Ghislain Konan", "img": "https://img.a.transfermarkt.technology/portrait/medium/422850-1697280059.png?lm=1" },
  { "name": "Christopher Operi", "img": "https://img.a.transfermarkt.technology/portrait/medium/469976-1759746677.jpg?lm=1" },
  { "name": "Hassane Kamara", "img": "https://img.a.transfermarkt.technology/portrait/medium/290017-1730126484.jpg?lm=1" },
  { "name": "Guéla Doué", "img": "https://img.a.transfermarkt.technology/portrait/medium/711980-1732575765.png?lm=1" },
  { "name": "Luck Zogbé", "img": "https://img.a.transfermarkt.technology/portrait/medium/1144999-1725882803.jpg?lm=1" },
  { "name": "Armel Zohouri", "img": "https://img.a.transfermarkt.technology/portrait/medium/819419-1775651911.png?lm=1" },
  { "name": "Ibrahim Sangaré", "img": "https://img.a.transfermarkt.technology/portrait/medium/375885-1700738495.jpg?lm=1" },
  { "name": "Mory Gbane", "img": "https://img.a.transfermarkt.technology/portrait/medium/717585-1710239409.png?lm=1" },
  { "name": "Jean-Eudes Aholou", "img": "https://img.a.transfermarkt.technology/portrait/medium/178313-1757880528.jpeg?lm=1" },
  { "name": "Kader Keita", "img": "https://img.a.transfermarkt.technology/portrait/medium/658835-1732178193.png?lm=1" },
  { "name": "Jean Michaël Seri", "img": "https://img.a.transfermarkt.technology/portrait/medium/178614-1718179799.jpg?lm=1" },
  { "name": "Franck Kessié", "img": "https://img.a.transfermarkt.technology/portrait/medium/294808-1749205138.jpg?lm=1" },
  { "name": "Seko Fofana", "img": "https://img.a.transfermarkt.technology/portrait/medium/182893-1653394911.jpg?lm=1" },
  { "name": "Mohamed Diomandé", "img": "https://img.a.transfermarkt.technology/portrait/medium/658531-1718179984.jpg?lm=1" },
  { "name": "Lazare Amani", "img": "https://img.a.transfermarkt.technology/portrait/medium/435808-1762961673.jpg?lm=1" },
  { "name": "Christ Inao Oulaï", "img": "https://img.a.transfermarkt.technology/portrait/medium/1279526-1756305389.png?lm=1" },
  { "name": "Mario Dorgeles", "img": "https://img.a.transfermarkt.technology/portrait/medium/1045972-1778181083.jpg?lm=1" },
  { "name": "Simon Adingra", "img": "https://img.a.transfermarkt.technology/portrait/medium/658536-1746437487.jpg?lm=1" },
  { "name": "Jérémie Boga", "img": "https://img.a.transfermarkt.technology/portrait/medium/216569-1756824408.jpg?lm=1" },
  { "name": "Bazoumana Touré", "img": "https://img.a.transfermarkt.technology/portrait/medium/1067904-1755092124.jpg?lm=1" },
  { "name": "Wilfried Zaha", "img": "https://img.a.transfermarkt.technology/portrait/medium/145988-1771612319.jpg?lm=1" },
  { "name": "Parfait Guiagon", "img": "https://img.a.transfermarkt.technology/portrait/medium/624913-1758629240.jpg?lm=1" },
  { "name": "Yan Diomande", "img": "https://img.a.transfermarkt.technology/portrait/medium/1390649-1759779499.jpg?lm=1" },
  { "name": "Amad Diallo", "img": "https://img.a.transfermarkt.technology/portrait/medium/536835-1747857754.jpg?lm=1" },
  { "name": "Evann Guessand", "img": "https://img.a.transfermarkt.technology/portrait/medium/500689-1765812945.jpg?lm=1" },
  { "name": "Nicolas Pépé", "img": "https://img.a.transfermarkt.technology/portrait/medium/343052-1758059244.jpg?lm=1" },
  { "name": "Pacôme Zouzoua", "img": "https://img.a.transfermarkt.technology/portrait/medium/default.jpg?lm=1" },
  { "name": "Emmanuel Latte Lath", "img": "https://img.a.transfermarkt.technology/portrait/medium/392964-1771527717.jpg?lm=1" },
  { "name": "Oumar Diakité", "img": "https://img.a.transfermarkt.technology/portrait/medium/847279-1723837401.png?lm=1" },
  { "name": "Vakoun Bayo", "img": "https://img.a.transfermarkt.technology/portrait/medium/375877-1757604280.jpg?lm=1" },
  { "name": "Jean-Philippe Krasso", "img": "https://img.a.transfermarkt.technology/portrait/medium/358515-1694785707.jpg?lm=1" },
  { "name": "Sébastien Haller", "img": "https://img.a.transfermarkt.technology/portrait/medium/181375-1745174015.jpg?lm=1" },
  { "name": "Richard Kone", "img": "https://img.a.transfermarkt.technology/portrait/medium/1218761-1739357453.jpg?lm=1" },
  // Ange-Yoan Bonny wasn't matched properly or wasn't on the TM main page because he just changed nationality, let's manually get him if needed
  { "name": "Ange Yoan Bonny", "img": "https://img.a.transfermarkt.technology/portrait/medium/733939-1724227091.jpg?lm=1" },
  { "name": "Ange-Yoan Bonny", "img": "https://img.a.transfermarkt.technology/portrait/medium/733939-1724227091.jpg?lm=1" },
  { "name": "Elye Wahi", "img": "https://img.a.transfermarkt.technology/portrait/medium/659265-1725883002.png?lm=1" } // manual just in case he wasn't on TM yet
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('Failed to fetch image: ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        try {
          await sharp(buffer)
            .resize({ width: 300, height: 300, fit: 'cover', position: 'top' })
            .webp({ quality: 80 })
            .toFile(dest);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

async function run() {
  const civPath = 'd:\\Personal\\bracketMundial\\src\\data\\squads\\civ.ts';
  const content = fs.readFileSync(civPath, 'utf8');
  const regex = /{[\s]*number:\s*(\d+),\s*name:\s*'([^']+)'/g;
  let match;
  const players = [];
  while ((match = regex.exec(content)) !== null) {
    players.push({ number: match[1], name: match[2] });
  }

  const outDir = 'd:\\Personal\\bracketMundial\\public\\players\\CIV';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const player of players) {
    const tmPlayer = tmPlayers.find(p => normalize(p.name).includes(normalize(player.name)) || normalize(player.name).includes(normalize(p.name)));
    if (tmPlayer && !tmPlayer.img.includes('default.jpg')) {
      const dest = path.join(outDir, `${player.number}.webp`);
      console.log(`Downloading ${player.name} (#${player.number}) from TM...`);
      try {
        await downloadImage(tmPlayer.img, dest);
        console.log(`Saved ${dest}`);
      } catch (err) {
        console.error(`Error downloading ${player.name}:`, err);
      }
    } else {
      console.log(`No TM photo found for ${player.name}`);
    }
  }
}

run();
