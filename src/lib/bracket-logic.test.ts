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
      { id: 'T12', points: 3, goalDifference: 0, goalsFor: 3, fairPlay: 1, group: 'L' }, // 1 penalti = peor fair-play
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
    // Annex C row for combination A,B,C,D,E,F,G,H: slot G-3-1 -> C
    // (FIFA-mandated assignment; previous backtracking gave A)
    expect(knockout['R32-01'].teamB).toBe('C3');
    expect(knockout['R32-16'].teamB).toBe('D3');
  });

  it('should apply FIFA official third-place slot mapping for combo BDEFIJKL', () => {
    const qualifiedThirdGroups = new Set(['B', 'D', 'E', 'F', 'I', 'J', 'K', 'L']);
    const standings = buildStandings(
      Object.fromEntries(
        GROUPS.map(group => [
          group,
          [
            { teamId: `${group}1`, points: 9, goalDiff: 6, goalsFor: 7 },
            { teamId: `${group}2`, points: 4, goalDiff: 1, goalsFor: 3 },
            {
              teamId: `${group}3`,
              points: qualifiedThirdGroups.has(group) ? 4 : 0,
              goalDiff: qualifiedThirdGroups.has(group) ? 1 : -5,
              goalsFor: qualifiedThirdGroups.has(group) ? 3 : 0,
            },
          ],
        ])
      ) as Partial<Record<string, GroupStandingLike[]>>
    );

    const knockout = syncBracket(standings);

    expect(knockout['R32-01'].teamB).toBe('D3');
    expect(knockout['R32-02'].teamB).toBe('F3');
    expect(knockout['R32-07'].teamB).toBe('B3');
    expect(knockout['R32-08'].teamB).toBe('I3');
    expect(knockout['R32-11'].teamB).toBe('E3');
    expect(knockout['R32-12'].teamB).toBe('K3');
    expect(knockout['R32-15'].teamB).toBe('J3');
    expect(knockout['R32-16'].teamB).toBe('L3');
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

  // ── FIFA Regulations Annex C lookup ──────────────────────────────────────────
  // The official 2026 third-place allocation is a fixed 495-row lookup table; a
  // previous backtracking-only implementation produced a *valid* but *wrong*
  // assignment (e.g. Germany paired with Sweden instead of Paraguay).

  function buildStandingsWithThirds(
    qualifiedThirdGroups: string[],
    nonQualifiedThirdGroups: string[]
  ): Record<string, GroupStandingLike[]> {
    void nonQualifiedThirdGroups;
    const overrides: Partial<Record<string, GroupStandingLike[]>> = {};
    for (const g of GROUPS) {
      const isQualified = qualifiedThirdGroups.includes(g);
      // Qualified thirds get points 5–9 (still below 1st/2nd), non-qualified get 0.
      const thirdSeed = isQualified
        ? { points: 8 - qualifiedThirdGroups.indexOf(g), goalDiff: 1, goalsFor: 3 }
        : { points: 0, goalDiff: -3, goalsFor: 0 };
      overrides[g] = [
        { teamId: `${g}1`, points: 9, goalDiff: 6, goalsFor: 7 },
        { teamId: `${g}2`, points: 4, goalDiff: 1, goalsFor: 3 },
        { teamId: `${g}3`, ...thirdSeed },
      ];
    }
    return buildStandings(overrides);
  }

  it('assigns third-placed teams per FIFA Annex C: real 2026 combination (B,D,E,F,I,J,K,L)', () => {
    const standings = buildStandingsWithThirds(
      ['B', 'D', 'E', 'F', 'I', 'J', 'K', 'L'],
      ['A', 'C', 'G', 'H']
    );
    const knockout = syncBracket(standings);

    // R32-01 = Match 74: 1E (Germany) vs slot G-3-1 → 3D (Paraguay)
    expect(knockout['R32-01'].teamA).toBe('E1');
    expect(knockout['R32-01'].teamB).toBe('D3');
    // R32-02 = Match 77: 1I (France)  vs slot G-3-2 → 3F (Sweden)
    expect(knockout['R32-02'].teamB).toBe('F3');
    // R32-07 = Match 81: 1D (USA)     vs slot G-3-3 → 3B (Bosnia)
    expect(knockout['R32-07'].teamB).toBe('B3');
    // R32-11 = Match 79: 1A (Mexico)  vs slot G-3-5 → 3E (Ecuador)
    expect(knockout['R32-11'].teamB).toBe('E3');
    // R32-08 = Match 82: 1G (Belgium) vs slot G-3-4 → 3I (Senegal)
    expect(knockout['R32-08'].teamB).toBe('I3');
    // R32-16 = Match 87: 1K (Colombia) vs slot G-3-8 → 3L (Ghana)
    expect(knockout['R32-16'].teamB).toBe('L3');
    // R32-12 = Match 80: 1L (England)  vs slot G-3-6 → 3K (DR Congo)
    expect(knockout['R32-12'].teamB).toBe('K3');
    // R32-15 = Match 85: 1B (Swiss)    vs slot G-3-7 → 3J (Algeria)
    expect(knockout['R32-15'].teamB).toBe('J3');
  });

  it('assigns third-placed teams per FIFA Annex C: alternative combination (D,E,F,G,H,I,J,K)', () => {
    const standings = buildStandingsWithThirds(
      ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      ['A', 'B', 'C', 'L']
    );
    const knockout = syncBracket(standings);

    // Row 9 of Annex C: E,G,J,D,H,F,I,K
    // R32-01 = 1E vs slot G-3-1 → 3D
    expect(knockout['R32-01'].teamA).toBe('E1');
    expect(knockout['R32-01'].teamB).toBe('D3');
    // R32-02 = 1I vs slot G-3-2 → 3F
    expect(knockout['R32-02'].teamB).toBe('F3');
    // R32-07 = 1D vs slot G-3-3 → 3J
    expect(knockout['R32-07'].teamB).toBe('J3');
    // R32-11 = 1A vs slot G-3-5 → 3E
    expect(knockout['R32-11'].teamB).toBe('E3');
    // R32-08 = 1G vs slot G-3-4 → 3H
    expect(knockout['R32-08'].teamB).toBe('H3');
    // R32-16 = 1K vs slot G-3-8 → 3I
    expect(knockout['R32-16'].teamB).toBe('I3');
    // R32-12 = 1L vs slot G-3-6 → 3K
    expect(knockout['R32-12'].teamB).toBe('K3');
    // R32-15 = 1B vs slot G-3-7 → 3G
    expect(knockout['R32-15'].teamB).toBe('G3');
  });
});