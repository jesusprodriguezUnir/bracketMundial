import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { ExcelService, ExcelImportError } from './excel-service';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';

function makeGroupMatches(): GroupMatchResult[] {
  const pairs: [string, string][] = [
    ['MEX', 'RSA'], ['KOR', 'CZE'],
    ['MEX', 'KOR'], ['RSA', 'CZE'],
    ['MEX', 'CZE'], ['RSA', 'KOR'],
  ];
  return pairs.map(([teamA, teamB], i) => ({
    matchId: `M${i + 1}`,
    group: 'A',
    teamA,
    teamB,
    scoreA: i === 0 ? 2 : null,
    scoreB: i === 0 ? 1 : null,
    matchDay: Math.floor(i / 2) + 1,
  }));
}

function makeKnockoutMatches(): Record<string, KnockoutMatchResult> {
  return {
    'R32-01': {
      matchId: 'R32-01',
      round: 'roundOf32',
      teamA: 'MEX',
      teamB: 'RSA',
      scoreA: 3,
      scoreB: 2,
      penaltyScoreA: null,
      penaltyScoreB: null,
      winnerId: 'MEX',
      isPlayed: true,
    },
    'R32-02': {
      matchId: 'R32-02',
      round: 'roundOf32',
      teamA: 'BRA',
      teamB: 'ARG',
      scoreA: 1,
      scoreB: 1,
      penaltyScoreA: 4,
      penaltyScoreB: 5,
      winnerId: 'ARG',
      isPlayed: true,
    },
  };
}

describe('ExcelService round-trip', () => {
  it('exports and imports group scores correctly', async () => {
    const groupMatches = makeGroupMatches();
    const blob = await ExcelService.exportToExcel(groupMatches, {});
    const buffer = await blob.arrayBuffer();
    const result = await ExcelService.importFromBuffer(buffer);

    const m1 = result.groupScores.find(s => s.matchId === 'M1');
    expect(m1?.scoreA).toBe(2);
    expect(m1?.scoreB).toBe(1);

    const m2 = result.groupScores.find(s => s.matchId === 'M2');
    expect(m2?.scoreA).toBeNull();
    expect(m2?.scoreB).toBeNull();

    expect(result.groupScores).toHaveLength(6);
  });

  it('exports and imports knockout scores including penalties', async () => {
    const knockoutMatches = makeKnockoutMatches();
    const blob = await ExcelService.exportToExcel([], knockoutMatches);
    const buffer = await blob.arrayBuffer();
    const result = await ExcelService.importFromBuffer(buffer);

    const r32_01 = result.knockoutScores.find(s => s.matchId === 'R32-01');
    expect(r32_01?.scoreA).toBe(3);
    expect(r32_01?.scoreB).toBe(2);
    expect(r32_01?.penaltyScoreA).toBeNull();
    expect(r32_01?.penaltyScoreB).toBeNull();

    const r32_02 = result.knockoutScores.find(s => s.matchId === 'R32-02');
    expect(r32_02?.scoreA).toBe(1);
    expect(r32_02?.scoreB).toBe(1);
    expect(r32_02?.penaltyScoreA).toBe(4);
    expect(r32_02?.penaltyScoreB).toBe(5);
  });

  it('workbook contains required sheets', async () => {
    const blob = await ExcelService.exportToExcel(makeGroupMatches(), makeKnockoutMatches());
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const names = wb.worksheets.map(ws => ws.name);
    expect(names).toContain('Fase de Grupos');
    expect(names).toContain('Eliminatorias');
    expect(names).toContain('CALC');
    expect(names).toContain('MAP');
  });

  it('MAP sheet has entries for all exported matches', async () => {
    const groupMatches = makeGroupMatches();
    const blob = await ExcelService.exportToExcel(groupMatches, {});
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const mapSheet = wb.getWorksheet('MAP');
    expect(mapSheet).toBeDefined();

    const matchIds: string[] = [];
    mapSheet!.eachRow((row, n) => {
      if (n === 1) return;
      const id = row.getCell(1).value?.toString();
      if (id) matchIds.push(id);
    });

    groupMatches.forEach(m => {
      expect(matchIds).toContain(m.matchId);
    });
  });

  it('importFromBuffer throws ExcelImportError(parse_error) on invalid file', async () => {
    const err = await ExcelService.importFromBuffer(new ArrayBuffer(0)).catch(e => e);
    expect(err).toBeInstanceOf(ExcelImportError);
    expect((err as ExcelImportError).code).toBe('parse_error');
  });

  it('importFromBuffer throws ExcelImportError(no_map_sheet) when MAP sheet is missing', async () => {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('SomeSheet');
    const buf = await wb.xlsx.writeBuffer();
    const err = await ExcelService.importFromBuffer(buf).catch(e => e);
    expect(err).toBeInstanceOf(ExcelImportError);
    expect((err as ExcelImportError).code).toBe('no_map_sheet');
  });

  it('importFromBuffer throws ExcelImportError(no_valid_rows) when MAP sheet has no data', async () => {
    const wb = new ExcelJS.Workbook();
    const map = wb.addWorksheet('MAP');
    map.getCell(1, 1).value = 'Match ID';
    map.getCell(1, 2).value = 'Sheet';
    map.getCell(1, 3).value = 'Score A';
    map.getCell(1, 4).value = 'Score B';
    const buf = await wb.xlsx.writeBuffer();
    const err = await ExcelService.importFromBuffer(buf).catch(e => e);
    expect(err).toBeInstanceOf(ExcelImportError);
    expect((err as ExcelImportError).code).toBe('no_valid_rows');
  });
});

// ── League predictions export ────────────────────────────────────────────────

describe('ExcelService league predictions export', () => {
  function mkScores(matchIds: string[], scores: (number | null)[][]): Array<{ matchId: string; scoreA: number | null; scoreB: number | null }> {
    return matchIds.map((id, i) => ({
      matchId: id,
      scoreA: scores[i]?.[0] ?? null,
      scoreB: scores[i]?.[1] ?? null,
    }));
  }

  const groupMatches = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

  const emptyKo = (): Array<{ matchId: string; scoreA: number | null; scoreB: number | null; penaltyScoreA: number | null; penaltyScoreB: number | null }> => [];

  const participants = [
    {
      id: 'p0',
      name: 'Me',
      isOwner: true,
      groupScores: mkScores(groupMatches, [[2, 1], [3, 1], [1, 0], [2, 2], [0, 0], [1, 2]]),
      knockoutScores: emptyKo(),
    },
    {
      id: 'p1',
      name: 'Alice',
      groupScores: mkScores(groupMatches, [[2, 1], [3, 1], [1, 0], [2, 2], [0, 0], [1, 2]]),
      knockoutScores: emptyKo(),
    },
    {
      id: 'p2',
      name: 'Bob',
      groupScores: mkScores(groupMatches, [[1, 0], [2, 1], [1, 0], [1, 1], [0, 1], [2, 2]]),
      knockoutScores: emptyKo(),
    },
  ];

  const realGroupScores = mkScores(groupMatches, [[2, 1], [2, 0], [0, 0], [2, 2], [1, 1], [1, 2]]);
  const realKnockoutScores: Array<{ matchId: string; scoreA: number | null; scoreB: number | null }> = [];

  it('produces a non-empty blob', async () => {
    const blob = await ExcelService.exportLeaguePredictions(
      { name: 'Test League', participants },
      realGroupScores,
      realKnockoutScores,
      'es',
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('export contains both sheets (no separate Rules sheet)', async () => {
    const blob = await ExcelService.exportLeaguePredictions(
      { name: 'Test League', participants },
      realGroupScores,
      realKnockoutScores,
      'es',
    );
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    expect(wb.getWorksheet('Resumen')).toBeTruthy();
    expect(wb.getWorksheet('Pronósticos')).toBeTruthy();
    // Verify the old separate Rules sheet no longer exists
    expect(wb.getWorksheet('Reglas')).toBeFalsy();
    expect(wb.getWorksheet('Rules')).toBeFalsy();
  });

  it('ranking sheet reflects correct totals', async () => {
    const blob = await ExcelService.exportLeaguePredictions(
      { name: 'Test League', participants },
      realGroupScores,
      realKnockoutScores,
      'es',
    );
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const rankSheet = wb.getWorksheet('Resumen');
    expect(rankSheet).toBeTruthy();

    // Collect all names from column 2 (ranking starts at row 9 after rules header at row 8)
    const names: string[] = [];
    for (let r = 9; r <= 15; r++) {
      const v = String(rankSheet!.getCell(r, 2).value ?? '');
      if (!v) break;
      names.push(v);
    }
    expect(names.some(n => n.includes('Alice'))).toBe(true);
    expect(names.some(n => n.includes('Bob'))).toBe(true);
    expect(names.some(n => n.includes('Me'))).toBe(true);
  });

  it('predictions sheet has correct column count', async () => {
    const blob = await ExcelService.exportLeaguePredictions(
      { name: 'Test League', participants },
      realGroupScores,
      realKnockoutScores,
      'es',
    );
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const predSheet = wb.getWorksheet('Pronósticos');
    expect(predSheet).toBeTruthy();

    // 1 match column + 1 real result column + 3 participants × 2 cols (prediction + pts) = 8 cols
    const row1 = predSheet!.getRow(1);
    // Column 1 = Partido, 2 = Resultado real, 3 = Me ★, 4 = Pts, 5 = Alice, 6 = Pts, 7 = Bob, 8 = Pts
    expect(String(row1.getCell(1).value ?? '')).toBe('Partido');
    expect(String(row1.getCell(2).value ?? '')).toBe('Resultado real');
    expect(String(row1.getCell(3).value ?? '')).toContain('Me');
    expect(String(row1.getCell(4).value ?? '')).toBe('Pts');
    expect(String(row1.getCell(5).value ?? '')).toBe('Alice');
    expect(String(row1.getCell(6).value ?? '')).toBe('Pts');
    expect(String(row1.getCell(7).value ?? '')).toBe('Bob');
    expect(String(row1.getCell(8).value ?? '')).toBe('Pts');
  });
});
