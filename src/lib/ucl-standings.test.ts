import { describe, it, expect } from 'vitest';
import { recalculateStandings, type GroupMatchResult } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';
import { COMPETITION, COMPETITION_GROUP } from '../data/competition';

function match(
  teamA: string,
  teamB: string,
  scoreA: number,
  scoreB: number,
  id: string,
): GroupMatchResult {
  return {
    matchId: id,
    group: COMPETITION_GROUP,
    teamA,
    teamB,
    scoreA,
    scoreB,
    matchDay: 1,
  };
}

function ids() {
  return TEAMS_2026.map(t => t.id);
}

describe('recalculateStandings UEFA league phase', () => {
  it('isolates league persistence from the World Cup store', () => {
    expect(COMPETITION.persistKey).toBe('ucl-2027-tournament');
    expect(COMPETITION.leaguesPersistKey).toBe('ucl-2027-leagues');
  });

  it('returns a 36-row single table with empty scores', () => {
    const table = recalculateStandings([]);
    expect(Object.keys(table)).toEqual([...COMPETITION.groups]);
    expect(table[COMPETITION_GROUP]).toHaveLength(36);
    expect(table[COMPETITION_GROUP].map(s => s.teamId).sort()).toEqual([...ids()].sort());
  });

  it('points beat goal difference', () => {
    const [a, b, c, d] = ids();
    const table = recalculateStandings([
      match(a, c, 1, 0, 't1'),
      match(a, d, 1, 0, 't2'),
      match(b, c, 8, 0, 't3'),
    ]);
    const rowA = table[COMPETITION_GROUP].find(s => s.teamId === a)!;
    const rowB = table[COMPETITION_GROUP].find(s => s.teamId === b)!;
    expect(rowA.points).toBeGreaterThan(rowB.points);
    expect(rowB.goalDiff).toBeGreaterThan(rowA.goalDiff);
    const order = table[COMPETITION_GROUP].map(s => s.teamId);
    expect(order.indexOf(a)).toBeLessThan(order.indexOf(b));
  });

  it('equal points: GD beats GF', () => {
    const [a, b, x, y] = ids();
    const table = recalculateStandings([
      match(a, x, 2, 0, 't1'),
      match(b, y, 3, 2, 't2'),
    ]);
    const order = table[COMPETITION_GROUP].map(s => s.teamId);
    expect(order.indexOf(a)).toBeLessThan(order.indexOf(b));
  });

  it('equal points+GD+GF: away goals beat wins', () => {
    const [a, b, x, y, z, w, v] = ids();
    const table = recalculateStandings([
      match(a, x, 2, 1, 't1'),
      match(y, a, 1, 0, 't2'),
      match(b, z, 0, 0, 't3'),
      match(w, b, 1, 1, 't4'),
      match(b, v, 1, 1, 't5'),
    ]);
    const rowA = table[COMPETITION_GROUP].find(s => s.teamId === a)!;
    const rowB = table[COMPETITION_GROUP].find(s => s.teamId === b)!;
    expect(rowA.points).toBe(rowB.points);
    expect(rowA.goalDiff).toBe(rowB.goalDiff);
    expect(rowA.goalsFor).toBe(rowB.goalsFor);
    expect(rowB.awayGoals).toBeGreaterThan(rowA.awayGoals);
    expect(rowA.won).toBeGreaterThan(rowB.won);
    const order = table[COMPETITION_GROUP].map(s => s.teamId);
    expect(order.indexOf(b)).toBeLessThan(order.indexOf(a));
  });

  it('equal through wins: away wins decide', () => {
    const [a, b, x, y] = ids();
    const table = recalculateStandings([
      match(a, x, 1, 0, 't1'),
      match(y, a, 1, 1, 't2'),
      match(x, b, 0, 1, 't3'),
      match(b, y, 1, 1, 't4'),
    ]);
    const rowA = table[COMPETITION_GROUP].find(s => s.teamId === a)!;
    const rowB = table[COMPETITION_GROUP].find(s => s.teamId === b)!;
    expect(rowA.points).toBe(rowB.points);
    expect(rowA.goalDiff).toBe(rowB.goalDiff);
    expect(rowA.goalsFor).toBe(rowB.goalsFor);
    expect(rowA.awayGoals).toBe(rowB.awayGoals);
    expect(rowA.won).toBe(rowB.won);
    expect(rowB.awayWins).toBeGreaterThan(rowA.awayWins);
    const order = table[COMPETITION_GROUP].map(s => s.teamId);
    expect(order.indexOf(b)).toBeLessThan(order.indexOf(a));
  });
});
