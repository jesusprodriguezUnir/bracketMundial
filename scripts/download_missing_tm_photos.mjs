import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import https from 'https';

// Helper to fetch TM search page
function fetchTM(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.transfermarkt.es',
      port: 443,
      path: '/schnellsuche/ergebnis/schnellsuche?query=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const regex = /<img[^>]+src="([^"]+portrait\/(?:small|medium|header)\/[^"]+)"[^>]*title="([^"]+)"/g;
        let match;
        const results = [];
        while ((match = regex.exec(data)) !== null) {
          results.push({ name: match[2], img: match[1] });
        }
        resolve(results);
      });
    });
    req.on('error', reject);
    req.end();
  });
}

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

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  const mdPath = 'd:\\Personal\\bracketMundial\\docs\\missing-assets.md';
  const content = fs.readFileSync(mdPath, 'utf8');
  
  const playersToFetch = [];
  let currentTeam = null;
  
  const lines = content.split('\n');
  for (const line of lines) {
    const teamMatch = line.match(/^###\s+([A-Z]{3})\s+—\s+faltan/);
    if (teamMatch) {
      currentTeam = teamMatch[1];
    } else if (currentTeam) {
      const playerMatch = line.match(/^- `#(\d+)`\s+(.+)$/);
      if (playerMatch) {
        playersToFetch.push({
          team: currentTeam,
          number: playerMatch[1],
          name: playerMatch[2].trim()
        });
      }
    }
  }

  console.log(`Found ${playersToFetch.length} missing players to fetch from TM.`);
  
  for (const player of playersToFetch) {
    console.log(`Searching for ${player.name} (${player.team} #${player.number})...`);
    try {
      const results = await fetchTM(player.name);
      // Filter out default silhouettes
      const validResults = results.filter(r => !r.img.includes('default.jpg') && !r.img.includes('default.png') && r.img.includes('portrait/'));
      
      let bestMatch = validResults.find(r => normalize(r.name) === normalize(player.name));
      if (!bestMatch && validResults.length > 0) {
        bestMatch = validResults[0]; // just take the first valid one
      }
      
      if (bestMatch) {
        // change "small" to "medium" for better quality
        const highResImg = bestMatch.img.replace('/small/', '/medium/');
        
        const outDir = path.join('d:\\Personal\\bracketMundial\\public\\players', player.team);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        const dest = path.join(outDir, `${player.number}.webp`);
        
        await downloadImage(highResImg, dest);
        console.log(`  -> Saved ${dest} from ${highResImg}`);
      } else {
        console.log(`  -> No valid image found on TM.`);
      }
    } catch (e) {
      console.error(`  -> Error fetching TM for ${player.name}: ${e.message}`);
    }
    
    // Add a slight delay to avoid rate limiting
    await delay(1000);
  }
}

run();
