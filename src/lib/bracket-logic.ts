export interface TeamStats {
  id: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
  fairPlay: number;
  group: string;
}

export interface GroupStandingLike {
  teamId: string;
  points?: number;
  goalDiff?: number;
  goalsFor?: number;
}

export interface KnockoutMatchLike {
  matchId: string;
  round: string;
  teamA: string | null;
  teamB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  isPlayed: boolean;
  venue?: string;
  city?: string;
  timeSpain?: string;
  date?: string;
}

interface KnockoutSlotConfig {
  id: string;
  prevMatchA: string;
  prevMatchB: string;
}

interface KnockoutStructureLike {
  roundOf32: KnockoutSlotConfig[];
  roundOf16: KnockoutSlotConfig[];
  quarterfinals: KnockoutSlotConfig[];
  semifinals: KnockoutSlotConfig[];
  thirdPlace: KnockoutSlotConfig;
  final: KnockoutSlotConfig;
}

type MatchScheduleLike = Record<string, Pick<KnockoutMatchLike, 'venue' | 'city' | 'timeSpain' | 'date'>>;

export function calculateBestThirds(thirds: TeamStats[]): TeamStats[] {
  // Sort according to FIFA rules: 
  // 1. Points, 2. GD, 3. GF, 4. Fair Play
  const sorted = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.fairPlay - a.fairPlay;
  });

  return sorted.slice(0, 8);
}

function getTeamForSlot(
  slot: string,
  standings: Record<string, GroupStandingLike[]>,
  thirdsAssignment: Record<string, string>
): string | null {
  if (slot.startsWith('G-3-')) {
    return thirdsAssignment[slot] ?? null;
  }

  const slotPattern = /G-([A-L])-(\d)/;
  const match = slotPattern.exec(slot);
  if (!match) {
    return null;
  }

  const group = match[1];
  const position = Number.parseInt(match[2], 10) - 1;
  const groupStandings = standings[group];
  return groupStandings?.[position]?.teamId ?? null;
}

function getLoserId(match: KnockoutMatchLike | undefined): string | null {
  if (!match?.isPlayed || !match.winnerId) {
    return null;
  }

  if (match.teamA === match.winnerId) {
    return match.teamB;
  }

  if (match.teamB === match.winnerId) {
    return match.teamA;
  }

  return null;
}

function createMatchState(
  matchId: string,
  round: string,
  teamA: string | null,
  teamB: string | null,
  existing: KnockoutMatchLike | undefined,
  schedule: MatchScheduleLike
): KnockoutMatchLike {
  const scheduled = schedule[matchId];
  const teamsChanged = existing ? existing.teamA !== teamA || existing.teamB !== teamB : false;

  return {
    matchId,
    round,
    teamA,
    teamB,
    scoreA: teamsChanged ? null : existing?.scoreA ?? null,
    scoreB: teamsChanged ? null : existing?.scoreB ?? null,
    winnerId: teamsChanged ? null : existing?.winnerId ?? null,
    isPlayed: teamsChanged ? false : existing?.isPlayed ?? false,
    venue: existing?.venue ?? scheduled?.venue,
    city: existing?.city ?? scheduled?.city,
    timeSpain: existing?.timeSpain ?? scheduled?.timeSpain,
    date: existing?.date ?? scheduled?.date,
  };
}

export function syncKnockoutBracket(
  standings: Record<string, GroupStandingLike[]>,
  currentKnockout: Record<string, KnockoutMatchLike>,
  knockoutStructure: KnockoutStructureLike,
  schedule: MatchScheduleLike = {}
): Record<string, KnockoutMatchLike> {
  const bestThirds = calculateBestThirds(
    Object.entries(standings)
      .filter(([, groupStandings]) => groupStandings.length > 2)
      .map(([group, groupStandings]) => ({
        id: groupStandings[2].teamId,
        points: groupStandings[2].points ?? 0,
        goalDifference: groupStandings[2].goalDiff ?? 0,
        goalsFor: groupStandings[2].goalsFor ?? 0,
        fairPlay: 0,
        group,
      }))
  );
  const thirdsAssignment = assignBestThirds(bestThirds);
  const updated: Record<string, KnockoutMatchLike> = {};

  for (const match of knockoutStructure.roundOf32) {
    updated[match.id] = createMatchState(
      match.id,
      'roundOf32',
      getTeamForSlot(match.prevMatchA, standings, thirdsAssignment),
      getTeamForSlot(match.prevMatchB, standings, thirdsAssignment),
      currentKnockout[match.id],
      schedule
    );
  }

  const dependentRounds: Array<{ round: keyof KnockoutStructureLike; roundName: string }> = [
    { round: 'roundOf16', roundName: 'roundOf16' },
    { round: 'quarterfinals', roundName: 'quarterfinals' },
    { round: 'semifinals', roundName: 'semifinals' },
  ];

  for (const { round, roundName } of dependentRounds) {
    for (const match of knockoutStructure[round] as KnockoutSlotConfig[]) {
      updated[match.id] = createMatchState(
        match.id,
        roundName,
        updated[match.prevMatchA]?.winnerId ?? null,
        updated[match.prevMatchB]?.winnerId ?? null,
        currentKnockout[match.id],
        schedule
      );
    }
  }

  updated[knockoutStructure.thirdPlace.id] = createMatchState(
    knockoutStructure.thirdPlace.id,
    'thirdPlace',
    getLoserId(updated[knockoutStructure.thirdPlace.prevMatchA]),
    getLoserId(updated[knockoutStructure.thirdPlace.prevMatchB]),
    currentKnockout[knockoutStructure.thirdPlace.id],
    schedule
  );

  updated[knockoutStructure.final.id] = createMatchState(
    knockoutStructure.final.id,
    'final',
    updated[knockoutStructure.final.prevMatchA]?.winnerId ?? null,
    updated[knockoutStructure.final.prevMatchB]?.winnerId ?? null,
    currentKnockout[knockoutStructure.final.id],
    schedule
  );

  return updated;
}


const THIRD_POOLS: Record<string, string[]> = {
  'G-3-1': ['A', 'B', 'C', 'D', 'F'],
  'G-3-2': ['C', 'D', 'F', 'G', 'H'],
  'G-3-3': ['B', 'E', 'F', 'I', 'J'],
  'G-3-4': ['A', 'E', 'H', 'I', 'J'],
  'G-3-5': ['C', 'E', 'F', 'H', 'I'],
  'G-3-6': ['E', 'H', 'I', 'J', 'K'],
  'G-3-7': ['E', 'F', 'G', 'I', 'J'],
  'G-3-8': ['D', 'E', 'I', 'J', 'L'],
};

export function assignBestThirds(bestThirds: TeamStats[]): Record<string, string> {
  const result: Record<string, string> = {};
  const slots = Object.keys(THIRD_POOLS);
  const usedTeams = new Set<string>();

  function solve(slotIdx: number): boolean {
    if (slotIdx === slots.length) return true;

    const slot = slots[slotIdx];
    const allowedGroups = THIRD_POOLS[slot];

    for (const team of bestThirds) {
      if (!usedTeams.has(team.id) && allowedGroups.includes(team.group)) {
        result[slot] = team.id;
        usedTeams.add(team.id);
        if (solve(slotIdx + 1)) return true;
        usedTeams.delete(team.id);
        delete result[slot];
      }
    }
    return false;
  }

  solve(0);
  return result;
}

export function generateKnockoutMatches(groups: Record<string, TeamStats[]>) {
  // Extract 1st, 2nd and 3rd
  const groupWinners: TeamStats[] = [];
  const groupRunnersUp: TeamStats[] = [];
  const groupThirds: TeamStats[] = [];

  for (const groupName in groups) {
    const groupTeams = groups[groupName];
    // assume groupTeams is already sorted by group standing
    if (groupTeams.length > 0) groupWinners.push(groupTeams[0]);
    if (groupTeams.length > 1) groupRunnersUp.push(groupTeams[1]);
    if (groupTeams.length > 2) groupThirds.push(groupTeams[2]);
  }

  const bestThirds = calculateBestThirds(groupThirds);
  const thirdsAssignment = assignBestThirds(bestThirds);
  
  return {
    groupWinners,
    groupRunnersUp,
    bestThirds,
    thirdsAssignment
  };
}

