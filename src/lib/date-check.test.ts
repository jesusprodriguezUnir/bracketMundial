import { describe, it, expect } from 'vitest';
import { generateGroupMatches } from '../data/fifa-2026';

describe('Match Dates', () => {
  it('should have multiple dates across group matches', () => {
    const matches = generateGroupMatches();
    const dates = matches.map(m => m.date);
    const uniqueDates = [...new Set(dates)];
    
    console.log('Unique dates found:', uniqueDates.join(', '));
    
    expect(uniqueDates.length).toBeGreaterThan(1);
    expect(uniqueDates).toContain('2026-06-12');
    expect(uniqueDates).toContain('2026-06-18');
  });
});
