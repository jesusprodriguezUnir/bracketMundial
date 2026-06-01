import { describe, it, expect } from 'vitest';
import { getCurrentMatchday } from './league-fixture';

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

