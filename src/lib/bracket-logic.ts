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
  
  // Here we would use the specific FIFA lookup table for the 12-group format
  // For the sake of this mock, we just assign them in order.
  
  return {
    groupWinners,
    groupRunnersUp,
    bestThirds
  };
}
