import { describe, it, expect } from 'vitest';
import { getMatchWindowInfo, kickoffMs, getAllKickoffsMs } from './match-window';

// M1: MEX-RSA, 2026-06-11 21:00 CEST = 19:00 UTC.
// M7: BRA-MAR, date 2026-06-14 00:00 CEST = 13-jun 22:00 UTC (cruza medianoche CEST).
// Final: FIN-01, 2026-07-19 21:00 CEST = 19:00 UTC.

describe('kickoffMs', () => {
  it('convierte fecha + hora CEST a epoch UTC', () => {
    expect(kickoffMs('2026-06-11', '21:00')).toBe(Date.parse('2026-06-11T19:00:00Z'));
  });

  it('devuelve Infinity para entradas no parseables', () => {
    expect(kickoffMs('no-date', '21:00')).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('getAllKickoffsMs', () => {
  it('incluye los 104 partidos ordenados ascendente', () => {
    const ks = getAllKickoffsMs();
    expect(ks.length).toBe(104);
    for (let i = 1; i < ks.length; i++) expect(ks[i]).toBeGreaterThanOrEqual(ks[i - 1]);
  });
});

describe('getMatchWindowInfo', () => {
  it('live durante M1', () => {
    expect(getMatchWindowInfo(new Date('2026-06-11T19:30:00Z')).state).toBe('live');
  });

  it('live exactamente en kickoff − 15 min', () => {
    expect(getMatchWindowInfo(new Date('2026-06-11T18:45:00Z')).state).toBe('live');
  });

  it('matchday justo antes de abrirse la ventana live', () => {
    const info = getMatchWindowInfo(new Date('2026-06-11T18:44:59Z'));
    expect(info.state).toBe('matchday');
    expect(info.msToNextLiveWindow).toBe(1_000);
  });

  it('live exactamente en kickoff + 3 h', () => {
    expect(getMatchWindowInfo(new Date('2026-06-11T22:00:00Z')).state).toBe('live');
  });

  it('matchday horas antes del primer partido del día', () => {
    expect(getMatchWindowInfo(new Date('2026-06-11T12:00:00Z')).state).toBe('matchday');
  });

  it('live en partido que cruza medianoche CEST (M7)', () => {
    expect(getMatchWindowInfo(new Date('2026-06-13T22:30:00Z')).state).toBe('live');
  });

  it('idle antes del torneo, con próxima ventana en el futuro', () => {
    const info = getMatchWindowInfo(new Date('2026-05-01T12:00:00Z'));
    expect(info.state).toBe('idle');
    expect(info.msToNextLiveWindow).toBeGreaterThan(0);
  });

  it('idle tras la final + 3 h, sin más ventanas', () => {
    const info = getMatchWindowInfo(new Date('2026-07-20T12:00:00Z'));
    expect(info.state).toBe('idle');
    expect(info.msToNextLiveWindow).toBeNull();
  });
});
