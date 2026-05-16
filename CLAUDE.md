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

### Notas de mantenimiento

- Tras descargar fotos, el script regenera automáticamente ambos manifiestos.
- No editar `player-photos.ts` ni `coach-photos.ts` a mano.
- La skill `/fetch-squads` de Claude Code orquesta el flujo completo (ver [`.claude/skills/fetch-squads/SKILL.md`](.claude/skills/fetch-squads/SKILL.md)).

## Sistema de Noticias

Las noticias se cargan dinámicamente desde Google News y se actualizan diariamente:

### Flujo

1. **GitHub Actions cron** (diario a 05:00 UTC) ejecuta [scripts/generate-news.mjs](scripts/generate-news.mjs)
2. El script obtiene las últimas 3 noticias por equipo y locale (ES/EN) de Google News RSS
3. Genera [news-feed.json](news-feed.json) y lo pushea a la rama `news-data`
4. En tiempo de ejecución, [src/lib/news-service.ts](src/lib/news-service.ts) fetch el archivo desde raw.githubusercontent.com
5. Cache en localStorage por 24 horas; fallback a `NEWS_SEED` si falla el fetch

### Operación

- **Feed URL**: `https://raw.githubusercontent.com/jesusprodriguez/bracketMundial/news-data/news-feed.json`
- **Rama remota**: [`news-data`](https://github.com/jesusprodriguez/bracketMundial/tree/news-data) (orfana, solo contiene el JSON)
- **Seed de fallback**: [src/data/news/seed.ts](src/data/news/seed.ts) (bundleada)

### Mantenimiento manual

Para ejecutar la actualización de noticias localmente:
```bash
node scripts/generate-news.mjs          # Genera news-feed.json
node scripts/generate-news.mjs --write-seed  # También regenera seed.ts
```

Luego crear/actualizar la rama `news-data` (ver CLAUDE.md de commits anteriores o el workflow en `.github/workflows/news.yml`).

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
