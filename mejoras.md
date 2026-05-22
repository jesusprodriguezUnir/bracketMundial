# Plan de Mejoras — Bracket Mundial 2026

> Auditoría técnica y funcional completa del repositorio + web (mayo 2026).  
> Organizado por severidad e impacto. Cada hallazgo incluye archivo y línea.

---

## 1. Crítico — Duplicación masiva de código

### 1.1 `bracket-knockout.ts` (1974 líneas) — monolito con rutas duplicadas
- **Ruta desktop** (`renderMatch`, `_drawConnectors`, SVG inline) y **ruta mobile** (`_renderMobileMatchCard`, `_renderTeamPicker`, path mode) comparten ~80% de lógica de render de partidos pero con CSS y estructuras diferentes.
- **`share-card.ts` (562 líneas)** duplica los IDs de partidos (`r32L`, `r32R`, ...), `ROUND_COLORS`, `renderMatch()` y la lógica de render del árbol del bracket. Es la peor violación DRY del proyecto.
- **Solución:** Extraer `bracket-match` como componente Lit compartido. Separar en 4-5 archivos: `bracket-knockout-desktop.ts`, `bracket-knockout-mobile.ts`, `bracket-knockout-path.ts`, `bracket-knockout-team-picker.ts`, `bracket-match-card.ts`.

### 1.2 Drag-to-dismiss duplicado 6+ veces ✅
Misma lógica `touchstart`/`touchmove`/`touchend` con `deltaY > 120` (o similar) en:
- `auth-modal.ts` — `AuthModal` y `SyncConflictModal`
- `leagues-modal.ts`
- `share-modal.ts`
- `match-modal.ts`
- `player-card.ts`
- **Solución:** Crear mixin `DragToDismiss` o directiva Lit reutilizable.
- **Realizado mayo 2026:** Creado `src/mixins/drag-to-dismiss.ts` con `DragToDismissMixin`. Aplicado a `auth-modal`, `leagues-modal`, `share-modal` y `match-modal`. El mixin expone `_dragThreshold`, `_getDragTarget()`, `_getDragAnimateTarget()`, `_dragCanStart()`, `_onDragMove()`, `_onDragEnd()` y `_dragDismiss()`, permitiendo personalización (ej. `match-modal` usa target interno `.modal`, velocidad y fade de fondo). Se eliminó ~120 líneas de lógica duplicada.

### 1.3 `renderFlag` implementado 5+ veces
- `groups-view.ts`, `bracket-knockout.ts`, `share-card.ts`, `calendar-view.ts`, `player-card.ts`
- Ya existe `src/lib/render-flag.ts` — verificar si está alineado con todos los usos y unificar.

### 1.4 `getInitials` / `normalize` duplicados
- `coaches-view.ts:10-18`, `lineup-view.ts`, `squads-view.ts`
- **Solución:** Mover a `src/lib/text-utils.ts`.

### 1.5 Steppers de score duplicados
- `.inline-stepper` en `groups-view.ts` vs `.ko-stepper` en `bracket-knockout.ts`
- HTML y comportamiento casi idénticos, CSS diferente.
- **Solución:** Componente `<score-stepper>` reutilizable.
- **Realizado mayo 2026:** Creado `src/components/score-stepper.ts` con variantes `inline`, `compact` y `mobile`. Integrado en `groups-view.ts` y `bracket-knockout.ts` para unificar interacción, estilos base y eventos `step-change`.

### 1.6 Barra de odds/probabilidad duplicada
- `groups-view.ts:650-675`, `bracket-knockout.ts:1377-1387`, `match-modal.ts:924`
- **Solución:** Componente `<odds-bar>` compartido.
- **Realizado mayo 2026:** Creado `src/components/odds-bar.ts` con variantes `default`, `compact` y `large`. Integrado en `groups-view.ts`, `bracket-knockout.ts` y `match-modal.ts` para unificar la visualización 1X2.

### 1.7 Photo fallback chain duplicado
- `coaches-view.ts:523-527`, `squads-view.ts`, `player-card.ts:40-73`, `lineup-view.ts:261-264`
- **Solución:** Función `resolvePhoto(player, teamId)` en `src/lib/player-photo.ts`.
- **Realizado mayo 2026:** Añadidos `resolvePlayerPhoto()` en `src/lib/player-photo.ts` y `resolveCoachPhoto()` en `src/lib/coach-photo.ts`. Integrados en `squads-view.ts`, `coaches-view.ts`, `lineup-view.ts` y `player-card.ts` para priorizar foto local y caer a remota solo cuando falta el asset local.

---

## 2. Alto — Arquitectura y estado

### 2.1 3 interfaces distintas para `GroupMatch`
- `src/data/types/index.ts` → `{ id, group, teamA, teamB, scoreA, scoreB, matchDay, date, venue, city }`
- `src/data/match-schedule.ts` → `{ matchId, group, teamA, teamB, matchDay, date, timeSpain, venueId }`
- `src/data/fifa-2026.ts` → `generateGroupMatches()` mezcla ambos con `matchId` e `id` duplicados
- **Solución:** Unificar en una interfaz canónica en `src/types/index.ts` y derivar las demás con `Pick`/`Omit`.

### 2.2 Lógica de best-thirds duplicada store vs lib
- `tournament-store.ts:155` → `mapThirds()` + `getBestThirds()`
- `bracket-logic.ts:130` → `syncKnockoutBracket()` recalcula sus propios best-thirds internamente
- Ambas rutas usan actualmente los mismos datos (`state.groupStandings`), pero pueden divergir.
- **Solución:** `syncKnockoutBracket` debe recibir best-thirds precomputados como parámetro.

### 2.3 Dependencia circular conceptual auth ↔ leagues
- `leagues-store.ts` llama `useAuthStore.getState().session` en cada acción (8 sitios)
- `auth-store.ts:90-91` importa dinámicamente acciones de `leagues-store`
- **Solución:** Inyectar sesión como parámetro en las acciones de leagues, o usar pub/sub.

### 2.4 Recalculo completo en cada cambio de score
- `setGroupMatchResult` (`tournament-store.ts:271-283`) recalcula los 12 grupos + el bracket entero (backtracking incluido) por cada gol. Escala O(n×m).
- `applySharedBracket` sí lo hace correctamente (una sola pasada tras cargar todos los scores).
- **Solución:** `recalculateStandings` debería aceptar solo el grupo cambiado; `resolveKnockoutMatches` podría memoizarse.

### 2.5 `_standings` parámetro muerto
- `recalculateStandings(matches, _standings?)` (`tournament-store.ts:112`) acepta pero ignora `_standings`.
- **Solución:** Eliminar el parámetro o usarlo como base para recálculo incremental.

### 2.6 `activePhase` almacenado pero sin efecto en UI
- Persistido y exportado, pero `bracket-view.ts` gestiona su propio `_activeTab` local.
- Nunca leído por ningún componente para decidir qué mostrar.
- **Solución:** Eliminar del store o hacer que derive la navegación automáticamente.

### 2.7 `hero-view` no se suscribe al store
- `hero-view.ts:372-399` llama `useTournamentStore.getState()` en `render()` pero no tiene `subscribeSlice` en `connectedCallback`.
- Resultado: ticker de resultados y flag `hasPlayed` siempre muestran datos del primer render.
- **Solución:** Añadir suscripción o documentar que es intencionalmente estático.

---

## 3. Medio — Componentes y UI

### 3.1 `match-modal.ts` (1025 líneas) — complejidad alta
- Incluye drag-to-dismiss, focus trapping, score animation, penalty UI, odds bar, todo inline.
- Props pasadas con `as any` desde `bracket-knockout.ts:1233`.
- **Solución:** Extraer subcomponentes (`<score-editor>`, `<penalty-editor>`, `<odds-display>`).

### 3.2 `share-card.ts` no usa CSS custom properties ✅
- Todos los colores hardcodeados (`#ecdfc0`, `#1a1933`, `#e8541f`, ...) en lugar de `var(--retro-*)`.
- Familias tipográficas hardcodeadas en lugar de `var(--font-var)`.
- Diseñado para captura de imagen (aislado), pero el acoplamiento con la paleta del proyecto es frágil.
- **Solución:** Usar custom properties también en share-card; si se renderiza off-screen, las hereda del `:root`.
- **Realizado mayo 2026:** Todos los colores (`#ecdfc0`, `#1a1933`, `#e8541f`, `#c41e2c`, `#1f6b3a`, `#22418c`, `#f0b021`, `#7a6f54`, `#e6d6b1`) reemplazados por `var(--paper)`, `var(--ink)`, `var(--retro-orange)`, `var(--retro-red)`, `var(--retro-green)`, `var(--retro-blue)`, `var(--retro-yellow)`, `var(--dim)`, `var(--paper-2)`. Familias tipográficas reemplazadas por `var(--font-var)`, `var(--font-mono)`, `var(--font-body)`. Texturas radiales con `rgba()` convertidas a `color-mix(in srgb, var(--*) X%, transparent)` y `var(--halftone)`/`var(--halftone-soft)`. `ROUND_COLORS` también actualizado.

### 3.3 `logo-crest.ts` — IDs SVG colisionan
- `logo-crest.ts:67,70` usa `id="cs-${this.mode}"` y `id="cc-${this.mode}"`.
- Si hay múltiples instancias con el mismo `mode`, los IDs SVG colisionan.
- **Solución:** Usar contador incremental o `crypto.randomUUID()` por instancia.

### 3.4 `ad-block.ts` — credenciales hardcodeadas
- `ca-pub-8196395794772309` y `5275853927` en `ad-block.ts:32-33`.
- `try/catch` vacío en `adsbygoogle.push()` oculta errores reales.
- **Solución:** Mover a variables de entorno o configuración externa.

### 3.5 Modal opening patterns inconsistentes
- `groups-view.ts` despacha `CustomEvent('open-match')`.
- `bracket-knockout.ts` crea el modal directamente con `document.createElement('match-modal')`.
- `calendar-view.ts` también crea el modal directamente.
- **Solución:** Unificar con un servicio `ModalService` o evento global.

### 3.6 `calendar-view.ts` — timezone hardcodeado
- `buildGCalUrl()` (`calendar-view.ts:482-497`) asume CEST (UTC+2) restando 2 horas.
- Los partidos en México/Canadá tienen UTC-5/-6.
- **Solución:** Usar el campo `timezone` del estadio desde `stadiums.ts`.

---

## 4. Medio — Accesibilidad (A11y)

### 4.1 Bracket knockout sin alternativa textual ✅
- SVG connectors con `aria-hidden="true"` pero sin descripción del árbol de eliminatorias.
- **Solución:** Añadir `aria-label` descriptivo en el contenedor o texto alternativo oculto.
- **Realizado mayo 2026:** `bracket-knockout.ts` ahora expone un resumen textual oculto con los cruces, equipos, marcadores y penaltis mediante `aria-describedby`, manteniendo los conectores SVG con `aria-hidden="true"`.

### 4.2 Match items en groups-view no son focusables **✓ CORREGIDO**
- `groups-view.ts` — `div` con `@click` pero sin `role="button"` ni `tabindex`.
- **Solución:** Añadir `role="button"`, `tabindex="0"`, handler de teclado. ✓ Añadido.

### 4.3 Team picker sin atributos ARIA ✅
- `bracket-knockout.ts` — overlay del team picker sin `aria-expanded`/`aria-controls`.
- **Solución:** Añadir atributos ARIA al botón toggle y al panel.
- **Realizado mayo 2026:** Botón `.mob-hero-change` ahora tiene `aria-expanded="${this._showTeamPicker}"` y `aria-controls="team-picker-panel"`. El panel `.mob-picker-sheet` tiene `id="team-picker-panel"`, `role="dialog"` y `aria-modal="true"`.

### 4.4 Textos hardcodeados en español (12+ ocurrencias)
- `match-modal.ts:924` → "Probabilidad 1X2"
- `player-card.ts:81-87` → etiquetas de posición
- `player-card.ts:16-20` → "Derecho"/"Izquierdo"
- `coaches-view.ts:502` → "SIN RESULTADOS"
- `player-card.ts` → "← Cerrar"
- **Solución:** Migrar a claves `t()` del sistema i18n.

### 4.5 `lineup-view.ts` — campo de fútbol sin alternativa textual ✅
- Puramente visual, sin `aria-label` ni descripción para lectores de pantalla.
- **Solución:** Añadir `aria-label="Formación ${lineup.formation}"` y roles adecuados.
- **Realizado mayo 2026:** `lineup-view.ts` ahora marca el campo como `role="img"` y genera un `aria-label` con la formación y la distribución nominal por líneas.

### 4.6 `player-card.ts` — `rel="noopener"` faltante en link de Twitter
- `player-card.ts:349` — link de Twitter sin `rel="noopener noreferrer"`.
- **Solución:** Añadir atributo de seguridad.

---

## 5. Medio — TypeScript y tipos

### 5.1 Sentinel strings en lugar de enums
- `player-card.ts:27` → `_detail: PlayerDetail | null | 'loading'`
- **Solución:** Usar `{ status: 'idle' | 'loading' | 'loaded' | 'error'; data: PlayerDetail | null }`.

### 5.2 Type assertions inseguras
- `odds-service.ts` → `TEAM_STRENGTH[teamA as keyof typeof TEAM_STRENGTH]` con fallback 1500.
- `bracket-knockout.ts:1233` → `(modal as any).venue` para props no declaradas.
- **Solución:** Declarar `@property()` en `match-modal` o usar `setProperty()`.

### 5.3 Archivos TypeScript no utilizados
- `src/lib/data-service.ts` — no importado en ningún sitio.
- `src/my-element.ts` — no importado en ningún sitio.
- **Solución:** Eliminar o documentar propósito futuro.

---

## 6. Medio — Seguridad

### 6.1 `innerHTML` para SVG en bracket-knockout
- `bracket-knockout.ts:1133-1186` → `svg.innerHTML = regular + champ`.
- Si los datos de partido contuvieran strings no escapados, hay riesgo XSS.
- **Solución:** Usar `lit` `svg` template literal o sanitizar.
- **Realizado mayo 2026:** `bracket-knockout.ts` ya no escribe conectores con `svg.innerHTML`. Ahora calcula los paths en estado y los renderiza declarativamente dentro del `<svg>` con Lit, manteniendo el mismo trazado visual sin escritura HTML imperativa.

### 6.2 `importTournament` sin validación estructural **✓ CORREGIDO**
- `tournament-store.ts:451-476` — solo verifica `if (parsed.groupMatches)`.
- Sin validar `Array.isArray`, `matchId` válido, rangos de score, `activePhase` enum.
- **Solución:** Añadir validación con schema (Zod o manual). ✓ Validación manual añadida: verifica Array, matchId string, scores numéricos, knockoutMatches objeto, activePhase enum.

---

## 7. Bajo — Bugs y edge cases

### 7.1 Fair-play sort potencialmente invertido **✓ CORREGIDO**
- `bracket-logic.ts:58` → `b.fairPlay - a.fairPlay` ordena descendente.
- Si `fairPlay` son puntos de penalización positivos, el equipo con MÁS tarjetas queda mejor rankeado.
- El test usa `fairPlay: -1` (valores negativos), lo que invierte la semántica y enmascara el bug.
- **Solución:** Clarificar convención (negativo = penalización) y documentar, o invertir sort. ✓ Corregido: sort cambiado a `a.fairPlay - b.fairPlay` (ascendente, menos = mejor). Convención documentada: valores positivos = más penalizaciones. Test actualizado con `fairPlay: 1`.

### 7.2 Scores capados a 14 en formato compacto
- `bracket-codec.ts` → `Math.min(m.scoreA, 14)` trunca scores ≥15.
- **Solución:** Documentar como limitación conocida o ampliar a 5 bits.

### 7.3 `decodeBracketCompact` demasiado estricto con draws
- `bracket-codec.ts:157` → `return null` si falta un byte de penaltis. Podría intentar recuperación parcial.
- **Solución:** Loguear warning y continuar con draw sin penaltis.

### 7.4 `setKnockoutMatchResult` silencia no-ops
- `tournament-store.ts:293` → `return state` (mismo objeto) cuando `matchId` no existe.
- El caller no sabe que la operación falló.
- **Solución:** Loguear warning o devolver `false`.

### 7.5 `leagues-modal` — estado de loading duplicado
- `leagues-modal.ts:28` → `_leaderboardLoading` booleano manual vs `status` del store.
- **Solución:** Usar solo el `status` del store.

### 7.6 `leagues-modal` — error no se limpia al cambiar de vista
- `leagues-modal.ts` → `_error` persiste al navegar entre sub-vistas.
- **Solución:** Limpiar `_error` en cada transición de `_view`.

### 7.7 `calendar-view.ts` — knockout teams ocultos hasta `isPlayed`
- `calendar-view.ts:432-433` → `teamA`/`teamB` = `null` para partidos KO no jugados.
- Impide ver el seeding del bracket en el calendario.
- Puede ser intencional (anti-spoiler), pero limita la funcionalidad.

### 7.8 `auth-modal.ts` — Promise sin resolver si se cierra sin elegir
- `auth-modal.ts:450-452` → patrón `setResolve(fn)`. Si el modal se cierra sin resolver, la Promise queda colgada (memory leak).
- **Solución:** Resolver con `reject` o valor por defecto en `disconnectedCallback`.

---

## 8. Bajo — CSS y estilos

### 8.1 Estilos inline inconsistentes
- `bracket-knockout.ts:1377-1387` → CSS inline para venues en lugar de clases.
- **Solución:** Mover a `static styles`.

### 8.2 `lineup-view` — fila GK acoplada por índice
- `lineup-view.ts:143-146` → `row-0` recibe estilo especial (fondo amarillo) asumiendo que el GK está en la fila 0.
- Si la formación no empieza con GK, el estilo se aplica incorrectamente.
- **Solución:** Detectar por posición (`player.position === 'GK'`) en lugar de índice.

### 8.3 `broadcasting-view` — `formatDate` con locale hardcodeado
- `broadcasting-view.ts:215-218` → `toLocaleDateString('es-ES', ...)`.
- Inconsistente con el sistema i18n del resto de la app.
- **Solución:** Usar `useLocaleStore.getState().locale`.

---

## 9. Bajo — Datos

### 9.1 USA sin noticias (país anfitrión)
- `src/data/news/seed.ts` → arrays `es` y `en` vacíos para USA.
- **Solución:** Regenerar seed de noticias con cobertura del anfitrión.

### 9.2 Equipos sin noticias en inglés
- RSA, BIH, PAR, AUS, TUR, ECU: solo headlines en español.
- **Solución:** Completar cobertura bilingüe.

### 9.3 Horarios no estándar en fixtures
- M29: `02:30` (Brasil vs Haití), M71/M72: `01:30`.
- **Solución:** Verificar contra calendario oficial FIFA.

---

## 10. Bajo — Rendimiento y DX

### 10.1 `setLocale` con efecto secundario impuro
- `src/i18n/index.ts:19-21` → `document.documentElement.lang = locale` dentro del setter de Zustand.
- **Solución:** Mover a `subscribe` del store (ya existe en `main.ts:18-22`).

### 10.2 Sin lazy loading de componentes
- Todos los componentes se importan en `app-root.ts` (18 imports estáticos).
- **Solución:** Cargar bajo demanda vistas secundarias (stadiums, coaches, broadcasting).

### 10.3 Sin estados de carga (loading skeletons)
- `hero-view`, `groups-view`, `bracket-knockout`, `calendar-view` no muestran spinners/skeletons mientras los odds se cargan asíncronamente.
- **Solución:** Añadir `<loading-skeleton>` o estilos de placeholder.

### 10.4 Sin estados de error
- Si `odds-service.ts` o `news-service.ts` fallan, el fallback al seed es silencioso.
- No se informa al usuario si los datos están desactualizados.
- **Solución:** Añadir banner "Usando datos offline" cuando se usa el seed.

### 10.5 `ResizeObserver` + `MediaQueryList` ambos activos en bracket-knockout
- `bracket-knockout.ts:1099-1131` → dos detectores para el mismo propósito (redibujar conectores).
- Flags `_desktopInited` / `_centerDone` añaden complejidad.
- **Solución:** Consolidar en un solo mecanismo.

### 10.6 Tests insuficientes
- Solo 4 archivos de test: `bracket-logic.test.ts`, `bracket-codec.test.ts`, `scoring.test.ts`, `excel-service.test.ts`.
- Sin tests de componentes Lit, store, o integración.
- **Solución:** Añadir tests con `@open-wc/testing` para componentes clave y tests de integración para el store.

---

## 11. Funcionalidad — Web pública (https://bracketmundial.com)

> No se pudo acceder a la web en vivo (error de transporte). Recomendaciones basadas en el código:

### 11.1 Verificar funcionamiento offline
- La PWA tiene service worker con `registerType: 'autoUpdate'`.
- Probar: desconectar red, recargar, verificar que vistas principales cargan.

### 11.2 Verificar SEO estático
- `scripts/generate-pages.mjs` genera landings estáticas para crawlers.
- Probar con herramienta de rich snippets / Google Search Console.

### 11.3 Verificar métricas Core Web Vitals
- `@vercel/analytics` y `@vercel/speed-insights` incluidos.
- Revisar dashboard de Vercel para LCP, FCP, TBT, CLS.

### 11.4 Verificar Capacitor (Android/iOS)
- Config presente en `package.json` con scripts `cap:sync`, `android`, `ios`.
- Probar build nativo y verificar status bar / splash screen.

### 11.5 Compartir bracket (URL hash)
- `encodeBracketCompact` genera hash `#b2=`.
- Probar en dispositivos móviles que la URL se comparte correctamente (límite de caracteres en algunas apps).

---

## 12. Quick wins (bajo esfuerzo, alto impacto) **✓ COMPLETADO**

| # | Acción | Esfuerzo | Impacto | Estado |
|---|--------|----------|---------|--------|
| 1 | Eliminar `src/lib/data-service.ts` y `src/my-element.ts` | 5 min | Limpieza | ✓ (ya no existían) |
| 2 | Migrar textos hardcodeados a `t()` (12+ sitios) | 2 h | i18n completo | ✓ |
| 3 | Extraer `getInitials` y `normalize` a `src/lib/text-utils.ts` | 30 min | DRY | ✓ |
| 4 | Unificar `renderFlag` en `src/lib/render-flag.ts` | 1 h | DRY | ✓ |
| 5 | Añadir `role="button"` y `tabindex` a matches en groups-view | 15 min | A11y | ✓ |
| 6 | Mover `document.documentElement.lang` fuera de `setLocale` | 10 min | Pureza | ✓ |
| 7 | Limpiar `_error` al cambiar de vista en leagues-modal | 10 min | UX | ✓ |
| 8 | Arreglar IDs SVG colisionantes en logo-crest | 15 min | Bug | ✓ |
| 9 | Eliminar parámetro `_standings` muerto en `recalculateStandings` | 5 min | Limpieza | ✓ |
| 10 | Añadir `rel="noopener"` al link de Twitter en player-card | 2 min | Seguridad | ✓ |

---

## 13. Priorización sugerida

1. **Sprint 1 — Estabilización** ✓ **COMPLETADO**: Quick wins + arreglar fair-play sort + validación import + textos hardcodeados.
2. **Sprint 2 — Refactor componentes:** Extraer `bracket-match`, `score-stepper`, `odds-bar`, `drag-to-dismiss` mixin.
3. **Sprint 3 — Refactor bracket:** Dividir `bracket-knockout.ts` en 4-5 archivos. Unificar `share-card` con el nuevo `bracket-match`.
4. **Sprint 4 — Arquitectura:** Unificar interfaces `GroupMatch`, consolidar best-thirds, romper dependencia circular auth↔leagues.
5. **Sprint 5 — A11y y UX:** Alternativas textuales, focus management, loading skeletons, estados de error.
6. **Sprint 6 — Testing y rendimiento:** Tests de componentes Lit, lazy loading, code splitting, auditoría Lighthouse.

---

## 14. Lista de trabajo priorizada por sprint y esfuerzo

> Reordenada tras contrastar el plan con el código real. Se prioriza ROI: impacto alto, riesgo bajo, esfuerzo bajo/medio.

### Sprint 2A — ROI inmediato (esta semana)

| Prioridad | Mejora | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|
| P1 | Corregir export a Google Calendar con timezone explícito por sede | 1-2 h | Alto | ▶ En curso |
| P1 | Suscribir `hero-view` al store para evitar ticker obsoleto | 20-30 min | Alto | ▶ En curso |
| P1 | Unificar apertura de `match-modal` con helper compartido | 1-2 h | Alto | ▶ En curso |
| P2 | Añadir alternativa textual al árbol de knockout | 30-45 min | Alto | Pendiente |
| P2 | Añadir `aria-label` al campo táctico en `lineup-view` | 15-30 min | Medio | Pendiente |

### Sprint 2B — ROI alto con refactor acotado

| Prioridad | Mejora | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|
| P1 | Extraer `<score-stepper>` desde groups/knockout | 3-5 h | Alto | Hecho |
| P1 | Extraer `<odds-bar>` reutilizable | 3-5 h | Alto | Hecho |
| P2 | Consolidar fallback de foto en helper común | 2-3 h | Medio | Hecho |
| P2 | Reemplazar `svg.innerHTML` por render seguro | 1-2 h | Medio | Hecho |
| P2 | Resolver `auth-modal` promise colgada al cerrar | 30-45 min | Medio | Pendiente |

### Sprint 3 — Refactor del bracket

| Prioridad | Mejora | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|
| P1 | Extraer `bracket-match-card` compartido | 6-8 h | Muy alto | Pendiente |
| P1 | Separar desktop/mobile/path/team-picker en archivos dedicados | 12-16 h | Muy alto | Pendiente |
| P1 | Reusar la nueva pieza en `share-card.ts` | 4-6 h | Alto | Pendiente |

### Sprint 4 — Arquitectura y estado

| Prioridad | Mejora | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|
| P1 | Consolidar best-thirds en una sola ruta | 3-4 h | Alto | Pendiente |
| P1 | Reducir recálculo completo en `setGroupMatchResult` | 5-8 h | Alto | Pendiente |
| P2 | Unificar la interfaz canónica de `GroupMatch` | 3-5 h | Medio | Pendiente |
| P2 | Romper dependencia conceptual auth↔leagues | 4-6 h | Medio | Pendiente |
| P3 | Revisar `activePhase` y eliminarlo o conectarlo a navegación real | 1-2 h | Medio | Pendiente |

### Sprint 5 — UX, feedback y datos

| Prioridad | Mejora | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|
| P1 | Banner de "datos offline" cuando odds/news usan seed | 2-3 h | Alto | Pendiente |
| P2 | Skeletons para odds/news en vistas principales | 3-5 h | Medio | Pendiente |
| P2 | Completar noticias EN faltantes y USA anfitrión | 1-2 h | Medio | Pendiente |
| P3 | Revisar teams KO ocultos en calendario antes de jugarse | 1 h | Medio | Pendiente |

### Sprint 6 — Calidad y cobertura

| Prioridad | Mejora | Esfuerzo | Impacto | Estado |
|---|---|---|---|---|
| P1 | Tests del store para standings + knockout progression | 4-6 h | Alto | Pendiente |
| P2 | Tests de componentes Lit clave | 6-10 h | Alto | Pendiente |
| P3 | Auditoría final de rendimiento y Lighthouse | 2-4 h | Medio | Pendiente |

### Próximas 3 tareas recomendadas

1. **Cerrar Sprint 2A**: timezone calendar + hero reactive + helper de modal.
2. **Extraer reutilizables pequeños**: `score-stepper` y `odds-bar` antes del refactor grande del bracket.
3. **Entrar al bracket monolítico** solo cuando la superficie compartida ya exista.
