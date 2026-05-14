# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev        # Vite dev server en http://localhost:5173 (PWA service worker activo en dev)
npm run build      # tsc && vite build (typecheck estricto antes de empaquetar)
npm run preview    # Sirve el build de producción

# No hay script "test" — usar vitest directamente:
npx vitest                                          # Toda la suite en modo watch
npx vitest run src/lib/bracket-logic.test.ts        # Un archivo específico
npx vitest run -t "best 3rd placed"                 # Un test por nombre
```

## Arquitectura

```
main.ts
  └─ <app-root>          (src/app-root.ts)     shell: topbar + import/export JSON del torneo
       └─ <bracket-view> (src/bracket-view.ts) nav de grupos, fase de grupos + eliminatorias
            ├─ <groups-view>    (src/components/groups-view.ts)
            ├─ <bracket-knockout> (src/components/bracket-knockout.ts)
            └─ <match-modal>   (src/components/match-modal.ts)  inyectado dinámicamente en body
```

**Fuente de verdad única:** `useTournamentStore` en [src/store/tournament-store.ts](src/store/tournament-store.ts) (Zustand + `persist`, clave de localStorage `mundial-2026-tournament`). Los componentes Lit se suscriben en `connectedCallback` y llaman `requestUpdate()` en cada cambio. Para acciones fuera de un componente: `useTournamentStore.getState().accion(args)`.

**Datos estáticos del torneo:** [src/data/fifa-2026.ts](src/data/fifa-2026.ts) — 12 grupos (A–L), 48 equipos, fixtures de grupos generados por `generateGroupMatches()`, y la estructura `KNOCKOUT_BRACKET` con IDs `R32-01…R32-16 → R16-01…R16-08 → QF-01…QF-04 → SF-01, SF-02 → TP-01, FIN-01`. Los mapeos `getNextMatchId` / `isTeamAPosition` / `getThirdPlaceMatchId` dentro del store están acoplados a esos IDs; cambiar la estructura afecta los dos archivos a la vez.

**Lógica pura:** [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) exporta `calculateBestThirds` (selección de 8 mejores terceros por reglas FIFA). El store tiene su propia `getBestThirds` equivalente — si se modifica el algoritmo, mantener ambas coherentes o consolidarlas.

## Convenciones

- **Componentes:** Lit con `@customElement('nombre-kebab')` y `static styles = css\`…\``. Estilos de componente van dentro; lo global en [src/index.css](src/index.css).
- **Paleta visual:** variables `--neon-lime`, `--neon-blue`, `--neon-magenta`, `--navy-*`, `--off-white`, `--text-dim`, `--border-color`. Fuentes: Syne (display) y Epilogue (body). No introducir paletas distintas sin pedirlo.
- **TypeScript estricto:** `noUnusedLocals`, `noUnusedParameters` — el build falla si hay variables o parámetros sin usar. Prefijar con `_` cuando deba existir pero no se use (patrón ya presente: `_get`, `_standings`). `verbatimModuleSyntax: true` requiere `import type { … }` para tipos puros.
- **Breakpoint móvil:** 768px. Revisar layout en pantalla estrecha al tocar componentes visuales.
- **PWA en dev:** el service worker corre con `devOptions.enabled: true`. Si los cambios no se reflejan, hacer hard-reload (Ctrl+Shift+R).

## Áreas frágiles

- `importTournament` valida solo que existan `groupMatches` y `groupStandings`; no asumir esquema externo completo.
- [src/lib/data-service.ts](src/lib/data-service.ts), [src/my-element.ts](src/my-element.ts) y [src/data/tournament.json](src/data/tournament.json) parecen periféricos y sin uso en el flujo principal — no construir sobre ellos sin confirmar.
- Firebase Data Connect ([dataconnect/](dataconnect/)) está configurado (esquema `Team`, `Match`, `UserPrediction`, `BracketNode`) pero **no está integrado al frontend** todavía. El SDK generado iría a `src/generated/` (carpeta inexistente). Las features de autenticación y predicciones del README aún no están cableadas.
- `react` y `@vitejs/plugin-react` están en las dependencias pero la app es Lit. No mezclar sin antes confirmar la dirección.

## Referencias

- [AGENTS.md](AGENTS.md) — guía detallada para agentes con el mismo proyecto.
- [README.md](README.md) — descripción general del producto y tecnologías.
