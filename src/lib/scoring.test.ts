import { describe, it, expect } from 'vitest';
import { scoreBracket } from './scoring';
import type { DecodedBracket } from './bracket-codec';
import { initialGroupMatches, getKnockoutMatchOrder } from '../store/tournament-store';

function emptyBracket(): DecodedBracket {
  return {
    groupScores: initialGroupMatches.map(m => ({ matchId: m.matchId, scoreA: null, scoreB: null })),
    knockoutScores: getKnockoutMatchOrder().map(id => ({ matchId: id, scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null })),
  };
}

function withGroupScore(bracket: DecodedBracket, matchId: string, scoreA: number, scoreB: number): DecodedBracket {
  return {
    ...bracket,
    groupScores: bracket.groupScores.map(s => s.matchId === matchId ? { ...s, scoreA, scoreB } : s),
  };
}

describe('scoreBracket — grupos', () => {
  const matchId = initialGroupMatches[0].matchId;

  it('marcador exacto → 3 puntos', () => {
    const official = withGroupScore(emptyBracket(), matchId, 2, 1);
    const pred = withGroupScore(emptyBracket(), matchId, 2, 1);
    const { total, byRound } = scoreBracket(pred, official);
    expect(total).toBe(3);
    expect(byRound['groups']).toBe(3);
  });

  it('acierto de signo (1X2) → 1 punto', () => {
    const official = withGroupScore(emptyBracket(), matchId, 3, 0);
    const pred = withGroupScore(emptyBracket(), matchId, 1, 0);
    const { total, byRound } = scoreBracket(pred, official);
    expect(total).toBe(1);
    expect(byRound['groups']).toBe(1);
  });

  it('empate correcto sin marcador exacto → 1 punto', () => {
    const official = withGroupScore(emptyBracket(), matchId, 1, 1);
    const pred = withGroupScore(emptyBracket(), matchId, 2, 2);
    const { total } = scoreBracket(pred, official);
    expect(total).toBe(1);
  });

  it('predicción incorrecta → 0 puntos', () => {
    const official = withGroupScore(emptyBracket(), matchId, 2, 0);
    const pred = withGroupScore(emptyBracket(), matchId, 0, 1);
    const { total } = scoreBracket(pred, official);
    expect(total).toBe(0);
  });

  it('resultado oficial null → 0 puntos', () => {
    const official = emptyBracket();
    const pred = withGroupScore(emptyBracket(), matchId, 2, 1);
    const { total } = scoreBracket(pred, official);
    expect(total).toBe(0);
  });

  it('predicción sin score → 0 puntos aunque oficial tenga resultado', () => {
    const official = withGroupScore(emptyBracket(), matchId, 2, 1);
    const pred = emptyBracket();
    const { total } = scoreBracket(pred, official);
    expect(total).toBe(0);
  });

  it('bracket completamente vacío → 0 puntos', () => {
    const { total } = scoreBracket(emptyBracket(), emptyBracket());
    expect(total).toBe(0);
  });
});

describe('scoreBracket — eliminatorias', () => {
  it('sin resultados oficiales → 0 puntos', () => {
    const { total } = scoreBracket(emptyBracket(), emptyBracket());
    expect(total).toBe(0);
  });
});
