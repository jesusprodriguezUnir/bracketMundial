---
name: ucl-lineups
description: >
  Obtiene y actualiza las alineaciones probables y onces titulares semanales de cada
  equipo de la UEFA Champions League 2026/27 desde la web de referencia Predicted11
  (https://www.predicted11.com/es/champions).
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: ucl-lineups (Alineaciones Probables Semanales UCL)

Esta habilidad automatiza la extracción semanal de los onces titulares (`startingXI`) y esquemas tácticos (`formation`) de los **36 clubes de la fase liga de la Champions League 2026/27**, tomando como fuente de verdad directa la web de pronósticos deportivos y onces probables **Predicted11**.

## Cuándo usar esta habilidad

- Al comenzar una nueva semana de Champions League para refrescar los 11 probables de los partidos de la jornada.
- Cuando el usuario pregunte por: "actualizar alineaciones", "alineaciones probables", "once probable", "quién juega de titular", "predicted11", "actualizar el once del Madrid/Barça/City".
- Antes de simulaciones de partidos de Champions para asegurar que las alineaciones reflejen la actualidad real.

## Comandos Disponibles

### 1. Actualizar la alineación de un club específico

```bash
# Actualizar el 11 titular de un equipo (ejemplo Real Madrid):
npm run ucl:lineups -- RMA

# Varios equipos a la vez:
npm run ucl:lineups -- RMA BAR ARS MCI
```

### 2. Probar sin modificar archivos (Modo Simulación / Dry-Run)

```bash
npm run ucl:lineups -- RMA --dry-run
```

Muestra en consola la formación táctica detectada en Predicted11, los 11 jugadores extraídos con sus coordenadas en la cancha y los dorsales mapeados con el archivo de plantilla local.

### 3. Actualizar todos los 36 clubes de Champions League

```bash
npm run ucl:lineups -- --all
```

## Arquitectura y Archivos Involucrados

| Archivo | Propósito |
|---|---|
| `scripts/fetch-predicted11-lineups.mjs` | Script Node.js que realiza scraping ético del campo interactivo de Predicted11 |
| `src/data/ucl-predicted11-map.ts` | Tabla de correspondencia entre códigos de 3 letras (`RMA`, `BAR`) y slugs de Predicted11 |
| `src/data/squads/{club}.ts` | Archivos de plantilla donde se actualiza el objeto `export const lineup: Lineup` |
| `src/components/lineup-view.ts` | Componente Lit que renderiza la formación en el césped interactivo |

## Formato del Objeto Actualizado

El script actualiza limpiamente en cada archivo `src/data/squads/{club}.ts`:

```typescript
export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 12, 4, 16, 17, 5, 8, 21, 7, 10, 9],
};
```
