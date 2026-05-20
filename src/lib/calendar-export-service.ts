import ExcelJS from 'exceljs';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import type { Locale } from '../i18n';
import type { TranslationKey } from '../i18n/es';
import { es } from '../i18n/es';
import { en } from '../i18n/en';

export type CalendarPhase = 'all' | 'groups' | 'knockout';

/* ─── Retro Panini palette (Excel uses ARGB hex, PDF uses RGB arrays) ─── */

const C = {
  paper:  'ECDFC0',
  paper2: 'E6D6B1',
  paper3: 'FFF9EC',
  ink:    '1A1933',
  yellow: 'F0B021',
  orange: 'E8541F',
  blue:   '22418C',
  red:    'C41E2C',
  white:  'FFFFFF',
  dim:    '7A6F54',
} as const;

const PDF_RGB = {
  paper:  [236, 223, 192] as [number, number, number],
  paper2: [230, 214, 177] as [number, number, number],
  paper3: [255, 249, 236] as [number, number, number],
  ink:    [26, 25, 51] as [number, number, number],
  yellow: [240, 176, 33] as [number, number, number],
  orange: [232, 84, 31] as [number, number, number],
  blue:   [34, 65, 140] as [number, number, number],
  red:    [196, 30, 44] as [number, number, number],
  white:  [255, 255, 255] as [number, number, number],
  dim:    [122, 111, 84] as [number, number, number],
};

/* ─── i18n helper (no Zustand dep) ─── */

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

/** Short localized date: "Jue 11 Jun" / "Thu Jun 11" */
function fmtDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months =
    locale === 'en'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const days =
    locale === 'en'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

/** Uppercase day-strip label: "JUE · 11 JUN" / "THU · JUN 11" */
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

/**
 * Strips Regional Indicator Symbol pairs (flag emoji like 🇲🇽) from a string.
 * Excel on Windows and jsPDF with Helvetica cannot render them — they produce
 * garbled characters or boxes. Apply only in file-export context, not in UI.
 */
function stripFlagEmoji(str: string): string {
  return str.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '').replace(/\s+/g, ' ').trim();
}

function getKnockoutPhaseKey(matchId: string): TranslationKey {
  if (matchId.startsWith('R32')) return 'calendar.r32';
  if (matchId.startsWith('R16')) return 'calendar.r16';
  if (matchId.startsWith('QF')) return 'calendar.qf';
  if (matchId.startsWith('SF')) return 'calendar.sf';
  if (matchId.startsWith('TP')) return 'calendar.tp';
  return 'calendar.final';
}

/* ─── Row builder ─── */

export interface CalendarRow {
  /** ISO date YYYY-MM-DD — also used for grouping */
  date: string;
  timeSpain: string;
  match: string;
  phase: string;
  venue: string;
  city: string;
}

export interface DayGroup {
  dateIso: string;
  rows: CalendarRow[];
}

export function getRows(phase: CalendarPhase, locale: Locale): CalendarRow[] {
  const rows: CalendarRow[] = [];

  if (phase === 'all' || phase === 'groups') {
    for (const m of GROUP_MATCHES) {
      const stadium = STADIUMS.find(s => s.id === m.venueId);
      rows.push({
        date: m.date,
        timeSpain: m.timeSpain,
        match: `${tFlag(m.teamA)} ${tName(m.teamA)} vs ${tName(m.teamB)} ${tFlag(m.teamB)}`,
        phase: lbl('groups.group', locale, { letter: m.group }),
        venue: stadium?.name ?? m.venueId,
        city: stadium?.city ?? '',
      });
    }
  }

  if (phase === 'all' || phase === 'knockout') {
    for (const [matchId, m] of Object.entries(KNOCKOUT_SCHEDULE)) {
      const phaseKey = getKnockoutPhaseKey(matchId);
      rows.push({
        date: m.date,
        timeSpain: m.timeSpain,
        match: lbl('card.tbd', locale),
        phase: lbl(phaseKey, locale),
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

/** Groups sorted rows by ISO date, preserving chronological order. */
export function groupRowsByDate(rows: CalendarRow[]): DayGroup[] {
  const map = new Map<string, CalendarRow[]>();
  for (const r of rows) {
    const g = map.get(r.date);
    if (g) g.push(r);
    else map.set(r.date, [r]);
  }
  return Array.from(map.entries()).map(([dateIso, dayRows]) => ({ dateIso, rows: dayRows }));
}

export function fileNameBase(phase: CalendarPhase, locale: Locale): string {
  const suffix =
    phase === 'all' ? 'completo'
    : phase === 'groups' ? 'grupos'
    : 'eliminatorias';
  const prefix = locale === 'en' ? 'schedule' : 'calendario';
  return `bracketmundial-${prefix}-${suffix}-2026`;
}

/* ─── Excel export ─── */

export async function exportCalendarExcel(phase: CalendarPhase, locale: Locale): Promise<Blob> {
  const rows = getRows(phase, locale);
  const groups = groupRowsByDate(rows);

  const wb = new ExcelJS.Workbook();

  const phaseLabel =
    phase === 'all'
      ? lbl('tabs.calendar', locale)
      : phase === 'groups'
        ? lbl('section.groups.eyebrow', locale)
        : lbl('section.knockout.eyebrow', locale);

  const ws = wb.addWorksheet(phaseLabel);

  const thin: ExcelJS.Border = { style: 'thin', color: { argb: C.ink } };
  const thick: ExcelJS.Border = { style: 'thick', color: { argb: C.ink } };
  const medium: ExcelJS.Border = { style: 'medium', color: { argb: C.ink } };

  const NCOLS = 6;

  // ── Row 1: Mega title ──
  const titleText =
    locale === 'en'
      ? 'SCHEDULE · WORLD CUP 2026'
      : 'CALENDARIO · MUNDIAL 2026';
  const titleRow = ws.addRow([titleText, '', '', '', '', '']);
  ws.mergeCells(`A1:F1`);
  const titleCell = titleRow.getCell(1);
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.orange } };
  titleCell.font = { bold: true, color: { argb: C.white }, size: 22, name: 'Arial Black' };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = { top: thick, bottom: medium, left: thick, right: thick };
  titleRow.height = 40;

  // ── Row 2: Subtitle ──
  const subtitleKey: TranslationKey =
    phase === 'all' ? 'calendar.exportSubtitleAll'
    : phase === 'groups' ? 'calendar.exportSubtitleGroups'
    : 'calendar.exportSubtitleKnockout';
  const subtitleText = lbl(subtitleKey, locale, { count: String(rows.length) });
  const subtitleRow = ws.addRow([subtitleText, '', '', '', '', '']);
  ws.mergeCells(`A2:F2`);
  const subtitleCell = subtitleRow.getCell(1);
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.paper3 } };
  subtitleCell.font = { color: { argb: C.dim }, size: 11, name: 'Arial', italic: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subtitleCell.border = { top: thin, bottom: thin, left: thick, right: thick };
  subtitleRow.height = 22;

  // ── Row 3: Separator ──
  const sepRow = ws.addRow(['', '', '', '', '', '']);
  ws.mergeCells(`A3:F3`);
  const sepCell = sepRow.getCell(1);
  sepCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.paper3 } };
  sepCell.border = { left: thick, right: thick };
  sepRow.height = 6;

  // ── Row 4: Column headers ──
  const headers = [
    lbl('excel.colDate', locale),
    lbl('calendar.colTime', locale),
    lbl('calendar.colMatch', locale),
    lbl('calendar.colPhase', locale),
    lbl('excel.colVenue', locale),
    lbl('calendar.colCity', locale),
  ];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.yellow } };
    cell.font = { bold: true, color: { argb: C.ink }, size: 12, name: 'Arial' };
    cell.border = { top: thick, bottom: thick, left: thin, right: thin };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  headerRow.height = 28;

  // ── Per day: band row + match rows ──
  const matchWord = (n: number) =>
    n === 1 ? lbl('calendar.exportMatchSingular', locale) : lbl('calendar.exportMatchPlural', locale);

  let dataRowIdx = 0; // for zebra

  for (const group of groups) {
    // Day band (merged)
    const bandText = `  ${formatDayHeader(group.dateIso, locale)}   —   ${group.rows.length} ${matchWord(group.rows.length)}`;
    const currentBandRowNum = ws.actualRowCount + 1;
    const bandRow = ws.addRow([bandText, '', '', '', '', '']);
    ws.mergeCells(`A${currentBandRowNum}:F${currentBandRowNum}`);
    const bandCell = bandRow.getCell(1);
    bandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.blue } };
    bandCell.font = { bold: true, color: { argb: C.white }, size: 13, name: 'Arial Black' };
    bandCell.alignment = { horizontal: 'left', vertical: 'middle' };
    bandCell.border = { top: medium, bottom: medium, left: thick, right: thick };
    bandRow.height = 26;

    // Match rows for this day
    for (const r of group.rows) {
      const bg = dataRowIdx % 2 === 0 ? C.paper : C.paper2;
      const row = ws.addRow([
        fmtDate(r.date, locale),
        r.timeSpain,
        stripFlagEmoji(r.match),
        r.phase,
        r.venue,
        r.city,
      ]);
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.font = { color: { argb: C.ink }, size: 11, name: 'Arial' };
        cell.border = { top: thin, bottom: thin, left: thin, right: thin };
        cell.alignment = { vertical: 'middle' };
      });
      (row.getCell(2) as ExcelJS.Cell).font = { color: { argb: C.ink }, size: 11, name: 'Courier New' };
      row.height = 22;
      dataRowIdx++;
    }
  }

  // Column widths
  ws.columns = [
    { width: 16 }, // Date
    { width: 10 }, // Time
    { width: 40 }, // Match
    { width: 18 }, // Phase
    { width: 32 }, // Venue
    { width: 22 }, // City
  ];

  // Freeze first 4 rows (title + subtitle + separator + header)
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  // Print setup: A4 landscape, fit to width
  ws.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  // Print borders on outer edges of the table
  // Reinforce left/right borders on every row after merges
  for (let c = 1; c <= NCOLS; c++) {
    for (let rn = 1; rn <= ws.actualRowCount; rn++) {
      const cell = ws.getRow(rn).getCell(c);
      if (c === 1) cell.border = { ...cell.border, left: thick };
      if (c === NCOLS) cell.border = { ...cell.border, right: thick };
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/* ─── PDF export ─── */

export async function exportCalendarPdf(phase: CalendarPhase, locale: Locale): Promise<Blob> {
  const rows = getRows(phase, locale);
  const groups = groupRowsByDate(rows);

  // Dynamic import to keep bundle lean
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const margin = { top: 14, right: 14, bottom: 14, left: 14 };
  const pageW = doc.internal.pageSize.getWidth();

  // ── Title block ──
  const titleBlockX = margin.left;
  const titleBlockW = pageW - margin.left - margin.right;
  const titleBlockH = 20;
  const titleBlockY = margin.top;

  // Shadow
  doc.setFillColor(...PDF_RGB.ink);
  doc.rect(titleBlockX + 1, titleBlockY + 1, titleBlockW, titleBlockH, 'F');
  // Title background
  doc.setFillColor(...PDF_RGB.paper3);
  doc.rect(titleBlockX, titleBlockY, titleBlockW, titleBlockH, 'F');
  // Title border
  doc.setDrawColor(...PDF_RGB.ink);
  doc.setLineWidth(0.5);
  doc.rect(titleBlockX, titleBlockY, titleBlockW, titleBlockH, 'S');

  const titleText = locale === 'en' ? 'SCHEDULE · WORLD CUP 2026' : 'CALENDARIO · MUNDIAL 2026';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...PDF_RGB.ink);
  doc.text(titleText, pageW / 2, titleBlockY + 9, { align: 'center' });

  const subtitleKey: TranslationKey =
    phase === 'all' ? 'calendar.exportSubtitleAll'
    : phase === 'groups' ? 'calendar.exportSubtitleGroups'
    : 'calendar.exportSubtitleKnockout';
  const subtitleText = lbl(subtitleKey, locale, { count: String(rows.length) });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_RGB.dim);
  doc.text(subtitleText, pageW / 2, titleBlockY + 16, { align: 'center' });

  // ── Build PDF body with day-strip rows merged via colSpan ──
  const matchWord = (n: number) =>
    n === 1 ? lbl('calendar.exportMatchSingular', locale) : lbl('calendar.exportMatchPlural', locale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any[] = [];
  for (const group of groups) {
    const bandText = `${formatDayHeader(group.dateIso, locale)}   —   ${group.rows.length} ${matchWord(group.rows.length)}`;
    body.push([{
      content: bandText,
      colSpan: 5,
      styles: {
        fillColor: PDF_RGB.blue,
        textColor: PDF_RGB.white,
        fontStyle: 'bold',
        fontSize: 11,
        cellPadding: { top: 2.5, right: 5, bottom: 2.5, left: 5 },
        halign: 'left',
        lineWidth: 0,
      },
    }]);
    for (const r of group.rows) {
      body.push([r.timeSpain, stripFlagEmoji(r.match), r.phase, r.venue, r.city]);
    }
  }

  const pdfHeaders = [
    lbl('calendar.colTime', locale),
    lbl('calendar.colMatch', locale),
    lbl('calendar.colPhase', locale),
    lbl('excel.colVenue', locale),
    lbl('calendar.colCity', locale),
  ];

  autoTable(doc, {
    startY: titleBlockY + titleBlockH + 5,
    head: [pdfHeaders],
    body,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: PDF_RGB.ink,
      fillColor: PDF_RGB.paper,
      lineColor: PDF_RGB.ink,
      lineWidth: 0.3,
      cellPadding: { top: 2.5, right: 4, bottom: 2.5, left: 4 },
      valign: 'middle',
    },
    headStyles: {
      fillColor: PDF_RGB.yellow,
      textColor: PDF_RGB.ink,
      fontStyle: 'bold',
      lineWidth: 0.5,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: PDF_RGB.paper2,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center', font: 'courier' },
      1: { cellWidth: 68 },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 54 },
      4: { cellWidth: 34 },
    },
    didDrawPage: (data) => {
      const pageNum = data.pageNumber;
      const totalPages = doc.getNumberOfPages();
      const footerText = lbl('calendar.exportFooter', locale, {
        page: String(pageNum),
        total: String(totalPages),
      });
      doc.setFontSize(8);
      doc.setTextColor(...PDF_RGB.dim);
      doc.setFont('helvetica', 'normal');
      doc.text(
        footerText,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      );
    },
    margin: { top: margin.top, right: margin.right, bottom: 14, left: margin.left },
  });

  return doc.output('blob') as Blob;
}

/** Convenience: triggers a browser download for a Blob. */
export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
