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

// --- Codec compacto (formato v2, base64url) ---

function bytesToB64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const COMPACT_VERSION = 0x02;
const NIL = 0xf;

export function encodeBracketCompact(
  groupMatches: readonly GroupMatchResult[],
  knockoutMatches: Record<string, KnockoutMatchResult>
): string {
  const buf: number[] = [COMPACT_VERSION];

  for (const { matchId } of initialGroupMatches) {
    const m = groupMatches.find(g => g.matchId === matchId);
    const nibA = m == null || m.scoreA === null ? NIL : Math.min(m.scoreA, 14);
    const nibB = m == null || m.scoreB === null ? NIL : Math.min(m.scoreB, 14);
    buf.push((nibA << 4) | nibB);
  }

  for (const matchId of getKnockoutMatchOrder()) {
    const m = knockoutMatches[matchId];
    const nibA = m == null || m.scoreA === null ? NIL : Math.min(m.scoreA, 14);
    const nibB = m == null || m.scoreB === null ? NIL : Math.min(m.scoreB, 14);
    buf.push((nibA << 4) | nibB);
    if (nibA !== NIL && nibB !== NIL && nibA === nibB) {
      const penA = m.penaltyScoreA != null ? Math.min(m.penaltyScoreA, 14) : NIL;
      const penB = m.penaltyScoreB != null ? Math.min(m.penaltyScoreB, 14) : NIL;
      buf.push((penA << 4) | penB);
    }
  }

  return bytesToB64url(Uint8Array.from(buf));
}

export function decodeBracketCompact(b64: string): DecodedBracket | null {
  try {
    const bytes = b64urlToBytes(b64);
    if (bytes.length < 1 || bytes[0] !== COMPACT_VERSION) return null;

    const groupOrder = initialGroupMatches.map(m => m.matchId);
    if (bytes.length < 1 + groupOrder.length) return null;

    let idx = 1;
    const groupScores = groupOrder.map(matchId => {
      const byte = bytes[idx++];
      const nibA = (byte >> 4) & 0xf;
      const nibB = byte & 0xf;
      return {
        matchId,
        scoreA: nibA === NIL ? null : nibA,
        scoreB: nibB === NIL ? null : nibB,
      };
    });

    const knockoutOrder = getKnockoutMatchOrder();
    const knockoutScores = knockoutOrder.map(matchId => {
      if (idx >= bytes.length) return { matchId, scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null };
      const byte = bytes[idx++];
      const nibA = (byte >> 4) & 0xf;
      const nibB = byte & 0xf;
      const scoreA = nibA === NIL ? null : nibA;
      const scoreB = nibB === NIL ? null : nibB;
      let penaltyScoreA: number | null = null;
      let penaltyScoreB: number | null = null;
      if (nibA !== NIL && nibB !== NIL && nibA === nibB) {
        if (idx >= bytes.length) return null;
        const penByte = bytes[idx++];
        const penA = (penByte >> 4) & 0xf;
        const penB = penByte & 0xf;
        penaltyScoreA = penA === NIL ? null : penA;
        penaltyScoreB = penB === NIL ? null : penB;
      }
      return { matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB };
    }).filter((s): s is NonNullable<typeof s> => s !== null);

    return { groupScores, knockoutScores };
  } catch {
    return null;
  }
}

// --- URLs de compartir ---

export function buildShareUrl(
  groupMatches: readonly GroupMatchResult[],
  knockoutMatches: Record<string, KnockoutMatchResult>
): string {
  const payload = encodeBracketCompact(groupMatches, knockoutMatches);
  return `${window.location.origin}${window.location.pathname}#b2=${payload}`;
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

export function readSharedBracketFromHash(): DecodedBracket | null {
  const hash = window.location.hash;
  if (hash.startsWith('#b2=')) return decodeBracketCompact(hash.slice(4));
  if (hash.startsWith('#b=')) {
    try {
      return decodeBracket(decodeURIComponent(hash.slice(3)));
    } catch {
      return null;
    }
  }
  return null;
}
