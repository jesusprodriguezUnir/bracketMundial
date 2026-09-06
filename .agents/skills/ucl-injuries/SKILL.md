---
name: ucl-injuries
description: >
  Obtiene y actualiza el estado de los jugadores de la UEFA Champions League 2026/27:
  bajas confirmadas por lesión, dudas médicas, sancionados y noticias de última hora
  desde el ecosistema de Predicted11 / FútbolFantasy, reflejando sus símbolos en la app.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: ucl-injuries (Lesionados, Sancionados y Noticias UCL)

Esta habilidad automatiza la sincronización del estado físico y disciplinario de los jugadores de los 36 clubes de la UEFA Champions League 2026/27. Permite identificar de inmediato quién está lesionado, sancionado o en duda para colocar el correspondiente distintivo visual en la interfaz de usuario.

## Cuándo usar esta habilidad

- Semanalmente antes de cada jornada para saber qué jugadores están disponibles y cuáles son baja.
- Cuando el usuario pregunte por: "lesionados", "sancionados", "quién está lesionado", "quién no puede jugar", "partes médicos", "poner el simbolito a los jugadores", "noticias de lesionados".
- Para actualizar el feed de noticias médicas y enlaces a artículos oficiales.

## Simbología en la Aplicación

| Símbolo | Estado | Significado | Color UI |
|---|---|---|---|
| 🚑 | `injured` | **Baja confirmada**: lesión médica con diagnóstico (ej. rotura, esguince). | Rojo suave (`--retro-red`) |
| ⚠️ | `doubt` | **Duda médica**: molestias físicas, prueba antes del partido. | Ámbar (`#d97706`) |
| 🟥 | `suspended` | **Sancionado**: sanción disciplinaria por expulsión o ciclo de amarillas. | Rojo oscuro (`#b91c1c`) |
| 🟢 | `available` | **Alta médica / Disponible**: recuperación reciente. | Verde suave (`#16a34a`) |

## Comandos Disponibles

### 1. Ingestar y actualizar todos los partes médicos

```bash
# Descarga partes médicos, sanciones y genera src/data/player-status.json:
npm run ucl:injuries
```

### 2. Probar sin modificar archivos (Modo Simulación / Dry-Run)

```bash
node scripts/fetch-ucl-injuries.mjs --dry-run
```

### 3. Actualizar onces y partes médicos en un solo paso

```bash
npm run ucl:refresh
```

## Arquitectura y Archivos Involucrados

| Archivo | Propósito |
|---|---|
| `scripts/fetch-ucl-injuries.mjs` | Script de extracción de partes médicos y sanciones desde el ecosistema oficial |
| `src/data/player-status.ts` | Tipos TypeScript y funciones helper (`getPlayerCondition`, `STATUS_META`) |
| `src/data/player-status.json` | Almacén persistente de condiciones activas de jugadores con diagnósticos y fechas |
| `src/components/squads-view.ts` | Renderiza el distintivo y tooltip explicativo en la lista y vista móvil |
| `src/components/lineup-view.ts` | Renderiza la marca de alerta en el cromo del jugador en la cancha |
| `src/components/player-card.ts` | Muestra el reporte médico completo en el modal detallado del jugador |
| `src/components/player-hover-card.ts` | Muestra el estado físico en la tarjeta flotante hover |
