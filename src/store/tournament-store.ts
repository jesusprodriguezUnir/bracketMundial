import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TEAMS_2026, generateGroupMatches, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { calculateBestThirds, assignBestThirds } from '../lib/bracket-logic';
import type { TeamStats } from '../lib/bracket-logic';


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

export interface GroupMatchResult {
  matchId: string;
  group: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  matchDay: number;
  date?: string;
  venue?: string;
  city?: string;
}

export interface KnockoutMatchResult {
  matchId: string;
  round: string;
  teamA: string | null;
  teamB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  isPlayed: boolean;
}

interface TournamentState {
  groupMatches: GroupMatchResult[];
  groupStandings: Record<string, GroupStanding[]>;
  knockoutMatches: Record<string, KnockoutMatchResult>;
  activePhase: 'groups' | 'round16' | 'quarterfinals' | 'semifinals' | 'thirdplace' | 'final';
  selectedMatch: string | null;

  setGroupMatchResult: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  setKnockoutMatchResult: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  setActivePhase: (phase: TournamentState['activePhase']) => void;
  setSelectedMatch: (matchId: string | null) => void;
  resetTournament: () => void;
  autoSimulateGroups: () => void;
  autoSimulateKnockout: () => void;
  initializeKnockoutFromGroups: () => void;
  getBestThirds: () => TeamStats[];
  getTournamentExportData: () => {
    groupMatches: GroupMatchResult[];
    groupStandings: Record<string, GroupStanding[]>;
    knockoutMatches: Record<string, KnockoutMatchResult>;
    activePhase: TournamentState['activePhase'];
  };
  exportTournament: () => void;
  importTournament: (jsonData: string) => boolean;
}

function createInitialStandings(): Record<string, GroupStanding[]> {
  const standings: Record<string, GroupStanding[]> = {};
  for (const group of 'ABCDEFGHIJKL'.split('')) {
    const groupTeams = TEAMS_2026.filter(t => t.group === group);
    standings[group] = groupTeams.map(t => ({
      teamId: t.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    }));
  }
  return standings;
}

function recalculateStandings(matches: GroupMatchResult[], _standings: Record<string, GroupStanding[]>): Record<string, GroupStanding[]> {
  const newStandings = createInitialStandings();

  for (const match of matches) {
    if (match.scoreA === null || match.scoreB === null) continue;

    for (const group of 'ABCDEFGHIJKL'.split('')) {
      if (match.group !== group) continue;

      for (const standing of newStandings[group]) {
        if (standing.teamId === match.teamA) {
          standing.played++;
          standing.goalsFor += match.scoreA;
          standing.goalsAgainst += match.scoreB;
          standing.goalDiff = standing.goalsFor - standing.goalsAgainst;
          if (match.scoreA > match.scoreB) { standing.won++; standing.points += 3; }
          else if (match.scoreA === match.scoreB) { standing.drawn++; standing.points += 1; }
          else { standing.lost++; }
        }
        if (standing.teamId === match.teamB) {
          standing.played++;
          standing.goalsFor += match.scoreB;
          standing.goalsAgainst += match.scoreA;
          standing.goalDiff = standing.goalsFor - standing.goalsAgainst;
          if (match.scoreB > match.scoreA) { standing.won++; standing.points += 3; }
          else if (match.scoreA === match.scoreB) { standing.drawn++; standing.points += 1; }
          else { standing.lost++; }
        }
      }
    }
  }

  for (const group of 'ABCDEFGHIJKL'.split('')) {
    newStandings[group].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
  }

  return newStandings;
}

function mapThirds(standings: Record<string, GroupStanding[]>): TeamStats[] {
  const thirds: TeamStats[] = [];
  for (const group of 'ABCDEFGHIJKL'.split('')) {
    const gs = standings[group];
    if (gs && gs.length > 2) {
      thirds.push({
        id: gs[2].teamId,
        points: gs[2].points,
        goalDifference: gs[2].goalDiff,
        goalsFor: gs[2].goalsFor,
        fairPlay: 0,
        group,
      });
    }
  }
  return thirds;
}

const initialGroupMatches: GroupMatchResult[] = generateGroupMatches();

function buildTournamentExportData(state: Pick<TournamentState, 'groupMatches' | 'groupStandings' | 'knockoutMatches' | 'activePhase'>) {
  return {
    groupMatches: state.groupMatches,
    groupStandings: state.groupStandings,
    knockoutMatches: state.knockoutMatches,
    activePhase: state.activePhase,
  };
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, _get) => ({
      groupMatches: initialGroupMatches,
      groupStandings: createInitialStandings(),
      knockoutMatches: {},
      activePhase: 'groups',
      selectedMatch: null,

      setGroupMatchResult: (matchId, scoreA, scoreB) => {
        set(state => {
          const matches = state.groupMatches.map(m =>
            m.matchId === matchId ? { ...m, scoreA, scoreB } : m
          );
          const standings = recalculateStandings(matches, state.groupStandings);
          const newState = { ...state, groupMatches: matches, groupStandings: standings };
          
          // Dynamically sync R32
          const knockout = syncRoundOf32(newState.groupStandings, newState.knockoutMatches);
          return { ...newState, knockoutMatches: knockout };
        });
      },

      setKnockoutMatchResult: (matchId, scoreA, scoreB) => {
        set(state => {
          const match = state.knockoutMatches[matchId];
          const isPlayed = scoreA !== null && scoreB !== null;
          const winnerId = isPlayed
            ? (scoreA! > scoreB! ? match?.teamA ?? null : match?.teamB ?? null)
            : null;

          const updated = {
            ...state.knockoutMatches,
            [matchId]: {
              ...match,
              scoreA,
              scoreB,
              winnerId,
              isPlayed,
            },
          };

          // Update progression
          const nextMatch = getNextMatchId(matchId);
          if (nextMatch) {
            const next = updated[nextMatch];
            if (next) {
              const isA = isTeamAPosition(matchId);
              updated[nextMatch] = {
                ...next,
                teamA: isA ? winnerId : next.teamA,
                teamB: isA ? next.teamB : winnerId,
              };
              
              // If match is cleared, recursively clear forward? 
              // For now, just set the team to null.
            }
          }

          const tpMatch = getThirdPlaceMatchId(matchId);
          if (tpMatch) {
            const tp = updated[tpMatch];
            if (tp) {
              const isA = isThirdPlaceTeamAPosition(matchId);
              updated[tpMatch] = {
                ...tp,
                teamA: isA ? winnerId : tp.teamA,
                teamB: isA ? tp.teamB : winnerId,
              };
            }
          }

          return { knockoutMatches: updated };
        });
      },

      setActivePhase: (phase) => set({ activePhase: phase }),
      setSelectedMatch: (matchId) => set({ selectedMatch: matchId }),
      resetTournament: () => set({
        groupMatches: initialGroupMatches,
        groupStandings: createInitialStandings(),
        knockoutMatches: {},
        activePhase: 'groups',
        selectedMatch: null,
      }),

      autoSimulateGroups: () => {
        set(state => {
          const matches = state.groupMatches.map(m => ({
            ...m,
            scoreA: Math.floor(Math.random() * 5),
            scoreB: Math.floor(Math.random() * 5),
          }));
          const standings = recalculateStandings(matches, state.groupStandings);
          return { groupMatches: matches, groupStandings: standings };
        });
      },

      autoSimulateKnockout: () => {
        set(state => {
          const updated = { ...state.knockoutMatches };
          for (const matchId in updated) {
            const m = updated[matchId];
            if (m.teamA && m.teamB && !m.isPlayed) {
              const scoreA = Math.floor(Math.random() * 4);
              const scoreB = Math.floor(Math.random() * 4);
              const winnerId = scoreA > scoreB ? m.teamA : m.teamB;

              updated[matchId] = { ...m, scoreA, scoreB, winnerId, isPlayed: true };

              const nextMatch = getNextMatchId(matchId);
              if (nextMatch && winnerId) {
                const next = updated[nextMatch];
                if (next) {
                  const isA = isTeamAPosition(matchId);
                  updated[nextMatch] = {
                    ...next,
                    teamA: isA ? winnerId : next.teamA,
                    teamB: isA ? next.teamB : winnerId,
                  };
                }
              }

              const tpMatch = getThirdPlaceMatchId(matchId);
              if (tpMatch && winnerId) {
                const tp = updated[tpMatch];
                if (tp) {
                  const isA = isThirdPlaceTeamAPosition(matchId);
                  updated[tpMatch] = {
                    ...tp,
                    teamA: isA ? winnerId : tp.teamA,
                    teamB: isA ? tp.teamB : winnerId,
                  };
                }
              }
            }
          }
          return { knockoutMatches: updated };
        });
      },

      

      initializeKnockoutFromGroups: () => {
        const state = _get();
        const knockout = syncRoundOf32(state.groupStandings, state.knockoutMatches);
        set({ knockoutMatches: knockout });
      },

      getBestThirds: () => calculateBestThirds(mapThirds(_get().groupStandings)),

      getTournamentExportData: () => buildTournamentExportData(_get()),

      exportTournament: () => {
        const dataStr = JSON.stringify(buildTournamentExportData(_get()), null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'bracket-mundial-2026.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },

      importTournament: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed.groupMatches && parsed.groupStandings) {
            set({
              groupMatches: parsed.groupMatches,
              groupStandings: parsed.groupStandings,
              knockoutMatches: parsed.knockoutMatches || {},
              activePhase: parsed.activePhase || 'groups',
              selectedMatch: null,
            });
            return true;
          }
          return false;
        } catch (e) {
          console.error("Error parsing tournament data:", e);
          return false;
        }
      },
    }),
    {
      name: 'mundial-2026-tournament',
      merge: (persisted, current) => {
        const p = persisted as Partial<typeof current>;
        if (p.groupMatches) {
          p.groupMatches = p.groupMatches.map(m => {
            if (!m.date || !m.venue || !m.city) {
              const fresh = initialGroupMatches.find(f => f.matchId === m.matchId);
              return fresh ? { ...m, date: fresh.date, venue: fresh.venue, city: fresh.city } : m;
            }
            return m;
          });
        }
        return { ...current, ...p };
      },
    }
  )
);

function getTeamForSlot(
  slot: string,
  thirdsAssignment: Record<string, string>,
  standings: Record<string, GroupStanding[]>
 ): string | null {
  if (slot.startsWith('G-3-')) {
    return thirdsAssignment[slot] ?? null;
  }

  const match = slot.match(/G-([A-L])-(\d)/);
  if (match) {
    const pos = parseInt(match[2]);
    const group = match[1];
    const groupStandings = standings[group];
    
    if (!groupStandings || !groupStandings[pos - 1]) return null;
    
    // For now, return the team currently in that position
    return groupStandings[pos - 1].teamId;
  }
  return null;
}

function syncRoundOf32(
  standings: Record<string, GroupStanding[]>, 
  currentKnockout: Record<string, KnockoutMatchResult>
): Record<string, KnockoutMatchResult> {
  const bestThirds = calculateBestThirds(mapThirds(standings));
  const thirdsAssignment = assignBestThirds(bestThirds);
  
  const updated = { ...currentKnockout };

  // Ensure R32 matches exist
  for (const r32 of KNOCKOUT_BRACKET.roundOf32) {
    const existing = updated[r32.id];
    
    // We only update teamA/teamB if the match hasn't been played yet
    // OR we always update them and the user just has to be careful?
    // Usually, if the group changes, the R32 changes.
    const teamA = getTeamForSlot(r32.prevMatchA, thirdsAssignment, standings);
    const teamB = getTeamForSlot(r32.prevMatchB, thirdsAssignment, standings);

    updated[r32.id] = {
      matchId: r32.id,
      round: 'roundOf32',
      teamA,
      teamB,
      scoreA: existing?.scoreA ?? null,
      scoreB: existing?.scoreB ?? null,
      winnerId: existing?.winnerId ?? null,
      isPlayed: existing?.isPlayed ?? false,
    };

    // If teams changed, clear winner/played? 
    if (existing && (existing.teamA !== teamA || existing.teamB !== teamB)) {
      updated[r32.id].winnerId = null;
      updated[r32.id].isPlayed = false;
      updated[r32.id].scoreA = null;
      updated[r32.id].scoreB = null;
    }
  }

  // Initialize other rounds if they don't exist
  const rounds = [
    { key: 'roundOf16', name: 'roundOf16' },
    { key: 'quarterfinals', name: 'quarterfinals' },
    { key: 'semifinals', name: 'semifinals' }
  ];

  for (const r of rounds) {
    for (const m of (KNOCKOUT_BRACKET as any)[r.key]) {
      if (!updated[m.id]) {
        updated[m.id] = {
          matchId: m.id,
          round: r.name,
          teamA: null,
          teamB: null,
          scoreA: null,
          scoreB: null,
          winnerId: null,
          isPlayed: false,
        };
      }
    }
  }

  if (!updated[KNOCKOUT_BRACKET.thirdPlace.id]) {
    updated[KNOCKOUT_BRACKET.thirdPlace.id] = {
      matchId: KNOCKOUT_BRACKET.thirdPlace.id,
      round: 'thirdPlace', teamA: null, teamB: null, scoreA: null, scoreB: null, winnerId: null, isPlayed: false
    };
  }
  if (!updated[KNOCKOUT_BRACKET.final.id]) {
    updated[KNOCKOUT_BRACKET.final.id] = {
      matchId: KNOCKOUT_BRACKET.final.id,
      round: 'final', teamA: null, teamB: null, scoreA: null, scoreB: null, winnerId: null, isPlayed: false
    };
  }

  return updated;
}

function getNextMatchId(currentId: string): string | null {
  const mapping: Record<string, string> = {
    'R32-01': 'R16-01', 'R32-02': 'R16-01',
    'R32-03': 'R16-02', 'R32-04': 'R16-02',
    'R32-05': 'R16-03', 'R32-06': 'R16-03',
    'R32-07': 'R16-04', 'R32-08': 'R16-04',
    'R32-09': 'R16-05', 'R32-10': 'R16-05',
    'R32-11': 'R16-06', 'R32-12': 'R16-06',
    'R32-13': 'R16-07', 'R32-14': 'R16-07',
    'R32-15': 'R16-08', 'R32-16': 'R16-08',
    'R16-01': 'QF-01', 'R16-02': 'QF-01',
    'R16-03': 'QF-02', 'R16-04': 'QF-02',
    'R16-05': 'QF-03', 'R16-06': 'QF-03',
    'R16-07': 'QF-04', 'R16-08': 'QF-04',
    'QF-01': 'SF-01', 'QF-02': 'SF-01',
    'QF-03': 'SF-02', 'QF-04': 'SF-02',
    'SF-01': 'FIN-01', 'SF-02': 'FIN-01',
  };

  return mapping[currentId] || null;
}

function isTeamAPosition(matchId: string): boolean {
  const aPositions = [
    'R32-01', 'R32-03', 'R32-05', 'R32-07', 'R32-09', 'R32-11', 'R32-13', 'R32-15',
    'R16-01', 'R16-03', 'R16-05', 'R16-07',
    'QF-01', 'QF-03', 'SF-01'
  ];
  return aPositions.includes(matchId);
}

function getThirdPlaceMatchId(currentId: string): string | null {
  if (currentId === 'SF-01' || currentId === 'SF-02') return 'TP-01';
  return null;
}

function isThirdPlaceTeamAPosition(matchId: string): boolean {
  return matchId === 'SF-01';
}