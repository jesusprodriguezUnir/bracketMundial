# Skills del repositorio

Este repo ya incluye skills reutilizables bajo `.agents/skills/`. Úsalas solo cuando aporten contexto que no sea obvio desde [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) o el propio código.

## Skills disponibles

| Skill | Úsala cuando | Encaje en este repo |
| --- | --- | --- |
| `accessibility` | Mejoras de accesibilidad, teclado, lectores de pantalla o auditorías WCAG | Alto |
| `frontend-design` | Rediseños, nuevas pantallas o mejoras visuales sustanciales | Alto |
| `typescript-advanced-types` | Tipado avanzado, utilidades de tipos o refactors complejos de TypeScript | Alto |
| `vite` | Cambios en [vite.config.ts](vite.config.ts), PWA o build pipeline | Alto |
| `vitest` | Nuevas pruebas o cambios en la estrategia de validación | Alto |
| `nodejs-best-practices` | Decisiones generales de tooling Node o scripts | Medio |
| `seo` | Metadatos, indexación o visibilidad en buscadores | Medio |
| `composition-patterns` | APIs de componentes escalables en React | Bajo: el proyecto usa Lit, no React |
| `react-best-practices` | Refactors o performance en React/Next | Bajo: evita aplicarla salvo código React nuevo y deliberado |
| `nodejs-backend-patterns` | Crear backend Node o APIs del servidor | Bajo: el frontend actual no usa backend Node propio |

## Criterios de uso

- Si el cambio cae en UI Lit o lógica del torneo, prioriza primero las instrucciones file-scoped en `.github/instructions/`.
- Si una skill describe React, no la extrapoles automáticamente a Lit.
- Si una skill y una instrucción del repo se contradicen, prevalecen las convenciones locales documentadas en [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) y `.github/instructions/`.