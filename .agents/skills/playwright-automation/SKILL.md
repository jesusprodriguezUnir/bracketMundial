---
name: playwright-automation
description: >
  Automatización de navegador con Playwright para grabar demos,
  tomar screenshots y ejecutar flujos E2E en bracketMundial.
  Úsala cuando el usuario pida: grabar video, record demo,
  screenshot, automatizar navegador, playwright, generar video
  para redes sociales.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: playwright-automation

Automatiza Chromium con Playwright para grabar videos demo de la app,
tomar screenshots y ejecutar flujos de interacción.

## Comandos rápidos

```bash
# Listar plataformas soportadas
npm run video:list

# Grabar video para una plataforma (default: instagram, 30s)
npm run video                    # instagram 1080x1920
npm run video -- tiktok          # tiktok 1080x1920
npm run video -- facebook        # facebook 1080x1080
npm run video -- twitter         # twitter 1920x1080
npm run video -- tiktok 15       # duración personalizada (15s)

# Grabar para TODAS las plataformas de una vez
npm run video:all
npm run video:all -- 15          # 15s por plataforma
```

## Plataformas

| Plataforma | Resolución | Uso |
|------------|-----------|-----|
| `instagram` | 1080×1920 | Reels, Stories |
| `tiktok` | 1080×1920 | TikTok vertical |
| `facebook` | 1080×1080 | Post cuadrado |
| `twitter` | 1920×1080 | Post horizontal |

Los videos se guardan en `recordings/demo-{platform}.mp4` (H.264).

## Arquitectura del script

### `scripts/record-video.mjs` — grabación individual

1. Arranca `vite dev` en background
2. Espera a que el servidor responda en `localhost:5173`
3. Lanza Chromium headless con `recordVideo` habilitado
4. Navega por las 7 vistas de la app con scroll suave
5. Cierra contexto, convierte WebM → MP4 con ffmpeg
6. Limpia archivo temporal

### `scripts/record-video-all.mjs` — grabación masiva

Itera sobre las 4 plataformas y ejecuta `record-video.mjs` para cada una.
El servidor dev se arranca **una sola vez** al inicio.

## Secuencia de navegación (30s)

| # | Vista | Acción | Tiempo |
|---|-------|--------|--------|
| 1 | Inicio (hero) | Scroll suave arriba/abajo | 0–5s |
| 2 | Grupos | Nav → scroll | 5–9.5s |
| 3 | Cruces | Nav → scroll | 9.5–14s |
| 4 | Equipos | Nav → scroll | 14–18.5s |
| 5 | Calendario | Más → item → scroll | 18.5–22s |
| 6 | Estadios | Cerrar Más → Más → item | 22–25.5s |
| 7 | Entrenadores | Cerrar Más → Más → item | 25.5–28.5s |
| — | Cierre | Volver a Inicio | 28.5–30s |

## Shadow DOM y selectores

La app usa Lit con Shadow DOM abierto. Playwright cruza shadow roots
automáticamente, así que los selectores CSS funcionan directamente:

```js
// Bottom nav buttons
page.locator('.bottom-nav-btn').filter({ hasText: 'Grupos' })

// More overlay items
page.locator('.more-overlay-item').filter({ hasText: 'Calendario' })

// Backdrop para cerrar overlays
page.locator('.more-overlay-backdrop.open')
```

## Patrones reutilizables

### Smooth scroll

```js
async function smoothScroll(pixels, ms) {
  const steps = Math.max(6, Math.min(20, Math.floor(ms / 60)));
  const delay = ms / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, pixels / steps);
    await sleep(delay);
  }
}
```

### Tap nav button

```js
async function tapNav(label) {
  await page.locator('.bottom-nav-btn').filter({ hasText: label }).click();
  await sleep(900);
}
```

### Tap More menu item

```js
async function tapMoreItem(label) {
  await page.locator('.bottom-nav-btn').filter({ hasText: 'Más' }).click();
  await sleep(400);
  await page.locator('.more-overlay-item').filter({ hasText: label }).click();
  await sleep(900);
}
```

### Screenshot de una vista

```js
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await tapNav('Grupos');
await sleep(2000);
await page.screenshot({ path: 'recordings/grupos.png', fullPage: true });
```

### Grabar video personalizado

```js
const ctx = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 2,
  recordVideo: { dir: 'recordings', size: { width: 1080, height: 1920 } },
});
const page = await ctx.newPage();
await page.goto('http://localhost:5173');
// ... interacciones ...
const rawPath = await page.video().path();
```

## Dependencias

- `playwright` — ya instalado en devDependencies
- `ffmpeg` — necesario para conversión WebM → MP4 H.264
  - Windows: `winget install ffmpeg` o descargar de ffmpeg.org
  - Verificar: `ffmpeg -version`

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/record-video.mjs` | Grabación individual por plataforma |
| `scripts/record-video-all.mjs` | Grabación masiva (todas las plataformas) |
| `recordings/` | Output de videos y screenshots |

## Notas

- El servidor dev se mata automáticamente al finalizar (incluso con error)
- Los videos raw WebM se eliminan tras la conversión exitosa
- Para debug, cambiar `headless: true` → `headless: false` en el script
- La vista "Dónde ver" (broadcasting) no tiene tab de navegación y no se incluye
