---
name: x-post
description: >
  Genera el contenido para un post en X (Twitter): una imagen optimizada de una
  vista de la app del Mundial 2026 más el texto del tweet con hashtags. Úsala
  cuando el usuario pida: crear un post en X, post para Twitter, publicar en X,
  imagen para un tweet, contenido para X, tweet de una sección de la app.
---

# Skill: x-post

Genera el material para publicar un post en **X (Twitter)** sobre una vista
concreta de la web: una **imagen optimizada** (16:9 o 1:1) más un **texto de
tweet** de ≤280 caracteres con hashtags. La publicación es **manual** — el script
no usa la API de X.

## Flujo de trabajo

### 1. Ver qué vistas hay disponibles

```bash
npm run x:post list
```

Vistas: `hero`, `groups`, `knockout`, `squads`, `calendar`, `stadiums`,
`coaches`, `guide`, `league` (aceptan alias en español: `grupos`, `cruces`,
`equipos`, `estadios`, etc.).

### 2. Generar el post

```bash
# Post de estadios, imagen 16:9
npm run x:post -- estadios --ratio 16:9

# Post del bracket con texto encima, en inglés, imagen cuadrada
npm run x:post -- knockout --text "Predice al campeón" --ratio 1:1 --lang en
```

**Argumentos:**

| Argumento | Valores | Por defecto | Descripción |
|-----------|---------|-------------|-------------|
| `<vista>` | clave de vista | — (obligatorio) | Qué vista capturar |
| `--text` | texto libre | (ninguno) | Texto quemado sobre la imagen (banner Panini) |
| `--ratio` | `16:9` \| `1:1` | `16:9` | Proporción de la imagen |
| `--lang` | `es` \| `en` | `es` | Idioma de la app |
| `--theme` | `light` \| `dark` | `light` | Tema visual |

### 3. Resultado

El script genera en `marketing/x/`:

- `x-<vista>.png` — la imagen (1600×900 para 16:9, o 1080×1080 para 1:1).
- `x-<vista>.txt` — el texto del tweet (≤280 chars) con la URL de la app y hashtags.

Para publicar: copia el contenido del `.txt` y adjunta el `.png` al componer el
post en X.

## Cómo funciona

- Captura la vista indicada navegando con Playwright (despachando el evento
  `navigate` de la app, idioma-agnóstico).
- Si se pasa `--text`, inyecta el mismo banner Panini que la skill `instagram-reel`
  (tipografía Bowlby One, naranja retro, sombra dura) — queda quemado en la imagen.
- `sharp` recorta a las dimensiones exactas del ratio elegido.
- El texto del tweet se recorta de forma segura a 280 caracteres conservando
  palabras completas.

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-x-post.mjs` | Script principal |
| `scripts/lib/recording-utils.mjs` | Helpers compartidos (navegación, overlay de texto) |
| `marketing/x/` | Carpeta de salida |

## Notas

- No requiere `ffmpeg` (solo genera imagen, no video).
- El script arranca y detiene su propio servidor dev automáticamente.
- X admite hasta 4 imágenes por post; este script genera 1. Ejecuta el comando
  varias veces con distintas vistas si quieres un carrusel.
- La URL de la app en el tweet (`APP_URL`) está en `scripts/generate-x-post.mjs`;
  ajústala si la web cambia de dominio.
