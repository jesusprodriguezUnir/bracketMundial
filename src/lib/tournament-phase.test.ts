import { describe, it, expect } from 'vitest';
import { getCountdownValues, getTournamentPhase } from './tournament-phase';

describe('getTournamentPhase', () => {
  it('countdown antes del partido inaugural', () => {
    expect(getTournamentPhase(Date.UTC(2026, 4, 1))).toBe('countdown');
    expect(getTournamentPhase(Date.UTC(2026, 5, 11, 18, 59, 59))).toBe('countdown');
  });

  it('live desde el kickoff hasta el cierre de la final', () => {
    expect(getTournamentPhase(Date.UTC(2026, 5, 11, 19, 0, 0))).toBe('live');
    expect(getTournamentPhase(Date.UTC(2026, 6, 1))).toBe('live');
    expect(getTournamentPhase(Date.UTC(2026, 6, 19, 21, 59, 59))).toBe('live');
  });

  it('archivo después de la final', () => {
    expect(getTournamentPhase(Date.UTC(2026, 6, 19, 22, 0, 0))).toBe('archive');
    expect(getTournamentPhase(Date.UTC(2026, 7, 19))).toBe('archive');
  });
});

describe('getCountdownValues', () => {
  it('devuelve ceros cuando el Mundial ya empezó', () => {
    expect(getCountdownValues(Date.UTC(2026, 5, 12))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('cuenta días enteros hasta el inaugural', () => {
    expect(getCountdownValues(Date.UTC(2026, 5, 10, 19, 0, 0)).days).toBe(1);
  });
});
