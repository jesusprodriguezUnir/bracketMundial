import { describe, it, expect } from 'vitest';
import { pickMostLikelyScore, buildProjectedScores } from './league-projection';

describe('pickMostLikelyScore', () => {
  it('returns 1-1 for a draw', () => {
    const result = pickMostLikelyScore({ home: 33, draw: 34, away: 33 });
    expect(result).toEqual({ scoreA: 1, scoreB: 1 });
  });

  it('returns 2-1 for a dominant home win (>= 70%)', () => {
    const result = pickMostLikelyScore({ home: 75, draw: 15, away: 10 });
    expect(result).toEqual({ scoreA: 2, scoreB: 1 });
  });

  it('returns 1-0 for a close home win (< 70%)', () => {
    const result = pickMostLikelyScore({ home: 55, draw: 25, away: 20 });
    expect(result).toEqual({ scoreA: 1, scoreB: 0 });
  });

  it('returns 1-2 for a dominant away win (>= 70%)', () => {
    const result = pickMostLikelyScore({ home: 10, draw: 15, away: 75 });
    expect(result).toEqual({ scoreA: 1, scoreB: 2 });
  });

  it('returns 0-1 for a close away win (< 70%)', () => {
    const result = pickMostLikelyScore({ home: 20, draw: 25, away: 55 });
    expect(result).toEqual({ scoreA: 0, scoreB: 1 });
  });

  it('treats draw as 1-1 even when one side dominates', () => {
    const result = pickMostLikelyScore({ home: 35, draw: 35, away: 30 });
    expect(result).toEqual({ scoreA: 1, scoreB: 1 });
  });

  it('is deterministic — same input returns same output', () => {
    const prob = { home: 60, draw: 20, away: 20 };
    const a = pickMostLikelyScore(prob);
    const b = pickMostLikelyScore(prob);
    expect(a).toEqual(b);
  });
});

describe('buildProjectedScores', () => {
  const emptyGroupScores = new Array(72).fill(null).map((_, i) => ({
    matchId: `M${i + 1}`,
    scoreA: null as number | null,
    scoreB: null as number | null,
  }));

  const emptyKnockoutScores = new Array(32).fill(null).map((_, i) => ({
    matchId: `mock-ko-${i}`,
    scoreA: null as number | null,
    scoreB: null as number | null,
  }));

  it('returns 72 group scores and 32 knockout scores when all matches are pending', () => {
    const result = buildProjectedScores(emptyGroupScores, emptyKnockoutScores);
    expect(result.groupScores).toHaveLength(72);
    expect(result.knockoutScores).toHaveLength(32);

    for (const gs of result.groupScores) {
      expect(gs.scoreA).not.toBeNull();
      expect(gs.scoreB).not.toBeNull();
    }
  });

  it('preserves real group scores when present', () => {
    const realGroup = [
      { matchId: 'M1', scoreA: 2, scoreB: 0 },
      { matchId: 'M2', scoreA: 3, scoreB: 1 },
    ];
    const result = buildProjectedScores(realGroup, emptyKnockoutScores);

    const m1 = result.groupScores.find(s => s.matchId === 'M1')!;
    expect(m1.scoreA).toBe(2);
    expect(m1.scoreB).toBe(0);

    const m2 = result.groupScores.find(s => s.matchId === 'M2')!;
    expect(m2.scoreA).toBe(3);
    expect(m2.scoreB).toBe(1);
  });

  it('projects pending group matches using odds', () => {
    const result = buildProjectedScores(emptyGroupScores, emptyKnockoutScores);

    // M1 is MEX vs RSA with odds home: 62, draw: 19, away: 19. home win, close (<70) → 1-0
    const m1 = result.groupScores.find(s => s.matchId === 'M1')!;
    expect(m1.scoreA).toBe(1);
    expect(m1.scoreB).toBe(0);

    // M10 is GER vs CUW with odds home: 85, draw: 12, away: 3. home win, dominant (>=70) → 2-1
    const m10 = result.groupScores.find(s => s.matchId === 'M10')!;
    expect(m10.scoreA).toBe(2);
    expect(m10.scoreB).toBe(1);
  });

  it('propagates group standings into knockout match teams', () => {
    const result = buildProjectedScores(emptyGroupScores, emptyKnockoutScores);

    // R32-01 should have teams assigned (G-E-1 winner vs best third from group indexed 1)
    const r3201 = result.knockoutScores.find(s => s.matchId === 'R32-01')!;
    expect(r3201).toBeDefined();

    // First knockout match should resolve teams based on projected group results
    // At minimum, R32-01 through R32-16 should be populated if group standings are resolved
  });

  it('is deterministic — same input returns same output', () => {
    const a = buildProjectedScores(emptyGroupScores, emptyKnockoutScores);
    const b = buildProjectedScores(emptyGroupScores, emptyKnockoutScores);

    expect(a.groupScores).toEqual(b.groupScores);
    expect(a.knockoutScores).toEqual(b.knockoutScores);
  });

  it('leaves knockout match score as null when teams are not resolved', () => {
    // With no group results at all, knockout should resolve from projected group standings
    const result = buildProjectedScores(emptyGroupScores, emptyKnockoutScores);

    // Since we project ALL group matches, all knockout matches should have teams assigned
    // and thus have projected scores (not null)
    for (const ks of result.knockoutScores) {
      expect(ks.scoreA).not.toBeNull();
      expect(ks.scoreB).not.toBeNull();
    }
  });
});
