# Football Assets Skill

Este skill permite descargar y gestionar fotos de jugadores, entrenadores y escudos de equipos para el Mundial 2026.

## Cuándo usar este skill

- "Descarga la foto de [Jugador/Entrenador]"
- "Actualiza las fotos de la selección de [País]"
- "Busca fotos de entrenadores que faltan"
- "Fuerza la actualización de fotos de [Equipo]"

## Uso

### Comando del Script

```bash
node scripts/fetch-player-photos.mjs [equipo] [opciones]
```

### Opciones

- `[equipo]`: Código FIFA del equipo (ESP, MEX, BRA, etc.). Si se omite, procesa todos.
- `--type [player|coach|logo]`: Tipo de activo a descargar (por defecto `player`).
- `--force`: Sobrescribe los archivos existentes.
- `--source [thesportsdb|transfermarkt|fifa]`: Prioriza una fuente específica (en desarrollo).

### Ejemplos

```bash
# Descargar fotos de jugadores de España (solo las que faltan)
node scripts/fetch-player-photos.mjs ESP

# Actualizar fotos de jugadores de México (sobrescribiendo)
node scripts/fetch-player-photos.mjs MEX --force

# Descargar fotos de entrenadores (si están configurados)
node scripts/fetch-player-photos.mjs --type coach
```

## Lógica de Fallback

Si una API falla o no encuentra el resultado exacto, el agente debe:
1.  Intentar una búsqueda manual usando el `browser_subagent`.
2.  Navegar a sitios como Transfermarkt o FIFA.com.
3.  Localizar la imagen de perfil oficial.
4.  Descargar la imagen y procesarla con el script o herramientas locales.

## Estructura de Directorios

- Jugadores: `public/players/[TEAM]/[NUMBER].webp`
- Entrenadores: `public/coaches/[TEAM].webp`
- Logos: `public/assets/flags/` (SVG preferido)
