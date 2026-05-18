# Progreso — Mejora Móvil App Store

## Estado general: 🟢 Categorías 2 y 3 completadas

Build: ✅ | Tests: ✅ (31/32, 1 fallo preexistente en `bracket-codec`)

---

### Categoría 2: Visualización del Bracket (6/6) ✅

| # | Mejora | Estado | Detalle |
|---|--------|--------|---------|
| 2.1 | Inline mini-steppers en mob-match-card | ✅ | Botones −/+ integrados en cada match card del bracket móvil, con `stopPropagation` para no abrir el modal |
| 2.2 | Mini resumen (fecha, estadio, hora) | ✅ | Nueva fila `.mob-match-venue` bajo cada match card con imagen del estadio, venue, ciudad, fecha y hora |
| 2.3 | Barra 1X2 compacta en match cards | ✅ | Ya existía, se mejoró añadiendo tooltip con fuente (market/estimado) y % numéricos |
| 2.4 | Team picker mejorado | ✅ | Agrupado por Grupo A-L, barra de búsqueda con filtrado, botón limpiar, feedback "SIN RESULTADOS" |
| 2.5 | Reemplazar emoji flags por flagUrl | ✅ | Champion card, path mode hero, team picker, opponent flags: todos usan `<img>` con SVG en vez de emoji |
| 2.6 | Touch momentum scroll | ✅ | Añadido `-webkit-overflow-scrolling: touch` a `.mob-chips` |

### Categoría 3: Ficha de Equipo / Squads (5/5) ✅

| # | Mejora | Estado | Detalle |
|---|--------|--------|---------|
| 3.1 | Tabla como cards apiladas en móvil | ✅ | Nuevas `.mob-player-cards` con avatar, dorsal, nombre, posición, edad y club. La tabla se oculta en móvil |
| 3.2 | Tabs como scroll horizontal | ✅ | `.tabs` ahora es `flex-wrap: nowrap; overflow-x: auto` con chips scrolleables en vez de grid 2x2 |
| 3.3 | Swipe entre equipos | ✅ | Touch handlers con detección de swipe horizontal (>60px) para navegar al equipo anterior/siguiente del grupo |
| 3.4 | Cards de grupo más táctiles | ✅ | Padding y active states mejorados. Flags más grandes (48×32px con border y sombra) |
| 3.5 | Usar flagUrl en lista de grupos | ✅ | `renderFlag()` reemplazado por `<img>` directo con `flagUrl` en team cards y cabecera de detalle |

### Archivos modificados

- `src/components/bracket-knockout.ts` — +130 líneas de CSS y cambios en renderizado
- `src/components/squads-view.ts` — +100 líneas de CSS, swipe handlers, render dual

### Siguientes categorías para continuar

- **Categoría 1**: Navegación Móvil (iconos SVG, bottom sheet "más", transiciones)
- **Categoría 4**: Modal de Partido (drag-to-dismiss, tap targets, orden footer)
- **Categoría 5**: Calidad PWA / iOS (splash screen, skeletons, accesibilidad)
- **Categoría 6**: Micro-interacciones y pulido
