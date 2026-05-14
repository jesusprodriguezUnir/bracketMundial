export interface TeamStats {
  id: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
  fairPlay: number;
  group: string;
}

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

