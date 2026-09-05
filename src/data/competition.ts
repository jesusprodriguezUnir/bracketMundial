import { UCL_INGEST_META } from './ucl-ingest-meta';

export const COMPETITION_GROUP = 'LP';

export interface UefaStandingRow {
  teamId: string;
  points: number;
  goalDiff: number;
  goalsFor: number;
  awayGoals: number;
  won: number;
  awayWins: number;
  coefficient: number;
}

/** UEFA league-phase ranking: pts → GD → GF → away goals → wins → away wins → coefficient. */
export function compareUefaLeagueRows(a: UefaStandingRow, b: UefaStandingRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  if (b.awayGoals !== a.awayGoals) return b.awayGoals - a.awayGoals;
  if (b.won !== a.won) return b.won - a.won;
  if (b.awayWins !== a.awayWins) return b.awayWins - a.awayWins;
  if (b.coefficient !== a.coefficient) return b.coefficient - a.coefficient;
  return a.teamId.localeCompare(b.teamId);
}

export const COMPETITION = {
  id: 'ucl-2027',
  productName: 'Bracket Nights',
  groups: [COMPETITION_GROUP] as readonly string[],
  teamsPerGroup: 36,
  matchdays: 8,
  matchesPerMatchday: 18,
  leaguePhaseMatches: 144,
  hasThirdPlace: false,
  knockoutEnabled: false,
  persistKey: 'ucl-2027-tournament',
  personalSnapshotKey: 'ucl-2027-personal-snapshot',
  leaguesPersistKey: 'ucl-2027-leagues',
  rankBands: {
    automatic: { from: 1, to: 8 },
    playoff: { from: 9, to: 24 },
    out: { from: 25, to: 36 },
  },
  hiddenViews: ['stadiums', 'guide', 'broadcasting', 'knockout'] as const,
  predictionsOpen:
    UCL_INGEST_META.dumpMismatches === 0
    && UCL_INGEST_META.fixtures === 144
    && UCL_INGEST_META.teams === 36,
  /** UEFA club coefficients — last tie-break; 0 until a feed is wired. */
  coefficients: {} as Record<string, number>,
};

export function rankBand(position: number): 'automatic' | 'playoff' | 'out' {
  if (position <= COMPETITION.rankBands.automatic.to) return 'automatic';
  if (position <= COMPETITION.rankBands.playoff.to) return 'playoff';
  return 'out';
}

export function standingToUefaRow(
  s: {
    teamId: string;
    points: number;
    goalDiff: number;
    goalsFor: number;
    won: number;
    awayGoals?: number;
    awayWins?: number;
  },
): UefaStandingRow {
  return {
    teamId: s.teamId,
    points: s.points,
    goalDiff: s.goalDiff,
    goalsFor: s.goalsFor,
    awayGoals: s.awayGoals ?? 0,
    won: s.won,
    awayWins: s.awayWins ?? 0,
    coefficient: COMPETITION.coefficients[s.teamId] ?? 0,
  };
}
