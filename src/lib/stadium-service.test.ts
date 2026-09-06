import { describe, it, expect } from 'vitest';
import { getAllTeamStadiums, getTeamStadium, getStadiumStats } from './stadium-service';

describe('stadium-service', () => {
  it('returns all 36 team stadiums with valid data and capacity > 0', () => {
    const stadiums = getAllTeamStadiums();
    expect(stadiums).toHaveLength(36);

    for (const s of stadiums) {
      expect(s.clubId).toBeTruthy();
      expect(s.stadiumName).toBeTruthy();
      expect(s.capacity).toBeGreaterThan(0);
      expect(s.city).toBeTruthy();
      expect(s.country).toBeTruthy();
    }
  });

  it('correctly sorts stadiums by capacity descending by default', () => {
    const stadiums = getAllTeamStadiums({ sortBy: 'capacity', order: 'desc' });
    for (let i = 0; i < stadiums.length - 1; i++) {
      expect(stadiums[i].capacity).toBeGreaterThanOrEqual(stadiums[i + 1].capacity);
    }
  });

  it('filters stadiums by country', () => {
    const spanishStadiums = getAllTeamStadiums({ country: 'España' });
    expect(spanishStadiums.length).toBeGreaterThan(0);
    expect(spanishStadiums.every(s => s.country === 'España')).toBe(true);
  });

  it('retrieves stadium for specific team', () => {
    const rma = getTeamStadium('RMA');
    expect(rma).toBeDefined();
    expect(rma?.stadiumName).toBe('Estadio Santiago Bernabéu');
    expect(rma?.capacity).toBeGreaterThan(80000);

    const bvb = getTeamStadium('BVB');
    expect(bvb).toBeDefined();
    expect(bvb?.stadiumName).toBe('Signal Iduna Park');
    expect(bvb?.capacity).toBe(81365);
  });

  it('calculates valid stadium stats', () => {
    const stats = getStadiumStats();
    expect(stats.totalStadiums).toBe(36);
    expect(stats.totalCapacity).toBeGreaterThan(1500000);
    expect(stats.averageCapacity).toBeGreaterThan(30000);
    expect(stats.largestStadium).toBeDefined();
    expect(stats.smallestStadium).toBeDefined();
    expect(stats.largestStadium.capacity).toBeGreaterThanOrEqual(stats.smallestStadium.capacity);
  });
});
