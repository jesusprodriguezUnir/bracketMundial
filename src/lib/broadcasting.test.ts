import { describe, expect, it } from 'vitest';
import { getBroadcastInfo } from './broadcasting';

describe('getBroadcastInfo (UCL 2026/27 Spain)', () => {
  it('marks Real Madrid–Inter as the featured Movistar+ match', () => {
    const info = getBroadcastInfo('M6', 'RMA', 'INT');
    expect(info.featured).toBe(true);
    expect(info.channel).toBe('Movistar+');
    expect(info.channels).toContain('Orange Fútbol 1');
  });

  it('assigns AEK–LASK to M+ Liga de Campeones 3', () => {
    const info = getBroadcastInfo('M1');
    expect(info.featured).toBe(false);
    expect(info.channel).toBe('M+ LC 3');
  });

  it('falls back to the dedicated pack for later matchdays', () => {
    const info = getBroadcastInfo('M40');
    expect(info.channel).toBe('M+ LC');
    expect(info.featured).toBe(false);
  });

  it('puts the final on RTVE in the clear', () => {
    const info = getBroadcastInfo('FIN-01');
    expect(info.channel).toBe('RTVE');
    expect(info.featured).toBe(true);
    expect(info.channels).toContain('RTVE');
  });
});
