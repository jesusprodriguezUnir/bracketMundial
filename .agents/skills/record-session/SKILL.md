---
name: record-session
description: >
  Graba interactivamente un recorrido por todas las pantallas de bracketMundial
  mientras navegas manualmente. Ideal para grabar demos, revisar flujo de la app
  o capturar el comportamiento visual en distintas vistas.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: record-session

Graba un video de tu sesión interactiva navegando por la app, más capturas de
pantalla automáticas cada vez que cambias de vista.

## Comando

```bash
npm run record:session
```

## Cómo funciona

1. **Arranca** `vite dev` en background
2. **Detecta** la resolución nativa de tu pantalla
3. **Abre Chromium visible** (no headless) en modo pantalla completa (F11),
   grabando a resolución nativa (p. ej. 1920×1080, 2560×1440, etc.)
4. **Espera** a que navegues libremente por la app
5. **Toma screenshots** automáticos cada vez que detecta un cambio de vista
   (Inicio → Grupos → Cruces → Equipos → Calendario → Estadios → Entrenadores)
6. Cuando **presionas Enter** en la terminal, detiene la grabación
7. **Convierte** el video WebM → MP4 H.264 con ffmpeg
8. **Limpia** el servidor dev y archivos temporales

## Output

| Archivo | Propósito |
|---------|-----------|
| `recordings/session-{ancho}x{alto}.mp4` | Video completo de la sesión (H.264) — resolución nativa |
| `recordings/session-screenshots/` | Capturas por cada vista visitada |

### Formato de screenshots

```
01_Inicio_1712345678901.png
02_Grupos_1712345678902.png
03_Cruces_1712345678903.png
...
final_session_end.png
```

## Flujo de uso típico

```bash
npm run record:session
# → Detecta resolución nativa
# → Se abre Chromium en pantalla completa (F11) con la app
# → Tú navegas: Inicio → Grupos → Cruces → Equipos → Más → Calendario → Estadios → Entrenadores
# → Presionas Enter en la terminal
# → Video guardado en recordings/session-1920x1080.mp4 (según tu resolución)
```

## Requisitos

- `playwright` — ya instalado en devDependencies
- Chromium: `npx playwright install chromium`
- `ffmpeg` en PATH para conversión WebM → MP4
  - Windows: `winget install ffmpeg` o descargar de ffmpeg.org
  - Verificar: `ffmpeg -version`

## Personalización

La resolución se detecta automáticamente. Si quieres forzar una resolución
específica, edita en `scripts/record-session.mjs`:

```js
const { width, height } = await detectScreenSize();
// Reemplaza con valores fijos, ej:
// const width = 1920;
// const height = 1080;
```

## Notas

- El servidor dev se mata automáticamente al finalizar (incluso con error)
- El video raw WebM se elimina tras la conversión exitosa a MP4
- Los screenshots se toman solo la primera vez que se detecta cada vista
  (no se duplican al regresar)
- Chromium se abre en modo pantalla completa (F11) para que puedas interactuar
  naturalmente sin distracciones
