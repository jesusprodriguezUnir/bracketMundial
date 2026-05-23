import { GROUP_MATCHES, KNOCKOUT_SCHEDULE, type ScheduledKnockoutMatch } from '../data/match-schedule';
import { getKnockoutMatchOrder } from '../store/tournament-store';
import type { ParticipantScore } from './mini-league';
import type { DecodedBracket } from './bracket-codec';
import { TEAM_STRENGTH } from '../data/team-strength';
import { ODDS_SEED } from '../data/odds/seed';
import { expectedProbabilities, sampleResult } from './odds-model';

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

export function computeMovements(
  rankedParticipants: ParticipantScore[],
  previousSnapshot: Array<{ participantId: string; position: number }> | undefined,
): Map<string, number> {
  const movements = new Map<string, number>();
  if (!previousSnapshot || previousSnapshot.length === 0) return movements;

  const oldPos = new Map(previousSnapshot.map(s => [s.participantId, s.position]));
  rankedParticipants.forEach((s, i) => {
    const old = oldPos.get(s.participant.id);
    if (old !== undefined) {
      movements.set(s.participant.id, old - (i + 1));
    }
  });

  return movements;
}

export function simulateEmptyPredictions(
  participant: { groupScores: DecodedBracket['groupScores']; knockoutScores: DecodedBracket['knockoutScores'] },
  resolvedKnockoutTeams: Record<string, { teamA?: string | null; teamB?: string | null }> = {},
  rng: () => number = Math.random,
): { groupScores: DecodedBracket['groupScores']; knockoutScores: DecodedBracket['knockoutScores'] } {
  const groupScores = participant.groupScores.map(s => {
    if (s.scoreA !== null && s.scoreB !== null) return s;
    const gm = GROUP_MATCHES.find(m => m.matchId === s.matchId);
    if (!gm) return s;
    const odds = ODDS_SEED.matches[s.matchId];
    const prob = odds ?? expectedProbabilities(
      TEAM_STRENGTH[gm.teamA as keyof typeof TEAM_STRENGTH] ?? 1500,
      TEAM_STRENGTH[gm.teamB as keyof typeof TEAM_STRENGTH] ?? 1500,
    );
    const result = sampleResult(prob, rng);
    return { ...s, scoreA: result.scoreA, scoreB: result.scoreB };
  });

  const knockoutScores = participant.knockoutScores.map(s => {
    if (s.scoreA !== null && s.scoreB !== null) return s;
    const resolved = resolvedKnockoutTeams[s.matchId];
    if (!resolved?.teamA || !resolved?.teamB) return s;
    const prob = expectedProbabilities(
      TEAM_STRENGTH[resolved.teamA as keyof typeof TEAM_STRENGTH] ?? 1500,
      TEAM_STRENGTH[resolved.teamB as keyof typeof TEAM_STRENGTH] ?? 1500,
    );
    const result = sampleResult(prob, rng, true);
    let penaltyScoreA: number | null = null;
    let penaltyScoreB: number | null = null;
    if (result.penaltiesNeeded) {
      penaltyScoreA = 3 + Math.floor(rng() * 3);
      penaltyScoreB = 3 + Math.floor(rng() * 3);
      if (penaltyScoreA === penaltyScoreB) penaltyScoreB += 1;
    }
    return { ...s, scoreA: result.scoreA, scoreB: result.scoreB, penaltyScoreA, penaltyScoreB };
  });

  return { groupScores, knockoutScores };
}
