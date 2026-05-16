import ExcelJS from 'exceljs';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';

const COLORS = {
  paper: 'ECDFC0',
  paper2: 'E6D6B1',
  ink: '1A1933',
  yellow: 'F0B021',
  orange: 'E8541F',
  red: 'C41E2C',
  green: '1F6B3A',
  blue: '22418C',
  white: 'FFFFFF',
  dim: '7A6F54'
};

const BORDER_THICK = { style: 'thick' as const, color: { argb: COLORS.ink } };
const BORDER_THIN = { style: 'thin' as const, color: { argb: COLORS.ink } };

export class ExcelService {
  static async exportToExcel(
    groupMatches: GroupMatchResult[],
    knockoutMatches: Record<string, KnockoutMatchResult>
  ): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Bracket Mundial 2026';
    workbook.lastModifiedBy = 'Bracket Mundial 2026';
    workbook.created = new Date();
    workbook.modified = new Date();

    this.createGroupsSheet(workbook, groupMatches);
    this.createKnockoutSheet(workbook, knockoutMatches);
    this.createDataMapSheet(workbook, groupMatches);

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private static createGroupsSheet(workbook: ExcelJS.Workbook, matches: GroupMatchResult[]) {
    const sheet = workbook.addWorksheet('Fase de Grupos', {
      views: [{ showGridLines: false }],
      properties: { defaultRowHeight: 20 }
    });

    sheet.getColumn('A').width = 2;
    
    const groups = 'ABCDEFGHIJKL'.split('');
    let currentColumn = 2;
    let currentRow = 2;

    groups.forEach((groupLetter, index) => {
      const groupMatches = matches.filter(m => m.group === groupLetter);
      this.drawGroupBox(sheet, groupLetter, groupMatches, currentRow, currentColumn);

      if ((index + 1) % 3 === 0) {
        currentColumn = 2;
        currentRow += 18;
      } else {
        currentColumn += 12;
      }
    });
  }

  private static drawGroupBox(
    sheet: ExcelJS.Worksheet,
    group: string,
    matches: GroupMatchResult[],
    row: number,
    col: number
  ) {
    // Header - GRUPO
    const headerCell = sheet.getCell(row, col);
    headerCell.value = `GRUPO ${group}`;
    headerCell.font = { bold: true, size: 14, color: { argb: COLORS.white } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ink } };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(row, col, row, col + 9);

    // Labels Matches
    const labelsRow = row + 1;
    ['ID', 'Selección Local', '', 'Goles', '-', 'Goles', '', 'Selección Visitante'].forEach((label, i) => {
      const cell = sheet.getCell(labelsRow, col + i);
      cell.value = label;
      cell.font = { bold: true, size: 9, color: { argb: COLORS.ink } };
      cell.alignment = { horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.paper2 } };
      cell.border = { bottom: BORDER_THIN };
    });

    sheet.getColumn(col).width = 6; // ID
    sheet.getColumn(col + 1).width = 18; // Local
    sheet.getColumn(col + 2).width = 4; // Flag
    sheet.getColumn(col + 3).width = 7; // S1
    sheet.getColumn(col + 4).width = 3; // -
    sheet.getColumn(col + 5).width = 7; // S2
    sheet.getColumn(col + 6).width = 4; // Flag
    sheet.getColumn(col + 7).width = 18; // Visitante
    sheet.getColumn(col + 8).width = 5; // DG
    sheet.getColumn(col + 9).width = 6; // PTS

    // Matches
    const matchStartRow = row + 2;
    matches.forEach((m, i) => {
      const r = matchStartRow + i;
      const teamA = TEAMS_2026.find(t => t.id === m.teamA);
      const teamB = TEAMS_2026.find(t => t.id === m.teamB);

      sheet.getCell(r, col).value = m.matchId;
      sheet.getCell(r, col).font = { size: 8, color: { argb: COLORS.dim } };
      
      sheet.getCell(r, col + 1).value = teamA?.name || m.teamA;
      sheet.getCell(r, col + 2).value = teamA?.flag || '';
      sheet.getCell(r, col + 3).value = m.scoreA;
      sheet.getCell(r, col + 4).value = '-';
      sheet.getCell(r, col + 5).value = m.scoreB;
      sheet.getCell(r, col + 6).value = teamB?.flag || '';
      sheet.getCell(r, col + 7).value = teamB?.name || m.teamB;

      // Styling scores (fillable)
      [col + 3, col + 5].forEach(c => {
        const cell = sheet.getCell(r, c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };
        cell.border = { top: BORDER_THIN, left: BORDER_THIN, bottom: BORDER_THIN, right: BORDER_THIN };
        cell.alignment = { horizontal: 'center' };
        cell.font = { bold: true };
        cell.dataValidation = { 
          type: 'whole', 
          operator: 'greaterThanOrEqual', 
          showErrorMessage: true, 
          allowBlank: true, 
          formulae: [0] 
        };
      });

      [col, col + 1, col + 2, col + 4, col + 6, col + 7].forEach(c => {
        sheet.getCell(r, c).alignment = { horizontal: 'center' };
      });
    });

    // Standing Table Section
    const standingRow = row + 9;
    const standingHeader = sheet.getCell(standingRow, col);
    standingHeader.value = 'CLASIFICACIÓN';
    standingHeader.font = { bold: true, size: 10, color: { argb: COLORS.white } };
    standingHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.dim } };
    standingHeader.alignment = { horizontal: 'center' };
    sheet.mergeCells(standingRow, col, standingRow, col + 9);

    const standingLabelsRow = standingRow + 1;
    // (Labels are filled in the stats.forEach loop below)
    
    // Simpler Standing Table Layout
    const stats = ['Pos', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'PTS'];
    stats.forEach((s, i) => {
        const cell = sheet.getCell(standingLabelsRow, col + i);
        cell.value = s;
        cell.font = { bold: true, size: 8 };
        cell.alignment = { horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.paper2 } };
        cell.border = { bottom: BORDER_THIN };
    });

    const groupTeams = TEAMS_2026.filter(t => t.group === group);
    groupTeams.forEach((team, teamIdx) => {
        const r = standingLabelsRow + 1 + teamIdx;
        const teamId = team.id;
        
        sheet.getCell(r, col).value = teamIdx + 1; // Pos
        sheet.getCell(r, col + 1).value = team.name; // Equipo
        
        // Formula calculation helpers
        const matchRows = matches.map((_, i) => matchStartRow + i);
        const getFormula = (type: 'PJ' | 'G' | 'E' | 'P' | 'GF' | 'GC' | 'DG' | 'PTS'): any => {
            const teamLocalIndices = matches.map((m, i) => m.teamA === teamId ? i : -1).filter(i => i !== -1);
            const teamAwayIndices = matches.map((m, i) => m.teamB === teamId ? i : -1).filter(i => i !== -1);
            
            const allScoreCells = [
                ...teamLocalIndices.map(i => sheet.getCell(matchRows[i], col + 3).address),
                ...teamAwayIndices.map(i => sheet.getCell(matchRows[i], col + 5).address)
            ];
            
            if (type === 'PJ') return { formula: `COUNT(${allScoreCells.join(',')})` };
            if (type === 'GF') {
                const myScores = [
                    ...teamLocalIndices.map(i => sheet.getCell(matchRows[i], col + 3).address),
                    ...teamAwayIndices.map(i => sheet.getCell(matchRows[i], col + 5).address)
                ];
                return { formula: `SUM(${myScores.join(',')})` };
            }
            if (type === 'GC') {
                const oppScores = [
                    ...teamLocalIndices.map(i => sheet.getCell(matchRows[i], col + 5).address),
                    ...teamAwayIndices.map(i => sheet.getCell(matchRows[i], col + 3).address)
                ];
                return { formula: `SUM(${oppScores.join(',')})` };
            }
            if (type === 'DG') return { formula: `${sheet.getCell(r, col + 6).address}-${sheet.getCell(r, col + 7).address}` };
            
            const winParts: string[] = [];
            const drawParts: string[] = [];
            const lostParts: string[] = [];

            teamLocalIndices.forEach(i => {
                const s1 = sheet.getCell(matchRows[i], col + 3).address;
                const s2 = sheet.getCell(matchRows[i], col + 5).address;
                winParts.push(`IF(AND(ISNUMBER(${s1}),ISNUMBER(${s2})),IF(${s1}>${s2},1,0),0)`);
                drawParts.push(`IF(AND(ISNUMBER(${s1}),ISNUMBER(${s2})),IF(${s1}=${s2},1,0),0)`);
                lostParts.push(`IF(AND(ISNUMBER(${s1}),ISNUMBER(${s2})),IF(${s1}<${s2},1,0),0)`);
            });
            teamAwayIndices.forEach(i => {
                const s1 = sheet.getCell(matchRows[i], col + 3).address;
                const s2 = sheet.getCell(matchRows[i], col + 5).address;
                winParts.push(`IF(AND(ISNUMBER(${s1}),ISNUMBER(${s2})),IF(${s2}>${s1},1,0),0)`);
                drawParts.push(`IF(AND(ISNUMBER(${s1}),ISNUMBER(${s2})),IF(${s2}=${s1},1,0),0)`);
                lostParts.push(`IF(AND(ISNUMBER(${s1}),ISNUMBER(${s2})),IF(${s2}<${s1},1,0),0)`);
            });

            if (type === 'G') return { formula: winParts.length > 0 ? winParts.join('+') : '0' };
            if (type === 'E') return { formula: drawParts.length > 0 ? drawParts.join('+') : '0' };
            if (type === 'P') return { formula: lostParts.length > 0 ? lostParts.join('+') : '0' };
            if (type === 'PTS') return { formula: `(${sheet.getCell(r, col + 3).address}*3)+${sheet.getCell(r, col + 4).address}` };
            
            return 0;
        };

        sheet.getCell(r, col + 2).value = getFormula('PJ');
        sheet.getCell(r, col + 3).value = getFormula('G');
        sheet.getCell(r, col + 4).value = getFormula('E');
        sheet.getCell(r, col + 5).value = getFormula('P');
        sheet.getCell(r, col + 6).value = getFormula('GF');
        sheet.getCell(r, col + 7).value = getFormula('GC');
        sheet.getCell(r, col + 8).value = getFormula('DG');
        sheet.getCell(r, col + 9).value = getFormula('PTS');

        // Style standing row
        for(let i=0; i<10; i++) {
            const cell = sheet.getCell(r, col + i);
            cell.alignment = { horizontal: 'center' };
            cell.font = { size: 9 };
            if (i === 9) cell.font = { bold: true, size: 10 }; // Points
        }
    });

    // Box border
    const lastRow = standingLabelsRow + 4;
    for (let r_idx = row; r_idx <= lastRow; r_idx++) {
      sheet.getCell(r_idx, col).border = { ...sheet.getCell(r_idx, col).border, left: BORDER_THICK };
      sheet.getCell(r_idx, col + 9).border = { ...sheet.getCell(r_idx, col + 9).border, right: BORDER_THICK };
    }
    for (let c_idx = col; c_idx <= col + 9; c_idx++) {
      sheet.getCell(row, c_idx).border = { ...sheet.getCell(row, c_idx).border, top: BORDER_THICK };
      sheet.getCell(lastRow, c_idx).border = { ...sheet.getCell(lastRow, c_idx).border, bottom: BORDER_THICK };
    }
  }

  private static createKnockoutSheet(workbook: ExcelJS.Workbook, matches: Record<string, KnockoutMatchResult>) {
    const sheet = workbook.addWorksheet('Eliminatorias', {
      views: [{ showGridLines: false }]
    });

    sheet.getCell('A1').value = 'CUADRO FINAL';
    sheet.getCell('A1').font = { bold: true, size: 20 };
    
    // For now, let's just list the matches in a column for the user to fill.
    // Making a full visual tree in Excel via code is extremely tedious.
    // I'll provide a simplified but clear version.
    
    const rounds = [
      { id: 'roundOf32', label: 'Dieciséis-avos' },
      { id: 'roundOf16', label: 'Octavos' },
      { id: 'quarterfinals', label: 'Cuartos' },
      { id: 'semifinals', label: 'Semifinales' },
      { id: 'thirdPlace', label: 'Tercer Puesto' },
      { id: 'final', label: 'Gran Final' }
    ];

    let currentRow = 3;
    rounds.forEach(round => {
      const header = sheet.getCell(currentRow, 2);
      header.value = round.label.toUpperCase();
      header.font = { bold: true, color: { argb: COLORS.white } };
      header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.orange } };
      sheet.mergeCells(currentRow, 2, currentRow, 9);
      currentRow++;

      // Labels
      ['ID', 'Local', '', 'Score', '-', 'Score', '', 'Visitante', 'Pen'].forEach((l, i) => {
        const cell = sheet.getCell(currentRow, 2 + i);
        cell.value = l;
        cell.font = { bold: true, size: 9 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.paper2 } };
      });
      currentRow++;

      const matchIds = this.getMatchIdsForRound(round.id);
      matchIds.forEach(id => {
        const m = matches[id] || { matchId: id, teamA: '?', teamB: '?', scoreA: null, scoreB: null };
        const r = currentRow;
        
        sheet.getCell(r, 2).value = id;
        sheet.getCell(r, 3).value = this.getTeamName(m.teamA);
        sheet.getCell(r, 4).value = this.getTeamFlag(m.teamA);
        sheet.getCell(r, 5).value = m.scoreA;
        sheet.getCell(r, 6).value = '-';
        sheet.getCell(r, 7).value = m.scoreB;
        sheet.getCell(r, 8).value = this.getTeamFlag(m.teamB);
        sheet.getCell(r, 9).value = this.getTeamName(m.teamB);
        sheet.getCell(r, 10).value = (m.penaltyScoreA !== undefined || m.penaltyScoreB !== undefined) ? `${m.penaltyScoreA || 0}-${m.penaltyScoreB || 0}` : '';

        [5, 7, 10].forEach(c => {
          const cell = sheet.getCell(r, c);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.yellow } };
          cell.border = { top: BORDER_THIN, left: BORDER_THIN, bottom: BORDER_THIN, right: BORDER_THIN };
          cell.alignment = { horizontal: 'center' };
        });

        currentRow++;
      });
      currentRow += 2;
    });
  }

  private static getMatchIdsForRound(roundId: string): string[] {
      // Hardcoded IDs matching tournament-store and data
      if (roundId === 'roundOf32') return Array.from({length: 16}, (_, i) => `R32-${(i+1).toString().padStart(2, '0')}`);
      if (roundId === 'roundOf16') return Array.from({length: 8}, (_, i) => `R16-${(i+1).toString().padStart(2, '0')}`);
      if (roundId === 'quarterfinals') return Array.from({length: 4}, (_, i) => `QF-${(i+1).toString().padStart(2, '0')}`);
      if (roundId === 'semifinals') return ['SF-01', 'SF-02'];
      if (roundId === 'thirdPlace') return ['TP-01'];
      if (roundId === 'final') return ['FIN-01'];
      return [];
  }

  private static getTeamName(id: string | null) {
      if (!id) return '?';
      return TEAMS_2026.find(t => t.id === id)?.name || id;
  }

  private static getTeamFlag(id: string | null) {
      if (!id) return '';
      return TEAMS_2026.find(t => t.id === id)?.flag || '';
  }

  private static createDataMapSheet(
    workbook: ExcelJS.Workbook,
    groupMatches: GroupMatchResult[]
  ) {
    const sheet = workbook.addWorksheet('MAP', { state: 'hidden' });
    sheet.getCell('A1').value = 'Match ID';
    sheet.getCell('B1').value = 'Sheet';
    sheet.getCell('C1').value = 'Score A Cell';
    sheet.getCell('D1').value = 'Score B Cell';
    sheet.getCell('E1').value = 'Penalties Cell (Optional)';

    let r = 2;
    // Map group matches
    const groupsSheet = workbook.getWorksheet('Fase de Grupos');
    if (!groupsSheet) return;

    // We need to re-find the cells. For simplicity, let's just re-iterate the logic
    const groups = 'ABCDEFGHIJKL'.split('');
    let currentColumn = 2;
    let currentRow = 2;

    groups.forEach((groupLetter, index) => {
      const gMatches = groupMatches.filter(m => m.group === groupLetter);
      gMatches.forEach((m, i) => {
        sheet.getCell(r, 1).value = m.matchId;
        sheet.getCell(r, 2).value = 'Fase de Grupos';
        sheet.getCell(r, 3).value = groupsSheet.getCell(currentRow + 2 + i, currentColumn + 3).address;
        sheet.getCell(r, 4).value = groupsSheet.getCell(currentRow + 2 + i, currentColumn + 5).address;
        r++;
      });

      if ((index + 1) % 3 === 0) {
        currentColumn = 2;
        currentRow += 18;
      } else {
        currentColumn += 12;
      }
    });

    // Map knockout matches
    const knockoutSheet = workbook.getWorksheet('Eliminatorias');
    if (!knockoutSheet) return;

    const rounds = ['roundOf32', 'roundOf16', 'quarterfinals', 'semifinals', 'thirdPlace', 'final'];
    let kRow = 3;
    rounds.forEach(roundId => {
        kRow += 2; // Header + Labels
        const ids = this.getMatchIdsForRound(roundId);
        ids.forEach(id => {
            sheet.getCell(r, 1).value = id;
            sheet.getCell(r, 2).value = 'Eliminatorias';
            sheet.getCell(r, 3).value = knockoutSheet.getCell(kRow, 5).address;
            sheet.getCell(r, 4).value = knockoutSheet.getCell(kRow, 7).address;
            sheet.getCell(r, 5).value = knockoutSheet.getCell(kRow, 10).address;
            r++;
            kRow++;
        });
        kRow += 2; // Spacing
    });
  }

  static async importFromExcel(file: File): Promise<{
    groupScores: { matchId: string; scoreA: number | null; scoreB: number | null }[],
    knockoutScores: { matchId: string; scoreA: number | null; scoreB: number | null; penaltyScoreA: number | null; penaltyScoreB: number | null }[]
  }> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const mapSheet = workbook.getWorksheet('MAP');
    if (!mapSheet) throw new Error('Formato de Excel no válido: Falta la hoja de mapeo.');

    const groupScores: any[] = [];
    const knockoutScores: any[] = [];

    mapSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const matchId = row.getCell(1).value?.toString();
      const sheetName = row.getCell(2).value?.toString();
      const scoreACell = row.getCell(3).value?.toString();
      const scoreBCell = row.getCell(4).value?.toString();
      const penCell = row.getCell(5).value?.toString();

      if (!matchId || !sheetName || !scoreACell || !scoreBCell) return;

      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet) return;

      const scoreA = this.parseScore(sheet.getCell(scoreACell).value);
      const scoreB = this.parseScore(sheet.getCell(scoreBCell).value);

      if (matchId.startsWith('R32-') || matchId.startsWith('R16-') || matchId.startsWith('QF-') || matchId.startsWith('SF-') || matchId.startsWith('TP-') || matchId.startsWith('FIN-')) {
          let penaltyScoreA: number | null = null;
          let penaltyScoreB: number | null = null;
          if (penCell) {
              const penVal = sheet.getCell(penCell).value?.toString() || '';
              const parts = penVal.split('-');
              if (parts.length === 2) {
                  penaltyScoreA = parseInt(parts[0], 10);
                  penaltyScoreB = parseInt(parts[1], 10);
              }
          }
          knockoutScores.push({ matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB });
      } else {
          groupScores.push({ matchId, scoreA, scoreB });
      }
    });

    return { groupScores, knockoutScores };
  }

  private static parseScore(val: any): number | null {
      if (val === null || val === undefined || val === '') return null;
      const n = parseInt(val.toString(), 10);
      return isNaN(n) ? null : n;
  }
}
