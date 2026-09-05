---
name: coach-photos
description: >
  Descarga y completa fotos de directores técnicos de la Champions League 2026/27.
  Úsala cuando el usuario pregunte por: foto del entrenador faltante,
  avatar del DT de un club, coach photo missing, technical director photo,
  public/coaches/, entrenadores sin foto.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: coach-photos (Champions League 2026/27)

Descarga la foto del director técnico de uno o varios clubes de Champions League desde la web
oficial de **UEFA.com** y regenera el manifiesto `coach-photos.ts` para reflejar el cambio en `<squads-view>`.

## Flujo de trabajo

### 1. Ver qué falta (siempre empieza aquí)

```bash
npm run ucl:report
```

Genera y actualiza `docs/missing-assets.md`. Localiza la columna de entrenadores (DT)
y muestra al usuario los clubes sin foto local.

### 2. Descargar foto del entrenador

```bash
# Descargar fotos de un club (incluye DT):
npm run ucl:photos -- RMA

# Varios clubes a la vez:
npm run ucl:photos -- BAR MCI PSG BAY

# Re-descargar forzando actualización:
node scripts/fetch-ucl-squads.mjs RMA --photos --force
```

Tras la descarga el script regenera automáticamente `src/data/coach-photos.ts`
y guarda la imagen en `public/coaches/{CLUB}.webp`.

### 3. Validar y construir

```bash
npm run build
```

El build incluye `tsc` estricto. Reportar el resultado al usuario.

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `scripts/fetch-ucl-squads.mjs` | Script principal de descarga |
| `src/data/coach-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/data/coaches/index.ts` | Registro central `COACHES` con bio y nacionalidad |
| `src/lib/coach-photo.ts` | Helpers `hasCoachPhoto`, `coachPhotoSrc` |
| `public/coaches/{CLUB}.webp` | Fotos de entrenadores descargadas y optimizadas |
| `docs/missing-assets.md` | Reporte de huecos (regenerar con `npm run ucl:report`) |

---

## Notas

- El avatar del entrenador usa cascada en render:
  **foto local (`public/coaches/{CLUB}.webp`) → `coach.photoUrl` remoto → iniciales**.
- Tras la descarga, el manifiesto se regenera solo; no editar
  `src/data/coach-photos.ts` a mano.