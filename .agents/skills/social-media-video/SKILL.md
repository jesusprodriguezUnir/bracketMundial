# Social Media Video Skill

Graba videos demos de la app para Instagram, TikTok, Facebook y Twitter/X usando Playwright y ffmpeg.

## Cuándo usar este skill

- "Graba un video demo de la app"
- "Crea un video para Instagram"
- "Genera video para TikTok"
- "Make a social media video"

## Uso

### Comando básico

```bash
node scripts/record-video.mjs [plataforma] [duracion]
```

### Plataformas disponibles

| Plataforma | Resolución | Formato |
|------------|------------|---------|
| `instagram` | 1080x1920 | 9:16 (Stories/Reels) |
| `tiktok` | 1080x1920 | 9:16 |
| `facebook` | 1080x1080 | 1:1 |
| `twitter` | 1920x1080 | 16:9 |

### Ejemplos

```bash
# Instagram (9:16), 15 segundos
node scripts/record-video.mjs instagram 15

# TikTok (9:16), 20 segundos
node scripts/record-video.mjs tiktok 20

# Twitter/X (16:9), 10 segundos
node scripts/record-video.mjs twitter 10

# Facebook (1:1), 12 segundos
node scripts/record-video.mjs facebook 12
```

## Requisitos

- Playwright instalado (`npm install -D playwright`)
- Chromium: `npx playwright install chromium`
- ffmpeg en PATH

## Output

Los videos finales en formato MP4 se guardan en:
- `recordings/demo-instagram.mp4`
- `recordings/demo-twitter.mp4`
- etc.

## Integración con el skill

Este skill permite:
1. Navegar automáticamente por las tabs de la app (`.phase-tab`)
2. Simular *smooth scrolling* en cada sección para grabar la UI en movimiento
3. Grabar de forma nativa la sesión completa con Playwright (formato original `.webm`)
4. Convertir y optimizar automáticamente el video a `.mp4` usando `ffmpeg` para que esté listo para publicar en la resolución de cada plataforma.