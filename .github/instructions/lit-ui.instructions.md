---
name: "Lit UI Patterns"
description: "Use when editing Lit components, tabs, modals, CSS styles, or responsive layout in src/app-root.ts, src/bracket-view.ts, src/components/**/*.ts, or src/index.css. Covers store subscriptions, requestUpdate, and preserving the existing retro visual language."
applyTo: ["src/app-root.ts", "src/bracket-view.ts", "src/components/**/*.ts", "src/index.css"]
---

# Lit UI Patterns

- Usa Lit con `@customElement` y estilos locales en `static styles`; deja tokens globales y patrones compartidos en [src/index.css](src/index.css).
- Cuando un componente refleja estado de Zustand, suscríbete en `connectedCallback`, limpia la suscripción en `disconnectedCallback` y llama `requestUpdate()` al cambiar el store.
- Para acciones imperativas fuera del render, usa `useTournamentStore.getState()` en lugar de pasar callbacks a través de muchos componentes.
- Conserva el lenguaje visual real definido en [src/index.css](src/index.css): papel texturizado, paleta retro impresa, sombras duras offset y esquinas rectas.
- No reintroduzcas la estética neón o dark-mode anterior salvo que la tarea lo pida explícitamente.
- Revisa el breakpoint de 768px cuando toques tabs, modales, tarjetas o superficies del bracket.
- [src/bracket-view.ts](src/bracket-view.ts) mantiene la vista activa en estado local; si cambias navegación o tabs, valida que la vista correcta siga re-renderizando y que el modal continúe abriéndose desde el flujo actual.
- Prefiere cambios pequeños sobre nuevas capas de abstracción; estos componentes ya combinan orquestación y presentación.