import ExcelJS from 'exceljs';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';
import type { Locale } from '../i18n/index';
import type { TranslationKey } from '../i18n/es';
import { es } from '../i18n/es';
import { en } from '../i18n/en';
import { TEAMS_2026 } from '../data/fifa-2026';

// ─── Theme ────────────────────────────────────────────────────────────────────

const C = {
  paper2: 'E6D6B1',
  ink:    '1A1933',
  yellow: 'F0B021',
  orange: 'E8541F',
  white:  'FFFFFF',
  dim:    '7A6F54',
} as const;

const THICK: ExcelJS.Border = { style: 'thick', color: { argb: C.ink } };
const THIN:  ExcelJS.Border = { style: 'thin',  color: { argb: C.ink } };

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

function fmtDate(date?: string): string {
  if (!date) return '';
  const p = date.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}` : date;
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

function fill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function center(sheet: ExcelJS.Worksheet, r: number, c: number): ExcelJS.Cell {
  const cell = sheet.getCell(r, c);
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  return cell;
}

function yellow(sheet: ExcelJS.Worksheet, r: number, c: number): void {
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

function addBorder(
  sheet: ExcelJS.Worksheet,
  r: number, c: number,
  side: 'top' | 'bottom' | 'left' | 'right',
  border: ExcelJS.Border
): void {
  const cell = sheet.getCell(r, c);
  cell.border = { ...cell.border, [side]: border };
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

    const groupsName   = lbl('excel.sheetGroups',  locale);
    const knockoutName = lbl('excel.sheetKnockout', locale);

    const drawInfos    = this.createGroupsSheet(wb, groupMatches, locale, groupsName);
    this.createCalcSheet(wb, drawInfos, groupsName);
    this.fillStandingsFormulas(wb, drawInfos, groupsName);
    const koCells      = this.createKnockoutSheet(wb, knockoutMatches, locale, knockoutName);
    this.createMapSheet(wb, drawInfos.flatMap(d => d.matchCells), koCells);

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
    sheetName: string
  ): GroupDrawInfo[] {
    const sheet = wb.addWorksheet(sheetName, {
      views: [{ showGridLines: false }],
      properties: { defaultRowHeight: 18 },
    });

    // Column widths — repeat the pattern for each of the 3 box positions
    const WIDTHS = [5, 7, 10, 16, 4, 6, 3, 6, 4, 16];
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
        this.drawGroupBox(sheet, letter, idx, groupMatches, startRow, startCol, locale, sheetName)
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
    sheetName: string
  ): GroupDrawInfo {
    // ── Header ────────────────────────────────────────────────────────────────
    const hdr = sheet.getCell(startRow + OFF_HEADER, startCol);
    hdr.value = lbl('groups.group', locale, { letter });
    hdr.font  = { bold: true, size: 13, color: { argb: C.white } };
    hdr.fill  = fill(C.ink);
    hdr.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(startRow + OFF_HEADER, startCol, startRow + OFF_HEADER, startCol + BOX_COLS - 1);

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
      const bgFill = fill(i % 2 === 0 ? 'FAFAF5' : 'F0EDE0');

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
      sheet.getCell(r, startCol + MC_FLA).value   = tFlag(m.teamA);
      sheet.getCell(r, startCol + MC_SEP).value   = '–';
      sheet.getCell(r, startCol + MC_FLB).value   = tFlag(m.teamB);
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
    sHdr.fill  = fill(C.dim);
    sHdr.alignment = { horizontal: 'center' };
    sheet.mergeCells(startRow + OFF_STND_HDR, startCol, startRow + OFF_STND_HDR, startCol + BOX_COLS - 1);

    const sLabels = [
      lbl('excel.colPos', locale),
      lbl('excel.colTeam', locale),
      lbl('excel.colPlayed', locale),
      lbl('excel.colWon', locale),
      lbl('excel.colDrawn', locale),
      lbl('excel.colLost', locale),
      lbl('excel.colGF', locale),
      lbl('excel.colGC', locale),
      lbl('excel.colGD', locale),
      lbl('excel.colPts', locale),
    ];
    sLabels.forEach((v, i) => {
      const c = center(sheet, startRow + OFF_STND_LBLS, startCol + i);
      c.value = v;
      c.font  = { bold: true, size: 8 };
      c.fill  = fill(C.paper2);
      c.border = { bottom: THIN };
    });

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

        sheet.getCell(r, startCol + 0).value = pos;
        sheet.getCell(r, startCol + 0).alignment = { horizontal: 'center' };
        sheet.getCell(r, startCol + 0).font = { size: 9, color: { argb: C.dim } };

        const cols: [number, number][] = [
          [1, CC_TEAM], [2, CC_PJ], [3, CC_G], [4, CC_E], [5, CC_P],
          [6, CC_GF],   [7, CC_GC], [8, CC_DG], [9, CC_PTS],
        ];
        cols.forEach(([offset, calcCol]) => {
          const cell = sheet.getCell(r, startCol + offset);
          cell.value = { formula: standingF(calcCol, r1, r4, pos) };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = offset === 9
            ? { bold: true, size: 10 }
            : { size: 9 };
        });

      }
    });
  }

  // ── Knockout sheet ────────────────────────────────────────────────────────────

  private static createKnockoutSheet(
    wb: ExcelJS.Workbook,
    matches: Record<string, KnockoutMatchResult>,
    locale: Locale,
    sheetName: string
  ): KnockoutCell[] {
    const sheet = wb.addWorksheet(sheetName, {
      views: [{ showGridLines: false }],
      properties: { defaultRowHeight: 18 },
    });

    const koCells: KnockoutCell[] = [];

    const ROUNDS: { id: string; label: TranslationKey; ids: string[] }[] = [
      { id: 'roundOf32',     label: 'card.r32',        ids: Array.from({ length: 16 }, (_, i) => `R32-${String(i + 1).padStart(2, '0')}`) },
      { id: 'roundOf16',    label: 'card.r16',        ids: Array.from({ length: 8 },  (_, i) => `R16-${String(i + 1).padStart(2, '0')}`) },
      { id: 'quarterfinals',label: 'card.qf',         ids: Array.from({ length: 4 },  (_, i) => `QF-${String(i + 1).padStart(2, '0')}`) },
      { id: 'semifinals',   label: 'card.sf',         ids: ['SF-01', 'SF-02'] },
      { id: 'thirdPlace',   label: 'card.thirdPlace', ids: ['TP-01'] },
      { id: 'final',        label: 'card.final',      ids: ['FIN-01'] },
    ];

    // Column widths
    const KO_WIDTHS = [2, 7, 10, 12, 18, 4, 6, 3, 6, 4, 18, 8];
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
        const bg = fill(r % 2 === 0 ? 'FAFAF5' : 'F0EDE0');

        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(c => {
          sheet.getCell(r, c).fill = bg;
          sheet.getCell(r, c).alignment = { horizontal: 'center', vertical: 'middle' };
        });

        sheet.getCell(r, 2).value  = id;
        sheet.getCell(r, 2).font   = { size: 7, color: { argb: C.dim } };
        sheet.getCell(r, 3).value  = fmtDate(m?.date);
        sheet.getCell(r, 3).font   = { size: 8 };
        sheet.getCell(r, 4).value  = m?.venue ?? '';
        sheet.getCell(r, 4).font   = { size: 8 };
        // col 5=Home, 6=FlagA, 7=ScoreA(yellow), 8=sep, 9=ScoreB(yellow), 10=FlagB, 11=Away, 12=Pen(yellow)
        sheet.getCell(r, 5).value = tName(m?.teamA);
        sheet.getCell(r, 5).font  = { size: 9 };
        sheet.getCell(r, 5).alignment = { horizontal: 'right', vertical: 'middle' };
        sheet.getCell(r, 6).value = tFlag(m?.teamA);
        yellow(sheet, r, 7);
        sheet.getCell(r, 8).value = '–';
        yellow(sheet, r, 9);
        sheet.getCell(r, 10).value = tFlag(m?.teamB);
        sheet.getCell(r, 11).value = tName(m?.teamB);
        sheet.getCell(r, 11).font  = { size: 9 };
        sheet.getCell(r, 11).alignment = { horizontal: 'left', vertical: 'middle' };

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
  }

  // ── Import ────────────────────────────────────────────────────────────────────

  static async importFromExcel(file: File): Promise<ImportResult> {
    return this.importFromBuffer(await file.arrayBuffer());
  }

  static async importFromBuffer(buffer: ArrayBuffer): Promise<ImportResult> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const mapSheet = wb.getWorksheet('MAP');
    if (!mapSheet) throw new Error('Formato de Excel no válido: falta la hoja MAP.');

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

      const scoreA = this.parseScore(ws.getCell(saAddr).value);
      const scoreB = this.parseScore(ws.getCell(sbAddr).value);

      const isKO = /^(R32|R16|QF|SF|TP|FIN)-/.test(matchId);
      if (isKO) {
        const [penA, penB] = penAddr ? this.parsePenalties(ws.getCell(penAddr).value) : [null, null];
        knockoutScores.push({ matchId, scoreA, scoreB, penaltyScoreA: penA, penaltyScoreB: penB });
      } else {
        groupScores.push({ matchId, scoreA, scoreB });
      }
    });

    return { groupScores, knockoutScores };
  }

  private static parseScore(val: ExcelJS.CellValue): number | null {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? Math.round(n) : null;
  }

  private static parsePenalties(val: ExcelJS.CellValue): [number | null, number | null] {
    const str = val?.toString() ?? '';
    const parts = str.split('-');
    if (parts.length !== 2) return [null, null];
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    return [isNaN(a) ? null : a, isNaN(b) ? null : b];
  }
}
