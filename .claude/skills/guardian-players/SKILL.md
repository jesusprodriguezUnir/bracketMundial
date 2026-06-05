---
name: guardian-players
description: >
  Actualiza fotos y datos de jugadores del Mundial 2026 desde la guía completa
  del Guardian (1248 jugadores, 48 selecciones). Úsala cuando el usuario pida:
  actualizar jugadores desde el Guardian, fotos y datos de la guía del Guardian,
  sincronizar squads con el player guide, actualizar información de jugadores de
  toda la app, fotos del Guardian, guardian players, player guide, actualizar todo
  desde el Guardian.
---

# Skill: guardian-players

Sincroniza **datos y fotos** de las 48 selecciones con la guía interactiva del Guardian:
`https://www.theguardian.com/football/ng-interactive/2026/jun/04/world-cup-2026-complete-player-guide`

Fuente: JSON público de `interactive.guim.co.uk` (no requiere navegador headless).
Fotos: `media.guim.co.uk` (CDN público, sin autenticación).

---

## Flujo de trabajo

### 1. Resolver equipos

Acepta nombre en español, inglés o código FIFA:

| Alias habitual | Código |
|---|---|
| Holanda / Holland / Netherlands | NED |
| Estados Unidos / EEUU / USA | USA |
| Chequia / Czechia / Czech Republic | CZE |
| Marfil / Ivory Coast | CIV |
| Congo / DR Congo | COD |
| Bosnia / Bosnia-Herzegovina | BIH |
| Corea / Korea | KOR |
| Arabia / Saudi Arabia | KSA |
| Cabo Verde / Cape Verde | CPV |

Sin equipo = todos los 48.

### 2. Dry-run primero (recomendado)

Siempre ejecutar primero con `--dry-run` para revisar los cambios antes de escribir nada:

```bash
# Un equipo
npm run guardian -- ARG --dry-run

# Todos
npm run guardian -- --dry-run
```

El resumen muestra por equipo:
- Jugadores del Guardian (nº total)
- Altas (jugadores nuevos en la plantilla)
- Bajas (jugadores que ya no aparecen)
- Cambios de dorsal en el XI
- Si el capitán se preservó
- Cuántas fotos se descargarían

Revisar especialmente: **altas/bajas de plantilla** (pueden indicar un cambio real o un error de nombre) y **capitán preservado**.

### 3. Ejecución real

```bash
# Datos + fotos de un equipo (por defecto ambas fases)
npm run guardian -- ARG

# Solo datos (reescribir src/data/squads/arg.ts)
npm run guardian -- ARG --data

# Solo biografías (enriquece bio, caps, goals, special sin tocar alineaciones ni dorsales)
npm run guardian -- ARG --bio-only

# Solo fotos (descargar avatares)
npm run guardian -- ARG --photos

# Todos los equipos (solo biografías, recomendada para enriquecimiento seguro)
npm run guardian -- --bio-only
```

**Comportamiento de fotos:**
- Reemplaza **todas** las fotos existentes con las del Guardian para estilo uniforme tipo cromo.
- Salvaguarda: si la descarga falla, conserva la foto anterior (nunca deja un hueco en blanco donde había foto).
- Las fotos se guardan en `public/players/{CODE}/{dorsal}.webp` (300 px ancho, WebP q80).
- Al final regenera automáticamente `src/data/player-photos.ts`.

**Comportamiento de datos (`src/data/squads/*.ts`):**
- Reemplaza `number`, `name`, `position`, `age`, `club` con los datos del Guardian por defecto.
- **Preserva** `captain`, `thesportsdbId`, `photoUrl` del squad anterior (matching por nombre).
- **Reconcilia** `lineup.startingXI` al nuevo dorsal de cada titular (si el dorsal cambia).
- Si un titular ya no está en la plantilla del Guardian → se elimina del XI y se avisa.
- **Modo `--bio-only`**: Utiliza `existing.players` como base de roster y solo enriquece `bio`, `caps`, `goals`, y `special` desde la guía del Guardian si coincide el nombre (umbral `>= 0.6`). No altera alineaciones ni dorsales.

### 4. Validar

```bash
# TypeScript estricto (noUnusedLocals, verbatimModuleSyntax…)
npm run build

# Lógica de bracket y lineup
npm test
```

Si `tsc` falla, revisar `git diff src/data/squads/` para detectar el archivo problemático.

### 5. Revisar fotos manualmente

Leer 2-3 `.webp` del equipo procesado para confirmar calidad (caras nítidas, encuadre correcto):

```
Read public/players/ARG/10.webp   ← Messi
Read public/players/ESP/16.webp   ← Rodri
```

Si alguna foto está mal (recorte errado del Guardian), usa `/player-photos` para ese jugador concreto con otra fuente.

### 6. Reportar

```bash
npm run assets:report
```

Muestra cobertura actualizada (jugadores con foto / total por equipo).

---

## Archivos clave

| Archivo | Propósito |
|---|---|
| `scripts/fetch-guardian-squads.mjs` | Script principal (datos + fotos) |
| `src/data/squads/{team}.ts` | Squad: fuente de verdad de dorsales, nombres, posiciones |
| `src/data/player-photos.ts` | Manifiesto autogenerado — no editar a mano |
| `public/players/{TEAM}/{n}.webp` | Foto del jugador n.º `n` del equipo `TEAM` |

---

## Notas

- **Un equipo antes de los 48.** Valida con ARG (escuadra conocida, capitán Messi fácil de verificar) antes de lanzar la pasada completa. El diff de git permite revertir equipo por equipo.
- **Los datos del Guardian pueden actualizarse** hasta días antes del torneo (es un Google Sheet en vivo). Volver a ejecutar el script para refrescar.
- **Dorsales no son inmutables.** El Guardian usa los dorsales oficiales de cada federación; si difieren de los que tenía la app, el script los actualiza y reconcilia el XI.
- **Si el JSON maestro cambia** (Guardian publica un nuevo atom), actualizar la constante `GUARDIAN_MASTER_ID` en `scripts/fetch-guardian-squads.mjs`, o pasarla como env: `GUARDIAN_MASTER_ID=<nuevo-id> npm run guardian`.
- **Derechos de imagen:** las fotos del Guardian son de uso editorial. Úsalas solo en el contexto de esta app de seguimiento del torneo.
- Para fotos de entrenadores, usa `/coach-photos` (el Guardian no incluye imágenes de DTs).
