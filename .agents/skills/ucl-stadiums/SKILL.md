---
name: ucl-stadiums
description: >
  Obtiene, reporta y gestiona los estadios oficiales y capacidades de todos los
  clubes de la UEFA Champions League 2026/27. Permite auditar capacidades, consultar
  aforos por club o país y exportar listados a JSON y Markdown.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: ucl-stadiums (Estadios y Capacidades de Clubes UCL)

Esta habilidad automatiza la consulta, auditoría y extracción de los estadios oficiales de los **36 clubes de la fase liga de la UEFA Champions League 2026/27**, incluyendo su nombre oficial, aforo o capacidad exacta de espectadores, ciudad y país.

## Cuándo usar esta habilidad

- Cuando el usuario pregunte:
  - "Obtener todos los estadios de los equipos"
  - "Cuál es la capacidad de cada estadio"
  - "Cuál es el estadio más grande de la Champions"
  - "Aforo del estadio del Real Madrid / Barcelona / Bayern / Dortmund..."
  - "Listar o exportar estadios de los clubes"
- Para auditar y reportar los estadios y capacidades en `docs/ucl-stadiums-report.md`.
- Para generar o refrescar `src/data/ucl-stadiums.json`.

## Datos Disponibles por Estadio

Cada registro incluye:
- `clubId`: Código UEFA de tres letras (ej: `RMA`, `BAR`, `BVB`, `BAY`, `MCI`).
- `clubName`: Nombre completo oficial del club.
- `stadiumName`: Nombre oficial del estadio (ej: `Santiago Bernabéu`, `Signal Iduna Park`, `Allianz Arena`).
- `capacity`: Aforo total de espectadores (número entero).
- `city`: Ciudad de la sede.
- `country`: País del club.

## Comandos Disponibles

### 1. Generar Reporte de Capacidades y Estadios

```bash
# Con script dedicado:
npm run ucl:stadiums:report

# O con node directamente:
node scripts/fetch-ucl-stadiums.mjs --report
```
Genera la tabla comparativa ordenada por capacidad en `docs/ucl-stadiums-report.md` y por consola.

### 2. Exportar Datos a JSON

```bash
# Exporta a src/data/ucl-stadiums.json:
npm run ucl:stadiums

# O con flag explícita:
node scripts/fetch-ucl-stadiums.mjs --json
```

### 3. Consultar Estadios de Clubes Específicos

```bash
# Filtrar uno o más clubes:
node scripts/fetch-ucl-stadiums.mjs RMA BAR MCI BAY
```

## Integración en Código

Los datos están tipados y accesibles tanto en backend como frontend mediante:
- `src/lib/stadium-service.ts`: Métodos `getAllTeamStadiums()`, `getStadiumStats()` y ordenamiento por aforo.
- `src/data/ucl-clubs.ts`: Ficha completa `club.stadium.name` y `club.stadium.capacity`.
- `src/data/ucl-stadiums.json`: Archivo JSON plano para integraciones externas.
