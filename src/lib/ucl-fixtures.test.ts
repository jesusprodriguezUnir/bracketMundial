import { describe, it, expect } from 'vitest';
import { TEAMS_2026 } from '../data/fifa-2026';
import { GROUP_MATCHES } from '../data/match-schedule';

describe('shipped UCL 2026/27 league-phase shape', () => {
  it('has 36 unique club ids', () => {
    const ids = TEAMS_2026.map(t => t.id);
    expect(ids).toHaveLength(36);
    expect(new Set(ids).size).toBe(36);
  });

  it('has 144 fixtures across 8 matchdays of 18', () => {
    expect(GROUP_MATCHES).toHaveLength(144);
    for (let d = 1; d <= 8; d++) {
      expect(GROUP_MATCHES.filter(m => m.matchDay === d)).toHaveLength(18);
    }
  });

  it('each club appears in 8 fixtures, 4 home and 4 away', () => {
    for (const club of TEAMS_2026) {
      const home = GROUP_MATCHES.filter(m => m.teamA === club.id);
      const away = GROUP_MATCHES.filter(m => m.teamB === club.id);
      expect(home.length + away.length, club.id).toBe(8);
      expect(home.length, `${club.id} home`).toBe(4);
      expect(away.length, `${club.id} away`).toBe(4);
    }
  });
});
