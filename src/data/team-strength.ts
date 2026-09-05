// Elo-style strength ratings for World Cup 2026 teams and UEFA Champions League 2026/27 clubs.
// Scale ~1300–2050. Used as synthetic fallback when bookmaker odds are unavailable.
// Source: FIFA world ranking positions & Club Elo / Opta / Outright betting odds.
export const TEAM_STRENGTH: Record<string, number> = {
  // --- UEFA Champions League 2026/27 (36 clubs) ---
  // Tier 1: Title contenders / Favorites
  MCI: 2040, RMA: 2030, ARS: 2010, LIV: 2010, BAY: 1990, BAR: 1980,
  // Tier 2: Top-8 direct qualification contenders
  INT: 1960, PSG: 1950, ATL: 1910, BVB: 1890, NAP: 1880,
  // Tier 3: Play-off upper seeds (positions 9–16)
  AVL: 1850, MUN: 1840, RBL: 1830, SPO: 1820, ROM: 1810, VIL: 1800, PSV: 1790,
  // Tier 4: Play-off contenders (positions 17–24)
  BET: 1780, FEY: 1770, FCP: 1760, VFB: 1750, LIL: 1740, GAL: 1730, FEN: 1720, BRU: 1710, RCL: 1700,
  // Tier 5: Underdogs / Potential dark horses
  SHK: 1670, SLP: 1660, BOD: 1640, COM: 1630, LSK: 1590, AEK: 1580, VIK: 1570, SLO: 1540, SAB: 1490,

  // --- World Cup 2026 (48 teams) ---
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

