---
name: fetch-squads
description: >
  Descarga jugadores Y entrenadores a la vez en bracketMundial.
  Úsala cuando el usuario quiera completar AMBOS tipos de fotos de un equipo en un
  solo paso, o hacer una pasada masiva de varios equipos. Para solo jugadores usa
  /player-photos; para solo entrenadores usa /coach-photos.
license: MIT
metadata:
  author: bracketMundial
  version: "1.0"
---

# Skill: fetch-squads

Automatiza la descarga de fotos de jugadores y entrenadores desde múltiples APIs,
y genera informes de lo que falta para pedirlo poco a poco.

## Flujo de trabajo

### 1. Ver qué falta (siempre empieza aquí)

```bash
npm run assets:report
# equivale a: node scripts/fetch-squad-assets.mjs --report
```

Esto genera/actualiza `docs/missing-assets.md` con la lista completa de fotos faltantes
agrupadas por equipo, sin descargar nada.

Muéstrale al usuario un resumen de los equipos con más huecos para que elija por dónde empezar.

### 2. Descargar fotos de un equipo

```bash
# Jugadores de un equipo:
npm run photos -- JOR
npm run photos -- JOR --type player    # explícito

# Entrenador de un equipo:
npm run photos -- CPV --type coach

# Jugadores + entrenador:
npm run photos -- HAI                  # --type all por defecto

# Varios equipos a la vez:
npm run photos -- JOR HAI CUW

# Re-descargar aunque ya exista:
npm run photos -- JOR --force
```

Tras la descarga el script regenera automáticamente:
- `src/data/player-photos.ts`
- `src/data/coach-photos.ts`

### 3. Verificar calidad de datos (opcional, requiere API key)

```bash
npm run photos -- ARG --verify-data
```

Genera `docs/data-discrepancies.md` con nombres de jugadores que no coinciden bien con
la API. **No modifica ningún archivo de squad**; revisa manualmente antes de editar.

### 4. Confirmar y construir

```bash
npm run build
```

El build incluye `tsc` estricto; si el manifiesto no tiene el formato correcto fallará.

---

## Configuración de API keys (.env)

El script funciona sin keys (TheSportsDB + Wikipedia como fallback), pero con keys
la cobertura mejora notablemente, especialmente para selecciones menores:

```env
# .env (en la raíz del proyecto — nunca commitear)
API_FOOTBALL_KEY=tu_rapidapi_key_aqui       # https://rapidapi.com/api-sports/api/api-football
FOOTBALL_DATA_KEY=tu_football_data_key_aqui # https://www.football-data.org/client/register
```

**Límites API-Football free:** 100 req/día. Usar por equipos, no para todos los 1172
jugadores de golpe (usa TeamFilter: `npm run photos -- JOR HAI`).

---

## Prioridad de fuentes para fotos

1. **API-Football** (RapidAPI, key) — mejor cobertura, fotos oficiales
2. **TheSportsDB** (free) — buena para equipos europeos/grandes
3. **Wikipedia** (free) — fallback para selecciones menores y entrenadores

Si una fuente no devuelve resultado, pasa a la siguiente automáticamente.

---

## Fotos de entrenador

- Se descargan a `public/coaches/{TEAM}.webp`
- El componente usa cascada: **local → `photoUrl` remoto → iniciales**
- 3 entrenadores sin foto local al inicio: CPV, HAI, KSA

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/fetch-squad-assets.mjs` | Script principal |
| `src/data/player-photos.ts` | Manifiesto autogenerado de fotos de jugador |
| `src/data/coach-photos.ts` | Manifiesto autogenerado de fotos de entrenador |
| `src/lib/player-photo.ts` | Helper `hasPlayerPhoto`, `playerPhotoSrc` |
| `src/lib/coach-photo.ts` | Helper `hasCoachPhoto`, `coachPhotoSrc` |
| `docs/missing-assets.md` | Lista de fotos faltantes (regenerar con --report) |
| `docs/data-discrepancies.md` | Discrepancias de nombres (generado con --verify-data) |
| `public/players/{TEAM}/{n}.webp` | Fotos de jugadores |
| `public/coaches/{TEAM}.webp` | Fotos de entrenadores |

---

## Presentar la lista al usuario

Al ejecutar `--report`, muestra el resumen consola y ofrece:

> "¿Por qué equipo quieres empezar? Los peores son JOR (20 fotos), HAI (12), CUW/EGY/IRQ (11)."

Luego el usuario puede pedir: "empieza por JOR" → ejecuta `npm run photos -- JOR`.