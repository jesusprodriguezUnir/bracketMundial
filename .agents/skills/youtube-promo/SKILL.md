---
name: youtube-promo
description: >
  Genera kits de marketing multiplataforma (X, Instagram Reels, TikTok, Facebook y
  noticias in-app) a partir de cualquier video de YouTube (himnos oficiales, resúmenes
  de partidos, videos de clubes o estrellas de Champions League y Mundial). Úsala
  cuando el usuario pida: kit de marketing de un video, promocionar video de youtube,
  copy para redes de un partido o himno, generar noticias virales para la app.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: youtube-promo

Esta skill automatiza la recopilación de metadatos de cualquier video oficial de **YouTube** (vía oEmbed) y los combina con plantillas creativas para generar un kit promocional multicanal en español e inglés para **bracketmundial.com**.

El material generado cubre publicaciones para:
- **X (Twitter)**: Textos de alto impacto de ≤280 caracteres con enlaces y hashtags.
- **Instagram Reels & TikTok**: Guiones de video, hooks de entrada y copys de publicación.
- **Facebook & Newsletters**: Textos de formato largo con llamadas a la acción (CTA) y banners.
- **Lector de Noticias de la App**: Noticias interactivas inyectables con preguntas de predicción deportiva.

---

## Flujo de trabajo

### 1. Ejecución con cualquier video de YouTube

Pasa la URL de cualquier video de YouTube (himno oficial de la Champions League, resúmenes de UEFA, trailers o canciones del Mundial):

```bash
# Con el himno o video de la Champions League:
npm run youtube:promo -- https://www.youtube.com/watch?v=0hWqY_6q0-Y

# Con una canción oficial o video viral:
npm run youtube:promo -- https://www.youtube.com/watch?v=fcnDmrtj6Sk

# Solo en idioma español:
npm run youtube:promo -- https://www.youtube.com/watch?v=fcnDmrtj6Sk --lang es

# Generar el kit e inyectar noticias automáticamente en el feed de la app:
npm run youtube:promo -- https://www.youtube.com/watch?v=fcnDmrtj6Sk --write-news
```

---

## Parámetros soportados

| Argumento | Por defecto | Descripción |
|-----------|-------------|-------------|
| `--url` / primer argumento | URL oficial configurada | URL del video de YouTube a procesar |
| `--write-news` | `false` | Inyecta las noticias generadas en `news-feed.json` y `src/data/news/seed.ts` |
| `--lang` | `all` | Idioma de generación: `es`, `en` o `all` (ambos) |

---

## Resultados generados en `marketing/youtube-promo/`

Al ejecutar la skill se crean los siguientes archivos listos para usar:

| Archivo | Red social / Canal | Descripción |
|---------|---------------------|-------------|
| `promo-x-es.txt` / `promo-x-en.txt` | **X (Twitter)** | Copys optimizados ≤280 caracteres con ganchos, emojis, URLs y hashtags |
| `promo-instagram-es.txt` / `promo-instagram-en.txt` | **Instagram Reels & TikTok** | Idea visual de grabación, gancho de los primeros 3 segundos y copy para el post |
| `marketing-copy.md` | **Facebook / Newsletters / Web** | Textos para publicaciones largas de Facebook, comunicados por email y banners |
| `news-inject-*.json` | **App News Feed** | Estructuras de noticias locales listas para integrar en el feed de la web |

---

## Estrategia de distribución por plataforma

1. **En TikTok e Instagram Reels**:
   - Usa la idea visual de `promo-instagram-es.txt`.
   - Si creas un video corto comentando el clip de YouTube, acompáñalo del copy sugerido en la descripción con la pregunta interactiva.
2. **En Facebook**:
   - Usa los textos de `marketing-copy.md`. Su tono explicativo y cercano fomenta comentarios y debates sobre quién ganará el torneo o el partido.
3. **En X (Twitter)**:
   - Publica directamente el texto de `promo-x-es.txt`. Puedes adjuntar el enlace al video de YouTube para que genere la tarjeta multimedia o una captura generada con `npm run x:post`.
4. **En la Aplicación Web (`--write-news`)**:
   - Si activas `--write-news`, los usuarios verán una tarjeta interactiva en la app invitándolos a predecir resultados relacionados con el contenido del video.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-youtube-promo.mjs` | Motor de consulta oEmbed y generador de copys |
| `news-feed.json` | Base de datos de noticias local de la app |
| `src/data/news/seed.ts` | Semilla estática de noticias para el bundle de producción |
| `marketing/youtube-promo/` | Carpeta de salida con todos los copys generados |
