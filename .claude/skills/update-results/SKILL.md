---
name: update-results
description: >
  Actualiza los resultados del día a día del Mundial 2026 ejecutando la
  sincronización con API-Football y Supabase. También analiza el estado
  actual de GitHub Actions y propone mejoras concretas al workflow de scores.
  Úsala cuando el usuario pida: actualizar resultados, resultados del día,
  scores de hoy, sincronizar partidos, resultados en vivo, update results,
  live scores, partidos jugados, marcar resultado, estado de las actions,
  mejorar el cron de scores, cuándo se actualizan los resultados.
---

# Skill: update-results

Sincroniza los resultados oficiales del Mundial con API-Football, muestra el
diagnóstico de la sincronización y analiza el estado de GitHub Actions con
mejoras concretas.

## Flujo de trabajo

### 1. Verificar credenciales (.env)

El script requiere tres variables en `.env` (raíz del proyecto):

```env
API_FOOTBALL_KEY=tu_rapidapi_key          # https://rapidapi.com/api-sports/api/api-football
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Si alguna falta, el script sale con error antes de llamar a ninguna API.
Abrir `.env.example` para ver la plantilla completa.

**Cuota API-Football free**: ~100 req/día. Cada ejecución consume 1 petición.

### 2. Ejecutar la sincronización

```bash
# Sincronización normal (con skip inteligente):
npm run scores:update

# Forzar aunque no haya partido en ventana activa:
npm run scores:update -- --force
```

**Qué hace el script** (`scripts/update-live-scores.ts`):

1. **Skip inteligente**: comprueba si hay partido en ventana `[-30min, +3h]` del
   momento actual. Si no hay partido Y la última run de Supabase fue hace <1h →
   sale sin consumir cuota de API.
2. **Llama a API-Football** (`/fixtures?league=1&season=2026`) con reintentos
   exponenciales (hasta 2 reintentos).
3. **Normaliza nombres** de equipos con similitud Levenshtein (threshold 0.6)
   para mapear "Korea Republic" → `KOR`, "United States" → `USA`, etc.
4. **Actualiza Supabase**: tabla `official_results` (id=1, payload codificado).
5. **Auditoría**: inserta una fila en `score_sync_runs` con fixtures_seen,
   fixtures_updated, http_status y duration_ms.

La salida es JSON estructurado — leerla e interpretarla para el usuario.

### 3. Mostrar diagnóstico

Interpretar la salida del script:

| Campo en log | Qué significa |
|-------------|---------------|
| `fixtures_seen` | Partidos devueltos por API-Football |
| `fixtures_updated` | Partidos actualizados en Supabase |
| `http_status` | Código HTTP de API-Football (200 = OK, 429 = rate limit) |
| `skipped: true` | El skip inteligente activó y no llamó a la API |
| `skip_reason` | `"no_match_in_window"` o `"last_run_too_recent"` |
| `error_msg` | Si hubo error, su descripción |
| `duration_ms` | Tiempo total de ejecución |

Mostrar un resumen legible: "✅ 3 partidos actualizados" o "⏭ Saltado: no hay
partido en las próximas 3h y última sync hace 45 min".

### 4. Análisis del estado actual de GitHub Actions

Archivo: [.github/workflows/update-scores.yml](.github/workflows/update-scores.yml)

**Arquitectura actual**:

```
Cron */5 * * * *  (cada 5 min)
  └── checkout + npm ci + validar secrets
      └── scripts/update-live-scores.ts
            ├── skip inteligente → sale si no hay partido
            └── API-Football → Supabase official_results (id=1)
                              → Supabase score_sync_runs (auditoría)
```

**Problema central**: el runner de GitHub Actions arranca en **cada una de las
288 ejecuciones diarias** (checkout + npm ci ≈ 1-2 min cada una), aunque el
skip inteligente evite la llamada real a la API. Esto consume minutos de
GitHub Actions gratuitos innecesariamente.

### 5. Tabla de mejoras

Presentar esta tabla al usuario y preguntar cuáles quiere implementar:

| # | Problema actual | Mejora propuesta |
|---|-----------------|-----------------|
| 1 | **288 runs/día**, la mayoría vacías | Cambiar cron a `*/15 * * * *` (96/día) o `*/30` (48/día); o usar un schedule inteligente generado dinámicamente a partir de `match-schedule.ts` |
| 2 | **Sin notificación de fallos** | Añadir step `if: failure()` que envíe un webhook o use `gh` CLI para crear un issue automático |
| 3 | **Sin historial** de `official_results` | Crear tabla `official_results_history (run_id, payload, created_at)` en Supabase para poder hacer rollback |
| 4 | **Sin resumen visual** en GitHub Actions UI | Añadir `echo "✅ N fixtures updated" >> $GITHUB_STEP_SUMMARY` para ver la tabla en el panel de Actions |
| 5 | **Sin fuente alternativa** si API-Football cae | Añadir fallback a TheSportsDB Live cuando API-Football devuelve error 5xx |
| 6 | **`tsx` transpila en cada run** (~1s extra) | Pre-compilar `update-live-scores.ts → .js` en el paso `npm ci` y ejecutar el JS resultante |
| 7 | **Cron activo fuera del Mundial** | Añadir guard en el script: si `Date.now() < 2026-06-11` o `> 2026-07-20` → salir inmediatamente |

Para implementar cualquiera de estas mejoras, confirmar con el usuario antes
de modificar el workflow o la base de datos.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/update-live-scores.ts` | Script principal de sincronización de resultados |
| `.github/workflows/update-scores.yml` | Cron de GitHub Actions (cada 5 min) |
| `src/lib/official-results.ts` | Cliente para leer `official_results` desde Supabase |
| `src/data/match-schedule.ts` | Calendario completo: 72 grupos + 32 knockout con fechas/horas |

---

## Configuración de secrets en GitHub

Para que el workflow funcione en CI, configurar en:
**Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|--------|-------------|
| `API_FOOTBALL_KEY` | RapidAPI key de API-Football |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase |

Acepta tanto `secrets.*` como `vars.*` (variables de repositorio no cifradas).

---

## Notas

- El workflow `update-scores.yml` tiene concurrencia exclusiva (`group: update-scores,
  cancel-in-progress: false`): si ya hay una run activa, la nueva espera en cola.
- `official_results` tiene una sola fila (id=1) con el estado actual del torneo
  codificado. La app lo lee en `loadOfficialResults()` de `official-results.ts`.
- La tabla `score_sync_runs` en Supabase guarda auditoría completa de cada
  ejecución; útil para depurar problemas de sincronización.
- Para disparar el workflow manualmente desde GitHub: Actions → Update Live Scores
  → Run workflow, con opción de activar `--force`.
