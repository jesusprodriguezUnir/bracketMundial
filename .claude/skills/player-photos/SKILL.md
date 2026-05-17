---
name: player-photos
description: >
  Descarga y completa fotos de jugadores del Mundial 2026.
  Úsala cuando el usuario pregunte por: fotos de jugadores faltantes,
  completar avatares de un equipo, huecos de jugadores en squads-view,
  player photos missing, fill player avatars.
---

# Skill: player-photos

Descarga fotos de jugadores por equipo desde múltiples APIs y regenera el
manifiesto `player-photos.ts` para reflejar los cambios en `<squads-view>`.

## Flujo de trabajo

### 1. Ver qué falta (siempre empieza aquí)

```bash
npm run assets:report
```

Genera/actualiza `docs/missing-assets.md`. Muestra al usuario los equipos con
más fotos de jugadores faltantes y pregunta por cuál empezar.

Ejemplo de resumen útil:
> "Los equipos con más huecos de jugadores son JOR (20), HAI (12), CUW/EGY/IRQ (11).
> ¿Por cuál quieres empezar?"

### 2. Descargar fotos de jugadores

```bash
# Un equipo:
npm run photos -- JOR --type player

# Varios a la vez:
npm run photos -- JOR HAI CUW --type player

# Re-descargar aunque ya exista:
npm run photos -- JOR --type player --force
```

Tras la descarga el script regenera automáticamente `src/data/player-photos.ts`.

### 3. Verificar calidad de datos (opcional, requiere API key)

```bash
npm run photos -- ARG --verify-data
```

Genera `docs/data-discrepancies.md` con nombres que no coinciden bien con la
API. No modifica ningún archivo de squad; revisar manualmente antes de editar.

### 4. Validar y construir

```bash
npm run build
```

El build incluye `tsc` estricto. Si el manifiesto no tiene el formato correcto
fallará. Reportar el resultado al usuario.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/fetch-squad-assets.mjs` | Script principal de descarga |
| `src/data/player-photos.ts` | Manifiesto autogenerado (no editar a mano) |
| `src/lib/player-photo.ts` | Helpers `hasPlayerPhoto`, `playerPhotoSrc` |
| `public/players/{TEAM}/{n}.webp` | Fotos descargadas |
| `docs/missing-assets.md` | Reporte de huecos (regenerar con `--report`) |
| `docs/data-discrepancies.md` | Discrepancias de nombres (`--verify-data`) |

---

## Configuración de API keys (.env)

El script funciona sin keys (TheSportsDB + Wikipedia como fallback), pero con
keys la cobertura mejora para selecciones menores:

```env
API_FOOTBALL_KEY=tu_rapidapi_key_aqui       # https://rapidapi.com/api-sports/api/api-football
FOOTBALL_DATA_KEY=tu_football_data_key_aqui # https://www.football-data.org/client/register
```

**Límites API-Football free:** 100 req/día. Trabajar por equipos, no en masa.

---

## Notas

- Esta skill cubre **solo jugadores** (`--type player`). Para entrenadores usa
  `/coach-photos`. Para descargar ambos a la vez usa `/fetch-squads`.
- Los jugadores sin foto en el manifiesto muestran iniciales directamente en
  `<squads-view>`.
- Tras la descarga, el manifiesto se regenera solo; no editar
  `src/data/player-photos.ts` a mano.
