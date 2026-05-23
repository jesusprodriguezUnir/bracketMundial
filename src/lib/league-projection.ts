import { ODDS_SEED } from '../data/odds/seed';
import { expectedProbabilities, type MatchProb } from './odds-model';
import { TEAM_STRENGTH } from '../data/team-strength';
import { GROUP_MATCHES } from '../data/match-schedule';
import { recalculateStandings, getWinnerId, getKnockoutMatchOrder } from '../store/tournament-store';
import { syncKnockoutBracket } from './bracket-logic';
import { KNOCKOUT_BRACKET } from '../data/fifa-2026';
import type { OddsFeed } from './odds-service';

export interface RealScores {
  matchId: string;
  scoreA: number | null;
  scoreB: number | null;
}

export interface ProjectedScores {
  groupScores: RealScores[];
  knockoutScores: RealScores[];
}

function getCachedOdds(): OddsFeed {
  try {
    const raw = localStorage.getItem('odds:feed:v2');
    if (raw) {
      const entry = JSON.parse(raw) as { data: OddsFeed; ts: number };
      if (entry.data && entry.ts && (Date.now() - entry.ts) < 6 * 60 * 60 * 1000) {
        return entry.data;
      }
    }
  } catch {
    /* ignore malformed cache */
  }
  return ODDS_SEED;
}

export function pickMostLikelyScore(prob: MatchProb): { scoreA: number; scoreB: number } {
  const { home, draw, away } = prob;

  if (home > draw && home > away) {
    if (home >= 70) return { scoreA: 2, scoreB: 1 };
    return { scoreA: 1, scoreB: 0 };
  }
  if (away > draw && away > home) {
    if (away >= 70) return { scoreA: 1, scoreB: 2 };
    return { scoreA: 0, scoreB: 1 };
  }
  return { scoreA: 1, scoreB: 1 };
}

export function buildProjectedScores(
  realGroupScores: readonly RealScores[],
  realKnockoutScores: readonly RealScores[],
): ProjectedScores {
  const odds = getCachedOdds();

  const realGroupByMatchId = new Map(realGroupScores.map(r => [r.matchId, r]));

  const groupScores: RealScores[] = GROUP_MATCHES.map(m => {
    const real = realGroupByMatchId.get(m.matchId);
    if (real && real.scoreA !== null && real.scoreB !== null) {
      return { matchId: m.matchId, scoreA: real.scoreA, scoreB: real.scoreB };
    }
    const matchOdds = odds.matches[m.matchId];
    if (matchOdds) {
      return { matchId: m.matchId, ...pickMostLikelyScore(matchOdds) };
    }
    const prob = expectedProbabilities(
      TEAM_STRENGTH[m.teamA] ?? 1500,
      TEAM_STRENGTH[m.teamB] ?? 1500,
    );
    return { matchId: m.matchId, ...pickMostLikelyScore(prob) };
  });

  const groupMatchesWithTeams = GROUP_MATCHES.map(m => {
    const score = groupScores.find(s => s.matchId === m.matchId)!;
    return {
      matchId: m.matchId,
      group: m.group,
      teamA: m.teamA,
      teamB: m.teamB,
      scoreA: score.scoreA,
      scoreB: score.scoreB,
      matchDay: m.matchDay,
    };
  });

  const standings = recalculateStandings(groupMatchesWithTeams);
  const knockoutStructure = KNOCKOUT_BRACKET;
  let knockout = syncKnockoutBracket(standings, {}, knockoutStructure);

  const realKnockoutByMatchId = new Map(realKnockoutScores.map(r => [r.matchId, r]));

  const knockoutOrder = getKnockoutMatchOrder();
  const knockoutScores: RealScores[] = [];

  for (const matchId of knockoutOrder) {
    let match = knockout[matchId];

    const real = realKnockoutByMatchId.get(matchId);
    let scoreA: number | null = null;
    let scoreB: number | null = null;

    if (real && real.scoreA !== null && real.scoreB !== null) {
      scoreA = real.scoreA;
      scoreB = real.scoreB;
    } else if (match?.teamA && match?.teamB) {
      const prob = expectedProbabilities(
        TEAM_STRENGTH[match.teamA] ?? 1500,
        TEAM_STRENGTH[match.teamB] ?? 1500,
      );
      const projected = pickMostLikelyScore(prob);
      scoreA = projected.scoreA;
      scoreB = projected.scoreB;
    }

    knockoutScores.push({ matchId, scoreA, scoreB });

    if (scoreA !== null && scoreB !== null && match?.teamA && match?.teamB) {
      const winnerId = getWinnerId(match.teamA, match.teamB, scoreA, scoreB, null, null);

      knockout = syncKnockoutBracket(standings, {
        ...knockout,
        [matchId]: {
          ...match,
          scoreA,
          scoreB,
          winnerId,
          isPlayed: winnerId !== null,
        },
      }, knockoutStructure);
    }
  }

  return { groupScores, knockoutScores };
}
