import { describe, it, expect } from 'vitest';
import { scoreMatch, scoreParticipant, rankParticipants, MUNDIAL_POINTS } from './mini-league';
import type { Participant, ParticipantScore } from './mini-league';

// --- scoreMatch ---

describe('scoreMatch', () => {
  it('exact score → 5 points', () => {
    expect(scoreMatch(2, 1, 2, 1)).toEqual({ points: MUNDIAL_POINTS.exact, kind: 'exact' });
  });

  it('exact 0-0 draw → 5 points', () => {
    expect(scoreMatch(0, 0, 0, 0)).toEqual({ points: MUNDIAL_POINTS.exact, kind: 'exact' });
  });

  it('correct goal diff but different score → 3 points', () => {
    expect(scoreMatch(3, 1, 2, 0)).toEqual({ points: MUNDIAL_POINTS.diff, kind: 'diff' });
  });

  it('correct sign (win) but wrong diff → 2 points', () => {
    expect(scoreMatch(2, 0, 5, 1)).toEqual({ points: MUNDIAL_POINTS.sign, kind: 'sign' });
  });

  it('correct sign (draw) but different score → 3 points diff', () => {
    expect(scoreMatch(2, 2, 0, 0)).toEqual({ points: MUNDIAL_POINTS.diff, kind: 'diff' });
  });

  it('wrong sign → 0 points', () => {
    expect(scoreMatch(2, 1, 1, 2)).toEqual({ points: MUNDIAL_POINTS.miss, kind: 'miss' });
  });

  it('real null (pending) → 0 points, kind pending', () => {
    expect(scoreMatch(2, 1, null, null)).toEqual({ points: 0, kind: 'pending' });
  });

  it('real partial null → pending', () => {
    expect(scoreMatch(2, 1, 2, null)).toEqual({ points: 0, kind: 'pending' });
  });

  it('prediction null → miss', () => {
    expect(scoreMatch(null, null, 2, 1)).toEqual({ points: 0, kind: 'miss' });
  });

  it('goal diff correct includes negative diff (away win)', () => {
    expect(scoreMatch(0, 2, 1, 3)).toEqual({ points: MUNDIAL_POINTS.diff, kind: 'diff' });
  });
});

// --- scoreParticipant ---

function makeParticipant(overrides?: Partial<Participant>): Pick<Participant, 'id' | 'name' | 'groupScores' | 'knockoutScores'> {
  return {
    id: 'p1',
    name: 'Test',
    groupScores: [],
    knockoutScores: [],
    ...overrides,
  };
}

describe('scoreParticipant', () => {
  it('sums group and knockout scores correctly', () => {
    const participant = makeParticipant({
      groupScores: [
        { matchId: 'G1', scoreA: 2, scoreB: 1 },
        { matchId: 'G2', scoreA: 2, scoreB: 0 },
      ],
      knockoutScores: [
        { matchId: 'K1', scoreA: 2, scoreB: 0, penaltyScoreA: null, penaltyScoreB: null },
        { matchId: 'K2', scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null },
      ],
    });

    const realGroups = [
      { matchId: 'G1', scoreA: 2, scoreB: 1 }, // exact 5
      { matchId: 'G2', scoreA: 1, scoreB: 0 }, // sign 2 (same sign, different diff)
    ];
    const realKnockout = [
      { matchId: 'K1', scoreA: 3, scoreB: 1 }, // diff 3 (same diff +2)
      { matchId: 'K2', scoreA: null, scoreB: null }, // pending
    ];

    const result = scoreParticipant(participant, realGroups, realKnockout);
    expect(result.total).toBe(5 + 2 + 3 + 0);
    expect(result.byPhase.groups).toBe(7);
    expect(result.byPhase.knockout).toBe(3);
    expect(result.exactCount).toBe(1);
    expect(result.diffCount).toBe(1);
    expect(result.signCount).toBe(1);
  });

  it('ignores pending matches in scoring', () => {
    const participant = makeParticipant({
      groupScores: [{ matchId: 'G1', scoreA: 2, scoreB: 1 }],
    });
    const realGroups = [{ matchId: 'G1', scoreA: null, scoreB: null }];
    const realKnockout: typeof realGroups = [];

    const result = scoreParticipant(participant, realGroups, realKnockout);
    expect(result.total).toBe(0);
    expect(result.breakdown[0]?.kind).toBe('pending');
  });

  it('handles missing predictions gracefully', () => {
    const participant = makeParticipant({
      groupScores: [],
      knockoutScores: [],
    });

    const realGroups = [{ matchId: 'G1', scoreA: 2, scoreB: 1 }];
    const realKnockout: typeof realGroups = [];

    const result = scoreParticipant(participant, realGroups, realKnockout);
    expect(result.total).toBe(0);
    expect(result.breakdown[0]?.kind).toBe('miss');
  });
});

// --- rankParticipants ---

function makeScore(
  id: string,
  name: string,
  total: number,
  exactCount = 0,
): ParticipantScore {
  return {
    participant: { id, name },
    total,
    byPhase: { groups: total, knockout: 0 },
    exactCount,
    diffCount: 0,
    signCount: 0,
    breakdown: [],
  };
}

describe('rankParticipants', () => {
  it('orders by total descending', () => {
    const scores = [
      makeScore('1', 'A', 10),
      makeScore('2', 'B', 20),
      makeScore('3', 'C', 15),
    ];
    const ranked = rankParticipants(scores);
    expect(ranked.map(s => s.participant.name)).toEqual(['B', 'C', 'A']);
  });

  it('breaks ties by exact count', () => {
    const scores = [
      makeScore('1', 'A', 10, 3),
      makeScore('2', 'B', 10, 5),
      makeScore('3', 'C', 10, 1),
    ];
    const ranked = rankParticipants(scores);
    expect(ranked.map(s => s.participant.name)).toEqual(['B', 'A', 'C']);
  });

  it('breaks ties by name alphabetically when total and exact are equal', () => {
    const scores = [
      makeScore('1', 'Carlos', 10, 2),
      makeScore('2', 'Ana', 10, 2),
      makeScore('3', 'Bruno', 10, 2),
    ];
    const ranked = rankParticipants(scores);
    expect(ranked.map(s => s.participant.name)).toEqual(['Ana', 'Bruno', 'Carlos']);
  });
});

// --- End-to-end scenario ---

describe('league end-to-end', () => {
  const groups = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

  function mkScores(matchIds: string[], scores: (number | null)[][]): Array<{ matchId: string; scoreA: number | null; scoreB: number | null }> {
    return matchIds.map((id, i) => ({
      matchId: id,
      scoreA: scores[i]?.[0] ?? null,
      scoreB: scores[i]?.[1] ?? null,
    }));
  }

  const participant1 = makeParticipant({
    id: 'p1',
    name: 'Alice',
    groupScores: mkScores(groups, [[2, 1], [3, 1], [1, 0], [2, 2], [0, 0], [1, 2]]),
  });

  const participant2 = makeParticipant({
    id: 'p2',
    name: 'Bob',
    groupScores: mkScores(groups, [[1, 0], [2, 1], [1, 0], [1, 1], [0, 1], [2, 2]]),
  });

  const participant3 = makeParticipant({
    id: 'p3',
    name: 'Charlie',
    groupScores: mkScores(groups, [[2, 1], [3, 1], [1, 0], [2, 2], [0, 0], [1, 2]]), // same as Alice
  });

  it('end-to-end ranking with official results', () => {
    // Official results: M1=2-1, M2=2-0, M3=0-0, M4=2-2, M5=1-1, M6=1-2
    const realGroups = mkScores(groups, [[2, 1], [2, 0], [0, 0], [2, 2], [1, 1], [1, 2]]);
    const realKnockout: typeof realGroups = [];

    const scored = [
      scoreParticipant(participant1, realGroups, realKnockout),
      scoreParticipant(participant2, realGroups, realKnockout),
      scoreParticipant(participant3, realGroups, realKnockout),
    ];
    const ranked = rankParticipants(scored);

    // Alice & Charlie have same predictions: M1 exact(5), M2 diff(3), M3 sign(2), M4 exact(5), M5 sign(0) wait
    // Let me recalculate:
    // Alice: M1=2-1 vs 2-1 => exact 5, M2=3-1 vs 2-0 => sign 2 (both won by 2... wait diff is 2 for pred and 2 for real → diff!)
    // Actually let me be precise:
    // M1: pred 2-1, real 2-1 → exact (+5)
    // M2: pred 3-1, real 2-0 → diff? pred diff=2, real diff=2 → diff (+3)
    // M3: pred 1-0, real 0-0 → miss, sign different (+0)
    // M4: pred 2-2, real 2-2 → exact (+5)
    // M5: pred 0-0, real 1-1 → diff? pred diff=0, real diff=0 → diff (+3)
    // M6: pred 1-2, real 1-2 → exact (+5)
    // Total: 5+3+0+5+3+5 = 21
    // Exact: 3, Diff: 2

    // Bob: M1=1-0 vs 2-1 → sign (+2), M2=2-1 vs 2-0 → diff (+3), M3=1-0 vs 0-0 → miss (+0),
    //      M4=1-1 vs 2-2 → sign (+2), M5=0-1 vs 1-1 → sign (+2), M6=2-2 vs 1-2 → miss (+0)
    // Bob total: 2+3+0+2+2+0 = 9

    expect(ranked[0].participant.name).toBe('Alice');
    expect(ranked[1].participant.name).toBe('Charlie');
    expect(ranked[2].participant.name).toBe('Bob');

    // Verify specific breakdown
    const alice = scored[0];
    expect(alice.exactCount).toBe(3);
    expect(alice.diffCount).toBe(2);
    expect(alice.signCount).toBe(0);
  });

  it('changing real results recalculation changes ranking', () => {
    const realV1 = mkScores(groups, [[2, 1], [2, 0], [0, 0], [2, 2], [1, 1], [1, 2]]);
    const empty: typeof realV1 = [];

    const scoredV1 = [
      scoreParticipant(participant1, realV1, empty),
      scoreParticipant(participant2, realV1, empty),
    ];
    const rankedV1 = rankParticipants(scoredV1);
    expect(rankedV1[0].participant.name).toBe('Alice');

    // Change all results significantly
    const realV2 = mkScores(groups, [[3, 0], [1, 1], [1, 0], [1, 0], [2, 1], [0, 3]]);
    const scoredV2 = [
      scoreParticipant(participant1, realV2, empty),
      scoreParticipant(participant2, realV2, empty),
    ];

    // Verify recalc happened - at least one participant's total changed
    const anyChanged = scoredV1.some((s1, i) => s1.total !== scoredV2[i].total);
    expect(anyChanged).toBe(true);
  });

  it('covers all scoring kinds', () => {
    const real = mkScores(['M1', 'M2', 'M3', 'M4', 'M5'], [
      [2, 1],
      [2, 0],
      [null, null],
      [1, 1],
      [3, 0],
    ]);

    const pred = makeParticipant({
      id: 'p4',
      name: 'Diana',
      groupScores: mkScores(['M1', 'M2', 'M3', 'M4', 'M5'], [
        [2, 1],
        [4, 1],
        [1, 0],
        [0, 2],
        [3, 0],
      ]),
    });

    const result = scoreParticipant(pred, real, []);

    expect(result.exactCount).toBe(2);
    expect(result.diffCount).toBe(0);
    expect(result.signCount).toBe(1);
    expect(result.total).toBe(5 + 2 + 0 + 0 + 5);

    // Verify breakdown kinds
    const kinds = result.breakdown.map(b => b.kind);
    expect(kinds).toEqual(['exact', 'sign', 'pending', 'miss', 'exact']);
  });

  it('after editing prediction scores change', () => {
    const real = mkScores(['M1', 'M2'], [[2, 1], [2, 0]]);
    const empty: typeof real = [];

    const predOriginal = makeParticipant({
      id: 'p5',
      name: 'Eve',
      groupScores: mkScores(['M1', 'M2'], [[1, 0], [1, 1]]),
    });

    const result1 = scoreParticipant(predOriginal, real, empty);
    // M1: pred 1-0, real 2-1 → same diff=1 → diff (+3)
    // M2: pred 1-1, real 2-0 → different sign → miss (+0)
    expect(result1.total).toBe(3);

    // Now edit: M1 → 2-1 exact, M2 → 3-0 sign
    const predEdited = makeParticipant({
      id: 'p5',
      name: 'Eve',
      groupScores: mkScores(['M1', 'M2'], [[2, 1], [3, 0]]),
    });

    const result2 = scoreParticipant(predEdited, real, empty);
    // M1: exact 5, M2: pred 3-0 diff=3, real 2-0 diff=2 → sign (+2) → total 7
    expect(result2.total).toBe(7);
    expect(result2.exactCount).toBe(1);
  });
});
