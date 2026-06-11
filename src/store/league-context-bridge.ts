/**
 * league-context-bridge.ts
 *
 * Puente sin dependencia circular entre tournament-store y leagues-store.
 * leagues-store registra un getter aquí; tournament-store lo lee.
 * Esto evita la importación directa leagues-store ← tournament-store ← leagues-store.
 */

export interface LeagueBridgeState {
  frozen?: boolean;
  lockedBeforeDate?: string;
}

type LeagueGetter = (leagueId: string) => LeagueBridgeState | null;

let _leagueGetter: LeagueGetter | null = null;

/** Llamado por leagues-store al inicializarse. */
export function registerLeagueGetter(fn: LeagueGetter): void {
  _leagueGetter = fn;
}

/** Llamado por tournament-store en isMatchEditable y guards de frozen. */
export function getLeagueState(leagueId: string): LeagueBridgeState | null {
  return _leagueGetter ? _leagueGetter(leagueId) : null;
}
