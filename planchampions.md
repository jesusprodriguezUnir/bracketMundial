# Plan: pivotar bracketMundial → Bracket Champions League 2026/27

## Contexto

El Mundial 2026 terminó el 19 de julio. La app queda con una infraestructura enorme
(ligas privadas, auth, ranking, ingesta de datos, SEO, PWA, marketing automatizado) y
sin competición que alimentar. Los tres workflows de GitHub Actions están pausados o con
guards de fecha `2026-06-11 / 2026-07-20`.

La Champions 2026/27 arranca **el 8-10 de septiembre de 2026** — en 3 días. El objetivo
es reapuntar todo ese motor a la Champions, priorizando la captación de usuarios, y
lanzar algo utilizable antes del primer partido.

**Decisiones tomadas:**

1. **Pivotar**: mismo repo, mismo dominio, mismo despliegue. Champions por defecto,
   Mundial 2026 en modo archivo de solo lectura para conservar el SEO.
2. **MVP el 8-sep e iterar por jornada**: cada una de las 8 jornadas es un hito.
3. **Diseño híbrido**: se conservan componentes y estructura; se sustituyen tokens de
   `src/index.css` por una paleta nocturna europea.

---

## Realidad verificada de la competición

| Dato | Valor |
| --- | --- |
| Formato | 36 equipos, **una sola tabla**, 8 partidos por equipo (4 casa / 4 fuera), 144 partidos |
| Sorteo | Ya realizado, 27-ago-2026, Mónaco |
| Jornadas | J1 8-10 sep · J2 13-14 oct · J3 20-21 oct · J4 3-4 nov · J5 24-25 nov · J6 8-9 dic · J7 19-20 ene · J8 27 ene (horario unificado) |
| Clasificación | 1-8 → octavos directo · 9-16 → playoff (cabezas de serie) · 17-24 → playoff (no cabezas) · 25-36 → eliminados |
| Desempate | Puntos → DG → GF → goles fuera → victorias → victorias fuera → coeficiente UEFA |
| Playoffs | 16/17 y 23/24 feb 2027 (ida y vuelta) |
| Octavos | 9/10 y 16/17 mar · Cuartos 6/7 y 13/14 abr · Semis 27/28 abr y 4/5 may |
| Final | 5 junio 2027, Estadio Metropolitano, Madrid — **partido único** |
| Tercer puesto | No existe |

> El listado de los 36 clubes y sus bombos debe reverificarse contra API-Football en el
> momento de la ingesta; no se cablea a mano.

**Implicación de producto clave:** el Mundial daba un pico de un mes. La Champions da
**8 jornadas repartidas en 5 meses + 4 rondas eliminatorias**. Es un bucle de retención
recurrente, no un evento. El producto debe girar sobre "la porra de la jornada", no sobre
"rellena el bracket una vez".

---

## Qué se reutiliza (el 80% del trabajo ya está hecho)

### Se hereda intacto — no se toca una línea

- **Captación completa**: `src/store/auth-store.ts` (308), `src/components/auth-modal.ts`
  (806), `src/lib/supabase-client.ts`, `src/lib/native-auth.ts` — Supabase Auth con
  password, magic link, signup+confirmación, reset, PKCE y deep links nativos.
- **Ligas privadas**: `src/components/leagues-view.ts` (4.674), `src/store/leagues-store.ts`
  (450), `src/lib/league-sync.ts` (612) — crear liga, código corto `XXX-XXXX`, invitación
  por URL `#lg=`, congelar, bloquear por fecha, expulsar, sync bidireccional.
- **Motor puro**: `src/lib/odds-model.ts`, `src/lib/bracket-logic.ts` (`syncKnockoutBracket`,
  `createMatchState`, `getLoserId`), `src/store/store-utils.ts`,
  `src/store/league-context-bridge.ts`.
- **Componentes agnósticos**: `odds-bar.ts`, `score-stepper.ts`, `lineup-view.ts`,
  `player-hover-card.ts`.
- **Resolución de assets por id de 3-4 letras**: `src/lib/team-assets.ts`,
  `render-flag.ts`, `player-photo.ts`, `coach-photo.ts`.
- **Backend**: `leagues`, `league_members`, `predictions`, `official_results`,
  `score_sync_runs` usan payload JSONB opaco → agnósticas de competición.
- **Infra de despliegue**: Vercel + Cloudflare + PWA + Capacitor + GTM `GTM-NL5BC7FG` +
  AdSense `ca-pub-2301364261266891`. Al mantener dominio, se heredan sin dar de alta nada.

### Se reapunta cambiando un identificador

| Pieza | Cambio |
| --- | --- |
| `scripts/generate-odds.mjs:125` | `SPORT_KEY` → `'soccer_uefa_champs_league'` |
| `scripts/update-live-scores.ts` | endpoint `competitions/WC` → `competitions/CL` (football-data.org ya cubre Champions en plan gratuito) |
| `src/lib/odds-service.ts:35` | `FEED_URL` → rama `odds-data`, fichero `ucl-odds-feed.json` |
| `scripts/fetch-kits.mjs` | solo depende de `team-colors.ts` |
| `scripts/lib/recording-utils.mjs` + familia de grabación | navegan por evento `navigate`, idioma-agnósticos |

### Se reescribe la fuente, no la lógica

- `scripts/ingest-news.mjs`: sustituir el array de 48 selecciones por 36 clubes; cambiar
  RSS de FIFA/Marca-selección por UEFA + medios de club.
- `scripts/fetch-crests.mjs`: nuevo `TEAM_WIKI_PAGES` — **o mejor**, tomar los logos
  directamente de API-Football, que ya los sirve.
- `scripts/generate-pages.mjs` + `scripts/lib/seo-*.mjs`: el motor de 135 páginas ES/EN con
  hreflang y sitemap escala igual a 36 clubes; solo cambian slugs, textos y JSON-LD.

### Se abandona

`scripts/fetch-guardian-squads.mjs` (la guía del Guardian es exclusiva del Mundial),
`scripts/download-stadiums.mjs` (16 URLs literales), `src/data/third-places-table.ts`
(514 líneas de la tabla Anexo C), `src/data/world-titles.ts`,
`src/components/broadcasting-view.ts` (RTVE/España).

---

## El único rediseño de fondo

Hay exactamente dos incompatibilidades estructurales. Todo lo demás es sustitución de datos.

### 1. Fase liga: 36 equipos, tabla única

`recalculateStandings()` en `src/store/tournament-store.ts:294` itera
`'ABCDEFGHIJKL'.split('')` (repetido también en `:277` y `:338`), y `groupStandings` es
`Record<grupo, Standing[]>`.

**Solución de diff mínimo:** no se cambia la forma del estado. Se introduce
`src/data/competition.ts` con la config de competición y se sustituyen los tres literales
por `COMPETITION.groups`. Para la Champions ese array es `['LP']` — un único "grupo" que
es la tabla de 36. Todos los consumidores del store siguen funcionando sin tocarse.

Los desempates de `recalculateStandings` pasan de FIFA (pts → DG → GF) a UEFA
(pts → DG → GF → goles fuera → victorias → victorias fuera). Se añade como función de
comparación configurable en `competition.ts`.

Lo que sí es nuevo: `src/components/league-table-view.ts`, una tabla de 36 filas con
bandas de color por corte (1-8 verde, 9-24 ámbar, 25-36 gris). Sustituye a
`groups-view.ts` (1.204 líneas de 12 tarjetas de grupo) y a `groups-bracket-view.ts`.

### 2. Eliminatorias a ida y vuelta

`KnockoutMatchResult` (`tournament-store.ts:203`) ya tiene `scoreA`/`scoreB` +
`penaltyScoreA`/`penaltyScoreB`.

**Decisión: una eliminatoria = un nodo, marcador = resultado agregado.** Los partidos de
ida y vuelta existen como fixtures informativos en el calendario, pero el usuario predice
el global de la eliminatoria, no dos marcadores. Esto:

- deja `KnockoutMatchResult` sin cambios,
- deja `syncKnockoutBracket` sin cambios,
- deja `bracket-codec.ts` sin cambios estructurales,
- y reduce a la mitad la fricción de rellenar el bracket.

El slot DSL de `bracket-logic.ts:75` pasa de la regex `/G-([A-L])-(\d)/` a `/L-(\d+)/`,
donde `L-1`…`L-24` son posiciones en la tabla única. `calculateBestThirds` y
`THIRD_PLACES_TABLE` desaparecen del camino.

`KnockoutStructureLike` (`bracket-logic.ts:42-49`) exige hoy las 6 claves fijas
`roundOf32/roundOf16/quarterfinals/semifinals/thirdPlace/final`. La Champions necesita
`playoffs/roundOf16/quarterfinals/semifinals/final`. **Se refactoriza a `rounds: Round[]`
ordenado** — pero en Fase 2, no ahora: el bracket no hace falta hasta enero.

---

## Fases

### F0 — MVP jugable (hasta el 8 de septiembre) · CRÍTICO

Objetivo: que un usuario pueda entrar, ver la tabla y los 144 partidos, y **crear una
porra con sus amigos para la jornada 1**.

1. **Salvaguarda**: tag `mundial-2026-final` sobre `main` antes de tocar nada.
2. **`scripts/fetch-ucl-fixtures.mjs`** (nuevo): API-Football (`API_FOOTBALL_KEY`, ya
   configurada), liga `2`, temporada `2026`. Extrae los 36 clubes (id, nombre, país,
   logo) y los 144 fixtures (fecha, jornada, local, visitante, sede). Escribe
   `src/data/ucl-2027.ts` y `src/data/league-schedule.ts` con **las mismas formas** que
   `fifa-2026.ts` y `match-schedule.ts`, y descarga los escudos a `public/assets/crests/`.
   *Verificar la forma exacta del endpoint v3 antes de escribir el parser.*
3. **`src/data/competition.ts`** (nuevo): `{ id, groups: ['LP'], teamsPerGroup: 36,
   matchdays: 8, tiebreakers, hasThirdPlace: false, rounds: [...] }`.
4. **Store**: sustituir los tres `'ABCDEFGHIJKL'` de `tournament-store.ts` por
   `COMPETITION.groups`; cambiar la clave de persistencia a `ucl-2027-tournament`;
   desactivar `getBestThirds`/`mapThirds` y el bloque de knockout tras banderín.
5. **`src/components/league-table-view.ts`** (nuevo) + **`src/components/matchday-view.ts`**
   (nuevo): la vista de jornada con los 18 partidos y sus `score-stepper`. Esta segunda es
   **el corazón del producto**, no un extra.
6. **Puntuación**: en `src/lib/mini-league.ts`, añadir `UCL_POINTS` reutilizando el esquema
   de grupos existente (5 exacto / 3 diferencia / 2 signo / 0 fallo) sobre los 144 partidos.
   El bloque de progresión de knockout queda inerte hasta F2.
7. **Recorte de superficie**: ocultar tras flag `squads`, `coaches`, `stadiums`, `guide`,
   `broadcasting` y `bracket-knockout` hasta que tengan datos. Menos superficie = menos
   bugs el día del lanzamiento.
8. **Rebrand mínimo**: `index.html` (title, JSON-LD, manifest), `app-root.ts` copy
   "48/12/104", hashtags de `src/lib/share-image.ts:87`, i18n (`es.ts`/`en.ts`: las ~50
   claves con "Mundial/48 selecciones/12 grupos/104 partidos" incrustado).
9. **Modo archivo del Mundial**: mover el bundle actual a la ruta `/mundial-2026/` como
   estático, mantener las 135 páginas SEO existentes y añadir un aviso de "edición
   archivada" con enlace a la Champions.
10. **Workflows**: quitar los guards de fecha jun-jul y reprogramar crons al calendario
    sep→jun en los tres YAML.

**Línea de corte si el tiempo aprieta:** si la ingesta de fixtures falla, se lanza tabla +
calendario en solo lectura el día 8 y la porra entra en J2 (13-oct). No se lanza una porra
con datos malos: un fixture erróneo el día 1 destruye la confianza de todo el grupo de
WhatsApp.

### F1 — Captación (jornadas 2-4, sep→nov)

Aquí es donde se ataca de verdad el "que entre gente". Lo que hoy **falta**:

- **OG dinámico por bracket compartido**: el link `#b2=` no genera preview. Un endpoint de
  Vercel que renderice una imagen OG con el nombre y el pronóstico multiplica el CTR en
  WhatsApp. Es la mayor palanca viral disponible y no existe.
- **OAuth social** (Google/Apple) sobre el `auth-store` actual: hoy solo hay email, y el
  email mata la conversión en móvil.
- **Onboarding sin registro → registro**: permitir rellenar la porra y pedir cuenta solo al
  publicar. El store ya soporta contexto personal sin sesión.
- **Arreglar la fricción documentada** en `docs/ligas-privadas.md:149-153`: enlace vs
  código hacen cosas distintas, y compartir vs importar se confunden. Unificar en un solo
  flujo "Invitar" que genere un link que ya une al usuario.
- **Ranking global público** además de las ligas privadas — hoy solo se compite con
  conocidos, lo que limita el techo de usuarios.
- **Notificaciones de jornada**: "faltan 3 h para el cierre de la J3". El bucle de
  retención de la Champions vive de esto.

### F2 — Bracket y datos ricos (jornadas 5-8, nov→ene)

- Refactor de `KnockoutStructureLike` a `rounds: Round[]` ordenado.
- `KNOCKOUT_BRACKET` de la Champions con slots `L-1`…`L-24` y eliminatorias como nodo único.
- `bracket-knockout.ts` (2.975 líneas, ya data-driven) reapuntado a la nueva estructura.
- Plantillas de los 36 clubes vía API-Football `/players/squads` — reemplaza al Guardian.
- Reactivar noticias y odds con las fuentes nuevas.
- SEO: regenerar las 135+ páginas con slugs de club (`/equipo/<slug>/`).

### F3 — Playoffs (feb-2027 en adelante)

El bracket real arranca. Aquí el producto está en su punto fuerte y es cuando conviene
concentrar el gasto de marketing: reels, X, Play Store. Toda la maquinaria
(`record-reel.mjs`, `generate-play-assets.mjs`, `generate-x-post.mjs`) funciona ya.

---

## Diseño: retro en clave europea

El sistema de `src/index.css` (434 líneas) es 100% agnóstico de competición: ningún token
menciona el Mundial. El cambio es de **valores, no de estructura**.

- **Se conserva**: sombras duras offset (`--shadow-hard-*`), esquinas rectas
  (`--radius: 0`), textura de papel/halftone, jerarquía tipográfica
  (Bowlby One / Archivo Black / Archivo / Space Mono), tema claro/oscuro.
- **Se sustituye**: la paleta de álbum de cromos por una nocturna europea — fondo profundo,
  acento eléctrico, plata y un dorado de trofeo para los puestos 1-8. Se invierte el
  default: el **tema oscuro pasa a ser el primario**, que es el registro natural de las
  noches de Champions.
- **Se aprovecha**: `docs/mejoras.md` ya documenta los cuellos de botella reales —
  18 imports estáticos en `app-root.ts`, `recalculateStandings` recalculando todo por cada
  gol, CLS en avatares. El lazy loading de vistas (Sprint 1 de ese doc) conviene hacerlo en
  F0, porque al recortar superficie sale casi gratis.

**Riesgo de marca a decidir antes de publicitar**: no usar el "starball" ni la tipografía
oficial de UEFA, y elegir un nombre de producto que no sea "Champions League". Los escudos
de club en un sitio de aficionados son práctica común pero no son riesgo cero.

---

## Ficheros críticos

**Nuevos:** `src/data/competition.ts`, `src/data/ucl-2027.ts`,
`src/data/league-schedule.ts`, `src/components/league-table-view.ts`,
`src/components/matchday-view.ts`, `scripts/fetch-ucl-fixtures.mjs`, `.env.example`.

**Modificados:** `src/store/tournament-store.ts` (`:277`, `:294`, `:325`, `:338`, `:1001`),
`src/lib/bracket-logic.ts` (`:42-49`, `:63`, `:75`), `src/lib/mini-league.ts`,
`src/lib/odds-service.ts:35`, `src/lib/share-image.ts:87`, `src/i18n/es.ts` + `en.ts`,
`src/index.css`, `src/app-root.ts`, `src/bracket-view.ts`, `index.html`, `vite.config.ts`,
los tres `.github/workflows/*.yml`, `scripts/generate-odds.mjs:125`,
`scripts/update-live-scores.ts`, `scripts/ingest-news.mjs`.

**Deuda que conviene saldar de paso:** no existe `.env.example` pese a haber 10+ variables
solo descubribles leyendo código; los diccionarios nombre→código están duplicados en 6
scripts (extraer a `src/data/team-aliases.ts`); falta la migración que crea `predictions`;
la migración de `leagues` empieza con `drop table cascade`.

---

## Verificación

1. `npm test` — `src/lib/bracket-codec.test.ts` y `league-projection.test.ts` deben seguir
   verdes tras el cambio de `COMPETITION.groups`. Añadir un test de la tabla de 36 con los
   desempates UEFA.
2. `npm run build` — `tsc` estricto detecta cualquier consumidor huérfano de
   `GroupLetter`/`TournamentPhase`.
3. **Contraste de datos**: comparar los 144 fixtures generados contra uefa.com jornada a
   jornada antes de abrir la porra. Es la verificación que más importa.
4. **Prueba end-to-end de la porra**: crear liga → invitar en otro navegador → rellenar J1
   → publicar → comprobar ranking. Es el camino crítico del producto.
5. Viewport ≤768px: el shell móvil (`src/components/mobile/`) es un swap total
   (`app-root.ts:15`), no CSS responsive. Toda vista nueva necesita su equivalente móvil o
   se cae.
6. Tras desplegar: purgar Cloudflare (`npm run cache:purge:cf`) y hard reload — el service
   worker de la PWA oculta cambios recientes.
