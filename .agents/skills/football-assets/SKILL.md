# Football Assets Skill (Champions League 2026/27)

Este skill permite descargar y gestionar fotos de jugadores, entrenadores y escudos para los 36 clubes de la UEFA Champions League 2026/27 desde la referencia oficial de **UEFA.com**.

## Cuándo usar este skill

- "Descarga la foto de [Jugador/Entrenador]"
- "Actualiza las fotos del club [Equipo]" (ej: Real Madrid, Barcelona, Man City)
- "Busca fotos de entrenadores que faltan"
- "Fuerza la actualización de fotos de [Club]"

## Uso

### Comando del Script

```bash
node scripts/fetch-ucl-squads.mjs [club] [opciones]
```

### Opciones

- `[club]`: Código del club (`RMA`, `BAR`, `MCI`, `BAY`, etc.). Si se omite, procesa los 36.
- `--photos`: Descarga y optimiza fotos de jugadores y entrenadores.
- `--crests`: Descarga los escudos oficiales en alta resolución.
- `--data`: Genera o actualiza el archivo de plantilla TypeScript (`src/data/squads/{club}.ts`).
- `--force`: Sobrescribe los archivos existentes.

### Ejemplos

```bash
# Descargar fotos y datos de Real Madrid
node scripts/fetch-ucl-squads.mjs RMA

# Actualizar fotos de Barcelona forzando sobreescritura
node scripts/fetch-ucl-squads.mjs BAR --photos --force

# Generar reporte de estado
npm run ucl:report
```

## Estructura de Directorios

- Jugadores: `public/players/{CLUB}/{NUMBER}.webp` (300px WebP)
- Entrenadores: `public/coaches/{CLUB}.webp` (300px WebP)
- Escudos: `public/assets/crests/{CLUB}.png` (PNG transparente)
- Manifiestos: `src/data/player-photos.ts` y `src/data/coach-photos.ts`
