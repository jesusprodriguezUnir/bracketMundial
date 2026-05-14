export type GroupLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  group: GroupLetter;
  flag: string;
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupMatch {
  id: string;
  group: GroupLetter;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  matchDay: number;
  date: string;
  venue: string;
  city: string;
}

export type TournamentPhase = 'groups' | 'roundOf32' | 'roundOf16' | 'quarterfinals' | 'semifinals' | 'thirdPlace' | 'final';

export interface KnockoutMatch {
  id: string;
  round: Exclude<TournamentPhase, 'groups' | 'final' | 'thirdPlace'>;
  phase: string;
  teamA: string | null;
  teamB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
  venue: string;
  city: string;
  date: string;
}