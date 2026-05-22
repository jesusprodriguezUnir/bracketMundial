// Metadatos editoriales por selección para la Guía Mundial 2026.
// Indexados por código FIFA (misma clave que TEAMS_2026 / SQUADS).
//
// fifaRank   — posición en el ranking FIFA (aprox. ciclo clasificatorio 2026)
// worldCups  — número de participaciones en Copas del Mundo, incluida 2026
// stars      — títulos mundiales ganados (estrellas sobre el escudo)

export interface TeamMeta {
  fifaRank: number;
  worldCups: number;
  stars: number;
}

export const TEAM_META: Record<string, TeamMeta> = {
  // Grupo A
  MEX: { fifaRank: 14, worldCups: 18, stars: 0 },
  RSA: { fifaRank: 56, worldCups: 4, stars: 0 },
  KOR: { fifaRank: 23, worldCups: 12, stars: 0 },
  CZE: { fifaRank: 41, worldCups: 10, stars: 0 },
  // Grupo B
  CAN: { fifaRank: 31, worldCups: 3, stars: 0 },
  SUI: { fifaRank: 19, worldCups: 13, stars: 0 },
  QAT: { fifaRank: 51, worldCups: 2, stars: 0 },
  BIH: { fifaRank: 74, worldCups: 2, stars: 0 },
  // Grupo C
  BRA: { fifaRank: 5, worldCups: 23, stars: 5 },
  MAR: { fifaRank: 12, worldCups: 7, stars: 0 },
  SCO: { fifaRank: 38, worldCups: 9, stars: 0 },
  HAI: { fifaRank: 83, worldCups: 2, stars: 0 },
  // Grupo D
  USA: { fifaRank: 16, worldCups: 12, stars: 0 },
  PAR: { fifaRank: 54, worldCups: 9, stars: 0 },
  AUS: { fifaRank: 26, worldCups: 7, stars: 0 },
  TUR: { fifaRank: 27, worldCups: 4, stars: 0 },
  // Grupo E
  GER: { fifaRank: 9, worldCups: 21, stars: 4 },
  CUW: { fifaRank: 86, worldCups: 1, stars: 0 },
  CIV: { fifaRank: 40, worldCups: 4, stars: 0 },
  ECU: { fifaRank: 24, worldCups: 5, stars: 0 },
  // Grupo F
  NED: { fifaRank: 6, worldCups: 12, stars: 0 },
  JPN: { fifaRank: 17, worldCups: 8, stars: 0 },
  TUN: { fifaRank: 45, worldCups: 7, stars: 0 },
  SWE: { fifaRank: 28, worldCups: 13, stars: 0 },
  // Grupo G
  BEL: { fifaRank: 8, worldCups: 15, stars: 0 },
  EGY: { fifaRank: 33, worldCups: 4, stars: 0 },
  IRN: { fifaRank: 20, worldCups: 7, stars: 0 },
  NZL: { fifaRank: 89, worldCups: 3, stars: 0 },
  // Grupo H
  ESP: { fifaRank: 2, worldCups: 17, stars: 1 },
  URU: { fifaRank: 15, worldCups: 15, stars: 2 },
  KSA: { fifaRank: 58, worldCups: 7, stars: 0 },
  CPV: { fifaRank: 70, worldCups: 1, stars: 0 },
  // Grupo I
  FRA: { fifaRank: 3, worldCups: 17, stars: 2 },
  SEN: { fifaRank: 18, worldCups: 4, stars: 0 },
  NOR: { fifaRank: 30, worldCups: 4, stars: 0 },
  IRQ: { fifaRank: 57, worldCups: 2, stars: 0 },
  // Grupo J
  ARG: { fifaRank: 1, worldCups: 19, stars: 3 },
  AUT: { fifaRank: 22, worldCups: 8, stars: 0 },
  ALG: { fifaRank: 37, worldCups: 5, stars: 0 },
  JOR: { fifaRank: 64, worldCups: 1, stars: 0 },
  // Grupo K
  POR: { fifaRank: 7, worldCups: 9, stars: 0 },
  COL: { fifaRank: 13, worldCups: 7, stars: 0 },
  UZB: { fifaRank: 53, worldCups: 1, stars: 0 },
  COD: { fifaRank: 60, worldCups: 3, stars: 0 },
  // Grupo L
  ENG: { fifaRank: 4, worldCups: 17, stars: 1 },
  CRO: { fifaRank: 10, worldCups: 7, stars: 0 },
  GHA: { fifaRank: 72, worldCups: 5, stars: 0 },
  PAN: { fifaRank: 39, worldCups: 2, stars: 0 },
};

const FALLBACK_META: TeamMeta = { fifaRank: 0, worldCups: 1, stars: 0 };

export const getTeamMeta = (teamId: string): TeamMeta => TEAM_META[teamId] ?? FALLBACK_META;
