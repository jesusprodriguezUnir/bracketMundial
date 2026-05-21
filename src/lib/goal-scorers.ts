import type { GoalEvent } from '../types';
import { getSquad } from '../data/squads';
import type { Player } from '../data/squads';

export function generateGoalScorers(
  teamId: string,
  goalCount: number,
  isKnockout = false,
): GoalEvent[] {
  if (goalCount <= 0) return [];

  const squad = getSquad(teamId);
  if (!squad || squad.length === 0) return [];

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
    let r = Math.random() * totalWeight;
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
      minute = Math.floor(Math.random() * 95) + 1;
      attempts++;
    } while (usedMinutes.has(minute) && attempts < 100);
    usedMinutes.add(minute);

    const type: GoalEvent['type'] =
      isKnockout && Math.random() < 0.15 ? 'penalty' : 'normal';

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
