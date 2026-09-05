import { describe, it, expect } from 'vitest';
import { getCountdownValues, getTournamentPhase } from './tournament-phase';

describe('getTournamentPhase', () => {
  it('countdown antes del partido inaugural', () => {
    expect(getTournamentPhase(Date.UTC(2026, 8, 1))).toBe('countdown');
    expect(getTournamentPhase(Date.UTC(2026, 8, 8, 16, 44, 59))).toBe('countdown');
  });

  it('live desde el kickoff hasta el cierre de la final', () => {
    expect(getTournamentPhase(Date.UTC(2026, 8, 8, 16, 45, 0))).toBe('live');
    expect(getTournamentPhase(Date.UTC(2026, 11, 1))).toBe('live');
    expect(getTournamentPhase(Date.UTC(2027, 5, 4, 23, 59, 59))).toBe('live');
  });

  it('archivo después de la final', () => {
    expect(getTournamentPhase(Date.UTC(2027, 5, 5, 20, 0, 0))).toBe('archive');
    expect(getTournamentPhase(Date.UTC(2027, 6, 1))).toBe('archive');
  });
});

describe('getCountdownValues', () => {
  it('devuelve ceros cuando el torneo ya empezó', () => {
    expect(getCountdownValues(Date.UTC(2026, 8, 9))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('cuenta días enteros hasta el inaugural', () => {
    expect(getCountdownValues(Date.UTC(2026, 8, 7, 16, 45, 0)).days).toBe(1);
  });
});
