import { describe, it, expect } from 'vitest';
import { getCurrentMatchday, getLeagueLockedMatchIds, isMatchEditableInLeague } from './league-fixture';

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

describe('getLeagueLockedMatchIds', () => {
  it('returns empty set when no lockedBeforeDate', () => {
    const ids = getLeagueLockedMatchIds({});
    expect(ids.size).toBe(0);
  });

  it('returns empty set when lockedBeforeDate is before all matches (2020)', () => {
    const ids = getLeagueLockedMatchIds({ lockedBeforeDate: '2020-01-01' });
    expect(ids.size).toBe(0);
  });

  it('returns all group matches when lockedBeforeDate is after tournament (2030)', () => {
    const ids = getLeagueLockedMatchIds({ lockedBeforeDate: '2030-01-01' });
    // Al menos los 72 partidos de grupos del Mundial 2026
    expect(ids.size).toBeGreaterThan(70);
  });

  it('all IDs returned are strings', () => {
    const ids = getLeagueLockedMatchIds({ lockedBeforeDate: '2030-01-01' });
    for (const id of ids) {
      expect(typeof id).toBe('string');
    }
  });
});

describe('isMatchEditableInLeague', () => {
  it('returns false when league is frozen', () => {
    // now muy pasado: M1 no ha "ocurrido" en 2020 desde perspectiva de fecha
    const result = isMatchEditableInLeague({ frozen: true }, 'M1', new Date('2025-01-01'));
    expect(result).toBe(false);
  });

  it('returns false when match is in lockedBeforeDate set', () => {
    // M1 date = 2026-06-11 < 2030-01-01, so M1 is in the locked set
    const result = isMatchEditableInLeague({ lockedBeforeDate: '2030-01-01' }, 'M1', new Date('2025-01-01'));
    expect(result).toBe(false);
  });

  it('returns false when match date has passed (standard lock)', () => {
    const farFuture = new Date('2030-01-01');
    const result = isMatchEditableInLeague({}, 'M1', farFuture);
    expect(result).toBe(false);
  });

  it('returns true when league open, no lock, match date not yet passed', () => {
    const past = new Date('2020-01-01');
    const result = isMatchEditableInLeague({}, 'M1', past);
    expect(result).toBe(true);
  });

  it('frozen=false does not block editing', () => {
    const past = new Date('2020-01-01');
    const result = isMatchEditableInLeague({ frozen: false }, 'M1', past);
    expect(result).toBe(true);
  });
});


