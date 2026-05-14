---
name: "Tournament Logic Invariants"
description: "Use when editing bracket rules, standings, knockout progression, import/export logic, or FIFA 2026 mappings in src/lib/**/*.ts, src/store/**/*.ts, or src/data/fifa-2026.ts. Covers best-third calculations, bracket IDs, persistence, and focused Vitest validation."
applyTo: ["src/lib/**/*.ts", "src/store/**/*.ts", "src/data/fifa-2026.ts"]
---

# Tournament Logic Invariants

- Trata [src/store/tournament-store.ts](src/store/tournament-store.ts) como fuente de verdad del estado persistido y de las mutaciones del torneo.
- Mantén la lógica pura reutilizable en [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) siempre que no dependa de persistencia o UI.
- La selección de mejores terceros existe tanto en [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts) como en [src/store/tournament-store.ts](src/store/tournament-store.ts); si cambias reglas de selección, desempate u orden, actualiza ambas rutas o consolídalas deliberadamente.
- Los IDs del knockout en [src/data/fifa-2026.ts](src/data/fifa-2026.ts) están acoplados a helpers del store como `getNextMatchId`, `isTeamAPosition` y `getThirdPlaceMatchId`; no los renombres ni reordenes sin revisar ambos lados.
- `importTournament` valida poco el JSON externo; añade defensas para datos parciales en vez de asumir el shape completo.
- Cuando cambies reglas del torneo, valida con Vitest de forma focalizada, por ejemplo con `npm test -- src/lib/bracket-logic.test.ts` o un `npx vitest run ...` equivalente.
- Si el cambio afecta tanto datos estáticos como progresión del bracket, revisa juntos [src/data/fifa-2026.ts](src/data/fifa-2026.ts), [src/store/tournament-store.ts](src/store/tournament-store.ts) y [src/lib/bracket-logic.ts](src/lib/bracket-logic.ts).