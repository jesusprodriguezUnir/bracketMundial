import type { DecodedBracket } from './bracket-codec';
import { recalculateStandings, getWinnerId, initialGroupMatches, getKnockoutMatchOrder } from '../store/tournament-store';
import type { GroupMatchResult } from '../store/tournament-store';
import type { KnockoutMatchLike } from './bracket-logic';
import { syncKnockoutBracket } from './bracket-logic';
import { KNOCKOUT_BRACKET } from '../data/fifa-2026';

export interface ScoreResult {
  total: number;
  byRound: Record<string, number>;
}

const ROUND_POINTS: Record<string, number> = {
  roundOf32: 2,
  roundOf16: 3,
  quarterfinals: 5,
  semifinals: 8,
  final: 13,
};
const CHAMPION_BONUS = 20;

function buildResolvedKnockout(decoded: DecodedBracket): Record<string, KnockoutMatchLike> {
  const groupScoreMap = new Map(decoded.groupScores.map(s => [s.matchId, s]));
  const groupMatches: GroupMatchResult[] = initialGroupMatches.map(m => {
    const override = groupScoreMap.get(m.matchId);
    return override ? { ...m, scoreA: override.scoreA, scoreB: override.scoreB } : m;
  });

  const groupStandings = recalculateStandings(groupMatches);
  let knockout = syncKnockoutBracket(groupStandings, {}, KNOCKOUT_BRACKET, {});

  const knockoutScoreMap = new Map(decoded.knockoutScores.map(s => [s.matchId, s]));
  for (const matchId of getKnockoutMatchOrder()) {
    const score = knockoutScoreMap.get(matchId);
    const match = knockout[matchId];
    if (!match || !score || score.scoreA === null || score.scoreB === null) continue;

    const isDrawAfterRegularTime = score.scoreA === score.scoreB;
    const penaltyScoreA = isDrawAfterRegularTime ? score.penaltyScoreA : null;
    const penaltyScoreB = isDrawAfterRegularTime ? score.penaltyScoreB : null;
    const winnerId = getWinnerId(match.teamA, match.teamB, score.scoreA, score.scoreB, penaltyScoreA, penaltyScoreB);
    knockout = syncKnockoutBracket(groupStandings, {
      ...knockout,
      [matchId]: { ...match, scoreA: score.scoreA, scoreB: score.scoreB, penaltyScoreA, penaltyScoreB, winnerId, isPlayed: winnerId !== null },
    }, KNOCKOUT_BRACKET, {});
  }

  return knockout;
}

export function scoreBracket(prediction: DecodedBracket, official: DecodedBracket): ScoreResult {
  const byRound: Record<string, number> = {};
  let total = 0;

  // Groups: exact score = 3pts, correct 1X2 = 1pt
  const predGroupMap = new Map(prediction.groupScores.map(s => [s.matchId, s]));
  for (const off of official.groupScores) {
    if (off.scoreA === null || off.scoreB === null) continue;
    const pred = predGroupMap.get(off.matchId);
    if (!pred || pred.scoreA === null || pred.scoreB === null) continue;

    let pts = 0;
    if (pred.scoreA === off.scoreA && pred.scoreB === off.scoreB) {
      pts = 3;
    } else if (Math.sign(pred.scoreA - pred.scoreB) === Math.sign(off.scoreA - off.scoreB)) {
      pts = 1;
    }
    if (pts > 0) {
      byRound['groups'] = (byRound['groups'] ?? 0) + pts;
      total += pts;
    }
  }

  // Knockout: compare winnerId per match slot, resolved from group standings
  const predKnockout = buildResolvedKnockout(prediction);
  const offKnockout = buildResolvedKnockout(official);

  const finalMatchId = KNOCKOUT_BRACKET.final.id;
  for (const matchId of getKnockoutMatchOrder()) {
    const offMatch = offKnockout[matchId];
    const predMatch = predKnockout[matchId];
    if (!offMatch?.winnerId || !predMatch?.winnerId) continue;

    const pts = ROUND_POINTS[offMatch.round] ?? 0;
    if (predMatch.winnerId === offMatch.winnerId && pts > 0) {
      byRound[offMatch.round] = (byRound[offMatch.round] ?? 0) + pts;
      total += pts;
    }
  }

  // Champion bonus: additional 20pts if champion correctly predicted
  if (offKnockout[finalMatchId]?.winnerId &&
      predKnockout[finalMatchId]?.winnerId === offKnockout[finalMatchId]?.winnerId) {
    byRound['champion'] = CHAMPION_BONUS;
    total += CHAMPION_BONUS;
  }

  return { total, byRound };
}
