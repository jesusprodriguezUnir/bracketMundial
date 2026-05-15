# Plan SEO básico — Bracket Mundial 2026

## Objetivo
Implementar SEO técnico prioritario para mejorar indexación orgánica antes del torneo: Open Graph/Twitter, sitemap automático y schema.org.

## URL base
- https://bracketmundial.vercel.app/

## Alcance implementado

### 1) Meta tags SEO social y canónica
Archivo: `index.html`

- `meta description` optimizada
- `canonical`
- `hreflang` para `es` y `x-default`
- Open Graph: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:locale`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### 2) og:image estática
Archivo: `public/assets/og-image.svg`

- Tamaño 1200x630
- Diseño retro coherente con la app
- Uso en OG/Twitter como imagen de previsualización

### 3) Sitemap y robots generados automáticamente
Archivo: `scripts/generate-sitemap.mjs`

- Genera `public/sitemap.xml` en cada `npm run build`
- Genera `public/robots.txt` en cada `npm run build`
- Incluye URL raíz y `lastmod` con la fecha actual de ejecución

### 4) Datos estructurados schema.org
Archivo: `index.html`

Se incluye JSON-LD con:
- `SportsEvent`: Copa Mundial de la FIFA 2026
- `WebApplication`: Bracket Mundial 2026

## Verificación recomendada
1. `npm run build`
2. Revisar salida de `dist/` para `sitemap.xml` y `robots.txt`
3. Validar schema.org en https://validator.schema.org/
4. Validar sharing preview en Facebook/Twitter

## Siguiente mejora opcional
- Publicar también `og-image.png` para compatibilidad total con todos los scrapers sociales.
