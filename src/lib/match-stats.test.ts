import { describe, it, expect } from 'vitest';
import { getMatchStats } from './match-stats';
import { getOrGenerateGoalScorers } from './goal-scorers';

describe('match-stats', () => {
  it('generates consistent, deterministic statistics for a match', () => {
    const stats1 = getMatchStats('M1', 'AEK', 'LSK', 2, 1);
    const stats2 = getMatchStats('M1', 'AEK', 'LSK', 2, 1);

    expect(stats1).toEqual(stats2);
    expect(stats1.possession[0] + stats1.possession[1]).toBe(100);
    expect(stats1.shotsOnTarget[0]).toBeGreaterThanOrEqual(2);
    expect(stats1.shotsOnTarget[1]).toBeGreaterThanOrEqual(1);
    expect(stats1.shots[0]).toBeGreaterThanOrEqual(stats1.shotsOnTarget[0]);
    expect(stats1.shots[1]).toBeGreaterThanOrEqual(stats1.shotsOnTarget[1]);
  });

  it('handles zero or null scores gracefully', () => {
    const stats = getMatchStats('M2', 'BRU', 'AVL', null, null);
    expect(stats.possession[0] + stats.possession[1]).toBe(100);
    expect(stats.shots[0]).toBeGreaterThanOrEqual(0);
    expect(stats.shots[1]).toBeGreaterThanOrEqual(0);
  });
});

describe('getOrGenerateGoalScorers', () => {
  it('returns existing scorers if provided', () => {
    const existing = [
      { minute: 15, playerName: 'Player One', playerNumber: 9, teamId: 'RMA', type: 'normal' as const },
    ];
    const result = getOrGenerateGoalScorers('M6', 'RMA', 'INT', 1, 0, existing);
    expect(result).toEqual(existing);
  });

  it('generates deterministic scorers when none provided and scores exist', () => {
    const result1 = getOrGenerateGoalScorers('M6', 'RMA', 'INT', 2, 1);
    const result2 = getOrGenerateGoalScorers('M6', 'RMA', 'INT', 2, 1);

    expect(result1).toEqual(result2);
    expect(result1.length).toBe(3);
    expect(result1.filter(g => g.teamId === 'RMA').length).toBe(2);
    expect(result1.filter(g => g.teamId === 'INT').length).toBe(1);
  });

  it('returns empty array if 0-0', () => {
    const result = getOrGenerateGoalScorers('M6', 'RMA', 'INT', 0, 0);
    expect(result).toEqual([]);
  });
});
