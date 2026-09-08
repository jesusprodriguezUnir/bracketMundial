/**
 * Spain TV rights for UEFA Champions League 2026/27.
 *
 * Exclusive operators: Movistar Plus+ and Orange TV (M+ Liga de Campeones).
 * DAZN has no UCL rights this season. RTVE only has the final in the clear.
 *
 * Matchday 1 channel map: Mundo Deportivo / MARCA / ABC, 8 Sep 2026.
 * Later matchdays fall back to the dedicated M+ Liga de Campeones pack
 * until that week's listing is confirmed.
 */

export interface MatchBroadcast {
  /** Short badge, e.g. "M+ LC 2" or "Movistar+". */
  channel: string;
  /** Full channel names for the TV view. */
  channels: string[];
  /** On Movistar Plus+ dial 7 / Orange Fútbol 1 (one featured match per round). */
  featured: boolean;
}

const DEFAULT_BROADCAST: MatchBroadcast = {
  channel: 'M+ LC',
  channels: ['M+ Liga de Campeones'],
  featured: false,
};

const MD1_BROADCASTS: Record<string, MatchBroadcast> = {
  M1:  { channel: 'M+ LC 3', channels: ['M+ Liga de Campeones 3'], featured: false },
  M2:  { channel: 'M+ LC 2', channels: ['M+ Liga de Campeones 2'], featured: false },
  M3:  { channel: 'M+ LC 2', channels: ['M+ Liga de Campeones 2', 'M+ Liga de Campeones 4'], featured: false },
  M4:  { channel: 'M+ LC 4', channels: ['M+ Liga de Campeones 4', 'M+ Liga de Campeones 5'], featured: false },
  M5:  { channel: 'M+ LC 3', channels: ['M+ Liga de Campeones 3', 'M+ Liga de Campeones 4'], featured: false },
  M6:  {
    channel: 'Movistar+',
    channels: ['Movistar Plus+', 'Orange Fútbol 1', 'M+ Liga de Campeones', 'M+ Liga de Campeones 4', 'LaLiga TV Bar'],
    featured: true,
  },
  M7:  { channel: 'M+ LC', channels: ['M+ Liga de Campeones', 'LaLiga TV Bar'], featured: false },
  M8:  { channel: 'M+ LC 3', channels: ['M+ Liga de Campeones 3'], featured: false },
  M9:  { channel: 'M+ LC', channels: ['M+ Liga de Campeones', 'M+ Liga de Campeones 4', 'LaLiga TV Bar'], featured: false },
  M10: { channel: 'M+ LC 4', channels: ['M+ Liga de Campeones 4', 'M+ Liga de Campeones 5'], featured: false },
  M11: { channel: 'M+ LC 3', channels: ['M+ Liga de Campeones 3', 'M+ Liga de Campeones 4'], featured: false },
  M12: { channel: 'M+ LC 4', channels: ['M+ Liga de Campeones 4', 'M+ Liga de Campeones 6'], featured: false },
  M13: { channel: 'M+ LC 2', channels: ['M+ Liga de Campeones 2'], featured: false },
  M14: { channel: 'M+ LC 3', channels: ['M+ Liga de Campeones 3'], featured: false },
  M15: { channel: 'M+ LC', channels: ['M+ Liga de Campeones', 'M+ Liga de Campeones 4'], featured: false },
  M16: { channel: 'M+ LC 3', channels: ['M+ Liga de Campeones 3', 'M+ Liga de Campeones 4'], featured: false },
  M17: { channel: 'M+ LC 2', channels: ['M+ Liga de Campeones 2', 'M+ Liga de Campeones 4'], featured: false },
  M18: { channel: 'M+ LC 4', channels: ['M+ Liga de Campeones 4', 'M+ Liga de Campeones 5'], featured: false },
};

const FINAL_BROADCAST: MatchBroadcast = {
  channel: 'RTVE',
  channels: ['RTVE', 'M+ Liga de Campeones'],
  featured: true,
};

/**
 * Broadcast listing for a match. `teamA` / `teamB` are unused (kept so
 * calendar and modal call sites stay unchanged).
 */
export function getBroadcastInfo(
  matchId: string,
  _teamA?: string,
  _teamB?: string,
): MatchBroadcast {
  if (matchId === 'FIN-01') return FINAL_BROADCAST;
  return MD1_BROADCASTS[matchId] ?? DEFAULT_BROADCAST;
}
