---
name: youtube-promo
description: >
  Obtiene información de videos oficiales de YouTube del Mundial 2026 (por ejemplo,
  la canción oficial de Shakira y Burna Boy "Dai Dai") y genera un kit completo
  de marketing premium y noticias inyectables para promocionar bracketmundial.com.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: youtube-promo

Esta skill automatiza la recopilación de metadatos de videos de YouTube (usando oEmbed) y los combina con plantillas creativas para generar materiales promocionales multilingües (español e inglés) para **bracketmundial.com**, así como noticias inyectables en la aplicación.

## Flujo de trabajo

### 1. Ejecutar la skill

Puedes ejecutar la skill pasando la URL de cualquier video de YouTube (por defecto la oficial de Shakira y Burna Boy `https://www.youtube.com/watch?v=fcnDmrtj6Sk`):

```bash
npm run youtube:promo -- https://www.youtube.com/watch?v=fcnDmrtj6Sk
```

### 2. Parámetros soportados

| Argumento | Por defecto | Descripción |
|-----------|-------------|-------------|
| `--url` / primer argumento | `https://www.youtube.com/watch?v=fcnDmrtj6Sk` | La URL del video de YouTube a procesar. |
| `--write-news` | `false` | Inyecta las noticias de marketing generadas directamente en `news-feed.json` y `src/data/news/seed.ts` para las selecciones clave (COL, ARG, FRA, NOR). |
| `--lang` | `all` | Idioma de generación (`es`, `en`, o `all`). |

### 3. Resultados generados

La skill genera el kit de promoción en `marketing/youtube-promo/`:

- `promo-x-es.txt` / `promo-x-en.txt` — Copias optimizadas de gran impacto para X (Twitter) de ≤280 caracteres con hashtags y URLs cortas.
- `promo-instagram-es.txt` / `promo-instagram-en.txt` — Guion e idea visual para Instagram Reels y copy de publicación.
- `marketing-copy.md` — Copy de boletines/newsletters, CTA promocionales y banners web para `bracketmundial.com`.
- `news-inject-COL.json`, `news-inject-ARG.json`, etc. — Estructura JSON lista para ser inyectada en el lector de noticias de la app.

### 4. Inyección en el Feed de Noticias

Si usas el flag `--write-news`, la app en local/desarrollo mostrará inmediatamente noticias súper personalizadas e interactivas:
- **Colombia (COL):** Centrado en Shakira e invitando a predecir si el ritmo guiará a la selección al campeonato.
- **Argentina (ARG):** Centrado en el cameo de Lionel Messi en el videoclip y la defensa del título mundial.
- **Francia (FRA):** Centrado en el cameo de Kylian Mbappé y su búsqueda de revancha.
- **Noruega (NOR):** Centrado en Erling Haaland y el regreso de los vikingos a la gran cita.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-youtube-promo.mjs` | Script principal del motor de marketing |
| `news-feed.json` | Base de datos de noticias local de la app |
| `src/data/news/seed.ts` | Semilla de noticias estática para la compilación |
| `marketing/youtube-promo/` | Carpeta de salida con todos los copys de marketing |
