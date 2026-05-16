# Instrucciones para agentes

Este repositorio es una PWA de bracket para el Mundial 2026 construida con Lit, TypeScript, Vite y Zustand. Usa [README.md](README.md) para producto y setup general, y [CLAUDE.md](CLAUDE.md) cuando necesites más detalle de arquitectura; aquí deja solo la guía operativa para arrancar rápido.

## Comandos reales

- Instalación: `npm install`
- Desarrollo: `npm run dev`
- Build: `npm run build`
- Vista previa: `npm run preview`
- Tests: `npm test`
- Test focalizado: `npm test -- src/lib/bracket-logic.test.ts`
- Reporte de fotos faltantes: `npm run assets:report` → genera `docs/missing-assets.md`
- Descargar fotos de equipo: `npm run photos -- JOR` (jugadores), `npm run photos -- JOR --type coach`

## Mapa rápido

- [src/main.ts](src/main.ts) solo monta `app-root`.
- [src/app-root.ts](src/app-root.ts) es el shell principal e importa/exporta el torneo.
- [src/bracket-view.ts](src/bracket-view.ts) decide la vista activa y abre el modal de partido.
- [src/components/](src/components/) contiene las vistas y modales UI.
- [src/store/tournament-store.ts](src/store/tournament-store.ts) es la fuente de verdad del estado persistido y de las mutaciones.
- [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) contiene la lógica pura reutilizable del bracket.
- [src/data/fifa-2026.ts](src/data/fifa-2026.ts) define datos estáticos, fixtures base y la estructura del knockout.
- [src/data/squads/](src/data/squads/) — un `.ts` por selección con `Player[]` y `Lineup`. Registro central en `index.ts`.
- [src/data/coaches/index.ts](src/data/coaches/index.ts) — `COACHES: Record<string, Coach>` con name, born, bio y photoUrl.
- [src/lib/player-photo.ts](src/lib/player-photo.ts) y [src/lib/coach-photo.ts](src/lib/coach-photo.ts) — helpers para resolver rutas locales de fotos contra sus manifiestos (`player-photos.ts` / `coach-photos.ts`).
- [scripts/fetch-squad-assets.mjs](scripts/fetch-squad-assets.mjs) — descarga fotos desde API-Football → TheSportsDB → Wikipedia; genera ambos manifiestos. Modos: `--report`, `--type player|coach|all`, `--force`, `--verify-data`.

## Convenciones clave

- Usa Lit con `@customElement` y estilos locales en `static styles`; deja los tokens globales en [src/index.css](src/index.css).
- Para acciones imperativas fuera de render, usa `useTournamentStore.getState()`.
- Los componentes que reflejan estado del store suelen suscribirse en `connectedCallback`, desuscribirse en `disconnectedCallback` y llamar `requestUpdate()` en cada cambio.
- TypeScript es estricto: usa `import type { ... }` para tipos puros y prefija con `_` los parámetros inevitables no usados.
- La UI actual sigue un lenguaje retro tipo álbum Panini desde [src/index.css](src/index.css): papel, colores impresos, sombras duras y esquinas rectas. No reintroduzcas la estética neón anterior salvo que el cambio lo pida.
- El breakpoint móvil relevante está en 768px; revisa layouts estrechos al tocar tabs, modales o superficies del bracket.

## Riesgos activos

- [src/bracket-view.ts](src/bracket-view.ts) guarda la vista activa en estado local; si cambias navegación o tabs, valida que siga re-renderizando y abriendo el modal correcto.
- `importTournament` en [src/store/tournament-store.ts](src/store/tournament-store.ts) valida poco el JSON entrante; no asumas datos externos completos.
- La lógica de mejores terceros existe tanto en [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) como en [src/store/tournament-store.ts](src/store/tournament-store.ts); si cambias reglas, mantén ambas rutas coherentes o consolídalas.
- Los IDs del knockout en [src/data/fifa-2026.ts](src/data/fifa-2026.ts) están acoplados a helpers del store; no renombres ni reordenes cruces sin revisar ambos lados.
- La PWA mantiene service worker activo en desarrollo; si los cambios visuales no aparecen, haz hard reload.
- [src/lib/data-service.ts](src/lib/data-service.ts) y [src/my-element.ts](src/my-element.ts) no parecen parte del flujo principal; confirma uso antes de apoyarte en ellos.
- Firebase Data Connect está configurado a nivel de proyecto, pero no está cableado al frontend actual; no supongas SDK generado ni autenticación activa.

## Cómo trabajar aquí

- Mantén los cambios pequeños y alineados con el estilo existente.
- Enlaza a [README.md](README.md) y a los archivos fuente en vez de copiar documentación.
- Si tocas lógica del torneo, valida con `npm test` o con una ejecución focalizada de Vitest.
- Si tocas UI Lit o reglas del torneo, apóyate en las instrucciones específicas bajo `.github/instructions/` en lugar de repetirlas aquí.