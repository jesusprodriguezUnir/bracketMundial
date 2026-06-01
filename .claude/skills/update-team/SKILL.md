---
name: update-team
description: >
  Actualiza fotos de jugadores, foto del entrenador Y noticias de un equipo
  del Mundial 2026 en un solo paso. Acepta nombre en español o código FIFA
  (Argentina, ARG, España, ESP, Países Bajos, Holanda…).
  Úsala cuando el usuario pida: actualizar equipo, fotos y noticias de un equipo,
  completar datos de una selección, refresh team, datos de Argentina/España/etc.,
  actualizar todo de un equipo, fotos y noticias juntas.
  Para solo fotos usa /fetch-squads; para solo noticias usa /news.
---

# Skill: update-team

Actualiza en un solo paso fotos de jugadores, foto del entrenador y noticias
de una selección, aceptando nombre completo en español o código FIFA de 3 letras.

## Flujo de trabajo

### 1. Resolver nombre → código FIFA

El usuario puede proporcionar el nombre en cualquier formato:
`Argentina`, `arg`, `ARG`, `España`, `españa`, `Países Bajos`, `Holanda`…

Busca en `TEAMS_2026` de [src/data/fifa-2026.ts](src/data/fifa-2026.ts)
comparando (sin mayúsculas ni tildes) contra los campos `id`, `name` y `shortName`.

**Tabla de alias comunes** (no están en TEAMS_2026 pero son habituales):

| Alias del usuario | Código |
|------------------|--------|
| Holanda / Holland / Netherlands | NED |
| Estados Unidos / EEUU / USMNT | USA |
| Czech Republic / Chequia | CZE |
| Ivory Coast / Marfil | CIV |
| Congo / Congo DR | COD |
| Bosnia / Bosnia-Herzegovina | BIH |
| Corea / Korea | KOR |
| Saudi Arabia / Arabia | KSA |
| Cabo Verde / Cape Verde | CPV |

Si hay ambigüedad o no se reconoce el nombre, listar las 48 selecciones y pedir
confirmación antes de continuar.

Si el input ya es un código de 3 letras válido (todo mayúsculas), usarlo directamente.

### 2. Descargar fotos (jugadores + entrenador)

```bash
npm run photos -- {CODE}
# --type all por defecto: descarga jugadores Y entrenador en un paso
```

El script descarga a:
- `public/players/{CODE}/{n}.webp` — jugadores (n = número de dorsal)
- `public/coaches/{CODE}.webp` — entrenador

Y regenera automáticamente los manifiestos:
- `src/data/player-photos.ts`
- `src/data/coach-photos.ts`

Mostrar el resumen de fotos descargadas vs. ya existentes que imprime el script.

Si se quiere forzar re-descarga aunque las fotos ya existan:
```bash
npm run photos -- {CODE} --force
```

### 3. Actualizar noticias del equipo

```bash
node scripts/ingest-news.mjs {CODE} --force
# --force ignora el skip inteligente de 1h y garantiza la ingesta
```

**Sin credenciales Supabase** en `.env`, el script cae automáticamente a modo
`--json-only` (escribe `news-feed.json` local — útil en desarrollo).

**Con credenciales**, hace upsert en la tabla `team_news` de Supabase y la app
en producción reflejará las noticias en el siguiente ciclo de cache (1h).

### 4. Informe final

Tras los dos pasos, resumir:
- Fotos: N descargadas · M ya existían · K fallidas (si hay)
- Noticias: N en español · M en inglés · fuentes utilizadas
- Si quedan fotos de jugadores pendientes del equipo, mencionarlo y ofrecer
  `/assets:report` para ver el estado completo

---

## Configuración de API keys (.env)

Todas son opcionales. Sin keys el script usa TheSportsDB + Wikipedia para fotos
y Google News RSS para noticias.

```env
# Fotos (mejora cobertura, especialmente para selecciones menores)
API_FOOTBALL_KEY=tu_rapidapi_key       # https://rapidapi.com/api-sports/api/api-football
                                        # Plan free: 100 req/día

# Noticias con descripción e imagen
GNEWS_DATA_KEY=tu_gnews_key            # https://gnews.io  (plan free disponible)
NEWSAPI_KEY=tu_newsapi_key             # https://newsapi.org/register (dev free)

# Supabase (para persistir noticias en la nube)
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `scripts/fetch-squad-assets.mjs` | Descarga fotos de jugadores y entrenadores |
| `scripts/ingest-news.mjs` | Ingesta noticias de equipo en Supabase / JSON |
| `src/data/fifa-2026.ts` | `TEAMS_2026`: lista de 48 equipos con id, name, shortName |
| `src/data/player-photos.ts` | Manifiesto autogenerado de fotos de jugadores |
| `src/data/coach-photos.ts` | Manifiesto autogenerado de fotos de entrenadores |
| `public/players/{CODE}/` | Fotos de jugadores por equipo |
| `public/coaches/{CODE}.webp` | Foto del entrenador |
| `docs/missing-assets.md` | Reporte de fotos faltantes (regenerar con `npm run assets:report`) |

---

## Notas

- Esta skill combina `/fetch-squads` + `/news` en un paso para un equipo.
  Úsalas por separado si solo necesitas uno de los dos tipos de actualización.
- La app cachea noticias en localStorage 1h. Tras publicar a Supabase, el usuario
  necesita un **hard reload** (Ctrl+Shift+R) para ver las noticias nuevas.
- `docs/missing-assets.md` da una visión completa de todos los equipos.
  Ejecutar `npm run assets:report` para regenerarlo tras descargar fotos.
