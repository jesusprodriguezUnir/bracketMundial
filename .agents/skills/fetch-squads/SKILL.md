---
name: fetch-squads
description: >
  Descarga jugadores Y entrenadores a la vez en bracketMundial para los 36 clubes
  de la Champions League 2026/27 desde la web oficial de UEFA.com.
  Úsala cuando el usuario quiera completar AMBOS tipos de fotos de un equipo en un
  solo paso, o hacer una pasada masiva de varios clubes. Para solo jugadores usa
  /player-photos; para solo entrenadores usa /coach-photos.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: fetch-squads (Champions League 2026/27)

Automatiza la descarga y sincronización de fotos de jugadores y entrenadores de los
**36 clubes de la fase liga de la Champions League 2026/27** desde la fuente oficial de **UEFA.com**,
generando informes de activos faltantes y actualizando los manifiestos de la aplicación.

## Flujo de trabajo

### 1. Ver qué falta (siempre empieza aquí)

```bash
npm run ucl:report
# o: npm run assets:report
```

Esto genera y actualiza `docs/missing-assets.md` con la lista completa de fotos faltantes
agrupadas por club de los 36 participantes, sin descargar nada.

Muestra al usuario un resumen de los clubes con más huecos para decidir por cuál empezar.

### 2. Descargar fotos de un club

```bash
# Jugadores + entrenador de un club desde UEFA.com:
npm run ucl:photos -- RMA

# Varios clubes a la vez:
npm run ucl:photos -- BAR MCI PSG BAY

# Re-descargar y forzar optimización:
node scripts/fetch-ucl-squads.mjs RMA --photos --force
```

Tras la descarga el script regenera automáticamente:
- `src/data/player-photos.ts`
- `src/data/coach-photos.ts`

### 3. Actualizar datos de plantilla (.ts) si hubo fichajes o cambios

```bash
# Actualizar datos de plantilla desde UEFA.com:
npm run ucl:data -- RMA
```

Actualiza `src/data/squads/{club}.ts`, `src/data/squads/index.ts` y `src/data/coaches/index.ts`.

### 4. Confirmar y construir

```bash
npm run build
```

El build incluye `tsc` estricto; valida que los manifiestos y tipos compilen sin errores.

---

## Fuente Oficial y CDN

- **Fuente Primaria**: Web oficial de UEFA Champions League (`https://www.uefa.com/uefachampionsleague/clubs/{ID}--{SLUG}/squad/`)
- **Fotos Jugadores**: CDN Oficial de UEFA (`https://img.uefa.com/imgml/TP/players/1/2027/324x324/{id}.jpg`)
- **Fotos Entrenadores**: CDN Oficial de UEFA (`https://img.uefa.com/imgml/TP/players/1/2027/324x324/{coachId}.jpg`)
- **Escudos**: CDN Oficial de UEFA (`https://img.uefa.com/imgml/TP/teams/logos/240x240/{teamId}.png`)
- **Optimización Local**: Sharp procesa a WebP (300px ancho, calidad 80).

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `scripts/fetch-ucl-squads.mjs` | Script principal de ingesta, fotos y escudos |
| `src/data/player-photos.ts` | Manifiesto autogenerado de fotos de jugador |
| `src/data/coach-photos.ts` | Manifiesto autogenerado de fotos de entrenador |
| `src/lib/player-photo.ts` | Helper `hasPlayerPhoto`, `playerPhotoSrc` |
| `src/lib/coach-photo.ts` | Helper `hasCoachPhoto`, `coachPhotoSrc` |
| `docs/missing-assets.md` | Lista de fotos faltantes (regenerar con `npm run ucl:report`) |
| `public/players/{CLUB}/{n}.webp` | Fotos de jugadores optimizadas |
| `public/coaches/{CLUB}.webp` | Fotos de entrenadores |