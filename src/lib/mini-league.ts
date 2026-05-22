import type { DecodedBracket } from './bracket-codec';

export const MUNDIAL_POINTS = { exact: 5, diff: 3, sign: 2, miss: 0 } as const;

export interface MatchPrediction {
  matchId: string;
  scoreA: number | null;
  scoreB: number | null;
}

export interface Participant {
  id: string;
  name: string;
  addedAt: number;
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
}

export interface MatchPoints {
  matchId: string;
  points: number;
  kind: 'exact' | 'diff' | 'sign' | 'miss' | 'pending';
}

export interface ParticipantScore {
  participant: Pick<Participant, 'id' | 'name'>;
  total: number;
  byPhase: { groups: number; knockout: number };
  exactCount: number;
  diffCount: number;
  signCount: number;
  breakdown: MatchPoints[];
}

export function scoreMatch(
  predA: number | null,
  predB: number | null,
  realA: number | null,
  realB: number | null,
): { points: number; kind: MatchPoints['kind'] } {
  if (realA === null || realB === null) {
    return { points: 0, kind: 'pending' };
  }
  if (predA === null || predB === null) {
    return { points: 0, kind: 'miss' };
  }
  if (predA === realA && predB === realB) {
    return { points: MUNDIAL_POINTS.exact, kind: 'exact' };
  }
  const predDiff = predA - predB;
  const realDiff = realA - realB;
  if (predDiff === realDiff) {
    return { points: MUNDIAL_POINTS.diff, kind: 'diff' };
  }
  const predSign = Math.sign(predDiff);
  const realSign = Math.sign(realDiff);
  if (predSign === realSign) {
    return { points: MUNDIAL_POINTS.sign, kind: 'sign' };
  }
  return { points: MUNDIAL_POINTS.miss, kind: 'miss' };
}

interface RealScores {
  matchId: string;
  scoreA: number | null;
  scoreB: number | null;
}

export function scoreParticipant(
  participant: Pick<Participant, 'id' | 'name' | 'groupScores' | 'knockoutScores'>,
  realGroupScores: readonly RealScores[],
  realKnockoutScores: readonly RealScores[],
): ParticipantScore {
  const totalGroup = realGroupScores.length;
  const totalKnockout = realKnockoutScores.length;
  const totalMatches = totalGroup + totalKnockout;
  const breakdown: MatchPoints[] = new Array(totalMatches);

  const realByMatchId = new Map<string, RealScores>();
  for (const r of realGroupScores) realByMatchId.set(r.matchId, r);
  for (const r of realKnockoutScores) realByMatchId.set(r.matchId, r);

  const predByMatchId = new Map<string, MatchPrediction>();
  for (const p of participant.groupScores) predByMatchId.set(p.matchId, p);
  for (const p of participant.knockoutScores) predByMatchId.set(p.matchId, p);

  let groupsTotal = 0;
  let knockoutTotal = 0;
  let exactCount = 0;
  let diffCount = 0;
  let signCount = 0;
  let idx = 0;

  for (const real of realGroupScores) {
    const pred = predByMatchId.get(real.matchId);
    const { points, kind } = scoreMatch(
      pred?.scoreA ?? null,
      pred?.scoreB ?? null,
      real.scoreA,
      real.scoreB,
    );
    breakdown[idx++] = { matchId: real.matchId, points, kind };
    groupsTotal += points;
    if (kind === 'exact') exactCount++;
    else if (kind === 'diff') diffCount++;
    else if (kind === 'sign') signCount++;
  }

  for (const real of realKnockoutScores) {
    const pred = predByMatchId.get(real.matchId);
    const { points, kind } = scoreMatch(
      pred?.scoreA ?? null,
      pred?.scoreB ?? null,
      real.scoreA,
      real.scoreB,
    );
    breakdown[idx++] = { matchId: real.matchId, points, kind };
    knockoutTotal += points;
    if (kind === 'exact') exactCount++;
    else if (kind === 'diff') diffCount++;
    else if (kind === 'sign') signCount++;
  }

  return {
    participant: { id: participant.id, name: participant.name },
    total: groupsTotal + knockoutTotal,
    byPhase: { groups: groupsTotal, knockout: knockoutTotal },
    exactCount,
    diffCount,
    signCount,
    breakdown,
  };
}

export function rankParticipants(
  scores: ParticipantScore[],
): ParticipantScore[] {
  return [...scores].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount;
    return a.participant.name.localeCompare(b.participant.name);
  });
}
