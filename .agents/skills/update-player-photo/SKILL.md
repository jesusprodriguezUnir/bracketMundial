---
name: update-player-photo
description: >
  Actualiza la foto de un solo jugador de un club de Champions League 2026/27 desde UEFA.com.
  Úsala cuando el usuario pregunte por: actualizar foto de un jugador,
  cambiar avatar de un jugador específico, re-descargar foto de un jugador,
  foto incorrecta de un jugador, update single player photo, fix player avatar.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: update-player-photo (Champions League 2026/27)

Actualiza la foto de **un solo jugador** descargándola desde la referencia oficial de **UEFA.com**
y regenera el manifiesto `player-photos.ts`.

## Cuándo usar esta skill

- El usuario dice que la foto de un jugador es incorrecta, está desactualizada o pixelada.
- Se necesita re-descargar la foto de un jugador concreto sin re-descargar todo el equipo.
- Se acaba de cambiar el dorsal de un jugador en la plantilla y la foto no coincide.

Para descargar todas las fotos de un equipo completo usa `/player-photos` o `/ucl-squads`.

---

## Flujo de trabajo

### 1. Identificar al jugador

Busca en el archivo de squad del club (`src/data/squads/{club}.ts`) para confirmar el **código de club** y el **dorsal**:

```bash
# Ejemplo: buscar a Vinícius en el Real Madrid
grep -i "vinícius" src/data/squads/rma.ts
# → { number: 7, name: 'Vinícius Júnior', ... }
```

El club es `RMA` y el dorsal es `7`.

### 2. Descargar la foto del jugador

```bash
node scripts/fetch-ucl-squads.mjs RMA --photos --player 7 --force
```

> **`--force`** asegura que si ya existía una foto anterior en `public/players/RMA/7.webp`, se sobrescribe con la versión fresca de UEFA.

El script:
1. Consulta la plantilla oficial del club en UEFA.com.
2. Encuentra al jugador con dorsal `#7`.
3. Descarga su imagen oficial desde el CDN de UEFA en 324x324.
4. La procesa y optimiza con Sharp a WebP (300px, 80% calidad).
5. La guarda en `public/players/RMA/7.webp`.
6. Regenera automáticamente `src/data/player-photos.ts`.

### 3. Verificar resultado

```bash
# Comprobar que el archivo existe:
ls public/players/RMA/7.webp

# Confirmar en el manifiesto:
grep "RMA-7" src/data/player-photos.ts
```

### 4. Validar y construir

```bash
npm run build
```

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `scripts/fetch-ucl-squads.mjs` | Script principal con soporte `--player <n>` |
| `src/data/player-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/lib/player-photo.ts` | Helpers de resolución de imagen |
| `public/players/{CLUB}/{n}.webp` | Foto del jugador optimizada |
| `src/data/squads/{club}.ts` | Ficha técnica del club y jugadores |
