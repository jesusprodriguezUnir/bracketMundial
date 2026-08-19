/** Partido inaugural: 11 jun 2026, 21:00 CEST = 19:00 UTC */
export const KICKOFF_UTC = Date.UTC(2026, 5, 11, 19, 0, 0);

/** Cierre del torneo: final 19 jul 2026 21:00 CEST + 3 h (prórroga/penaltis) = 22:00 UTC */
export const TOURNAMENT_END_UTC = Date.UTC(2026, 6, 19, 22, 0, 0);

export type TournamentPhase = 'countdown' | 'live' | 'archive';

export function getTournamentPhase(now = Date.now()): TournamentPhase {
  if (now < KICKOFF_UTC) return 'countdown';
  if (now < TOURNAMENT_END_UTC) return 'live';
  return 'archive';
}

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getCountdownValues(now = Date.now()): CountdownValues {
  const diff = Math.max(0, KICKOFF_UTC - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}
