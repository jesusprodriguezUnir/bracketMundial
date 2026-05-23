import { describe, it, expect } from 'vitest';
import { getCurrentMatchday, computeMovements, simulateEmptyPredictions } from './league-fixture';
import type { ParticipantScore } from './mini-league';

describe('getCurrentMatchday', () => {
  it('returns null current and first 3 matches when no results', () => {
    const { current, next3 } = getCurrentMatchday([], []);
    expect(current).toBeNull();
    expect(next3.length).toBe(3);
    expect(next3[0].matchId).toBe('M1');
    expect(next3[1].matchId).toBe('M2');
    expect(next3[2].matchId).toBe('M3');
  });

  it('detects last played group stage match', () => {
    const groupScores = [
      { matchId: 'M1', scoreA: 2, scoreB: 1 },
      { matchId: 'M2', scoreA: 1, scoreB: 0 },
      { matchId: 'M64', scoreA: 1, scoreB: 1 },
    ];
    const { current } = getCurrentMatchday(
      groupScores as any,
      [],
    );
    expect(current).not.toBeNull();
    expect(current!.lastMatchId).toBe('M64');
  });

  it('next3 filters out played matches', () => {
    const groupScores = [
      { matchId: 'M1', scoreA: 2, scoreB: 1 },
      { matchId: 'M2', scoreA: 1, scoreB: 0 },
      { matchId: 'M7', scoreA: 0, scoreB: 0 },
    ];
    const { next3 } = getCurrentMatchday(
      groupScores as any,
      [],
    );
    expect(next3.every(m => m.matchId !== 'M1' && m.matchId !== 'M2' && m.matchId !== 'M7')).toBe(true);
    expect(next3.length).toBe(3);
  });
});

describe('computeMovements', () => {
  function makeScore(id: string, name: string, total: number): ParticipantScore {
    return {
      participant: { id, name },
      total,
      byPhase: { groups: total, knockout: 0 },
      exactCount: 0,
      diffCount: 0,
      signCount: 0,
      breakdown: [],
    };
  }

  it('returns empty map when no snapshot', () => {
    const scores = [makeScore('a', 'A', 10), makeScore('b', 'B', 5)];
    const m = computeMovements(scores, undefined);
    expect(m.size).toBe(0);
  });

  it('computes movements correctly (up/down/equal)', () => {
    const scores = [makeScore('b', 'B', 15), makeScore('a', 'A', 10), makeScore('c', 'C', 5)];
    const snapshot = [
      { participantId: 'a', position: 1 },
      { participantId: 'b', position: 2 },
      { participantId: 'c', position: 3 },
    ];
    const m = computeMovements(scores, snapshot);
    // a went from 1 → 2 = down -1
    // b went from 2 → 1 = up +1
    // c stayed at 3
    expect(m.get('a')).toBe(-1);
    expect(m.get('b')).toBe(1);
    expect(m.get('c')).toBe(0);
  });

  it('returns only tracked participants', () => {
    const scores = [makeScore('x', 'X', 10)];
    const snapshot = [{ participantId: 'y', position: 1 }];
    const m = computeMovements(scores, snapshot);
    expect(m.size).toBe(0);
  });
});

describe('simulateEmptyPredictions', () => {
  const groupMatches = [
    'M1', 'M2', 'M3',
  ];

  function emptyGroupScores(): Array<{ matchId: string; scoreA: number | null; scoreB: number | null }> {
    return groupMatches.map(matchId => ({ matchId, scoreA: null, scoreB: null }));
  }

  function emptyKoScores(): Array<{ matchId: string; scoreA: number | null; scoreB: number | null; penaltyScoreA: number | null; penaltyScoreB: number | null }> {
    return [];
  }

  it('fills empty group scores with numeric values', () => {
    const participant = {
      groupScores: emptyGroupScores(),
      knockoutScores: emptyKoScores(),
    };

    const result = simulateEmptyPredictions(participant, {}, () => 0.5);

    expect(result.groupScores.length).toBe(3);
    for (const s of result.groupScores) {
      expect(typeof s.scoreA).toBe('number');
      expect(typeof s.scoreB).toBe('number');
      expect(s.scoreA! >= 0).toBe(true);
      expect(s.scoreB! >= 0).toBe(true);
    }
    expect(result.knockoutScores.length).toBe(0);
  });

  it('does not overwrite existing predictions', () => {
    const participant = {
      groupScores: [
        { matchId: 'M1', scoreA: 2, scoreB: 1 },
        { matchId: 'M2', scoreA: null, scoreB: null },
        { matchId: 'M3', scoreA: null, scoreB: null },
      ],
      knockoutScores: emptyKoScores(),
    };

    const result = simulateEmptyPredictions(participant, {}, () => 0.5);

    expect(result.groupScores[0].scoreA).toBe(2);
    expect(result.groupScores[0].scoreB).toBe(1);
    expect(typeof result.groupScores[1].scoreA).toBe('number');
    expect(typeof result.groupScores[2].scoreA).toBe('number');
  });

  it('leaves knockout scores null when no resolved teams', () => {
    const participant = {
      groupScores: emptyGroupScores(),
      knockoutScores: [
        { matchId: 'KO1', scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null },
      ],
    };

    const result = simulateEmptyPredictions(participant, {}, () => 0.5);

    expect(result.knockoutScores.length).toBe(1);
    expect(result.knockoutScores[0].scoreA).toBeNull();
    expect(result.knockoutScores[0].scoreB).toBeNull();
  });

  it('fills knockout scores when teams are resolved', () => {
    const participant = {
      groupScores: emptyGroupScores(),
      knockoutScores: [
        { matchId: 'KO1', scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null },
      ],
    };

    const resolvedKo = {
      KO1: { teamA: 'BRA', teamB: 'ARG' },
    };

    const result = simulateEmptyPredictions(participant, resolvedKo, () => 0.5);

    expect(result.knockoutScores.length).toBe(1);
    expect(typeof result.knockoutScores[0].scoreA).toBe('number');
    expect(typeof result.knockoutScores[0].scoreB).toBe('number');
  });

  it('skips knockout matches where only one team is resolved', () => {
    const participant = {
      groupScores: emptyGroupScores(),
      knockoutScores: [
        { matchId: 'KO1', scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null },
      ],
    };

    const resolvedKo = {
      KO1: { teamA: 'BRA' },
    };

    const result = simulateEmptyPredictions(participant, resolvedKo, () => 0.5);

    expect(result.knockoutScores[0].scoreA).toBeNull();
    expect(result.knockoutScores[0].scoreB).toBeNull();
  });
});
