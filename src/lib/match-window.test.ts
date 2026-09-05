import { describe, it, expect } from 'vitest';
import { getMatchWindowInfo, kickoffMs, getAllKickoffsMs } from './match-window';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';

const m1 = GROUP_MATCHES[0];
const m1Kick = kickoffMs(m1.date, m1.timeSpain);

describe('kickoffMs', () => {
  it('convierte fecha + hora CEST a epoch UTC', () => {
    expect(kickoffMs('2026-09-08', '18:45')).toBe(Date.parse('2026-09-08T16:45:00Z'));
  });

  it('devuelve Infinity para entradas no parseables', () => {
    expect(kickoffMs('no-date', '21:00')).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('getAllKickoffsMs', () => {
  it('incluye todos los partidos de liga y knockout ordenados ascendente', () => {
    const ks = getAllKickoffsMs();
    expect(ks.length).toBe(GROUP_MATCHES.length + Object.keys(KNOCKOUT_SCHEDULE).length);
    for (let i = 1; i < ks.length; i++) expect(ks[i]).toBeGreaterThanOrEqual(ks[i - 1]);
  });
});

describe('getMatchWindowInfo', () => {
  it('live durante M1', () => {
    expect(getMatchWindowInfo(new Date(m1Kick + 30 * 60_000)).state).toBe('live');
  });

  it('live exactamente en kickoff − 15 min', () => {
    expect(getMatchWindowInfo(new Date(m1Kick - 15 * 60_000)).state).toBe('live');
  });

  it('matchday justo antes de abrirse la ventana live', () => {
    const info = getMatchWindowInfo(new Date(m1Kick - 15 * 60_000 - 1_000));
    expect(info.state).toBe('matchday');
    expect(info.msToNextLiveWindow).toBe(1_000);
  });

  it('live exactamente en kickoff + 3 h', () => {
    expect(getMatchWindowInfo(new Date(m1Kick + 3 * 3_600_000)).state).toBe('live');
  });

  it('matchday horas antes del primer partido del día', () => {
    expect(getMatchWindowInfo(new Date(m1Kick - 6 * 3_600_000)).state).toBe('matchday');
  });

  it('idle antes del torneo, con próxima ventana en el futuro', () => {
    const info = getMatchWindowInfo(new Date('2026-08-01T12:00:00Z'));
    expect(info.state).toBe('idle');
    expect(info.msToNextLiveWindow).toBeGreaterThan(0);
  });

  it('idle tras la final + 3 h, sin más ventanas', () => {
    const info = getMatchWindowInfo(new Date('2027-06-06T12:00:00Z'));
    expect(info.state).toBe('idle');
    expect(info.msToNextLiveWindow).toBeNull();
  });
});
