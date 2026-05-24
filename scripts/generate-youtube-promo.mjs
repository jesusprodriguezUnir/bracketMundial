import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=fcnDmrtj6Sk';
const SHAKIRA_VIDEO_ID = 'fcnDmrtj6Sk';

// Helper to parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    url: null,
    writeNews: false,
    lang: 'all',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--write-news') {
      flags.writeNews = true;
    } else if (arg === '--lang') {
      flags.lang = args[++i] || 'all';
    } else if (arg.startsWith('http') || arg.includes('youtube.com') || arg.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(arg)) {
      flags.url = arg;
    }
  }

  // If no URL is provided, default to Shakira's official song
  if (!flags.url) {
    flags.url = DEFAULT_VIDEO_URL;
  }

  // Standardize URL for oEmbed
  if (!flags.url.startsWith('http')) {
    flags.url = `https://www.youtube.com/watch?v=${flags.url}`;
  }

  return flags;
}

// Fetch YouTube oEmbed info
async function fetchVideoDetails(videoUrl) {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  try {
    const resp = await fetch(oEmbedUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.warn(`  ⚠ oEmbed fetch failed: ${err.message}. Using default metadata.`);
    return {
      title: 'Shakira, Burna Boy - Dai Dai (Official Video)',
      author_name: 'Shakira',
      thumbnail_url: 'https://i.ytimg.com/vi/fcnDmrtj6Sk/hqdefault.jpg',
    };
  }
}

// Generate the rich marketing templates
function generatePromoKit(meta, videoUrl) {
  const isShakira = videoUrl.includes(SHAKIRA_VIDEO_ID);
  const title = meta.title || 'Official Song';
  
  // High-fidelity templates for X/Twitter (<= 280 chars)
  const xPosts = {
    es: [
      {
        tag: 'Emoción & Himno',
        text: `🔥 ¡OFICIAL! Shakira y Burna Boy acaban de lanzar "Dai Dai", el himno del Mundial 2026. 🎶 Ritmazo de Afrobeat y pop latino que te pondrá la piel de gallina.

¿Listos para vivir la magia? Crea ya tu bracket y predice al campeón en 👉 bracketmundial.com

#Mundial2026 #Shakira #DaiDai`
      },
      {
        tag: 'Cameos de Estrellas',
        text: `👀 ¿Ya viste los cameos de Leo Messi, Haaland y Mbappé en el nuevo video de Shakira "Dai Dai"? ¡Es una locura total! ⚽✨

Si ellos ya están listos, tú también. Diseña tu camino a la final y comparte tu pronóstico del Mundial en 👉 bracketmundial.com

#DaiDai #Messi #Mundial2026`
      }
    ],
    en: [
      {
        tag: 'Excitement & Anthem',
        text: `🔥 IT'S HERE! Shakira & Burna Boy just dropped "Dai Dai", the official 2026 World Cup anthem. 🎶 An absolute banger blending Afrobeat & Latin pop!

Feel the tournament energy, predict every matchup, and build your bracket at 👉 bracketmundial.com

#WorldCup2026 #Shakira #DaiDai`
      },
      {
        tag: 'Star Cameos',
        text: `👀 Spotting Messi, Mbappé, and Haaland in Shakira's new "Dai Dai" music video is unreal! ⚽✨

The stars are ready, are you? Predict who will lift the most prestigious trophy in football history now at 👉 bracketmundial.com

#DaiDai #Messi #WorldCup2026`
      }
    ]
  };

  // High-fidelity Instagram Reel Script and Captions
  const instagramReel = {
    es: {
      hook: '¡EL MEJOR HIMNO DE LOS MUNDIALES DESDE EL WAKA WAKA! 🤯🔥',
      visualOutline: `- [0:00 - 0:03] Recorte del video de "Dai Dai" con Shakira y los niños bailando. Texto en pantalla con fuente retro Panini: "El nuevo himno ya está aquí... ¿Es el nuevo Waka Waka?".
- [0:03 - 0:08] Paneos rápidos de los cameos de Messi sonriendo, Mbappé cantando y Haaland dominando el balón.
- [0:08 - 0:15] Captura fluida del simulador de bracketmundial.com completando los cruces del Mundial 2026 (efecto retro, arrastrando selecciones).
- [0:15 - 0:20] Pantalla final con CTA: "Haz tu bracket en bracketmundial.com y desafía a tus amigos".`,
      caption: `¡Shakira lo volvió a hacer! 👑🇨🇴 Junto a Burna Boy acaban de bendecirnos con "Dai Dai", la canción oficial del Mundial 2026. 

El video dirigido por Hannah Lux Davis es una obra de arte: cameos espectaculares de Messi 🐐, Mbappé ⚡ y Haaland 🦁, y una vibra de fiesta global insuperable.

¿Quién crees que levantará la Copa del Mundo en el MetLife Stadium? 🏆✨
1️⃣ Entra a bracketmundial.com (enlace en bio 🔗)
2️⃣ Arma tu fase de grupos y cruces eliminatorios en 2 minutos.
3️⃣ Comparte tu predicción con el mundo.

¡Comenta abajo quién es tu campeón! 👇👇

#Mundial2026 #Shakira #BurnaBoy #DaiDai #LeoMessi #Haaland #Mbappe #BracketMundial #Futbol #PaniniRetro #WorldCup2026`
    },
    en: {
      hook: 'THE BEST WORLD CUP ANTHEM SINCE WAKA WAKA! 🤯🔥',
      visualOutline: `- [0:00 - 0:03] Hook scene: Clip of Shakira dancing with high-energy choreography. Text overlay: "Is Shakira\'s new World Cup song the next Waka Waka?".
- [0:03 - 0:08] Highlight clips of Messi, Mbappé, and Haaland making appearances in the music video.
- [0:08 - 0:15] Screen recording of bracketmundial.com selecting teams and predicting the final winner.
- [0:15 - 0:20] Final card: "Create your free World Cup bracket at bracketmundial.com".`,
      caption: `Shakira does it again! 👑 She teamed up with Burna Boy for the official 2026 World Cup Anthem "Dai Dai" and it is a massive banger! 🎶

With cameos from Lionel Messi 🐐, Kylian Mbappé ⚡, and Erling Haaland 🦁, the hype for the tournament is officially off the charts.

Will Messi defend the crown? Will Mbappé take revenge? Predict the entire tournament now!
1️⃣ Go to bracketmundial.com (Link in Bio 🔗)
2️⃣ Fill out your groups and knockout stages in seconds.
3️⃣ Challenge your friends to see who has the best football IQ!

Let us know who you have winning the final in the comments! 👇🏆

#WorldCup2026 #Shakira #BurnaBoy #DaiDai #Messi #Haaland #Mbappe #BracketMundial #Football #Predictions #Soccer`
    }
  };

  // Newsletter / Web Marketing Copy
  const webCopy = `
# Kit de Copias de Marketing para bracketmundial.com
**Inspirado en la canción oficial: "${title}" de ${meta.author_name || 'Shakira & Burna Boy'}**
**URL del video:** ${videoUrl}

---

## 1. Newsletter de Lanzamiento (Email Marketing)

### Asunto (Opciones):
- 🎶 ¡La música del Mundial ya suena! ¿Quién ganará? Haz tu bracket 🏆
- 👀 Messi, Haaland y Mbappé en el nuevo videoclip de Shakira + Tu Bracket 2026
- ⚡ ¿Es "Dai Dai" el nuevo Waka Waka? Arma tu predicción hoy

### Cuerpo del Correo (Español):
Hola futbolero/a,

El ambiente del Mundial ya se respira en cada rincón del planeta. Shakira y Burna Boy acaban de lanzar **"Dai Dai"**, la canción oficial de la Copa del Mundo de la FIFA 2026. ¡Y el videoclip es una auténtica locura de energía, baile y cameos estelares de Lionel Messi, Kylian Mbappé y Erling Haaland!

La música está lista, las estrellas están listas... y la pregunta del millón es: **¿Quién se coronará campeón en el MetLife Stadium?**

No te quedes fuera del debate más grande del año. En **bracketmundial.com** hemos preparado el simulador más premium y divertido para que puedas:
- 📊 Completar la fase de grupos y los mejores terceros en segundos.
- ⚔️ Resolver los cruces de eliminación directa hasta la gran final.
- 👥 Crear una liga privada retro para competir con tus amigos o compañeros de oficina.

¿Crees que el ritmo de Shakira guiará a Colombia al éxito? ¿O que Messi mantendrá el trono argentino?

👉 **[ARMAS TU BRACKET AHORA](https://bracketmundial.com)**

¡Que empiece el juego!

El equipo de bracketMundial

---

## 2. Textos para Banners Promocionales (CTA Cortos)
- **Banner Retro Panini:** "Sonando: Dai Dai 🎶 | ¿Listos para predecir? Entra a bracketmundial.com"
- **Acción Rápida:** "Messi y Shakira ya tienen sus favoritos. ¿Y tú? ¡Completa tu bracket gratis!"
- **Vibe Mundialista:** "De 'Dai Dai' a la final 🏆 | Simula tu Mundial 2026 en bracketmundial.com"
`;

  return { xPosts, instagramReel, webCopy };
}

// Generate structured news items for injection
function generateNewsInjects(videoUrl) {
  const dateStr = new Date().toISOString().slice(0, 10);
  
  return {
    COL: {
      es: {
        title: "¡Orgullo de Barranquilla! Shakira estrena 'Dai Dai', el himno oficial de la Copa Mundial 2026",
        description: "Junto a la superestrella del Afrobeat Burna Boy, Shakira vuelve a marcar el ritmo del fútbol global con 'Dai Dai'. El videoclip, con cameos de Messi y Haaland, ya se postula como heredero del histórico Waka Waka. ¿Inspirará esta energía a la Selección Colombia? Simula sus cruces y haz tu pronóstico en bracketmundial.com.",
        url: videoUrl,
        source: "Mundial 2026 Oficial",
        date: dateStr
      },
      en: {
        title: "Shakira makes history again! Drops 'Dai Dai', the official 2026 FIFA World Cup Anthem",
        description: "Colombian icon Shakira teams up with Afrobeat giant Burna Boy for the massive new anthem 'Dai Dai'. Directed by Hannah Lux Davis, the music video is a celebration of unity and global football. Build your bracket and forecast Colombia's road to glory at bracketmundial.com.",
        url: videoUrl,
        source: "World Cup 2026 Official",
        date: dateStr
      }
    },
    ARG: {
      es: {
        title: "¡Estrella de videoclip! Lionel Messi protagoniza un cameo espectacular en la nueva canción de Shakira",
        description: "El capitán de la Albiceleste brilla en el videoclip de 'Dai Dai', el himno oficial del Mundial 2026 lanzado por Shakira y Burna Boy. La aparición del 'Diez' desata la locura en redes sociales mientras Argentina defiende el título. ¿Repetirá Messi la hazaña en la final? Dibuja su camino en bracketmundial.com.",
        url: videoUrl,
        source: "AFA / YouTube",
        date: dateStr
      },
      en: {
        title: "Music Video Star! Lionel Messi makes iconic cameo in Shakira's official World Cup song",
        description: "Argentina's legendary captain Lionel Messi lights up the screen in the official music video for 'Dai Dai' by Shakira and Burna Boy. As the tournament approaches, predict if Messi will lift his second World Cup trophy at bracketmundial.com.",
        url: videoUrl,
        source: "Argentina Football / YouTube",
        date: dateStr
      }
    },
    FRA: {
      es: {
        title: "¡Hype al máximo! Kylian Mbappé aparece en el himno oficial de Shakira para el Mundial 2026",
        description: "El astro de la Selección de Francia es uno de los invitados de honor en el video de 'Dai Dai', la electrizante colaboración entre Shakira y Burna Boy. Mbappé busca revancha en territorio norteamericano. ¿Podrá 'Les Bleus' recuperar el trono mundial? Haz tu predicción completa en bracketmundial.com.",
        url: videoUrl,
        source: "FFF / YouTube",
        date: dateStr
      },
      en: {
        title: "Unbelievable Hype! Kylian Mbappé stars in Shakira's official 2026 World Cup Anthem",
        description: "French superstar Kylian Mbappé joins forces with Shakira and Burna Boy by appearing in the official music video for 'Dai Dai'. Will Mbappé lead France to another historic gold? Create your bracket and predict their destiny at bracketmundial.com.",
        url: videoUrl,
        source: "France Football / YouTube",
        date: dateStr
      }
    },
    NOR: {
      es: {
        title: "¡El rey vikingo baila! Erling Haaland destaca en el espectacular videoclip oficial de 'Dai Dai'",
        description: "Erling Haaland sorprende al mundo del fútbol y la música apareciendo en el videoclip de Shakira y Burna Boy para la Copa del Mundo 2026. Con ritmos contagiosos, el delantero de Noruega lidera las miradas. ¿Lograrán los vikingos dar la gran sorpresa del torneo? Simula toda la Copa en bracketmundial.com.",
        url: videoUrl,
        source: "NFF / YouTube",
        date: dateStr
      },
      en: {
        title: "The Viking King rules! Erling Haaland stars in Shakira's brand new 'Dai Dai' music video",
        description: "Norway's prolific striker Erling Haaland makes a stellar guest appearance in the official 2026 FIFA World Cup song 'Dai Dai' by Shakira and Burna Boy. Can Haaland shock the world in North America? Predict the entire bracket at bracketmundial.com.",
        url: videoUrl,
        source: "Norway Football / YouTube",
        date: dateStr
      }
    }
  };
}

// Injects news into news-feed.json and src/data/news/seed.ts
function injectNewsFeed(newsInjects) {
  const feedPath = join(ROOT, 'news-feed.json');
  let feedData = { updatedAt: new Date().toISOString().slice(0, 10), items: {} };

  // 1. Read existing news-feed.json
  if (existsSync(feedPath)) {
    try {
      feedData = JSON.parse(readFileSync(feedPath, 'utf8'));
      if (!feedData.items) feedData.items = {};
    } catch (err) {
      console.warn(`  ⚠ Could not parse existing news-feed.json. Starting fresh. Error: ${err.message}`);
    }
  }

  // 2. Inject items (placing them at the absolute top of the array for high visibility!)
  for (const [teamId, localizedInject] of Object.entries(newsInjects)) {
    if (!feedData.items[teamId]) {
      feedData.items[teamId] = { es: [], en: [] };
    }
    const teamNode = feedData.items[teamId];

    // Avoid duplicates by filtering out items with the same title
    const filteredEs = teamNode.es.filter(item => item.title !== localizedInject.es.title);
    const filteredEn = teamNode.en ? teamNode.en.filter(item => item.title !== localizedInject.en.title) : [];

    teamNode.es = [localizedInject.es, ...filteredEs];
    teamNode.en = [localizedInject.en, ...filteredEn];
  }

  feedData.updatedAt = new Date().toISOString().slice(0, 10);

  // Write news-feed.json (use UTF-8 without BOM as mandated by AGENTS.md)
  writeFileSync(feedPath, JSON.stringify(feedData, null, 2) + '\n', 'utf8');
  console.log(`\n📰 Injected marketing news directly into ${feedPath}!`);

  // 3. Regenerate seed.ts so it compiles correctly and works offline
  const seedPath = join(ROOT, 'src', 'data', 'news', 'seed.ts');
  if (existsSync(seedPath)) {
    try {
      const seedEntries = Object.entries(feedData.items)
        .map(([id, { es, en }]) => {
          const esLines = es.map(i =>
            `        { title: ${JSON.stringify(i.title)}, url: ${JSON.stringify(i.url)}, source: ${JSON.stringify(i.source)}, date: ${JSON.stringify(i.date)}, description: ${JSON.stringify(i.description || '')} },`
          ).join('\n');
          const enLines = en.map(i =>
            `        { title: ${JSON.stringify(i.title)}, url: ${JSON.stringify(i.url)}, source: ${JSON.stringify(i.source)}, date: ${JSON.stringify(i.date)}, description: ${JSON.stringify(i.description || '')} },`
          ).join('\n');
          return `    ${id}: {\n      es: [\n${esLines}\n      ],\n      en: [\n${enLines}\n      ],\n    },`;
        })
        .join('\n');

      const seedContent =
`// Bundled fallback — shown when the external feed is unavailable (offline, unconfigured URL).
// Regenerated by: node scripts/generate-youtube-promo.mjs (youtube-promo skill)

import type { NewsItem } from '../../lib/news-service';

interface NewsFeed {
  updatedAt: string;
  items: Record<string, { es: NewsItem[]; en: NewsItem[] }>;
}

export const NEWS_SEED: NewsFeed = {
  updatedAt: '${feedData.updatedAt}',
  items: {
${seedEntries}
  },
};
`;

      writeFileSync(seedPath, seedContent, 'utf8');
      console.log(`✅ seed.ts regenerated successfully! (${seedPath})`);
    } catch (err) {
      console.warn(`  ⚠ Could not regenerate seed.ts: ${err.message}`);
    }
  }
}

// Main execution flow
async function main() {
  const flags = parseArgs();
  console.log(`🎵 Running youtube-promo skill for: ${flags.url}`);

  // 1. Fetch details
  console.log(`  📡 Fetching video details from YouTube oEmbed...`);
  const meta = await fetchVideoDetails(flags.url);
  console.log(`  🎉 Found Video: "${meta.title}" by ${meta.author_name}`);

  // 2. Generate Marketing Kit
  console.log(`  📝 Generating marketing materials...`);
  const kit = generatePromoKit(meta, flags.url);

  // 3. Write Marketing Files
  const outputDir = join(ROOT, 'marketing', 'youtube-promo');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Write X Posts
  const xContent = `=========================================
POSTS OPTIMIZADOS PARA X (TWITTER)
=========================================

[ESPAÑOL]
${kit.xPosts.es.map((p, idx) => `Draft ${idx + 1} (${p.tag}):\n------------------------\n${p.text}\n------------------------`).join('\n\n')}

[ENGLISH]
${kit.xPosts.en.map((p, idx) => `Draft ${idx + 1} (${p.tag}):\n------------------------\n${p.text}\n------------------------`).join('\n\n')}`;
  
  writeFileSync(join(outputDir, 'promo-x.txt'), xContent, 'utf8');

  // Write Instagram Reels
  const igContent = `=========================================
INSTAGRAM REEL & POST COPY KIT
=========================================

[ESPAÑOL]
Hook Inicial: ${kit.instagramReel.es.hook}

Guion Visual Sugerido:
${kit.instagramReel.es.visualOutline}

Copy del Post / Caption:
------------------------
${kit.instagramReel.es.caption}
------------------------

=========================================

[ENGLISH]
Initial Hook: ${kit.instagramReel.en.hook}

Suggested Visual Outline:
${kit.instagramReel.en.visualOutline}

Post Copy / Caption:
------------------------
${kit.instagramReel.en.caption}
------------------------`;

  writeFileSync(join(outputDir, 'promo-instagram.txt'), igContent, 'utf8');

  // Write Web Newsletter Copy
  writeFileSync(join(outputDir, 'marketing-copy.md'), kit.webCopy.trim() + '\n', 'utf8');

  console.log(`\n✨ Promotion files written to:`);
  console.log(`  - ${join(outputDir, 'promo-x.txt')}`);
  console.log(`  - ${join(outputDir, 'promo-instagram.txt')}`);
  console.log(`  - ${join(outputDir, 'marketing-copy.md')}`);

  // 4. Optionally write into local news feed
  const newsInjects = generateNewsInjects(flags.url);
  if (flags.writeNews) {
    console.log(`  🛠 Injecting customized news into news-feed.json and seed.ts...`);
    injectNewsFeed(newsInjects);
  } else {
    // Generate individual JSON files for review
    for (const [teamId, localized] of Object.entries(newsInjects)) {
      writeFileSync(
        join(outputDir, `news-inject-${teamId}.json`),
        JSON.stringify(localized, null, 2) + '\n',
        'utf8'
      );
    }
    console.log(`  💡 Tip: To inject these directly into the app news feed, run with: --write-news`);
    console.log(`  Stored draft JSON injects in: ${outputDir}/news-inject-*.json`);
  }

  console.log(`\n🎯 youtube-promo execution finished successfully!`);
}

main().catch(err => {
  console.error('❌ Error executing youtube-promo:', err);
  process.exit(1);
});
