// Elo-style strength ratings for UEFA Champions League 2026/27 clubs.
// Scale ~1300–2050. Used as synthetic fallback when bookmaker odds are unavailable.
// Source: Club Elo / Opta / Outright betting odds.
export const TEAM_STRENGTH: Record<string, number> = {
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
} as const;
