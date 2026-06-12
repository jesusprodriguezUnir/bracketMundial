import type { DecodedBracket } from './bracket-codec';
import { buildResolvedKnockout } from './bracket-logic';
import { KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { initialGroupMatches, recalculateStandings, getWinnerId, getKnockoutMatchOrder } from '../store/tournament-store';

export const MUNDIAL_POINTS = {
  // Puntos por partido en grupos
  groupExact: 5,
  groupDiff: 3,
  groupSign: 2,
  groupMiss: 0,

  // Alias retrocompatibles
  exact: 5,
  diff: 3,
  sign: 2,
  miss: 0,

  // Puntos por equipo clasificado en el knockout (progresión)
  koRoundOf32: 1,      // 32 equipos
  koRoundOf16: 2,      // 16 equipos
  koQuarterfinals: 4,  // 8 equipos
  koSemifinals: 8,     // 4 equipos
  koFinal: 16,         // 2 equipos
  koWinner: 32,        // 1 equipo

  // Premios individuales
  topScorer: 15,
  mvp: 15,
} as const;

export const REAL_AWARDS: {
  topScorer: { teamId: string; playerName: string } | null;
  mvp: { teamId: string; playerName: string } | null;
} = {
  topScorer: null,
  mvp: null,
};

export interface MatchPrediction {
  matchId: string;
  scoreA: number | null;
  scoreB: number | null;
}

export interface Participant {
  id: string;
  name: string;
  addedAt: number;
  isOwner?: boolean;
  userId?: string;
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
  topScorer?: DecodedBracket['topScorer'];
  mvp?: DecodedBracket['mvp'];
}

export interface MatchPoints {
  matchId: string;
  points: number;
  kind: 'exact' | 'diff' | 'sign' | 'miss' | 'pending';
}

export interface ParticipantScore {
  participant: Pick<Participant, 'id' | 'name' | 'isOwner' | 'userId'> & { topScorer?: Participant['topScorer']; mvp?: Participant['mvp'] };
  total: number;
  byPhase: { groups: number; knockout: number; awards: number };
  exactCount: number;
  diffCount: number;
  signCount: number;
  breakdown: MatchPoints[];
  koCorrectTeams: {
    roundOf32: string[];
    roundOf16: string[];
    quarterfinals: string[];
    semifinals: string[];
    final: string[];
    winner: string[];
  };
  awardsCorrect: {
    topScorer: boolean;
    mvp: boolean;
  };
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
    return { points: MUNDIAL_POINTS.groupExact, kind: 'exact' };
  }
  const predDiff = predA - predB;
  const realDiff = realA - realB;
  if (predDiff === realDiff) {
    return { points: MUNDIAL_POINTS.groupDiff, kind: 'diff' };
  }
  const predSign = Math.sign(predDiff);
  const realSign = Math.sign(realDiff);
  if (predSign === realSign) {
    return { points: MUNDIAL_POINTS.groupSign, kind: 'sign' };
  }
  return { points: MUNDIAL_POINTS.groupMiss, kind: 'miss' };
}

interface RealScores {
  matchId: string;
  scoreA: number | null;
  scoreB: number | null;
  penaltyScoreA?: number | null;
  penaltyScoreB?: number | null;
}

export function scoreParticipant(
  participant: Pick<Participant, 'id' | 'name' | 'isOwner' | 'userId' | 'groupScores' | 'knockoutScores' | 'topScorer' | 'mvp'>,
  realGroupScores: readonly RealScores[],
  realKnockoutScores: readonly RealScores[],
  opts?: { excludedMatchIds?: Set<string> },
): ParticipantScore {
  const breakdown: MatchPoints[] = [];

  const predByMatchId = new Map<string, MatchPrediction>();
  for (const p of participant.groupScores) predByMatchId.set(p.matchId, p);

  let groupsTotal = 0;
  let exactCount = 0;
  let diffCount = 0;
  let signCount = 0;

  // 1. Fase de Grupos: puntuación por marcador de partido
  for (const real of realGroupScores) {
    // Saltar partidos excluidos (creación a mitad de torneo)
    if (opts?.excludedMatchIds?.has(real.matchId)) continue;
    const pred = predByMatchId.get(real.matchId);
    const { points, kind } = scoreMatch(
      pred?.scoreA ?? null,
      pred?.scoreB ?? null,
      real.scoreA,
      real.scoreB,
    );
    breakdown.push({ matchId: real.matchId, points, kind });
    groupsTotal += points;
    if (kind === 'exact') exactCount++;
    else if (kind === 'diff') diffCount++;
    else if (kind === 'sign') signCount++;
  }

  // Es la simulación real si contiene los partidos de grupos del Mundial (72 partidos) y al menos uno se ha jugado
  const playedGroupCount = realGroupScores.filter(r => r.scoreA !== null && r.scoreB !== null).length;
  const isRealBracket = realGroupScores.length >= 72 && playedGroupCount > 0;
  // Los clasificados reales al knockout solo se conocen con TODOS los grupos completos:
  // los mejores terceros dependen de los 72 partidos. Hasta entonces no se otorgan puntos KO.
  const groupsComplete = realGroupScores.length >= 72 && playedGroupCount === realGroupScores.length;

  let knockoutTotal = 0;
  const koCorrectTeams = {
    roundOf32: [] as string[],
    roundOf16: [] as string[],
    quarterfinals: [] as string[],
    semifinals: [] as string[],
    final: [] as string[],
    winner: [] as string[],
  };

  if (isRealBracket && groupsComplete) {
    // 2. Fase Eliminatoria: puntuación por Progresión de Equipos
    const participantDecoded = {
      groupScores: participant.groupScores,
      knockoutScores: participant.knockoutScores,
    };
    const participantKo = buildResolvedKnockout(
      participantDecoded,
      initialGroupMatches,
      recalculateStandings as any,
      getWinnerId as any,
      getKnockoutMatchOrder,
      KNOCKOUT_BRACKET,
      KNOCKOUT_SCHEDULE
    );

    const realDecoded = {
      groupScores: realGroupScores as Array<{ matchId: string; scoreA: number | null; scoreB: number | null }>,
      knockoutScores: realKnockoutScores as Array<{ matchId: string; scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }>,
    };
    const realKo = buildResolvedKnockout(
      realDecoded,
      initialGroupMatches,
      recalculateStandings as any,
      getWinnerId as any,
      getKnockoutMatchOrder,
      KNOCKOUT_BRACKET,
      KNOCKOUT_SCHEDULE
    );

    const getTeamsForRound = (
      knockout: Record<string, any>,
      round: 'roundOf32' | 'roundOf16' | 'quarterfinals' | 'semifinals' | 'final' | 'winner'
    ): Set<string> => {
      const teams = new Set<string>();
      if (round === 'winner') {
        const finalMatch = knockout[KNOCKOUT_BRACKET.final.id];
        if (finalMatch?.winnerId) teams.add(finalMatch.winnerId);
      } else if (round === 'final') {
        const finalMatch = knockout[KNOCKOUT_BRACKET.final.id];
        if (finalMatch?.teamA) teams.add(finalMatch.teamA);
        if (finalMatch?.teamB) teams.add(finalMatch.teamB);
      } else {
        const slots = KNOCKOUT_BRACKET[round];
        for (const slot of slots) {
          const match = knockout[slot.id];
          if (match?.teamA) teams.add(match.teamA);
          if (match?.teamB) teams.add(match.teamB);
        }
      }
      return teams;
    };

    const predR32 = getTeamsForRound(participantKo, 'roundOf32');
    const realR32 = getTeamsForRound(realKo, 'roundOf32');

    const predR16 = getTeamsForRound(participantKo, 'roundOf16');
    const realR16 = getTeamsForRound(realKo, 'roundOf16');

    const predQF = getTeamsForRound(participantKo, 'quarterfinals');
    const realQF = getTeamsForRound(realKo, 'quarterfinals');

    const predSF = getTeamsForRound(participantKo, 'semifinals');
    const realSF = getTeamsForRound(realKo, 'semifinals');

    const predF = getTeamsForRound(participantKo, 'final');
    const realF = getTeamsForRound(realKo, 'final');

    const predWinner = getTeamsForRound(participantKo, 'winner');
    const realWinner = getTeamsForRound(realKo, 'winner');

    // Round of 32: 1 pt por equipo
    for (const t of realR32) {
      if (predR32.has(t)) {
        knockoutTotal += MUNDIAL_POINTS.koRoundOf32;
        koCorrectTeams.roundOf32.push(t);
      }
    }

    // Round of 16: 2 pts por equipo
    for (const t of realR16) {
      if (predR16.has(t)) {
        knockoutTotal += MUNDIAL_POINTS.koRoundOf16;
        koCorrectTeams.roundOf16.push(t);
      }
    }

    // Quarterfinals: 4 pts por equipo
    for (const t of realQF) {
      if (predQF.has(t)) {
        knockoutTotal += MUNDIAL_POINTS.koQuarterfinals;
        koCorrectTeams.quarterfinals.push(t);
      }
    }

    // Semifinals: 8 pts por equipo
    for (const t of realSF) {
      if (predSF.has(t)) {
        knockoutTotal += MUNDIAL_POINTS.koSemifinals;
        koCorrectTeams.semifinals.push(t);
      }
    }

    // Final: 16 pts por equipo
    for (const t of realF) {
      if (predF.has(t)) {
        knockoutTotal += MUNDIAL_POINTS.koFinal;
        koCorrectTeams.final.push(t);
      }
    }

    // Winner (Campeón): 32 pts
    for (const t of realWinner) {
      if (predWinner.has(t)) {
        knockoutTotal += MUNDIAL_POINTS.koWinner;
        koCorrectTeams.winner.push(t);
      }
    }
  } else if (!isRealBracket) {
    // Comportamiento de test tradicional: comparación directa por partido
    const predByMatchIdKnockout = new Map<string, MatchPrediction>();
    for (const p of participant.knockoutScores) predByMatchIdKnockout.set(p.matchId, p);

    for (const real of realKnockoutScores) {
      const pred = predByMatchIdKnockout.get(real.matchId);
      const { points, kind } = scoreMatch(
        pred?.scoreA ?? null,
        pred?.scoreB ?? null,
        real.scoreA,
        real.scoreB,
      );
      breakdown.push({ matchId: real.matchId, points, kind });
      knockoutTotal += points;
      if (kind === 'exact') exactCount++;
      else if (kind === 'diff') diffCount++;
      else if (kind === 'sign') signCount++;
    }
  }

  // 3. Premios Individuales: Goleador y MVP
  let awardsTotal = 0;
  const awardsCorrect = { topScorer: false, mvp: false };

  if (REAL_AWARDS.topScorer && participant.topScorer) {
    if (
      REAL_AWARDS.topScorer.teamId === participant.topScorer.teamId &&
      REAL_AWARDS.topScorer.playerName.trim().toLowerCase() === participant.topScorer.playerName.trim().toLowerCase()
    ) {
      awardsTotal += MUNDIAL_POINTS.topScorer;
      awardsCorrect.topScorer = true;
    }
  }

  if (REAL_AWARDS.mvp && participant.mvp) {
    if (
      REAL_AWARDS.mvp.teamId === participant.mvp.teamId &&
      REAL_AWARDS.mvp.playerName.trim().toLowerCase() === participant.mvp.playerName.trim().toLowerCase()
    ) {
      awardsTotal += MUNDIAL_POINTS.mvp;
      awardsCorrect.mvp = true;
    }
  }

  return {
    participant: {
      id: participant.id,
      name: participant.name,
      isOwner: participant.isOwner,
      userId: participant.userId,
      topScorer: participant.topScorer,
      mvp: participant.mvp
    },
    total: groupsTotal + knockoutTotal + awardsTotal,
    byPhase: {
      groups: groupsTotal,
      knockout: knockoutTotal,
      awards: awardsTotal,
    },
    exactCount,
    diffCount,
    signCount,
    breakdown,
    koCorrectTeams,
    awardsCorrect,
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
