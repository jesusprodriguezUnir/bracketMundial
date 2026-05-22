---
name: google-play-assets
description: >
  Genera todos los recursos gráficos que pide la ficha de Google Play Store para
  la app del Mundial 2026: capturas de teléfono y tablet, video promocional,
  feature graphic e icono. Úsala cuando el usuario pida: publicar la app en
  Google, assets para Play Store, capturas para la tienda, screenshots de la app,
  feature graphic, recursos gráficos de Google Play, preparar la ficha de la app.
---

# Skill: google-play-assets

Genera **todos los assets gráficos** que exige la ficha de **Google Play Store**
para `Bracket Mundial 2026`, capturando la app real con Playwright y procesando
las imágenes con `sharp` para garantizar las dimensiones exactas.

## Qué pide Google Play (y qué genera el script)

| Asset | Requisito de Play | Genera |
|-------|-------------------|--------|
| Capturas de teléfono | 2–8 imágenes, lado 320–3840 px | 6 PNG 1080×1920 |
| Capturas de tablet 7" | recomendado para ficha de tablet | 6 PNG 1200×1920 |
| Capturas de tablet 10" | recomendado para ficha de tablet | 6 PNG 1600×2560 |
| Video promocional | enlace de YouTube (Play no aloja MP4) | MP4 1920×1080 ~30 s |
| Feature graphic | 1024×500 px, obligatorio | 1 PNG 1024×500 |
| Icono | 512×512 px, 32-bit PNG | 1 PNG 512×512 |

## Flujo de trabajo

### 1. Generar todos los assets

```bash
npm run play:assets
```

Genera todo en `marketing/google-play/`:

```text
marketing/google-play/
├── phone/        01_hero.png … 06_stadiums.png   (1080×1920)
├── tablet-7/     01_hero.png … 06_stadiums.png   (1200×1920)
├── tablet-10/    01_hero.png … 06_stadiums.png   (1600×2560)
├── promo/        promo-1080p.mp4                 (1920×1080)
├── feature-graphic.png                           (1024×500)
└── icon-512.png                                  (512×512)
```

### 2. Generar solo un tipo de asset

```bash
npm run play:assets -- --only phone     # solo capturas de teléfono
npm run play:assets -- --only tablet    # solo capturas de tablet (7" y 10")
npm run play:assets -- --only promo     # solo el video promocional
npm run play:assets -- --only graphic   # solo el feature graphic
npm run play:assets -- --only icon      # solo el icono 512×512
```

### 3. Idioma de las capturas

```bash
npm run play:assets -- --lang en        # capturas con la app en inglés
```

Por defecto las capturas se hacen en español (`--lang es`).

## Vistas capturadas

Cada captura recorre estas 6 vistas (en este orden): `hero`, `groups`,
`knockout`, `squads`, `calendar`, `stadiums`. Son las más representativas del
producto para la ficha de la tienda.

## Subir a Google Play

1. **Play Console → Crecimiento → Presencia en Play Store → Ficha de Store
   principal**.
2. Sube las **capturas de teléfono** (mínimo 2) y, en sus pestañas, las de
   **tablet 7"** y **tablet 10"**.
3. Sube el **feature graphic** (1024×500) y el **icono** (512×512).
4. El **video** no se sube directamente: súbelo a YouTube y pega el enlace en el
   campo "Video promocional" de la ficha.

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-play-assets.mjs` | Script principal |
| `scripts/lib/recording-utils.mjs` | Helpers compartidos (navegación, idioma) |
| `scripts/record-video.mjs` | Reutilizado para el video promocional 1080p |
| `public/icons/icon-512.png` | Fuente del icono 512×512 |
| `marketing/google-play/` | Carpeta de salida |

## Notas

- **Requiere `ffmpeg` en el PATH** (solo para el video promocional).
- El script arranca y detiene su propio servidor dev automáticamente.
- `sharp` fuerza las dimensiones exactas; Play rechaza imágenes fuera de rango.
- El proyecto ya tiene soporte Capacitor (`npm run android`) para construir el
  APK/AAB; esta skill solo cubre los **recursos gráficos de la ficha**, no el build.
- El feature graphic se renderiza con una plantilla HTML estilo Panini; ajusta
  el claim editando `CLAIM` en `scripts/generate-play-assets.mjs` si hace falta.
