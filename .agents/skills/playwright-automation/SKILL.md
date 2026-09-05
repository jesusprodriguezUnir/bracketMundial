---
name: playwright-automation
description: >
  Automatización de navegador con Playwright para grabar videos demo,
  tomar screenshots y ejecutar flujos interactivos en bracketMundial.
  Úsala cuando el usuario pida: automatizar navegador, grabar demo interactiva,
  playwright, capturar pantallas de la app, video de simulación o ligas.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: playwright-automation

Automatiza Chromium con Playwright para grabar videos demo de la app, tomar screenshots de alta resolución y ejecutar flujos de interacción para redes sociales y marketing.

---

## Comandos rápidos

```bash
# Listar plataformas de video soportadas
npm run video:list

# Grabar video para una plataforma (default: instagram, 30s)
npm run video                    # instagram 1080×1920
npm run video -- tiktok          # tiktok 1080×1920
npm run video -- facebook        # facebook 1080×1080
npm run video -- twitter         # twitter 1920×1080
npm run video -- tiktok 15       # duración personalizada (15s)

# Grabar para TODAS las plataformas en lote (un solo dev server)
npm run video:all
npm run video:all -- 15          # 15s por plataforma

# Videos de flujos especializados
npm run video:simulation         # Simulación de pronósticos y puntos (16:9)
npm run video:leagues            # Creación de mini-ligas privadas con música (9:16)
npm run record:session           # Grabación interactiva manual

# Captura de imágenes y reels individuales
npm run reel -- jornadas         # Reel 9:16 con banner Panini de la jornada
npm run x:post -- tabla          # Post para X con imagen 16:9 o 1:1
```

---

## Plataformas y formatos de video

| Plataforma | Resolución | Relación de aspecto | Formato | Redes de destino |
|------------|------------|---------------------|---------|------------------|
| `instagram` | 1080×1920 | 9:16 | MP4 H.264 | Instagram Reels, Stories |
| `tiktok` | 1080×1920 | 9:16 | MP4 H.264 | TikTok, YouTube Shorts |
| `facebook` | 1080×1080 | 1:1 | MP4 H.264 | Feed cuadrado de Facebook |
| `twitter` | 1920×1080 | 16:9 | MP4 H.264 | X (Twitter) Timeline |

Los videos finales se guardan en `recordings/demo-{platform}.mp4`.

---

## Arquitectura de grabación

### Grabación general (`scripts/record-video.mjs`)
1. Arranca `vite dev` en segundo plano y espera respuesta en `localhost:5173`.
2. Lanza Chromium headless configurando viewport, device scale factor y `recordVideo`.
3. Navega de forma limpia despachando eventos custom `navigate` en la app (agnóstico al idioma).
4. Aplica *smooth scroll* en cada sección para registrar movimiento fluido.
5. Cierra el contexto y convierte el stream crudo WebM a MP4 H.264 mediante `ffmpeg`.
6. Limpia archivos temporales y notifica la ruta final.

### Grabación masiva (`scripts/record-video-all.mjs`)
Itera sobre las 4 plataformas principales (`instagram`, `tiktok`, `facebook`, `twitter`) reutilizando una única instancia del servidor de desarrollo.

---

## Secuencia de navegación recomendada (30s)

| # | Sección | Evento | Acción en pantalla | Tiempo |
|---|---------|--------|---------------------|--------|
| 1 | Inicio (Hero) | `hero` | Cuenta atrás, banner del torneo y scroll suave | 0–5s |
| 2 | Clasificación (Tabla / Grupos) | `groups` | Recorrido por posiciones y puntos | 5–9.5s |
| 3 | Jornadas / Cruces | `matchday` / `knockout` | Vista de partidos, marcadores y predicciones | 9.5–14s |
| 4 | Plantillas | `squads` | Despliegue de fichas y cromos de jugadores | 14–18.5s |
| 5 | Calendario | `calendar` | Fixture ordenado cronológicamente | 18.5–22s |
| 6 | Ligas / Estadios | `league` / `stadiums` | Creación de porras sociales o sedes | 22–25.5s |
| 7 | Entrenadores | `coaches` | Perfiles tácticos de los DTs | 25.5–28.5s |
| — | Cierre | `hero` | Retorno suave a la portada | 28.5–30s |

---

## Shadow DOM y selectores clave

La app está construida con Lit y utiliza Shadow DOM abierto. Playwright atraviesa las shadow roots sin necesidad de configuración adicional:

```js
// Navegación vía evento custom (recomendado):
await page.evaluate((tab) => {
  const bracket = document.querySelector('app-root')
    ?.shadowRoot?.querySelector('bracket-view')
    ?? document.querySelector('bracket-view');
  const target = bracket?.shadowRoot?.querySelector('.view-container') ?? bracket;
  target?.dispatchEvent(new CustomEvent('navigate', { detail: tab, bubbles: true, composed: true }));
}, 'matchday');

// Botones de navegación inferior en móviles:
page.locator('.bottom-nav-btn').filter({ hasText: 'Jornadas' });

// Botones de modo de vista (Predicciones vs Resultados Reales):
page.locator('.view-mode-btn.real');
```

---

## Patrones reutilizables

### Smooth scroll fluido
```js
async function smoothScroll(page, pixels, ms) {
  const steps = Math.max(6, Math.min(20, Math.floor(ms / 60)));
  const delay = ms / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, pixels / steps);
    await sleep(delay);
  }
}
```

### Configuración de idioma y tema visual
```js
await page.evaluate(({ lang, theme }) => {
  localStorage.setItem('bm-locale', lang);
  localStorage.setItem('bm-theme', theme);
}, { lang: 'es', theme: 'dark' });
await page.reload({ waitUntil: 'networkidle' });
```

---

## Dependencias requeridas

- `playwright` (en devDependencies de `package.json`).
- `ffmpeg` en el `PATH` del sistema para transcodificación de video a MP4.
