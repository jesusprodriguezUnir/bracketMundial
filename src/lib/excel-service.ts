import ExcelJS from 'exceljs';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';
import { getKnockoutMatchOrder } from '../store/tournament-store';
import type { Locale } from '../i18n/index';
import type { TranslationKey } from '../i18n/es';
import { es } from '../i18n/es';
import { en } from '../i18n/en';
import { TEAMS_2026, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { GROUP_MATCHES } from '../data/match-schedule';
import { scoreParticipant, rankParticipants, MUNDIAL_POINTS } from './mini-league';
import type { ParticipantScore } from './mini-league';
import type { MatchPoints } from './mini-league';
import type { DecodedBracket } from './bracket-codec';

// ─── Typed import errors ──────────────────────────────────────────────────────

export type ExcelImportErrorCode = 'no_map_sheet' | 'no_valid_rows' | 'parse_error';

export class ExcelImportError extends Error {
  readonly code: ExcelImportErrorCode;
  constructor(code: ExcelImportErrorCode, message: string) {
    super(message);
    this.name = 'ExcelImportError';
    this.code = code;
  }
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export const PANINI_COLORS = {
  paper2:  'E6D6B1',
  paper3:  'FFF9EC',
  ink:     '1A1933',
  yellow:  'F0B021',
  orange:  'E8541F',
  white:   'FFFFFF',
  dim:     '7A6F54',
  red:     'C41E2C',
  green:   '1F6B3A',
  blue:    '22418C',
  qualify: 'FEF0F0',
} as const;

const C = PANINI_COLORS;

// Group header accent colors — same 4-color cycle as groups-view.ts
export const PANINI_GROUP_CYCLE = ['E8541F', '22418C', '1F6B3A', 'C41E2C'] as const;

const GROUP_COLORS_HEX = PANINI_GROUP_CYCLE;

export const THICK: ExcelJS.Border = { style: 'thick', color: { argb: C.ink } };
export const THIN:  ExcelJS.Border = { style: 'thin',  color: { argb: C.ink } };

// ─── i18n (no Zustand dep — reads dicts directly) ────────────────────────────

function lbl(key: TranslationKey, locale: Locale, params?: Record<string, string>): string {
  const dict = locale === 'en' ? en : es;
  let str = (dict[key] ?? (es[key] as string)) as string;
  if (params) {
    for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

// ─── Team helpers ─────────────────────────────────────────────────────────────

function tName(id: string | null | undefined): string {
  if (!id) return '?';
  return TEAMS_2026.find(t => t.id === id)?.name ?? id;
}

function tFlag(id: string | null | undefined): string {
  if (!id) return '';
  return TEAMS_2026.find(t => t.id === id)?.flag ?? '';
}

const FLAG_TIMEOUT_MS = 5000;

/** Fetches the team's SVG flag and rasterizes it to a PNG (base64). Browser-only. */
export async function fetchFlagPng(flagUrl: string): Promise<string | null> {
  try {
    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), FLAG_TIMEOUT_MS));
    const work = (async (): Promise<string | null> => {
      const resp = await fetch(flagUrl);
      if (!resp.ok) return null;
      let svg = await resp.text();
      if (!/<svg[^>]*\swidth=/i.test(svg)) {
        svg = svg.replace(/(<svg\b[^>]*)>/i, '$1 width="980" height="560">');
      }
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      return await new Promise<string>((resolve, reject) => {
        const img = new Image(30, 20);
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = 30; c.height = 20;
          const ctx = c.getContext('2d');
          if (!ctx) { URL.revokeObjectURL(url); reject(new Error('no ctx')); return; }
          ctx.drawImage(img, 0, 0, 30, 20);
          URL.revokeObjectURL(url);
          resolve(c.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('flag load failed')); };
        img.src = url;
      });
    })();
    return await Promise.race([work, timeout]);
  } catch {
    return null;
  }
}

function fmtDate(date?: string): string {
  if (!date) return '';
  const p = date.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}` : date;
}

function kindToArgb(kind: MatchPoints['kind']): { bg: string; fg: string } {
  switch (kind) {
    case 'exact':   return { bg: C.green,  fg: C.white };
    case 'diff':    return { bg: C.blue,   fg: C.white };
    case 'sign':    return { bg: C.yellow, fg: C.ink };
    case 'miss':    return { bg: C.paper2, fg: C.dim };
    case 'pending': return { bg: C.paper3, fg: C.dim };
  }
}

// ─── Layout ───────────────────────────────────────────────────────────────────

const BOXES_PER_ROW = 3;
const BOX_COLS      = 10;
const BOX_GAP       = 1;
const BOX_STEP      = BOX_COLS + BOX_GAP; // = 11

// Row offsets within a group box (0-indexed from box startRow):
const OFF_HEADER    = 0;
const OFF_MLBLS     = 1;
const OFF_MATCH_0   = 2;
const MATCH_COUNT   = 6;
const OFF_STND_HDR  = OFF_MATCH_0 + MATCH_COUNT;   // 8
const OFF_STND_LBLS = OFF_STND_HDR + 1;            // 9
const OFF_STND_0    = OFF_STND_LBLS + 1;           // 10
const TEAM_COUNT    = 4;
const BOX_HEIGHT    = OFF_STND_0 + TEAM_COUNT;     // 14

// Match column offsets (from startCol):
const MC_ID   = 0;
const MC_MD   = 1;
const MC_DATE = 2;
const MC_HOME = 3;
const MC_FLA  = 4;
const MC_SA   = 5; // scoreA — editable yellow
const MC_SEP  = 6;
const MC_SB   = 7; // scoreB — editable yellow
const MC_FLB  = 8;
const MC_AWAY = 9;

// CALC sheet columns (1-indexed):
const CC_TEAM = 2;
const CC_PJ   = 3;
const CC_G    = 4;
const CC_E    = 5;
const CC_P    = 6;
const CC_GF   = 7;
const CC_GC   = 8;
const CC_DG   = 9;
const CC_PTS  = 10;
const CC_KEY  = 11;
const CALC_ROW_OFFSET = 2; // group block 0 starts at CALC row 2

// ─── Internal types ───────────────────────────────────────────────────────────

interface TeamMatchInfo {
  readonly teamId:  string;
  readonly name:    string;
  readonly teamIdx: number; // position in TEAMS_2026 filter for this group (0-3)
  // Addresses of score cells in the groups sheet, for formula building:
  readonly localSA: string[]; // scoreA cells where this team is teamA (their goals)
  readonly localSB: string[]; // scoreB cells where this team is teamA (opp goals)
  readonly awaySB:  string[]; // scoreB cells where this team is teamB (their goals)
  readonly awaySA:  string[]; // scoreA cells where this team is teamB (opp goals)
}

interface MatchCell {
  readonly matchId:   string;
  readonly sheetName: string;
  readonly saAddr:    string;
  readonly sbAddr:    string;
}

interface KnockoutCell {
  readonly matchId:   string;
  readonly sheetName: string;
  readonly saAddr:    string;
  readonly sbAddr:    string;
  readonly penAddr:   string;
}

interface GroupDrawInfo {
  readonly letter:     string;
  readonly groupIdx:   number; // 0=A … 11=L
  readonly startRow:   number;
  readonly startCol:   number;
  readonly teams:      TeamMatchInfo[];
  readonly matchCells: MatchCell[];
}

export interface ImportResult {
  groupScores:    { matchId: string; scoreA: number | null; scoreB: number | null }[];
  knockoutScores: { matchId: string; scoreA: number | null; scoreB: number | null; penaltyScoreA: number | null; penaltyScoreB: number | null }[];
}

// ─── Formula builders ─────────────────────────────────────────────────────────

function shRef(name: string): string {
  return name.includes(' ') ? `'${name}'` : name;
}

function xref(sr: string, addr: string): string {
  return `${sr}!${addr}`;
}

function colLetter(col: number): string {
  let r = '', c = col;
  while (c > 0) { c--; r = String.fromCharCode(65 + c % 26) + r; c = Math.floor(c / 26); }
  return r;
}

function calcRange(col: number, r1: number, r4: number): string {
  const cl = colLetter(col);
  return `CALC!$${cl}$${r1}:$${cl}$${r4}`;
}

function standingF(calcCol: number, r1: number, r4: number, pos: number): string {
  const kr = calcRange(CC_KEY, r1, r4);
  const vr = calcRange(calcCol, r1, r4);
  return `INDEX(${vr},MATCH(LARGE(${kr},${pos}),${kr},0))`;
}

function formulaGF(ti: TeamMatchInfo, sr: string): string {
  const cells = [...ti.localSA, ...ti.awaySB].map(a => xref(sr, a));
  return cells.length ? `SUM(${cells.join(',')})` : '0';
}

function formulaGC(ti: TeamMatchInfo, sr: string): string {
  const cells = [...ti.localSB, ...ti.awaySA].map(a => xref(sr, a));
  return cells.length ? `SUM(${cells.join(',')})` : '0';
}

function formulaPJ(ti: TeamMatchInfo, sr: string): string {
  const cells = [...ti.localSA, ...ti.awaySB].map(a => xref(sr, a));
  return cells.length ? `COUNT(${cells.join(',')})` : '0';
}

function wdl(ti: TeamMatchInfo, sr: string): { w: string; d: string; l: string } {
  const wp: string[] = [], dp: string[] = [], lp: string[] = [];
  ti.localSA.forEach((saA, i) => {
    const s1 = xref(sr, saA), s2 = xref(sr, ti.localSB[i]);
    const b = `AND(ISNUMBER(${s1}),ISNUMBER(${s2}))`;
    wp.push(`IF(${b},IF(${s1}>${s2},1,0),0)`);
    dp.push(`IF(${b},IF(${s1}=${s2},1,0),0)`);
    lp.push(`IF(${b},IF(${s1}<${s2},1,0),0)`);
  });
  ti.awaySB.forEach((sbB, i) => {
    const s1 = xref(sr, ti.awaySA[i]), s2 = xref(sr, sbB);
    const b = `AND(ISNUMBER(${s1}),ISNUMBER(${s2}))`;
    wp.push(`IF(${b},IF(${s2}>${s1},1,0),0)`);
    dp.push(`IF(${b},IF(${s2}=${s1},1,0),0)`);
    lp.push(`IF(${b},IF(${s2}<${s1},1,0),0)`);
  });
  const join = (a: string[]) => a.length ? a.join('+') : '0';
  return { w: join(wp), d: join(dp), l: join(lp) };
}

// ─── Style helpers ────────────────────────────────────────────────────────────

export function fill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

export function center(sheet: ExcelJS.Worksheet, r: number, c: number): ExcelJS.Cell {
  const cell = sheet.getCell(r, c);
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  return cell;
}

export function yellow(sheet: ExcelJS.Worksheet, r: number, c: number): void {
  const cell = sheet.getCell(r, c);
  cell.fill = fill(C.yellow);
  cell.border = { top: THIN, left: THIN, bottom: THIN, right: THIN };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.font = { bold: true, size: 10 };
  cell.dataValidation = {
    type: 'whole',
    operator: 'greaterThanOrEqual',
    allowBlank: true,
    showErrorMessage: true,
    formulae: [0],
  };
}

export function addBorder(
  sheet: ExcelJS.Worksheet,
  r: number, c: number,
  side: 'top' | 'bottom' | 'left' | 'right',
  border: ExcelJS.Border
): void {
  const cell = sheet.getCell(r, c);
  cell.border = { ...cell.border, [side]: border };
}

// ─── Knockout dynamic formula helpers ────────────────────────────────────────

// Returns an INDEX/MATCH formula that resolves the team name at `pos` in group `slot`.
// Slot format: G-[A-L]-[12]. Returns null for 3rd-place slots (G-3-X).
function slotToTeamFormula(slot: string): string | null {
  const m = /^G-([A-L])-([12])$/.exec(slot);
  if (!m) return null;
  const groupIdx = m[1].charCodeAt(0) - 65;
  const pos = parseInt(m[2], 10);
  const r1 = CALC_ROW_OFFSET + groupIdx * TEAM_COUNT;
  const r4 = r1 + TEAM_COUNT - 1;
  return standingF(CC_TEAM, r1, r4, pos);
}

interface KoMatchRef {
  readonly teamAAddr: string;
  readonly teamBAddr: string;
  readonly saAddr:    string;
  readonly sbAddr:    string;
  readonly penAddr:   string;
}

function winnerFormula(ref: KoMatchRef): string {
  const { teamAAddr: tA, teamBAddr: tB, saAddr: sa, sbAddr: sb, penAddr: pen } = ref;
  const hasPen = `AND(LEN(${pen})>2,ISNUMBER(VALUE(LEFT(${pen},FIND("-",${pen})-1))))`;
  const penA   = `VALUE(LEFT(${pen},FIND("-",${pen})-1))`;
  const penB   = `VALUE(MID(${pen},FIND("-",${pen})+1,10))`;
  return `IF(AND(ISNUMBER(${sa}),ISNUMBER(${sb})),IF(${sa}>${sb},${tA},IF(${sb}>${sa},${tB},IF(${hasPen},IF(${penA}>${penB},${tA},${tB}),""))),"")`;
}

function loserFormula(ref: KoMatchRef): string {
  const { teamAAddr: tA, teamBAddr: tB, saAddr: sa, sbAddr: sb, penAddr: pen } = ref;
  const hasPen = `AND(LEN(${pen})>2,ISNUMBER(VALUE(LEFT(${pen},FIND("-",${pen})-1))))`;
  const penA   = `VALUE(LEFT(${pen},FIND("-",${pen})-1))`;
  const penB   = `VALUE(MID(${pen},FIND("-",${pen})+1,10))`;
  return `IF(AND(ISNUMBER(${sa}),ISNUMBER(${sb})),IF(${sa}>${sb},${tB},IF(${sb}>${sa},${tA},IF(${hasPen},IF(${penA}>${penB},${tB},${tA}),""))),"")`;
}

// ─── Main service ─────────────────────────────────────────────────────────────

export class ExcelService {
  static async exportToExcel(
    groupMatches: GroupMatchResult[],
    knockoutMatches: Record<string, KnockoutMatchResult>,
    locale: Locale = 'es'
  ): Promise<Blob> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Bracket Mundial 2026';
    wb.created = new Date();
    wb.modified = new Date();

    // Pre-fetch flag images and register them in the workbook
    const allTeamIds = new Set<string>();
    groupMatches.forEach(m => { allTeamIds.add(m.teamA); allTeamIds.add(m.teamB); });
    Object.values(knockoutMatches).forEach(m => {
      if (m.teamA) allTeamIds.add(m.teamA);
      if (m.teamB) allTeamIds.add(m.teamB);
    });
    const flagImages = new Map<string, number>(); // teamId → workbook imageId
    await Promise.all(Array.from(allTeamIds).map(async id => {
      const team = TEAMS_2026.find(t => t.id === id);
      if (!team?.flagUrl) return;
      const png = await fetchFlagPng(team.flagUrl);
      if (png == null) return;
      flagImages.set(id, wb.addImage({ base64: png, extension: 'png' }));
    }));

    const groupsName   = lbl('excel.sheetGroups',   locale);
    const knockoutName = lbl('excel.sheetKnockout', locale);

    const drawInfos    = this.createGroupsSheet(wb, groupMatches, locale, groupsName, flagImages);
    this.createCalcSheet(wb, drawInfos, groupsName);
    this.fillStandingsFormulas(wb, drawInfos, groupsName);
    const koCells      = this.createKnockoutSheet(wb, knockoutMatches, locale, knockoutName, flagImages);
    this.createMapSheet(wb, drawInfos.flatMap(d => d.matchCells), koCells);

    const buffer = await wb.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // ── League predictions export ────────────────────────────────────────────────

  static async exportLeaguePredictions(
    league: { name: string; participants: Array<{ id: string; name: string; isOwner?: boolean; groupScores: DecodedBracket['groupScores']; knockoutScores: DecodedBracket['knockoutScores'] }> },
    realGroupMatches: GroupMatchResult[],
    realKnockoutMatches: Record<string, KnockoutMatchResult>,
    locale: Locale = 'es',
  ): Promise<Blob> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Bracket Mundial 2026';
    wb.created = new Date();
    wb.modified = new Date();

    const realGroupScores: { matchId: string; scoreA: number | null; scoreB: number | null }[] =
      realGroupMatches.map(m => ({ matchId: m.matchId, scoreA: m.scoreA, scoreB: m.scoreB }));
    const realKnockoutScores: { matchId: string; scoreA: number | null; scoreB: number | null }[] =
      Object.values(realKnockoutMatches).map(m => ({ matchId: m.matchId, scoreA: m.scoreA, scoreB: m.scoreB }));

    const allParticipants = league.participants;
    const scored: ParticipantScore[] = [];
    for (const p of allParticipants) {
      scored.push(scoreParticipant(p, realGroupScores, realKnockoutScores));
    }
    const ranked = rankParticipants(scored);

    // ── Pre-fetch flag images (shared across all sheets) ───────────────────
    const allTeamIds = new Set<string>();
    realGroupMatches.forEach(m => { allTeamIds.add(m.teamA); allTeamIds.add(m.teamB); });
    Object.values(realKnockoutMatches).forEach(m => {
      if (m.teamA) allTeamIds.add(m.teamA);
      if (m.teamB) allTeamIds.add(m.teamB);
    });
    const flagImages = new Map<string, number>();
    await Promise.all(Array.from(allTeamIds).map(async id => {
      const team = TEAMS_2026.find(t => t.id === id);
      if (!team?.flagUrl) return;
      const png = await fetchFlagPng(team.flagUrl);
      if (png == null) return;
      flagImages.set(id, wb.addImage({ base64: png, extension: 'png' }));
    }));

    // ── Pre-compute scoring data ───────────────────────────────────────────
    const predByParticipant = new Map<string, Map<string, { scoreA: number | null; scoreB: number | null }>>();
    for (const p of allParticipants) {
      const m = new Map<string, { scoreA: number | null; scoreB: number | null }>();
      for (const s of p.groupScores) m.set(s.matchId, { scoreA: s.scoreA, scoreB: s.scoreB });
      for (const s of p.knockoutScores) m.set(s.matchId, { scoreA: s.scoreA, scoreB: s.scoreB });
      predByParticipant.set(p.id, m);
    }

    const breakdownByPid = new Map<string, Map<string, MatchPoints>>();
    for (const s of scored) {
      const m = new Map<string, MatchPoints>();
      for (const b of s.breakdown) m.set(b.matchId, b);
      breakdownByPid.set(s.participant.id, m);
    }

    const realByMatchId = new Map<string, { scoreA: number | null; scoreB: number | null }>();
    for (const r of realGroupScores) realByMatchId.set(r.matchId, { scoreA: r.scoreA, scoreB: r.scoreB });
    for (const r of realKnockoutScores) realByMatchId.set(r.matchId, { scoreA: r.scoreA, scoreB: r.scoreB });

    // ── Sheet 1: Resumen ───────────────────────────────────────────────────
    const rankSheet = wb.addWorksheet(locale === 'en' ? 'Ranking' : 'Resumen', {
      views: [{ showGridLines: false }],
    });

    const rulesTitle = rankSheet.getCell(1, 1);
    rulesTitle.value = locale === 'en' ? 'Scoring Rules' : 'Reglas de puntuación';
    rulesTitle.font = { bold: true, size: 14, color: { argb: C.ink } };
    rankSheet.mergeCells(1, 1, 1, 12);

    const ruleRows: Array<{ points: number; type: string; desc: string; kind: MatchPoints['kind'] }> = [
      { points: MUNDIAL_POINTS.groupExact, type: locale === 'en' ? 'Exact score' : 'Resultado exacto', desc: locale === 'en' ? 'You predict the exact score (e.g., predict 2-1, result 2-1)' : 'Aciertas el marcador exacto (predices 2-1, resultado 2-1)', kind: 'exact' },
      { points: MUNDIAL_POINTS.groupDiff, type: locale === 'en' ? 'Goal difference' : 'Diferencia correcta', desc: locale === 'en' ? 'You get the goal difference right (e.g., predict 3-1, result 2-0)' : 'Aciertas la diferencia de goles (predices 3-1, resultado 2-0)', kind: 'diff' },
      { points: MUNDIAL_POINTS.groupSign, type: locale === 'en' ? 'Correct sign' : 'Signo correcto', desc: locale === 'en' ? 'You get the winner/draw but not the difference (e.g., predict 2-0, result 5-1)' : 'Aciertas el ganador/empate pero no la diferencia (predices 2-0, resultado 5-1)', kind: 'sign' },
      { points: MUNDIAL_POINTS.groupMiss, type: locale === 'en' ? 'Miss' : 'Fallo', desc: locale === 'en' ? 'Wrong winner or no prediction' : 'Ganador equivocado o sin pronóstico', kind: 'miss' },
      { points: MUNDIAL_POINTS.topScorer, type: locale === 'en' ? 'Tournament Top Scorer' : 'Máximo Goleador', desc: locale === 'en' ? 'Predict the official top scorer of the tournament' : 'Aciertas el máximo goleador oficial del campeonato (+15 pts)', kind: 'exact' },
      { points: MUNDIAL_POINTS.mvp, type: locale === 'en' ? 'Tournament MVP' : 'MVP del Campeonato', desc: locale === 'en' ? 'Predict the official MVP of the tournament' : 'Aciertas el mejor jugador (MVP) oficial del campeonato (+15 pts)', kind: 'exact' },
    ];

    ruleRows.forEach((rule, idx) => {
      const r = 2 + idx;
      const { bg, fg } = kindToArgb(rule.kind);
      [String(rule.points), rule.type, rule.desc].forEach((v, i) => {
        const cell = rankSheet.getCell(r, i + 1);
        cell.value = v;
        cell.fill = fill(bg);
        cell.font = { size: 10, color: { argb: fg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    const tieNote = rankSheet.getCell(8, 1);
    tieNote.value = locale === 'en'
      ? 'Total points are split between Group Stage + Knockout + Individual Awards. Tiebreaker: number of exact scores.'
      : 'El total se reparte en Grupos + Eliminatorias + Premios Individuales. Desempate: nº de aciertos exactos.';
    tieNote.font = { italic: true, size: 9, color: { argb: C.dim } };
    rankSheet.mergeCells(8, 1, 8, 12);

    const RANK_HEADER_ROW = 10;

    const rankHeaders = [
      locale === 'en' ? 'Pos' : 'Pos.',
      locale === 'en' ? 'Player' : 'Participante',
      locale === 'en' ? 'Total' : 'Total',
      locale === 'en' ? 'Groups' : 'Grupos',
      locale === 'en' ? 'Knockout' : 'Eliminatorias',
      locale === 'en' ? 'Exact' : 'Exactos',
      locale === 'en' ? 'Diff' : 'Dif',
      locale === 'en' ? 'Sign' : 'Signo',
      locale === 'en' ? 'Top Scorer' : 'Máximo Goleador',
      locale === 'en' ? 'Top Scorer Pts' : 'Pts Goleador',
      locale === 'en' ? 'Tournament MVP' : 'MVP del Campeonato',
      locale === 'en' ? 'MVP Pts' : 'Pts MVP',
    ];

    rankHeaders.forEach((h, i) => {
      const cell = rankSheet.getCell(RANK_HEADER_ROW, i + 1);
      cell.value = h;
      cell.font = { bold: true, size: 11, color: { argb: 'F0B021' } };
      cell.fill = fill('1A1933');
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin', color: { argb: '1A1933' } } };
    });

    ranked.forEach((s, rowIdx) => {
      const r = rowIdx + RANK_HEADER_ROW + 1;
      const rowBg = rowIdx % 2 === 0 ? 'FFF9EC' : 'E6D6B1';

      const vals = [
        rowIdx + 1,
        s.participant.name + (s.participant.isOwner ? ' ★' : ''),
        s.total,
        s.byPhase.groups,
        s.byPhase.knockout,
        s.exactCount,
        s.diffCount,
        s.signCount,
        s.participant.topScorer ? `${s.participant.topScorer.playerName} (${s.participant.topScorer.teamId})` : '-',
        s.awardsCorrect.topScorer ? `+${MUNDIAL_POINTS.topScorer}` : '0',
        s.participant.mvp ? `${s.participant.mvp.playerName} (${s.participant.mvp.teamId})` : '-',
        s.awardsCorrect.mvp ? `+${MUNDIAL_POINTS.mvp}` : '0',
      ];
      vals.forEach((v, i) => {
        const cell = rankSheet.getCell(r, i + 1);
        cell.value = v;
        cell.fill = fill(rowBg);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { size: 11 };
      });

      if (rowIdx === 0) {
        for (let i = 1; i <= vals.length; i++) {
          rankSheet.getCell(r, i).font = { bold: true, size: 13, color: { argb: 'C41E2C' } };
        }
      }
    });

    rankSheet.getColumn(1).width = 6;
    rankSheet.getColumn(2).width = 25;
    for (let i = 3; i <= 8; i++) rankSheet.getColumn(i).width = 12;
    rankSheet.getColumn(9).width = 25; // Máximo Goleador
    rankSheet.getColumn(10).width = 12; // Pts Goleador
    rankSheet.getColumn(11).width = 25; // MVP
    rankSheet.getColumn(12).width = 12; // Pts MVP

    const rankNoteRow = ranked.length + RANK_HEADER_ROW + 2;
    const rankNote = rankSheet.getCell(rankNoteRow, 1);
    rankNote.value = locale === 'en'
      ? '→ See detailed scoring rules in the Scoring Rules tab'
      : '→ Ver pestaña Reglas de Puntuación para el detalle de puntos';
    rankNote.font = { italic: true, size: 10, color: { argb: C.dim } };
    rankSheet.mergeCells(rankNoteRow, 1, rankNoteRow, 12);

    // ── Build match order and names ─────────────────────────────────────────
    const matchNameById = new Map<string, string>();
    const allMatchOrder: string[] = [];
    const groupMatchIds = new Set<string>();

    for (const gm of GROUP_MATCHES) {
      allMatchOrder.push(gm.matchId);
      groupMatchIds.add(gm.matchId);
      matchNameById.set(gm.matchId, `${tName(gm.teamA)} vs ${tName(gm.teamB)}`);
    }
    for (const matchId of getKnockoutMatchOrder()) {
      allMatchOrder.push(matchId);
      matchNameById.set(matchId, matchId);
    }

    // ── Sheets 2 & 3: Grupos + Eliminatorias estilo torneo (mismas que el Excel del torneo) ──
    const groupsName   = lbl('excel.sheetGroups',   locale);
    const knockoutName = lbl('excel.sheetKnockout', locale);

    const drawInfos = this.createGroupsSheet(wb, realGroupMatches, locale, groupsName, flagImages);
    this.createCalcSheet(wb, drawInfos, groupsName);
    this.fillStandingsFormulas(wb, drawInfos, groupsName);
    this.createKnockoutSheet(wb, realKnockoutMatches, locale, knockoutName, flagImages);
    this.createRulesExplanationSheet(wb, locale);

    // ── Sheet 4: Pronósticos plana — banderas en columnas separadas ─────────
    const THIN_BORDER = { top: THIN, left: THIN, bottom: THIN, right: THIN };

    const predSheet = wb.addWorksheet(locale === 'en' ? 'Predictions' : 'Pronósticos', {
      views: [{ state: 'frozen', xSplit: 4, ySplit: 2, showGridLines: false }],
    });

    const predHdr = (cell: ExcelJS.Cell, value: string) => {
      cell.value = value;
      cell.font = { bold: true, size: 11, color: { argb: 'F0B021' } };
      cell.fill = fill('1A1933');
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    };

    // Columnas: 1=ID, 2=banderaA, 3=Partido, 4=banderaB, 5=Real, 6..=participantes
    predHdr(predSheet.getCell(1, 1), locale === 'en' ? 'Match ID' : 'ID');
    predHdr(predSheet.getCell(1, 2), '');
    predHdr(predSheet.getCell(1, 3), locale === 'en' ? 'Match' : 'Partido');
    predHdr(predSheet.getCell(1, 4), '');
    predHdr(predSheet.getCell(1, 5), locale === 'en' ? 'Real Result' : 'Resultado real');

    const ptsColLabel = locale === 'en' ? 'Pts' : 'Pts';
    const PRED_PARTICIPANT_START_COL = 6;

    allParticipants.forEach((p, pi) => {
      const col = PRED_PARTICIPANT_START_COL + pi * 2;
      predHdr(predSheet.getCell(1, col), p.name + (p.isOwner ? ' ★' : ''));
      predHdr(predSheet.getCell(1, col + 1), ptsColLabel);
    });

    allMatchOrder.forEach((matchId, rowIdx) => {
      const r = rowIdx + 2;
      const rowBg = rowIdx % 2 === 0 ? 'FFF9EC' : 'E6D6B1';
      const isGroup = groupMatchIds.has(matchId);

      const baseCell = (col: number, value: string | number, align: 'left' | 'center' = 'center') => {
        const c = predSheet.getCell(r, col);
        c.value = value;
        c.fill = fill(rowBg);
        c.alignment = { horizontal: align, vertical: 'middle' };
        c.font = { size: 10 };
        c.border = THIN_BORDER;
        return c;
      };

      baseCell(1, matchId).font = { size: 8, color: { argb: C.dim } };

      let teamAId: string | null = null;
      let teamBId: string | null = null;
      let matchLabel = matchId;

      if (isGroup) {
        const gm = GROUP_MATCHES.find(m => m.matchId === matchId);
        if (gm) {
          teamAId = gm.teamA;
          teamBId = gm.teamB;
          matchLabel = `${tName(gm.teamA)} vs ${tName(gm.teamB)}`;
        }
      } else {
        const km = realKnockoutMatches[matchId];
        if (km) {
          teamAId = km.teamA;
          teamBId = km.teamB;
          matchLabel = `${tName(km.teamA)} vs ${tName(km.teamB)}`;
        }
      }

      // Bandera A (col 2) en celda separada
      const flagACell = predSheet.getCell(r, 2);
      flagACell.fill = fill(rowBg);
      flagACell.border = THIN_BORDER;
      flagACell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (teamAId) {
        const imgIdA = flagImages.get(teamAId);
        if (imgIdA !== undefined) {
          const addrA = flagACell.address;
          predSheet.addImage(imgIdA, `${addrA}:${addrA}`);
        } else {
          flagACell.value = tFlag(teamAId);
        }
      }

      baseCell(3, matchLabel, 'center');

      // Bandera B (col 4) en celda separada
      const flagBCell = predSheet.getCell(r, 4);
      flagBCell.fill = fill(rowBg);
      flagBCell.border = THIN_BORDER;
      flagBCell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (teamBId) {
        const imgIdB = flagImages.get(teamBId);
        if (imgIdB !== undefined) {
          const addrB = flagBCell.address;
          predSheet.addImage(imgIdB, `${addrB}:${addrB}`);
        } else {
          flagBCell.value = tFlag(teamBId);
        }
      }

      const real = realByMatchId.get(matchId);
      const realStr = (real?.scoreA !== null && real?.scoreA !== undefined && real?.scoreB !== null && real?.scoreB !== undefined)
        ? `${real.scoreA}-${real.scoreB}`
        : '-';
      baseCell(5, realStr).font = { size: 10, bold: true };

      allParticipants.forEach((p, pi) => {
        const col = PRED_PARTICIPANT_START_COL + pi * 2;
        const pred = predByParticipant.get(p.id)?.get(matchId);
        const predStr = (pred?.scoreA !== null && pred?.scoreA !== undefined && pred?.scoreB !== null && pred?.scoreB !== undefined)
          ? `${pred.scoreA}-${pred.scoreB}`
          : '-';
        baseCell(col, predStr);

        const bp = breakdownByPid.get(p.id)?.get(matchId);
        const ptsCell = predSheet.getCell(r, col + 1);
        if (bp) {
          const { bg, fg } = kindToArgb(bp.kind);
          ptsCell.value = bp.points;
          ptsCell.fill = fill(bg);
          ptsCell.alignment = { horizontal: 'center', vertical: 'middle' };
          ptsCell.font = { size: 10, color: { argb: fg }, bold: true };
        } else {
          ptsCell.value = 0;
          ptsCell.fill = fill(rowBg);
          ptsCell.alignment = { horizontal: 'center', vertical: 'middle' };
          ptsCell.font = { size: 10, color: { argb: C.dim } };
        }
        ptsCell.border = THIN_BORDER;
      });

      predSheet.getRow(r).height = 18;
    });

    predSheet.getColumn(1).width = 8;
    predSheet.getColumn(2).width = 5;
    predSheet.getColumn(3).width = 32;
    predSheet.getColumn(4).width = 5;
    predSheet.getColumn(5).width = 14;
    for (let i = 0; i < allParticipants.length; i++) {
      predSheet.getColumn(PRED_PARTICIPANT_START_COL + i * 2).width = 14;
      predSheet.getColumn(PRED_PARTICIPANT_START_COL + i * 2 + 1).width = 6;
    }

    const buffer = await wb.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  // ── Groups sheet ─────────────────────────────────────────────────────────────

  private static createGroupsSheet(
    wb: ExcelJS.Workbook,
    matches: GroupMatchResult[],
    locale: Locale,
    sheetName: string,
    flagImages: Map<string, number>
  ): GroupDrawInfo[] {
    const sheet = wb.addWorksheet(sheetName, {
      views: [{ showGridLines: false }],
      properties: { defaultRowHeight: 18 },
    });

    // Column widths — repeat the pattern for each of the 3 box positions
    const WIDTHS = [5, 7, 10, 16, 5, 6, 3, 6, 5, 16];
    for (let box = 0; box < BOXES_PER_ROW; box++) {
      const sc = 2 + box * BOX_STEP;
      WIDTHS.forEach((w, i) => { sheet.getColumn(sc + i).width = w; });
    }
    // Gap column between boxes
    sheet.getColumn(2 + BOX_STEP - 1).width = 2;
    sheet.getColumn(2 + 2 * BOX_STEP - 1).width = 2;

    const GROUPS = 'ABCDEFGHIJKL'.split('');
    const drawInfos: GroupDrawInfo[] = [];

    GROUPS.forEach((letter, idx) => {
      const row = idx % BOXES_PER_ROW;
      const boxRow = Math.floor(idx / BOXES_PER_ROW);
      const startRow = 2 + boxRow * (BOX_HEIGHT + 3);
      const startCol = 2 + row * BOX_STEP;

      const groupMatches = matches
        .filter(m => m.group === letter)
        .sort((a, b) => a.matchDay - b.matchDay);

      drawInfos.push(
        this.drawGroupBox(sheet, letter, idx, groupMatches, startRow, startCol, locale, sheetName, flagImages)
      );
    });

    return drawInfos;
  }

  private static drawGroupBox(
    sheet: ExcelJS.Worksheet,
    letter: string,
    groupIdx: number,
    matches: GroupMatchResult[],
    startRow: number,
    startCol: number,
    locale: Locale,
    sheetName: string,
    flagImages: Map<string, number>
  ): GroupDrawInfo {
    // ── Header ────────────────────────────────────────────────────────────────
    // Pre-compute played-count formula using the 6 scoreA cells of this box
    const saCol = colLetter(startCol + MC_SA);
    const saTop = startRow + OFF_MATCH_0;
    const playedF = `COUNTA($${saCol}$${saTop}:$${saCol}$${saTop + MATCH_COUNT - 1})&"/6"`;

    const hdr = sheet.getCell(startRow + OFF_HEADER, startCol);
    hdr.value = lbl('groups.group', locale, { letter });
    hdr.font  = { bold: true, size: 13, color: { argb: C.white } };
    hdr.fill  = fill(GROUP_COLORS_HEX[groupIdx % 4]);
    hdr.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(startRow + OFF_HEADER, startCol, startRow + OFF_HEADER, startCol + BOX_COLS - 4);

    const bdg = sheet.getCell(startRow + OFF_HEADER, startCol + BOX_COLS - 3);
    bdg.value = { formula: playedF };
    bdg.font  = { bold: true, size: 8, color: { argb: C.ink } };
    bdg.fill  = fill(C.paper2);
    bdg.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(startRow + OFF_HEADER, startCol + BOX_COLS - 3, startRow + OFF_HEADER, startCol + BOX_COLS - 1);

    // ── Match column labels ───────────────────────────────────────────────────
    const mLabels = [
      lbl('excel.colId', locale),
      lbl('excel.colMatchday', locale),
      lbl('excel.colDate', locale),
      lbl('excel.colHome', locale),
      '',
      lbl('excel.colGF', locale),
      '-',
      lbl('excel.colGC', locale),
      '',
      lbl('excel.colAway', locale),
    ];
    mLabels.forEach((v, i) => {
      const c = center(sheet, startRow + OFF_MLBLS, startCol + i);
      c.value = v;
      c.font  = { bold: true, size: 8, color: { argb: C.ink } };
      c.fill  = fill(C.paper2);
      c.border = { bottom: THIN };
    });

    // ── Match rows ────────────────────────────────────────────────────────────
    const groupTeams = TEAMS_2026.filter(t => t.group === letter);
    type TeamSlots = { localSA: string[]; localSB: string[]; awaySB: string[]; awaySA: string[] };
    const teamMap = new Map<string, TeamSlots>(
      groupTeams.map(t => [t.id, { localSA: [], localSB: [], awaySB: [], awaySA: [] }])
    );
    const teamIdx = new Map(groupTeams.map((t, i) => [t.id, i]));

    const matchCells: MatchCell[] = [];

    matches.forEach((m, i) => {
      const r = startRow + OFF_MATCH_0 + i;
      const bgFill = fill(i % 2 === 0 ? C.paper3 : 'F0EADA');

      const rowCells = [MC_ID, MC_MD, MC_DATE, MC_HOME, MC_FLA, MC_SA, MC_SEP, MC_SB, MC_FLB, MC_AWAY];
      rowCells.forEach(ci => {
        const cell = sheet.getCell(r, startCol + ci);
        cell.fill = bgFill;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      sheet.getCell(r, startCol + MC_ID).value   = m.matchId;
      sheet.getCell(r, startCol + MC_ID).font     = { size: 7, color: { argb: C.dim } };
      sheet.getCell(r, startCol + MC_MD).value    = m.matchDay;
      sheet.getCell(r, startCol + MC_MD).font     = { size: 8, color: { argb: C.dim } };
      sheet.getCell(r, startCol + MC_DATE).value  = fmtDate(m.date);
      sheet.getCell(r, startCol + MC_DATE).font   = { size: 8 };
      if (m.venue) {
        sheet.getCell(r, startCol + MC_DATE).note = `${m.venue}${m.city ? ', ' + m.city : ''}`;
      }
      sheet.getCell(r, startCol + MC_HOME).value  = tName(m.teamA);
      sheet.getCell(r, startCol + MC_HOME).font   = { size: 9 };
      sheet.getCell(r, startCol + MC_HOME).alignment = { horizontal: 'right', vertical: 'middle' };
      const imgIdA = flagImages.get(m.teamA);
      if (imgIdA !== undefined) {
        const addrA = sheet.getCell(r, startCol + MC_FLA).address;
        sheet.addImage(imgIdA, `${addrA}:${addrA}`);
      } else {
        sheet.getCell(r, startCol + MC_FLA).value = tFlag(m.teamA);
      }
      sheet.getCell(r, startCol + MC_SEP).value   = '–';
      const imgIdB = flagImages.get(m.teamB);
      if (imgIdB !== undefined) {
        const addrB = sheet.getCell(r, startCol + MC_FLB).address;
        sheet.addImage(imgIdB, `${addrB}:${addrB}`);
      } else {
        sheet.getCell(r, startCol + MC_FLB).value = tFlag(m.teamB);
      }
      sheet.getCell(r, startCol + MC_AWAY).value  = tName(m.teamB);
      sheet.getCell(r, startCol + MC_AWAY).font   = { size: 9 };
      sheet.getCell(r, startCol + MC_AWAY).alignment = { horizontal: 'left', vertical: 'middle' };

      // Editable yellow score cells
      yellow(sheet, r, startCol + MC_SA);
      yellow(sheet, r, startCol + MC_SB);
      if (m.scoreA !== null) sheet.getCell(r, startCol + MC_SA).value = m.scoreA;
      if (m.scoreB !== null) sheet.getCell(r, startCol + MC_SB).value = m.scoreB;

      const saAddr = sheet.getCell(r, startCol + MC_SA).address;
      const sbAddr = sheet.getCell(r, startCol + MC_SB).address;

      matchCells.push({ matchId: m.matchId, sheetName, saAddr, sbAddr });

      const tA = teamMap.get(m.teamA);
      if (tA) { tA.localSA.push(saAddr); tA.localSB.push(sbAddr); }
      const tB = teamMap.get(m.teamB);
      if (tB) { tB.awaySB.push(sbAddr); tB.awaySA.push(saAddr); }
    });

    // ── Standings header (filled by fillStandingsFormulas later) ──────────────
    const sHdr = sheet.getCell(startRow + OFF_STND_HDR, startCol);
    sHdr.value = lbl('excel.standings', locale);
    sHdr.font  = { bold: true, size: 9, color: { argb: C.white } };
    sHdr.fill  = fill(GROUP_COLORS_HEX[groupIdx % 4]);
    sHdr.alignment = { horizontal: 'center' };
    sheet.mergeCells(startRow + OFF_STND_HDR, startCol, startRow + OFF_STND_HDR, startCol + BOX_COLS - 1);

    // Standing labels: team name spans cols 1-2 (merged), stats in 3-9 (DG omitted)
    const sLabels = [
      lbl('excel.colPos', locale),
      lbl('excel.colTeam', locale), // merged with next
      '',
      lbl('excel.colPlayed', locale),
      lbl('excel.colWon', locale),
      lbl('excel.colDrawn', locale),
      lbl('excel.colLost', locale),
      lbl('excel.colGF', locale),
      lbl('excel.colGC', locale),
      lbl('excel.colPts', locale),
    ];
    sLabels.forEach((v, i) => {
      const c = center(sheet, startRow + OFF_STND_LBLS, startCol + i);
      c.value = v;
      c.font  = { bold: true, size: 8 };
      c.fill  = fill(C.paper2);
      c.border = { bottom: THIN };
    });
    // Merge team label header across 2 cols
    sheet.mergeCells(startRow + OFF_STND_LBLS, startCol + 1, startRow + OFF_STND_LBLS, startCol + 2);
    sheet.getCell(startRow + OFF_STND_LBLS, startCol + 1).alignment = { horizontal: 'left', vertical: 'middle' };

    // ── Box outer border ──────────────────────────────────────────────────────
    const lastRow = startRow + BOX_HEIGHT - 1;
    const lastCol = startCol + BOX_COLS - 1;
    for (let c = startCol; c <= lastCol; c++) {
      addBorder(sheet, startRow, c, 'top', THICK);
      addBorder(sheet, lastRow,  c, 'bottom', THICK);
    }
    for (let r = startRow; r <= lastRow; r++) {
      addBorder(sheet, r, startCol, 'left', THICK);
      addBorder(sheet, r, lastCol,  'right', THICK);
    }

    const teams: TeamMatchInfo[] = groupTeams.map((t, i) => ({
      teamId:  t.id,
      name:    t.name,
      teamIdx: teamIdx.get(t.id) ?? i,
      ...teamMap.get(t.id)!,
    }));

    return { letter, groupIdx, startRow, startCol, teams, matchCells };
  }

  // ── CALC sheet (hidden) ───────────────────────────────────────────────────────

  private static createCalcSheet(
    wb: ExcelJS.Workbook,
    drawInfos: GroupDrawInfo[],
    groupsSheetName: string
  ): void {
    const sheet = wb.addWorksheet('CALC', { state: 'hidden' });
    const sr = shRef(groupsSheetName);

    // Header
    ['', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'PTS', 'KEY'].forEach((h, i) => {
      sheet.getCell(1, i + 1).value = h;
    });

    drawInfos.forEach(info => {
      const r1 = CALC_ROW_OFFSET + info.groupIdx * TEAM_COUNT;
      sheet.getCell(r1 - 1, 1).value = info.letter; // group label in col A

      info.teams.forEach((ti, teamOffset) => {
        const r = r1 + teamOffset;

        // Static team name (not formula — teams don't change)
        sheet.getCell(r, CC_TEAM).value = ti.name;

        const pjF  = formulaPJ(ti, sr);
        const gfF  = formulaGF(ti, sr);
        const gcF  = formulaGC(ti, sr);
        const { w: wF, d: dF, l: lF } = wdl(ti, sr);

        sheet.getCell(r, CC_PJ).value  = { formula: pjF };
        sheet.getCell(r, CC_G).value   = { formula: wF };
        sheet.getCell(r, CC_E).value   = { formula: dF };
        sheet.getCell(r, CC_P).value   = { formula: lF };
        sheet.getCell(r, CC_GF).value  = { formula: gfF };
        sheet.getCell(r, CC_GC).value  = { formula: gcF };

        const dgAddr  = sheet.getCell(r, CC_DG).address;
        const gfAddr  = sheet.getCell(r, CC_GF).address;
        const gcAddr  = sheet.getCell(r, CC_GC).address;
        const gAddr   = sheet.getCell(r, CC_G).address;
        const eAddr   = sheet.getCell(r, CC_E).address;
        const ptsAddr = sheet.getCell(r, CC_PTS).address;

        sheet.getCell(r, CC_DG).value  = { formula: `${gfAddr}-${gcAddr}` };
        sheet.getCell(r, CC_PTS).value = { formula: `${gAddr}*3+${eAddr}` };

        // KEY: PTS*1e5 + (DG+1000)*100 + GF*10 + tiebreak
        // tiebreak = (3 - teamIdx) ensures unique key; mirrors JS stable-sort order
        sheet.getCell(r, CC_KEY).value = {
          formula: `${ptsAddr}*100000+(${dgAddr}+1000)*100+${gfAddr}*10+${3 - ti.teamIdx}`,
        };
      });
    });

    sheet.protect('', { selectLockedCells: true, selectUnlockedCells: false });
  }

  // ── Fill standings formulas in groups sheet (INDEX/MATCH/LARGE → CALC) ───────

  private static fillStandingsFormulas(
    wb: ExcelJS.Workbook,
    drawInfos: GroupDrawInfo[],
    groupsSheetName: string
  ): void {
    const sheet = wb.getWorksheet(groupsSheetName);
    if (!sheet) return;

    drawInfos.forEach(info => {
      const r1 = CALC_ROW_OFFSET + info.groupIdx * TEAM_COUNT;
      const r4 = r1 + TEAM_COUNT - 1;
      const { startRow, startCol } = info;

      for (let pos = 1; pos <= TEAM_COUNT; pos++) {
        const r = startRow + OFF_STND_0 + (pos - 1);

        const isQualify = pos <= 2;
        const rowFill = fill(isQualify ? C.qualify : C.paper2);

        // Background for every cell in this standing row
        for (let ci = 0; ci < BOX_COLS; ci++) {
          sheet.getCell(r, startCol + ci).fill = rowFill;
        }

        const posCell = sheet.getCell(r, startCol + 0);
        posCell.value = pos;
        posCell.alignment = { horizontal: 'center' };
        posCell.font = isQualify
          ? { bold: true, size: 9, color: { argb: C.red } }
          : { size: 9, color: { argb: C.dim } };
        if (isQualify) {
          posCell.border = { left: { style: 'medium', color: { argb: C.red } } };
        }

        // Team name: merged across cols 1-2 for wider display
        const teamCell = sheet.getCell(r, startCol + 1);
        teamCell.value = { formula: standingF(CC_TEAM, r1, r4, pos) };
        teamCell.alignment = { horizontal: 'left', vertical: 'middle' };
        teamCell.fill = rowFill;
        teamCell.font = { size: 9 };
        sheet.mergeCells(r, startCol + 1, r, startCol + 2);

        // Stats in cols 3-9 (DG omitted to free up the merged team slot)
        const cols: [number, number][] = [
          [3, CC_PJ], [4, CC_G], [5, CC_E], [6, CC_P],
          [7, CC_GF], [8, CC_GC], [9, CC_PTS],
        ];
        cols.forEach(([offset, calcCol]) => {
          const cell = sheet.getCell(r, startCol + offset);
          cell.value = { formula: standingF(calcCol, r1, r4, pos) };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = rowFill;
          if (offset === 9) {
            cell.font = isQualify
              ? { bold: true, size: 11, color: { argb: C.red } }
              : { bold: true, size: 10 };
          } else {
            cell.font = { size: 9 };
          }
        });

      }
    });
  }

  // ── Knockout sheet ────────────────────────────────────────────────────────────

  private static createKnockoutSheet(
    wb: ExcelJS.Workbook,
    matches: Record<string, KnockoutMatchResult>,
    locale: Locale,
    sheetName: string,
    flagImages: Map<string, number>
  ): KnockoutCell[] {
    const sheet = wb.addWorksheet(sheetName, {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 2, showGridLines: false }],
      properties: { defaultRowHeight: 18 },
    });

    const koCells: KnockoutCell[] = [];
    // Tracks cell addresses for each processed match, used to build dynamic team formulas
    const matchRefs = new Map<string, KoMatchRef>();

    // Flat lookup: matchId → { prevMatchA, prevMatchB }
    const allBracketSlots: Array<{ id: string; prevMatchA: string; prevMatchB: string }> = [
      ...KNOCKOUT_BRACKET.roundOf32,
      ...KNOCKOUT_BRACKET.roundOf16,
      ...KNOCKOUT_BRACKET.quarterfinals,
      ...KNOCKOUT_BRACKET.semifinals,
      KNOCKOUT_BRACKET.thirdPlace,
      KNOCKOUT_BRACKET.final,
    ];
    const bracketSlots = new Map(allBracketSlots.map(s => [s.id, s]));

    const ROUNDS: { id: string; label: TranslationKey; ids: string[] }[] = [
      { id: 'roundOf32',     label: 'card.r32',        ids: Array.from({ length: 16 }, (_, i) => `R32-${String(i + 1).padStart(2, '0')}`) },
      { id: 'roundOf16',     label: 'card.r16',        ids: Array.from({ length: 8 },  (_, i) => `R16-${String(i + 1).padStart(2, '0')}`) },
      { id: 'quarterfinals', label: 'card.qf',         ids: Array.from({ length: 4 },  (_, i) => `QF-${String(i + 1).padStart(2, '0')}`) },
      { id: 'semifinals',    label: 'card.sf',         ids: ['SF-01', 'SF-02'] },
      { id: 'thirdPlace',    label: 'card.thirdPlace', ids: ['TP-01'] },
      { id: 'final',         label: 'card.final',      ids: ['FIN-01'] },
    ];

    // Column widths
    const KO_WIDTHS = [2, 7, 10, 12, 18, 5, 6, 3, 6, 5, 18, 8];
    KO_WIDTHS.forEach((w, i) => { sheet.getColumn(i + 1).width = w; });

    // Main title
    const title = sheet.getCell(1, 2);
    title.value = lbl('section.knockout.title', locale);
    title.font  = { bold: true, size: 16, color: { argb: C.ink } };
    sheet.mergeCells(1, 2, 1, 12);

    // Column labels row (reused for each round)
    const KO_LABELS = [
      lbl('excel.colId', locale), lbl('excel.colDate', locale), lbl('excel.colVenue', locale),
      lbl('excel.colHome', locale), '', lbl('excel.colGF', locale), '-',
      lbl('excel.colGC', locale), '', lbl('excel.colAway', locale), lbl('excel.colPen', locale),
    ];

    let curRow = 3;

    ROUNDS.forEach(round => {
      // Round header
      const hdr = sheet.getCell(curRow, 2);
      hdr.value = lbl(round.label, locale);
      hdr.font  = { bold: true, size: 11, color: { argb: C.white } };
      hdr.fill  = fill(C.orange);
      hdr.alignment = { horizontal: 'center' };
      sheet.mergeCells(curRow, 2, curRow, 12);
      curRow++;

      // Column labels
      KO_LABELS.forEach((v, i) => {
        const c = sheet.getCell(curRow, 2 + i);
        c.value = v;
        c.font  = { bold: true, size: 8 };
        c.fill  = fill(C.paper2);
        c.alignment = { horizontal: 'center' };
        c.border = { bottom: THIN };
      });
      curRow++;

      round.ids.forEach(id => {
        const m = matches[id];
        const r = curRow;
        const bg = fill(r % 2 === 0 ? C.paper3 : 'F0EADA');

        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(c => {
          sheet.getCell(r, c).fill = bg;
          sheet.getCell(r, c).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        sheet.getCell(r, 2).value = id;
        sheet.getCell(r, 2).font  = { size: 7, color: { argb: C.dim } };
        sheet.getCell(r, 3).value = fmtDate(m?.date);
        sheet.getCell(r, 3).font  = { size: 8 };
        sheet.getCell(r, 4).value = m?.venue ?? '';
        sheet.getCell(r, 4).font  = { size: 8 };

        // ── Team A (col 5) and Team B (col 11) — dynamic formulas when possible ──
        const slots = bracketSlots.get(id);
        const tACell = sheet.getCell(r, 5);
        tACell.font      = { size: 9 };
        tACell.alignment = { horizontal: 'right', vertical: 'middle' };
        const tBCell = sheet.getCell(r, 11);
        tBCell.font      = { size: 9 };
        tBCell.alignment = { horizontal: 'left', vertical: 'middle' };

        if (slots) {
          if (id === 'TP-01') {
            // Third-place match: losers of both semi-finals
            const refA = matchRefs.get(slots.prevMatchA);
            const refB = matchRefs.get(slots.prevMatchB);
            tACell.value = refA ? { formula: loserFormula(refA) } : tName(m?.teamA);
            tBCell.value = refB ? { formula: loserFormula(refB) } : tName(m?.teamB);
          } else if (round.id === 'roundOf32') {
            // R32: group 1st/2nd place are formulas; 3rd-place slots stay static
            const fA = slotToTeamFormula(slots.prevMatchA);
            const fB = slotToTeamFormula(slots.prevMatchB);
            tACell.value = fA ? { formula: fA } : tName(m?.teamA);
            tBCell.value = fB ? { formula: fB } : tName(m?.teamB);
          } else {
            // R16, QF, SF, Final: winner of previous match
            const refA = matchRefs.get(slots.prevMatchA);
            const refB = matchRefs.get(slots.prevMatchB);
            tACell.value = refA ? { formula: winnerFormula(refA) } : tName(m?.teamA);
            tBCell.value = refB ? { formula: winnerFormula(refB) } : tName(m?.teamB);
          }
        } else {
          tACell.value = tName(m?.teamA);
          tBCell.value = tName(m?.teamB);
        }

        const koImgA = m?.teamA ? flagImages.get(m.teamA) : undefined;
        if (koImgA !== undefined) {
          const koAddrA = sheet.getCell(r, 6).address;
          sheet.addImage(koImgA, `${koAddrA}:${koAddrA}`);
        } else if (m?.teamA) {
          sheet.getCell(r, 6).value = tFlag(m.teamA);
        }
        yellow(sheet, r, 7);
        sheet.getCell(r, 8).value  = '–';
        yellow(sheet, r, 9);
        const koImgB = m?.teamB ? flagImages.get(m.teamB) : undefined;
        if (koImgB !== undefined) {
          const koAddrB = sheet.getCell(r, 10).address;
          sheet.addImage(koImgB, `${koAddrB}:${koAddrB}`);
        } else if (m?.teamB) {
          sheet.getCell(r, 10).value = tFlag(m.teamB);
        }

        if (m?.scoreA !== null && m?.scoreA !== undefined) sheet.getCell(r, 7).value = m.scoreA;
        if (m?.scoreB !== null && m?.scoreB !== undefined) sheet.getCell(r, 9).value = m.scoreB;

        // Penalty cell (format "a-b")
        yellow(sheet, r, 12);
        const penStr = (m?.penaltyScoreA !== null && m?.penaltyScoreA !== undefined &&
                        m?.penaltyScoreB !== null && m?.penaltyScoreB !== undefined)
          ? `${m.penaltyScoreA}-${m.penaltyScoreB}`
          : '';
        if (penStr) sheet.getCell(r, 12).value = penStr;

        const saAddr  = sheet.getCell(r, 7).address;
        const sbAddr  = sheet.getCell(r, 9).address;
        const penAddr = sheet.getCell(r, 12).address;

        koCells.push({ matchId: id, sheetName, saAddr, sbAddr, penAddr });
        matchRefs.set(id, {
          teamAAddr: sheet.getCell(r, 5).address,
          teamBAddr: sheet.getCell(r, 11).address,
          saAddr,
          sbAddr,
          penAddr,
        });

        curRow++;
      });

      curRow += 2;
    });

    return koCells;
  }

  // ── MAP sheet (hidden) — single source of truth for import ───────────────────

  private static createMapSheet(
    wb: ExcelJS.Workbook,
    matchCells: MatchCell[],
    koCells: KnockoutCell[]
  ): void {
    const sheet = wb.addWorksheet('MAP', { state: 'hidden' });
    ['Match ID', 'Sheet', 'Score A', 'Score B', 'Penalties'].forEach((h, i) => {
      sheet.getCell(1, i + 1).value = h;
    });
    let r = 2;
    matchCells.forEach(mc => {
      sheet.getCell(r, 1).value = mc.matchId;
      sheet.getCell(r, 2).value = mc.sheetName;
      sheet.getCell(r, 3).value = mc.saAddr;
      sheet.getCell(r, 4).value = mc.sbAddr;
      r++;
    });
    koCells.forEach(kc => {
      sheet.getCell(r, 1).value = kc.matchId;
      sheet.getCell(r, 2).value = kc.sheetName;
      sheet.getCell(r, 3).value = kc.saAddr;
      sheet.getCell(r, 4).value = kc.sbAddr;
      sheet.getCell(r, 5).value = kc.penAddr;
      r++;
    });

    sheet.protect('', { selectLockedCells: true, selectUnlockedCells: false });
  }

  // ── Import ────────────────────────────────────────────────────────────────────

  static async importFromExcel(file: File): Promise<ImportResult> {
    return this.importFromBuffer(await file.arrayBuffer());
  }

  static async importFromBuffer(buffer: ArrayBuffer): Promise<ImportResult> {
    let wb: ExcelJS.Workbook;
    try {
      wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
    } catch {
      throw new ExcelImportError('parse_error', 'Could not parse the file as a valid Excel workbook.');
    }

    const mapSheet = wb.getWorksheet('MAP');
    if (!mapSheet) {
      throw new ExcelImportError('no_map_sheet', 'Missing MAP sheet — file is not a valid template.');
    }

    const groupScores:    ImportResult['groupScores']    = [];
    const knockoutScores: ImportResult['knockoutScores'] = [];

    mapSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const matchId  = row.getCell(1).value?.toString();
      const sName    = row.getCell(2).value?.toString();
      const saAddr   = row.getCell(3).value?.toString();
      const sbAddr   = row.getCell(4).value?.toString();
      const penAddr  = row.getCell(5).value?.toString();

      if (!matchId || !sName || !saAddr || !sbAddr) return;

      const ws = wb.getWorksheet(sName);
      if (!ws) return;

      const rawA = ws.getCell(saAddr).value;
      const rawB = ws.getCell(sbAddr).value;
      const scoreA = this.parseScore(rawA);
      const scoreB = this.parseScore(rawB);

      const isKO = /^(R32|R16|QF|SF|TP|FIN)-/.test(matchId);
      if (isKO) {
        const [penA, penB] = penAddr ? this.parsePenalties(ws.getCell(penAddr).value) : [null, null];
        knockoutScores.push({ matchId, scoreA, scoreB, penaltyScoreA: penA, penaltyScoreB: penB });
      } else {
        groupScores.push({ matchId, scoreA, scoreB });
      }
    });

    if (groupScores.length === 0 && knockoutScores.length === 0) {
      throw new ExcelImportError('no_valid_rows', 'No valid match rows found in the MAP sheet.');
    }

    return { groupScores, knockoutScores };
  }

  private static parseScore(val: ExcelJS.CellValue): number | null {
    if (val === null || val === undefined || val === '') return null;
    // ExcelJS may return a formula object with a result field
    const raw = (val as { result?: unknown }).result !== undefined
      ? (val as { result: unknown }).result
      : val;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    const rounded = Math.round(n);
    return rounded >= 0 ? rounded : null;
  }

  private static parsePenalties(val: ExcelJS.CellValue): [number | null, number | null] {
    const str = (val?.toString() ?? '').trim();
    const dashIdx = str.indexOf('-');
    if (dashIdx === -1) return [null, null];
    const a = parseInt(str.slice(0, dashIdx).trim(), 10);
    const b = parseInt(str.slice(dashIdx + 1).trim(), 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return [null, null];
    return [a, b];
  }

  private static createRulesExplanationSheet(wb: ExcelJS.Workbook, locale: Locale) {
    const sheetName = locale === 'en' ? 'Scoring Rules' : 'Reglas de Puntuación';
    const sheet = wb.addWorksheet(sheetName, {
      views: [{ showGridLines: false }],
    });

    const THIN_BORDER = { top: THIN, left: THIN, bottom: THIN, right: THIN };

    // Column widths
    sheet.getColumn(1).width = 25; // Categoría
    sheet.getColumn(2).width = 25; // Concepto
    sheet.getColumn(3).width = 15; // Puntos
    sheet.getColumn(4).width = 60; // Descripción

    // Título Principal
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = locale === 'en' ? '★ SYSTEM OF POINTS AND RULES ★' : '★ SISTEMA DE PUNTOS Y REGLAS ★';
    titleCell.font = { bold: true, size: 14, color: { argb: C.white } };
    titleCell.fill = fill('1A1933');
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(1, 1, 1, 4);
    sheet.getRow(1).height = 30;

    const headers = [
      locale === 'en' ? 'Category / Phase' : 'Categoría / Fase',
      locale === 'en' ? 'Concept' : 'Concepto',
      locale === 'en' ? 'Points' : 'Puntos',
      locale === 'en' ? 'Description / Example' : 'Descripción / Ejemplo',
    ];
    headers.forEach((h, i) => {
      const cell = sheet.getCell(2, i + 1);
      cell.value = h;
      cell.font = { bold: true, size: 10, color: { argb: C.white } };
      cell.fill = fill('22418C');
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = THIN_BORDER;
    });
    sheet.getRow(2).height = 20;

    const rulesData = [
      // Fase de Grupos
      {
        cat: locale === 'en' ? 'Group Stage Matches' : 'Fase de Grupos (Marcador)',
        concept: locale === 'en' ? 'Exact Score' : 'Resultado Exacto',
        pts: `+${MUNDIAL_POINTS.groupExact}`,
        desc: locale === 'en' ? 'Predict the exact final score (e.g. Predict 2-1, Result 2-1).' : 'Aciertas el marcador final exacto (ej. Pronóstico 2-1, Resultado 2-1).',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Goal Difference' : 'Diferencia de Goles',
        pts: `+${MUNDIAL_POINTS.groupDiff}`,
        desc: locale === 'en' ? 'Predict correct winner and goal difference, but incorrect score (e.g. Predict 3-1, Result 2-0).' : 'Aciertas el ganador y la diferencia de goles exacta, pero no el marcador (ej. Pronóstico 3-1, Resultado 2-0).',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Correct Winner/Draw' : 'Signo / Ganador',
        pts: `+${MUNDIAL_POINTS.groupSign}`,
        desc: locale === 'en' ? 'Predict correct winner or draw, but incorrect difference (e.g. Predict 2-0, Result 5-1).' : 'Aciertas el ganador o empate, pero no la diferencia ni el marcador (ej. Pronóstico 2-0, Resultado 5-1).',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Miss / Failure' : 'Fallo / Sin Pronóstico',
        pts: '0',
        desc: locale === 'en' ? 'Incorrect winner or no prediction was filled.' : 'Ganador incorrecto o partido sin pronosticar.',
      },
      // Fase Eliminatoria
      {
        cat: locale === 'en' ? 'Knockout Stage (Progression)' : 'Eliminatorias (Progresión)',
        concept: locale === 'en' ? 'Round of 32 (1/16)' : 'Dieciseisavos (1/16)',
        pts: `+${MUNDIAL_POINTS.koRoundOf32} / equipo`,
        desc: locale === 'en' ? 'Points per correct team placed in the Round of 32.' : 'Puntos por cada equipo real que colocaste correctamente en la ronda de Dieciseisavos.',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Round of 16 (1/8)' : 'Octavos de Final (1/8)',
        pts: `+${MUNDIAL_POINTS.koRoundOf16} / equipo`,
        desc: locale === 'en' ? 'Points per correct team placed in the Round of 16.' : 'Puntos por cada equipo real que colocaste correctamente en la ronda de Octavos.',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Quarterfinals (1/4)' : 'Cuartos de Final (1/4)',
        pts: `+${MUNDIAL_POINTS.koQuarterfinals} / equipo`,
        desc: locale === 'en' ? 'Points per correct team placed in the Quarterfinals.' : 'Puntos por cada equipo real que colocaste correctamente en la ronda de Cuartos.',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Semifinals (1/2)' : 'Semifinales (1/2)',
        pts: `+${MUNDIAL_POINTS.koSemifinals} / equipo`,
        desc: locale === 'en' ? 'Points per correct team placed in the Semifinals.' : 'Puntos por cada equipo real que colocaste correctamente en la ronda de Semifinales.',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Final (Finalists)' : 'Final (Finalistas)',
        pts: `+${MUNDIAL_POINTS.koFinal} / equipo`,
        desc: locale === 'en' ? 'Points per correct team placed in the Grand Final.' : 'Puntos por cada equipo real que colocaste correctamente en la gran Final.',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'World Champion' : 'Campeón del Mundo',
        pts: `+${MUNDIAL_POINTS.koWinner}`,
        desc: locale === 'en' ? 'Points for guessing the exact champion team of the 2026 World Cup.' : 'Puntos adicionales por acertar la selección campeona absoluta del torneo.',
      },
      // Premios Individuales
      {
        cat: locale === 'en' ? 'Individual Awards' : 'Premios Individuales',
        concept: locale === 'en' ? 'Tournament Top Scorer' : 'Máximo Goleador',
        pts: `+${MUNDIAL_POINTS.topScorer}`,
        desc: locale === 'en' ? 'Points for guessing the official Pichichi (Top Scorer) of the World Cup.' : 'Puntos por acertar el goleador oficial del torneo (Pichichi).',
      },
      {
        cat: '',
        concept: locale === 'en' ? 'Tournament MVP' : 'MVP del Campeonato',
        pts: `+${MUNDIAL_POINTS.mvp}`,
        desc: locale === 'en' ? 'Points for guessing the official Best Player (Golden Ball / MVP) of the World Cup.' : 'Puntos por acertar el mejor jugador (MVP) oficial del torneo.',
      },
    ];

    let currentCat = '';
    let startCatRow = 3;

    rulesData.forEach((row, idx) => {
      const r = 3 + idx;
      sheet.getRow(r).height = 20;

      const isEvenRow = idx % 2 === 0;
      const rowBg = isEvenRow ? 'FFF9EC' : 'E6D6B1';

      // Concept, Points, Desc
      const cells = [
        sheet.getCell(r, 2),
        sheet.getCell(r, 3),
        sheet.getCell(r, 4)
      ];

      cells[0].value = row.concept;
      cells[0].font = { bold: true, size: 9 };
      cells[1].value = row.pts;
      cells[1].font = { bold: true, size: 10, color: { argb: 'C41E2C' } };
      cells[1].alignment = { horizontal: 'center', vertical: 'middle' };
      cells[2].value = row.desc;
      cells[2].font = { size: 9 };
      cells[2].alignment = { horizontal: 'left', vertical: 'middle' };

      for (let i = 2; i <= 4; i++) {
        sheet.getCell(r, i).fill = fill(rowBg);
        sheet.getCell(r, i).border = THIN_BORDER;
      }

      // Category merging
      if (row.cat) {
        if (currentCat) {
          sheet.mergeCells(startCatRow, 1, r - 1, 1);
        }
        currentCat = row.cat;
        startCatRow = r;
        const catCell = sheet.getCell(r, 1);
        catCell.value = currentCat;
        catCell.font = { bold: true, size: 10, color: { argb: C.white } };
        catCell.fill = fill('1A1933');
        catCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }

      const catCell = sheet.getCell(r, 1);
      catCell.border = THIN_BORDER;
    });

    sheet.mergeCells(startCatRow, 1, 3 + rulesData.length - 1, 1);

    const footR = 4 + rulesData.length;
    const footCell = sheet.getCell(footR, 1);
    footCell.value = locale === 'en'
      ? '★ Knockout scores are calculated dynamically based on real progression, not rigid match IDs.'
      : '★ La puntuación de eliminatorias se calcula dinámicamente según la progresión real de los equipos, no por IDs fijos de partido.';
    footCell.font = { italic: true, size: 9, color: { argb: C.dim } };
    sheet.mergeCells(footR, 1, footR, 4);
  }
}
