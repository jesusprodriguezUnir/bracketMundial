// Ventanas de partidos del torneo a partir del calendario oficial.
// Toda la aritmética es epoch (ms UTC): el resultado es idéntico en cualquier
// timezone del navegador y es inmune a partidos que cruzan medianoche CEST.
// timeSpain es CEST (UTC+2), offset fijo válido durante todo el torneo.

import { COMPETITION } from '../data/competition';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';

export type MatchWindowState = 'live' | 'matchday' | 'idle';

export interface MatchWindowInfo {
  state: MatchWindowState;
  /** ms hasta el inicio de la próxima ventana live (kickoff − 15 min), o null si no quedan partidos. */
  msToNextLiveWindow: number | null;
}

const LIVE_PRE_MS = 15 * 60_000;             // kickoff − 15 min
const LIVE_POST_MS = 3 * 3_600_000;          // kickoff + 3 h (prórroga + penaltis; alineado con el cron servidor)
const LIVE_BADGE_POST_MS = 2 * 3_600_000 + 15 * 60_000; // kickoff + 2h15 (90'+HT+descuento)
const SYNC_PRE_MS = 30 * 60_000;             // cron: kickoff − 30 min
const SYNC_POST_MS = 3 * 3_600_000;          // cron: kickoff + 3 h
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
      ...(COMPETITION.knockoutEnabled
        ? Object.values(KNOCKOUT_SCHEDULE).map(m => kickoffMs(m.date, m.timeSpain))
        : []),
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

/** Partido en juego para badge UI: desde el kickoff hasta 2h15. */
export function isMatchLive(date: string, timeSpain: string, now: Date = new Date()): boolean {
  const k = kickoffMs(date, timeSpain);
  if (!Number.isFinite(k)) return false;
  const t = now.getTime();
  return t >= k && t <= k + LIVE_BADGE_POST_MS;
}

/**
 * Ventana del cron de scores: kickoff − 30 min … kickoff + 3 h.
 * El eje es el kickoff, no "ahora ± ventana" — si no, el segundo tiempo se salta.
 */
export function isWithinScoreSyncWindow(now: Date = new Date()): boolean {
  const t = now.getTime();
  return getAllKickoffsMs().some(k => t >= k - SYNC_PRE_MS && t <= k + SYNC_POST_MS);
}
