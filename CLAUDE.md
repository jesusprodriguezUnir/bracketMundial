# CLAUDE.md

Esta guia complementa [AGENTS.md](AGENTS.md). Usa [AGENTS.md](AGENTS.md) como arranque rapido para agentes y [README.md](README.md) para contexto de producto; este archivo conserva el detalle operativo del repo.

## Comandos

```bash
npm install
npm run dev            # Vite dev server en http://localhost:5173
npm run build          # tsc && vite build
npm run preview        # Sirve el build de produccion
npm test               # Vitest en modo run
npm test -- src/lib/bracket-logic.test.ts
npx vitest run -t "best 3rd placed"

# Fotos de jugadores y entrenadores
npm run assets:report                  # Lista huecos → docs/missing-assets.md
npm run photos -- JOR                  # Descarga fotos del equipo JOR
npm run photos -- CPV HAI --type coach # Fotos de entrenador de CPV y HAI
npm run photos -- ARG --verify-data   # Verifica nombres contra API → docs/data-discrepancies.md
```

## Arquitectura

```text
main.ts
  -> <app-root>             shell principal, import/export JSON del torneo
       -> <bracket-view>    navegacion principal y seleccion de vista
            |- <groups-view>
            |- <bracket-knockout>
            |- <calendar-view>
            |- <squads-view>
            |- <stadiums-view>
            -> <match-modal>  inyectado dinamicamente en body
```

### Fuente de verdad

- [src/store/tournament-store.ts](src/store/tournament-store.ts) concentra estado, persistencia y mutaciones del torneo.
- La persistencia usa Zustand con la clave `mundial-2026-tournament` en localStorage.
- Para acciones fuera de un componente Lit, usa `useTournamentStore.getState().accion(...)`.
- Los componentes Lit se suscriben al store y fuerzan render con `requestUpdate()`.

### Superficies principales

- [src/app-root.ts](src/app-root.ts): shell y acciones globales de importacion/exportacion.
- [src/bracket-view.ts](src/bracket-view.ts): navegacion entre vistas y apertura del modal de partido.
- [src/components/bracket-knockout.ts](src/components/bracket-knockout.ts): render del arbol eliminatorio.
- [src/components/groups-view.ts](src/components/groups-view.ts): fase de grupos y edicion de marcadores.
- [src/components/match-modal.ts](src/components/match-modal.ts): edicion de partidos.
- [src/data/fifa-2026.ts](src/data/fifa-2026.ts): grupos, fixtures base, `KNOCKOUT_BRACKET` y mapeos estaticos.
- [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts): logica pura reutilizable para reglas del bracket.

## Convenciones

- Componentes con Lit y `@customElement('nombre-kebab')`.
- Estilos de componente dentro del archivo; diseno global y tokens en [src/index.css](src/index.css).
- TypeScript estricto: `noUnusedLocals`, `noUnusedParameters` y `verbatimModuleSyntax` estan activos.
- Para tipos puros, usa `import type { ... }`.
- Si un parametro debe existir pero no se usa, sigue el patron de prefijo `_`.
- El breakpoint movil relevante es 768px.

## Lenguaje visual real

- La identidad actual vive en [src/index.css](src/index.css), no en descripciones antiguas del proyecto.
- Usa paleta retro tipo album Panini: `--paper`, `--retro-orange`, `--retro-red`, `--retro-green`, `--retro-blue`, `--retro-yellow`.
- La UI usa papel texturizado, sombras duras offset y esquinas rectas.
- Tipografias principales: Bowlby One / Archivo Black / Archivo / Space Mono.
- Si el usuario no pide un rediseno, conserva este lenguaje visual al tocar la UI.

## Sistema de Fotos de Jugadores y Entrenadores

Las fotos se almacenan localmente en `public/` y se gestionan con el script [`scripts/fetch-squad-assets.mjs`](scripts/fetch-squad-assets.mjs).

### Estructura

- **Jugadores:** `public/players/{TEAM}/{numero}.webp` (ej. `public/players/ARG/10.webp`)
- **Entrenadores:** `public/coaches/{TEAM}.webp` (ej. `public/coaches/ARG.webp`)
- **Manifiestos autogenerados:**
  - [`src/data/player-photos.ts`](src/data/player-photos.ts) — `PLAYER_PHOTOS: ReadonlySet<string>`
  - [`src/data/coach-photos.ts`](src/data/coach-photos.ts) — `COACH_PHOTOS: ReadonlySet<string>`
- **Helpers de render:**
  - [`src/lib/player-photo.ts`](src/lib/player-photo.ts) — `hasPlayerPhoto`, `playerPhotoSrc`
  - [`src/lib/coach-photo.ts`](src/lib/coach-photo.ts) — `hasCoachPhoto`, `coachPhotoSrc`

### Fuentes de imágenes (cascada de prioridad)

1. **API-Football** (RapidAPI, `API_FOOTBALL_KEY`) — mejor cobertura, plan free 100 req/día
2. **TheSportsDB** (sin key) — buena para equipos europeos
3. **Wikipedia** (sin key) — último recurso, útil para selecciones menores

Las keys van en `.env` (ver `.env.example`). Sin keys el script sigue funcionando con TheSportsDB + Wikipedia.

### Render en squads-view

El avatar del entrenador usa cascada: **foto local → `coach.photoUrl` remoto → iniciales**.
Los jugadores sin foto en el manifiesto muestran iniciales directamente.

### Cobertura actual (2026-05-17)

- **Jugadores:** 1010/1172 con foto · 162 faltantes en 31 equipos
- **Entrenadores:** 45/48 con foto local · faltan CPV, HAI, KSA
- **Reporte completo:** [`docs/missing-assets.md`](docs/missing-assets.md) (regenerar con `npm run assets:report`)

### Fuente prioritaria para jugadores: Guardian Player Guide (2026)

El script [`scripts/fetch-guardian-squads.mjs`](scripts/fetch-guardian-squads.mjs) sincroniza **datos y fotos** de los 1248 jugadores (48 equipos) directamente desde la guía interactiva del Guardian:

- **JSON maestro** (sin auth): `interactive.guim.co.uk/docsdata/1_ZAfmUkTZ4BvDgvhEGaEruakfu4aWIIjjzXaMAiT1yc.json`
- **JSON por equipo**: `.../docsdata/{spreadsheet}.json` → `{name, position, number, club, date of birth, grid_image}`
- **Fotos**: `media.guim.co.uk/{hash}/{crop}/500.jpg` — URL directa, sin auth

```bash
npm run guardian -- ARG --dry-run   # Ver cambios sin escribir
npm run guardian -- ARG             # Datos + fotos de ARG
npm run guardian                    # Todos los 48 equipos
npm run guardian -- --data          # Solo reescribir squads .ts
npm run guardian -- --photos        # Solo descargar fotos
```

La skill `/guardian-players` de Claude Code orquesta el flujo completo (ver [`.claude/skills/guardian-players/SKILL.md`](.claude/skills/guardian-players/SKILL.md)).

Si `GUARDIAN_MASTER_ID` cambia (el Guardian publica un nuevo atom), actualizar la constante en el script o pasar como env variable.

### Notas de mantenimiento

- Tras descargar fotos, el script regenera automáticamente ambos manifiestos.
- No editar `player-photos.ts` ni `coach-photos.ts` a mano.
- La skill `/fetch-squads` de Claude Code usa la cascada API-Football → TheSportsDB → Wikipedia (ver [`.claude/skills/fetch-squads/SKILL.md`](.claude/skills/fetch-squads/SKILL.md)); úsala para entrenadores o como respaldo cuando el Guardian no tiene foto de algún jugador.

## Sistema de Noticias

Multi-fuente con upsert a Supabase. Refresco cada 3 h durante el Mundial.

### Flujo

1. **GitHub Actions cron** cada 3 h (`.github/workflows/news.yml`) ejecuta [scripts/ingest-news.mjs](scripts/ingest-news.mjs).
2. El script consulta en cascada cuatro fuentes por equipo y locale:
   - GNews API (`GNEWS_DATA_KEY`)
   - NewsAPI.org (`NEWSAPI_KEY`)
   - Google News RSS (sin key)
   - RSS oficiales: FIFA, BBC Sport, Marca, AS (sin key, pre-cargados una vez)
3. Dedupe por URL canonicalizada, detecta idioma con heurística (acentos + tokens) y upsertea en la tabla `team_news` de Supabase. TTL: borra registros con `published_at > 30 días` al final.
4. **Skip inteligente**: si el último `fetched_at` de un equipo es <1 h, lo salta (evita gastar cuota de APIs).
5. El cliente [src/lib/news-service.ts](src/lib/news-service.ts) lee de la vista `team_news_top` (top 5 por equipo+locale) y cachea 1 h en localStorage. Fallback al `NEWS_SEED` bundleado si Supabase falla o no está configurado.

### Esquema en Supabase

Migración: [supabase/migrations/20260526120000_team_news.sql](supabase/migrations/20260526120000_team_news.sql)

- `team_news (team_id, locale, url) PK` — RLS lectura pública anon.
- `team_news_top` — vista con top 5 por `(team_id, locale)` por `published_at desc`.

### Operación

- **Secretos GitHub** (Settings → Secrets → Actions):
  - `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — requeridos.
  - `GNEWS_DATA_KEY`, `NEWSAPI_KEY` — opcionales (sin ellos, solo RSS).
- **Sin rama orfana**: ya no se usa `news-data`. El `vercel.json` raíz tiene `git.deploymentEnabled.news-data: false` por compatibilidad con runs antiguos.

### Mantenimiento manual

```bash
npm run news                     # Ingesta los 48 equipos a Supabase
npm run news -- ARG MEX          # Solo equipos indicados
npm run news -- --dry-run        # No upsertea, solo log
npm run news -- --force          # Ignora skip de 1h
npm run news -- --json-only      # Modo offline: escribe news-feed.json sin tocar Supabase
npm run news:legacy              # Script viejo (genera JSON solamente)
```

Sin `.env` con credenciales de Supabase, el script cae automáticamente a modo `--json-only`.

La skill `/news` de Claude Code orquesta refresco + verificación.

## Sistema de Probabilidad 1X2 (Odds de Casas de Apuestas)

Probabilidad por partido (gana A / empate / gana B) para los 72 partidos de grupos (de mercado) y para todo el torneo (modelo Elo de respaldo). Visible en grupos, modal de partido y bracket eliminatorio.

### Flujo de odds

1. **GitHub Actions cron** (2×/día: 06:00 y 18:00 UTC) ejecuta [scripts/generate-odds.mjs](scripts/generate-odds.mjs)
2. El script llama a The Odds API; para los partidos sin cuotas de mercado calcula estimaciones con el modelo Elo ([src/data/team-strength.ts](src/data/team-strength.ts) + [src/lib/odds-model.ts](src/lib/odds-model.ts))
3. Genera [odds-feed.json](odds-feed.json) con los 72 partidos (`source:'market'` o `source:'model'`) y lo pushea a la rama `odds-data`
4. En tiempo de ejecución, [src/lib/odds-service.ts](src/lib/odds-service.ts) fetch el archivo desde raw.githubusercontent.com
5. Cache en localStorage por 6 horas; si falla el fetch, usa el seed bundleado [src/data/odds/seed.ts](src/data/odds/seed.ts)
6. Para partidos de knockout (no en el feed), `getOddsForMatch` deriva odds on-the-fly desde los ratings de equipo

### Simulación basada en cuotas

`autoSimulateGroups` y `autoSimulateKnockout` ya no usan `Math.random()` uniforme: leen el seed/feed y usan `sampleResult` de [src/lib/odds-model.ts](src/lib/odds-model.ts) para sesgar resultados según la fuerza de cada equipo. Los favoritos ganan con mayor frecuencia.

### Operación de odds

- **Feed URL**: `https://raw.githubusercontent.com/jesusprodriguezUnir/bracketMundial/odds-data/odds-feed.json`
- **Rama remota**: `odds-data` (orfana, solo contiene el JSON)
- **Seed bundleado**: [src/data/odds/seed.ts](src/data/odds/seed.ts) — fallback offline, siempre con los 72 partidos
- **Sin ODDS_API_KEY**: el feed se rellena solo con estimaciones del modelo (igualmente útil)

### Mantenimiento de odds

```bash
npm run odds                              # Genera odds-feed.json (modelo si no hay ODDS_API_KEY)
npx tsx scripts/generate-odds.mjs --write-seed  # Regenera seed.ts
```

La skill `/odds` de Claude Code orquesta el flujo completo (ver [`.claude/skills/odds/SKILL.md`](.claude/skills/odds/SKILL.md)).

### Surfaces de UI

- **Vista de grupos**: barra 1X2 con leyenda 1/X/2 y tooltip indicando la fuente
- **Modal de partido** (`match-modal.ts`): barra + cifras para grupos y knockout
- **Bracket eliminatorio** (`bracket-knockout.ts`): barra compacta en cada match-box y tarjeta móvil (solo partidos no jugados)

### Notas de odds

- Las odds de mercado aparecen solo días antes de cada partido (junio 2026) — hasta entonces todo el feed usa estimaciones del modelo.
- Secreto GitHub: `ODDS_API_KEY` → Settings → Secrets → Actions.
- Plan free de The Odds API: ~500 req/mes. El cron usa 1 req/ejecución ≈ 60 req/mes.
- No editar `src/data/odds/seed.ts` a mano; regenerar con `--write-seed`.

## Sistema de Marketing y Social

Scripts que capturan la app real con Playwright para generar contenido
promocional. Todos arrancan y detienen su propio servidor dev; los que generan
video requieren `ffmpeg` en el PATH.

### Módulo compartido

[`scripts/lib/recording-utils.mjs`](scripts/lib/recording-utils.mjs) centraliza
helpers reutilizados: arranque del dev server, navegación por vista vía evento
`navigate`, conversión WebM→MP4, idioma/tema y el overlay de texto estilo Panini.

### Reels de Instagram — skill `/instagram-reel`

```bash
npm run reel list
npm run reel -- grupos --text "Sigue el Mundial 2026" --lang es --theme light
```

Graba un reel vertical 1080×1920 de **una vista concreta** ([`scripts/record-reel.mjs`](scripts/record-reel.mjs)).
El flag `--text` se incrusta como banner quemado en el MP4. Salida en
`recordings/reel-<vista>-<lang>.mp4` + `.caption.txt`.

### Assets de Google Play — skill `/google-play-assets`

```bash
npm run play:assets                  # todo
npm run play:assets -- --only phone  # solo un tipo: phone|tablet|promo|graphic|icon
```

[`scripts/generate-play-assets.mjs`](scripts/generate-play-assets.mjs) genera en
`marketing/google-play/`: capturas de teléfono (1080×1920), tablet 7" y 10",
video promocional 1080p, feature graphic 1024×500 e icono 512×512. Las
dimensiones exactas se garantizan con `sharp`.

### Post en X — skill `/x-post`

```bash
npm run x:post list
npm run x:post -- estadios --ratio 16:9 --text "Mundial 2026"
```

[`scripts/generate-x-post.mjs`](scripts/generate-x-post.mjs) genera en
`marketing/x/` una imagen (16:9 o 1:1) + un `.txt` con el texto del tweet
(≤280 chars) y hashtags. Publicación manual, sin API de X.

### Notas

- Las salidas (`recordings/`, `marketing/`) son artefactos generados; no se
  versionan salvo que se decida lo contrario.
- La navegación entre vistas usa el evento custom `navigate` de
  [src/bracket-view.ts](src/bracket-view.ts) — es idioma-agnóstica y no depende
  de etiquetas de texto.

## Areas fragiles

- [src/bracket-view.ts](src/bracket-view.ts) mantiene la vista activa en estado local; tocar tabs o navegacion puede romper el re-render.
- `importTournament` en [src/store/tournament-store.ts](src/store/tournament-store.ts) valida muy poco del JSON entrante.
- La seleccion de mejores terceros esta duplicada entre [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) y [src/store/tournament-store.ts](src/store/tournament-store.ts).
- Los IDs del knockout `R32-01...FIN-01` de [src/data/fifa-2026.ts](src/data/fifa-2026.ts) estan acoplados a helpers del store como `getNextMatchId`, `isTeamAPosition` y `getThirdPlaceMatchId`.
- [src/lib/data-service.ts](src/lib/data-service.ts) y [src/my-element.ts](src/my-element.ts) parecen perifericos al flujo principal.
- Firebase Data Connect esta configurado a nivel de proyecto, pero no integrado al frontend actual; no asumas SDK generado en `src/generated/`.
- En desarrollo, el service worker de la PWA puede ocultar cambios recientes; usa hard reload cuando algo no refleje el codigo.

## Validacion recomendada

- Cambios de UI: `npm run build` y comprobacion manual en viewport estrecho.
- Cambios de reglas del torneo: `npm test` o `npm test -- src/lib/bracket-logic.test.ts`.
- Cambios de estructura del knockout: revisar a la vez [src/data/fifa-2026.ts](src/data/fifa-2026.ts) y [src/store/tournament-store.ts](src/store/tournament-store.ts).

## Datos oficiales del torneo

### Fuente autoritativa FIFA

La fuente de verdad para datos del torneo es la FIFA oficial. Sus páginas son renderizadas con JavaScript y **WebFetch no las carga**; usa **WebSearch** con dominio `fifa.com` o fuentes agregadoras verificadas.

URLs clave:

- Calendario (ES): `https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/calendario-fixture-mundial-2026-partidos-fechas`
- Resultados en vivo (EN): `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures`
- Fixture + estadios (EN): `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums`

Fuente alternativa que sí responde a WebFetch (verificada a 2026-05-15): `https://worldcupwiki.com/schedule/`

### Datos verificados del torneo (actualizados 2026-05-15)

**Formato:** 48 equipos · 12 grupos (A–L) · 4 equipos/grupo · 104 partidos · 16 estadios

**Fase de grupos:** 11 jun – 27 jun 2026
**Ronda de 32:** 28 jun – 3 jul · **Octavos:** 4–7 jul · **Cuartos:** 9–11 jul
**Semifinales:** 14–15 jul · **Tercer puesto:** 18 jul (Hard Rock Stadium, Miami)
**Final:** 19 jul 2026 (MetLife Stadium, Nueva Jersey) — 21:00 hora España

**Distribución de sedes:** 11 estadios en EE. UU. · 3 en México · 2 en Canadá

**Grupos (confirmados FIFA):**

```text
A: México, Sudáfrica, Corea del Sur, Rep. Checa
B: Canadá, Bosnia y Herz., Catar, Suiza
C: Brasil, Marruecos, Haití, Escocia
D: EE. UU., Paraguay, Australia, Turquía
E: Alemania, Curazao, Costa de Marfil, Ecuador
F: Países Bajos, Japón, Suecia, Túnez
G: Bélgica, Egipto, Irán, Nueva Zelanda
H: España, Cabo Verde, Arabia Saudita, Uruguay
I: Francia, Senegal, Irak, Noruega
J: Argentina, Argelia, Austria, Jordania
K: Portugal, RD Congo, Uzbekistán, Colombia
L: Inglaterra, Croacia, Ghana, Panamá
```

> Si hay dudas sobre un dato del torneo, verifica contra estas fuentes antes de tocar [src/data/fifa-2026.ts](src/data/fifa-2026.ts) o [src/data/match-schedule.ts](src/data/match-schedule.ts).

## Referencias

- [AGENTS.md](AGENTS.md): guia breve para agentes.
- [README.md](README.md): producto, tecnologias y setup.
- `.github/instructions/lit-ui.instructions.md`: reglas especificas para UI con Lit.
- `.github/instructions/tournament-logic.instructions.md`: invariantes de logica del torneo.
