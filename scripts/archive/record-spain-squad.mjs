// Graba un reel estilo convocatoria oficial: nombres de jugadores de España
// apareciendo por posición sobre fondo rojo/amarillo, con promo final de BracketMundial.
//
// Uso: node scripts/record-spain-squad.mjs

import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { rootDir, sleep, convertToMp4 } from './lib/recording-utils.mjs';

const REEL = { width: 1080, height: 1920 };
const outDir = join(rootDir, 'recordings');

const ESCUDO_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="30" height="30" rx="5" fill="#FFC400"/><rect x="60" y="10" width="30" height="30" rx="5" fill="#C60B1E"/><rect x="10" y="60" width="30" height="30" rx="5" fill="#C60B1E"/><rect x="60" y="60" width="30" height="30" rx="5" fill="#FFC400"/></svg>'
)}`;

const POSITIONS = [
  {
    label: 'PORTEROS',
    names: ['Unai Simón', 'Raya', 'Joan García'],
  },
  {
    label: 'DEFENSAS',
    names: ['Llorente', 'Porro', 'Eric García', 'Pubill', 'Laporte', 'Cubarsí', 'Cucurella', 'Grimaldo'],
  },
  {
    label: 'CENTROCAMPISTAS',
    names: ['Pedri', 'Fabián', 'Zubimendi', 'Gavi', 'Rodri', 'Baena', 'Merino'],
  },
  {
    label: 'DELANTEROS',
    names: ['Oyarzabal', 'Olmo', 'Nico Williams', 'Pino', 'Ferran', 'Borja Iglesias', 'Víctor Muñoz', 'Lamine'],
  },
];

function buildNameChips(names, baseDelay) {
  return names
    .map((name, i) => `<span class="chip" style="animation-delay:${(baseDelay + i * 0.18).toFixed(2)}s">${name}</span>`)
    .join('');
}

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bowlby+One+SC&display=swap');

* { margin:0; padding:0; box-sizing:border-box; }

body {
  width:1080px; height:1920px;
  background: linear-gradient(180deg, #B01724 0%, #8B1122 40%, #5A0A15 100%);
  font-family: 'Archivo Black','Impact','Arial Black',sans-serif;
  color:#FFD700;
  overflow:hidden;
  display:flex; flex-direction:column;
  align-items:center;
  padding:80px 70px;
  position:relative;
}

body::after {
  content:''; position:absolute; inset:0;
  background: radial-gradient(ellipse at 50% 30%, rgba(255,215,0,0.08), transparent 60%);
  pointer-events:none;
}

.top-gold { position:absolute; top:0; left:0; right:0; height:8px; background:#FFD700; }
.btm-gold  { position:absolute; bottom:0; left:0; right:0; height:8px; background:#FFD700; }

#main { width:100%; flex:1; display:flex; flex-direction:column; align-items:center; }

.flag-row {
  display:flex; align-items:center; gap:20px;
  opacity:0; animation:fadeUp 0.7s 0.3s ease forwards;
}
.flag-row .flag-emoji { font-size:64px; }

.title-block {
  text-align:center; margin:30px 0 60px;
  opacity:0; animation:fadeScale 0.8s 0.6s ease forwards;
}
.title-block h1 {
  font-family:'Bowlby One SC','Archivo Black','Impact',sans-serif;
  font-size:100px; line-height:0.95; letter-spacing:3px;
  text-shadow:0 6px 20px rgba(0,0,0,0.6);
  color:#FFD700;
}
.title-block .sub {
  font-size:30px; margin-top:8px; color:#FFC;
  letter-spacing:6px; opacity:0.85;
}

.pos { width:100%; max-width:860px; margin-bottom:42px; }
.pos:last-of-type { margin-bottom:0; }

.pos-label {
  font-family:'Bowlby One SC','Archivo Black',sans-serif;
  font-size:34px; color:#FFD700; letter-spacing:5px;
  border-bottom:3px solid rgba(255,215,0,0.45);
  padding-bottom:8px; margin-bottom:18px;
}

.names-row {
  display:flex; flex-wrap:wrap; gap:10px 16px;
}

.chip {
  font-size:34px; color:#FFF;
  text-shadow:0 3px 8px rgba(0,0,0,0.5);
  opacity:0; animation:pop 0.35s ease forwards;
  display:inline-block;
  line-height:1.3;
}
.chip:not(:last-child)::after {
  content:'·'; color:#FFD700; margin-left:12px; opacity:0.45;
}

/* animation keyframes */
@keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeScale{ from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
@keyframes pop      { from{opacity:0;transform:translateY(18px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }

/* promo overlay */
#promo {
  display:none; position:absolute; inset:0; z-index:20;
  background:linear-gradient(180deg, #5A0A15 0%, #1A1A2E 60%, #0D0D1A 100%);
  flex-direction:column; align-items:center; justify-content:center;
  text-align:center; padding:80px;
}
#promo.show { display:flex; }
#promo .promo-icon { font-size:130px; margin-bottom:40px; }
#promo .promo-title {
  font-family:'Bowlby One SC','Archivo Black','Impact',sans-serif;
  font-size:72px; color:#FFD700; line-height:1.1;
  text-shadow:0 4px 16px rgba(0,0,0,0.7);
  animation: fadeScale 0.5s ease forwards;
}
#promo .promo-title .dot { color:#FFF; }
#promo .promo-sub {
  font-family:'Archivo Black','Impact',sans-serif;
  font-size:38px; color:#FFF; margin-top:24px;
  text-shadow:0 2px 8px rgba(0,0,0,0.6);
  animation: fadeUp 0.5s 0.3s ease forwards;
  opacity:0;
}
</style>
</head>
<body>
<div class="top-gold"></div>
<div class="btm-gold"></div>

<div id="main">
  <div class="flag-row"><span class="flag-emoji">🇪🇸</span></div>
  <div class="title-block">
    <h1>LA LISTA</h1>
    <div class="sub">CONVOCATORIA DE ESPAÑA</div>
  </div>

  <div class="pos" style="animation:fadeUp 0.5s 1.5s ease forwards; opacity:0">
    <div class="pos-label">PORTEROS</div>
    <div class="names-row">${buildNameChips(POSITIONS[0].names, 1.8)}</div>
  </div>
  <div class="pos" style="animation:fadeUp 0.5s 3.6s ease forwards; opacity:0">
    <div class="pos-label">DEFENSAS</div>
    <div class="names-row">${buildNameChips(POSITIONS[1].names, 3.9)}</div>
  </div>
  <div class="pos" style="animation:fadeUp 0.5s 7.2s ease forwards; opacity:0">
    <div class="pos-label">CENTROCAMPISTAS</div>
    <div class="names-row">${buildNameChips(POSITIONS[2].names, 7.5)}</div>
  </div>
  <div class="pos" style="animation:fadeUp 0.5s 10.6s ease forwards; opacity:0">
    <div class="pos-label">DELANTEROS</div>
    <div class="names-row">${buildNameChips(POSITIONS[3].names, 10.9)}</div>
  </div>
</div>

<div id="promo">
  <div class="promo-icon">🏆</div>
  <div class="promo-title">bracketmundial<span class="dot">.com</span></div>
  <div class="promo-sub">Arma tu bracket GRATIS</div>
</div>

<script>
  setTimeout(() => {
    document.getElementById('promo').classList.add('show');
    document.getElementById('main').style.display = 'none';
  }, 16000);
</script>
</body>
</html>`;

const CAPTION = `¡Ya es oficial! 🚨 Tenemos la convocatoria de la Selección Española. Polémica servida en 3, 2, 1... 🇪🇸🏆

¿Nos da el nivel con estos jugadores para volver a levantar la Copa del Mundo o nos volvemos antes de tiempo? Es hora de dejar de discutir con los amigos y demostrar lo que sabes.

Entra en 🌐 bracketmundial.com (tienes el enlace directo en mi bio 🔗) y empieza a jugar:
✅ Arma tu propio cuadro de eliminatorias hacia la final totalmente gratis.
✅ Reta a tus amigos a ver quién tiene mejor ojo.
✅ Guarda tus pronósticos y demuestra quién es el verdadero rey de las predicciones.

👇 ¡El debate está abajo! Ponme en comentarios en qué ronda crees que cae España. ¡Os leo!

#SeleccionEspañola #Convocatoria #LaRoja #Mundial2026 #BracketMundial #Futbol #Pronosticos #España #FiebreMundialista`;

async function record() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log('\n🇪🇸 Grabando reel de la convocatoria de España\n');
  console.log(`   Resolución: ${REEL.width}×${REEL.height} (9:16)`);
  console.log('');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      viewport: { width: REEL.width, height: REEL.height },
      recordVideo: { dir: outDir, size: { width: REEL.width, height: REEL.height } },
    });
    const page = await ctx.newPage();

    console.log('🎨 Cargando página de convocatoria...');
    await page.setContent(HTML, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Wait for all animations (16s squad + 4s promo buffer)
    console.log('🎬 Grabando... (~22s)');
    await sleep(21000); // generous cutoff

    const rawPath = await page.video().path();
    await ctx.close();

    const outMp4 = join(outDir, 'reel-convocatoria-espana.mp4');
    console.log(`\n🎞️  WebM crudo: ${rawPath}`);
    console.log('🎬 Convirtiendo a MP4 H.264…');
    await convertToMp4(rawPath, outMp4);
    console.log(`✅ Video final: ${outMp4}`);
    try { unlinkSync(rawPath); } catch {}

    const captionPath = join(outDir, 'reel-convocatoria-espana.caption.txt');
    writeFileSync(captionPath, CAPTION, 'utf8');
    console.log(`📝 Caption sugerido: ${captionPath}`);

    console.log('\n✅ Reel listo para publicar en Instagram.\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

record();
