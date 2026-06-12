// Ventanas de partidos del torneo a partir del calendario oficial.
// Toda la aritmética es epoch (ms UTC): el resultado es idéntico en cualquier
// timezone del navegador y es inmune a partidos que cruzan medianoche CEST.
// timeSpain es CEST (UTC+2), offset fijo válido durante todo el torneo.

import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';

export type MatchWindowState = 'live' | 'matchday' | 'idle';

export interface MatchWindowInfo {
  state: MatchWindowState;
  /** ms hasta el inicio de la próxima ventana live (kickoff − 15 min), o null si no quedan partidos. */
  msToNextLiveWindow: number | null;
}

const LIVE_PRE_MS = 15 * 60_000;             // kickoff − 15 min
const LIVE_POST_MS = 3 * 3_600_000;          // kickoff + 3 h (prórroga + penaltis; alineado con el cron servidor)
const MATCHDAY_LOOKAHEAD_MS = 8 * 3_600_000; // próximo kickoff a ≤8 h → 'matchday'

/** Kickoff absoluto en ms epoch a partir de fecha + hora CEST. */
export function kickoffMs(date: string, timeSpain: string): number {
  const t = new Date(`${date}T${timeSpain || '00:00'}:00+02:00`).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

let _kickoffs: readonly number[] | null = null;

/** Todos los kickoffs del torneo (grupos + knockout), ordenados ascendente. */
export function getAllKickoffsMs(): readonly number[] {
  if (!_kickoffs) {
    _kickoffs = [
      ...GROUP_MATCHES.map(m => kickoffMs(m.date, m.timeSpain)),
      ...Object.values(KNOCKOUT_SCHEDULE).map(m => kickoffMs(m.date, m.timeSpain)),
    ]
      .filter(t => Number.isFinite(t))
      .sort((a, b) => a - b);
  }
  return _kickoffs;
}

export function getMatchWindowInfo(now: Date = new Date()): MatchWindowInfo {
  const t = now.getTime();
  const kickoffs = getAllKickoffsMs();

  const live = kickoffs.some(k => t >= k - LIVE_PRE_MS && t <= k + LIVE_POST_MS);
  const nextKickoff = kickoffs.find(k => k - LIVE_PRE_MS > t) ?? null;
  const msToNextLiveWindow = nextKickoff === null ? null : nextKickoff - LIVE_PRE_MS - t;

  if (live) return { state: 'live', msToNextLiveWindow };
  if (nextKickoff !== null && nextKickoff - t <= MATCHDAY_LOOKAHEAD_MS) {
    return { state: 'matchday', msToNextLiveWindow };
  }
  return { state: 'idle', msToNextLiveWindow };
}
