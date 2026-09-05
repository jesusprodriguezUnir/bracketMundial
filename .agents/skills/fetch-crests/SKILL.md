---
name: fetch-crests
description: Descarga y gestiona los escudos oficiales de los 36 clubes de la UEFA Champions League 2026/27 desde UEFA.com.
---

# Skill: fetch-crests (Champions League 2026/27)

Esta skill permite descargar, actualizar y verificar los escudos oficiales en alta resolución (PNG transparente optimizado) de los **36 clubes de la UEFA Champions League 2026/27** directamente desde el CDN oficial de **UEFA.com**.

## Cuándo usar esta skill

- "Descarga el escudo de [Club]" (ej: Real Madrid, Barcelona, Man City)
- "Actualiza los logos/escudos de la Champions que faltan"
- "Obtén los logos oficiales de UEFA de los clubes"
- "Corrige o mejora la resolución del escudo de [Club]"

## Fuente Oficial

La fuente de verdad oficial del torneo es el portal y CDN de UEFA:
- **UEFA Champions League:** `https://www.uefa.com/uefachampionsleague/clubs/`
- **CDN de Logos:** `https://img.uefa.com/imgml/TP/teams/logos/240x240/{teamId}.png` (y `700x700`)

## Uso

### Comando del Script

```bash
# Con npm script dedicado:
npm run ucl:crests

# O mediante el script principal:
node scripts/fetch-ucl-squads.mjs [CLUB_CODES...] --crests [--force]
```

### Opciones

- `[CLUB_CODES...]`: Códigos de tres letras de los clubes (ej: `RMA BAR MCI BAY`). Si se omite, procesa los 36 clubes.
- `--force`: Invalida y reemplaza los escudos existentes en disco.

### Ejemplos

```bash
# Descargar/verificar el escudo del Real Madrid
node scripts/fetch-ucl-squads.mjs RMA --crests

# Forzar la actualización de los escudos de Barcelona y Bayern
node scripts/fetch-ucl-squads.mjs BAR BAY --crests --force

# Descargar y verificar los escudos de los 36 clubes de Champions
npm run ucl:crests
```

## Estructura de Salida

*   Los escudos se almacenan en: `public/assets/crests/{CLUB}.png`.
*   El nombre del archivo corresponde al código del club en mayúsculas (ej: `public/assets/crests/RMA.png`).
*   Los componentes visuales resuelven la ruta mediante `src/lib/team-assets.ts:crestSrc(teamId)`.
