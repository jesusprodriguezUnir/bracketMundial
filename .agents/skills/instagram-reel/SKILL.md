---
name: instagram-reel
description: >
  Graba un reel vertical (9:16) de una vista concreta de la app del Mundial 2026,
  con texto opcional incrustado en el video. Úsala cuando el usuario pida: grabar
  un reel, reel de instagram, video vertical de una vista, contenido para
  instagram, video para redes con texto encima, demo vertical de una sección.
---

# Skill: instagram-reel

Graba un **reel vertical 1080×1920 (9:16)** de **una opción/vista concreta** de la
web (no un recorrido de toda la app). Permite incrustar un texto destacado en el
video y genera un caption sugerido con hashtags listo para publicar.

## Flujo de trabajo

### 1. Ver qué vistas se pueden grabar

```bash
npm run reel list
```

Vistas disponibles: `hero`, `groups`, `knockout`, `squads`, `calendar`,
`stadiums`, `coaches`, `guide`, `league` (también aceptan alias en español:
`inicio`, `grupos`, `cruces`, `equipos`, `calendario`, `estadios`,
`entrenadores`, `guia`, `liga`).

### 2. Grabar el reel de una vista

```bash
# Reel de la fase de grupos con texto incrustado
npm run reel -- grupos --text "Sigue el Mundial 2026 en directo"

# Reel del bracket en inglés y tema oscuro
npm run reel -- knockout --lang en --theme dark --text "Predict the champion"

# Reel de estadios, duración personalizada (segundos)
npm run reel -- estadios --duration 25
```

**Argumentos:**

| Argumento | Valores | Por defecto | Descripción |
|-----------|---------|-------------|-------------|
| `<vista>` | clave de vista | — (obligatorio) | Qué vista grabar |
| `--text` | texto libre | (ninguno) | Texto quemado en el video (banner inferior) |
| `--lang` | `es` \| `en` | `es` | Idioma de la app |
| `--theme` | `light` \| `dark` | `light` | Tema visual |
| `--duration` | número | `20` | Duración aproximada en segundos |

### 3. Resultado

El script genera en `recordings/`:

- `reel-<vista>-<lang>.mp4` — el video 1080×1920 listo para Instagram Reels.
- `reel-<vista>-<lang>.caption.txt` — caption sugerido + hashtags para pegar al publicar.

Muéstrale al usuario ambas rutas al terminar.

## Cómo funciona el texto incrustado

El texto del flag `--text` se inyecta como un banner fijo sobre la página
**antes** de grabar, con la tipografía Panini del proyecto (Bowlby One / Archivo
Black) y la paleta retro (naranja `--retro-orange`, sombra dura offset, borde
negro). Permanece visible durante toda la grabación, por lo que queda **quemado
en el MP4**. No se modifica nada del código de la app: la inyección es en runtime
vía Playwright.

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/record-reel.mjs` | Script principal del reel |
| `scripts/lib/recording-utils.mjs` | Helpers compartidos (navegación, ffmpeg, overlay de texto) |
| `recordings/` | Carpeta de salida (videos + captions) |

## Notas

- **Requiere `ffmpeg` en el PATH** del sistema (igual que `npm run video`).
  Convierte el WebM crudo de Playwright a MP4 H.264.
- El script arranca y detiene su propio servidor dev; no hace falta tener
  `npm run dev` corriendo aparte.
- Para grabar un recorrido de **varias** vistas (no una sola), usa `npm run video`
  (skill clásica de demo multi-vista).
- Instagram recomienda reels de 15–30 s; el valor por defecto de `--duration` es 20.
