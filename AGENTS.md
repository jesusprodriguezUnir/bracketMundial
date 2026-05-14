# Instrucciones para agentes

Este repositorio es una PWA de bracket para el Mundial 2026 construida con Lit, TypeScript, Vite, Zustand y Firebase Data Connect. Antes de cambiar código, revisa [README.md](README.md) para la guía general y enlaza a esa documentación en lugar de repetirla.

## Comandos reales

- Desarrollo: `npm run dev`
- Build: `npm run build`
- Vista previa: `npm run preview`
- Instalación: `npm install`

No hay script `test` en `package.json`, aunque sí existen pruebas Vitest en `src/lib/bracket-logic.test.ts`.

## Cómo está organizado

- [src/main.ts](src/main.ts) solo arranca la app y monta `app-root`.
- [src/app-root.ts](src/app-root.ts) es el contenedor principal; maneja importación y exportación del torneo.
- [src/bracket-view.ts](src/bracket-view.ts) decide entre fase de grupos y eliminatorias, y abre el modal de partido.
- [src/store/tournament-store.ts](src/store/tournament-store.ts) concentra estado, persistencia y reglas del torneo.
- [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) contiene lógica pura del bracket; mantén ahí el cálculo reutilizable.
- [src/components/](src/components/) agrupa vistas y modales de UI.

## Convenciones que ya usa el repo

- Prefiere Lit con `@customElement` para componentes UI.
- Usa el store con `useTournamentStore.getState()` para acciones puntuales.
- El estilo visual es neón oscuro, con variables CSS globales y superficies translúcidas; conserva ese lenguaje salvo que el cambio pida otra dirección.
- La UI tiene breakpoint explícito para móvil; revisa el comportamiento en pantallas estrechas cuando toques componentes visuales.

## Riesgos a vigilar

- [src/bracket-view.ts](src/bracket-view.ts) mantiene la vista activa en un campo local; si cambias navegación o tabs, verifica que siga re-renderizando correctamente.
- La importación de torneos valida poco el JSON; evita asumir que los datos externos están completos.
- Hay lógica parecida para terceros puestos en [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) y [src/store/tournament-store.ts](src/store/tournament-store.ts); no la dupliques sin necesidad.
- [src/lib/data-service.ts](src/lib/data-service.ts) y [src/my-element.ts](src/my-element.ts) parecen periféricos; no los tomes como ruta principal sin confirmar uso.

## Qué hacer al trabajar aquí

- Mantén los cambios pequeños y alineados con el estilo existente.
- Si necesitas detalles de comportamiento o estructura, enlaza a [README.md](README.md) y a los archivos fuente en vez de copiar documentación.
- Si añades pruebas o tooling, documenta primero el comando nuevo en lugar de asumir que existe.