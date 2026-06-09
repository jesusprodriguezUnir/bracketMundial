# Plan: Toggle Predicciones vs Resultados Reales

## Objetivo
Implementar un sistema que permita alternar entre ver los resultados configurados por el usuario (predicciones) y los resultados reales del Mundial 2026, con actualización automática de grupos y bracket en ambos modos.

## Arquitectura

### 1. Estado nuevo en `tournament-store.ts`

```typescript
export type ViewMode = 'predictions' | 'real';

interface TournamentState {
  // ... estado existente ...
  
  viewMode: ViewMode;
  realGroupResults: Record<string, { scoreA: number | null; scoreB: number | null }>;
  realKnockoutResults: Record<string, { 
    scoreA: number | null; 
    scoreB: number | null; 
    penaltyScoreA?: number | null; 
    penaltyScoreB?: number | null 
  }>;
  
  // Nuevas acciones
  setViewMode: (mode: ViewMode) => void;
  setRealGroupResult: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  setRealKnockoutResult: (matchId: string, scoreA: number | null, scoreB: number | null, penaltyScoreA?: number | null, penaltyScoreB?: number | null) => void;
  importRealResults: (results: { group: typeof realGroupResults; knockout: typeof realKnockoutResults }) => void;
}
```

### 2. Lógica de conmutación

**Cuando cambia `viewMode`:**
- Si `mode === 'real'`: reconstruir `groupMatches` y `knockoutMatches` desde `realGroupResults`/`realKnockoutResults`
- Si `mode === 'predictions'`: reconstruir desde `myGroupPredictions`/`myKnockoutPredictions`
- Recalcular `groupStandings` y resolver `knockoutMatches` en ambos casos

**Cuando se edita un resultado:**
- En modo `predictions`: actualizar `myGroupPredictions`/`myKnockoutPredictions` + `groupMatches`/`knockoutMatches` (comportamiento actual)
- En modo `real`: actualizar `realGroupResults`/`realKnockoutResults` + `groupMatches`/`knockoutMatches`

### 3. Modificaciones en `tournament-store.ts`

#### A. Estado inicial (línea ~422)
```typescript
viewMode: 'predictions' as ViewMode,
realGroupResults: {},
realKnockoutResults: {},
```

#### B. Nueva acción `setViewMode` (después de línea ~486)
```typescript
setViewMode: (mode) => {
  set(state => {
    if (state.viewMode === mode) return state;
    
    if (mode === 'real') {
      const matches = state.groupMatches.map(m => {
        const real = state.realGroupResults[m.matchId];
        return real ? { ...m, scoreA: real.scoreA, scoreB: real.scoreB } : { ...m, scoreA: null, scoreB: null };
      });
      const standings = recalculateStandings(matches);
      let knockout = resolveKnockoutMatches(standings, {});
      
      for (const matchId of getKnockoutMatchOrder()) {
        const real = state.realKnockoutResults[matchId];
        const match = knockout[matchId];
        if (!match || !real || real.scoreA === null || real.scoreB === null) continue;
        
        const isDraw = real.scoreA === real.scoreB;
        const psa = isDraw ? real.penaltyScoreA : null;
        const psb = isDraw ? real.penaltyScoreB : null;
        const winnerId = getWinnerId(match.teamA, match.teamB, real.scoreA, real.scoreB, psa, psb);
        knockout = resolveKnockoutMatches(standings, {
          ...knockout,
          [matchId]: { ...match, scoreA: real.scoreA, scoreB: real.scoreB, penaltyScoreA: psa, penaltyScoreB: psb, winnerId, isPlayed: winnerId !== null },
        });
      }
      
      return { viewMode: mode, groupMatches: matches, groupStandings: standings, knockoutMatches: knockout };
    } else {
      const matches = state.groupMatches.map(m => {
        const pred = state.myGroupPredictions[m.matchId];
        return pred ? { ...m, scoreA: pred.scoreA, scoreB: pred.scoreB } : { ...m, scoreA: null, scoreB: null };
      });
      const standings = recalculateStandings(matches);
      let knockout = resolveKnockoutMatches(standings, {});
      
      for (const matchId of getKnockoutMatchOrder()) {
        const pred = state.myKnockoutPredictions[matchId];
        const match = knockout[matchId];
        if (!match || !pred || pred.scoreA === null || pred.scoreB === null) continue;
        
        const isDraw = pred.scoreA === pred.scoreB;
        const psa = isDraw ? pred.penaltyScoreA : null;
        const psb = isDraw ? pred.penaltyScoreB : null;
        const winnerId = getWinnerId(match.teamA, match.teamB, pred.scoreA, pred.scoreB, psa, psb);
        knockout = resolveKnockoutMatches(standings, {
          ...knockout,
          [matchId]: { ...match, scoreA: pred.scoreA, scoreB: pred.scoreB, penaltyScoreA: psa, penaltyScoreB: psb, winnerId, isPlayed: winnerId !== null },
        });
      }
      
      return { viewMode: mode, groupMatches: matches, groupStandings: standings, knockoutMatches: knockout };
    }
  });
},
```

#### C. Nueva acción `setRealGroupResult` (después de `setGroupMatchResult`)
```typescript
setRealGroupResult: (matchId, scoreA, scoreB) => {
  set(state => {
    const realGroupResults = { ...state.realGroupResults, [matchId]: { scoreA, scoreB } };
    
    if (state.viewMode === 'real') {
      const matches = state.groupMatches.map(m =>
        m.matchId === matchId ? { ...m, scoreA, scoreB } : m
      );
      const standings = recalculateStandings(matches);
      return {
        realGroupResults,
        groupMatches: matches,
        groupStandings: standings,
        knockoutMatches: resolveKnockoutMatches(standings, state.knockoutMatches),
      };
    }
    
    return { realGroupResults };
  });
},
```

#### D. Nueva acción `setRealKnockoutResult` (después de `setKnockoutMatchResult`)
```typescript
setRealKnockoutResult: (matchId, scoreA, scoreB, penaltyScoreA = null, penaltyScoreB = null) => {
  set(state => {
    const isDrawAfterRegularTime = scoreA !== null && scoreB !== null && scoreA === scoreB;
    const resolvedPenaltyScoreA = isDrawAfterRegularTime ? penaltyScoreA : null;
    const resolvedPenaltyScoreB = isDrawAfterRegularTime ? penaltyScoreB : null;
    
    const realKnockoutResults = {
      ...state.realKnockoutResults,
      [matchId]: { scoreA, scoreB, penaltyScoreA: resolvedPenaltyScoreA, penaltyScoreB: resolvedPenaltyScoreB },
    };
    
    if (state.viewMode === 'real') {
      const match = state.knockoutMatches[matchId];
      if (!match) return { realKnockoutResults };
      
      const winnerId = getWinnerId(match.teamA, match.teamB, scoreA, scoreB, resolvedPenaltyScoreA, resolvedPenaltyScoreB);
      const isPlayed = winnerId !== null;
      
      const updated = {
        ...state.knockoutMatches,
        [matchId]: {
          ...match,
          scoreA,
          scoreB,
          penaltyScoreA: resolvedPenaltyScoreA,
          penaltyScoreB: resolvedPenaltyScoreB,
          winnerId,
          isPlayed,
        },
      };
      
      return {
        realKnockoutResults,
        knockoutMatches: resolveKnockoutMatches(state.groupStandings, updated),
      };
    }
    
    return { realKnockoutResults };
  });
},
```

#### E. Modificar `setGroupMatchResult` existente (línea ~434)
```typescript
setGroupMatchResult: (matchId, scoreA, scoreB) => {
  set(state => {
    if (state.viewMode === 'real') {
      return state;
    }
    
    const matches = state.groupMatches.map(m =>
      m.matchId === matchId ? { ...m, scoreA, scoreB } : m
    );
    const standings = recalculateStandings(matches);
    
    return {
      groupMatches: matches,
      groupStandings: standings,
      knockoutMatches: resolveKnockoutMatches(standings, state.knockoutMatches),
      myGroupPredictions: { ...state.myGroupPredictions, [matchId]: { scoreA, scoreB } },
    };
  });
},
```

#### F. Modificar `setKnockoutMatchResult` existente (línea ~450)
```typescript
setKnockoutMatchResult: (matchId, scoreA, scoreB, penaltyScoreA = null, penaltyScoreB = null) => {
  set(state => {
    if (state.viewMode === 'real') {
      return state;
    }
    
    const match = state.knockoutMatches[matchId];
    if (!match) return state;
    
    const isDrawAfterRegularTime = scoreA !== null && scoreB !== null && scoreA === scoreB;
    const resolvedPenaltyScoreA = isDrawAfterRegularTime ? penaltyScoreA : null;
    const resolvedPenaltyScoreB = isDrawAfterRegularTime ? penaltyScoreB : null;
    const winnerId = getWinnerId(match.teamA, match.teamB, scoreA, scoreB, resolvedPenaltyScoreA, resolvedPenaltyScoreB);
    const isPlayed = winnerId !== null;
    
    const updated = {
      ...state.knockoutMatches,
      [matchId]: {
        ...match,
        scoreA,
        scoreB,
        penaltyScoreA: resolvedPenaltyScoreA,
        penaltyScoreB: resolvedPenaltyScoreB,
        winnerId,
        isPlayed,
      },
    };
    
    return {
      knockoutMatches: resolveKnockoutMatches(state.groupStandings, updated),
      myKnockoutPredictions: {
        ...state.myKnockoutPredictions,
        [matchId]: { scoreA, scoreB, penaltyScoreA: resolvedPenaltyScoreA, penaltyScoreB: resolvedPenaltyScoreB },
      },
    };
  });
},
```

#### G. Actualizar `resetTournament` (línea ~488)
```typescript
resetTournament: () => set({
  groupMatches: initialGroupMatches,
  groupStandings: createInitialStandings(),
  knockoutMatches: {},
  activePhase: 'groups',
  selectedMatch: null,
  activeContext: { kind: 'personal' } as ActiveContext,
  myGroupPredictions: {},
  myKnockoutPredictions: {},
  myTopScorerPrediction: null,
  myMvpPrediction: null,
  viewMode: 'predictions' as ViewMode,
  realGroupResults: {},
  realKnockoutResults: {},
}),
```

#### H. Actualizar función de persistencia `merge` (línea ~770)
```typescript
merge: (persisted, current) => {
  // ... código existente ...
  
  const viewMode: ViewMode = p.viewMode ?? 'predictions';
  const realGroupResults = p.realGroupResults ?? {};
  const realKnockoutResults = p.realKnockoutResults ?? {};
  
  return { 
    ...current, 
    ...p, 
    groupMatches, 
    groupStandings, 
    knockoutMatches, 
    myGroupPredictions, 
    myKnockoutPredictions, 
    myTopScorerPrediction, 
    myMvpPrediction, 
    activeContext,
    viewMode,
    realGroupResults,
    realKnockoutResults,
  };
},
```

### 4. UI Toggle en `bracket-view.ts`

Añadir un segmented control visible solo en las tabs `groups` y `knockout`:

```typescript
@state() private _viewMode: ViewMode = 'predictions';

connectedCallback() {
  super.connectedCallback();
  // ... código existente ...
  
  this._unsubViewMode = useTournamentStore.subscribe(
    s => s.viewMode,
    (mode) => { this._viewMode = mode; }
  );
}

disconnectedCallback() {
  // ... código existente ...
  this._unsubViewMode?.();
}

private _handleViewModeChange(mode: ViewMode) {
  useTournamentStore.getState().setViewMode(mode);
}
```

En el `render()`, después del context-bar (línea ~908):
```typescript
${(at === 'groups' || at === 'knockout') ? html`
  <div class="view-mode-toggle">
    <button 
      class="view-mode-btn ${this._viewMode === 'predictions' ? 'active' : ''}"
      @click=${() => this._handleViewModeChange('predictions')}>
      🔮 Mis Predicciones
    </button>
    <button 
      class="view-mode-btn ${this._viewMode === 'real' ? 'active' : ''}"
      @click=${() => this._handleViewModeChange('real')}>
      ⚽ Resultados Reales
    </button>
  </div>
` : ''}
```

Estilos CSS:
```css
.view-mode-toggle {
  display: flex;
  gap: 0;
  margin: 16px auto;
  max-width: 400px;
  border: 2px solid var(--ink);
  border-radius: 0;
  overflow: hidden;
  background: var(--paper-2);
}

.view-mode-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ink);
}

.view-mode-btn.active {
  background: var(--retro-yellow);
  box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2);
}

.view-mode-btn:not(.active):hover {
  background: var(--paper-3);
}
```

### 5. Adaptaciones en `groups-view.ts`

#### A. Suscribirse a `viewMode`
```typescript
@state() private _viewMode: ViewMode = 'predictions';

connectedCallback() {
  super.connectedCallback();
  this.unsubscribeStore = subscribeSlice(
    useTournamentStore,
    s => ({ gm: s.groupMatches, gs: s.groupStandings, vm: s.viewMode }),
    () => this.requestUpdate(),
    (a, b) => a.gm === b.gm && a.gs === b.gs && a.vm === b.vm,
  );
  // ... resto del código ...
}
```

#### B. Deshabilitar edición en modo `real` (línea ~759)
```typescript
private adjustInline(e: Event, m: GroupMatchResult, team: 'A' | 'B', delta: number) {
  e.stopPropagation();
  const store = useTournamentStore.getState();
  if (store.viewMode === 'real') return;
  if (!isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
  // ... resto del código ...
}
```

#### C. Mostrar indicador visual en cada partido (línea ~917)
```typescript
const isRealMode = useTournamentStore.getState().viewMode === 'real';
const modeIndicator = isRealMode 
  ? html`<span class="mode-badge real">REAL</span>`
  : html`<span class="mode-badge prediction">PRED</span>`;
```

Estilos CSS:
```css
.mode-badge {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 0;
  border: 1px solid var(--ink);
  margin-left: 8px;
}

.mode-badge.real {
  background: var(--retro-green);
  color: var(--ink);
}

.mode-badge.prediction {
  background: var(--retro-yellow);
  color: var(--ink);
}
```

### 6. Adaptaciones en `bracket-knockout.ts`

Mismo patrón que `groups-view.ts`:

#### A. Suscribirse a `viewMode`
```typescript
@state() private _viewMode: ViewMode = 'predictions';

connectedCallback() {
  super.connectedCallback();
  this.unsubscribeStore = subscribeSlice(
    useTournamentStore,
    s => [
      s.knockoutMatches,
      s.myTopScorerPrediction ? `${s.myTopScorerPrediction.teamId}:${s.myTopScorerPrediction.playerName}` : '',
      s.myMvpPrediction ? `${s.myMvpPrediction.teamId}:${s.myMvpPrediction.playerName}` : '',
      s.viewMode
    ] as const,
    () => this.requestUpdate(),
    (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3],
  );
  // ... resto del código ...
}
```

#### B. Deshabilitar edición en modo `real` (líneas ~1838, ~1854)
```typescript
private adjustInlineKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
  e.stopPropagation();
  const store = useTournamentStore.getState();
  if (store.viewMode === 'real') return;
  // ... resto del código ...
}

private adjustPenaltyKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
  e.stopPropagation();
  const store = useTournamentStore.getState();
  if (store.viewMode === 'real') return;
  // ... resto del código ...
}
```

#### C. Mostrar indicador visual en cada partido (línea ~1869)
Añadir badge similar al de groups-view.

### 7. Integración con sync de resultados reales

Cuando el sistema de `update-results` (API-Football) descargue resultados reales, debe llamar a:
```typescript
useTournamentStore.getState().setRealGroupResult(matchId, scoreA, scoreB);
useTournamentStore.getState().setRealKnockoutResult(matchId, scoreA, scoreB, penA, penB);
```

Esto actualizará automáticamente el bracket si el usuario está en modo `real`.

### 8. Consideraciones adicionales

- **Persistencia**: `realGroupResults` y `realKnockoutResults` se persisten en localStorage junto con el resto del estado
- **Ligas**: El scoring de ligas (`mini-league.ts`) ya compara predicciones vs resultados reales, no necesita cambios
- **Context switching**: El sistema de snapshots existente funciona independientemente del `viewMode`
- **Mobile**: El toggle se adapta correctamente a pantallas estrechas (flex-wrap)

## Archivos a modificar

1. `src/store/tournament-store.ts` - Estado y lógica principal
2. `src/bracket-view.ts` - Toggle UI global
3. `src/components/groups-view.ts` - Indicador de modo + deshabilitar edición
4. `src/components/bracket-knockout.ts` - Indicador de modo + deshabilitar edición

## Testing

- Verificar que el toggle cambia correctamente entre modos
- Verificar que los grupos/bracket se recalculan en ambos modos
- Verificar que la edición está deshabilitada en modo `real`
- Verificar que la persistencia funciona (recargar página mantiene el modo)
- Verificar que el scoring de ligas sigue funcionando
- Ejecutar `npm run build` y `npm test` para validar

## Próximos pasos (fuera de este PR)

- Integrar con el workflow de `update-results` para poblar `realGroupResults`/`realKnockoutResults` automáticamente
- Añadir opción para importar resultados reales desde CSV/JSON
- Mostrar diferencias entre predicción y resultado real (puntos ganados/perdidos)
