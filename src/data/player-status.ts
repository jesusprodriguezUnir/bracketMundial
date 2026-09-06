import playerStatusRaw from './player-status.json';

export type PlayerConditionStatus = 'injured' | 'doubt' | 'suspended' | 'available';

export interface PlayerCondition {
  id: string; // unique slug or ID
  playerName: string;
  normalizedName: string;
  teamId: string;
  playerNumber?: number;
  status: PlayerConditionStatus;
  diagnosis: string;
  duration?: string;
  probability?: string; // e.g. "0%", "50%"
  newsUrl?: string;
  newsTitle?: string;
  updatedAt: string;
}

export interface PlayerStatusData {
  updatedAt: string;
  matchday: number;
  conditions: PlayerCondition[];
}

const statusData: PlayerStatusData = playerStatusRaw as PlayerStatusData;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca la condición de un jugador por club y dorsal o nombre.
 */
export function getPlayerCondition(
  teamId: string,
  playerOrName: { number?: number; name: string } | string
): PlayerCondition | undefined {
  if (!teamId || !playerOrName) return undefined;
  const tid = teamId.toUpperCase();
  const player = typeof playerOrName === 'string' ? { name: playerOrName } : playerOrName;
  const normPlayerName = normalize(player.name);
  const playerLastName = normPlayerName.split(/\s+/).at(-1) ?? normPlayerName;

  return statusData.conditions.find(cond => {
    if (cond.teamId.toUpperCase() !== tid) return false;
    if (player.number && cond.playerNumber && player.number === cond.playerNumber) {
      return true;
    }
    const condNorm = cond.normalizedName || normalize(cond.playerName);
    if (condNorm === normPlayerName) return true;
    if (condNorm.includes(playerLastName) || normPlayerName.includes(condNorm)) {
      return true;
    }
    return false;
  });
}

/**
 * Devuelve todas las condiciones activas para un equipo.
 */
export function getTeamConditions(teamId: string): PlayerCondition[] {
  if (!teamId) return [];
  const tid = teamId.toUpperCase();
  return statusData.conditions.filter(c => c.teamId.toUpperCase() === tid);
}

/**
 * Metadata visual para cada tipo de estado.
 */
export const STATUS_META: Record<
  PlayerConditionStatus,
  { icon: string; label: string; labelEs: string; labelEn: string; color: string; bg: string }
> = {
  injured: {
    icon: '🚑',
    label: 'Baja médica',
    labelEs: 'Baja médica',
    labelEn: 'Injured',
    color: 'var(--retro-red, #dc2626)',
    bg: 'rgba(239, 68, 68, 0.15)',
  },
  doubt: {
    icon: '⚠️',
    label: 'Duda',
    labelEs: 'Duda',
    labelEn: 'Doubtful',
    color: '#d97706',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  suspended: {
    icon: '🟥',
    label: 'Sancionado',
    labelEs: 'Sancionado',
    labelEn: 'Suspended',
    color: '#b91c1c',
    bg: 'rgba(185, 28, 28, 0.2)',
  },
  available: {
    icon: '🟢',
    label: 'Alta médica',
    labelEs: 'Alta médica / Disponible',
    labelEn: 'Available',
    color: '#16a34a',
    bg: 'rgba(34, 197, 94, 0.15)',
  },
};
