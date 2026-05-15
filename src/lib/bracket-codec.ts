import { initialGroupMatches, getKnockoutMatchOrder } from '../store/tournament-store';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';

const VERSION = 'v1';
const SEP = '.';
const SECTION = '|';
const NULL = 'n';

export interface DecodedBracket {
  groupScores: Array<{ matchId: string; scoreA: number | null; scoreB: number | null }>;
  knockoutScores: Array<{
    matchId: string;
    scoreA: number | null;
    scoreB: number | null;
    penaltyScoreA: number | null;
    penaltyScoreB: number | null;
  }>;
}

export function encodeBracket(
  groupMatches: readonly GroupMatchResult[],
  knockoutMatches: Record<string, KnockoutMatchResult>
): string {
  const groupPart = initialGroupMatches.map(({ matchId }) => {
    const m = groupMatches.find(g => g.matchId === matchId);
    if (!m || m.scoreA === null || m.scoreB === null) return `${NULL}-${NULL}`;
    return `${m.scoreA}-${m.scoreB}`;
  }).join(SEP);

  const knockoutPart = getKnockoutMatchOrder().map(matchId => {
    const m = knockoutMatches[matchId];
    if (!m || m.scoreA === null || m.scoreB === null) return `${NULL}-${NULL}`;
    const pen = (m.penaltyScoreA !== null && m.penaltyScoreA !== undefined &&
                  m.penaltyScoreB !== null && m.penaltyScoreB !== undefined)
      ? `-${m.penaltyScoreA}-${m.penaltyScoreB}`
      : '';
    return `${m.scoreA}-${m.scoreB}${pen}`;
  }).join(SEP);

  return `${VERSION}${SECTION}${groupPart}${SECTION}${knockoutPart}`;
}

export function decodeBracket(payload: string): DecodedBracket | null {
  try {
    const parts = payload.split(SECTION);
    if (parts.length < 3 || parts[0] !== VERSION) return null;
    const [, groupRaw, knockoutRaw] = parts;

    const groupOrder = initialGroupMatches.map(m => m.matchId);
    const groupScores = groupRaw.split(SEP).map((token, i) => {
      const [a, b] = token.split('-');
      return {
        matchId: groupOrder[i] ?? '',
        scoreA: a === NULL ? null : parseInt(a, 10),
        scoreB: b === NULL ? null : parseInt(b, 10),
      };
    }).filter(s => s.matchId);

    const knockoutOrder = getKnockoutMatchOrder();
    const knockoutScores = knockoutRaw.split(SEP).map((token, i) => {
      const segments = token.split('-');
      const isNull = segments[0] === NULL;
      return {
        matchId: knockoutOrder[i] ?? '',
        scoreA: isNull ? null : parseInt(segments[0], 10),
        scoreB: isNull ? null : parseInt(segments[1], 10),
        penaltyScoreA: segments.length > 2 ? parseInt(segments[2], 10) : null,
        penaltyScoreB: segments.length > 3 ? parseInt(segments[3], 10) : null,
      };
    }).filter(s => s.matchId);

    return { groupScores, knockoutScores };
  } catch {
    return null;
  }
}

export function buildShareUrl(
  groupMatches: readonly GroupMatchResult[],
  knockoutMatches: Record<string, KnockoutMatchResult>
): string {
  const payload = encodeBracket(groupMatches, knockoutMatches);
  return `${window.location.origin}${window.location.pathname}#b=${encodeURIComponent(payload)}`;
}

export function extractHashPayload(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#b=')) return null;
  try {
    return decodeURIComponent(hash.slice(3));
  } catch {
    return null;
  }
}
