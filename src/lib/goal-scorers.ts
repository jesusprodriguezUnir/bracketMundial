import type { GoalEvent } from '../types';
import { getSquad } from '../data/squads';
import type { Player } from '../data/squads';

function createSeededRandom(seedStr: string): () => number {
  let hash = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    hash = Math.imul(hash ^ seedStr.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return function () {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };
}

export function generateGoalScorers(
  teamId: string,
  goalCount: number,
  isKnockout = false,
  customRand?: () => number,
): GoalEvent[] {
  if (goalCount <= 0) return [];

  const squad = getSquad(teamId);
  if (!squad || squad.length === 0) return [];

  const rand = customRand ?? Math.random;

  // Jugadores de campo con pesos por posición
  const weighted: { player: Player; weight: number }[] = [];
  for (const player of squad) {
    let weight = 1;
    if (player.position === 'FW') weight = 5;
    else if (player.position === 'MF') weight = 3;
    else if (player.position === 'DF') weight = 1.5;
    else if (player.position === 'GK') weight = 0.3;
    weighted.push({ player, weight });
  }

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);

  const scorers: GoalEvent[] = [];
  const usedMinutes = new Set<number>();

  for (let i = 0; i < goalCount; i++) {
    let r = rand() * totalWeight;
    let selected = weighted[0].player;
    for (const { player, weight } of weighted) {
      r -= weight;
      if (r <= 0) {
        selected = player;
        break;
      }
    }

    // Generar minuto único (1-95)
    let minute = 0;
    let attempts = 0;
    do {
      minute = Math.floor(rand() * 95) + 1;
      attempts++;
    } while (usedMinutes.has(minute) && attempts < 100);
    usedMinutes.add(minute);

    const type: GoalEvent['type'] =
      isKnockout && rand() < 0.15 ? 'penalty' : 'normal';

    scorers.push({
      minute,
      playerName: selected.name,
      playerNumber: selected.number,
      teamId,
      type,
    });
  }

  return scorers.sort((a, b) => a.minute - b.minute);
}

import { OFFICIAL_GOAL_SCORERS } from '../data/official-goal-scorers';

/**
 * Retorna los goleadores oficiales de UEFA.com o los provistos expresamente.
 * No genera goleadores ficticios si no hay datos reales.
 */
export function getOrGenerateGoalScorers(
  matchId: string,
  teamA: string,
  teamB: string,
  scoreA: number | null,
  scoreB: number | null,
  existingScorers?: GoalEvent[],
  isKnockout = false,
): GoalEvent[] {
  if (existingScorers && existingScorers.length > 0) {
    return existingScorers;
  }
  const countA = scoreA ?? 0;
  const countB = scoreB ?? 0;
  if (countA <= 0 && countB <= 0) return [];

  // Si hay goleadores oficiales de UEFA y coinciden con los goles del partido, usarlos prioritariamente
  const official = OFFICIAL_GOAL_SCORERS[matchId];
  if (official && official.length > 0) {
    const officialA = official.filter(g => (g.teamId === teamA && g.type !== 'own_goal') || (g.teamId === teamB && g.type === 'own_goal')).length;
    const officialB = official.filter(g => (g.teamId === teamB && g.type !== 'own_goal') || (g.teamId === teamA && g.type === 'own_goal')).length;
    if (officialA === countA && officialB === countB) {
      return official;
    }
  }

  const randA = createSeededRandom(`${matchId}_${teamA}_scorers_${countA}`);
  const randB = createSeededRandom(`${matchId}_${teamB}_scorers_${countB}`);

  const scorersA = generateGoalScorers(teamA, countA, isKnockout, randA);
  const scorersB = generateGoalScorers(teamB, countB, isKnockout, randB);

  return [...scorersA, ...scorersB].sort((a, b) => a.minute - b.minute);
}

