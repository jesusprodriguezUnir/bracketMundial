---
name: ucl-squads
description: >
  Ingesta, actualización y gestión de plantillas, fotos de jugadores,
  entrenadores y escudos para los 36 clubes de la UEFA Champions League 2026/27
  directamente desde la web oficial de UEFA.com.
license: MIT
metadata:
  author: bracketMundial
  version: "2.0"
---

# Skill: ucl-squads (UEFA Champions League 2026/27)

Automatiza la descarga y sincronización de datos de los **36 clubes de la fase liga de la Champions League 2026/27** tomando como referencia y fuente de verdad oficial directa la web de **UEFA.com**.

## Capacidades

1. **Plantillas Oficiales**: Extrae todos los jugadores por club (dorsal oficial, nombre completo, posición `GK|DF|MF|FW`, edad, nacionalidad, foto oficial en alta resolución).
2. **Alineaciones Base**: Genera automáticamente un 11 titular equilibrado (`startingXI`) y formación táctica (`4-3-3` o `4-2-3-1`) para cada club en `src/data/squads/{club}.ts`.
3. **Fotos de Jugadores**: Descarga fotos oficiales desde el CDN de UEFA (`img.uefa.com`), optimizadas con Sharp a formato WebP (300px, 80% calidad) en `public/players/{CLUB}/{dorsal}.webp`.
4. **Entrenadores**: Extrae el DT oficial de cada club con su nacionalidad y foto a `public/coaches/{CLUB}.webp`, actualizando `src/data/coaches/index.ts`.
5. **Escudos Oficiales**: Descarga los logos oficiales de los 36 clubes en alta resolución a `public/assets/crests/{CLUB}.png`.
6. **Manifiestos y Reportes**: Regenera automáticamente los manifiestos `src/data/player-photos.ts` y `src/data/coach-photos.ts`, y audita los huecos en `docs/missing-assets.md`.

---

## Flujo de Trabajo y Comandos

### 1. Ver Estado Actual y Fotos Faltantes

```bash
npm run ucl:report
# o directamente: node scripts/fetch-ucl-squads.mjs --report
```

Genera y muestra `docs/missing-assets.md` con el porcentaje de fotos de jugadores y estado del entrenador para cada uno de los 36 clubes.

### 2. Ingesta de Plantillas (Archivos de Código `.ts`)

Para actualizar o generar los módulos TypeScript de plantilla (`src/data/squads/{club}.ts`) y los registros centrales:

```bash
# Todos los 36 clubes:
npm run ucl:data

# Solo clubes específicos:
node scripts/fetch-ucl-squads.mjs RMA BAR MCI --data
```

### 3. Descarga de Fotos de Jugadores y Técnicos

```bash
# Descargar fotos de un club:
npm run ucl:photos -- RMA

# Varios clubes a la vez:
npm run ucl:photos -- BAR MCI PSG BAY

# Forzar re-descarga y re-optimización:
node scripts/fetch-ucl-squads.mjs RMA --photos --force
```

### 4. Descarga y Verificación de Escudos Oficiales

```bash
# Verificar y descargar los 36 escudos desde UEFA CDN:
npm run ucl:crests

# Solo un club concreto:
node scripts/fetch-ucl-squads.mjs BVB --crests
```

### 5. Ingesta Completa (Data + Fotos + Escudos + Manifiestos)

```bash
# Ejecutar todo para clubes seleccionados:
npm run ucl:squads -- RMA BAR

# O para todos los clubes:
npm run ucl:squads
```

---

## Mapeo de los 36 Clubes UCL

| Código | Club | ID UEFA | Slug UEFA | País |
|---|---|---|---|---|
| **RMA** | Real Madrid CF | `50051` | `real-madrid` | España 🇪🇸 |
| **BAR** | FC Barcelona | `50080` | `barcelona` | España 🇪🇸 |
| **ATL** | Atlético de Madrid | `50124` | `atleti` | España 🇪🇸 |
| **BET** | Real Betis | `52265` | `real-betis` | España 🇪🇸 |
| **VIL** | Villarreal CF | `70691` | `villarreal` | España 🇪🇸 |
| **MCI** | Manchester City | `52919` | `man-city` | Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| **ARS** | Arsenal FC | `52280` | `arsenal` | Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| **LIV** | Liverpool FC | `7889` | `liverpool` | Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| **MUN** | Manchester United | `52682` | `man-utd` | Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| **AVL** | Aston Villa | `52683` | `aston-villa` | Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| **BAY** | Bayern München | `50037` | `bayern-munchen` | Alemania 🇩🇪 |
| **BVB** | Borussia Dortmund | `52758` | `b-dortmund` | Alemania 🇩🇪 |
| **VFB** | VfB Stuttgart | `50107` | `stuttgart` | Alemania 🇩🇪 |
| **RBL** | RB Leipzig | `2603790` | `leipzig` | Alemania 🇩🇪 |
| **INT** | Inter de Milán | `50138` | `inter` | Italia 🇮🇹 |
| **NAP** | SSC Napoli | `50136` | `napoli` | Italia 🇮🇹 |
| **ROM** | AS Roma | `50137` | `roma` | Italia 🇮🇹 |
| **COM** | Como 1907 | `79946` | `como` | Italia 🇮🇹 |
| **PSG** | Paris Saint-Germain | `52747` | `paris` | Francia 🇫🇷 |
| **LIL** | Lille OSC | `75797` | `lille` | Francia 🇫🇷 |
| **RCL** | RC Lens | `52277` | `lens` | Francia 🇫🇷 |
| **SPO** | Sporting CP | `50149` | `sporting-cp` | Portugal 🇵🇹 |
| **FCP** | FC Porto | `50064` | `porto` | Portugal 🇵🇹 |
| **PSV** | PSV Eindhoven | `50062` | `psv` | Países Bajos 🇳🇱 |
| **FEY** | Feyenoord | `52749` | `feyenoord` | Países Bajos 🇳🇱 |
| **BRU** | Club Brugge | `50043` | `club-brugge` | Bélgica 🇧🇪 |
| **GAL** | Galatasaray | `50067` | `galatasaray` | Turquía 🇹🇷 |
| **FEN** | Fenerbahçe | `52692` | `fenerbahce` | Turquía 🇹🇷 |
| **SLP** | Slavia Praha | `52498` | `slavia-praha` | Rep. Checa 🇨🇿 |
| **SHK** | Shakhtar Donetsk | `52707` | `shakhtar` | Ucrania 🇺🇦 |
| **AEK** | AEK Atenas | `50129` | `aek-athens` | Grecia 🇬🇷 |
| **LSK** | LASK Linz | `63405` | `lask` | Austria 🇦🇹 |
| **VIK** | Viking FK | `52319` | `viking` | Noruega 🇳🇴 |
| **BOD** | Bodø/Glimt | `59333` | `bodo-glimt` | Noruega 🇳🇴 |
| **SLO** | Slovan Bratislava | `52797` | `s-bratislava` | Eslovaquia 🇸🇰 |
| **SAB** | Sabah FK | `2609356` | `sabah` | Azerbaiyán 🇦🇿 |

---

## URLs y Estructura de CDN de UEFA.com

- **Página de Plantilla**: `https://www.uefa.com/uefachampionsleague/clubs/{ID}--{SLUG}/squad/`
- **Fotos de Jugadores**: `https://img.uefa.com/imgml/TP/players/1/2027/324x324/{PLAYER_ID}.jpg`
- **Fotos de Técnicos**: `https://img.uefa.com/imgml/TP/players/1/2027/324x324/{COACH_ID}.jpg`
- **Escudos Oficiales**: `https://img.uefa.com/imgml/TP/teams/logos/240x240/{TEAM_ID}.png` (y `700x700`)

---

## Archivos Clave en el Proyecto

| Archivo | Función |
|---|---|
| `scripts/fetch-ucl-squads.mjs` | Script maestro de ingesta, fotos y escudos |
| `src/data/squads/{club}.ts` | Datos individuales de plantilla por club |
| `src/data/squads/index.ts` | Registro central `SQUADS`, `LINEUPS`, `getSquad`, `getLineup` |
| `src/data/coaches/index.ts` | Registro central `COACHES`, `getCoach` |
| `src/data/player-photos.ts` | Manifiesto autogenerado de fotos de jugadores |
| `src/data/coach-photos.ts` | Manifiesto autogenerado de fotos de entrenadores |
| `public/players/{CLUB}/{n}.webp` | Fotos locales optimizadas (300px WebP) |
| `public/coaches/{CLUB}.webp` | Foto local del DT (300px WebP) |
| `public/assets/crests/{CLUB}.png` | Escudo oficial del club |
| `docs/missing-assets.md` | Informe auditado de cobertura |
