import { GROUP_MATCHES, KNOCKOUT_SCHEDULE, type ScheduledKnockoutMatch } from '../data/match-schedule';
import { getKnockoutMatchOrder } from '../store/tournament-store';
// League type imported structurally below — no runtime import needed

const groupDateById = new Map(GROUP_MATCHES.map(m => [m.matchId, m.date]));

export function hasMatchDatePassed(matchId: string, now: Date = new Date()): boolean {
  const groupDate = groupDateById.get(matchId);
  const date = groupDate ?? KNOCKOUT_SCHEDULE[matchId]?.date;
  if (!date) return false;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return date < today;
}

/**
 * Devuelve el conjunto de matchIds cuyos partidos tienen fecha anterior a
 * `league.lockedBeforeDate`. Estos partidos quedan bloqueados para editar
 * y excluidos del scoring cuando la liga se creó con `lockFromToday`.
 */
export function getLeagueLockedMatchIds(league: { lockedBeforeDate?: string }): Set<string> {
  if (!league.lockedBeforeDate) return new Set();
  const cutoff = league.lockedBeforeDate; // YYYY-MM-DD
  const locked = new Set<string>();
  for (const m of GROUP_MATCHES) {
    if (m.date < cutoff) locked.add(m.matchId);
  }
  const koOrder = getKnockoutMatchOrder();
  for (const matchId of koOrder) {
    const d = KNOCKOUT_SCHEDULE[matchId]?.date;
    if (d && d < cutoff) locked.add(matchId);
  }
  return locked;
}

/**
 * Devuelve `true` si un partido es editable en el contexto de la liga dada.
 * Retorna `false` si:
 *   - la liga está congelada (`frozen`)
 *   - el partido está en el conjunto bloqueado por `lockedBeforeDate`
 *   - la fecha del partido ya pasó (igual que el bloqueo global del torneo)
 */
export function isMatchEditableInLeague(
  league: { frozen?: boolean; lockedBeforeDate?: string },
  matchId: string,
  now: Date = new Date(),
): boolean {
  if (league.frozen) return false;
  const locked = getLeagueLockedMatchIds(league);
  if (locked.has(matchId)) return false;
  if (hasMatchDatePassed(matchId, now)) return false;
  return true;
}

export function filterRealByDate<T extends { matchId: string; scoreA: number | null; scoreB: number | null }>(
  scores: readonly T[],
  now: Date = new Date(),
): T[] {
  return scores.map(s => {
    if (hasMatchDatePassed(s.matchId, now)) return s;
    return { ...s, scoreA: null, scoreB: null };
  });
}

export interface MatchFixture {
  matchId: string;
  isGroup: boolean;
  date: string;
  timeSpain: string;
  teamA: string;
  teamB: string;
  venueId: string;
  matchDay?: 1 | 2 | 3;
}

export interface MatchdayInfo {
  label: string;
  lastMatchId: string;
}

export interface UpcomingMatch {
  matchId: string;
  teamA: string;
  teamB: string;
  date: string;
  timeSpain: string;
  venueId: string;
}

const KNOCKOUT_CHRONO: string[] = [];
function ensureKnockoutOrder(): string[] {
  if (KNOCKOUT_CHRONO.length === 0) {
    KNOCKOUT_CHRONO.push(...getKnockoutMatchOrder());
  }
  return KNOCKOUT_CHRONO;
}

let _allFixtures: MatchFixture[] | null = null;

function getAllFixtures(): MatchFixture[] {
  if (_allFixtures) return _allFixtures;

  const fixtures: MatchFixture[] = [];

  for (const gm of GROUP_MATCHES) {
    fixtures.push({
      matchId: gm.matchId,
      isGroup: true,
      date: gm.date,
      timeSpain: gm.timeSpain,
      teamA: gm.teamA,
      teamB: gm.teamB,
      venueId: gm.venueId,
      matchDay: gm.matchDay,
    });
  }

  const koOrder = ensureKnockoutOrder();
  for (const matchId of koOrder) {
    const skm: ScheduledKnockoutMatch | undefined = KNOCKOUT_SCHEDULE[matchId];
    fixtures.push({
      matchId,
      isGroup: false,
      date: skm?.date ?? '2099-01-01',
      timeSpain: skm?.timeSpain ?? '00:00',
      teamA: '',
      teamB: '',
      venueId: skm?.venueId ?? '',
    });
  }

  fixtures.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.timeSpain.localeCompare(b.timeSpain);
  });

  _allFixtures = fixtures;
  return fixtures;
}

export function getCurrentMatchday(
  realGroupScores: readonly { matchId: string; scoreA: number | null; scoreB: number | null }[],
  realKnockoutScores: readonly { matchId: string; scoreA: number | null; scoreB: number | null }[],
): { current: MatchdayInfo | null; next3: UpcomingMatch[] } {
  const playedIds = new Set<string>();
  for (const r of realGroupScores) {
    if (r.scoreA !== null && r.scoreB !== null) playedIds.add(r.matchId);
  }
  for (const r of realKnockoutScores) {
    if (r.scoreA !== null && r.scoreB !== null) playedIds.add(r.matchId);
  }

  const allFixtures = getAllFixtures();

  let lastPlayedFixture: MatchFixture | null = null;
  for (const f of allFixtures) {
    if (playedIds.has(f.matchId)) {
      lastPlayedFixture = f;
    }
  }

  const current: MatchdayInfo | null = lastPlayedFixture
    ? {
        label: lastPlayedFixture.isGroup
          ? `MD${lastPlayedFixture.matchDay ?? 1}`
          : 'KO',
        lastMatchId: lastPlayedFixture.matchId,
      }
    : null;

  const next3: UpcomingMatch[] = [];
  for (const f of allFixtures) {
    if (next3.length >= 3) break;
    if (!playedIds.has(f.matchId)) {
      next3.push({
        matchId: f.matchId,
        teamA: f.teamA,
        teamB: f.teamB,
        date: f.date,
        timeSpain: f.timeSpain,
        venueId: f.venueId,
      });
    }
  }

  return { current, next3 };
}

