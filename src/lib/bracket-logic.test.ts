import { describe, it, expect } from 'vitest';
import { calculateBestThirds } from './bracket-logic';
import type { TeamStats } from './bracket-logic';

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
});