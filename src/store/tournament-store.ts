import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { TEAMS_2026, generateGroupMatches, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { calculateBestThirds, syncKnockoutBracket } from '../lib/bracket-logic';
import type { TeamStats } from '../lib/bracket-logic';
import { COMPETITION, compareUefaLeagueRows, standingToUefaRow } from '../data/competition';
import { TEAM_STRENGTH } from '../data/team-strength';
import { expectedProbabilities, sampleResult } from '../lib/odds-model';
import { ODDS_SEED } from '../data/odds/seed';
import { generateGoalScorers } from '../lib/goal-scorers';
import type { GoalEvent } from '../types';
import type { DecodedBracket } from '../lib/bracket-codec';
import type { LeagueParticipant } from './leagues-store';
import { getLeagueState } from './league-context-bridge';
import { GROUP_MATCHES } from '../data/match-schedule';

export type ActiveContext = { kind: 'personal' } | { kind: 'league'; leagueId: string };
export type ViewMode = 'predictions' | 'real';

interface BracketSnapshot {
  groupMatches: GroupMatchResult[];
  knockoutMatches: Record<string, KnockoutMatchResult>;
  myGroupPredictions: Record<string, { scoreA: number | null; scoreB: number | null }>;
  myKnockoutPredictions: Record<string, { scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }>;
  myTopScorerPrediction: { teamId: string; playerName: string } | null;
  myMvpPrediction: { teamId: string; playerName: string } | null;
}

let _personalSnapshot: BracketSnapshot | null = null;
const _leagueSnapshots: Record<string, BracketSnapshot> = {};

function _cloneSnapshot(state: TournamentState): BracketSnapshot {
  return {
    groupMatches: state.groupMatches.map(m => ({ ...m })),
    knockoutMatches: Object.fromEntries(
      Object.entries(state.knockoutMatches).map(([k, v]) => [k, { ...v }])
    ),
    myGroupPredictions: { ...state.myGroupPredictions },
    myKnockoutPredictions: { ...state.myKnockoutPredictions },
    myTopScorerPrediction: state.myTopScorerPrediction ? { ...state.myTopScorerPrediction } : null,
    myMvpPrediction: state.myMvpPrediction ? { ...state.myMvpPrediction } : null,
  };
}

function _participantToSnapshot(me: LeagueParticipant): BracketSnapshot {
  const groupScoreMap = new Map(me.groupScores.map(s => [s.matchId, s]));
  const groupMatches = initialGroupMatches.map(m => {
    const score = groupScoreMap.get(m.matchId);
    return score ? { ...m, scoreA: score.scoreA, scoreB: score.scoreB } : { ...m };
  });
  const groupStandings = recalculateStandings(groupMatches);
  let knockoutMatches = resolveKnockoutMatches(groupStandings, {});
  const kScoreMap = new Map(me.knockoutScores.map(s => [s.matchId, s]));
  for (const matchId of getKnockoutMatchOrder()) {
    const score = kScoreMap.get(matchId);
    const match = knockoutMatches[matchId];
    if (!match || !score || score.scoreA === null || score.scoreB === null) continue;
    const isDraw = score.scoreA === score.scoreB;
    const psa = isDraw ? score.penaltyScoreA : null;
    const psb = isDraw ? score.penaltyScoreB : null;
    const winnerId = getWinnerId(match.teamA, match.teamB, score.scoreA, score.scoreB, psa, psb);
    knockoutMatches = resolveKnockoutMatches(groupStandings, {
      ...knockoutMatches,
      [matchId]: { ...match, scoreA: score.scoreA, scoreB: score.scoreB, penaltyScoreA: psa, penaltyScoreB: psb, winnerId, isPlayed: winnerId !== null },
    });
  }
  const myGroupPredictions: Record<string, { scoreA: number | null; scoreB: number | null }> = {};
  const myKnockoutPredictions: Record<string, { scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }> = {};
  for (const s of me.groupScores) {
    myGroupPredictions[s.matchId] = { scoreA: s.scoreA, scoreB: s.scoreB };
  }
  for (const s of me.knockoutScores) {
    myKnockoutPredictions[s.matchId] = { scoreA: s.scoreA, scoreB: s.scoreB, penaltyScoreA: s.penaltyScoreA, penaltyScoreB: s.penaltyScoreB };
  }
  return {
    groupMatches,
    knockoutMatches,
    myGroupPredictions,
    myKnockoutPredictions,
    myTopScorerPrediction: me.topScorer ?? null,
    myMvpPrediction: me.mvp ?? null,
  };
}

function _defaultSnapshot(): BracketSnapshot {
  return {
    groupMatches: initialGroupMatches.map(m => ({ ...m })),
    knockoutMatches: {},
    myGroupPredictions: {},
    myKnockoutPredictions: {},
    myTopScorerPrediction: null,
    myMvpPrediction: null,
  };
}

// ── Persistencia local del snapshot personal (clave separada de la del torneo) ──
// Garantiza que las predicciones personales sobreviven a un recargo con contexto de liga activo.

const _PERSONAL_SNAPSHOT_LS_KEY = COMPETITION.personalSnapshotKey;

function _savePersonalToStorage(snapshot: BracketSnapshot): void {
  try {
    localStorage.setItem(_PERSONAL_SNAPSHOT_LS_KEY, JSON.stringify(snapshot));
  } catch { /* ignorar errores de cuota */ }
}

function _loadPersonalFromStorage(): BracketSnapshot | null {
  try {
    const raw = localStorage.getItem(_PERSONAL_SNAPSHOT_LS_KEY);
    return raw ? (JSON.parse(raw) as BracketSnapshot) : null;
  } catch { return null; }
}

// Persiste el snapshot de una liga en leagues-store (solo local, sin tocar la nube).
async function _persistLeagueSnapshotLocal(leagueId: string, snapshot: BracketSnapshot): Promise<void> {
  try {
    const { useLeaguesStore, findMyParticipant } = await import('./leagues-store');
    const { useAuthStore } = await import('./auth-store');
    const userId = useAuthStore.getState().session?.user.id ?? null;
    const league = useLeaguesStore.getState().leagues.find(l => l.id === leagueId);
    const me = findMyParticipant(league, userId);
    if (!me) return;
    const groupScores = snapshot.groupMatches.map(m => ({
      matchId: m.matchId,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
    }));
    const knockoutScores = getKnockoutMatchOrder().map(matchId => {
      const m = snapshot.knockoutMatches[matchId];
      return {
        matchId,
        scoreA: m?.scoreA ?? null,
        scoreB: m?.scoreB ?? null,
        penaltyScoreA: m?.penaltyScoreA ?? null,
        penaltyScoreB: m?.penaltyScoreB ?? null,
      };
    });
    useLeaguesStore.getState().updateParticipantScores(
      leagueId,
      me.id,
      groupScores,
      knockoutScores,
      snapshot.myTopScorerPrediction ?? undefined,
      snapshot.myMvpPrediction ?? undefined,
    );
  } catch { /* no bloquear el UI por errores de persistencia */ }
}

function _scoresToDecodedBracket(state: TournamentState): DecodedBracket {
  return {
    groupScores: state.groupMatches.map(m => ({
      matchId: m.matchId,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
    })),
    knockoutScores: getKnockoutMatchOrder().map(matchId => {
      const m = state.knockoutMatches[matchId];
      return {
        matchId,
        scoreA: m?.scoreA ?? null,
        scoreB: m?.scoreB ?? null,
        penaltyScoreA: m?.penaltyScoreA ?? null,
        penaltyScoreB: m?.penaltyScoreB ?? null,
      };
    }),
    topScorer: state.myTopScorerPrediction ?? undefined,
    mvp: state.myMvpPrediction ?? undefined,
  };
}

export function extractBracketData(state: TournamentState): DecodedBracket {
  return _scoresToDecodedBracket(state);
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
  awayGoals: number;
  awayWins: number;
}

export interface GroupMatchResult {
  matchId: string;
  group: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  goalScorers?: GoalEvent[];
  matchDay: number;
  date?: string;
  timeSpain?: string;
  venue?: string;
  city?: string;
  venueId?: string;
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
  goalScorers?: GoalEvent[];
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
  activeContext: ActiveContext;

  myGroupPredictions: Record<string, { scoreA: number | null; scoreB: number | null }>;
  myKnockoutPredictions: Record<string, { scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }>;
  myTopScorerPrediction: { teamId: string; playerName: string } | null;
  myMvpPrediction: { teamId: string; playerName: string } | null;

  viewMode: ViewMode;
  realGroupResults: Record<string, { scoreA: number | null; scoreB: number | null }>;
  realKnockoutResults: Record<string, { scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }>;

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
  switchContext: (ctx: ActiveContext) => Promise<void>;
  applySharedBracket: (data: {
    groupScores: Array<{ matchId: string; scoreA: number | null; scoreB: number | null }>;
    knockoutScores: Array<{ matchId: string; scoreA: number | null; scoreB: number | null; penaltyScoreA: number | null; penaltyScoreB: number | null }>;
    topScorer?: { teamId: string; playerName: string } | null;
    mvp?: { teamId: string; playerName: string } | null;
  }) => void;
  exportExcel: () => Promise<void>;
  importExcel: (file: File) => Promise<boolean>;
  setMyGroupPrediction: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  setMyKnockoutPrediction: (matchId: string, scoreA: number | null, scoreB: number | null, penaltyScoreA?: number | null, penaltyScoreB?: number | null) => void;
  setMyTopScorerPrediction: (topScorer: { teamId: string; playerName: string } | null) => void;
  setMyMvpPrediction: (mvp: { teamId: string; playerName: string } | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setRealGroupResult: (matchId: string, scoreA: number | null, scoreB: number | null) => void;
  setRealKnockoutResult: (matchId: string, scoreA: number | null, scoreB: number | null, penaltyScoreA?: number | null, penaltyScoreB?: number | null) => void;
  /** Reemplaza los resultados reales con el bracket oficial (Supabase `official_results`). */
  applyOfficialResults: (decoded: DecodedBracket) => void;
  /** Selector público: true si el partido puede editarse en el contexto activo. */
  isMatchEditable: (matchId: string) => boolean;
}

function emptyStanding(teamId: string): GroupStanding {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
    awayGoals: 0,
    awayWins: 0,
  };
}

function createInitialStandings(): Record<string, GroupStanding[]> {
  const standings: Record<string, GroupStanding[]> = {};
  for (const group of COMPETITION.groups) {
    const groupTeams = TEAMS_2026.filter(t => t.group === group);
    standings[group] = groupTeams.map(t => emptyStanding(t.id));
  }
  return standings;
}

export function recalculateStandings(matches: GroupMatchResult[]): Record<string, GroupStanding[]> {
  const newStandings = createInitialStandings();

  for (const match of matches) {
    if (match.scoreA === null || match.scoreB === null) continue;

    const groupStandings = newStandings[match.group];
    if (!groupStandings) continue;

    for (const standing of groupStandings) {
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
        standing.awayGoals += match.scoreB;
        if (match.scoreB > match.scoreA) {
          standing.won++;
          standing.awayWins++;
          standing.points += 3;
        } else if (match.scoreA === match.scoreB) {
          standing.drawn++;
          standing.points += 1;
        } else {
          standing.lost++;
        }
      }
    }
  }

  for (const group of COMPETITION.groups) {
    newStandings[group].sort((a, b) => compareUefaLeagueRows(standingToUefaRow(a), standingToUefaRow(b)));
  }

  return newStandings;
}

function mapThirds(standings: Record<string, GroupStanding[]>): TeamStats[] {
  if (!COMPETITION.hasThirdPlace) return [];
  const thirds: TeamStats[] = [];
  for (const group of COMPETITION.groups) {
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

export const initialGroupMatches: GroupMatchResult[] = generateGroupMatches();

export function getKnockoutMatchOrder(): string[] {
  return [
    ...KNOCKOUT_BRACKET.roundOf32.map(match => match.id),
    ...KNOCKOUT_BRACKET.roundOf16.map(match => match.id),
    ...KNOCKOUT_BRACKET.quarterfinals.map(match => match.id),
    ...KNOCKOUT_BRACKET.semifinals.map(match => match.id),
    KNOCKOUT_BRACKET.thirdPlace.id,
    KNOCKOUT_BRACKET.final.id,
  ];
}

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

function resolveKnockoutMatches(
  standings: Record<string, GroupStanding[]>,
  knockoutMatches: Record<string, KnockoutMatchResult>
): Record<string, KnockoutMatchResult> {
  if (!COMPETITION.knockoutEnabled) return knockoutMatches;
  return syncKnockoutBracket(standings, knockoutMatches, KNOCKOUT_BRACKET, KNOCKOUT_SCHEDULE);
}

export function getWinnerId(
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

/** Reconstruye partidos, standings y knockout a partir de los resultados reales. */
function buildRealModeState(
  state: Pick<TournamentState, 'groupMatches' | 'realGroupResults' | 'realKnockoutResults'>
): Pick<TournamentState, 'groupMatches' | 'groupStandings' | 'knockoutMatches'> {
  const matches = state.groupMatches.map(m => {
    const real = state.realGroupResults[m.matchId];
    return real
      ? { ...m, scoreA: real.scoreA, scoreB: real.scoreB, goalScorers: undefined }
      : { ...m, scoreA: null, scoreB: null, goalScorers: undefined };
  });
  const standings = recalculateStandings(matches);
  let knockout = resolveKnockoutMatches(standings, {});

  for (const matchId of getKnockoutMatchOrder()) {
    const real = state.realKnockoutResults[matchId];
    const match = knockout[matchId];
    if (!match || !real || real.scoreA === null || real.scoreB === null) continue;

    const isDraw = real.scoreA === real.scoreB;
    const psa = isDraw ? real.penaltyScoreA ?? null : null;
    const psb = isDraw ? real.penaltyScoreB ?? null : null;
    const winnerId = getWinnerId(match.teamA, match.teamB, real.scoreA, real.scoreB, psa, psb);
    knockout = resolveKnockoutMatches(standings, {
      ...knockout,
      [matchId]: { ...match, scoreA: real.scoreA, scoreB: real.scoreB, penaltyScoreA: psa, penaltyScoreB: psb, goalScorers: undefined, winnerId, isPlayed: winnerId !== null },
    });
  }

  return { groupMatches: matches, groupStandings: standings, knockoutMatches: knockout };
}

export const useTournamentStore = createStore<TournamentState>()(
  persist(
    (set, _get) => ({
      groupMatches: initialGroupMatches,
      groupStandings: createInitialStandings(),
      knockoutMatches: {},
      activePhase: 'groups',
      selectedMatch: null,
      activeContext: { kind: 'personal' } as ActiveContext,
      myGroupPredictions: {},
      myKnockoutPredictions: {},
      myTopScorerPrediction: null,
      myMvpPrediction: null,
      viewMode: 'predictions' as ViewMode,
      realGroupResults: {},
      realKnockoutResults: {},

      isMatchEditable: (matchId: string): boolean => {
        if (!COMPETITION.predictionsOpen) return false;
        const ctx = _get().activeContext;
        if (ctx.kind !== 'league') return true;
        const leagueId = (ctx as { kind: 'league'; leagueId: string }).leagueId;
        const league = getLeagueState(leagueId);
        if (!league) return true;
        // Si la liga está congelada: nunca editable
        if (league.frozen) return false;
        // Si el partido está en el rango lockedBeforeDate: no editable
        if (league.lockedBeforeDate) {
          const cutoff = league.lockedBeforeDate;
          const groupMatch = GROUP_MATCHES.find(m => m.matchId === matchId);
          if (groupMatch && groupMatch.date < cutoff) return false;
          const koDate = KNOCKOUT_SCHEDULE[matchId]?.date;
          if (koDate && koDate < cutoff) return false;
        }
        // Bloqueo estándar: fecha del partido ya pasó
        const today = new Date().toISOString().slice(0, 10);
        const groupDate = GROUP_MATCHES.find(m => m.matchId === matchId)?.date;
        const matchDate = groupDate ?? KNOCKOUT_SCHEDULE[matchId]?.date;
        if (matchDate && matchDate < today) return false;
        return true;
      },

      setGroupMatchResult: (matchId, scoreA, scoreB) => {
        set(state => {
          if (state.viewMode === 'real') {
            return state;
          }

          // Bloqueo de liga: no editar si el partido no es editable en contexto de liga
          if (!_get().isMatchEditable(matchId)) return state;

          const matches = state.groupMatches.map(m =>
            m.matchId === matchId ? { ...m, scoreA, scoreB } : m
          );
          const standings = recalculateStandings(matches);

          return {
            groupMatches: matches,
            groupStandings: standings,
            knockoutMatches: resolveKnockoutMatches(standings, state.knockoutMatches),
            myGroupPredictions: { ...state.myGroupPredictions, [matchId]: { scoreA, scoreB } },
          };
        });
      },

      setKnockoutMatchResult: (matchId, scoreA, scoreB, penaltyScoreA = null, penaltyScoreB = null) => {
        set(state => {
          if (state.viewMode === 'real') {
            return state;
          }

          // Bloqueo de liga: no editar si el partido no es editable en contexto de liga
          if (!_get().isMatchEditable(matchId)) return state;

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

          return {
            knockoutMatches: resolveKnockoutMatches(state.groupStandings, updated),
            myKnockoutPredictions: {
              ...state.myKnockoutPredictions,
              [matchId]: { scoreA, scoreB, penaltyScoreA: resolvedPenaltyScoreA, penaltyScoreB: resolvedPenaltyScoreB },
            },
          };
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
        activeContext: { kind: 'personal' } as ActiveContext,
        myGroupPredictions: {},
        myKnockoutPredictions: {},
        myTopScorerPrediction: null,
        myMvpPrediction: null,
        viewMode: 'predictions' as ViewMode,
        realGroupResults: {},
        realKnockoutResults: {},
      }),

      autoSimulateGroups: () => {
        set(state => {
          // Prefer cached feed from localStorage (6h), fall back to bundled seed
          let feedMatches: Record<string, { home: number; draw: number; away: number }> = {};
          try {
            const raw = localStorage.getItem('odds:feed:v2');
            if (raw) {
              const entry = JSON.parse(raw) as { data: { matches: Record<string, { home: number; draw: number; away: number }> }; ts: number };
              if (Date.now() - entry.ts < 6 * 60 * 60 * 1000) feedMatches = entry.data.matches;
            }
          } catch { /* ignore */ }
          if (Object.keys(feedMatches).length === 0) feedMatches = ODDS_SEED.matches;

          const matches = state.groupMatches.map(m => {
            const odds = feedMatches[m.matchId];
            const prob = odds ?? expectedProbabilities(
              TEAM_STRENGTH[m.teamA as keyof typeof TEAM_STRENGTH] ?? 1500,
              TEAM_STRENGTH[m.teamB as keyof typeof TEAM_STRENGTH] ?? 1500,
            );
            const result = sampleResult(prob);
            const goalScorers = [
              ...generateGoalScorers(m.teamA, result.scoreA),
              ...generateGoalScorers(m.teamB, result.scoreB),
            ];
            return { ...m, scoreA: result.scoreA, scoreB: result.scoreB, goalScorers };
          });
          const standings = recalculateStandings(matches);
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
              const prob = expectedProbabilities(
                TEAM_STRENGTH[match.teamA as keyof typeof TEAM_STRENGTH] ?? 1500,
                TEAM_STRENGTH[match.teamB as keyof typeof TEAM_STRENGTH] ?? 1500,
              );
              const result = sampleResult(prob, Math.random, true);
              const scoreA = result.scoreA;
              const scoreB = result.scoreB;
              let penaltyScoreA: number | null = null;
              let penaltyScoreB: number | null = null;

              if (result.penaltiesNeeded) {
                penaltyScoreA = 3 + Math.floor(Math.random() * 3);
                penaltyScoreB = 3 + Math.floor(Math.random() * 3);
                if (penaltyScoreA === penaltyScoreB) penaltyScoreB += 1;
              }

              const goalScorers = [
                ...generateGoalScorers(match.teamA, scoreA, true),
                ...generateGoalScorers(match.teamB, scoreB, true),
              ];
              updated = resolveKnockoutMatches(state.groupStandings, {
                ...updated,
                [matchId]: {
                  ...match,
                  scoreA,
                  scoreB,
                  penaltyScoreA,
                  penaltyScoreB,
                  goalScorers,
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
        if (!COMPETITION.knockoutEnabled) return;
        const state = _get();
        const knockout = resolveKnockoutMatches(state.groupStandings, state.knockoutMatches);
        set({ knockoutMatches: knockout });
      },

      getBestThirds: () => COMPETITION.hasThirdPlace
        ? calculateBestThirds(mapThirds(_get().groupStandings))
        : [],

      switchContext: async (ctx) => {
        const state = _get();

        // Determina si el contexto destino es el mismo que el activo.
        const sameContext = state.activeContext.kind === ctx.kind
            && (ctx.kind === 'personal' || (state.activeContext as { kind: 'league'; leagueId: string }).leagueId === (ctx as { kind: 'league'; leagueId: string }).leagueId);

        // Necesita recarga fresca cuando el destino es una liga y no hay snapshot
        // vivo en memoria (p.ej. tras recargar la página).
        const needsFreshLoad = ctx.kind === 'league' && !_leagueSnapshots[ctx.leagueId];

        // Early-return solo si es el mismo contexto Y ya hay datos en memoria.
        if (sameContext && !needsFreshLoad) return;

        // Solo guardamos localmente si cambiamos de contexto real.
        // Si sameContext es true (pero needsFreshLoad), evitamos pisar el store
        // local con datos potencialmente vacíos.
        if (!sameContext) {
          const snapshot = _cloneSnapshot(state);
          if (state.activeContext.kind === 'personal') {
            _personalSnapshot = snapshot;
            _savePersonalToStorage(snapshot);
          } else {
            const leavingLeagueId = (state.activeContext as { kind: 'league'; leagueId: string }).leagueId;
            _leagueSnapshots[leavingLeagueId] = snapshot;
            // Persistir en leagues-store (solo local, sin tocar la nube).
            void _persistLeagueSnapshotLocal(leavingLeagueId, snapshot);
          }
        }

        let loaded: BracketSnapshot | null = null;
        if (ctx.kind === 'personal') {
          // Intentar memoria → clave dedicada de localStorage → snapshot vacío
          loaded = _personalSnapshot ?? _loadPersonalFromStorage() ?? _defaultSnapshot();
        } else {
          if (_leagueSnapshots[ctx.leagueId]) {
            loaded = _leagueSnapshots[ctx.leagueId];
          } else {
            const { useLeaguesStore, findMyParticipant } = (await import('./leagues-store'));
            const { useAuthStore } = (await import('./auth-store'));
            const leagues = useLeaguesStore.getState().leagues;
            const league = leagues.find(l => l.id === ctx.leagueId);
            const userId = useAuthStore.getState().session?.user.id ?? null;
            const me = findMyParticipant(league, userId);
            if (me) {
              loaded = _participantToSnapshot(me);
            }
          }
          if (!loaded) loaded = _defaultSnapshot();
        }

        set({
          groupMatches: loaded.groupMatches,
          knockoutMatches: loaded.knockoutMatches,
          myGroupPredictions: loaded.myGroupPredictions,
          myKnockoutPredictions: loaded.myKnockoutPredictions,
          myTopScorerPrediction: loaded.myTopScorerPrediction,
          myMvpPrediction: loaded.myMvpPrediction,
          groupStandings: recalculateStandings(loaded.groupMatches),
          activeContext: ctx,
          activePhase: 'groups',
          selectedMatch: null,
        });
      },

      applySharedBracket: (data) => {
        set(state => {
          const groupScoreMap = new Map(data.groupScores.map(s => [s.matchId, s]));
          const groupMatches = state.groupMatches.map(m => {
            const override = groupScoreMap.get(m.matchId);
            return override ? { ...m, scoreA: override.scoreA, scoreB: override.scoreB } : m;
          });
          const groupStandings = recalculateStandings(groupMatches);

          let knockoutMatches = resolveKnockoutMatches(groupStandings, {});
          const knockoutScoreMap = new Map(data.knockoutScores.map(s => [s.matchId, s]));
          for (const matchId of getKnockoutMatchOrder()) {
            const score = knockoutScoreMap.get(matchId);
            const match = knockoutMatches[matchId];
            if (!match || !score || score.scoreA === null || score.scoreB === null) continue;

            const isDrawAfterRegularTime = score.scoreA === score.scoreB;
            const penaltyScoreA = isDrawAfterRegularTime ? score.penaltyScoreA : null;
            const penaltyScoreB = isDrawAfterRegularTime ? score.penaltyScoreB : null;
            const winnerId = getWinnerId(match.teamA, match.teamB, score.scoreA, score.scoreB, penaltyScoreA, penaltyScoreB);
            knockoutMatches = resolveKnockoutMatches(groupStandings, {
              ...knockoutMatches,
              [matchId]: { ...match, scoreA: score.scoreA, scoreB: score.scoreB, penaltyScoreA, penaltyScoreB, winnerId, isPlayed: winnerId !== null },
            });
          }

          return {
            groupMatches,
            groupStandings,
            knockoutMatches,
            activePhase: 'groups' as const,
            selectedMatch: null,
            myTopScorerPrediction: data.topScorer !== undefined ? data.topScorer : state.myTopScorerPrediction,
            myMvpPrediction: data.mvp !== undefined ? data.mvp : state.myMvpPrediction,
          };
        });
      },
      exportExcel: async () => {
        const [{ ExcelService }, { useLocaleStore }] = await Promise.all([
          import('../lib/excel-service'),
          import('../i18n/index'),
        ]);
        const state = _get();
        const locale = useLocaleStore.getState().locale;
        const blob = await ExcelService.exportToExcel(
          state.groupMatches,
          state.knockoutMatches,
          locale,
          {
            topScorer: state.myTopScorerPrediction,
            mvp: state.myMvpPrediction,
          }
        );
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bracket-mundial-2026-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importExcel: async (file: File) => {
        const [{ ExcelService, ExcelImportError }, { useLocaleStore: localeStore }, { es }, { en }] = await Promise.all([
          import('../lib/excel-service'),
          import('../i18n/index'),
          import('../i18n/es'),
          import('../i18n/en'),
        ]);
        const locale = localeStore.getState().locale;
        const dict = locale === 'en' ? en : es;
        try {
          const data = await ExcelService.importFromExcel(file);
          _get().applySharedBracket(data);
          return true;
        } catch (e) {
          console.error("Error importing Excel:", e);
          let key: keyof typeof es = 'excel.importError';
          if (e instanceof ExcelImportError) {
            if (e.code === 'no_map_sheet') key = 'excel.importErrorTemplate';
            else if (e.code === 'no_valid_rows') key = 'excel.importErrorNoRows';
          }
          alert(dict[key]);
          return false;
        }
      },

      setMyGroupPrediction: (matchId, scoreA, scoreB) => {
        set(state => ({
          myGroupPredictions: { ...state.myGroupPredictions, [matchId]: { scoreA, scoreB } },
        }));
      },

      setMyKnockoutPrediction: (matchId, scoreA, scoreB, penaltyScoreA = null, penaltyScoreB = null) => {
        set(state => ({
          myKnockoutPredictions: {
            ...state.myKnockoutPredictions,
            [matchId]: { scoreA, scoreB, penaltyScoreA, penaltyScoreB },
          },
        }));
      },

      setMyTopScorerPrediction: (topScorer) => {
        // Bloquear si la liga activa está congelada
        const ctx = _get().activeContext;
        if (ctx.kind === 'league') {
          const league = getLeagueState((ctx as { kind: 'league'; leagueId: string }).leagueId);
          if (league?.frozen) return;
        }
        set({ myTopScorerPrediction: topScorer });
      },

      setMyMvpPrediction: (mvp) => {
        // Bloquear si la liga activa está congelada
        const ctx = _get().activeContext;
        if (ctx.kind === 'league') {
          const league = getLeagueState((ctx as { kind: 'league'; leagueId: string }).leagueId);
          if (league?.frozen) return;
        }
        set({ myMvpPrediction: mvp });
      },

      setViewMode: (mode) => {
        set(state => {
          if (state.viewMode === mode) return state;

          if (mode === 'real') {
            return { viewMode: mode, ...buildRealModeState(state) };
          } else {
            const matches = state.groupMatches.map(m => {
              const pred = state.myGroupPredictions[m.matchId];
              return pred
                ? { ...m, scoreA: pred.scoreA, scoreB: pred.scoreB, goalScorers: undefined }
                : { ...m, scoreA: null, scoreB: null, goalScorers: undefined };
            });
            const standings = recalculateStandings(matches);
            let knockout = resolveKnockoutMatches(standings, {});

            for (const matchId of getKnockoutMatchOrder()) {
              const pred = state.myKnockoutPredictions[matchId];
              const match = knockout[matchId];
              if (!match || !pred || pred.scoreA === null || pred.scoreB === null) continue;

              const isDraw = pred.scoreA === pred.scoreB;
              const psa = isDraw ? pred.penaltyScoreA : null;
              const psb = isDraw ? pred.penaltyScoreB : null;
              const winnerId = getWinnerId(match.teamA, match.teamB, pred.scoreA, pred.scoreB, psa, psb);
              knockout = resolveKnockoutMatches(standings, {
                ...knockout,
                [matchId]: { ...match, scoreA: pred.scoreA, scoreB: pred.scoreB, penaltyScoreA: psa, penaltyScoreB: psb, goalScorers: undefined, winnerId, isPlayed: winnerId !== null },
              });
            }

            return { viewMode: mode, groupMatches: matches, groupStandings: standings, knockoutMatches: knockout };
          }
        });
      },

      applyOfficialResults: (decoded) => {
        set(state => {
          // El feed oficial es la fuente de verdad: se reemplaza todo, no se mergea.
          const realGroupResults: TournamentState['realGroupResults'] = {};
          for (const s of decoded.groupScores) {
            if (s.scoreA !== null && s.scoreB !== null) {
              realGroupResults[s.matchId] = { scoreA: s.scoreA, scoreB: s.scoreB };
            }
          }
          const realKnockoutResults: TournamentState['realKnockoutResults'] = {};
          for (const s of decoded.knockoutScores) {
            if (s.scoreA !== null && s.scoreB !== null) {
              realKnockoutResults[s.matchId] = {
                scoreA: s.scoreA,
                scoreB: s.scoreB,
                penaltyScoreA: s.penaltyScoreA ?? null,
                penaltyScoreB: s.penaltyScoreB ?? null,
              };
            }
          }

          if (state.viewMode === 'real') {
            return {
              realGroupResults,
              realKnockoutResults,
              ...buildRealModeState({ groupMatches: state.groupMatches, realGroupResults, realKnockoutResults }),
            };
          }
          return { realGroupResults, realKnockoutResults };
        });
      },

      setRealGroupResult: (matchId, scoreA, scoreB) => {
        set(state => {
          const realGroupResults = { ...state.realGroupResults, [matchId]: { scoreA, scoreB } };

          if (state.viewMode === 'real') {
            const matches = state.groupMatches.map(m =>
              m.matchId === matchId ? { ...m, scoreA, scoreB, goalScorers: undefined } : m
            );
            const standings = recalculateStandings(matches);
            return {
              realGroupResults,
              groupMatches: matches,
              groupStandings: standings,
              knockoutMatches: resolveKnockoutMatches(standings, state.knockoutMatches),
            };
          }

          return { realGroupResults };
        });
      },

      setRealKnockoutResult: (matchId, scoreA, scoreB, penaltyScoreA = null, penaltyScoreB = null) => {
        set(state => {
          const isDrawAfterRegularTime = scoreA !== null && scoreB !== null && scoreA === scoreB;
          const resolvedPenaltyScoreA = isDrawAfterRegularTime ? penaltyScoreA : null;
          const resolvedPenaltyScoreB = isDrawAfterRegularTime ? penaltyScoreB : null;

          const realKnockoutResults = {
            ...state.realKnockoutResults,
            [matchId]: { scoreA, scoreB, penaltyScoreA: resolvedPenaltyScoreA, penaltyScoreB: resolvedPenaltyScoreB },
          };

          if (state.viewMode === 'real') {
            const match = state.knockoutMatches[matchId];
            if (!match) return { realKnockoutResults };

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
                goalScorers: undefined,
                winnerId,
                isPlayed,
              },
            };

            return {
              realKnockoutResults,
              knockoutMatches: resolveKnockoutMatches(state.groupStandings, updated),
            };
          }

          return { realKnockoutResults };
        });
      },
    }),
    {
      name: COMPETITION.persistKey,
      merge: (persisted, current) => {
        const p = persisted as Partial<typeof current>;
        if (p.groupMatches) {
          p.groupMatches = p.groupMatches.map(m => hydrateGroupMatch(m));
        }
        if (p.knockoutMatches) {
          p.knockoutMatches = hydrateKnockoutMatches(p.knockoutMatches);
        }

        const groupMatches = p.groupMatches ?? current.groupMatches;
        const groupStandings = p.groupStandings ?? recalculateStandings(groupMatches);
        const knockoutMatches = resolveKnockoutMatches(groupStandings, p.knockoutMatches ?? current.knockoutMatches);

        // Migration: copy existing group scores to predictions if predictions are empty
        let myGroupPredictions = p.myGroupPredictions ?? {};
        let myKnockoutPredictions = p.myKnockoutPredictions ?? {};
        if (Object.keys(myGroupPredictions).length === 0 && groupMatches) {
          for (const m of groupMatches) {
            if (m.scoreA !== null || m.scoreB !== null) {
              myGroupPredictions = { ...myGroupPredictions, [m.matchId]: { scoreA: m.scoreA, scoreB: m.scoreB } };
            }
          }
        }
        if (Object.keys(myKnockoutPredictions).length === 0 && knockoutMatches) {
          for (const [id, m] of Object.entries(knockoutMatches)) {
            if (m.scoreA !== null || m.scoreB !== null) {
              myKnockoutPredictions = {
                ...myKnockoutPredictions,
                [id]: { scoreA: m.scoreA, scoreB: m.scoreB, penaltyScoreA: m.penaltyScoreA, penaltyScoreB: m.penaltyScoreB },
              };
            }
          }
        }

        const myTopScorerPrediction = p.myTopScorerPrediction ?? null;
        const myMvpPrediction = p.myMvpPrediction ?? null;
        const activeContext: ActiveContext = p.activeContext ?? { kind: 'personal' };
        const viewMode: ViewMode = p.viewMode ?? 'predictions';
        const realGroupResults = p.realGroupResults ?? {};
        const realKnockoutResults = p.realKnockoutResults ?? {};

        return { 
          ...current, 
          ...p, 
          groupMatches, 
          groupStandings, 
          knockoutMatches, 
          myGroupPredictions, 
          myKnockoutPredictions, 
          myTopScorerPrediction, 
          myMvpPrediction, 
          activeContext,
          viewMode,
          realGroupResults,
          realKnockoutResults,
        };
      },
    }
  )
);