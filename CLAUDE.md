# CLAUDE.md

Esta guia complementa [AGENTS.md](AGENTS.md). Usa [AGENTS.md](AGENTS.md) como arranque rapido para agentes y [README.md](README.md) para contexto de producto; este archivo conserva el detalle operativo del repo.

## Comandos

```bash
npm install
npm run dev        # Vite dev server en http://localhost:5173
npm run build      # tsc && vite build
npm run preview    # Sirve el build de produccion
npm test           # Vitest en modo run
npm test -- src/lib/bracket-logic.test.ts
npx vitest run -t "best 3rd placed"
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

## Referencias

- [AGENTS.md](AGENTS.md): guia breve para agentes.
- [README.md](README.md): producto, tecnologias y setup.
- `.github/instructions/lit-ui.instructions.md`: reglas especificas para UI con Lit.
- `.github/instructions/tournament-logic.instructions.md`: invariantes de logica del torneo.
