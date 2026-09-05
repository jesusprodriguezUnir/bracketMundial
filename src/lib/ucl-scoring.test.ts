import { describe, it, expect } from 'vitest';
import { scoreMatch, scoreParticipant, UCL_POINTS } from './mini-league';
import { GROUP_MATCHES } from '../data/match-schedule';
import { COMPETITION } from '../data/competition';

describe('UCL league-phase scoring', () => {
  it('exact = 5', () => {
    expect(scoreMatch(2, 1, 2, 1)).toEqual({ points: UCL_POINTS.groupExact, kind: 'exact' });
  });

  it('same GD = 3', () => {
    expect(scoreMatch(3, 1, 2, 0)).toEqual({ points: UCL_POINTS.groupDiff, kind: 'diff' });
  });

  it('same sign = 2', () => {
    expect(scoreMatch(2, 0, 5, 1)).toEqual({ points: UCL_POINTS.groupSign, kind: 'sign' });
  });

  it('miss = 0', () => {
    expect(scoreMatch(2, 1, 1, 2)).toEqual({ points: UCL_POINTS.groupMiss, kind: 'miss' });
  });

  it('knockout progression stays 0 while KO is inert', () => {
    expect(COMPETITION.knockoutEnabled).toBe(false);
    const real = GROUP_MATCHES.map(m => ({ matchId: m.matchId, scoreA: 1, scoreB: 0 }));
    const result = scoreParticipant(
      {
        id: 'p1',
        name: 'Ada',
        groupScores: real.map(s => ({ ...s })),
        knockoutScores: [{ matchId: 'FIN-01', scoreA: 2, scoreB: 1, penaltyScoreA: null, penaltyScoreB: null }],
      },
      real,
      [{ matchId: 'FIN-01', scoreA: 2, scoreB: 1, penaltyScoreA: null, penaltyScoreB: null }],
    );
    expect(result.byPhase.groups).toBe(GROUP_MATCHES.length * UCL_POINTS.groupExact);
    expect(result.byPhase.knockout).toBe(0);
  });
});
