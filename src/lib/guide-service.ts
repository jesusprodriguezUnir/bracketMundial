import { TEAMS_2026, generateGroupMatches, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { STADIUMS } from '../data/stadiums';
import { SQUADS, LINEUPS, type Player, type Lineup } from '../data/squads/index';
import { COACHES, type Coach } from '../data/coaches/index';
import { playerPhotoSrc, hasPlayerPhoto } from '../lib/player-photo';
import { coachPhotoSrc, hasCoachPhoto } from '../lib/coach-photo';
import {
  recalculateStandings,
  getWinnerId,
  getKnockoutMatchOrder,
  type GroupStanding,
  type GroupMatchResult,
  type KnockoutMatchResult,
} from '../store/tournament-store';
import { syncKnockoutBracket } from '../lib/bracket-logic';
import { expectedProbabilities, sampleResult } from '../lib/odds-model';
import { TEAM_STRENGTH } from '../data/team-strength';
import { ODDS_SEED } from '../data/odds/seed';
import { getTeamMeta, type TeamMeta } from '../data/team-meta';
import { useLocaleStore } from '../i18n';
import { useTournamentStore } from '../store/tournament-store';

/** A key player highlight derived from the squad (captain / star / wonderkid). */
export interface GuideKeyPlayer {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  club: string;
}

/** Quick aggregate stats derived from the squad. */
export interface GuideSquadStats {
  avgAge: number;
  count: number;
}

export interface GuideTeamData {
  teamId: string;
  name: string;
  shortName: string;
  group: string;
  flagUrl: string;
  coach: Coach | null;
  squad: Player[];
  lineup: Lineup | null;
  hasCoachPhoto: boolean;
  coachPhotoUrl: string;
  players: Array<Player & { hasPhoto: boolean; photoUrl: string }>;
  meta: TeamMeta;
  /** Predicted group position (1-4) from the simulated standings. */
  groupPosition: number;
  /** This team's three group-stage matches, in matchday order. */
  groupMatches: GuideMatch[];
  /** Derived highlights for the squad sidebar. */
  captain: GuideKeyPlayer | null;
  starPlayer: GuideKeyPlayer | null;
  wonderkid: GuideKeyPlayer | null;
  squadStats: GuideSquadStats;
}

export interface GuideMatch {
  matchId: string;
  date: string;
  timeSpain: string;
  teamA: string;
  teamB: string;
  teamAName: string;
  teamBName: string;
  venue: string;
  city: string;
  scoreA: number | null;
  scoreB: number | null;
  group?: string;
  round?: string;
  matchDay?: number;
  penaltyScoreA?: number | null;
  penaltyScoreB?: number | null;
  winnerId?: string | null;
}

export interface GuidePrediction {
  champion: string | null;
  runnerUp: string | null;
  thirdPlace: string | null;
}

export interface GuideData {
  teams: GuideTeamData[];
  groupMatches: GuideMatch[];
  knockoutMatches: GuideMatch[];
  standings: Record<string, GroupStanding[]>;
  prediction: GuidePrediction;
  locale: 'es' | 'en';
}

function getTeamName(teamId: string): string {
  return TEAMS_2026.find(t => t.id === teamId)?.name ?? teamId;
}

function toKeyPlayer(p: Player | undefined): GuideKeyPlayer | null {
  if (!p) return null;
  return { number: p.number, name: p.name, position: p.position, age: p.age, club: p.club };
}

/** Star player: an outfield starter, preferring forwards/attacking mids over the captain. */
function pickStarPlayer(squad: Player[], lineup: Lineup | null, captain: Player | undefined): Player | undefined {
  const starting = lineup ? squad.filter(p => lineup.startingXI.includes(p.number)) : squad;
  const posRank = { FW: 0, MF: 1, DF: 2, GK: 3 } as const;
  const candidates = starting
    .filter(p => p.position !== 'GK' && p.number !== captain?.number)
    .sort((a, b) => posRank[a.position] - posRank[b.position]);
  return candidates[0] ?? starting.find(p => p.number !== captain?.number);
}

/** Wonderkid: the youngest player in the squad (must be 23 or under to qualify). */
function pickWonderkid(squad: Player[]): Player | undefined {
  const youngest = [...squad].sort((a, b) => a.age - b.age)[0];
  return youngest && youngest.age <= 23 ? youngest : undefined;
}

function buildSquadStats(squad: Player[]): GuideSquadStats {
  if (squad.length === 0) return { avgAge: 0, count: 0 };
  const totalAge = squad.reduce((sum, p) => sum + p.age, 0);
  return {
    avgAge: Math.round((totalAge / squad.length) * 10) / 10,
    count: squad.length,
  };
}

function buildGuideTeamData(
  teamId: string,
  standings: Record<string, GroupStanding[]>,
  groupMatches: GuideMatch[],
): GuideTeamData {
  const team = TEAMS_2026.find(t => t.id === teamId);
  const coach = COACHES[teamId] ?? null;
  const squad = SQUADS[teamId] ?? [];
  const lineup = LINEUPS[teamId] ?? null;
  const group = team?.group ?? '?';

  const captain = squad.find(p => p.captain);
  const starPlayer = pickStarPlayer(squad, lineup, captain);
  const wonderkid = pickWonderkid(squad);

  const groupStanding = standings[group] ?? [];
  const groupPosition = Math.max(1, groupStanding.findIndex(s => s.teamId === teamId) + 1);

  const ownGroupMatches = groupMatches
    .filter(m => m.teamA === teamId || m.teamB === teamId)
    .sort((a, b) => (a.matchDay ?? 0) - (b.matchDay ?? 0));

  return {
    teamId,
    name: team?.name ?? teamId,
    shortName: team?.shortName ?? teamId,
    group,
    flagUrl: team?.flagUrl ?? '',
    coach,
    squad,
    lineup,
    hasCoachPhoto: hasCoachPhoto(teamId),
    coachPhotoUrl: coachPhotoSrc(teamId),
    players: squad.map(p => ({
      ...p,
      hasPhoto: hasPlayerPhoto(teamId, p.number),
      photoUrl: playerPhotoSrc(teamId, p.number),
    })),
    meta: getTeamMeta(teamId),
    groupPosition,
    groupMatches: ownGroupMatches,
    captain: toKeyPlayer(captain),
    starPlayer: toKeyPlayer(starPlayer),
    wonderkid: toKeyPlayer(wonderkid),
    squadStats: buildSquadStats(squad),
  };
}

function simulateAutoBracket(): {
  groupMatches: GroupMatchResult[];
  standings: Record<string, GroupStanding[]>;
  knockoutMatches: Record<string, KnockoutMatchResult>;
} {
  // 1. Simulate groups
  let feedMatches: Record<string, { home: number; draw: number; away: number }> = {};
  try {
    const raw = localStorage.getItem('odds:feed:v2');
    if (raw) {
      const entry = JSON.parse(raw) as { data: { matches: Record<string, { home: number; draw: number; away: number }> }; ts: number };
      if (Date.now() - entry.ts < 6 * 60 * 60 * 1000) feedMatches = entry.data.matches;
    }
  } catch { /* ignore */ }
  if (Object.keys(feedMatches).length === 0) feedMatches = ODDS_SEED.matches;

  const groupMatches = generateGroupMatches().map(m => {
    const odds = feedMatches[m.matchId];
    const prob = odds ?? expectedProbabilities(
      TEAM_STRENGTH[m.teamA as keyof typeof TEAM_STRENGTH] ?? 1500,
      TEAM_STRENGTH[m.teamB as keyof typeof TEAM_STRENGTH] ?? 1500,
    );
    const result = sampleResult(prob);
    return { ...m, scoreA: result.scoreA, scoreB: result.scoreB };
  });

  const standings = recalculateStandings(groupMatches);

  // 2. Build initial knockout from standings
  let knockoutMatches = syncKnockoutBracket(
    standings,
    {},
    KNOCKOUT_BRACKET,
    KNOCKOUT_SCHEDULE
  );

  // 3. Simulate knockout
  for (const matchId of getKnockoutMatchOrder()) {
    const match = knockoutMatches[matchId];
    if (match?.teamA && match.teamB && !match.isPlayed) {
      const prob = expectedProbabilities(
        TEAM_STRENGTH[match.teamA as keyof typeof TEAM_STRENGTH] ?? 1500,
        TEAM_STRENGTH[match.teamB as keyof typeof TEAM_STRENGTH] ?? 1500,
      );
      const result = sampleResult(prob, Math.random, true);
      let penaltyScoreA: number | null = null;
      let penaltyScoreB: number | null = null;

      if (result.penaltiesNeeded) {
        penaltyScoreA = 3 + Math.floor(Math.random() * 3);
        penaltyScoreB = 3 + Math.floor(Math.random() * 3);
        if (penaltyScoreA === penaltyScoreB) penaltyScoreB += 1;
      }

      const winnerId = getWinnerId(match.teamA, match.teamB, result.scoreA, result.scoreB, penaltyScoreA, penaltyScoreB);

      knockoutMatches = syncKnockoutBracket(
        standings,
        {
          ...knockoutMatches,
          [matchId]: {
            ...match,
            scoreA: result.scoreA,
            scoreB: result.scoreB,
            penaltyScoreA,
            penaltyScoreB,
            winnerId,
            isPlayed: winnerId !== null,
          },
        },
        KNOCKOUT_BRACKET,
        KNOCKOUT_SCHEDULE
      );
    }
  }

  return { groupMatches, standings, knockoutMatches };
}

function formatKnockoutMatch(match: KnockoutMatchResult): GuideMatch {
  const scheduled = KNOCKOUT_SCHEDULE[match.matchId];
  const teamAName = getTeamName(match.teamA ?? '');
  const teamBName = getTeamName(match.teamB ?? '');
  return {
    matchId: match.matchId,
    date: scheduled?.date ?? match.date ?? '',
    timeSpain: scheduled?.timeSpain ?? match.timeSpain ?? '',
    teamA: match.teamA ?? '',
    teamB: match.teamB ?? '',
    teamAName: match.teamA ? teamAName : 'TBD',
    teamBName: match.teamB ? teamBName : 'TBD',
    venue: scheduled?.venue ?? match.venue ?? '',
    city: scheduled?.city ?? match.city ?? '',
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    round: match.round,
    penaltyScoreA: match.penaltyScoreA,
    penaltyScoreB: match.penaltyScoreB,
    winnerId: match.winnerId,
  };
}

function formatGroupMatch(match: GroupMatchResult): GuideMatch {
  const stadium = STADIUMS.find(st => st.name === match.venue) ?? STADIUMS[0];
  return {
    matchId: match.matchId,
    date: match.date ?? '',
    timeSpain: match.timeSpain ?? '',
    teamA: match.teamA,
    teamB: match.teamB,
    teamAName: getTeamName(match.teamA),
    teamBName: getTeamName(match.teamB),
    venue: match.venue ?? stadium.name,
    city: match.city ?? stadium.city,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    group: match.group,
    matchDay: match.matchDay,
  };
}

function extractPrediction(knockout: Record<string, KnockoutMatchResult>): GuidePrediction {
  const final = knockout['FIN-01'];
  const thirdPlace = knockout['TP-01'];

  let champion: string | null = null;
  let runnerUp: string | null = null;
  let third: string | null = null;

  if (final?.winnerId) {
    champion = final.winnerId;
    runnerUp = final.teamA === final.winnerId ? final.teamB : final.teamA;
  }
  if (thirdPlace?.winnerId) {
    third = thirdPlace.winnerId;
  }

  return { champion, runnerUp, thirdPlace: third };
}

export function generateGuideData(mode: 'auto' | 'user'): GuideData {
  const locale = useLocaleStore.getState().locale;

  let groupMatches: GroupMatchResult[];
  let standings: Record<string, GroupStanding[]>;
  let knockoutMatches: Record<string, KnockoutMatchResult>;

  if (mode === 'auto') {
    const simulated = simulateAutoBracket();
    groupMatches = simulated.groupMatches;
    standings = simulated.standings;
    knockoutMatches = simulated.knockoutMatches;
  } else {
    const state = useTournamentStore.getState();
    groupMatches = state.groupMatches;
    standings = state.groupStandings;
    knockoutMatches = state.knockoutMatches;
  }

  const formattedGroupMatches = groupMatches.map(formatGroupMatch);

  const teams = TEAMS_2026.map(t => buildGuideTeamData(t.id, standings, formattedGroupMatches));

  // Ensure all knockout matches exist (some may not be generated yet)
  const allKnockoutIds = getKnockoutMatchOrder();
  const formattedKnockoutMatches: GuideMatch[] = allKnockoutIds.map(id => {
    if (knockoutMatches[id]) {
      return formatKnockoutMatch(knockoutMatches[id]);
    }
    // Return a placeholder for ungenerated matches
    const scheduled = KNOCKOUT_SCHEDULE[id];
    return {
      matchId: id,
      date: scheduled?.date ?? '',
      timeSpain: scheduled?.timeSpain ?? '',
      teamA: '',
      teamB: '',
      teamAName: 'TBD',
      teamBName: 'TBD',
      venue: scheduled?.venue ?? '',
      city: scheduled?.city ?? '',
      scoreA: null,
      scoreB: null,
      round: id.startsWith('R32') ? 'roundOf32' :
             id.startsWith('R16') ? 'roundOf16' :
             id.startsWith('QF') ? 'quarterfinals' :
             id.startsWith('SF') ? 'semifinals' :
             id === 'TP-01' ? 'thirdPlace' : 'final',
    };
  });

  return {
    teams,
    groupMatches: formattedGroupMatches,
    knockoutMatches: formattedKnockoutMatches,
    standings,
    prediction: extractPrediction(knockoutMatches),
    locale,
  };
}

export function groupMatchesByMatchday(matches: GuideMatch[]): GuideMatch[][] {
  const days = new Map<number, GuideMatch[]>();
  for (const m of matches) {
    const day = m.matchDay ?? 1;
    if (!days.has(day)) days.set(day, []);
    days.get(day)!.push(m);
  }
  return Array.from(days.entries()).sort((a, b) => a[0] - b[0]).map(([, ms]) => ms);
}

export function groupMatchesByDate(matches: GuideMatch[]): Record<string, GuideMatch[]> {
  const result: Record<string, GuideMatch[]> = {};
  for (const m of matches) {
    if (!result[m.date]) result[m.date] = [];
    result[m.date].push(m);
  }
  return result;
}
