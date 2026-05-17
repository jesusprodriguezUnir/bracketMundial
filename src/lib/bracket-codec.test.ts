import { describe, it, expect } from 'vitest';
import { encodeBracket, decodeBracket, encodeBracketCompact, decodeBracketCompact } from './bracket-codec';
import { initialGroupMatches, getKnockoutMatchOrder } from '../store/tournament-store';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';

function makeKnockoutMatches(scores: Partial<Record<string, [number, number, number?, number?]>>): Record<string, KnockoutMatchResult> {
  const result: Record<string, KnockoutMatchResult> = {};
  for (const matchId of getKnockoutMatchOrder()) {
    const s = scores[matchId];
    if (s) {
      const [scoreA, scoreB, penA, penB] = s;
      result[matchId] = {
        matchId, round: 'R32', teamA: 'AAA', teamB: 'BBB',
        scoreA, scoreB,
        penaltyScoreA: penA ?? null, penaltyScoreB: penB ?? null,
        winnerId: scoreA > scoreB ? 'AAA' : 'BBB', isPlayed: true,
      };
    }
  }
  return result;
}

describe('bracket-codec', () => {
  it('round-trip con marcadores de grupos', () => {
    const groupMatches: GroupMatchResult[] = initialGroupMatches.map((m, i) => ({
      ...m, scoreA: i % 4, scoreB: (i + 1) % 3,
    }));
    const knockout: Record<string, KnockoutMatchResult> = {};

    const encoded = encodeBracket(groupMatches, knockout);
    const decoded = decodeBracket(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.groupScores).toHaveLength(initialGroupMatches.length);
    for (const [i, m] of initialGroupMatches.entries()) {
      const s = decoded!.groupScores.find(g => g.matchId === m.matchId);
      expect(s?.scoreA).toBe(i % 4);
      expect(s?.scoreB).toBe((i + 1) % 3);
    }
  });

  it('round-trip con partidos de knockout incluyendo penaltis', () => {
    const groupMatches = initialGroupMatches;
    const order = getKnockoutMatchOrder();
    const knockout = makeKnockoutMatches({
      [order[0]]: [2, 1],
      [order[1]]: [1, 1, 5, 4],
    });

    const encoded = encodeBracket(groupMatches, knockout);
    const decoded = decodeBracket(encoded);

    expect(decoded).not.toBeNull();
    const s0 = decoded!.knockoutScores.find(s => s.matchId === order[0]);
    expect(s0?.scoreA).toBe(2);
    expect(s0?.scoreB).toBe(1);
    expect(s0?.penaltyScoreA).toBeNull();

    const s1 = decoded!.knockoutScores.find(s => s.matchId === order[1]);
    expect(s1?.scoreA).toBe(1);
    expect(s1?.scoreB).toBe(1);
    expect(s1?.penaltyScoreA).toBe(5);
    expect(s1?.penaltyScoreB).toBe(4);
  });

  it('partidos sin marcar se codifican como null', () => {
    const encoded = encodeBracket(initialGroupMatches, {});
    const decoded = decodeBracket(encoded);
    expect(decoded!.groupScores.every(s => s.scoreA === null && s.scoreB === null)).toBe(true);
    expect(decoded!.knockoutScores.every(s => s.scoreA === null && s.scoreB === null)).toBe(true);
  });

  it('payload inválido devuelve null', () => {
    expect(decodeBracket('garbage')).toBeNull();
    expect(decodeBracket('v2|a|b')).toBeNull();
    expect(decodeBracket('')).toBeNull();
  });
});

describe('bracket-codec compacto', () => {
  it('round-trip compacto con marcadores de grupos', () => {
    const groupMatches: GroupMatchResult[] = initialGroupMatches.map((m, i) => ({
      ...m, scoreA: i % 4, scoreB: (i + 1) % 3,
    }));
    const knockout: Record<string, KnockoutMatchResult> = {};

    const encoded = encodeBracketCompact(groupMatches, knockout);
    const decoded = decodeBracketCompact(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.groupScores).toHaveLength(initialGroupMatches.length);
    for (const [i, m] of initialGroupMatches.entries()) {
      const s = decoded!.groupScores.find(g => g.matchId === m.matchId);
      expect(s?.scoreA).toBe(i % 4);
      expect(s?.scoreB).toBe((i + 1) % 3);
    }
  });

  it('round-trip compacto con knockout sin penales', () => {
    const order = getKnockoutMatchOrder();
    const knockout = makeKnockoutMatches({ [order[0]]: [2, 1] });
    const encoded = encodeBracketCompact(initialGroupMatches, knockout);
    const decoded = decodeBracketCompact(encoded);

    expect(decoded).not.toBeNull();
    const s0 = decoded!.knockoutScores.find(s => s.matchId === order[0]);
    expect(s0?.scoreA).toBe(2);
    expect(s0?.scoreB).toBe(1);
    expect(s0?.penaltyScoreA).toBeNull();
    expect(s0?.penaltyScoreB).toBeNull();
  });

  it('round-trip compacto con penales', () => {
    const order = getKnockoutMatchOrder();
    const knockout = makeKnockoutMatches({ [order[0]]: [1, 1, 5, 4] });
    const encoded = encodeBracketCompact(initialGroupMatches, knockout);
    const decoded = decodeBracketCompact(encoded);

    expect(decoded).not.toBeNull();
    const s0 = decoded!.knockoutScores.find(s => s.matchId === order[0]);
    expect(s0?.scoreA).toBe(1);
    expect(s0?.scoreB).toBe(1);
    expect(s0?.penaltyScoreA).toBe(5);
    expect(s0?.penaltyScoreB).toBe(4);
  });

  it('partidos sin marcar se codifican como null en compacto', () => {
    const encoded = encodeBracketCompact(initialGroupMatches, {});
    const decoded = decodeBracketCompact(encoded);
    expect(decoded!.groupScores.every(s => s.scoreA === null && s.scoreB === null)).toBe(true);
    expect(decoded!.knockoutScores.every(s => s.scoreA === null && s.scoreB === null)).toBe(true);
  });

  it('base64 inválido devuelve null', () => {
    expect(decodeBracketCompact('!!!!')).toBeNull();
    expect(decodeBracketCompact('')).toBeNull();
    expect(decodeBracketCompact('AA')).toBeNull();
  });

  it('versión desconocida devuelve null', () => {
    const order = getKnockoutMatchOrder();
    const knockout = makeKnockoutMatches({ [order[0]]: [2, 1] });
    const encoded = encodeBracketCompact(initialGroupMatches, knockout);
    const bytes = atob(encoded.replace(/-/g, '+').replace(/_/g, '/') + '==');
    const tampered = btoa(String.fromCharCode(0x01) + bytes.slice(1))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeBracketCompact(tampered)).toBeNull();
  });

  it('el formato compacto es significativamente más corto que el de texto', () => {
    const groupMatches: GroupMatchResult[] = initialGroupMatches.map((m, i) => ({
      ...m, scoreA: i % 4, scoreB: (i + 1) % 3,
    }));
    const order = getKnockoutMatchOrder();
    const knockout = makeKnockoutMatches({
      [order[0]]: [2, 1], [order[1]]: [1, 0], [order[2]]: [3, 1],
    });
    const compact = encodeBracketCompact(groupMatches, knockout);
    const legacy = encodeBracket(groupMatches, knockout);
    expect(compact.length).toBeLessThan(legacy.length * 0.7);
  });
});
