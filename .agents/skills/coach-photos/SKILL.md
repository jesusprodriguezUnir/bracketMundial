---
name: coach-photos
description: >
  Descarga y completa fotos de entrenadores del Mundial 2026.
  Úsala cuando el usuario pregunte por: foto del entrenador faltante,
  avatar del DT de un equipo, coach photo missing, technical director photo,
  public/coaches/, entrenadores sin foto.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: coach-photos

Descarga la foto del entrenador de uno o varios equipos y regenera el
manifiesto `coach-photos.ts` para reflejar el cambio en `<squads-view>`.

## Flujo de trabajo

### 1. Ver qué falta (siempre empieza aquí)

```bash
npm run assets:report
```

Genera/actualiza `docs/missing-assets.md`. Localiza la sección de entrenadores
y muestra al usuario los equipos sin foto local.

Faltantes conocidos al inicio del proyecto: **CPV, HAI, KSA**.

### 2. Descargar foto del entrenador

```bash
# Un equipo:
npm run photos -- CPV --type coach

# Varios a la vez:
npm run photos -- CPV HAI KSA --type coach

# Re-descargar aunque ya exista:
npm run photos -- CPV --type coach --force
```

Tras la descarga el script regenera automáticamente `src/data/coach-photos.ts`
y guarda la imagen en `public/coaches/{TEAM}.webp`.

### 3. Validar y construir

```bash
npm run build
```

El build incluye `tsc` estricto. Reportar el resultado al usuario.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/fetch-squad-assets.mjs` | Script principal de descarga |
| `src/data/coach-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/lib/coach-photo.ts` | Helpers `hasCoachPhoto`, `coachPhotoSrc` |
| `public/coaches/{TEAM}.webp` | Fotos de entrenadores descargadas |
| `docs/missing-assets.md` | Reporte de huecos (regenerar con `--report`) |

---

## Configuración de API keys (.env)

El script funciona sin keys, pero con keys mejora la cobertura especialmente
para selecciones menores y entrenadores poco conocidos:

```env
API_FOOTBALL_KEY=tu_rapidapi_key_aqui       # https://rapidapi.com/api-sports/api/api-football
FOOTBALL_DATA_KEY=tu_football_data_key_aqui # https://www.football-data.org/client/register
```

---

## Notas

- Esta skill cubre **solo entrenadores** (`--type coach`). Para jugadores usa
  `/player-photos`. Para descargar ambos a la vez usa `/fetch-squads`.
- El avatar del entrenador usa cascada en render:
  **foto local → `coach.photoUrl` remoto → iniciales**. Una foto en
  `public/coaches/{TEAM}.webp` siempre tiene prioridad.
- Tras la descarga, el manifiesto se regenera solo; no editar
  `src/data/coach-photos.ts` a mano.