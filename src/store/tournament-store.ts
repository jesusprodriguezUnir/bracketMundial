import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { TEAMS_2026, generateGroupMatches, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { calculateBestThirds, syncKnockoutBracket } from '../lib/bracket-logic';
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
  timeSpain?: string;
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
  penaltyScoreA?: number | null;
  penaltyScoreB?: number | null;
  winnerId: string | null;
  isPlayed: boolean;
  venue?: string;
  city?: string;
  timeSpain?: string;
  date?: string;
}

interface TournamentState {
  groupMatches: GroupMatchResult[];
  groupStandings: Record<string, GroupStanding[]>;
  knockoutMatches: Record<string, KnockoutMatchResult>;
  activePhase: 'groups' | 'round16' | 'quarterfinals' | 'semifinals' | 'thirdplace' | 'final';
  selectedMatch: string | null;

  setGroupMatchResult: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  setKnockoutMatchResult: (
    matchId: string,
    scoreA: number | null,
    scoreB: number | null,
    penaltyScoreA?: number | null,
    penaltyScoreB?: number | null
  ) => void;
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

function hydrateGroupMatch(match: GroupMatchResult): GroupMatchResult {
  const fresh = initialGroupMatches.find(item => item.matchId === match.matchId);
  if (!fresh) return match;

  return {
    ...match,
    teamA: fresh.teamA,
    teamB: fresh.teamB,
    group: fresh.group,
    matchDay: fresh.matchDay,
    date: fresh.date,
    venue: fresh.venue,
    city: fresh.city,
    timeSpain: fresh.timeSpain,
  };
}

function hydrateKnockoutMatches(matches: Record<string, KnockoutMatchResult>): Record<string, KnockoutMatchResult> {
  return Object.fromEntries(
    Object.entries(matches).map(([matchId, match]) => {
      const scheduled = KNOCKOUT_SCHEDULE[matchId];
      if (!scheduled) return [matchId, match];

      return [
        matchId,
        {
          ...match,
          date: scheduled.date,
          venue: scheduled.venue,
          city: scheduled.city,
          timeSpain: scheduled.timeSpain,
        }
      ];
    })
  );
}

function buildTournamentExportData(state: Pick<TournamentState, 'groupMatches' | 'groupStandings' | 'knockoutMatches' | 'activePhase'>) {
  return {
    groupMatches: state.groupMatches,
    groupStandings: state.groupStandings,
    knockoutMatches: state.knockoutMatches,
    activePhase: state.activePhase,
  };
}

function resolveKnockoutMatches(
  standings: Record<string, GroupStanding[]>,
  knockoutMatches: Record<string, KnockoutMatchResult>
): Record<string, KnockoutMatchResult> {
  return syncKnockoutBracket(standings, knockoutMatches, KNOCKOUT_BRACKET, KNOCKOUT_SCHEDULE);
}

function getKnockoutMatchOrder(): string[] {
  return [
    ...KNOCKOUT_BRACKET.roundOf32.map(match => match.id),
    ...KNOCKOUT_BRACKET.roundOf16.map(match => match.id),
    ...KNOCKOUT_BRACKET.quarterfinals.map(match => match.id),
    ...KNOCKOUT_BRACKET.semifinals.map(match => match.id),
    KNOCKOUT_BRACKET.thirdPlace.id,
    KNOCKOUT_BRACKET.final.id,
  ];
}

function getWinnerId(
  teamA: string | null,
  teamB: string | null,
  scoreA: number | null,
  scoreB: number | null,
  penaltyScoreA: number | null = null,
  penaltyScoreB: number | null = null
): string | null {
  if (!teamA || !teamB || scoreA === null || scoreB === null) {
    return null;
  }

  if (scoreA === scoreB) {
    if (penaltyScoreA === null || penaltyScoreB === null || penaltyScoreA === penaltyScoreB) {
      return null;
    }

    return penaltyScoreA > penaltyScoreB ? teamA : teamB;
  }

  return scoreA > scoreB ? teamA : teamB;
}

export const useTournamentStore = createStore<TournamentState>()(
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

          return {
            groupMatches: matches,
            groupStandings: standings,
            knockoutMatches: resolveKnockoutMatches(standings, state.knockoutMatches),
          };
        });
      },

      setKnockoutMatchResult: (matchId, scoreA, scoreB, penaltyScoreA = null, penaltyScoreB = null) => {
        set(state => {
          const match = state.knockoutMatches[matchId];
          if (!match) {
            return state;
          }

          const isDrawAfterRegularTime = scoreA !== null && scoreB !== null && scoreA === scoreB;
          const resolvedPenaltyScoreA = isDrawAfterRegularTime ? penaltyScoreA : null;
          const resolvedPenaltyScoreB = isDrawAfterRegularTime ? penaltyScoreB : null;
          const winnerId = getWinnerId(match.teamA, match.teamB, scoreA, scoreB, resolvedPenaltyScoreA, resolvedPenaltyScoreB);
          const isPlayed = winnerId !== null;

          const updated = {
            ...state.knockoutMatches,
            [matchId]: {
              ...match,
              scoreA,
              scoreB,
              penaltyScoreA: resolvedPenaltyScoreA,
              penaltyScoreB: resolvedPenaltyScoreB,
              winnerId,
              isPlayed,
            },
          };

          return { knockoutMatches: resolveKnockoutMatches(state.groupStandings, updated) };
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
          return {
            groupMatches: matches,
            groupStandings: standings,
            knockoutMatches: resolveKnockoutMatches(standings, state.knockoutMatches),
          };
        });
      },

      autoSimulateKnockout: () => {
        set(state => {
          let updated = resolveKnockoutMatches(state.groupStandings, state.knockoutMatches);

          for (const matchId of getKnockoutMatchOrder()) {
            const match = updated[matchId];
            if (match?.teamA && match.teamB && !match.isPlayed) {
              let scoreA = Math.floor(Math.random() * 4);
              let scoreB = Math.floor(Math.random() * 4);
              let penaltyScoreA: number | null = null;
              let penaltyScoreB: number | null = null;

              if (scoreA === scoreB) {
                penaltyScoreA = 3 + Math.floor(Math.random() * 3);
                penaltyScoreB = 3 + Math.floor(Math.random() * 3);
                if (penaltyScoreA === penaltyScoreB) {
                  penaltyScoreB += 1;
                }
              }

              updated = resolveKnockoutMatches(state.groupStandings, {
                ...updated,
                [matchId]: {
                  ...match,
                  scoreA,
                  scoreB,
                  penaltyScoreA,
                  penaltyScoreB,
                  winnerId: getWinnerId(match.teamA, match.teamB, scoreA, scoreB, penaltyScoreA, penaltyScoreB),
                  isPlayed: true,
                },
              });
            }
          }

          return { knockoutMatches: updated };
        });
      },

      

      initializeKnockoutFromGroups: () => {
        const state = _get();
        const knockout = resolveKnockoutMatches(state.groupStandings, state.knockoutMatches);
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
          if (parsed.groupMatches) {
            const groupMatches = parsed.groupMatches.map((match: GroupMatchResult) => hydrateGroupMatch(match));
            const groupStandings = parsed.groupStandings ?? recalculateStandings(groupMatches, createInitialStandings());
            const knockoutMatches = resolveKnockoutMatches(
              groupStandings,
              hydrateKnockoutMatches(parsed.knockoutMatches || {})
            );

            set({
              groupMatches,
              groupStandings,
              knockoutMatches,
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
          p.groupMatches = p.groupMatches.map(m => hydrateGroupMatch(m));
        }
        if (p.knockoutMatches) {
          p.knockoutMatches = hydrateKnockoutMatches(p.knockoutMatches);
        }

        const groupMatches = p.groupMatches ?? current.groupMatches;
        const groupStandings = p.groupStandings ?? recalculateStandings(groupMatches, current.groupStandings);
        const knockoutMatches = resolveKnockoutMatches(groupStandings, p.knockoutMatches ?? current.knockoutMatches);

        return { ...current, ...p, groupMatches, groupStandings, knockoutMatches };
      },
    }
  )
);