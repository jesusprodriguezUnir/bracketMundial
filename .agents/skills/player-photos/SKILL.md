---
name: player-photos
description: >
  Descarga y completa fotos de jugadores de la Champions League 2026/27.
  Úsala cuando el usuario pregunte por: fotos de jugadores faltantes,
  completar avatares de un club, huecos de jugadores en squads-view,
  player photos missing, fill player avatars.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: player-photos (Champions League 2026/27)

Descarga fotos de jugadores por club desde la fuente oficial de **UEFA.com** y regenera el
manifiesto `player-photos.ts` para reflejar los cambios en `<squads-view>`.

## Flujo de trabajo

### 1. Ver qué falta (siempre empieza aquí)

```bash
npm run ucl:report
```

Genera/actualiza `docs/missing-assets.md`. Muestra al usuario los clubes con
más fotos de jugadores faltantes y pregunta por cuál empezar.

### 2. Descargar fotos de jugadores

```bash
# Un club:
npm run ucl:photos -- RMA

# Varios a la vez:
npm run ucl:photos -- BAR MCI BAY PSG

# Forzar re-descarga y re-optimización:
node scripts/fetch-ucl-squads.mjs RMA --photos --force
```

Tras la descarga el script regenera automáticamente `src/data/player-photos.ts`.

### 3. Validar y construir

```bash
npm run build
```

El build incluye `tsc` estricto. Si el manifiesto no tiene el formato correcto
fallará. Reportar el resultado al usuario.

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `scripts/fetch-ucl-squads.mjs` | Script principal de descarga |
| `src/data/player-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/lib/player-photo.ts` | Helpers `hasPlayerPhoto`, `playerPhotoSrc` |
| `public/players/{CLUB}/{n}.webp` | Fotos descargadas y optimizadas |
| `docs/missing-assets.md` | Reporte de huecos (regenerar con `npm run ucl:report`) |

---

## Fuente Oficial y Calidad

- Las fotos se descargan directamente desde el CDN oficial de UEFA (`https://img.uefa.com/imgml/TP/players/1/2027/324x324/{id}.jpg`).
- Se optimizan con Sharp a formato WebP (300px ancho, calidad 80).
- Si un jugador carece de foto oficial en UEFA, el componente muestra automáticamente sus iniciales de forma retro Panini.