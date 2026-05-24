import ExcelJS from 'exceljs';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import type { Locale } from '../i18n';
import type { TranslationKey } from '../i18n/es';
import { es } from '../i18n/es';
import { en } from '../i18n/en';
import {
  fetchFlagPng,
  PANINI_COLORS,
  PANINI_GROUP_CYCLE,
  fill,
  center,
  yellow,
  addBorder,
  THICK,
  THIN,
} from './excel-service';

export type CalendarPhase = 'all' | 'groups' | 'knockout';

const C = PANINI_COLORS;
const GROUP_CYCLE = PANINI_GROUP_CYCLE;

/* ─── PDF RGB palette (mirrors Excel hex) ─── */
const PDF_RGB = {
  paper2: [230, 214, 177] as [number, number, number],
  paper3: [255, 249, 236] as [number, number, number],
  ink:    [26, 25, 51] as [number, number, number],
  yellow: [240, 176, 33] as [number, number, number],
  orange: [232, 84, 31] as [number, number, number],
  blue:   [34, 65, 140] as [number, number, number],
  red:    [196, 30, 44] as [number, number, number],
  green:  [31, 107, 58] as [number, number, number],
  white:  [255, 255, 255] as [number, number, number],
  dim:    [122, 111, 84] as [number, number, number],
};

function pdfColor(hex: string): [number, number, number] {
  switch (hex) {
    case 'E8541F': return PDF_RGB.orange;
    case '22418C': return PDF_RGB.blue;
    case '1F6B3A': return PDF_RGB.green;
    case 'C41E2C': return PDF_RGB.red;
    case 'F0B021': return PDF_RGB.yellow;
    case '1A1933': return PDF_RGB.ink;
    case 'E6D6B1': return PDF_RGB.paper2;
    case 'FFF9EC': return PDF_RGB.paper3;
    default:       return PDF_RGB.white;
  }
}

/* ─── i18n helper ─── */

function lbl(key: TranslationKey, locale: Locale, params?: Record<string, string>): string {
  const dict = locale === 'en' ? en : es;
  let str = (dict[key] ?? (es[key] as string)) as string;
  if (params) {
    for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

function tName(id: string | null): string {
  if (!id) return '?';
  return TEAMS_2026.find(t => t.id === id)?.name ?? id;
}

function tFlag(id: string | null): string {
  if (!id) return '';
  return TEAMS_2026.find(t => t.id === id)?.flag ?? '';
}

export function formatDayHeader(dateIso: string, locale: Locale): string {
  const d = new Date(dateIso + 'T00:00:00');
  const months =
    locale === 'en'
      ? ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      : ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const days =
    locale === 'en'
      ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
      : ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const day = days[d.getDay()];
  const month = months[d.getMonth()];
  if (locale === 'en') return `${day} · ${month} ${d.getDate()}`;
  return `${day} · ${d.getDate()} ${month}`;
}

/* ─── Phase helpers ─── */

function knockoutPhaseKey(matchId: string): string {
  return matchId.split('-')[0];
}

function localizedKnockoutPhase(matchId: string, locale: Locale): string {
  const prefix = knockoutPhaseKey(matchId);
  const map: Record<string, TranslationKey> = {
    R32: 'calendar.r32', R16: 'calendar.r16', QF: 'calendar.qf',
    SF: 'calendar.sf', TP: 'calendar.tp', FIN: 'calendar.final',
  };
  return lbl(map[prefix] ?? 'calendar.final', locale);
}

/* ─── Row builder ─── */

export interface CalendarRow {
  matchId: string;
  date: string;
  timeSpain: string;
  teamA: string | null;
  teamB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  matchDayLabel: string;
  venue: string;
  city: string;
}

export interface DayBox {
  dateIso: string;
  rows: CalendarRow[];
  boxColorIdx: number;
}

export function getRows(phase: CalendarPhase, locale: Locale): CalendarRow[] {
  const rows: CalendarRow[] = [];

  if (phase === 'all' || phase === 'groups') {
    for (const m of GROUP_MATCHES) {
      const stadium = STADIUMS.find(s => s.id === m.venueId);
      rows.push({
        matchId: m.matchId,
        date: m.date,
        timeSpain: m.timeSpain,
        teamA: m.teamA,
        teamB: m.teamB,
        scoreA: null,
        scoreB: null,
        matchDayLabel: locale === 'en' ? `MD${m.matchDay}` : `J${m.matchDay}`,
        venue: stadium?.name ?? m.venueId,
        city: stadium?.city ?? '',
      });
    }
  }

  if (phase === 'all' || phase === 'knockout') {
    for (const [matchId, m] of Object.entries(KNOCKOUT_SCHEDULE)) {
      rows.push({
        matchId,
        date: m.date,
        timeSpain: m.timeSpain,
        teamA: null,
        teamB: null,
        scoreA: null,
        scoreB: null,
        matchDayLabel: localizedKnockoutPhase(matchId, locale),
        venue: m.venue,
        city: m.city,
      });
    }
  }

  rows.sort((a, b) => {
    const ak = `${a.date}T${a.timeSpain}`;
    const bk = `${b.date}T${b.timeSpain}`;
    return ak.localeCompare(bk);
  });

  return rows;
}

export function groupRowsByDate(rows: CalendarRow[]): DayBox[] {
  const map = new Map<string, CalendarRow[]>();
  for (const r of rows) {
    const g = map.get(r.date);
    if (g) g.push(r);
    else map.set(r.date, [r]);
  }
  return Array.from(map.entries()).map(([dateIso, dayRows], i) => ({
    dateIso,
    rows: dayRows,
    boxColorIdx: i % 4,
  }));
}

export function fileNameBase(phase: CalendarPhase, locale: Locale): string {
  const suffix =
    phase === 'all' ? 'completo'
    : phase === 'groups' ? 'grupos'
    : 'eliminatorias';
  const prefix = locale === 'en' ? 'schedule' : 'calendario';
  return `bracketmundial-${prefix}-${suffix}-2026`;
}

/* ─── Excel box layout constants ─── */

const BOXES_PER_ROW = 3;
const BOX_COLS = 10;
const BOX_GAP = 1;
const BOX_STEP = BOX_COLS + BOX_GAP;

const MC_ID   = 0;
const MC_MD   = 1;
const MC_TIME = 2;
const MC_HOME = 3;
const MC_FLA  = 4;
const MC_SA   = 5;
const MC_SEP  = 6;
const MC_SB   = 7;
const MC_FLB  = 8;
const MC_AWAY = 9;

function dayBoxHeight(nMatches: number, nVenues: number): number {
  return 2 + nMatches + 1 + nVenues; // header + labels + matches + SEDES header + venues
}

/* ─── Excel export ─── */

export async function exportCalendarExcel(phase: CalendarPhase, locale: Locale): Promise<Blob> {
  const rows = getRows(phase, locale);
  const boxes = groupRowsByDate(rows);

  const allTeamIds = new Set<string>();
  for (const r of rows) {
    if (r.teamA) allTeamIds.add(r.teamA);
    if (r.teamB) allTeamIds.add(r.teamB);
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Bracket Mundial 2026';
  wb.created = new Date();
  wb.modified = new Date();

  const flagImages = new Map<string, number>();
  await Promise.all(Array.from(allTeamIds).map(async id => {
    const team = TEAMS_2026.find(t => t.id === id);
    if (!team?.flagUrl) return;
    const png = await fetchFlagPng(team.flagUrl);
    if (png == null) return;
    flagImages.set(id, wb.addImage({ base64: png, extension: 'png' }));
  }));

  const sheetName = phase === 'all'
    ? lbl('tabs.calendar', locale)
    : phase === 'groups'
      ? lbl('section.groups.eyebrow', locale)
      : lbl('section.knockout.eyebrow', locale);

  const ws = wb.addWorksheet(sheetName, {
    views: [{ showGridLines: false }],
    properties: { defaultRowHeight: 18 },
  });

  // Column widths — repeat for 3 boxes
  const WIDTHS = [6, 7, 8, 18, 5, 6, 3, 6, 5, 18];
  for (let box = 0; box < BOXES_PER_ROW; box++) {
    const sc = 2 + box * BOX_STEP;
    WIDTHS.forEach((w, i) => { ws.getColumn(sc + i).width = w; });
  }
  ws.getColumn(2 + BOX_STEP - 1).width = 2;
  ws.getColumn(2 + 2 * BOX_STEP - 1).width = 2;

  // Group boxes into rows of 3
  const boxRows: DayBox[][] = [];
  for (let i = 0; i < boxes.length; i += BOXES_PER_ROW) {
    boxRows.push(boxes.slice(i, i + BOXES_PER_ROW));
  }

  let currentStartRow = 1;

  // ── Title row ──
  const NCOLS_TOTAL = 2 + BOXES_PER_ROW * BOX_STEP - BOX_GAP;
  const titleText = locale === 'en' ? 'SCHEDULE · WORLD CUP 2026' : 'CALENDARIO · MUNDIAL 2026';
  const titleRow = ws.getRow(currentStartRow);
  ws.mergeCells(currentStartRow, 2, currentStartRow, NCOLS_TOTAL);
  const titleCell = ws.getCell(currentStartRow, 2);
  titleCell.value = titleText;
  titleCell.fill = fill(C.orange);
  titleCell.font = { bold: true, color: { argb: C.white }, size: 22, name: 'Arial Black' };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = { top: THICK, bottom: THICK, left: THICK, right: THICK };
  titleRow.height = 40;
  currentStartRow++;

  // ── Subtitle row ──
  const subtitleKey: TranslationKey =
    phase === 'all' ? 'calendar.exportSubtitleAll'
    : phase === 'groups' ? 'calendar.exportSubtitleGroups'
    : 'calendar.exportSubtitleKnockout';
  const subtitleText = lbl(subtitleKey, locale, { count: String(rows.length) });
  const subRow = ws.getRow(currentStartRow);
  ws.mergeCells(currentStartRow, 2, currentStartRow, NCOLS_TOTAL);
  const subCell = ws.getCell(currentStartRow, 2);
  subCell.value = subtitleText;
  subCell.fill = fill(C.paper3);
  subCell.font = { color: { argb: C.dim }, size: 11, name: 'Arial', italic: true };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subCell.border = { top: THIN, bottom: THIN, left: THICK, right: THICK };
  subRow.height = 22;
  currentStartRow += 2;

  for (const boxRow of boxRows) {
    const maxH = Math.max(...boxRow.map(b => dayBoxHeight(b.rows.length, uniqueVenues(b.rows).length)));
    const rowStart = currentStartRow;

    for (let bi = 0; bi < boxRow.length; bi++) {
      const box = boxRow[bi];
      const startCol = 2 + bi * BOX_STEP;
      drawDayBoxExcel(ws, box, rowStart, startCol, locale, flagImages, maxH);
    }

    currentStartRow += maxH + 2;
  }

  ws.views = [{ state: 'frozen', ySplit: 3 }];

  ws.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function uniqueVenues(rows: CalendarRow[]): { venue: string; city: string }[] {
  const seen = new Set<string>();
  const result: { venue: string; city: string }[] = [];
  for (const r of rows) {
    const key = `${r.venue}|${r.city}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ venue: r.venue, city: r.city });
    }
  }
  return result;
}

function drawDayBoxExcel(
  ws: ExcelJS.Worksheet,
  box: DayBox,
  startRow: number,
  startCol: number,
  locale: Locale,
  flagImages: Map<string, number>,
  boxH: number,
): void {
  const { dateIso, rows, boxColorIdx } = box;
  const hdrColor = GROUP_CYCLE[boxColorIdx % 4];
  const venues = uniqueVenues(rows);
  const nMatches = rows.length;

  // ── Header ──
  const hdr = ws.getCell(startRow, startCol);
  hdr.value = formatDayHeader(dateIso, locale);
  hdr.font = { bold: true, size: 13, color: { argb: C.white } };
  hdr.fill = fill(hdrColor);
  hdr.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.mergeCells(startRow, startCol, startRow, startCol + BOX_COLS - 4);

  const bdg = ws.getCell(startRow, startCol + BOX_COLS - 3);
  bdg.value = `${nMatches}/${nMatches}`;
  bdg.font = { bold: true, size: 8, color: { argb: C.ink } };
  bdg.fill = fill(C.paper2);
  bdg.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.mergeCells(startRow, startCol + BOX_COLS - 3, startRow, startCol + BOX_COLS - 1);

  // ── Match column labels ──
  const matchLabelsRow = startRow + 1;
  const mLabels = [
    lbl('excel.colId', locale),
    lbl('excel.colMatchday', locale),
    lbl('calendar.colTime', locale),
    lbl('excel.colHome', locale),
    '',
    lbl('excel.colGF', locale),
    '-',
    lbl('excel.colGC', locale),
    '',
    lbl('excel.colAway', locale),
  ];
  mLabels.forEach((v, i) => {
    const c = center(ws, matchLabelsRow, startCol + i);
    c.value = v;
    c.font = { bold: true, size: 8, color: { argb: C.ink } };
    c.fill = fill(C.paper2);
    c.border = { bottom: THIN };
  });

  // ── Match rows ──
  for (let mi = 0; mi < nMatches; mi++) {
    const r = startRow + 2 + mi;
    const m = rows[mi];
    const bg = fill(mi % 2 === 0 ? C.paper3 : 'F0EADA');

    for (let ci = 0; ci < BOX_COLS; ci++) {
      const cell = ws.getCell(r, startCol + ci);
      cell.fill = bg;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    ws.getCell(r, startCol + MC_ID).value = m.matchId;
    ws.getCell(r, startCol + MC_ID).font = { size: 7, color: { argb: C.dim } };
    ws.getCell(r, startCol + MC_MD).value = m.matchDayLabel;
    ws.getCell(r, startCol + MC_MD).font = { size: 8, color: { argb: C.dim } };
    ws.getCell(r, startCol + MC_TIME).value = m.timeSpain;
    ws.getCell(r, startCol + MC_TIME).font = { size: 8, name: 'Courier New' };

    ws.getCell(r, startCol + MC_HOME).value = m.teamA ? tName(m.teamA) : lbl('card.tbd', locale);
    ws.getCell(r, startCol + MC_HOME).font = { size: 9 };
    ws.getCell(r, startCol + MC_HOME).alignment = { horizontal: 'right', vertical: 'middle' };

    const imgIdA = m.teamA ? flagImages.get(m.teamA) : undefined;
    if (imgIdA !== undefined) {
      const addrA = ws.getCell(r, startCol + MC_FLA).address;
      ws.addImage(imgIdA, `${addrA}:${addrA}`);
    } else if (m.teamA) {
      ws.getCell(r, startCol + MC_FLA).value = tFlag(m.teamA);
    }

    yellow(ws, r, startCol + MC_SA);
    if (m.scoreA !== null && m.scoreA !== undefined) {
      ws.getCell(r, startCol + MC_SA).value = m.scoreA;
    }
    ws.getCell(r, startCol + MC_SEP).value = '–';
    yellow(ws, r, startCol + MC_SB);
    if (m.scoreB !== null && m.scoreB !== undefined) {
      ws.getCell(r, startCol + MC_SB).value = m.scoreB;
    }

    const imgIdB = m.teamB ? flagImages.get(m.teamB) : undefined;
    if (imgIdB !== undefined) {
      const addrB = ws.getCell(r, startCol + MC_FLB).address;
      ws.addImage(imgIdB, `${addrB}:${addrB}`);
    } else if (m.teamB) {
      ws.getCell(r, startCol + MC_FLB).value = tFlag(m.teamB);
    }

    ws.getCell(r, startCol + MC_AWAY).value = m.teamB ? tName(m.teamB) : lbl('card.tbd', locale);
    ws.getCell(r, startCol + MC_AWAY).font = { size: 9 };
    ws.getCell(r, startCol + MC_AWAY).alignment = { horizontal: 'left', vertical: 'middle' };
  }

  // ── SEDES sub-block ──
  const venuesHeaderRow = startRow + 2 + nMatches;
  const vHdr = ws.getCell(venuesHeaderRow, startCol);
  vHdr.value = locale === 'en' ? 'VENUES' : 'SEDES';
  vHdr.font = { bold: true, size: 9, color: { argb: C.white } };
  vHdr.fill = fill(hdrColor);
  vHdr.alignment = { horizontal: 'center' };
  ws.mergeCells(venuesHeaderRow, startCol, venuesHeaderRow, startCol + BOX_COLS - 1);

  for (let vi = 0; vi < venues.length; vi++) {
    const vr = venuesHeaderRow + 1 + vi;
    const v = venues[vi];
    const vCell = ws.getCell(vr, startCol);
    vCell.value = `${v.venue} · ${v.city}`;
    vCell.font = { size: 9, color: { argb: C.ink } };
    vCell.alignment = { horizontal: 'left', vertical: 'middle' };
    vCell.fill = fill(vi % 2 === 0 ? C.paper3 : C.paper2);
    ws.mergeCells(vr, startCol, vr, startCol + BOX_COLS - 1);
  }

  // Fill remaining rows with paper2 to reach boxH
  const lastContentRow = venuesHeaderRow + venues.length;
  const boxLastRow = startRow + boxH - 1;
  for (let r = lastContentRow + 1; r <= boxLastRow; r++) {
    for (let c = startCol; c <= startCol + BOX_COLS - 1; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = fill(C.paper2);
    }
  }

  // ── Box outer border ──
  const lastC = startCol + BOX_COLS - 1;
  for (let c = startCol; c <= lastC; c++) {
    addBorder(ws, startRow, c, 'top', THICK);
    addBorder(ws, boxLastRow, c, 'bottom', THICK);
  }
  for (let r = startRow; r <= boxLastRow; r++) {
    addBorder(ws, r, startCol, 'left', THICK);
    addBorder(ws, r, lastC, 'right', THICK);
  }
}

/* ─── PDF export ─── */

const PDF_MARGIN = 14;
const PDF_GAP = 3;
const PDF_PAGE_W = 297;
const PDF_PAGE_H = 210;

const PDF_COL_RATIOS = [5, 7, 8, 17, 5, 6, 3, 6, 5, 21];
const PDF_COL_TOTAL = PDF_COL_RATIOS.reduce((a, b) => a + b, 0);

const PDF_ROW_H = 7;
const PDF_HDR_H = 8;
const PDF_LBL_H = 6;
const PDF_VENUE_HDR_H = 6;
const PDF_VENUE_ROW_H = 5;
const PDF_BOX_PAD = 2;

function dayBoxPdfH(rows: CalendarRow[]): number {
  const nVenues = uniqueVenues(rows).length;
  return PDF_HDR_H + PDF_LBL_H + rows.length * PDF_ROW_H + PDF_VENUE_HDR_H + nVenues * PDF_VENUE_ROW_H + PDF_BOX_PAD;
}

export async function exportCalendarPdf(phase: CalendarPhase, locale: Locale): Promise<Blob> {
  const rows = getRows(phase, locale);
  const boxes = groupRowsByDate(rows);

  const allTeamIds = new Set<string>();
  for (const r of rows) {
    if (r.teamA) allTeamIds.add(r.teamA);
    if (r.teamB) allTeamIds.add(r.teamB);
  }
  const flagPngs = new Map<string, string>();
  await Promise.all(Array.from(allTeamIds).map(async id => {
    const team = TEAMS_2026.find(t => t.id === id);
    if (!team?.flagUrl) return;
    const png = await fetchFlagPng(team.flagUrl);
    if (png == null) return;
    flagPngs.set(id, `data:image/png;base64,${png}`);
  }));

  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const usableW = PDF_PAGE_W - 2 * PDF_MARGIN;
  const BOX_W = Math.floor((usableW - 2 * PDF_GAP) / 3);

  let curY = PDF_MARGIN;

  // ── Title block ──
  const titleX = PDF_MARGIN;
  const titleW = PDF_PAGE_W - 2 * PDF_MARGIN;
  const titleH = 20;

  // Shadow
  doc.setFillColor(...PDF_RGB.ink);
  doc.rect(titleX + 1, curY + 1, titleW, titleH, 'F');
  doc.setFillColor(...PDF_RGB.paper3);
  doc.rect(titleX, curY, titleW, titleH, 'F');
  doc.setDrawColor(...PDF_RGB.ink);
  doc.setLineWidth(0.5);
  doc.rect(titleX, curY, titleW, titleH, 'S');

  // Badge
  const badgeW = 22; const badgeH = 10;
  doc.setFillColor(...PDF_RGB.orange);
  doc.rect(titleX + 4, curY + 5, badgeW, badgeH, 'F');
  doc.setLineWidth(0.3);
  doc.rect(titleX + 4, curY + 5, badgeW, badgeH, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PDF_RGB.white);
  doc.text('BM \u2605', titleX + 4 + badgeW / 2, curY + 5 + badgeH / 2 + 2.5, { align: 'center' });

  // Title
  const titlePdfText = locale === 'en' ? 'SCHEDULE \u00b7 WORLD CUP 2026' : 'CALENDARIO \u00b7 MUNDIAL 2026';
  doc.setFontSize(18);
  doc.setTextColor(...PDF_RGB.ink);
  doc.text(titlePdfText, PDF_PAGE_W / 2, curY + 9, { align: 'center' });

  // Subtitle
  const subKey: TranslationKey =
    phase === 'all' ? 'calendar.exportSubtitleAll'
    : phase === 'groups' ? 'calendar.exportSubtitleGroups'
    : 'calendar.exportSubtitleKnockout';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_RGB.dim);
  doc.text(lbl(subKey, locale, { count: String(rows.length) }), PDF_PAGE_W / 2, curY + 16, { align: 'center' });

  // Counter badge
  const countBadgeW = 16; const countBadgeH = 9;
  const countBadgeX = titleX + titleW - 4 - countBadgeW;
  doc.setFillColor(...PDF_RGB.yellow);
  doc.rect(countBadgeX, curY + 5.5, countBadgeW, countBadgeH, 'F');
  doc.setLineWidth(0.3);
  doc.rect(countBadgeX, curY + 5.5, countBadgeW, countBadgeH, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_RGB.ink);
  doc.text(String(rows.length), countBadgeX + countBadgeW / 2, curY + 5.5 + countBadgeH / 2 + 2, { align: 'center' });

  curY += titleH + 6;

  const genDate = new Date().toLocaleDateString(
    locale === 'en' ? 'en-US' : 'es-ES',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  // Box rows
  for (let i = 0; i < boxes.length; i += BOXES_PER_ROW) {
    const rowBoxes = boxes.slice(i, i + BOXES_PER_ROW);
    const maxH = Math.max(...rowBoxes.map(b => dayBoxPdfH(b.rows)));
    const leftX = PDF_MARGIN;

    if (curY + maxH > PDF_PAGE_H - PDF_MARGIN - 10) {
      drawPdfFooter(doc, genDate, locale);
      doc.addPage();
      curY = PDF_MARGIN;
    }

    for (let bi = 0; bi < rowBoxes.length; bi++) {
      const box = rowBoxes[bi];
      const bx = leftX + bi * (BOX_W + PDF_GAP);
      drawDayBoxPdf(doc, box, bx, curY, BOX_W, locale, flagPngs);
    }

    curY += maxH + 4;
  }

  drawPdfFooter(doc, genDate, locale);

  return doc.output('blob') as Blob;
}

function drawPdfFooter(doc: import('jspdf').jsPDF, genDate: string, _locale: Locale): void {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_RGB.ink);
  doc.text('BRACKET MUNDIAL 2026 \u00b7 bracketmundial.com', PDF_MARGIN, pageH - 6);

  const pageNum = doc.getNumberOfPages();
  for (let p = 1; p <= pageNum; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_RGB.dim);
    const footerTxt = `Generado el ${genDate}    bm26 \u00b7 p\u00e1gina ${p} de ${pageNum}`;
    doc.text(footerTxt, pageW - PDF_MARGIN, pageH - 6, { align: 'right' });
  }
}

function drawDayBoxPdf(
  doc: import('jspdf').jsPDF,
  box: DayBox,
  bx: number,
  by: number,
  boxW: number,
  locale: Locale,
  flagPngs: Map<string, string>,
): void {
  const { dateIso, rows, boxColorIdx } = box;
  const hdrColorHex = GROUP_CYCLE[boxColorIdx % 4];
  const hdrColorRgb = pdfColor(hdrColorHex);
  const venues = uniqueVenues(rows);

  let y = by;

  // ── Header ──
  doc.setFillColor(...hdrColorRgb);
  doc.rect(bx, y, boxW, PDF_HDR_H, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_RGB.white);
  const dateLabel = formatDayHeader(dateIso, locale);
  doc.text(dateLabel, bx + 2, y + PDF_HDR_H / 2 + 3);

  // Counter badge
  const badgeX = bx + boxW - 14;
  const badgeY = y + 1;
  const badgeW = 13;
  const badgeH = PDF_HDR_H - 2;
  doc.setFillColor(...PDF_RGB.paper2);
  doc.rect(badgeX, badgeY, badgeW, badgeH, 'F');
  doc.setFontSize(6);
  doc.setTextColor(...PDF_RGB.ink);
  doc.text(`${rows.length}/${rows.length}`, badgeX + badgeW / 2, badgeY + badgeH / 2 + 2, { align: 'center' });

  y += PDF_HDR_H;

  // ── Label row ──
  doc.setFillColor(...PDF_RGB.paper2);
  doc.rect(bx, y, boxW, PDF_LBL_H, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(...PDF_RGB.ink);

  const labels = [
    locale === 'en' ? 'ID' : 'ID',
    locale === 'en' ? 'Round' : 'Fase',
    locale === 'en' ? 'Time' : 'Hora',
    locale === 'en' ? 'Home' : 'Local',
    '',
    locale === 'en' ? 'GF' : 'GF',
    '',
    locale === 'en' ? 'GC' : 'GC',
    '',
    locale === 'en' ? 'Away' : 'Visit.',
  ];

  let cx = bx;
  for (let ci = 0; ci < BOX_COLS; ci++) {
    const cw = (PDF_COL_RATIOS[ci] / PDF_COL_TOTAL) * boxW;
    const align = ci === MC_HOME ? 'right' : ci === MC_AWAY ? 'left' : 'center';
    doc.text(labels[ci], cx + (align === 'right' ? cw - 1 : align === 'left' ? 1 : cw / 2), y + PDF_LBL_H / 2 + 1.5, { align: align === 'left' ? 'left' : 'center' });
    cx += cw;
  }

  // Bottom border for labels row
  doc.setDrawColor(...PDF_RGB.ink);
  doc.setLineWidth(0.2);
  doc.line(bx, y + PDF_LBL_H, bx + boxW, y + PDF_LBL_H);

  y += PDF_LBL_H;

  // ── Match rows ──
  const tbdText = locale === 'en' ? 'TBD' : 'Por definir';

  for (let mi = 0; mi < rows.length; mi++) {
    const m = rows[mi];
    const bgRgb = mi % 2 === 0 ? PDF_RGB.paper3 : PDF_RGB.paper2;
    doc.setFillColor(...bgRgb);
    doc.rect(bx, y, boxW, PDF_ROW_H, 'F');

    cx = bx;
    for (let ci = 0; ci < BOX_COLS; ci++) {
      const cw = (PDF_COL_RATIOS[ci] / PDF_COL_TOTAL) * boxW;

      if (ci === MC_ID) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(...PDF_RGB.dim);
        doc.text(m.matchId, cx + cw / 2, y + PDF_ROW_H / 2 + 1.5, { align: 'center' });
      } else if (ci === MC_MD) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(...PDF_RGB.dim);
        doc.text(m.matchDayLabel, cx + cw / 2, y + PDF_ROW_H / 2 + 1.5, { align: 'center' });
      } else if (ci === MC_TIME) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...PDF_RGB.ink);
        doc.text(m.timeSpain, cx + cw / 2, y + PDF_ROW_H / 2 + 1.5, { align: 'center' });
      } else if (ci === MC_HOME) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...PDF_RGB.ink);
        doc.text(m.teamA ? tName(m.teamA) : tbdText, cx + cw - 1, y + PDF_ROW_H / 2 + 1.5, { align: 'right' });
      } else if (ci === MC_FLA) {
        if (m.teamA) {
          const png = flagPngs.get(m.teamA);
          if (png) {
            const fw = 6; const fh = 4;
            doc.addImage(png, 'PNG', cx + (cw - fw) / 2, y + (PDF_ROW_H - fh) / 2, fw, fh);
          }
        }
      } else if (ci === MC_SA) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PDF_RGB.ink);
        if (m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined) {
          doc.text(String(m.scoreA), cx + cw / 2, y + PDF_ROW_H / 2 + 1.5, { align: 'center' });
        }
      } else if (ci === MC_SEP) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...PDF_RGB.dim);
        doc.text('–', cx + cw / 2, y + PDF_ROW_H / 2 + 1.5, { align: 'center' });
      } else if (ci === MC_SB) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PDF_RGB.ink);
        if (m.scoreA !== null && m.scoreA !== undefined && m.scoreB !== null && m.scoreB !== undefined) {
          doc.text(String(m.scoreB), cx + cw / 2, y + PDF_ROW_H / 2 + 1.5, { align: 'center' });
        }
      } else if (ci === MC_FLB) {
        if (m.teamB) {
          const png = flagPngs.get(m.teamB);
          if (png) {
            const fw = 6; const fh = 4;
            doc.addImage(png, 'PNG', cx + (cw - fw) / 2, y + (PDF_ROW_H - fh) / 2, fw, fh);
          }
        }
      } else if (ci === MC_AWAY) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...PDF_RGB.ink);
        doc.text(m.teamB ? tName(m.teamB) : tbdText, cx + 1, y + PDF_ROW_H / 2 + 1.5, { align: 'left' });
      }

      cx += cw;
    }

    y += PDF_ROW_H;
  }

  // ── SEDES sub-block ──
  doc.setFillColor(...hdrColorRgb);
  doc.rect(bx, y, boxW, PDF_VENUE_HDR_H, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_RGB.white);
  doc.text(locale === 'en' ? 'VENUES' : 'SEDES', bx + boxW / 2, y + PDF_VENUE_HDR_H / 2 + 2, { align: 'center' });
  y += PDF_VENUE_HDR_H;

  for (let vi = 0; vi < venues.length; vi++) {
    const v = venues[vi];
    const vrgb = vi % 2 === 0 ? PDF_RGB.paper3 : PDF_RGB.paper2;
    doc.setFillColor(...vrgb);
    doc.rect(bx, y, boxW, PDF_VENUE_ROW_H, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...PDF_RGB.ink);
    doc.text(`${v.venue} \u00b7 ${v.city}`, bx + 2, y + PDF_VENUE_ROW_H / 2 + 1.5);
    y += PDF_VENUE_ROW_H;
  }

  y += PDF_BOX_PAD;

  // ── Box border ──
  const boxH = y - by;
  doc.setDrawColor(...PDF_RGB.ink);
  doc.setLineWidth(0.6);
  doc.rect(bx, by, boxW, boxH, 'S');
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
