// Elo-style strength ratings for all 48 World Cup 2026 teams.
// Scale ~1300–2050. Used as synthetic fallback when bookmaker odds are unavailable.
// Source: FIFA world ranking positions (early 2026) mapped to an Elo-compatible scale.
export const TEAM_STRENGTH: Record<string, number> = {
  // Group A
  MEX: 1710, RSA: 1500, KOR: 1650, CZE: 1540,
  // Group B
  CAN: 1720, BIH: 1490, QAT: 1460, SUI: 1720,
  // Group C
  BRA: 1950, MAR: 1810, HAI: 1330, SCO: 1530,
  // Group D
  USA: 1780, PAR: 1560, AUS: 1620, TUR: 1690,
  // Group E
  GER: 1870, CUW: 1310, CIV: 1590, ECU: 1640,
  // Group F
  NED: 1900, JPN: 1730, SWE: 1610, TUN: 1560,
  // Group G
  BEL: 1930, EGY: 1600, IRN: 1550, NZL: 1430,
  // Group H
  ESP: 1890, CPV: 1360, KSA: 1480, URU: 1800,
  // Group I
  FRA: 1990, SEN: 1750, IRQ: 1420, NOR: 1680,
  // Group J
  ARG: 2050, ALG: 1570, AUT: 1700, JOR: 1400,
  // Group K
  POR: 1920, COD: 1370, UZB: 1380, COL: 1740,
  // Group L
  ENG: 1960, CRO: 1770, GHA: 1630, PAN: 1390,
} as const;
