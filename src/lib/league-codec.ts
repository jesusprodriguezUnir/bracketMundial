import type { DecodedBracket } from './bracket-codec';
import type { League } from '../store/leagues-store';
import { GROUP_MATCHES } from '../data/match-schedule';
import { getKnockoutMatchOrder } from '../store/tournament-store';

// --- base64url helpers (same as bracket-codec.ts) ---

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

// --- string encoding ---

function encodeStr(buf: number[], str: string) {
  const encoded = new TextEncoder().encode(str);
  const len = Math.min(encoded.length, 0xff);
  buf.push(len);
  for (let i = 0; i < len; i++) buf.push(encoded[i]);
}

function decodeStr(bytes: Uint8Array, pos: { i: number }): string | null {
  if (pos.i >= bytes.length) return null;
  const len = bytes[pos.i++];
  if (pos.i + len > bytes.length) return null;
  const slice = bytes.slice(pos.i, pos.i + len);
  pos.i += len;
  return new TextDecoder().decode(slice);
}

// --- UUID helpers ---

function encodeUUID(buf: number[], uuid: string) {
  const hex = uuid.replace(/-/g, '');
  for (let i = 0; i < 32; i += 2) {
    buf.push(parseInt(hex.substring(i, i + 2), 16));
  }
}

function decodeUUID(bytes: Uint8Array, pos: { i: number }): string | null {
  if (pos.i + 16 > bytes.length) return null;
  const hex = Array.from(bytes.slice(pos.i, pos.i + 16))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  pos.i += 16;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// --- bracket nibble encoding ---

const NIL = 0xf;

function encodeBracket(buf: number[], groupScores: DecodedBracket['groupScores'], knockoutScores: DecodedBracket['knockoutScores']) {
  const groupById = new Map(groupScores.map(s => [s.matchId, s]));
  const koById = new Map(knockoutScores.map(s => [s.matchId, s]));

  for (const { matchId } of GROUP_MATCHES) {
    const m = groupById.get(matchId);
    const nibA = m == null || m.scoreA === null ? NIL : Math.min(m.scoreA, 14);
    const nibB = m == null || m.scoreB === null ? NIL : Math.min(m.scoreB, 14);
    buf.push((nibA << 4) | nibB);
  }

  for (const matchId of getKnockoutMatchOrder()) {
    const m = koById.get(matchId);
    const nibA = m == null || m.scoreA === null ? NIL : Math.min(m.scoreA, 14);
    const nibB = m == null || m.scoreB === null ? NIL : Math.min(m.scoreB, 14);
    buf.push((nibA << 4) | nibB);
    if (nibA !== NIL && nibB !== NIL && nibA === nibB && m) {
      const penA = m.penaltyScoreA != null ? Math.min(m.penaltyScoreA, 14) : NIL;
      const penB = m.penaltyScoreB != null ? Math.min(m.penaltyScoreB, 14) : NIL;
      buf.push((penA << 4) | penB);
    }
  }
}

function decodeBracket(bytes: Uint8Array, pos: { i: number }): DecodedBracket | null {
  const groupOrder = GROUP_MATCHES.map(m => m.matchId);
  if (pos.i + groupOrder.length > bytes.length) return null;

  const groupScores: DecodedBracket['groupScores'] = groupOrder.map(matchId => {
    const byte = bytes[pos.i++];
    const nibA = (byte >> 4) & 0xf;
    const nibB = byte & 0xf;
    return { matchId, scoreA: nibA === NIL ? null : nibA, scoreB: nibB === NIL ? null : nibB };
  });

  const knockoutOrder = getKnockoutMatchOrder();
  const knockoutScores: DecodedBracket['knockoutScores'] = [];
  for (const matchId of knockoutOrder) {
    if (pos.i >= bytes.length) {
      knockoutScores.push({ matchId, scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null });
      continue;
    }
    const byte = bytes[pos.i++];
    const nibA = (byte >> 4) & 0xf;
    const nibB = byte & 0xf;
    const scoreA = nibA === NIL ? null : nibA;
    const scoreB = nibB === NIL ? null : nibB;
    let penaltyScoreA: number | null = null;
    let penaltyScoreB: number | null = null;
    if (nibA !== NIL && nibB !== NIL && nibA === nibB) {
      if (pos.i >= bytes.length) return null;
      const penByte = bytes[pos.i++];
      const penA = (penByte >> 4) & 0xf;
      const penB = penByte & 0xf;
      penaltyScoreA = penA === NIL ? null : penA;
      penaltyScoreB = penB === NIL ? null : penB;
    }
    knockoutScores.push({ matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB });
  }

  return { groupScores, knockoutScores };
}

// --- public API ---

const VERSION_LG = 0x01;

export interface LeagueInvite {
  leagueId: string;
  name: string;
}

export interface ParticipantShare {
  leagueId: string;
  participantName: string;
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
  topScorer: { teamId: string; playerName: string } | null;
  mvp: { teamId: string; playerName: string } | null;
}

// --- League Invite (#lg=) ---

export function encodeLeagueInvite(leagueId: string, name: string): string {
  const buf: number[] = [VERSION_LG];
  encodeUUID(buf, leagueId);
  encodeStr(buf, name);
  return bytesToB64url(Uint8Array.from(buf));
}

export function decodeLeagueInvite(b64: string): LeagueInvite | null {
  try {
    const bytes = b64urlToBytes(b64);
    if (bytes.length < 18) return null;
    const pos = { i: 0 };

    const version = bytes[pos.i++];
    if (version !== VERSION_LG) return null;

    const leagueId = decodeUUID(bytes, pos);
    if (!leagueId) return null;

    const name = decodeStr(bytes, pos);
    if (!name) return null;

    return { leagueId, name };
  } catch {
    return null;
  }
}

export function buildLeagueInviteUrl(leagueId: string, name: string): string {
  const payload = encodeLeagueInvite(leagueId, name);
  return `${window.location.origin}${window.location.pathname}#lg=${payload}`;
}

// --- Participant Share (#lp=) ---

export function encodeParticipantShare(
  leagueId: string,
  participantName: string,
  groupScores: DecodedBracket['groupScores'],
  knockoutScores: DecodedBracket['knockoutScores'],
  topScorer?: { teamId: string; playerName: string } | null,
  mvp?: { teamId: string; playerName: string } | null,
): string {
  const buf: number[] = [VERSION_LG];
  encodeUUID(buf, leagueId);
  encodeStr(buf, participantName);
  encodeBracket(buf, groupScores, knockoutScores);
  // Premios opcionales: teamId + playerName; cadena vacía codifica como null
  encodeStr(buf, topScorer?.teamId ?? '');
  encodeStr(buf, topScorer?.playerName ?? '');
  encodeStr(buf, mvp?.teamId ?? '');
  encodeStr(buf, mvp?.playerName ?? '');
  return bytesToB64url(Uint8Array.from(buf));
}

export function decodeParticipantShare(b64: string): ParticipantShare | null {
  try {
    const bytes = b64urlToBytes(b64);
    if (bytes.length < 18) return null;
    const pos = { i: 0 };

    const version = bytes[pos.i++];
    if (version !== VERSION_LG) return null;

    const leagueId = decodeUUID(bytes, pos);
    if (!leagueId) return null;

    const participantName = decodeStr(bytes, pos);
    if (!participantName) return null;

    const bracket = decodeBracket(bytes, pos);
    if (!bracket) return null;

    // Premios opcionales: compatibilidad retroactiva — enlaces antiguos sin estos bytes devuelven null
    let topScorer: { teamId: string; playerName: string } | null = null;
    let mvp: { teamId: string; playerName: string } | null = null;
    if (pos.i < bytes.length) {
      const tsTeam = decodeStr(bytes, pos) ?? '';
      const tsPlayer = decodeStr(bytes, pos) ?? '';
      if (tsTeam && tsPlayer) topScorer = { teamId: tsTeam, playerName: tsPlayer };
    }
    if (pos.i < bytes.length) {
      const mvpTeam = decodeStr(bytes, pos) ?? '';
      const mvpPlayer = decodeStr(bytes, pos) ?? '';
      if (mvpTeam && mvpPlayer) mvp = { teamId: mvpTeam, playerName: mvpPlayer };
    }

    return { leagueId, participantName, groupScores: bracket.groupScores, knockoutScores: bracket.knockoutScores, topScorer, mvp };
  } catch {
    return null;
  }
}

export function buildParticipantShareUrl(
  leagueId: string,
  participantName: string,
  groupScores: DecodedBracket['groupScores'],
  knockoutScores: DecodedBracket['knockoutScores'],
  topScorer?: { teamId: string; playerName: string } | null,
  mvp?: { teamId: string; playerName: string } | null,
): string {
  const payload = encodeParticipantShare(leagueId, participantName, groupScores, knockoutScores, topScorer, mvp);
  return `${window.location.origin}${window.location.pathname}#lp=${payload}`;
}

// --- Full League Export (#le=) ---

export function encodeFullLeague(league: League): string {
  const buf: number[] = [VERSION_LG];
  encodeUUID(buf, league.id);
  encodeStr(buf, league.name);
  buf.push(Math.min(league.participants.length, 0xff));

  for (const p of league.participants) {
    encodeStr(buf, p.name);
    encodeBracket(buf, p.groupScores, p.knockoutScores);
  }

  return bytesToB64url(Uint8Array.from(buf));
}

export function decodeFullLeague(b64: string): { leagueId: string; name: string; participants: Array<{ name: string; groupScores: DecodedBracket['groupScores']; knockoutScores: DecodedBracket['knockoutScores'] }> } | null {
  try {
    const bytes = b64urlToBytes(b64);
    if (bytes.length < 19) return null;
    const pos = { i: 0 };

    const version = bytes[pos.i++];
    if (version !== VERSION_LG) return null;

    const leagueId = decodeUUID(bytes, pos);
    if (!leagueId) return null;

    const name = decodeStr(bytes, pos);
    if (!name) return null;

    if (pos.i >= bytes.length) return null;
    const count = bytes[pos.i++];

    const participants: Array<{ name: string; groupScores: DecodedBracket['groupScores']; knockoutScores: DecodedBracket['knockoutScores'] }> = [];
    for (let i = 0; i < count; i++) {
      const pName = decodeStr(bytes, pos);
      if (!pName) return null;
      const bracket = decodeBracket(bytes, pos);
      if (!bracket) return null;
      participants.push({ name: pName, groupScores: bracket.groupScores, knockoutScores: bracket.knockoutScores });
    }

    return { leagueId, name, participants };
  } catch {
    return null;
  }
}

export function buildFullLeagueUrl(league: League): string {
  const payload = encodeFullLeague(league);
  return `${window.location.origin}${window.location.pathname}#le=${payload}`;
}

// --- Hash detection ---

export type LeagueHashType = 'invite' | 'participant' | 'full' | null;

export interface LeagueHashResult {
  type: NonNullable<LeagueHashType>;
  raw: string;
}

export function detectLeagueHash(hash: string): LeagueHashResult | null {
  if (hash.startsWith('#lg=')) return { type: 'invite', raw: hash.slice(4).trim() };
  if (hash.startsWith('#lp=')) return { type: 'participant', raw: hash.slice(4).trim() };
  if (hash.startsWith('#le=')) return { type: 'full', raw: hash.slice(4).trim() };
  return null;
}
