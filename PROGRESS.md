# Progreso — Mejora Móvil App Store

## Estado general: 🟢 Categorías 1, 2 y 3 completadas

Build: ✅ | Tests: ✅ (31/32, 1 fallo preexistente en `bracket-codec`)

---

### Categoría 1: Navegación Móvil (4/4) ✅

| # | Mejora | Estado | Detalle |
|---|--------|--------|---------|
| 1.1 | Iconos SVG en vez de emojis | ✅ | 4 iconos SVG inline (casa, fútbol, trofeo, personas) + 3 del menú "más" (calendario, estadio, board). Usan `currentColor` para heredar del nav |
| 1.2 | Menú "más" como bottom sheet | ✅ | Slide-up desde abajo con backdrop oscuro, cabecera con título + botón cerrar, items con iconos SVG, `max-height: 50vh` con scroll |
| 1.3 | Transición fadeSlideIn entre vistas | ✅ | `animation: viewFadeIn 0.2s ease` al cambiar de tab. Keyframe con opacity + translateY(6px→0) |
| 1.4 | Swipe-back desde borde izquierdo | ✅ | Detecta swipe desde <32px del borde izquierdo hacia la derecha → navega a la pestaña anterior del historial |

### Categoría 2: Visualización del Bracket (6/6) ✅

| # | Mejora | Estado | Detalle |
|---|--------|--------|---------|
| 2.1 | Inline mini-steppers en mob-match-card | ✅ | Botones −/+ integrados en cada match card del bracket móvil |
| 2.2 | Mini resumen (fecha, estadio, hora) | ✅ | Nueva fila `.mob-match-venue` bajo cada match card |
| 2.3 | Barra 1X2 compacta en match cards | ✅ | Tooltip mejorado y % numéricos visibles |
| 2.4 | Team picker mejorado: agrupar + buscar | ✅ | Agrupado por Grupo A-L, barra de búsqueda con filtrado |
| 2.5 | Reemplazar emoji flags por flagUrl | ✅ | Champion card, path mode, team picker, opponent flags |
| 2.6 | Touch momentum scroll en chips de ronda | ✅ | `-webkit-overflow-scrolling: touch` |

### Categoría 3: Ficha de Equipo / Squads (5/5) ✅

| # | Mejora | Estado | Detalle |
|---|--------|--------|---------|
| 3.1 | Tabla de jugadores como cards apiladas | ✅ | Foto, dorsal, nombre, posición, edad, club en cards |
| 3.2 | Tabs como scroll horizontal de chips | ✅ | `flex-wrap: nowrap; overflow-x: auto` |
| 3.3 | Swipe entre equipos en vista detalle | ✅ | Swipe horizontal >60px navega al equipo anterior/siguiente del grupo |
| 3.4 | Cards de grupo más táctiles | ✅ | Flags más grandes (48×32px), `:active` states |
| 3.5 | Usar flagUrl en lista de grupos | ✅ | Imágenes SVG directas en vez de `renderFlag()` |

### Archivos modificados

- `src/bracket-view.ts` — Iconos SVG, bottom sheet, transiciones, swipe-back
- `src/components/bracket-knockout.ts` — Steppers, venue info, team picker, flags
- `src/components/squads-view.ts` — Player cards, tabs horizontales, swipe, flags

### Siguientes categorías para continuar

- **Categoría 4**: Modal de Partido (drag-to-dismiss, tap targets, orden footer)
- **Categoría 5**: Calidad PWA / iOS (splash screen, skeletons, accesibilidad)
- **Categoría 6**: Micro-interacciones y pulido
