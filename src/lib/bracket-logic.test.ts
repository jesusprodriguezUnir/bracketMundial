import { describe, it, expect } from 'vitest';
import { KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { calculateBestThirds, syncKnockoutBracket } from './bracket-logic';
import type { GroupStandingLike, KnockoutMatchLike, TeamStats } from './bracket-logic';

const GROUPS = 'ABCDEFGHIJKL'.split('');

const THIRD_STATS: Record<string, { points: number; goalDiff: number; goalsFor: number }> = {
  A: { points: 6, goalDiff: 3, goalsFor: 5 },
  B: { points: 5, goalDiff: 2, goalsFor: 4 },
  C: { points: 5, goalDiff: 1, goalsFor: 4 },
  D: { points: 4, goalDiff: 1, goalsFor: 3 },
  E: { points: 4, goalDiff: 0, goalsFor: 3 },
  F: { points: 4, goalDiff: 0, goalsFor: 2 },
  G: { points: 3, goalDiff: 1, goalsFor: 2 },
  H: { points: 3, goalDiff: 0, goalsFor: 2 },
  I: { points: 2, goalDiff: 0, goalsFor: 1 },
  J: { points: 1, goalDiff: 0, goalsFor: 1 },
  K: { points: 0, goalDiff: -1, goalsFor: 0 },
  L: { points: 0, goalDiff: -2, goalsFor: 0 },
};

function buildStandings(overrides: Partial<Record<string, GroupStandingLike[]>> = {}): Record<string, GroupStandingLike[]> {
  return Object.fromEntries(
    GROUPS.map(group => [
      group,
      overrides[group] ?? [
        { teamId: `${group}1`, points: 9, goalDiff: 6, goalsFor: 7 },
        { teamId: `${group}2`, points: 4, goalDiff: 1, goalsFor: 3 },
        { teamId: `${group}3`, ...THIRD_STATS[group] },
      ],
    ])
  ) as Record<string, GroupStandingLike[]>;
}

function syncBracket(
  standings: Record<string, GroupStandingLike[]>,
  knockoutMatches: Record<string, KnockoutMatchLike> = {}
): Record<string, KnockoutMatchLike> {
  return syncKnockoutBracket(standings, knockoutMatches, KNOCKOUT_BRACKET);
}

function playMatch(
  standings: Record<string, GroupStandingLike[]>,
  knockoutMatches: Record<string, KnockoutMatchLike>,
  matchId: string,
  winnerSide: 'teamA' | 'teamB' = 'teamA'
): Record<string, KnockoutMatchLike> {
  const match = knockoutMatches[matchId];
  const scoreA = winnerSide === 'teamA' ? 2 : 1;
  const scoreB = winnerSide === 'teamA' ? 1 : 2;

  return syncBracket(standings, {
    ...knockoutMatches,
    [matchId]: {
      ...match,
      scoreA,
      scoreB,
      winnerId: winnerSide === 'teamA' ? match.teamA : match.teamB,
      isPlayed: true,
    },
  });
}

describe('Bracket Logic', () => {
  it('should correctly select the 8 best 3rd placed teams based on FIFA rules', () => {
    const thirds: TeamStats[] = [
      { id: 'T1', points: 4, goalDifference: 1, goalsFor: 2, fairPlay: 0, group: 'A' },
      { id: 'T2', points: 3, goalDifference: 0, goalsFor: 3, fairPlay: 0, group: 'B' },
      { id: 'T3', points: 4, goalDifference: 2, goalsFor: 4, fairPlay: 0, group: 'C' },
      { id: 'T4', points: 1, goalDifference: -2, goalsFor: 1, fairPlay: 0, group: 'D' },
      { id: 'T5', points: 3, goalDifference: 0, goalsFor: 2, fairPlay: 0, group: 'E' },
      { id: 'T6', points: 4, goalDifference: -1, goalsFor: 2, fairPlay: 0, group: 'F' },
      { id: 'T7', points: 6, goalDifference: 3, goalsFor: 4, fairPlay: 0, group: 'G' },
      { id: 'T8', points: 2, goalDifference: 0, goalsFor: 1, fairPlay: 0, group: 'H' },
      { id: 'T9', points: 4, goalDifference: 0, goalsFor: 1, fairPlay: 0, group: 'I' },
      { id: 'T10', points: 3, goalDifference: 1, goalsFor: 2, fairPlay: 0, group: 'J' },
      { id: 'T11', points: 0, goalDifference: -5, goalsFor: 0, fairPlay: 0, group: 'K' },
      { id: 'T12', points: 3, goalDifference: 0, goalsFor: 3, fairPlay: -1, group: 'L' },
    ];

    const best = calculateBestThirds(thirds);
    expect(best.length).toBe(8);
    expect(best[0].id).toBe('T7');

    const t2Index = best.findIndex(t => t.id === 'T2');
    const t12Index = best.findIndex(t => t.id === 'T12');
    expect(t2Index).toBeLessThan(t12Index);

    expect(best.map(t => t.id)).toEqual(['T7', 'T3', 'T1', 'T9', 'T6', 'T10', 'T2', 'T12']);
  });

  it('should fill knockout slots automatically from group standings and best third places', () => {
    const knockout = syncBracket(buildStandings());

    expect(knockout['R32-11'].teamA).toBe('A1');
    expect(knockout['R32-01'].teamB).toBe('A3');
    expect(knockout['R32-16'].teamB).toBe('D3');
  });

  it('should propagate winners decided on penalties', () => {
    const standings = buildStandings();
    const knockout = syncBracket(standings);

    const updated = syncBracket(standings, {
      ...knockout,
      'R32-01': {
        ...knockout['R32-01'],
        scoreA: 1,
        scoreB: 1,
        penaltyScoreA: 5,
        penaltyScoreB: 4,
        winnerId: knockout['R32-01'].teamA,
        isPlayed: true,
      },
    });

    expect(updated['R32-01'].winnerId).toBe(updated['R32-01'].teamA);
    expect(updated['R32-01'].penaltyScoreA).toBe(5);
    expect(updated['R32-01'].penaltyScoreB).toBe(4);
    expect(updated['R16-01'].teamA).toBe(updated['R32-01'].teamA);
  });

  it('should clear only the affected downstream branch when an earlier qualifier changes', () => {
    const standings = buildStandings();
    const initial = syncBracket(standings);

    const withPredictions = syncBracket(standings, {
      ...initial,
      'R32-01': {
        ...initial['R32-01'],
        scoreA: 1,
        scoreB: 0,
        winnerId: 'E1',
        isPlayed: true,
      },
      'R32-02': {
        ...initial['R32-02'],
        scoreA: 2,
        scoreB: 1,
        winnerId: 'I1',
        isPlayed: true,
      },
      'R32-11': {
        ...initial['R32-11'],
        scoreA: 2,
        scoreB: 1,
        winnerId: 'A1',
        isPlayed: true,
      },
      'R16-06': {
        ...initial['R16-06'],
        teamA: 'A1',
        teamB: 'L1',
        scoreA: 3,
        scoreB: 1,
        winnerId: 'A1',
        isPlayed: true,
      },
      'QF-03': {
        ...initial['QF-03'],
        teamA: 'C1',
        teamB: 'A1',
        scoreA: 1,
        scoreB: 0,
        winnerId: 'C1',
        isPlayed: true,
      },
      'R16-01': {
        ...initial['R16-01'],
        teamA: 'E1',
        teamB: 'I1',
        scoreA: 1,
        scoreB: 0,
        winnerId: 'E1',
        isPlayed: true,
      },
    });

    const changedStandings = buildStandings({
      A: [
        { teamId: 'A2', points: 10, goalDiff: 7, goalsFor: 8 },
        { teamId: 'A1', points: 6, goalDiff: 2, goalsFor: 4 },
        { teamId: 'A3', ...THIRD_STATS.A },
      ],
    });

    const resynced = syncBracket(changedStandings, withPredictions);

    expect(resynced['R32-11'].teamA).toBe('A2');
    expect(resynced['R32-11'].isPlayed).toBe(false);
    expect(resynced['R16-06'].teamA).toBeNull();
    expect(resynced['R16-06'].isPlayed).toBe(false);
    expect(resynced['QF-03'].teamB).toBeNull();
    expect(resynced['QF-03'].isPlayed).toBe(false);
    expect(resynced['R16-01'].isPlayed).toBe(true);
    expect(resynced['R16-01'].winnerId).toBe('E1');
  });

  it('should send semifinal winners to the final and losers to the third-place match', () => {
    const standings = buildStandings();
    let knockout = syncBracket(standings);

    const leftPath = ['R32-01', 'R32-02', 'R32-03', 'R32-04', 'R32-05', 'R32-06', 'R32-07', 'R32-08', 'R16-01', 'R16-02', 'R16-03', 'R16-04', 'QF-01', 'QF-02'];
    const rightPath = ['R32-09', 'R32-10', 'R32-11', 'R32-12', 'R32-13', 'R32-14', 'R32-15', 'R32-16', 'R16-05', 'R16-06', 'R16-07', 'R16-08', 'QF-03', 'QF-04'];

    for (const matchId of leftPath) {
      knockout = playMatch(standings, knockout, matchId, 'teamA');
    }

    for (const matchId of rightPath) {
      knockout = playMatch(standings, knockout, matchId, 'teamA');
    }

    knockout = playMatch(standings, knockout, 'SF-01', 'teamA');
    knockout = playMatch(standings, knockout, 'SF-02', 'teamB');

    expect(knockout['FIN-01'].teamA).toBe(knockout['SF-01'].winnerId);
    expect(knockout['FIN-01'].teamB).toBe(knockout['SF-02'].winnerId);
    expect(knockout['TP-01'].teamA).toBe(knockout['SF-01'].teamB);
    expect(knockout['TP-01'].teamB).toBe(knockout['SF-02'].teamA);
  });
});